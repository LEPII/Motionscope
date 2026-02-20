import { uploadXlsx } from "../middleware/upload.middleware.js";
import {
  importBlock,
  exportProgram,
} from "../controllers/programImportExportController.js";
import express from "express";
const router = express.Router();


// POST endpoint for importing a block from an Excel file
router.post("/importBlock", uploadXlsx.single("file"), importBlock);

// GET endpoint for exporting a program to an Excel file
router.get("/export/:programId", exportProgram);

export default router;


