import {
  CustomExercise,
  validateCustomExercises,
} from "../model/customExercise.js";

const getSingleCustomExercise = async (req, res) => {
  const singleCustomExercise = await CustomExercise.findById(req.params.id);
  res.send(singleCustomExercise);
};

const getAllCustomExercise = async (req, res) => {
  const allCustomExercise = await CustomExercise.find();
  res.send(allCustomExercise);
};

const postCustomExercise = async (req, res) => {
  try {
    const { error } = validateCustomExercises(req.body);
    if (error) return res.status(400).send(error.detail[0].message);

    const { name, description, muscleGroup } = req.body;

    const customExercise = new CustomExercise(name, description, muscleGroup);

    const savedCustomExercise = await customExercise.save();

    res.status(201).json({
      message: "Custom exercise created successfully!",
      data: savedCustomExercise,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const updateCustomExercise = async (req, res) => {
  const { error } = validateCustomExercises(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { name, description, muscleGroup } = req.body;

  const updatedCustomExercise = {
    $set: {
      name,
      description,
      muscleGroup,
    },
  };

  const customExercise = await CustomExercise.findByIdAndUpdate(
    req.params.id,
    updatedCustomExercise,
    { new: true }
  );

  if (!customExercise) return res.status(404).send("Custom exercise not found");

  res.send(customExercise);
};

const deleteCustomExercise = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCustomExercise = await CustomExercise.findByIdAndRemove(id);

    if (!deletedCustomExercise) {
      return res.status(404).json({ message: "Custom exercise not found" });
    }

    res.status(200).json({ message: "Custom exercise deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  getSingleCustomExercise,
  getAllCustomExercise,
  postCustomExercise,
  updateCustomExercise,
  deleteCustomExercise,
};
