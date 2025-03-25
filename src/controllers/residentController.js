import { Resident } from "../models/residentModel.js";

const createResident = async (req, res) => {
  try {
    const newResident = new Resident(req.body);
    await newResident.save();
    res
      .status(201)
      .json({
        success: true,
        message: "Resident created successfully",
        data: newResident,
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getResidents = async (req, res) => {
  try {
    const residents = await Resident.find();
    res.status(200).json({ success: true, data: residents });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getResident = async (req, res) => {
  try {
    const resident = await Resident.findById(req.params.id);
    if (!resident) {
      return res
        .status(404)
        .json({ success: false, error: "Resident not found" });
    }
    res.status(200).json({ success: true, data: resident });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const updateResident = async (req, res) => {
  try {
    const updatedResident = await Resident.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedResident) {
      return res
        .status(404)
        .json({ success: false, error: "Resident not found" });
    }
    res
      .status(200)
      .json({
        success: true,
        message: "Resident updated successfully",
        data: updatedResident,
      });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const deleteResident = async (req, res) => {
  try {
    const deletedResident = await Resident.findByIdAndDelete(req.params.id);
    if (!deletedResident) {
      return res
        .status(404)
        .json({ success: false, error: "Resident not found" });
    }
    res
      .status(200)
      .json({ success: true, message: "Resident deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export {getResident, getResidents, createResident, updateResident, deleteResident}