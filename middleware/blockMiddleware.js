// Cross-field checks Joi can't express on its own. Runs after validate(), so field types are already checked.
// On PATCH, any of these fields may be missing, so each check only runs when its fields are present.
export default (req, res, next) => {
  const { numberOfWeeks, days, blockSchedule } = req.body;

  if (!blockSchedule) return next();

  const errors = [];

  if (numberOfWeeks !== undefined && numberOfWeeks !== blockSchedule.length) {
    errors.push(
      `'blockSchedule' must have ${numberOfWeeks} weeks to match 'numberOfWeeks'.`
    );
  }

  if (
    days &&
    blockSchedule.some(
      (week) => week.dailySchedule && week.dailySchedule.length !== days.length
    )
  ) {
    errors.push(
      `Each week's 'dailySchedule' must have ${days.length} days to match 'days'.`
    );
  }

  if (errors.length) {
    return res
      .status(400)
      .json({ message: "Validation failed.", details: errors });
  }

  next();
};
