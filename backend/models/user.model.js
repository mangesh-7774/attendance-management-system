import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: [6, "Password must be at least 6 characters long"],
  },
  role: {
    type: String,
    required: true,
    enum: {
      values: ["STUDENT", "TEACHER", "ADMIN"],
    },
  },
  profileImage: {
    type: String,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: Date,
  },
  token: {
    type: String,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
  },
  department: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    sparse: true,
  },
  studentData: {
    rollNumber: { type: Number },
    studentCode: { type: Number, unique: true, sparse: true },
    parentEmail: { type: String, unique: true, sparse: true },
  },
  teacherData: {
    empolyeeId: { type: Number, unique: true },
  },
  adminData: {
    empolyeeId: { type: String, unique: true, sparse: true },
  },
});

userSchema.index({ "studentData.rollNumber": 1 });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      userId: this._id,
      role: this.role,
      department: this.department,
      className: this.className,
      classId: this.classId,
    },
    process.env.TOKEN_SECRET,
    {
      expiresIn: process.env.TOKEN_EXPIRY,
    },
  );
};

export const User = mongoose.model("User", userSchema);
