import {
  SavedBlockTemplate,
  savedBlockTemplateSchemaJoi,
} from "../model/templateBlock";
import { logger } from "winston";

/// -- COACH'S ENDPOINTS --

const createTemplate = async (req, res) => {
  const { error } = savedBlockTemplateSchemaJoi.validate(req.body);
  if (error) {
    logger.warn(
      `Validation failed for block template: ${error.details[0].message}`
    );
    return res.status(400).json({ message: error.details[0].message });
  }

  const template = new SavedBlockTemplate({
    ...req.body,
    coach: coachId,
  });

  await template.save();
  logger.info(
    `Block template created by coach ${coachId}: ${blockTemplate._id}`
  );
  res.status(201).json(template);
};

const getTemplates = async (req, res) => {
  const { coachId } = req.params;
  const templates = await SavedBlockTemplate.find({ coach: coachId });
  res.json(templates);
};

const getTemplateById = async (req, res) => {
  const { templateId } = req.params;
  const template = await SavedBlockTemplate.findById(templateId);
  if (!template) return res.status(404).json({ message: "Template not found" });
  res.json(template);
};

const deleteTemplate = async (req, res) => {
  const { templateId } = req.params;
  const deleted = await SavedBlockTemplate.findByIdAndDelete(templateId);
  if (!deleted) return res.status(404).json({ message: "Template not found" });
  res.json({ message: "Template deleted successfully" });
};

export {
  createTemplate,
  getTemplates,
  getTemplateById,
  deleteTemplate,
  createBlockFromTemplate,
};
