import express from "express";
import {
  generateAttendanceReport,
  getAttendanceClasses,
  getAttendanceMonths,
  getAttendanceSummary,
  getStudentAttendanceSummary,
  getTeacherDetainedList,
  getTodaysAttenadanceOfAllStudents,
  getTodaysAttendanceForSpecificClass,
  markAttendance,
} from "../controllers/attendance.controller.js";
import { isLogedinUser } from "../middleware/isLogedinUser.js";
import { isTeacher } from "../middleware/isTeacher.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { isStudent } from "../middleware/isStudent.js";

import { downloadFormalReport } from "../controllers/attendance.controller.js";

const attendanceRouter = express.Router();

attendanceRouter.post(
  "/mark-attendance",
  isLogedinUser,
  isTeacher,
  markAttendance,
);
attendanceRouter.get(
  "/attendance-summary",
  isLogedinUser,
  isTeacher,
  getAttendanceSummary,
);
attendanceRouter.get(
  "/generate-attendance-report",
  isLogedinUser,
  isTeacher,
  generateAttendanceReport,
);
attendanceRouter.get(
  "/generate-attendance-report-admin",
  isLogedinUser,
  isAdmin,
  generateAttendanceReport,
);
attendanceRouter.get(
  "/generate-attendance-report-teacher",
  isLogedinUser,
  isTeacher,
  generateAttendanceReport,
);
attendanceRouter.get(
  "/generate-attendance-report-student",
  isLogedinUser,
  isStudent,
  generateAttendanceReport,
);
attendanceRouter.get(
  "/all-students-today-attendance",
  isLogedinUser,
  isAdmin,
  getTodaysAttenadanceOfAllStudents,
);
attendanceRouter.get(
  "/attendance-classes",
  isLogedinUser,
  isAdmin,
  getAttendanceClasses,
);
attendanceRouter.get(
  "/class-attendance",
  isLogedinUser,
  isTeacher,
  getTodaysAttendanceForSpecificClass,
);
attendanceRouter.get(
  "/detained-list",
  isLogedinUser,
  isTeacher,
  getTeacherDetainedList,
);

attendanceRouter.get(
  "/download-formal-report",
  isLogedinUser,
  downloadFormalReport,
);

attendanceRouter.get(
  "/featech-attenance-months",
  isLogedinUser,
  isStudent,
  getAttendanceMonths,
);

attendanceRouter.get(
  "/student-attendance-records",
  isLogedinUser,
  isStudent,
  getStudentAttendanceSummary,
);

export default attendanceRouter;
