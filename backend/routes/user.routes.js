import express from "express";
import {
  checkAdminExists,
  classStudents,
  deleteStudent,
  deleteTeacher,
  getAllStudents,
  getAllTeachers,
  loginUser,
  logOutUser,
  registerAdmin,
  registerStudent,
  registerTeacher,
  sendOtpToUser,
  setPassword,
  updateStudent,
  updateTeacher,
  verifyOtp,
} from "../controllers/user.controller.js";
import { verifyTempCookie } from "../middleware/verifyCookieToken.js";
import { isLogedinUser } from "../middleware/isLogedinUser.js";
import { isTeacher } from "../middleware/isTeacher.js";
import { isAdmin } from "../middleware/isAdmin.js";

const userRouter = express.Router();

userRouter.post("/register-admin", registerAdmin);
userRouter.get("/check-admin", checkAdminExists);
userRouter.post("/register-teacher", isLogedinUser, isAdmin, registerTeacher);
userRouter.put(
  "/update-teacher/:teacherId",
  isLogedinUser,
  isAdmin,
  updateTeacher,
);
userRouter.delete(
  "/delete-teacher/:teacherId",
  isLogedinUser,
  isAdmin,
  deleteTeacher,
);
userRouter.get("/get-all-students", isLogedinUser, isAdmin, getAllStudents);
userRouter.get("/get-all-teachers", isLogedinUser, isAdmin, getAllTeachers);

userRouter.post("/register-student", isLogedinUser, isTeacher, registerStudent);
userRouter.put(
  "/update-student/:studentId",
  isLogedinUser,
  isTeacher,
  updateStudent,
);
userRouter.delete(
  "/delete-student/:studentId",
  isLogedinUser,
  isTeacher,
  deleteStudent,
);
userRouter.get("/class-students", isLogedinUser, isTeacher, classStudents);

userRouter.post("/send-otp", sendOtpToUser);
userRouter.post("/verify-otp", verifyTempCookie, verifyOtp);
userRouter.post("/set-password", verifyTempCookie, setPassword);

userRouter.post("/login-user", loginUser);
userRouter.get("/logout-user", logOutUser);

export default userRouter;
