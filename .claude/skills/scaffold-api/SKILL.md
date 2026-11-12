---
name: scaffold-api
description: Scaffold a complete new backend resource for Motionscope — constants (enums), Mongoose model, Joi validation, controller and Express router — in TypeScript, following the project conventions. Use this whenever the user wants a new resource, collection, entity, endpoint set or CRUD API on the backend (e.g. "add a drills resource", "I need an API for meet entries", "create model + routes for bodyweight logs", "scaffold CRUD for X"), even if they only mention one layer like "make a model for X" and the rest is implied. Not for adding a single endpoint to an existing router (use scaffold-protected-route).
---

# scaffold-api

Generate the five files a new Motionscope resource needs, in project style, from the templates in `templates/`. The goal is boilerplate that a reviewer couldn't tell apart from hand-written code in this repo, and that the user can explain in an interview.

## Step 1 — Load the conventions

Read `.claude/skills/conventions/SKILL.md` in full before anything else. Every rule below assumes it, and the templates encode it. If you've never seen this repo, also read `conventions/examples/model.example.ts` and `route.example.ts`.

## Step 2 — Gather inputs

You need:

| Input | Example | Notes |
|---|---|---|
| Resource name | `drill` | camelCase singular. Derive the rest (Step 4). |
| Fields | `name: string 1–50 required`, `category: enum [technique, accessory]`, `reps: number 1–30` | type, required?, min/max, enum values, default |
| Ownership variant | A / B / C (below) | decides routes, middleware, query scope |
| Extra endpoints | "archive toggle" | optional |

Ownership variants:

| Variant | Who writes | Like | Routes | Query scope |
|---|---|---|---|---|
| **A — coach-for-athlete** (default) | coach, for an athlete on their roster; athlete reads own | Block, CompDay | `/:athleteId`, `/:athleteId/:<resource>Id`, athlete `/athletes…` | coach: `{ coach: req.user!._id, athlete: req.params.athleteId }`; athlete: `{ athlete: req.user!._id }` |
| **B — coach-owned** | coach, for themselves | custom exercises, block templates | `/`, `/:<resource>Id`; `router.use(auth, authorizeCoach)` | `{ coach: req.user!._id }` |
| **C — athlete-owned** | athlete, for themselves; coach may read | questionnaire, bodyweight log | athlete `/`, `/:<resource>Id`; coach read `/athletes/:athleteId` | athlete: `{ athlete: req.user!._id }`; coach read: `{ athlete: req.params.athleteId }` behind `authorizeCoachForAthleteResource` |

Infer what you can from the request. Ask only for what's genuinely missing — usually the ownership variant and enum values. Don't invent business fields; if the user gave none, ask.

## Step 3 — Pre-flight checks

1. **Collisions:** `model/<resource>.*`, `controllers/<resource>Controller.*`, `routes/<resources>.*` must not exist; `routes/routes.js` must not already mount `/api/<resources>`; no existing `mongoose.model("<Resource>")`. Stop and ask if any do.
2. **TS setup:** if `tsconfig.json` is missing, tell the user once: "Mixed JS/TS setup hasn't landed yet, so these .ts files won't run until that branch is merged." Then continue.
3. **Refs:** if a field references another model, grep for its exact `mongoose.model("…")` name and use that string in `ref:` (see backlog #21 — `"exercise"` is lowercase today).

## Step 4 — Derive names

| Placeholder | Rule | `drill` → |
|---|---|---|
| `{{resource}}` | camelCase singular | `drill` |
| `{{Resource}}` | PascalCase singular (model name, types) | `Drill` |
| `{{resources}}` | camelCase plural (router file, mount path, list response key) | `drills` |
| `{{Resources}}` | PascalCase plural (list handler names) | `Drills` |

Irregular plurals: use the real English plural (`compDay` → `compDays`, `entry` → `entries`).

## Step 5 — Generate the files

Fill each template, in this order (each layer imports the one before):

1. `constants/{{resource}}.ts` — no template, it's tiny: one `export const <thing>Enum = [...] as const;` per enum field. Skip the file if there are no enums.
2. `model/{{resource}}.ts` ← `templates/model.ts.tmpl`
3. `validation/{{resource}}.ts` ← `templates/validation.ts.tmpl`
4. `controllers/{{resource}}Controller.ts` ← `templates/controller.ts.tmpl`
5. `routes/{{resources}}.ts` ← `templates/router.ts.tmpl`

While filling:
- Replace every `{{…}}` placeholder. Replace each `// __FIELDS__` block with the real fields, and delete the sample fields that follow it.
- **Mongoose and Joi must agree** on every field: same required-ness, bounds and enum source.
- Joi gets **client-sent fields only**. `coach` and `athlete` are set by the controller and must not appear in the Joi schema.
- Delete the `TEMPLATE` header comment and any `// VARIANT` notes that don't apply. Keep the short explanatory comments; they help the user explain the code.
- Templates are written for **variant A**. For B or C, apply the changes from the Step 2 table: drop the `athlete` field (B) or the `coach` field (C), swap the routes and middleware, and change each query's scope object. Keep every handler scoped.

## Step 6 — Mount the router (ask first)

`routes/routes.js` is existing app code, so show the change and wait for a yes before editing it:

```js
import {{resources}} from "./{{resources}}.js";
// ...
app.use("/api/{{resources}}", {{resources}}); // above app.use(error)
```

## Step 7 — Self-check

Go through the generated files before showing them:

- [ ] every import path ends in `.js`
- [ ] every route: `auth` → `authorize*` → (`validate`) → handler; POST uses `validate(schema)`; PATCH uses `validate(updateSchema, { noDefaults: true })`
- [ ] literal paths (`/athletes…`) declared before `/:param` paths
- [ ] route param names match the `req.params.*` the controller reads
- [ ] every query has an ownership scope; no bare `find()`
- [ ] no `ObjectId.isValid`, no try/catch (unless there's a transaction), no inline role checks, no `res.send("…")`
- [ ] responses are `{ message, <resource> }` / `{ message, <resources> }`
- [ ] the `mongoose.model()` name equals every `ref:` that targets it; `unique` only on top-level fields
- [ ] Joi has no `coach` / `athlete` / computed fields

If `tsconfig.json` exists, run `npx tsc --noEmit` and fix any errors in the new files.

## Step 8 — Report

Reply with:
1. A file tree of what was created.
2. The endpoint table: method, path, chain, handler, success response.
3. Anything assumed or left for the user (the mount line, pending TS setup, enum values you guessed).
4. Next steps: `/explain-scaffold` to walk through the code, and `/test-coach` to write the tests yourself.
