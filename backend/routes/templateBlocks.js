import express from "express";
const router = express.Router(); 

// -- COACH'S ENDPOINTS --

// Post a Template Block
router.post("/", createTemplate);

// Get All Template
router.get("/:coachId", getTemplates);

// Get a Single Template
router.get("/:templateId", getTemplateById);

// Delete a Template
router.delete("/:templateId", deleteTemplate);

// Create a real Block from template
router.post("/use/:templateId", createBlockFromTemplate);

export default router;
