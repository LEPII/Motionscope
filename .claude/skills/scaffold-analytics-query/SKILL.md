---
name: scaffold-analytics-query
description: Build MongoDB aggregation pipelines for Motionscope lift analytics — weekly tonnage/volume, estimated 1RM trends, RPE drift (prescribed vs actual), load compliance, %1RM intensity, adherence and PR history — over the real embedded Block → weeks → days → exercises → sets structure, wired into a protected endpoint with the right indexes. Use this whenever the user wants stats, analytics, progress, trends, charts data, dashboards, "how much volume", "e1RM over time", "is my athlete overshooting RPE", reports or any aggregation/$group/$unwind/$lookup query on blocks, sets or lifts — even if they don't say "aggregation".
---

# scaffold-analytics-query

Turn a coaching question ("is squat e1RM going up?", "how much did they bench this week?") into a correct, scoped, indexed aggregation pipeline, a pure builder function the user can unit test, and a protected endpoint.

## Step 1 — Load context

Read `.claude/skills/conventions/SKILL.md`, `model/block.js` (the structure), `constants/block.js` (`dayEnum`, `setTypeEnum`) and `model/stats.js`. Template: `templates/aggregation.ts.tmpl`.

## The data you're aggregating

```
Block { coach, athlete, isArchived, blockStartDate (Sunday), blockEndDate, days: ["Monday", ...]
  blockSchedule: [ week { weekNumber, weekStartDate (Sunday)
    dailySchedule: [ day (index i ↔ days[i]) { primExercises
      exercises: [ { exerciseId → Exercise { name, prCategory: squat|bench|deadlift|null }
        setsDetail: [ set { type: working|top|drop|warmup, createdBy: coach|athlete,
                            reps, prescribedLoad (%), prescribedRPE, targetLoad (lbs, from 1RM),
                            actualReps, actualLoad, actualRPE } ] } ] } ] } ] }
AthleteStats { user → athlete, oneRepMaxes: { squat, bench, deadlift } }
```

