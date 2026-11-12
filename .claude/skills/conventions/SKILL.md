---
name: conventions
description: Motionscope backend code conventions — the single source of truth for how models, Joi validation, controllers, routers, middleware chains, responses, errors, enums and naming are written in this Express + Mongoose + TypeScript API. Use this skill whenever writing, generating, reviewing or refactoring ANY backend code in Motionscope (model/, controllers/, routes/, validation/, constants/, middleware/), whenever a scaffold-* skill runs, and whenever the user asks "how do we do X here", "is this consistent", or "what's our pattern for…", even if they don't say "conventions".
---

# Motionscope backend conventions

Distilled from the existing code (`model/block.js`, `routes/blocks.js`, `controllers/blockController.js`, `validation/common.js`, `middleware/*.js`) plus decisions the owner made where the code was inconsistent. When old code and this file disagree, **this file wins** — the old code predates the decisions. Don't rewrite old files to match unless asked; generate new code this way.

Worked examples — read before generating a model or router:
- `examples/model.example.ts` — `model/exercise.js` translated to TS
- `examples/route.example.ts` — `routes/blocks.js` translated to TS with the full middleware chain

## 0. Language and runtime

- **All new backend code is TypeScript.** Existing `.js` files are converted after the MVP, so the app runs mixed JS + TS until then. ESM throughout (`"type": "module"`).
- Imports keep the **`.js` extension**, even when the target is a `.ts` file (`import { Block } from "../model/block.js"`). NodeNext resolution requires it, and leaving it off is exactly what broke `routes/templateBlocks.js` (ERR_MODULE_NOT_FOUND).
- Express types: `import type { Request, Response } from "express"`. `req.user` is typed by declaration merging (`types/express.d.ts`, §9). In a handler behind `auth`, use `req.user!` — the middleware chain guarantees it.
- Before generating, check that `tsconfig.json` exists. If it doesn't, the mixed JS/TS setup (§9) hasn't landed: still generate the code, but tell the user it won't run until that setup branch is merged.

## 1. Folder layout — one file per resource per layer

| Layer | Path | Export style |
|---|---|---|
| Enums | `constants/<resource>.ts` | `export const fooEnum = [...] as const` |
| Model | `model/<resource>.ts` | named: `export { Foo, fooSchema, type FooDoc }` |
| Joi | `validation/<resource>.ts` | named: `export { fooSchema, fooUpdateSchema }` |
| Controller | `controllers/<resource>Controller.ts` | named export block at bottom |
| Router | `routes/<resources>.ts` | `export default router` |
| Mount | `routes/routes.js` | `app.use("/api/<resources>", router)` **before** `app.use(error)` |

