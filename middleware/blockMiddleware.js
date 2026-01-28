export default (req, res, next) => {
  const { numberOfWeeks, days, weeklySchedule } = req.body;

  if (numberOfWeeks !== weeklySchedule.length) {
    return res.status(400).json({ error: "Invalid number of weeks." });
  }
  for (const week of weeklySchedule) {
    if (days.length !== week.dailySchedule.length) {
      return res
        .status(400)
        .json({ error: "Invalid number of daily schedules" });
    }
  }

  next();
};
