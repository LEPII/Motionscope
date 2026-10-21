import { Exercise } from "../model/exercise.js";

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

const getExercises = async (req, res) => {
  const { role, _id: userId } = req.user;

  const {
    search = "",
    muscleGroup,
    movementPattern,
    loadTypeEquipment,
    typeOfExercise,
    sortField = "name",
    sortOrder = "asc",
    page = 1,
    limit = 50,
  } = req.query;

  const query = {};

  if (role === "coach") {
    query.$or = [{ type: "custom", createdBy: userId }, { type: "preset" }];
  } else if (role === "developer") {
    query.$or = [{ type: "preset" }, { type: "custom", createdBy: userId }];
  } else {
    return res.status(403).json({ message: "Unauthorized" });
  }

  if (search) {
    query.name = { $regex: search, $options: "i" };
  }

  if (muscleGroup) query.muscleGroup = { $in: muscleGroup.split(",") };
  if (movementPattern)
    query.movementPattern = { $in: movementPattern.split(",") };
  if (loadTypeEquipment)
    query.loadTypeEquipment = { $in: loadTypeEquipment.split(",") };
  if (typeOfExercise) query.typeOfExercise = typeOfExercise;

  const sortOption = { [sortField]: sortOrder === "asc" ? 1 : -1 };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const exercises = await Exercise.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Exercise.countDocuments(query);

  res.json({
    exercises,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  });
};

const postExercise = async (req, res) => {

  const {
    name,
    description,
    muscleGroup,
    type,
    movementPattern,
    loadTypeEquipment,
    typeOfExercise,
    unilateralBilateral,
  } = req.body;
  const { role, _id: userId } = req.user;

  if (!name) {
    return res.status(400).json({ message: "Name is required." });
  }

  const allowedProperties = [
    "name",
    "description",
    "muscleGroup",
    "type",
    "movementPattern",
    "loadTypeEquipment",
    "typeOfExercise",
    "unilateralBilateral",
  ];
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
    newExercise = {
      name,
      description,
      muscleGroup,
      type,
      typeOfExercise,
      movementPattern,
      loadTypeEquipment,
      unilateralBilateral,
      createdBy: userId,
    };
  } else if (role === "coach") {
    if (type !== "custom") {
      return res.status(403).json({
        message: "Coaches can only post exercises of type 'custom'.",
      });
    }
    newExercise = {
      name,
      description,
      muscleGroup,
      type,
      typeOfExercise,
      movementPattern,
      loadTypeEquipment,
      unilateralBilateral,
      createdBy: userId,
    };
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

  const exerciseId = req.params.id;
  const user = req.user;

  const exerciseToUpdate = await Exercise.findById(exerciseId);

  if (!exerciseToUpdate) {
    return res.status(404).send("Exercise not found");
  }

  const allowedFields = [
    "name",
    "description",
    "muscleGroup",
    "typeOfExercise",
    "movementPattern",
    "loadTypeEquipment",
    "unilateralBilateral",
  ];

  const updates = Object.keys(req.body)
    .filter((key) => allowedFields.includes(key))
    .reduce((obj, key) => {
      obj[key] = req.body[key];
      return obj;
    }, {});

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
      exerciseToUpdate.createdBy?.equals(user._id)
    ) {
      const updatedExercise = await Exercise.findByIdAndUpdate(
        exerciseId,
        { $set: updates },
        { new: true, runValidators: true }
      );
      return res.send(updatedExercise);
    } else {
      return res
        .status(403)
        .send(
          "Unauthorized. Coaches can only edit their own custom exercises."
        );
    }
  } else if (user.role === "developer") {
    if (exerciseToUpdate.type === "preset") {
      const updatedExercise = await Exercise.findByIdAndUpdate(
        exerciseId,
        { $set: updates },
        { new: true, runValidators: true }
      );
      return res.send(updatedExercise);
    } else {
      return res
        .status(403)
        .send("Unauthorized. Developers can only edit preset exercises.");
    }
  } else {
    return res
      .status(403)
      .send("Unauthorized. Only coaches and developers can update exercises.");
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
  getExercises,
  postExercise,
  updateExercise,
  deleteExercise,
};
