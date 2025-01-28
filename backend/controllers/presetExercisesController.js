import {
  PresetExercise,
  validatePresetExercises,
} from "../model/presetExercise.js";

const getSinglePresetExercise = async (req, res) => {
  const singlePresetExercise = await PresetExercise.findById(req.params.id);
  res.send(singlePresetExercise);
};

const getAllPresetExercise = async (req, res) => {
  const allPresetExercise = await PresetExercise.find();
  res.send(allPresetExercise);
};

const postPresetExercise = async (req, res) => {
  try {
    const { error } = validatePresetExercises(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const { name, description, muscleGroup } = req.body;

    const presetExercise = new PresetExercise(name, description, muscleGroup);

    const savedPresetExercise = await presetExercise.save();

    res.status(201).json({
      message: "Preset exercise created successfully!",
      data: savedPresetExercise,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updatePresetExercise = async (req, res) => {
  const { error } = validatePresetExercises(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { name, description, muscleGroup } = req.body;

  const updatedPresetExercise = {
    $set: {
      name,
      description,
      muscleGroup,
    },
  };

  const presetExercise = await PresetExercise.findByIdAndUpdate(
    req.params.id,
    updatedPresetExercise,
    { new: true }
  );

  if (!presetExercise) return res.status(404).send("Preset exercise not found");

  res.send(presetExercise);
};

const deletePresetExercise = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPresetExercise = await PresetExercise.findByIdAndRemove(id);

    if (!deletedPresetExercise) {
      return res.status(404).json({ message: "Preset exercise not found" });
    }

    res.status(200).json({ message: "Preset exercise deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  getSinglePresetExercise,
  getAllPresetExercise,
  postPresetExercise,
  updatePresetExercise,
  deletePresetExercise,
};
