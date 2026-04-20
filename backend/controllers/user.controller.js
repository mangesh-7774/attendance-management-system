import { User } from "../models/user.model.js";
import nodemailer from "nodemailer";
import { createTempToken } from "../utils/temporaryToken.util.js";
import Class from "../models/class.model.js";
import { Attendance } from "../models/attendance.model.js";
import { getNextSequence } from "../utils/getNextSequence.js";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOtpToUser = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOTP();

    user.otp = otp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Verify your email - Attendance System",
      html: `<h3>Your OTP is : <b>${otp}</b></h3>`,
    });

    const tempToken = createTempToken(user._id);

    res.cookie("verifyToken", tempToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 10 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while sending OTP",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.otp !== otp.toString()) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while verifying OTP",
    });
  }
};

const setPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findById(req.userId);

    if (!user || !user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "User not found or email not verified",
      });
    }

    user.password = password;

    await user.save();

    res.clearCookie("verifyToken");

    return res.status(200).json({
      success: true,
      message: "Password set successfully",
    });
  } catch (error) {
    console.error("Set Password Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while setting password",
    });
  }
};

const registerAdmin = async (req, res) => {
  try {
    // STEP 1: check if admin already exists
    const existingAdmin = await User.findOne({ role: "ADMIN" });

    if (existingAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin already exists. Cannot create another admin.",
      });
    }

    const { firstName, middleName, lastName, email, department, empolyeeId } =
      req.body;

    if (
      !firstName ||
      !middleName ||
      !lastName ||
      !email ||
      !department ||
      !empolyeeId
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const admin = await User.create({
      firstName,
      middleName,
      lastName,
      email,
      role: "ADMIN",
      department,
      adminData: {
        empolyeeId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      admin,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const checkAdminExists = async (req, res) => {
  const admin = await User.findOne({ role: "ADMIN" });

  if (admin) {
    return res.json({ adminExists: true });
  }

  return res.json({ adminExists: false });
};

const registerTeacher = async (req, res) => {
  try {
    const adminDepartment = req.user.department;

    const { firstName, middleName, lastName, email, className } = req.body;

    if (!firstName || !middleName || !lastName || !email || !className) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const existingClass = await Class.findOne({ name: className });
    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: "Class already exists",
      });
    }

    const lastTeacher = await User.findOne({
      role: "TEACHER",
      "teacherData.empolyeeId": { $exists: true },
    }).sort({ "teacherData.empolyeeId": -1 });

    let nextId = 101;

    if (lastTeacher && lastTeacher.teacherData?.empolyeeId) {
      nextId = lastTeacher.teacherData.empolyeeId + 1;
    }

    const teacher = await User.create({
      firstName,
      middleName,
      lastName,
      email,
      role: "TEACHER",
      department: adminDepartment,
      teacherData: {
        empolyeeId: nextId,
      },
    });

    const newClass = await Class.create({
      name: className,
      teacher: teacher._id,
    });

    teacher.classId = newClass._id;
    teacher.className = className;

    await teacher.save();

    return res.status(201).json({
      success: true,
      message: "Teacher registered successfully",
      teacher,
      class: newClass,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate Employee ID or Email",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { firstName, middleName, lastName, email, className } = req.body;

    const teacher = await User.findById(teacherId);

    if (!teacher || teacher.role !== "TEACHER") {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    /* ================= EMAIL CHECK ================= */
    if (email) {
      const existingEmail = await User.findOne({
        email,
        _id: { $ne: teacherId },
      });

      if (existingEmail) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }

      teacher.email = email;
    }

    /* ================= UPDATE NAME ================= */
    if (firstName) teacher.firstName = firstName;
    if (middleName) teacher.middleName = middleName;
    if (lastName) teacher.lastName = lastName;

    /* ================= CLASS CHANGE ================= */
    if (className && className !== teacher.className) {
      // ❌ Remove teacher from old class
      if (teacher.classId) {
        await Class.findByIdAndUpdate(teacher.classId, {
          $unset: { teacher: "" },
        });
      }

      // ✅ Check if new class already exists
      let newClass = await Class.findOne({ name: className });

      if (newClass) {
        if (newClass.teacher) {
          return res.status(400).json({
            success: false,
            message: "This class already has a teacher",
          });
        }

        newClass.teacher = teacher._id;
        await newClass.save();
      } else {
        // ✅ Create new class if not exists
        newClass = await Class.create({
          name: className,
          teacher: teacher._id,
        });
      }

      // ✅ Update teacher
      teacher.classId = newClass._id;
      teacher.className = className;
    }

    await teacher.save();

    res.json({
      success: true,
      message: "Teacher updated successfully",
      teacher,
    });
  } catch (error) {
    console.error("Update Teacher Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating teacher",
    });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const teacher = await User.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // Delete class
    if (teacher.classId) {
      await Class.findByIdAndDelete(teacher.classId);
    }

    // Delete teacher
    await User.findByIdAndDelete(teacherId);

    res.json({
      success: true,
      message: "Teacher and class deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(401).json({
      success: false,
      message: "Both fields are required",
    });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  if (!user.password) {
    return res.status(400).json({
      success: false,
      message:
        "Password not set. Please verify email and create password first.",
    });
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }

  const token = user.generateToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password");

  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  return res.status(200).cookie("token", token, options).json({
    success: true,
    message: "User logged in successfully",
    user: loggedInUser,
  });
};

const logOutUser = (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200).clearCookie("token", options).json({
    success: true,
    message: "User logged out successfully",
  });
};

const registerStudent = async (req, res) => {
  try {
    const teacher = req.user;

    if (!teacher) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized user",
      });
    }

    const teacherDepartment = teacher.department;
    const teacherClassName = teacher.className;
    const teacherClassId = teacher.classId;

    if (!teacherClassId) {
      return res.status(400).json({
        success: false,
        message: "Teacher is not assigned to any class",
      });
    }

    const { firstName, middleName, lastName, email } = req.body;

    if (!firstName || !middleName || !lastName || !email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    let rollNumber = await getNextSequence(`roll_${teacherClassId}`);

    if (!rollNumber || rollNumber < 1) {
      rollNumber = 1;
    }

    if (rollNumber > 100) {
      return res.status(400).json({
        success: false,
        message: "This batch is full",
      });
    }

    const studentCode = 1000 + await getNextSequence("student_code");

    const student = await User.create({
      firstName,
      middleName,
      lastName,
      email: normalizedEmail,
      role: "STUDENT",
      department: teacherDepartment,
      className: teacherClassName,
      classId: teacherClassId,
      studentData: {
        rollNumber,
        studentCode,
      },
    });

    await Class.findByIdAndUpdate(
      teacherClassId,
      { $push: { students: student._id } },
      { new: true },
    );

    return res.status(201).json({
      success: true,
      message: "Student registered successfully",
      student,
    });
  } catch (error) {
    console.error("Register Student Error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate email or student code",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while registering student",
    });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { firstName, middleName, lastName, email } = req.body;

    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    const existingEmail = await User.findOne({
      email,
      _id: { $ne: studentId },
    });

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already in use by another student",
      });
    }

    student.firstName = firstName;
    student.middleName = middleName;
    student.lastName = lastName;
    student.email = email;

    await student.save();

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    console.error("Update Student Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    await Class.findByIdAndUpdate(student.classId, {
      $pull: { students: student._id },
    });

    await User.findByIdAndDelete(studentId);

    await Attendance.deleteMany({ student: studentId });

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getAllStudents = async (req, res) => {
  try {
    const allStudents = await User.find({ role: "STUDENT" });

    if (!allStudents || allStudents.length === 0) {
      return res.json({ success: false, message: "Students not found" });
    }

    return res.json({
      success: true,
      message: "Students featched successfully",
      allStudents,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const getAllTeachers = async (req, res) => {
  try {
    const allTeachers = await User.find({ role: "TEACHER" });

    if (!allTeachers || allTeachers.length === 0) {
      return res.json({ success: false, message: "Teachers not found" });
    }

    return res.json({
      success: true,
      message: "Teachers featched successfully",
      allTeachers,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const classStudents = async (req, res) => {
  try {
    const classId = req.user.classId;
    if (!classId) {
      return res
        .status(400)
        .json({ message: "Right now you are not assigned to any class" });
    }

    const students = await User.find({
      classId,
      role: "STUDENT",
    });

    return res
      .status(200)
      .json({ message: "Students featched successfully", students });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export {
  registerTeacher,
  updateTeacher,
  deleteTeacher,
  sendOtpToUser,
  verifyOtp,
  setPassword,
  loginUser,
  logOutUser,
  registerStudent,
  registerAdmin,
  getAllStudents,
  classStudents,
  getAllTeachers,
  updateStudent,
  deleteStudent,
  checkAdminExists,
};
