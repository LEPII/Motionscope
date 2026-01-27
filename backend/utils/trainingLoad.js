import { Exercise } from "../model/exercise.js";

const roundToNearest5 = (value) => {
  if (value == null) return null;
  return Math.round(value / 5) * 5;
};

export const percentOf = (pr, percent) => {
  if (pr == null || percent == null) return null;
  const raw = (pr * percent) / 100;
  return roundToNearest5(raw);
};

export const populateBlockTargetLoads = async (blockDoc, athleteProfile) => {
  if (!blockDoc?.blockSchedule || !athleteProfile?.oneRepMaxes) return;

  const oneRepMaxes = athleteProfile.oneRepMaxes;

  for (const week of blockDoc.blockSchedule || []) {
    for (const day of week.dailySchedule || []) {
      for (const ex of day.exercises || []) {
        const exercise = await Exercise.findById(ex.exerciseId).lean();
        if (!exercise || !exercise.prCategory) continue;

        const pr = oneRepMaxes[exercise.prCategory];
        if (!pr) continue; 

        for (const set of ex.setsDetail || []) {
          if (set.createdBy !== "coach") continue;

          if (set.prescribedLoadMin != null) {
            set.targetLoadMin = percentOf(pr, set.prescribedLoadMin);
          }

          if (set.prescribedLoad != null) {
            set.targetLoad = percentOf(pr, set.prescribedLoad);
          }
        }
      }
    }
  }
};