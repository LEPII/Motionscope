const cloneWeek = (week) => {
  const plainWeek = week.toObject ? week.toObject() : JSON.parse(JSON.stringify(week));
  delete plainWeek._id;

  plainWeek.dailySchedule = (plainWeek.dailySchedule || []).map((day) => {
    const newDay = { ...day };
    delete newDay._id;

    if (newDay.exercises) {
      newDay.exercises = newDay.exercises.map((ex) => {
        const newEx = { ...ex };
        delete newEx._id;

        if (newEx.setsDetail) {
          newEx.setsDetail = newEx.setsDetail.map((set) => {
            const newSet = { ...set };
            delete newSet._id;
            return newSet;
          });
        }
        return newEx;
      });
    }
    return newDay;
  });

  return plainWeek;
};

const cloneDay = (day) => {
  const plainDay = day.toObject ? day.toObject() : JSON.parse(JSON.stringify(day));
  delete plainDay._id;

  if (plainDay.exercises) {
    plainDay.exercises = plainDay.exercises.map((ex) => {
      const newEx = { ...ex };
      delete newEx._id;

      if (newEx.setsDetail) {
        newEx.setsDetail = newEx.setsDetail.map((set) => {
          const newSet = { ...set };
          delete newSet._id;
          return newSet;
        });
      }
      return newEx;
    });
  }

  return plainDay;
};

const cloneExercise = (exercise) => {
  const plainEx = exercise.toObject ? exercise.toObject() : JSON.parse(JSON.stringify(exercise));
  delete plainEx._id;

  if (plainEx.setsDetail) {
    plainEx.setsDetail = plainEx.setsDetail.map((set) => {
      const newSet = { ...set };
      delete newSet._id;
      return newSet;
    });
  }

  return plainEx;
};