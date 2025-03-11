import {
  Questionnaire,
  validate,
  patchedValidate,
} from "../model/questionnaire.js";

const getQuestionnaire = async (req, res) => {
  const questionnaire = await Questionnaire.findById(req.params.id);
  res.send(questionnaire);
};

const postQuestionnaire = async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let question = new Questionnaire(req.body);
  question.submitted = true;

  question = await question.save();

  res.send(question);
};

const updateQuestionnaire = async (req, res) => {
  const { error } = patchedValidate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const update = { ...req.body };
  delete update.submitted;

  const questionnaire = await Questionnaire.findByIdAndUpdate(
    req.params.id,
    update,
    { new: true }
  );

  if (!questionnaire) return res.status(404).send("Questionnaire not found");

  res.send(questionnaire);
};

export { getQuestionnaire, postQuestionnaire, updateQuestionnaire };
