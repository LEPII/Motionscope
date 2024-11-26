const { Block, validateBlock } = require("../model/block");
const express = require("express");
const router = express.Router();

// -- COACH'S ENDPOINTS --

// Get a Single Block from a Specific Athlete

router.get("/:id", async (req, res) => {
  const singleBlock = await Block.findById(req.params.id);
  res.send(singleBlock);
});

// Get all Blocks from a Specific Athlete

router.get("/", async (req, res) => {
  const allBlocks = await Block.find();
  res.send(allBlocks);
});

// Post a Block to a Specific Athlete

router.post("/", async (req, res) => {
  let block = new Block(req.body);
  block = await block.save();
  res.send(block);
});

// Update a Block from a Specific Athlete



// Delete a Block from a Specific Athlete

// Post/Save Templates for Blocks

router.post("/", async (req, res) => {
  let blockTemplate = new Block(req.body);
  blockTemplate = await block.save();
  res.send(blockTemplate);
});

/// -- ATHLETE'S ENDPOINTS --

// Get Current Block (The Next or Current Workout)

router.get("/:id", async (req, res) => {
  const singleBlock = await Block.findById(req.params.id);
  res.send(singleBlock);
});

// Get All Blocks

router.get("/", async (req, res) => {
  const allBlocks = await Block.find();
  res.send(allBlocks);
});

// Update Blocks (Only three fields - Load, RPE and Notes)