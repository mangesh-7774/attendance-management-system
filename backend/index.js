import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import userRouter from "./routes/user.routes.js";
import cookieParser from "cookie-parser";
import classRouter from "./routes/class.routes.js";
import attendanceRouter from "./routes/attendance.routes.js";
import holidayRouter from "./routes/holiday.routes.js";
import cors from "cors";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

//database connection
connectDB();

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/api/user", userRouter);
app.use("/api/class", classRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/holiday", holidayRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