Facts that shape every pipeline:
- **A set's date isn't stored.** Derive it: `weekStartDate + indexOf(dayEnum, days[dayIndex])` days (weeks start on Sunday; `dayEnum` is Sunday-first). `dayIndex` comes from `$unwind`'s `includeArrayIndex`.
- **`weekNumber` restarts every block** — group across blocks by `$dateTrunc` of the derived date, not by `weekNumber`.
- **"Performed" = actuals present**: `actualLoad > 0 && actualReps > 0`. Coach sets without actuals are the plan, not the log.
- **Warmups** (`type: "warmup"`, athlete-created) are excluded from training metrics unless asked.
- **Lift identity** comes from `Exercise.prCategory` via `$lookup`; accessories have `null`.
- **Units:** `targetLoad` is documented as lbs; `actualLoad`'s unit isn't documented (backlog #31). Treat as lbs and convert on output with `utils/conversions.js` per `User.unitPreference` if needed — flag it to the user.

## Step 2 — Pin down the question

| Input | Example |
|---|---|
| Metric | weekly tonnage, best e1RM, RPE drift… (recipes below) |
| Who's asking | coach for an athlete on their roster / athlete for themselves |
| Scope | one athlete; date range; one lift or all competition lifts; include archived? |
| Grain | per week / per block / per session / per set |
| Output shape | what the frontend chart needs: `[{ week, lift, tonnage, bestE1rm }]` |

## Step 3 — Build the pipeline (stage order matters)

1. **`$match` first, on indexed fields** — `athlete` (+ `coach` for coach requests), `isArchived: false`, block date overlap with the range. This is the only stage that can use an index; everything after works on what it lets through.
   - `aggregate()` does **not** cast types the way `find()` does: wrap ids with `new mongoose.Types.ObjectId(id)` and dates with `new Date(...)`, or the match silently returns nothing.
   - Ownership lives here, exactly like `find()` scoping in controllers (conventions §6).
2. **`$project`** only `days` and `blockSchedule` (+ `blockName` if needed) — smaller documents through the unwinds.
3. **`$unwind`** down the tree: `blockSchedule` → `dailySchedule` (with `includeArrayIndex: "dayIndex"`) → `exercises` → `setsDetail`. Each unwind multiplies documents; that's why steps 1–2 come first.
4. **Flatten** with `$project` into one row per set: `blockId`, `date` (derived), `exercise`, `set`.
5. **Filter sets** (`$match` on performed / not warmup).
6. **`$lookup`** the exercise for `prCategory`/`name`, with a `pipeline: [{ $project: … }]` to fetch only those fields. Use `Exercise.collection.name` for `from` — never hard-code; the model name is lowercase today (#21) and collection names are pluralised by Mongoose.
7. **`$group`** to the grain, then **`$project`** to the output shape (round numbers here), then **`$sort`**.

Requires MongoDB ≥ 5.0 (`$dateAdd`, `$dateTrunc`, `$lookup` with `localField` + `pipeline`, `$getField`, `$setWindowFields`). Atlas clusters are.

## Step 4 — Metric recipes (`$group` / `$project` bodies)

| Metric | Group by | Accumulators / expression |
|---|---|---|
| **Weekly tonnage + best e1RM** (template) | `{ week: $dateTrunc(date, week, sunday), lift: prCategory }` | tonnage `$sum(actualLoad × actualReps)`; e1RM (Epley) `$max(actualLoad × (1 + actualReps/30))`; `sets: $sum 1`; `avgRpe: $avg actualRPE` |
| **RPE drift** (are they overshooting?) | week, lift | filter `createdBy: "coach"`, both RPEs present; `avgDrift: $avg(actualRPE − prescribedRPE)` — positive = harder than prescribed |
| **Load compliance** | week, lift | filter `targetLoad > 0`; `$avg(actualLoad / targetLoad)` — 1.0 = on target |
| **%1RM intensity** | session date, lift | `$lookup` AthleteStats (`from: AthleteStats.collection.name`, `localField: "athlete"` kept from the block, `foreignField: "user"`); `$getField: { field: "$exercise.prCategory", input: "$stats.oneRepMaxes" }`; `$avg(actualLoad / oneRM)` |
| **Adherence** | week | plan = coach sets; done = coach sets with actuals; `$sum` of each, ratio in `$project` |
| **PR history / running best** | lift, ordered by date | after a per-session best e1RM `$group`, `$setWindowFields: { partitionBy: "$lift", sortBy: { date: 1 }, output: { runningBest: { $max: "$e1rm", window: { documents: ["unbounded", "current"] } } } }` |
| **Several metrics, one round trip** | — | `$facet: { tonnage: [...], drift: [...] }` after the shared stages 1–6 |

e1RM: Epley is fine for reps ≤ 10; say so if the user asks about accuracy. An RPE-adjusted e1RM (RTS chart) needs a lookup table — offer it as a follow-up rather than inventing coefficients.

## Step 5 — Wire it up

Follow the template — three pieces:
1. **Pure pipeline builder** in `utils/analytics/<metric>.ts`: `(params) => PipelineStage[]`. No DB access, so `/test-coach` can unit-test the stages it returns, and the controller stays thin.
2. **Controller** (`controllers/analyticsController.ts`): validate the query string with a Joi schema at the top of the handler (`validate.js` only checks `req.body`) → 400 `{ message, details }`; build the pipeline with `athleteId` + `coachId: req.user!._id` (coach) or `athleteId: req.user!._id` (athlete); `Block.aggregate(...)`; respond `200 { message, <metric> }`.
3. **Routes** (`routes/analytics.ts`, mount `/api/analytics` — ask before editing `routes/routes.js`): athlete literals first.
   - `GET /athletes/<metric>` → `auth, authorizeAthlete`
   - `GET /:athleteId/<metric>` → `auth, authorizeCoachForAthleteResource`

## Step 6 — Indexes and performance

- Block has **no indexes** today (backlog #31). The first `$match` needs `{ athlete: 1, blockStartDate: -1 }` (athlete view) and `{ coach: 1, athlete: 1, blockStartDate: -1 }` (coach view). Adding them edits `model/block.js` — show the diff and ask.
- Verify with `Block.aggregate(pipeline).explain("executionStats")`: the first stage should be `IXSCAN`, not `COLLSCAN`.
- Dashboards that run the same heavy pipeline often: write results to a summary collection with a final `$merge` on a schedule or after block saves (materialized view) — the step before extracting a `SetLog` collection (scaffold-model-relation).
- `allowDiskUse(true)` only if a group exceeds 100MB — unlikely at this scale; if it's needed, the `$match` is probably too wide.

## Step 7 — Self-check

- [ ] `$match` is first, uses indexed fields, includes the ownership scope
- [ ] ids cast to `ObjectId`, dates to `Date`
- [ ] `$project` before the unwinds; `$lookup` fetches only needed fields; `from` uses `Model.collection.name`
- [ ] dates derived from `weekStartDate` + `dayEnum` offset; weekly grouping via `$dateTrunc`, not `weekNumber`
- [ ] performed-set filter applied; warmups excluded unless asked
- [ ] builder is pure and exported; controller validates query params; routes follow the chain
- [ ] units stated in the response or the report

## Step 8 — Report

1. The coaching question → metric definition in one sentence (formula included).
2. Files/diff; sample output rows.
3. Index changes proposed (+ explain() check).
4. Assumptions (units, Epley, excluded warmups, archived blocks).
5. Next: `/explain-scaffold` for the walkthrough (stage-by-stage), `/test-coach` to unit-test the builder and integration-test the endpoint with seeded blocks.
