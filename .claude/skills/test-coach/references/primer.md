# Testing primer for Motionscope (coach's reference)

Use these to explain concepts. Illustrations here are deliberately generic (not Motionscope tests) — never paste a complete Motionscope test.

## Contents
1. Vocabulary
2. Jest essentials
3. Supertest essentials
4. mongodb-memory-server
5. Motionscope-specific gotchas
6. Learning path
7. Backlog bugs that make good first "red" tests
8. Interview questions to close sessions with

## 1. Vocabulary

| Term | One-liner |
|---|---|
| Unit test | One function/middleware in isolation; fast; no DB/network |
| Integration test | Several real pieces together (route → middleware → controller → DB) |
| Arrange / Act / Assert | Set up data → do the one thing → check the result |
| Test double | Stand-in for a real dependency: **stub** returns canned data, **mock** also records calls, **spy** wraps the real thing |
| Fixture / factory | Helper that builds test data (`makeCoach()`) |
| Red → Green → Refactor | TDD loop: failing test, minimal fix, clean up |
| Flaky test | Sometimes passes, sometimes fails — usually shared state, time or ordering |

## 2. Jest essentials

- Structure: `describe("thing", () => { it("does X when Y", async () => { ... }) })`. `test` is an alias of `it`.
- Matchers: `toBe` (===, primitives), `toEqual` (deep equality), `toMatchObject` (subset — great for response bodies), `toHaveLength`, `toContain`, `toBeNull`, `toHaveBeenCalledWith`.
- Async: make the test `async` and `await` the call. Forgetting `await` = the test passes before the assertion runs.
- Hooks: `beforeAll` / `afterAll` (once per file), `beforeEach` / `afterEach` (around each test).
- Mock functions: `jest.fn()` creates a function that records its calls — that's how you fake `next` and `res.status` for middleware unit tests. To make `res.status(400).json(...)` chainable, `status` must return the same `res`: `mockReturnThis()` (`jest.fn().mockReturnThis()`).
- ESM: `jest.mock()` doesn't hoist in native ESM. For this repo, prefer real dependencies (in-memory DB) over module mocking; if mocking a module is truly needed, it's `jest.unstable_mockModule` + dynamic `import()` — mention it, don't lead with it.
- Run one file: `npm test -- path/to/file.test.js`; one test: `-t "name"`.

## 3. Supertest essentials

- `request(app)` takes the Express app (not a URL, not a running server) and starts it on an ephemeral port internally.
- Chain: `.get(path)` / `.post(path).send(body)` / `.set(header, value)`; `await` it to get `res` with `res.status` and `res.body`.
- Motionscope auth header is **`x-auth-token`** (not `Authorization: Bearer`).

## 4. mongodb-memory-server

- Spins up a real `mongod` in memory; `MongoMemoryServer.create()` → `.getUri()` → `mongoose.connect(uri)`.
- Lifecycle: create + connect in `beforeAll`; wipe collections in `afterEach` (so tests stay independent); disconnect + `stop()` in `afterAll`.
- Why not mock Mongoose: the bugs worth catching live in queries, validators, hooks and indexes (#22, #27) — a mock would just echo your assumptions.
- Transactions (`postBlock` uses `startSession`) need a replica set: `MongoMemoryReplSet` instead of `MongoMemoryServer`.
- First run downloads a mongod binary (~100MB); CI caches it.

## 5. Motionscope-specific gotchas

| Gotcha | Where | What the learner needs to figure out |
|---|---|---|
| `index.js` doesn't export `app` and connects to the real DB on import | `index.js`, `config/db.js` | split into `app.js` (build) + `index.js` (connect + listen) |
| `auth` loads the user from the DB by the token's `_id` | `middleware/auth.js` | the user must exist in the in-memory DB; get a token with `user.generateAuthToken()` |
| JWT key from env | `MOTIONSCOPE_JWT_PRIVATE_KEY` | set a test value before the app loads |
| Ownership needs a roster | `authorizeCoachForAthleteResource` | arrange: coach with `athletes: [athlete._id]` |
| Error shapes differ | `validate.js` / `error.js` → `{ message, details }`; handlers → `{ message }` | assert on the right shape |
| Invalid/garbage token → **400** today, not 401 (backlog #28) | `middleware/auth.js` catch branch | assert what the code does now, or write it as a red test for #28 |
| Malformed id → 400, not 404 | `error.js` CastError branch | a good "sad path" case |
| Winston writes to `combined.log` / `exceptions.log` | `utils/logger.js` | harmless — `*.log` is git-ignored; tests will append to these files, so don't read them as evidence of a test failing |
| Block start date must be a future Sunday | `model/block.js` validators | test data must compute a valid date, not hard-code one (determinism) |

## 6. Learning path (suggested order)

1. **`percentOf`** in `utils/trainingLoad.js` — pure function: Jest basics, `toBe`, edge cases (`null` inputs, rounding to 5).
2. **`toUpdateSchema`** in `validation/common.js` — still pure: what does the PATCH schema accept/reject?
3. **`validate` middleware** — unit test with fake `req`/`res`/`next` built from `jest.fn()`: does it call `next` on valid input? does it 400 with `details` on invalid?
4. **`authorizeCoach`** — same technique; role cases.
5. **First integration test:** `GET /api/auth/me` — Supertest + in-memory DB + token: 401 without token, 200 with.
6. **An ownership test** on a coach-for-athlete route: 403 when the athlete isn't on the roster.
7. **Red test for a backlog bug** (below), then fix it on its own branch → green.

## 7. Backlog bugs that make good first "red" tests

| # | Test idea (they write it) |
|---|---|
| #22 | coach A can see coach B's blocks via the list endpoint |
| #25 | an athlete on a roster can't remove themselves |
| #26 | deleting a non-existent program returns 500 instead of 404 |
| #27 | creating two compDays that both include "squat" fails |
| #6 | `GET /api/programs/athlete` never reaches its handler |
| #5 | signup with `role: "developer"` is accepted |
| #29 | signup with an `athletes` array puts those athletes on the new coach's roster |
| #28 | a garbage token gets 400 instead of 401 |

## 8. Interview questions to close sessions with

- Unit vs integration test — when would you pick each here?
- Why an in-memory DB rather than mocking Mongoose?
- What makes a test flaky, and how did you avoid it?
- How do you test middleware in isolation?
- Why split `app.js` from `index.js`?
- What's the value of writing a failing test before fixing a bug?
- What would you *not* bother testing, and why?
