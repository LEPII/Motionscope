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
  const { error } = validateExercises.validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const exerciseId = req.params.id;
  const user = req.user;

  const exerciseToUpdate = await Exercise.findById(exerciseId);

  if (!exerciseToUpdate) {
    return res.status(404).send("Exercise not found");
  }

  const updates = {};
  if (req.body.name !== undefined) {
    updates.name = req.body.name;
  }
  if (req.body.description !== undefined) {
    updates.description = req.body.description;
  }
  if (req.body.muscleGroup !== undefined) {
    updates.muscleGroup = req.body.muscleGroup;
  }

  if (Object.keys(updates).length === 0) {
    return res
      .status(400)
      .send(
        "No valid fields to update provided (name is required for editing)."
      );
  }

  if (user.role === "coach") {
    if (
      exerciseToUpdate.type === "custom" &&
      exerciseToUpdate.createdBy &&
      exerciseToUpdate.createdBy.equals(user._id)
    ) {
      const exercise = await Exercise.findByIdAndUpdate(
        exerciseId,
        { $set: updates },
        { new: true, runValidators: true }
      );
      return res.send(exercise);
    } else {
      return res
        .status(403)
        .send(
          "Unauthorized. Coaches can only edit the name, description, and muscleGroup of their own custom exercises."
        );
    }
  } else if (user.role === "developer") {
    if (exerciseToUpdate.type === "preset") {
      const exercise = await Exercise.findByIdAndUpdate(
        exerciseId,
        { $set: updates },
        { new: true, runValidators: true }
      );
      return res.send(exercise);
    } else {
      return res
        .status(403)
        .send(
          "Unauthorized. Developers can only edit the name, description, and muscleGroup of preset exercises."
        );
    }
  } else {
    return res
      .status(403)
      .send(
        "Unauthorized. Only coaches and developers can edit the name, description, and muscleGroup of exercises."
      );
  }
};

const deleteExercise = async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const exerciseToDelete = await Exercise.findById(id);

  if (!exerciseToDelete) {
    return res.status(404).json({ message: "Exercise Not Found" });
  }

  if (user.role === "coach") {
    if (
      exerciseToDelete.type === "custom" &&
      exerciseToDelete.createdBy &&
      exerciseToDelete.createdBy.equals(user._id)
    ) {
      const deletedExercise = await Exercise.findByIdAndDelete(id);
      if (!deletedExercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      return res
        .status(200)
        .json({ message: "Custom exercise deleted successfully" });
    } else {
      return res.status(403).json({
        message:
          "Unauthorized. Coaches can only delete their own custom exercises.",
      });
    }
  } else if (user.role === "developer") {
    if (exerciseToDelete.type === "preset") {
      const deletedExercise = await Exercise.findByIdAndDelete(id);
      if (!deletedExercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      return res
        .status(200)
        .json({ message: "Preset exercise deleted successfully" });
    } else {
      return res.status(403).json({
        message: "Unauthorized. Developers can only delete preset exercises.",
      });
    }
  } else {
    return res.status(403).json({
      message:
        "Unauthorized. Only coaches and developers can delete exercises.",
    });
  }
};

export {
  getSingleExercise,
  getAllExercises,
  postExercise,
  updateExercise,
  deleteExercise,
};
