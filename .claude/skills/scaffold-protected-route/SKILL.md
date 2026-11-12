---
name: scaffold-protected-route
description: Add one new protected endpoint to an EXISTING Motionscope router — picks the right auth/authorization middleware chain (auth, authorizeCoach, authorizeAthlete, authorizeCoachForAthleteResource, authorizeAthleteForResource), the Joi validation, a correctly placed route (no shadowing) and a scoped controller handler. Use this whenever the user wants to add an endpoint, route, action or "a way to X" on a resource that already exists (e.g. "add an endpoint for coaches to duplicate a block", "athletes need to mark a compDay attempt", "add GET /api/programs/:athleteId/history", "secure this route"), or asks which middleware a route should use. For a brand-new resource with full CRUD use scaffold-api instead.
---

# scaffold-protected-route

Add a single endpoint to an existing router so that its security policy is correct and readable in the route line, it can't shadow or be shadowed by its neighbours, and its handler only touches data the caller owns.

## Step 1 — Load the conventions

Read `.claude/skills/conventions/SKILL.md` (§5 routers, §6 controllers, §7 responses especially). The template for this skill is `templates/protected-router.ts.tmpl`.

## Step 2 — Pin down the endpoint

| Input | Example |
|---|---|
| Router | `routes/blocks.js` (mounted at `/api/blocks`) |
| Method + path | `POST /:athleteId/:blockId/duplicate` |
| Purpose | coach copies a block to start a new one |
| Caller | coach / athlete / developer / more than one |
| Body | fields the client sends, if any |
| Success response | status + `{ message, <resource> }` |

Infer from the request; ask only for what's missing. Pick the HTTP verb by meaning (conventions §5): GET reads, POST creates or triggers an action, PATCH partially updates, DELETE deletes.

## Step 3 — Read before writing

Read the target router, its controller, `middleware/authorization.js`, and the relevant `validation/<resource>.js`. You need the existing route order, the param names, the handler naming style and which schemas already exist.

**Language rule:** write in the language of the file you're editing. Adding to `routes/blocks.js` means JS; adding to `routes/drills.ts` means TS. Only brand-new files (e.g. a new validation file) are TS. Don't convert a file to add one route — that's the post-MVP migration's job.

## Step 4 — Choose the middleware chain

Walk this table top to bottom; the first match wins.

| Situation | Chain (after `auth`) | Ownership enforced by |
|---|---|---|
| Coach acting on an athlete's data, path has `:athleteId` | `authorizeCoachForAthleteResource` | middleware: coach role + athlete on roster; also `:blockId`/`:compDayId` belongs to the athlete. Any other resource id → also scope the query in the handler |
| Athlete acting on own `:blockId` or `:compDayId` | `authorizeAthleteForResource` | middleware |
| Athlete acting on own anything else | `authorizeAthlete` | handler scopes by `athlete: req.user._id` |
| Coach acting on their own data (templates, custom exercises) | `authorizeCoach` | handler scopes by `coach: req.user._id` |
| Developer-only (preset exercises) | `authorizeDeveloper` | handler |
| More than one role (e.g. coach OR developer) | **stop and ask.** No middleware for this exists. Propose adding `authorizeRoles(...roles)` to `middleware/authorization.js` — that edits app code, so it needs a yes. Don't fall back to an inline role check. |
| Truly public (login, register) | no `auth` | — and say why in the route comment |

Then add `validate(...)` if there's a body:
- POST → `validate(schema)`
- PATCH → `validate(updateSchema, { noDefaults: true })`
- GET / DELETE → no validate (unless the body is genuinely used)

Reuse an existing schema if it fits exactly. Otherwise add one to the resource's validation file, with **client-sent fields only** (no `coach`/`athlete`/computed fields — backlog #23).

## Step 5 — Place the route (shadowing check)

Express tries routes in declaration order, and `:param` matches any single segment. A route **A** declared before **B** shadows B when they share a method, have the same number of segments, and every segment of A is either a `:param` or equal to B's segment.

1. List the router's routes for the same method, in order.
2. Find the position where the new route is not shadowed by anything above it, and doesn't shadow anything below it.
3. In practice: **literal segments go above param segments** at the same depth (`/athletes/:blockId` above `/:athleteId/:blockId`).
4. Reject an exact duplicate of method + path (backlog #2). Every path starts with `/` (backlog #7).
5. Put the route under the matching `// -- COACH'S ENDPOINTS --` / `/// -- ATHLETE'S ENDPOINTS --` section, with a one-line `// <Verb> <what>` comment above it. If shadowing forces the route out of its section, keep the order correct and explain it in the comment.

If an *existing* route is already shadowed (backlog #6), mention it in the report but don't move it unless asked.

## Step 6 — Write the handler

In the resource's controller, following the template:
- Name it like its siblings (`duplicateBlock`, `getAthleteCompDays`) and add it to the export block.
- Read exactly the param names the route declares (`:blockId` → `req.params.blockId`, backlog #22).
- **Scope every query** to the caller (`{ _id, coach: req.user._id }`, `{ _id, athlete: req.user._id }`) unless Step 4's middleware already proved ownership of that exact document. Not found → 404 `"… not found or access denied."`.
- No inline role checks, no `ObjectId.isValid`, no try/catch (except transactions), no `res.send("…")`.
- Respond `{ message, <resource> }`.

## Step 7 — Self-check

- [ ] chain order: `auth` → `authorize*` → `validate` → handler
- [ ] the chosen `authorize*` matches the Step 4 table; no inline role check anywhere
- [ ] not shadowed, doesn't shadow, no duplicate method+path, leading `/`
- [ ] route param names == `req.params.*` in the handler
- [ ] every query scoped, or ownership proven by middleware for that exact id
- [ ] response shape `{ message, <resource> }`
- [ ] file language matches the file; `.js` import extensions in TS

## Step 8 — Report

1. The diff: route line(s), handler, schema if added.
2. The **access matrix** — this doubles as the test plan for `/test-coach`:

   | Request | Expected |
   |---|---|
   | no token | 401 |
   | wrong role | 403 |
   | right role, not owner / athlete not on roster | 403 or 404 |
   | invalid body | 400 |
   | malformed id | 400 (CastError) |
   | happy path | 200/201 `{ message, … }` |
3. Any neighbouring routes in the same router that are missing `auth` or are shadowed — named with their backlog number, not fixed.
