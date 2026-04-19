import express from "express";
import {
  addHoliday,
  deleteHoliday,
  getHolidayById,
  getHolidays,
  getWorkingDays,
  updateHoliday,
} from "../controllers/holiday.controller.js";

const holidayRouter = express.Router();

holidayRouter.post("/add-holiday", addHoliday);
holidayRouter.get("/working-days", getWorkingDays);
holidayRouter.delete("/cancel-holiday/:id", deleteHoliday);
holidayRouter.put("/update-holiday/:id", updateHoliday);
holidayRouter.get("/get-holidays", getHolidays);
holidayRouter.get("/:id", getHolidayById);

export default holidayRouter;
