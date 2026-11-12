---
name: explain-scaffold
description: Walk the user through Motionscope backend code — freshly scaffolded files or any existing model/route/controller/middleware — layer by layer: what each part does, WHY it's written that way (tied to the project conventions and backlog), how a request flows through it, and what would break if a line were removed; then quiz them with likely interview questions, revealing model answers only after they try. Use this whenever the user says "explain this", "walk me through", "what does this do", "why is it like this", "help me understand the code you generated", "prep me for interview questions on this", or right after a scaffold-* skill finishes, even if they don't name the skill.
---

# explain-scaffold

Turn generated code into code the user owns: they should be able to explain every line in an interview, defend each design choice, and spot what would break if it changed. This skill is **read-only** — it never edits code.

Reference: `references/question-bank.md` — interview questions with model answers, grouped by topic.

## Step 1 — Pick the target

In order of preference:
1. Files the user named.
2. Files a scaffold-* skill just generated in this conversation.
3. New or modified backend files in `git status` / `git diff main...HEAD` (model/, controllers/, routes/, validation/, constants/, middleware/).

State what you'll cover in one line and ask whether they want the **quick** pass (big picture + lifecycle + 3 questions) or the **deep** pass (everything below). Default to deep for a newly scaffolded resource.

## Step 2 — Read

Read `.claude/skills/conventions/SKILL.md` and every target file, plus anything they import from the app (middleware/auth.js, middleware/authorization.js, middleware/validate.js, middleware/error.js, validation/common.js) so you explain the real behaviour, not an assumed one.

## Step 3 — Big picture (3–5 sentences)

What resource this is, who owns it (ownership variant A/B/C from scaffold-api), which endpoints exist, and how the files depend on each other: constants → model → validation → controller → router → `routes/routes.js` mount.

## Step 4 — Trace one request end to end

Pick the most instructive endpoint (usually the POST or PATCH) and trace it as a numbered list:

```
POST /api/drills/:athleteId  { name, category }
1. express.json() parses the body                       routes/routes.js
2. router matches "/:athleteId" (after the /athletes literals)  routes/drills.ts:L
3. auth: x-auth-token → jwt.verify → User.findById → req.user   middleware/auth.js
4. authorizeCoachForAthleteResource: role === coach, athlete on roster
5. validate(drillSchema): Joi strips/rejects → req.body replaced
6. postDrill: create({...body, coach, athlete})
7. Mongoose validators run → insert
8. 201 { message, drill }
```

Then the **failure branches**: where each of 401 / 403 / 400 (Joi) / 400 (CastError) / 404 / 409 / 500 comes from, and which file produces the response shape. Link files as `path:line` so they're clickable.

## Step 5 — Walk each file

Go file by file in dependency order. For each:
- **Purpose** in one sentence.
- **Key lines** (quote 1–3 short snippets with line numbers) and what they do.
- **Why it's this way** — cite the convention section (e.g. "conventions §6: scope every query") and, where relevant, the backlog bug it prevents (e.g. "#22: unscoped find leaked every block").
- **What if** — one concrete "if you deleted/changed X, then Y happens" (e.g. "drop `runValidators: true` and a PATCH can save `targetReps: 500`").

Keep each file's section short. Explanations should be at the level of an intermediate dev — skip what `async/await` or `import` is; spend words on decisions.

If you spot something that breaks the conventions, say so plainly and point to the rule — but don't fix it (this skill is read-only). Suggest which skill would.

## Step 6 — Check understanding

After the walkthrough, ask the user to explain one thing back in their own words — pick the most important idea for this code (usually: why ownership lives in the query, or why the middleware order is what it is). Respond to what they actually said: confirm what's right, correct what's off, fill the gap.

## Step 7 — Interview drill

Ask 5–8 questions (3 in quick mode), **one at a time**:
1. Pick from `references/question-bank.md`, adapting each to the code just explained (use its real names and paths). Mix categories: design choice, security, data modelling, debugging/"what if", scaling, testing.
2. Ask the question. **Don't show the answer.** Wait for theirs.
3. Then give: what was strong in their answer, what a strong answer adds, and the model answer in 2–4 sentences.
4. If they say "skip" or "show", reveal and move on.

## Step 8 — Wrap up

- The 3 sentences they should be able to say about this code in an interview.
- Anything flagged in Step 5.
- Next step: `/test-coach` to turn the failure branches from Step 4 into tests they write themselves.
