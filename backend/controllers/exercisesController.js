import { Exercise, validateExercises } from "../model/exercise.js";

const getSingleExercise = async (req, res) => {
  const exerciseId = req.params.id;
  const user = req.user;

  const singleExercise = await Exercise.findById(exerciseId);

  if (!singleExercise) {
    return res.status(404).send("Exercise not found.");
  }

  // Only coaches can access any preset exercise OR their own custom exercise
  if (user && user.role === "coach") {
    if (
      singleExercise.type === "preset" ||
      (singleExercise.type === "custom" &&
        singleExercise.createdBy &&
        singleExercise.createdBy.equals(user._id))
    ) {
      res.send(singleExercise);
    } else {
      res.status(403).send("Unauthorized to view this custom exercise.");
    }
  }
};

const getAllExercises = async (req, res) => {
  if (req.user && req.user.role === "coach") {
    const allExercise = await Exercise.find({
      $or: [{ type: "preset" }, { type: "custom", createdBy: req.user._id }],
    });
    res.send(allExercise);
  } else {
    const error = new Error(
      "Unauthorized. Coaches only can access all exercises."
    );
    error.statusCode = 403;
    throw error;
  }
};

const postExercise = async (req, res) => {
  const { error } = validateExercises.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { name, description, muscleGroup, type, ...otherProps } = req.body;
  const { role, _id: userId } = req.user;

  if (!name) {
    return res.status(400).json({ message: "Name is required." });
  }

  const allowedProperties = ["name", "description", "muscleGroup", "type"];
  const receivedProperties = Object.keys(req.body);

  const hasOnlyAllowedProperties = receivedProperties.every((prop) =>
    allowedProperties.includes(prop)
  );

  if (!hasOnlyAllowedProperties) {
    return res.status(400).json({
      message: `Only the following properties are allowed: ${allowedProperties.join(
        ", "
      )}`,
    });
  }

  let newExercise;

  if (role === "developer") {
    if (type !== "preset") {
      return res.status(403).json({
        message: "Developers can only post exercises of type 'preset'.",
      });
    }
    newExercise = { name, description, muscleGroup, type, createdBy: userId };
  } else if (role === "coach") {
    if (type !== "custom") {
      return res.status(403).json({
        message: "Coaches can only post exercises of type 'custom'.",
      });
    }
    newExercise = { name, description, muscleGroup, type, createdBy: userId };
  } else {
    return res
      .status(403)
      .json({ message: "Only developers and coaches can post exercises." });
  }

  const exercise = await Exercise.create(newExercise);

  res.status(201).json({
    message: "Exercise created successfully!",
    data: exercise,
  });
};

const updateExercise = async (req, res) => {
  const { error } = validateExercises(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { name, description, muscleGroup } = req.body;

  const updatedExercise = {
    $set: {
      name,
      description,
      muscleGroup,
    },
  };

  const exercise = await Exercise.findByIdAndUpdate(
    req.params.id,
    updatedExercise,
    { new: true }
  );

  if (!exercise) return res.status(404).send("exercise not found");

  res.send(exercise);
};

const deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedExercise = await Exercise.findByIdAndRemove(id);

    if (!deletedExercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    res.status(200).json({ message: "Exercise deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  getSingleExercise,
  getAllExercises,
  postExercise,
  updateExercise,
  deleteExercise,
};
