import jwt from "jsonwebtoken";

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const createTempToken = (userId) =>
  jwt.sign({ userId, purpose: "EMAIL_VERIFY" }, process.env.JWT_SECRET, {
    expiresIn: "10m",
  });

export { generateOTP, createTempToken };
