# Interview question bank (Motionscope backend)

Adapt names/paths to the code being explained. Ask one at a time; reveal the model answer only after the user tries.

## Contents
1. Request pipeline & middleware
2. Security & authorization
3. Validation
4. Data modelling (Mongoose)
5. Error handling
6. Debugging / "what if"
7. Scaling & performance
8. Testing
9. TypeScript

## 1. Request pipeline & middleware

**Q: Walk me through what happens when a request hits `POST /api/<resources>/:athleteId`.**
A: `express.json()` parses the body; the router matches by declaration order; `auth` verifies the JWT from `x-auth-token` and loads the user; the authorize middleware checks role and roster; `validate` runs Joi and replaces `req.body` with the cleaned value; the controller writes with ownership set from `req.user`/params; Mongoose validators run; a 201 JSON response goes out. Any thrown or rejected error goes to `error.js` via `express-async-errors`.

**Q: Why is the order `auth → authorize → validate → handler`?**
A: Each step depends on the previous and answers a different question: who are you (401), are you allowed (403), is the input valid (400), then do the work. Validating before authorizing would leak schema details to unauthorized callers and waste work. It also maps cleanly to test cases.

**Q: Why put authorization in middleware instead of inside the controller?**
A: Separation of concerns: the route line shows the whole security policy; middleware is reusable and unit-testable in isolation; controllers stay focused on business logic. Inline checks are easy to forget — in this codebase that's exactly how routes ended up with no auth at all (backlog #4).

## 2. Security & authorization

**Q: Why does the controller include `coach: req.user._id` in the query if middleware already checked the role?**
A: Role ≠ ownership. A coach is allowed to use the endpoint, but only for their own documents. Scoping the query makes ownership enforcement atomic with the read — no separate check that could be skipped or raced.

**Q: Why return 404 instead of 403 when a coach requests another coach's document?**
A: A 403 confirms the id exists, which leaks information (enumeration). 404 "not found or access denied" treats "doesn't exist" and "not yours" the same. Trade-off: slightly harder debugging for clients.

**Q: What's mass assignment and how does this code prevent it?**
A: A client setting fields they shouldn't by including them in the body (e.g. `coach`, `role`). Joi rejects unknown keys and the schema omits server-owned fields; the controller sets `coach`/`athlete` itself, after spreading the body, so they can't be overridden. Backlog #5 (signup accepting `role: "developer"`) is a live example of the risk.

**Q: How are JWTs verified here, and what's a weakness of this setup?**
A: `jwt.verify` with `MOTIONSCOPE_JWT_PRIVATE_KEY`, then the user is loaded from the DB so deleted users are rejected. Weaknesses: tokens are signed without `expiresIn`, so they never expire; there's a RefreshToken model but no rotation flow wired up.

## 3. Validation

**Q: Why validate with both Joi and Mongoose?**
A: Different jobs. Joi guards the HTTP boundary: shapes the request, rejects unknown keys, gives friendly multi-error messages. Mongoose guards every write to the DB, including ones that never pass through `validate()` (scripts, other controllers, hooks). Constants shared via `constants/` keep them in sync.

**Q: What does `{ noDefaults: true }` do on PATCH routes?**
A: Without it, Joi would fill in defaults for fields the client didn't send, and the update would overwrite stored values with defaults. With it, only fields actually sent are applied.

**Q: Why `runValidators: true` on `findOneAndUpdate`?**
A: Mongoose only runs schema validators on `save()` by default; update queries skip them unless asked, so a PATCH could store out-of-range values.

## 4. Data modelling (Mongoose)

**Q: Why are refs named `athlete` rather than `athleteId`?**
A: After `.populate("athlete")` the field holds the full user document, so `athleteId` would be misleading. It's Mongoose convention; the ref string must exactly match the model name (backlog #21 shows what breaks otherwise).

**Q: Embed or reference — how did this codebase decide, and when would you switch?**
A: Sets/exercises/days are embedded in Block because they're always read and written with the block and are bounded in size. Coach→athletes is a ref array because athletes are independent documents shared across features. Switch to a separate collection when the embedded array grows unbounded, needs to be queried independently, or approaches the 16MB doc limit.

**Q: What does `InferSchemaType` buy you over writing an interface?**
A: One source of truth: the TS type is derived from the schema, so they can't drift apart.

**Q: Why is `unique: true` inside a sub-schema a bug here?**
A: Mongoose builds a collection-wide unique index on the nested path, so two different parent documents can't share the value (backlog #27). Uniqueness within one document needs a validator.

## 5. Error handling

**Q: There's no try/catch in the controllers — where do errors go?**
A: `express-async-errors` patches Express so rejected promises are passed to `next(err)`; `middleware/error.js` maps known errors (ValidationError, CastError, duplicate key 11000, errors with a 4xx `status`) to responses, logs, and returns 500 for the rest.

**Q: What happens with a malformed ObjectId in the URL?**
A: Mongoose throws a CastError when building the query; error.js returns 400 with details. That's why the controllers don't call `ObjectId.isValid`.

## 6. Debugging / "what if"

**Q: What happens if you move `router.get("/:athleteId")` above `router.get("/athletes")`?**
A: `/athletes` matches `:athleteId` first, so the athlete endpoint is unreachable and the request hits the coach handler with `athleteId = "athletes"` → a CastError 400. Backlog #6 is this exact bug.

**Q: A route reads `req.params.id` but the path declares `:blockId`. What happens?**
A: `req.params.id` is undefined; `findById(undefined)` returns null → 404 or `null` response every time (backlog #22).

**Q: The athlete can never leave a roster. Where would you look?**
A: Comparing `ObjectId` to string with `===` (backlog #25). Use `.equals()` or compare `.toString()` on both sides.

## 7. Scaling & performance

**Q: Which index does the list endpoint need, and why that field order?**
A: `{ coach: 1, athlete: 1, createdAt: -1 }` — equality fields first, then the sort field, so Mongo can filter and return sorted results from the index without an in-memory sort (ESR rule: Equality, Sort, Range).

**Q: What would you add before this list endpoint returns 10,000 documents?**
A: Pagination (`limit` + `skip`, or cursor-based on `createdAt`/`_id` for large sets), a projection to return only needed fields, and `.lean()` for read-only responses.

**Q: `authorizeCoachForAthleteResource` populates the coach's whole roster on every request. Better?**
A: Query `User.exists({ _id: coachId, athletes: athleteId })` — one indexed lookup, no populate.

## 8. Testing

**Q: How would you test this endpoint?**
A: Integration tests with Supertest + mongodb-memory-server covering the access matrix: 401 no token, 403 wrong role / not on roster, 400 invalid body and malformed id, 404 not owned, happy path asserting status, body and DB state. Middleware unit-tested separately with fake req/res/next.

**Q: Why split `app.js` from `index.js`?**
A: Tests need the configured app without connecting to the real DB or binding a port; `index.js` keeps the side effects (connect, listen).

## 9. TypeScript

**Q: Why do TS imports end in `.js`?**
A: With NodeNext resolution, import specifiers are written as they'll exist at runtime; TS maps `.js` to the `.ts` source at compile time.

**Q: How does `req.user` get a type?**
A: Declaration merging: a `.d.ts` file augments `Express.Request` with `user?: UserDoc`. Handlers behind `auth` use `req.user!` because the middleware chain guarantees it.

**Q: How do you migrate a JS codebase to TS incrementally?**
A: `allowJs` so JS and TS coexist; convert leaf modules first (constants, utils, models), then validation, controllers, routes; tighten `strict` options as coverage grows; CI runs `tsc --noEmit`.
