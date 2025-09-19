import {
  SavedBlockTemplate,
  savedBlockTemplateSchemaJoi,
  createBlockFromTemplateSchema,
} from "../model/templateBlock";
import { Block, blockCoachSchema } from "../model/block";
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

const createBlockFromTemplate = async (req, res) => {
  const { error } = blockCoachSchema.validate(req.body);
  if (error) {
    logger.warn(`Block validation failed: ${error.details[0].message}`);
    return res.status(400).send(error.details[0].message);
  }

  const { templateId } = req.params;
  const { coachId } = req.user._id;
  const {
    athlete,
    blockName,
    numberOfWeeks,
    days,
    blockSchedule,
    blockStartDate,
    blockEndDate,
  } = req.body;

  const template = await SavedBlockTemplate.findById(templateId);
  if (!template) return res.status(404).json({ message: "Template not found" });

  const block = new Block({
    coach: coachId,
    athlete,
    blockName: blockName || template.blockName,
    numberOfWeeks: numberOfWeeks || template.numberOfWeeks,
    days: days || template.days,
    blockSchedule: blockSchedule || template.blockSchedule,
    blockStartDate: blockStartDate || template.blockStartDate,
    blockEndDate: blockEndDate || template.blockEndDate,
  });

  await block.save();

  logger.info(`Block created from template by coach ${coachId}: ${block._id}`);

  res.status(201).json(block);
};

export {
  createTemplate,
  getTemplates,
  getTemplateById,
  deleteTemplate,
  createBlockFromTemplate,
};
