import { Block } from "../model/block.js";
// import { Exercise } from "../model/exercise.js";

/// -- COACH'S ENDPOINTS --

const getSingleBlock = async (req, res) => {
  const singleBlock = await Block.findById(req.params.id);
  res.send(singleBlock);
};

const getAllBlocks = async (req, res) => {
  const allBlocks = await Block.find();
  res.send(allBlocks);
};

// const postBlock = async (req, res) => {
//   // const { error, value } = validateBlock.validate(req.body);

//   if (error) {
//     return res.status(400).json({ error: error.details[0].message });
//   }

//   const {
//     coach,
//     athlete,
//     blockName,
//     numberOfWeeks,
//     blockStartDate,
//     days,
//     weeklySchedule,
//   } = value;

//   // Batch Fetching All Custom Exercises
//   const customExercises = await CustomExercise.find();
//   const customExerciseMap = new Map(
//     customExercises.map((exercise) => [exercise._id.toString(), exercise])
//   );

//   // Batch Fetching All Preset Exercises
//   const presetExercises = await PresetExercise.find();
//   const presetExerciseMap = new Map(
//     customExercises.map((exercise) => [exercise._id.toString(), exercise])
//   );

//   const newExercise = weeklySchedule.map((week) => {
//     week.dailySchedule.map((dailySchedule) => {
//       dailySchedule.customExercises.map((exercise) => {
//         if (exercise.presetId) {
//           const presetExercise = presetExerciseMap.get(
//             exercise.presetId.toString()
//           );
//           if (!presetExercise) {
//             throw new Error(
//               `Preset exercise with ID ${exercise.presetId} not founds`
//             );
//           }
//           return new CustomExercise({
//             name: presetExercise.name,
//             description: presetExercise.description,
//             sets: exercise.sets,
//             repsMin: exercise.repsMin || 0,
//             reps: exercise.reps,
//             prescribedLoadMin: exercise.prescribedLoadMin || 0,
//             prescribedLoad: exercise.prescribedLoad,
//             prescribedRPEMin: exercise.prescribedRPEMin || 0,
//             prescribedRPE: exercise.prescribedRPE,
//             cuesFromCoach: exercise.cuesFromCoach || "",
//             sideNote: exercise.sideNote || "",
//           });
//         } else if (exercise.CustomExerciseId) {
//           const customExercise = customExerciseMap.get(
//             exercise.customExerciseId.toString()
//           );
//           if (!customExercise) {
//             throw new Error(
//               `Custom exercise with ID ${exercise.customExerciseId} not found`
//             );
//           }
//           return new CustomExercise({
//             name: customExercise.name,
//             description: customExercise.description,
//             sets: exercise.sets,
//             repsMin: exercise.repsMin || 0,
//             reps: exercise.reps,
//             prescribedLoadMin: exercise.prescribedLoadMin || 0,
//             prescribedLoad: exercise.prescribedLoad,
//             prescribedRPEMin: exercise.prescribedRPEMin || 0,
//             prescribedRPE: exercise.prescribedRPE,
//             cuesFromCoach: exercise.cuesFromCoach || "",
//             sideNote: exercise.sideNote || "",
//           });
//         } else {
//           throw new Error("Invalid exercise type provided");
//         }
//       });
//     });
//   });

//   const newBlock = new Block({
//     blockName,
//     numberOfWeeks,
//     blockStartDate,
//     days,
//     weeklySchedule: weeklySchedule.map((week) => ({
//       weekStartDate: week.weekStartDate,
//       dailySchedule: week.dailySchedule.map((dailySchedule) => ({
//         primaryExercise: dailySchedule.primaryExercise,
//         customExercises: newExercise,
//       })),
//     })),
//   });

//   const savedBlock = await newBlock.save();
//   res
//     .status(201)
//     .json({ message: "Block Successfully Created", data: savedBlock });
// };

const immutableFieldsForCoaches = [
  "actualLoad",
  "actualRPEMin",
  "actualRPE",
  "sideNote",
];

const updateBlock = async (req, res) => {
  try {
    const { blockId } = req.params;
    const {
      blockName,
      numberOfWeeks,
      blockStartDate,
      days,
      customExerciseUpdates,
    } = req.body;

    const block = await Block.findById(blockId);

    if (!block) {
      return res.status(404).json({ message: "Block not found" });
    }

    if (blockName) block.blockName = blockName;
    if (numberOfWeeks) block.numberOfWeeks = numberOfWeeks;
    if (blockStartDate) block.blockStartDate = blockStartDate;
    if (days) block.days = days;

    if (customExerciseUpdates) {
      customExerciseUpdates.forEach((update) => {
        const { weekIndex, dayIndex, exerciseIndex, field, newValue } = update;

        if (!immutableFieldsForCoaches.includes(field)) {
          block.weeklySchedule[weekIndex].dailySchedule[
            dayIndex
          ].customExercises[exerciseIndex][field] = newValue;
        } else {
          return res.status(400).json({
            message: `Cannot edit field: ${field}. Only actualLoad, actualRPEMin, actualRPE, sideNote are editable.`,
          });
        }
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

//
const deleteBlock = async (req, res) => {};
//

const postTemplateBlock = async (req, res) => {
  try {
    const { name, numberOfWeeks, blockStartDate, days, customExercises } =
      req.body;

    const newBlock = new Block({
      name,
      numberOfWeeks,
      blockStartDate,
      days,
    });

    if (customExercises) {
      newBlock.weeklySchedule = customExercises.map((week) => ({
        weekStartDate: week.weekStartDate,
        dailySchedule: week.dailySchedule.map((day) => ({
          dayOfWeek: day.dayOfWeek,
          customExercises: day.customExercises.map((exercise) => {
            const allowedExercise = {};
            for (const key in exercise) {
              if (!immutableFieldsForCoaches.includes(key)) {
                allowedExercise[key] = exercise[key];
              }
            }
            return allowedExercise;
          }),
        })),
      }));
    }

    await newBlock.save();

    res.status(201).json(newBlock);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

/// -- ATHLETE'S ENDPOINTS --

const getCurrentBlock = async (req, res) => {
  const singleBlock = await Block.findById(req.params.id);
  res.send(singleBlock);
};
const getAllAthleteBlocks = async (req, res) => {
  const allBlocks = await Block.find();
  res.send(allBlocks);
};

const updateAthleteBlock = async (req, res) => {
  try {
    const { blockId } = req.params;
    const exerciseUpdates = req.body;

    const block = await Block.findById(blockId);

    if (!block) {
      return res.status(400).json({ error: "Block not found" });
    }

    exerciseUpdates.forEach((update) => {
      const { weekIndex, dayIndex, exerciseIndex, field, newValue } = update;

      if (
        ["actualLoad", "actualRPEMin", "actualRPE", "sideNote"].includes(field)
      ) {
        block.weeklySchedule[weekIndex].dailySchedule[dayIndex].customExercises[
          exerciseIndex
        ][field] = newValue;
      } else {
        return res.status(400).json({
          message: `Cannot edit field: ${field}. Only actualLoad, actualRPEMin, actualRPE, sideNote are editable.`,
        });
      }
    });

    await block.save();

    res
      .status(200)
      .json({ message: "Exercise updated successfully", currentExercise });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update exercise" });
  }
};

export {
  getSingleBlock,
  getAllBlocks,
  // postBlock,
  updateBlock,
  deleteBlock,
  postTemplateBlock,
  getCurrentBlock,
  getAllAthleteBlocks,
  updateAthleteBlock,
};
