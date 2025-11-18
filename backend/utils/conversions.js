export const lbsToKg = (lbs) => {
  if (lbs == null) return null;
  return +(lbs / 2.20462).toFixed(2);
};

export const kgToLbs = (kg) => {
  if (kg == null) return null;
  return +(kg * 2.20462).toFixed(2);
};