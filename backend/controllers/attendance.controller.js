import { Attendance } from "../models/attendance.model.js";
import Class from "../models/class.model.js";
import { User } from "../models/user.model.js";
import { getWorkingDays } from "./holiday.controller.js";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { response } from "express";
import dayjs from "dayjs";

const markAttendance = async (req, res) => {
  try {
    const today = dayjs().format("YYYY-MM-DD");

    const classId = req.user.classId;
    const teacherId = req.user.userId;

    const teacher = await User.findById(teacherId);
    const className = teacher.className;

    const { students } = req.body;

    if (!students || students.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Students are required",
      });
    }

    /* ✅ CHECK WORKING DAY PROPERLY */
    const workingDates = await getWorkingDays({
      startDate: today,
      endDate: today,
      list: true,
    });

    if (!workingDates.includes(today)) {
      return res.status(400).json({
        success: false,
        message: "Today is not a working day",
      });
    }

    const alreadyMarked = await Attendance.findOne({
      classId,
      date: today,
    });

    if (alreadyMarked) {
      return res.status(400).json({
        success: false,
        message: "Attendance already marked for today",
      });
    }

    for (const s of students) {
      const student = await User.findOne({
        "studentData.studentCode": s.studentCode,
        classId,
        role: "STUDENT",
      });

      if (!student) continue;

      await Attendance.create({
        student: student._id,
        classId,
        className,
        date: today,
        status: s.status,
        markedBy: teacherId,
      });
    }

    res.json({
      success: true,
      message: "Attendance marked successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttendanceSummary = async (req, res) => {
  try {
    const classId = req.user.classId;

    const { date } = req.query;

    const selectedDate = date ? date : new Date().toISOString().split("T")[0];

    const records = await Attendance.find({
      classId,
      date: selectedDate,
    }).populate(
      "student",
      "firstName middleName lastName studentData.studentId",
    );

    if (!records || records.length === 0) {
      return res.status(404).json({
        message: "No attendance found",
      });
    }

    const present = records.filter((r) => r.status === "PRESENT");
    const absent = records.filter((r) => r.status === "ABSENT");

    res.json({
      success: true,
      date: selectedDate,
      totalStudents: records.length,
      presentCount: present.length,
      absentCount: absent.length,
      presentStudents: present,
      absentStudents: absent,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateAttendanceReport = async (req, res) => {
  try {
    const report = await buildAttendanceReport(req);

    if (report?.error) {
      return res.status(400).json({ message: report.message });
    }

    if (!report) {
      return res.status(404).json({ message: "No attendance data found" });
    }

    const { students, records, workingDays, startDate, endDate } = report;

    const studentReports = students.map((s) => {
      const studentRecords = records.filter(
        (r) => r.student?._id.toString() === s._id.toString(),
      );

      const presentDays = studentRecords.filter(
        (r) => r.status === "PRESENT",
      ).length;

      const absentDays = workingDays - presentDays;

      return {
        studentName: `${s.firstName} ${s.middleName || ""} ${s.lastName}`,
        studentCode: s.studentData.studentCode,
        presentDays,
        absentDays,
        workingDays,
        percentage:
          workingDays > 0
            ? ((presentDays / workingDays) * 100).toFixed(2)
            : "0.00",
      };
    });

    res.json({
      success: true,
      startDate,
      endDate,
      workingDays,
      totalStudents: students.length,
      studentReports,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttendanceClasses = async (req, res) => {
  try {
    const classes = await Attendance.aggregate([
      {
        $group: {
          _id: "$classId",
          className: { $first: "$className" },
        },
      },
    ]);

    res.json({
      success: true,
      classes: classes.map((c) => ({
        classId: c._id,
        className: c.className,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTodaysAttenadanceOfAllStudents = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const records = await Attendance.find({ date: today }).populate(
      "student",
      "firstName middleName lastName studentData.studentCode classId",
    );
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTodaysAttendanceForSpecificClass = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const classId = req.user.classId;
    const records = await Attendance.find({
      date: today,
      classId: classId,
    }).populate(
      "student",
      "firstName middleName lastName studentData.rollNumber studentData.studentCode classId",
    );

    res.json({
      success: true,
      total: records.length,
      records,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const buildAttendanceReport = async (req) => {
  const { role, userId, classId: teacherClassId } = req.user;
  let { startDate, endDate, classId } = req.query;

  // Default endDate
  if (!endDate) {
    endDate = dayjs().format("YYYY-MM-DD");
  }

  let students = [];
  let baseQuery = {};

  /* ================= ROLE HANDLING ================= */

  if (role === "ADMIN") {
    if (classId && classId !== "ALL") {
      students = await User.find({ role: "STUDENT", classId });
      baseQuery.classId = classId;
    } else {
      students = await User.find({ role: "STUDENT" });
    }
  } else if (role === "TEACHER") {
    students = await User.find({
      role: "STUDENT",
      classId: teacherClassId,
    });

    baseQuery.classId = teacherClassId;
  } else if (role === "STUDENT") {
    const student = await User.findById(userId);
    if (!student) return null;

    students = [student];
    baseQuery.student = student._id;
  }

  /* ================= GET FIRST ATTENDANCE DATE ================= */

  const firstRecord = await Attendance.findOne(baseQuery).sort({ date: 1 });

  if (!firstRecord) return null;

  const firstAttendanceDate = firstRecord.date.toISOString().split("T")[0];

  // ✅ IMPORTANT FIX: adjust startDate
  if (!startDate || new Date(startDate) < new Date(firstAttendanceDate)) {
    startDate = firstAttendanceDate;
  }

  /* ================= FINAL QUERY ================= */

  const attendanceQuery = {
    ...baseQuery,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };

  const records = await Attendance.find(attendanceQuery)
    .populate("student")
    .lean();

  /* ================= WORKING DAYS ================= */

  const workingDays = await getWorkingDays({
    startDate,
    endDate,
  });

  return {
    students,
    records,
    workingDays,
    startDate,
    endDate,
  };
};

const downloadFormalReport = async (req, res) => {
  try {
    let className = "";
    let teacherName = "";

    let classId = req.query.classId;

    if (req.user.role === "TEACHER") {
      classId = req.user.classId;
    }

    if (classId && classId !== "ALL") {
      const classData = await Class.findById(classId).populate("teacher");

      if (classData) {
        className = classData.name;

        if (classData.teacher) {
          teacherName = `${classData.teacher.firstName} ${classData.teacher.lastName}`;
        }
      }
    }

    const { type } = req.query;

    const report = await buildAttendanceReport(req);

    if (report?.error) {
      return res.status(400).json({ message: report.message });
    }

    if (!report) {
      return res.status(404).json({ message: "No report data" });
    }

    const { students, records, workingDays, startDate, endDate } = report;

    /* ================= STUDENT REPORT ================= */

    const studentReports = students.map((s) => {
      const studentRecords = records.filter(
        (r) => r.student?._id.toString() === s._id.toString(),
      );

      const presentDays = studentRecords.filter(
        (r) => r.status === "PRESENT",
      ).length;

      const absentDays = workingDays - presentDays;

      return {
        studentName: `${s.firstName} ${s.middleName || ""} ${s.lastName}`,
        studentCode: s.studentData?.studentCode || "-",
        presentDays,
        absentDays,
        percentage: ((presentDays / workingDays) * 100).toFixed(2),
      };
    });

    /* ================= OVERALL PERCENTAGE ================= */

    let totalPresent = 0;

    studentReports.forEach((s) => {
      totalPresent += s.presentDays;
    });

    const totalStudents = studentReports.length;

    const overallPercentage = (
      (totalPresent / (workingDays * totalStudents)) *
      100
    ).toFixed(2);

    const collegeName = "MGM's College of CS & IT , Nanded - 431601";

    /* ================= PDF ================= */

    if (type === "pdf") {
      const doc = new PDFDocument({ margin: 40 });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=attendance_report.pdf",
      );

      doc.pipe(res);

      /* ---------- HEADER ---------- */

      doc
        .font("Helvetica-Bold")
        .fontSize(18)
        .text(collegeName, { align: "center" });

      doc.font("Helvetica");

      doc.moveDown();

      if (className) {
        doc.fontSize(12).text(`Class : ${className}`);
        doc.text(`Teacher : ${teacherName}`);
        doc.moveDown();
      }

      doc.text(`Date Range : ${startDate} to ${endDate}`);
      doc.text(`Working Days : ${workingDays}`);

      doc.moveDown();

      /* ---------- OVERALL PERCENTAGE ---------- */

      doc
        .font("Helvetica-Bold")
        .fontSize(12)
        .text(`Overall Attendance Percentage : ${overallPercentage}%`);

      doc.moveDown();

      /* ---------- TABLE SETTINGS ---------- */

      const tableTop = doc.y;

      const col1 = 40;
      const col2 = 110;
      const col3 = 310;
      const col4 = 380;
      const col5 = 450;

      const width1 = 70;
      const width2 = 200;
      const width3 = 70;
      const width4 = 70;
      const width5 = 90;

      const rowHeight = 25;

      let y = tableTop;

      /* ---------- HEADER ROW ---------- */

      doc.font("Helvetica-Bold");

      doc.rect(col1, y, width1, rowHeight).stroke();
      doc.text("S.Code", col1 + 5, y + 8, { width: width1 - 10 });

      doc.rect(col2, y, width2, rowHeight).stroke();
      doc.text("Name", col2 + 5, y + 8, { width: width2 - 10 });

      doc.rect(col3, y, width3, rowHeight).stroke();
      doc.text("Present", col3 + 5, y + 8, {
        width: width3 - 10,
        align: "center",
      });

      doc.rect(col4, y, width4, rowHeight).stroke();
      doc.text("Absent", col4 + 5, y + 8, {
        width: width4 - 10,
        align: "center",
      });

      doc.rect(col5, y, width5, rowHeight).stroke();
      doc.text("Percentage", col5 + 5, y + 8, {
        width: width5 - 10,
        align: "center",
      });

      y += rowHeight;

      doc.font("Helvetica");

      /* ---------- TABLE DATA ---------- */

      studentReports.forEach((s) => {
        doc.rect(col1, y, width1, rowHeight).stroke();
        doc.text(s.studentCode, col1 + 5, y + 8, { width: width1 - 10 });

        doc.rect(col2, y, width2, rowHeight).stroke();
        doc.text(s.studentName, col2 + 5, y + 8, { width: width2 - 10 });

        doc.rect(col3, y, width3, rowHeight).stroke();
        doc.text(String(s.presentDays), col3 + 5, y + 8, {
          width: width3 - 10,
          align: "center",
        });

        doc.rect(col4, y, width4, rowHeight).stroke();
        doc.text(String(s.absentDays), col4 + 5, y + 8, {
          width: width4 - 10,
          align: "center",
        });

        doc.rect(col5, y, width5, rowHeight).stroke();
        doc.text(`${s.percentage}%`, col5 + 5, y + 8, {
          width: width5 - 10,
          align: "center",
        });

        y += rowHeight;

        if (y > 720) {
          doc.addPage();
          y = 50;
        }
      });

      /* ---------- SIGNATURE SECTION ---------- */

      doc.moveDown(4);

      const signY = doc.y;
      doc.font("Helvetica-Bold");

      const role = req.user.role;
      const selectedClass = req.query.classId;

      /* ================= ADMIN + ALL CLASSES ================= */

      if (role === "ADMIN" && selectedClass === "ALL") {
        // HOD
        doc.text("_________________________", 60, signY);
        doc.text("Signature (HOD)", 60, signY + 20);
        doc.text("Bhopi Mam", 60, signY + 35);

        // Principal
        doc.text("_________________________", 420, signY);
        doc.text("Signature (Principal)", 420, signY + 20);
        doc.text("Mr. Kotgire Sir", 420, signY + 35);
      } else if (role === "ADMIN" && className) {
        /* ================= ADMIN + SPECIFIC CLASS ================= */
        // Class Teacher
        doc.text("_________________________", 60, signY);
        doc.text("Signature (Class Teacher)", 60, signY + 20);
        doc.text(teacherName, 60, signY + 35);

        // HOD
        doc.text("_________________________", 260, signY);
        doc.text("Signature (HOD)", 260, signY + 20);
        doc.text("Bhopi Mam", 260, signY + 35);

        // Principal
        doc.text("_________________________", 460, signY);
        doc.text("Signature (Principal)", 460, signY + 20);
        doc.text("Mr. Kotgire Sir", 460, signY + 35);
      } else if (role === "TEACHER") {
        /* ================= TEACHER LOGIN ================= */
        // Class Teacher
        doc.moveTo(60, signY).lineTo(180, signY).stroke();
        doc.text("Signature (Class Teacher)", 60, signY + 10);
        doc.text(teacherName, 60, signY + 25);
        console.log("Teacher Name:", teacherName);

        // HOD
        doc.moveTo(240, signY).lineTo(360, signY).stroke();
        doc.text("Signature (HOD)", 240, signY + 10);
        doc.text("Bhopi Mam", 240, signY + 25);

        // Principal
        doc.moveTo(420, signY).lineTo(520, signY).stroke();
        doc.text("Signature (Principal)", 420, signY + 10);
        doc.text("Mr. Kotgire Sir", 420, signY + 25);
      }

      doc.end();
    } else if (type === "excel") {
      /* ================= EXCEL ================= */
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet("Attendance Report");

      sheet.addRow([collegeName]);
      sheet.addRow([]);

      if (className) {
        sheet.addRow([`Class : ${className}`]);
        sheet.addRow([`Teacher : ${teacherName}`]);
        sheet.addRow([]);
      }

      sheet.addRow([`Date Range : ${startDate} - ${endDate}`]);
      sheet.addRow([`Working Days : ${workingDays}`]);

      sheet.addRow([]);

      sheet.addRow(["S.Code", "Name", "Present", "Absent", "Percentage"]);

      studentReports.forEach((s) => {
        sheet.addRow([
          s.studentCode,
          s.studentName,
          s.presentDays,
          s.absentDays,
          `${s.percentage}%`,
        ]);
      });

      sheet.addRow([]);

      sheet.addRow(["", "", "", "Overall %", `${overallPercentage}%`]);

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=attendance_report.xlsx",
      );

      await workbook.xlsx.write(res);

      res.end();
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.message });
  }
};

const getTeacherDetainedList = async (req, res) => {
  try {
    const classId = req.user.classId;
    const criteria = Number(req.query.criteria) || 75;

    const firstRecord = await Attendance.findOne({ classId }).sort({ date: 1 });

    if (!firstRecord) {
      return res.status(404).json({
        message: "No attendance records found",
      });
    }

    const startDate = firstRecord.date.toISOString().split("T")[0];
    const endDate = dayjs().format("YYYY-MM-DD");

    const workingDays = await getWorkingDays({
      startDate,
      endDate,
    });

    const students = await User.find({
      role: "STUDENT",
      classId,
    });

    const records = await Attendance.find({
      classId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    })
      .populate("student")
      .lean();

    const studentReports = students.map((s) => {
      const studentRecords = records.filter(
        (r) => r.student?._id.toString() === s._id.toString(),
      );

      const presentDays = studentRecords.filter(
        (r) => r.status === "PRESENT",
      ).length;

      const absentDays = workingDays - presentDays;

      const percentage =
        workingDays > 0
          ? Number(((presentDays / workingDays) * 100).toFixed(2))
          : 0;

      return {
        studentName: `${s.firstName} ${s.middleName || ""} ${s.lastName}`,
        studentCode: s.studentData.studentCode,
        presentDays,
        absentDays,
        workingDays,
        percentage,
      };
    });

    const detainedStudents = studentReports.filter(
      (s) => s.percentage < criteria,
    );

    res.json({
      success: true,
      criteria,
      workingDays,
      totalStudents: students.length,
      detainedCount: detainedStudents.length,
      students: detainedStudents,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStudentAttendanceSummary = async (req, res) => {
  try {
    const userId = req.user.userId;

    const student = await User.findById(userId);
    if (!student || student.role !== "STUDENT") {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    let { startDate, endDate } = req.query;

    if (!startDate) {
      const firstRecord = await Attendance.findOne({ student: userId }).sort({
        date: 1,
      });

      startDate = firstRecord
        ? firstRecord.date.toISOString().split("T")[0]
        : dayjs().format("YYYY-MM-DD");
    }

    if (!endDate) endDate = dayjs().format("YYYY-MM-DD");

    /* ✅ GET WORKING DATES */
    const workingDates = await getWorkingDays({
      startDate,
      endDate,
      list: true,
    });

    const records = await Attendance.find({
      student: userId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    }).lean();

    const attendanceMap = {};

    records.forEach((r) => {
      const dateStr = r.date.toISOString().split("T")[0];
      attendanceMap[dateStr] = r.status;
    });

    const attendanceDetails = workingDates.map((dateStr) => {
      const dayName = new Date(dateStr).toLocaleDateString("en-US", {
        weekday: "long",
      });

      return {
        date: dateStr,
        day: dayName,
        status: attendanceMap[dateStr] || "ABSENT",
      };
    });

    const presentDays = attendanceDetails.filter(
      (d) => d.status === "PRESENT",
    ).length;

    const absentDays = attendanceDetails.length - presentDays;

    res.json({
      success: true,
      studentName: `${student.firstName} ${student.middleName || ""} ${student.lastName}`,
      studentCode: student.studentData?.studentCode,
      startDate,
      endDate,
      workingDays: workingDates.length,
      presentDays,
      absentDays,
      attendancePercentage:
        workingDates.length > 0
          ? ((presentDays / workingDates.length) * 100).toFixed(2)
          : "0.00",
      attendanceDetails,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttendanceMonths = async (req, res) => {
  try {
    const userId = req.user.userId;

    const student = await User.findById(userId);
    if (!student || student.role !== "STUDENT") {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const records = await Attendance.find({ student: userId })
      .select("date")
      .lean();

    if (!records || records.length === 0) {
      return res.json({ success: true, months: [] });
    }

    const monthsSet = new Set(
      records.map((r) => dayjs(r.date).format("YYYY-MM")),
    );

    const sortedMonths = Array.from(monthsSet).sort(
      (a, b) => dayjs(b).unix() - dayjs(a).unix(),
    );

    res.json({ success: true, months: sortedMonths });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  markAttendance,
  getAttendanceSummary,
  generateAttendanceReport,
  getTodaysAttenadanceOfAllStudents,
  getAttendanceClasses,
  downloadFormalReport,
  getTodaysAttendanceForSpecificClass,
  getTeacherDetainedList,
  getStudentAttendanceSummary,
  getAttendanceMonths,
};
