import Class from "../models/class.model.js";
import { User } from "../models/user.model.js";

export const getAllClass = async (req, res) => {
  try {
    const allClasses = await Class.find().populate(
      "teacher",
      "firstName lastName teacherData.empolyeeId"
    );

    return res.status(200).json({
      success: true,
      allClasses: allClasses || [], 
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};