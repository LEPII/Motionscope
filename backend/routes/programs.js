const { Program, validate } = require("../model/program");
const express = require("express");
const _ = require("lodash");
const router = express.Router();

// -- COACH'S ENDPOINTS -- 

// Get All Athletes/Programs  

// Get a Single Program from a specific Athlete - (Which will then show a preview of all blocks)

// Post a Program - Must have no more / no less than 1 athlete associated 

// Update a Program

// Delete a Program / Athlete - Archive Option?  

// -- ATHLETE'S ENDPOINTS --

// Get Current Program

module.exports = router;
