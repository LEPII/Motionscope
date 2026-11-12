---
name: scaffold-model-relation
description: Decide and scaffold relationships between Motionscope Mongoose models — embed vs reference (child ref, parent ref array, two-way, virtual populate, denormalized copy), the schema fields, indexes, populate/select queries, cascade/orphan handling and transactions — grounded in the real coach → athletes → blocks → lifts structure. Use this whenever the user asks how two models should relate, whether to embed or reference, "should X be its own collection", how to populate, how to link a new model to User/Block/Exercise/Program, how to model coach/athlete/lift data, or hits slow nested queries or orphaned documents — even if they don't say "relation".
---

# scaffold-model-relation

Help the user choose how two pieces of data relate, explain the trade-off so they can defend it, then generate the schema fields and query patterns in project style. Reasoning comes first; code is the smaller part.

## Step 1 — Load context

Read `.claude/skills/conventions/SKILL.md` (§3 models especially) and the model files involved. Use the map below as precedent — the best explanation is "we already do this in X, for this reason".

## The current Motionscope relation map

| Relation | How it's modelled | Pattern | Why it fits / what it costs |
|---|---|---|---|
| Coach → athletes | `User.athletes: [ObjectId ref "User"]` | parent ref array | Roster is small and read as a whole; `$addToSet`/`$pull` are atomic. Allows an athlete on several rosters (many-to-many). Ownership checks populate the whole roster each time (cheaper: `User.exists({ _id, athletes: id })`). |
| Block → coach, athlete | `Block.coach`, `Block.athlete` | child ref | Blocks are queried by athlete/coach independently and grow without bound per athlete. |
| Block → weeks → days → exercises → sets (the "lifts") | nested sub-schemas in `Block.blockSchedule` | embed | Always read and written with the block; bounded (≤12 weeks × ≤7 days); one document = atomic save + `pre("save")` validation. Cost: cross-block analytics needs 4× `$unwind`; set edits are positional. |
| Exercise entry → Exercise | `exerciseEntrySchema.exerciseId` ref "Exercise" | ref from inside an embed | Exercise library is shared across blocks/coaches. ⚠ field name has the legacy `Id` suffix, and the model is registered as `"exercise"` (backlog #21) so populate fails today. |
| Program → blocks, compDays | `Program.blocks[]`, `Program.compDays[]` **and** `Block.athlete` | two-way | Ordered list from the program side. Cost: two writes must stay in sync — `postBlock` does it in a transaction; deleting a block elsewhere leaves a dangling id. A virtual populate would avoid storing the array. |
| Athlete → 1RMs | `AthleteStats { user (unique), oneRepMaxes }` | separate 1:1 collection | Keeps training numbers out of the auth document. Could be embedded in User; kept apart because it's written by different flows. Field is `user`, not `athlete` (legacy naming). |

## Step 2 — Gather the five facts

For the relation in question, establish (infer from code/request, ask only what's missing):

1. **Cardinality** — 1:1, 1:few (< ~100, bounded), 1:many (hundreds–thousands), 1:squillions (unbounded), many:many.
2. **Access pattern** — always read together? Or is the child queried on its own (by date, by athlete, across parents)?
3. **Growth** — is there a hard bound on the child count? Could the parent approach the 16MB document limit?
4. **Writes** — who writes each side, how often, and must they change atomically?
5. **Lifecycle** — can the child exist without the parent? Is the child shared by several parents?

## Step 3 — Decide

| If… | Then | Motionscope precedent |
|---|---|---|
| 1:few, bounded, read together, child owned by parent, needs atomic writes | **Embed** a sub-schema | Block sets |
| 1:many / unbounded, or child queried on its own | **Child ref** (`child.parent`) + index on it | `Block.athlete` |
| Bounded list you need *from* the parent (ordered, or with `$addToSet` semantics) | **Parent ref array** | `User.athletes` |
| You want "parent.children" without storing the array | **Virtual populate** (child ref + `schema.virtual`) | (would replace `Program.blocks`) |
| Both sides truly need the link | **Two-way ref**, every write in a transaction | `Program.blocks` + `Block.athlete` |
| Read-heavy, a few fields of a shared doc needed everywhere | **Child ref + denormalized copy** (e.g. `exerciseName`) — accept staleness, update on rename | — |
| Child is shared by many parents (library data) | **Ref**, never embed copies | Exercise |

Present: the recommendation, the runner-up and why it lost (one line), and the precedent. Name the trade-off the user would be asked about in an interview.

### "Should lifts be their own collection?"
Current decision (owner, 2026-11-10): **keep sets embedded in Block.** Revisit when one of these becomes true:
- analytics across many blocks is the main read pattern and aggregation gets slow,
- athletes log sets outside of a block (ad-hoc sessions),
- per-set history needs its own indexes (e.g. "all squat sets for athlete X by date").

Then the shape would be a `SetLog` (or `Lift`) collection with child refs `athlete`, `coach`, `block`, `exercise`, plus `performedAt`, `actualLoad`, `actualReps`, `actualRPE`, indexed `{ athlete: 1, exercise: 1, performedAt: -1 }` — and a decision on the source of truth (move sets out of Block, or keep Block as the plan and SetLog as the log). A middle step is a materialized view built with an aggregation `$merge` (see scaffold-analytics-query).

## Step 4 — Scaffold

Generate only what the relation needs. Existing model files are app code: show the diff and get a yes before editing them; new files are TS (conventions §0), edits keep the file's language.

**Child ref**
```ts
athlete: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
// …
fooSchema.index({ athlete: 1, createdAt: -1 }); // every foreign key you filter on gets an index
```
Joi: `Joi.objectId()` only if the **client** sends it; otherwise the controller sets it (conventions §4).

**Parent ref array**
```ts
athletes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
```
Writes: `$addToSet` to add (no duplicates), `$pull` to remove. Membership check: `User.exists({ _id: coachId, athletes: athleteId })` — no populate needed.

**Embed**
```ts
const childSchema = new mongoose.Schema({ ... });          // declared above the parent
const parentSchema = new mongoose.Schema({ children: [childSchema] });
```
No `unique` inside the sub-schema (backlog #27); enforce "unique within this parent" in `pre("validate")`. Bound the array with a validator if it could grow.

**Virtual populate**
```ts
programSchema.virtual("blockList", {
  ref: "Block",
  localField: "athleteId", // Program's legacy name (#18); would be "athlete" in new code
  foreignField: "athlete",
  match: { isArchived: false }, // optional filter applied to the joined docs
});
programSchema.set("toJSON", { virtuals: true });
// Program.findById(id).populate({ path: "blockList", select: "blockName blockStartDate" })
```

**Two-way** — both writes inside one transaction (pattern: `postBlock`):
```ts
const session = await mongoose.startSession();
try {
  session.startTransaction();
  const [child] = await Child.create([{ ...data }], { session });
  await Parent.updateOne({ _id: parentId }, { $push: { children: child._id } }, { session });
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  await session.endSession();
}
```

## Step 5 — Query patterns to hand over

- **Populate only what you render:** `.populate("athlete", "firstName lastName")`; nested: `.populate({ path: "blockSchedule.dailySchedule.exercises.exerciseId", select: "name prCategory" })`.
- **Read-only responses:** add `.lean()` (plain objects, much faster, no getters/virtuals unless asked).
- **Avoid N+1:** never `findById` inside a loop. Collect ids, then one `Exercise.find({ _id: { $in: ids } })` and build a `Map`. (`utils/trainingLoad.js` currently does the loop — backlog #30.)
- **Children by parent:** `Child.find({ parent: id }).sort(...)` backed by the index from Step 4.
- **Joins inside analytics:** `$lookup` in an aggregation, not populate — see scaffold-analytics-query.

## Step 6 — Deletes and orphans

Mongo has no foreign keys, so decide explicitly what happens when the parent goes away:

| Strategy | When | Example |
|---|---|---|
| Cascade delete (in a transaction) | child is meaningless without parent | `deleteProgram` deletes its blocks/compDays (no transaction today) |
| Soft delete / archive | history must survive | `isArchived` on Block/Program |
| Leave + filter | child is independent | blocks stay when an athlete leaves a roster; ownership filters hide them |
| `$pull` dangling ids | parent ref arrays | remove a block id from `Program.blocks` when the block is deleted |

State the chosen strategy in the report; if it's cascade, the code goes in the controller (or a `pre("deleteOne", { document: true })` hook) and inside a transaction.

## Step 7 — Self-check

- [ ] every `ref:` string equals the target's `mongoose.model()` name (#21)
- [ ] ref field named after the thing (`athlete`), not `athleteId` (conventions §3)
- [ ] index on every foreign key you filter or sort on
- [ ] no unbounded embedded array; no `unique` inside sub-schemas
- [ ] two-way writes inside a transaction
- [ ] populate selects fields; read-only paths use `.lean()`; no lookups in loops
- [ ] delete/orphan strategy decided and implemented
- [ ] existing model files edited only after the user said yes

## Step 8 — Report

1. The decision in one sentence + the trade-off (what you gave up).
2. Diff/new code.
3. The query patterns the user will need.
4. Delete strategy.
5. Next: `/explain-scaffold` for the walkthrough, `/test-coach` for a test that would catch an orphan or a broken populate.
