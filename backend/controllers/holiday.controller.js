import { Holiday } from "../models/holiday.model.js";

const addHoliday = async (req, res) => {
  try {
    const { date, reason } = req.body;

    const existingHoliday = await Holiday.findOne({ date });
    if (existingHoliday) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Holiday already created for this date",
        });
    }

    const dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const day = dayNames[new Date(date).getDay()];

    // Create holiday
    const holiday = await Holiday.create({
      date,
      day,
      reason,
    });

    res.json({
      success: true,
      message: "Holiday added successfully",
      holiday,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateHoliday = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, reason } = req.body;

    const holiday = await Holiday.findById(id);
    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }

    if (date && date !== holiday.date) {
      const existingHoliday = await Holiday.findOne({ date });
      if (existingHoliday) {
        return res.status(400).json({
          success: false,
          message: "Another holiday already exists for this date",
        });
      }
      holiday.date = date;
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      holiday.day = dayNames[new Date(date).getDay()];
    }

    if (reason) holiday.reason = reason;

    await holiday.save();

    res.json({
      success: true,
      message: "Holiday updated successfully",
      holiday,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteHoliday = async (req, res) => {
  try {
    const { id } = req.params;

    const holiday = await Holiday.findById(id);
    if (!holiday) {
      return res.status(404).json({
        success: false,
        message: "Holiday not found",
      });
    }

    await Holiday.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Holiday deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });

    res.json({
      success: true,
      holidays,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getHolidayById = async (req, res) => {
  try {
    const { id } = req.params;
    const holiday = await Holiday.findById(id);
    if (!holiday) {
      return res
        .status(404)
        .json({ success: false, message: "Holiday not found" });
    }
    res.json({ success: true, holiday });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getWorkingDays = async ({ startDate, endDate, list = false }) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const holidays = await Holiday.find({
    date: { $gte: start, $lte: end },
  }).lean();

  const holidaySet = new Set(
    holidays.map((h) => h.date.toISOString().split("T")[0])
  );

  let workingDates = [];

  let current = new Date(start);

  while (current <= end) {
    const day = current.getDay();
    const formattedDate = current.toISOString().split("T")[0];

    if (day === 0) {
      current.setDate(current.getDate() + 1);
      continue;
    }

    if (holidaySet.has(formattedDate)) {
      current.setDate(current.getDate() + 1);
      continue;
    }

    workingDates.push(formattedDate);

    current.setDate(current.getDate() + 1);
  }

  return list ? workingDates : workingDates.length;
};

export {
  addHoliday,
  getWorkingDays,
  deleteHoliday,
  updateHoliday,
  getHolidays,
  getHolidayById,
};
