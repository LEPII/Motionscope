// @ts-nocheck — reference file, not compiled. Import paths are written as if this file lived at
// routes/blocks.ts, so they don't resolve from .claude/skills/. Copy the patterns, keep the paths.
// Example: TypeScript translation of routes/blocks.js, following conventions/SKILL.md.
// Chosen over routes/exercises.js because it shows both roles, resource-level authorization and route ordering.
// Changes vs. the source file:
//   - every route has the full chain: auth -> authorize* -> validate -> handler (backlog #4, #16)
//   - athlete literal routes declared BEFORE /:athleteId/... so they're reachable (backlog #6)
//   - athlete "all blocks" is GET /athletes (was /athletes/blocks, which collided with /athletes/:blockId)
//   - archive moved to /:athleteId/:blockId/archive so authorizeCoachForAthleteResource can verify it

import express from "express";
import auth from "../middleware/auth.js";
import {
  authorizeAthlete,
  authorizeAthleteForResource,
  authorizeCoach,
  authorizeCoachForAthleteResource,
} from "../middleware/authorization.js";
import validate from "../middleware/validate.js";
import { blockCoachSchema, blockCoachUpdateSchema } from "../validation/block.js";
import { createBlockFromTemplateSchema } from "../validation/templateBlock.js";
import {
  getSingleBlock,
  getAllBlocks,
  postBlock,
  updateBlock,
  toggleBlockArchive,
  deleteBlock,
  createBlockFromTemplate,
  getCurrentBlock,
  getAllAthleteBlocks,
} from "../controllers/blockController.js";

const router = express.Router();

/// -- ATHLETE'S ENDPOINTS --  (literal paths first so /:athleteId can't swallow them)

// Get all of the logged-in athlete's Blocks
router.get("/athletes", auth, authorizeAthlete, getAllAthleteBlocks);

// Get one of the logged-in athlete's Blocks
router.get("/athletes/:blockId", auth, authorizeAthleteForResource, getCurrentBlock);

// -- COACH'S ENDPOINTS --

// Create a Block from a saved template
router.post(
  "/use/:templateId",
  auth,
  authorizeCoach,
  validate(createBlockFromTemplateSchema),
  createBlockFromTemplate,
);

// Get all Blocks for a specific Athlete
router.get("/:athleteId", auth, authorizeCoachForAthleteResource, getAllBlocks);

// Post a Block to a specific Athlete
router.post(
  "/:athleteId",
  auth,
  authorizeCoachForAthleteResource,
  validate(blockCoachSchema),
  postBlock,
);

// Get a single Block from a specific Athlete
router.get("/:athleteId/:blockId", auth, authorizeCoachForAthleteResource, getSingleBlock);

// Update a Block from a specific Athlete
router.patch(
  "/:athleteId/:blockId",
  auth,
  authorizeCoachForAthleteResource,
  validate(blockCoachUpdateSchema, { noDefaults: true }),
  updateBlock,
);

// Archive / unarchive a Block from a specific Athlete
router.patch(
  "/:athleteId/:blockId/archive",
  auth,
  authorizeCoachForAthleteResource,
  toggleBlockArchive,
);

// Delete a Block from a specific Athlete
router.delete("/:athleteId/:blockId", auth, authorizeCoachForAthleteResource, deleteBlock);

export default router;
