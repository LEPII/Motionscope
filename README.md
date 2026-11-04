# Motionscope

**A training-management API for strength coaches and their athletes.**

Motionscope is the backend of an app that lets coaches plan, assign and adjust training for every athlete on their roster, and lets athletes log what they actually did. A coach builds a **training block** (weeks → days → exercises → sets), assigns it to an athlete, and watches prescribed numbers get filled in with real reps, loads and RPE as the athlete trains. Coaches can also plan **competition days**, keep a library of **custom exercises**, reuse **block templates**, and read athlete **intake questionnaires**.

> The project is in active development. See the [Roadmap](#roadmap) for what's coming next.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Authentication & Roles](#authentication--roles)
- [API Reference](#api-reference)
- [Project Structure](#project-structure)
- [Continuous Integration](#continuous-integration)
- [Roadmap](#roadmap)
- [Author](#author)

---

## Features

### For coaches

- Manage a roster of athletes (add, remove, list).
- Create, edit, archive and delete training blocks for any athlete on the roster.
- Edit a block at any level: a whole week, a single day, one exercise or one set.
- Duplicate weeks, days and exercises to build programs faster.
- Save blocks as templates and create new blocks from them.
- Plan competition days with attempts for each lift.
- Build a custom exercise library alongside the preset exercises.
- Read each athlete's onboarding questionnaire.

### For athletes

- See the current block and all past blocks.
- Log actual reps, load and RPE against what the coach prescribed.
- Add and remove warm-up sets.
- Record competition attempts.
- Fill in and update their questionnaire.
- Leave a coach's roster.

### Under the hood

- JWT authentication with bcrypt-hashed passwords.
- Role-based access control (`coach`, `athlete`, `developer`), plus ownership checks so a coach can only reach athletes on their own roster and an athlete can only reach their own data.
- Request validation with Joi on every write endpoint.
- Centralized async error handling and file logging with Winston.

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Runtime | [Node.js](https://nodejs.org/) (ES modules) |
| Web framework | [Express 4](https://expressjs.com/) |
| Database | [MongoDB](https://www.mongodb.com/) with [Mongoose 8](https://mongoosejs.com/) |
| Auth | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken), [bcrypt](https://github.com/kelektiv/node.bcrypt.js) |
| Validation | [Joi](https://joi.dev/) + `joi-objectid` |
| Logging | [Winston](https://github.com/winstonjs/winston) |
| Error handling | `express-async-errors` |
| Dev tooling | `nodemon`, GitHub Actions |

---

## Architecture

Every request goes through the same layers:

```text
Request
  │
  ▼
routes/        → maps URL + HTTP method to a handler
  │
  ▼
middleware/    → auth.js (verifies JWT) → authorization.js (role + ownership)
               → validate.js (Joi schema from validation/)
  │
  ▼
controllers/   → business logic
  │
  ▼
model/         → Mongoose schemas → MongoDB
  │
  ▼
middleware/error.js → catches any thrown error and returns a clean response
```

The core data model is a nested training block:

```text
Block
 ├─ coach, athlete, blockName, isArchived
 └─ weeklySchedule[]           (weekNumber, weekStartDate)
     └─ dailySchedule[]        (primary exercises for the day)
         └─ exercises[]        (reference to an Exercise)
             └─ setsDetail[]
                 ├─ prescribed: reps, load %, RPE, target load, coach cues
                 └─ actual:     reps, load, RPE, athlete notes
```

---

## Getting Started

### Prerequisites

- **Node.js 18 or newer** (CI runs on Node 22)
- **npm**
- A **MongoDB** database: a local install or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/LEPII/Motionscope.git
cd Motionscope

# 2. Install dependencies
npm install

# 3. Create your environment file (see the next section)
touch .env

# 4. Start the development server (restarts on file changes)
npm run dev
```

The server starts on `http://localhost:3000` unless you set `PORT`. On startup it connects to MongoDB and checks that the JWT key is set. If either step fails, the process exits with an error in `exceptions.log`.

### Available Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the server with `nodemon` |
| `node index.js` | Starts the server without auto-reload |
| `npm test` | Placeholder. A test suite (Jest + Supertest) is planned |

---

## Environment Variables

Create a `.env` file in the project root. It is listed in `.gitignore`, so never commit it.

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_URI` | Yes | MongoDB connection string, e.g. `mongodb://localhost:27017/motionscope` |
| `MOTIONSCOPE_JWT_PRIVATE_KEY` | Yes | Secret used to sign and verify JWTs. Use a long random string |
| `PORT` | No | Port the server listens on. Defaults to `3000` |

Example:

```env
MONGODB_URI=mongodb://localhost:27017/motionscope
MOTIONSCOPE_JWT_PRIVATE_KEY=replace-with-a-long-random-string
PORT=3000
```

You can generate a strong key with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Authentication & Roles

1. **Register** or **log in** through `/api/auth` to receive a JWT.
2. Send that token in the `x-auth-token` header on every protected request:

```http
GET /api/auth/me
x-auth-token: <your-jwt>
```

| Role | Who it's for | Can do |
| --- | --- | --- |
| `coach` | Coaches | Manage their roster and the blocks, programs, comp days and questionnaires of athletes on it. Create custom exercises and templates |
| `athlete` | Athletes | View their own blocks, programs and comp days. Log sets and attempts. Manage their questionnaire |
| `developer` | Internal | Manage the preset exercise library |

On top of the role check, ownership middleware makes sure a coach can only touch athletes on their own roster, and an athlete can only touch blocks and comp days assigned to them.

---

## API Reference

All endpoints are prefixed with `/api`. Request bodies are JSON. Write endpoints validate the body against the matching Joi schema in [`validation/`](validation/) and return `400` with the validation message if it fails.

**Common responses:** `400` invalid input or token · `401` no token · `403` wrong role or not your resource · `404` not found.

### Auth: `/api/auth`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/` | Public | Log in with email and password. Returns a JWT |
| `POST` | `/` | Public | Register a new user. Returns the user and sets `x-auth-token` |
| `GET` | `/me` | Any logged-in user | Get the current user's profile |

### Roster: `/api/roster`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Coach | List all athletes on the coach's roster |
| `POST` | `/coaches/roster` | Coach | Add an athlete to the roster |
| `DELETE` | `/coaches/roster` | Coach | Remove an athlete from the roster |
| `DELETE` | `/athlete/roster` | Athlete | Leave a coach's roster |

### Programs: `/api/programs`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/:athleteId` | Coach | Get an athlete's current program |
| `POST` | `/` | Coach | Create a program (exactly one athlete per program) |
| `POST` | `/:id` | Coach | Delete a program |
| `PATCH` | `/archive/:id` | Coach | Archive or unarchive a program |
| `GET` | `/athlete` | Athlete | Get the athlete's current program |

### Blocks: `/api/blocks`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/:athleteId` | Coach | List all blocks for an athlete |
| `GET` | `/:athleteId/:blockId` | Coach | Get one block for an athlete |
| `POST` | `/:athleteId` | Coach | Create a block for an athlete |
| `PATCH` | `/:athleteId/:blockId` | Coach | Update a block |
| `PATCH` | `/block/:blockId/archive` | Coach | Archive or unarchive a block |
| `DELETE` | `/:athleteId/:blockId` | Coach | Delete a block |
| `POST` | `/use/:templateId` | Coach | Create a block from a template |
| `GET` | `/athletes/:blockId` | Athlete | Get the current block (next or in-progress workout) |
| `GET` | `/athletes/blocks` | Athlete | List all of the athlete's blocks |

### Block Editing (Coach): `/api/blockCoach`

Fine-grained edits inside a block. `weekNumber` and `dayIndex` identify the week and day within the block.

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/:blockId/weeks/:weekNumber/days/:dayIndex/exercises` | Coach | Add an exercise to a day |
| `PATCH` | `/:blockId/week/:weekNumber` | Coach | Update a week (start date or all daily schedules) |
| `PATCH` | `/:blockId/week/:weekNumber/day/:dayIndex` | Coach | Update one day's exercises |
| `PATCH` | `/:blockId/week/:weekNumber/day/:dayIndex/exercise/:exerciseId/set/:setId` | Coach | Update one set (reps, prescribed load, etc.) |
| `POST` | `/:athleteId/:blockId/week/:weekNumber/duplicate` | Coach | Duplicate a whole week |
| `POST` | `/:athleteId/:blockId/week/:weekNumber/day/:dayIndex/duplicate` | Coach | Copy a day into another day of the same week |
| `POST` | `/:athleteId/:blockId/week/:weekNumber/day/:dayIndex/exercise/:exerciseId/duplicate` | Coach | Duplicate an exercise within a day |
| `DELETE` | `/block/:blockId/week/:weekNumber` | Coach | Delete a week |
| `DELETE` | `/block/:blockId/week/:weekNumber/day/:dayIndex` | Coach | Clear a day |
| `DELETE` | `/coach/:blockId/weeks/:weekNumber/days/:dayIndex/exercises/:exerciseId` | Coach | Remove an exercise from a day |

### Block Logging (Athlete): `/api/blockAthlete`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `PATCH` | `/:blockId/:exerciseId/:setId` | Athlete | Log actual reps, load and RPE for a set |
| `POST` | `/:blockId/:exerciseId/sets` | Athlete | Add a warm-up set to an exercise |
| `DELETE` | `/:blockId/:exerciseId/:setId` | Athlete | Delete a warm-up set |

### Block Templates: `/api/templateBlocks`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/` | Coach | Save a block as a template |
| `GET` | `/:coachId` | Coach | List a coach's templates |
| `GET` | `/:templateId` | Coach | Get one template |
| `DELETE` | `/:templateId` | Coach | Delete a template |

To turn a template into a real block, use `POST /api/blocks/use/:templateId`.

### Competition Days: `/api/compDay`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Coach | List all comp days for an athlete |
| `GET` | `/:athleteId/:compDayId` | Coach | Get one comp day for an athlete |
| `POST` | `/` | Coach | Create a comp day for an athlete |
| `PATCH` | `/:compDayId` | Coach | Update a comp day |
| `DELETE` | `/:athleteId/:compDayId` | Coach | Delete a comp day |
| `GET` | `/athletes` | Athlete | List the athlete's comp days |
| `GET` | `/athletes/:compDayId` | Athlete | Get one of the athlete's comp days |
| `PATCH` | `/:compDayId/lifts/:liftsName/:attemptNumber/:attemptIndex/athlete` | Athlete | Record whether an attempt was actually made |

### Exercises: `/api/exercises`

Coaches create **custom** exercises. Developers manage the **preset** library everyone shares.

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/` | Coach | List exercises |
| `GET` | `/:id` | Coach | Get one exercise |
| `POST` | `/` | Coach (custom) / Developer (preset) | Create an exercise |
| `PATCH` | `/:id` | Coach | Update a custom exercise |
| `DELETE` | `/:id` | Coach | Delete a custom exercise |

### Questionnaires: `/api/questionnaires`

| Method | Path | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/:athletesId` | Coach | Get an athlete's questionnaire |
| `POST` | `/athlete` | Athlete | Submit a questionnaire |
| `PATCH` | `/:id` | Athlete | Update a questionnaire |

---

## Project Structure

```text
Motionscope/
├── index.js            # Entry point: loads env, registers routes, connects DB, starts server
├── config/
│   └── db.js           # MongoDB connection and startup checks
├── routes/             # One router per resource, mounted in routes/routes.js
├── middleware/
│   ├── auth.js         # Verifies the JWT and attaches req.user
│   ├── authorization.js# Role checks and resource-ownership checks
│   ├── validate.js     # Runs a Joi schema against req.body
│   └── error.js        # Global error handler
├── controllers/        # Request handlers and business logic
├── model/              # Mongoose schemas (User, Block, Program, CompDay, Exercise, ...)
├── validation/         # Joi schemas for request bodies
├── constants/          # Shared enums (roles, units, lift names, ...)
├── utils/              # Logger, unit conversions, training-load math, cloning helpers
└── .github/workflows/  # CI and weekly security audit
```

---

## Continuous Integration

Two GitHub Actions workflows live in [`.github/workflows/`](.github/workflows/):

- **CI** (`ci.yml`) runs on every pull request and every push to `main`. It installs dependencies with `npm ci`, syntax-checks every `.js` file, and fails on any high-severity `npm audit` finding.
- **Audit** (`audit.yml`) runs a scheduled weekly dependency security audit.

Automated tests will be added to CI once the Jest + Supertest suite is in place.

---

## Roadmap

- [ ] **Coach–athlete messaging** inside the app
- [ ] **Payments with Stripe** so coaches can bill athletes for coaching
- [ ] **In-depth statistics**: training load, volume and performance trends over time
- [ ] **Automated tests** with Jest and Supertest, run in CI

---

## Author

**Luis Perez** · [GitHub @LEPII](https://github.com/LEPII)