`<resource>` is camelCase singular (`drill`, `compDay`); the router file and mount path are camelCase plural (`routes/drills.ts`, `/api/drills`). Older files break this (`controllers/compDay.js`, `/api/compDay` — backlog #19); don't copy them.

## 2. Enums live in constants/

Every enum is an `as const` array named `<thing>Enum` in `constants/<resource>.ts`, imported by **both** the Mongoose model and the Joi schema. One list, two validators — they can't drift. `as const` also gives a free union type: `type LiftName = (typeof liftNameEnum)[number]`.

## 3. Models

- Top-level schemas use `{ timestamps: true }`.
- Nested structures are separate sub-schema consts declared above the parent (`setSchema` → `exerciseEntrySchema` → `dailyScheduleSchema` → `weeklyScheduleSchema` → `blockSchema`), so they can be reused and exported.
- Constraints mirror Joi (`minLength`/`maxLength`/`min`/`max`/`enum`/`required`). Joi guards requests; Mongoose guards every write, including ones that skip `validate()`.
- **Refs:** singular noun, no `Id` suffix — `coach`, `athlete`. After `.populate("athlete")` the field holds a document, so `athleteId` would lie. Ref arrays are plural (`athletes`, `blocks`). Program's `coachId`/`athleteId` is legacy (#18).
- **Model name** in `mongoose.model()` is PascalCase singular and must equal every `ref:` string pointing at it. `"exercise"` vs `ref: "Exercise"` is a live bug (#21) — populate silently fails.
- **Types:** `type Foo = InferSchemaType<typeof fooSchema>`, `type FooDoc = HydratedDocument<Foo>`. Don't hand-write a parallel interface; it drifts.
- **`unique` only on top-level fields.** `unique: true` inside a sub-schema builds a collection-wide index on the nested path (#27). For "unique within this document", validate in `pre("validate")`.
- Cross-field rules → validators / `pre("validate")` + `this.invalidate(...)`. Rules needing a DB read → `pre("save")`, passing an `Error` with `err.status = 409` to `next` (see the overlap check in `model/block.js`). error.js maps `status` to the response code.
- Index the fields you filter and sort on, compound where queries combine them (`fooSchema.index({ athlete: 1, createdAt: -1 })`).

## 4. Joi validation

```ts
import Joi, { toUpdateSchema } from "./common.js";
import { fooTypeEnum } from "../constants/foo.js";

const fooSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  type: Joi.string().valid(...fooTypeEnum).required(),
  exercise: Joi.objectId().required(),
});
const fooUpdateSchema = toUpdateSchema(fooSchema);

export { fooSchema, fooUpdateSchema };
```

- Import `Joi` from `./common.js` — that's where `Joi.objectId()` is registered.
- POST schema = full body shape. PATCH schema = `toUpdateSchema(postSchema)` (required → optional, `.min(1)`).
- **Validate only what the client sends.** Fields the server sets (`coach` from `req.user`, `athlete` from `req.params`, computed values like `targetLoad`) are either omitted from the schema or `Joi.forbidden()`. Requiring them in the body is backlog #23.
- Different roles writing the same shape get separate schemas (`setCoachSchema` vs `setAthleteSchema`), not conditionals.
- Joi rejects unknown keys by default, so controllers don't need allow-list filtering (#20).

## 5. Routers — the middleware chain is the security policy

```
auth → authorize<Role | …ForResource> → validate(schema[, { noDefaults: true }]) → handler
```

401 (who are you?) → 403 (are you allowed?) → 400 (is the body valid?) → business logic. Each step is a small, separately testable function, and the route line shows its whole policy at a glance. If every route in a router shares the same chain prefix, `router.use(auth, authorizeCoach)` at the top is fine; otherwise put the chain on each route.

Reuse what's in `middleware/authorization.js`:

| Middleware | Use when |
|---|---|
| `authorizeCoach` / `authorizeAthlete` / `authorizeDeveloper` | role gate only |
| `authorizeCoachForAthleteResource` | path has `:athleteId` (optionally `:blockId` / `:compDayId`); checks the athlete is on the coach's roster and the resource belongs to that athlete |
| `authorizeAthleteForResource` | athlete acting on their own `:blockId` / `:compDayId` |

- `validate(schema)` on POST; `validate(updateSchema, { noDefaults: true })` on PATCH so Joi defaults don't overwrite fields the client didn't send.
- **Literal paths before param paths** (`/athletes` before `/:athleteId`). Express matches in declaration order (#6).
- Every path starts with `/` (#7). DELETE deletes (#8), PATCH partially updates, POST creates. No two routes share method + path (#2).
- Param names in the route are exactly what the controller reads (`:blockId` ↔ `req.params.blockId`, #22).
- `// -- COACH'S ENDPOINTS --` / `// -- ATHLETE'S ENDPOINTS --` section comments, and a one-line `// <Verb> <what>` comment above each route.

## 6. Controllers

```ts
import type { Request, Response } from "express";
import { Foo } from "../model/foo.js";

const getFoo = async (req: Request, res: Response) => {
  const foo = await Foo.findOne({ _id: req.params.fooId, coach: req.user!._id });
  if (!foo) return res.status(404).json({ message: "Foo not found or access denied." });
  res.status(200).json({ message: "Foo retrieved", foo });
};

export { getFoo };
```

- `async` arrow functions; named export block at the bottom.
- **No try/catch** for ordinary errors. `express-async-errors` sends rejections to `middleware/error.js`, which already maps `ValidationError` → 400, `CastError` → 400, duplicate key `11000` → 409, and any `err.status` 4xx → that status. Use try/catch/finally only for **transactions** (abort, rethrow, `endSession` — see `postBlock`).
- **No inline role checks** — the router handles roles (#16). Controllers enforce **ownership** by scoping every query with `req.user!._id` and returning 404 "not found or access denied" when nothing matches. 404 rather than 403 so a stranger can't confirm the id exists.
- **Never `find()` without a scope filter** (#22).
- **No `ObjectId.isValid` checks** — a malformed id throws `CastError` → 400 (#17).
- Server-owned fields come from context: `Foo.create({ ...req.body, coach: req.user!._id, athlete: req.params.athleteId })`.
- Compare ObjectIds with `.equals()` (`foo.coach.equals(req.user!._id)`), never `===` against a string (#25).
- Check for `null` after every lookup before touching the result (#26).
- Updates: `findOneAndUpdate(scope, { $set: req.body }, { new: true, runValidators: true })`, or load → mutate → `save()` when `pre("save")` hooks must run.
- Writes spanning multiple documents that must succeed together use a session + transaction.
- Log with `import { logger } from "../utils/logger.js"`, never `console.log`, never from `"winston"` directly (#3, #24).

## 7. Responses

| Case | Status + body |
|---|---|
| Create | `201 { message: "Foo created", foo }` |
| Read one | `200 { message: "Foo retrieved", foo }` |
| Read many | `200 { message: "Foos retrieved", foos }` (+ `total, page, totalPages` when paginated) |
| Update | `200 { message: "Foo updated", foo }` |
| Delete | `200 { message: "Foo deleted", foo }` |
| Handler error | `res.status(4xx).json({ message })` |
| Middleware error | `{ message, details: string[] }` — validate.js / error.js already do this |

The key is the resource name in camelCase (`block`, `compDay`, plural for lists). Never `res.send("plain string")` (#15) — the frontend expects JSON everywhere.

## 8. Anti-patterns in the existing code (don't reproduce)

Numbers refer to the project bug backlog.

| Where | Problem | Do instead |
|---|---|---|
| most `routes/*.js` | no `auth`, so `req.user` is undefined (#4) | full chain, §5 |
| `routes/blocks.js`, `compDay.js`, `programs.js`, `templateBlocks.js` | param route shadows literal route (#6) | literals first |
| `routes/auth.js` | login & register both `POST /` (#2) | unique method + path |
| `routes/programs.js` | `POST /:id` deletes (#8) | `DELETE /:id` |
| `controllers/exercisesController.js` | inline role branches, allow-lists (#16, #20) | middleware + Joi |
| `controllers/blockController.js` | `req.params.id` vs `:blockId`; unscoped `Block.find()` (#22) | matching names; scoped queries |
| `validation/block.js` | body must contain `coach`/`athlete`, rejects `programId` (#23) | validate only client fields |
| `controllers/rosterController.js` | `res.send("string")`; string vs ObjectId compare (#15, #25) | `{ message }` JSON; `.equals()` |
| `model/exercise.js`, `model/compDay.js` | model name ≠ ref string (#21); nested `unique` (#27) | PascalCase name; unique only top-level |
| `controllers/templateBlockController.js` | logger from `"winston"`, undeclared vars (#3) | `utils/logger.js` |

## 9. Mixed JS/TS setup (prerequisite, lives on its own branch)

Generated code assumes the following. Scaffold skills don't create them — they're app config the owner sets up on a dedicated branch:
- `tsconfig.json`: `"module": "NodeNext"`, `"moduleResolution": "NodeNext"`, `"strict": true`, `"allowJs": true`, `"noEmit": true` (or an `outDir` build), `"exclude": [".claude", "node_modules"]` so skill examples/templates are never compiled.
- `types/express.d.ts`:
  ```ts
  import type { UserDoc } from "../model/user.js";
  declare global {
    namespace Express {
      interface Request { user?: UserDoc }
    }
  }
  export {};
  ```
- `types/joi-objectid.d.ts` — `Joi.objectId()` is attached at runtime in `validation/common.js`, so TypeScript can't see it (`Property 'objectId' does not exist on type 'Root'`) until this exists:
  ```ts
  import "joi";
  declare module "joi" {
    interface Root {
      objectId(): StringSchema;
    }
  }
  ```
- devDeps `typescript`, `tsx`, `@types/express`, `@types/node`, `@types/jsonwebtoken`; `"dev": "tsx watch index.js"`; CI swaps `node --check` for `tsc --noEmit`.
