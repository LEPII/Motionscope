import { CompDay, validateCompDay } from "../model/compDay.js";

const getSingleCompDay = async (req, res) => {
  const singleCompDay = await CompDay.findById(req.params.id);

  if (!singleCompDay) {
    return res.status(404).send("Competition day not found.");
  }

  res.send(singleCompDay);
};

const getAllCompDays = async (req, res) => {
  const allCompDays = await CompDay.find();
  res.send(allCompDays);
};

const postCompDay = async (req, res) => {
  const { error } = validateCompDay(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const savedCompDay = await new CompDay(req.body).save();
  res.status(201).send(savedCompDay);
};

const updateCompDay = async (req, res) => {
  const { error } = validateCompDay(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const updatedCompDay = await CompDay.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedCompDay) {
    return res.status(404).send("Competition day not found.");
  }

  res.status(200).send(updatedCompDay);
};

const deleteCompDay = async (req, res) => {
  const deletedCompDay = await CompDay.findByIdAndDelete(req.params.id);

  if (!deletedCompDay) {
    return res.status(404).send("Competition day not found.");
  }

  res.status(204).send();
};

export {
  getSingleCompDay,
  getAllCompDays,
  postCompDay,
  updateCompDay,
  deleteCompDay,
};
