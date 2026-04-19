/* eslint-disable no-unused-vars */
import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const TeacherAttendance = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [message, setMessage] = useState("");
  const [errorStudent, setErrorStudent] = useState(null);
  const [loading, setLoading] = useState(false);

  const messageRef = useRef(null);

  useEffect(() => {
    if (message && messageRef.current) {
      messageRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [message]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/user/class-students",
        { withCredentials: true },
      );

      const sortedStudents = res.data.students.sort(
        (a, b) => a.studentData.rollNumber - b.studentData.rollNumber,
      );

      setStudents(sortedStudents);
    } catch (err) {
      setMessage("Failed to load students");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const markStatus = (id, status) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: status,
    }));
  };

  const presentCount = students.filter(
    (s) => attendance[s._id] === "PRESENT",
  ).length;

  const absentCount = students.filter(
    (s) => attendance[s._id] === "ABSENT",
  ).length;

  const markedCount = presentCount + absentCount;

  const progress =
    students.length > 0 ? (markedCount / students.length) * 100 : 0;

  const handleSubmit = async () => {
    const unmarked = students.find((s) => !attendance[s._id]);

    if (unmarked) {
      setErrorStudent(unmarked._id);
      setMessage("Mark attendance for all students");

      setTimeout(() => {
        setMessage("");
        setErrorStudent(null);
      }, 2000);

      return;
    }

    const payload = {
      students: students.map((s) => ({
        studentCode: s.studentData.studentCode,
        status: attendance[s._id],
      })),
    };

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8000/api/attendance/mark-attendance",
        payload,
        { withCredentials: true },
      );

      if (res.data.success) {
        setMessage("Attendance submitted successfully ✅");

        setTimeout(() => {
          setMessage("");
          setAttendance({});
        }, 2000);
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setMessage(error.response.data.message);
      } else {
        setMessage("Failed to submit attendance");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-gray-50 p-6">
      {/* Header */}

      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Mark Today's Attendance
        </h2>
        <p className="text-gray-500">Mark attendance quickly</p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span>Progress</span>

          <span>
            {markedCount} / {students.length}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div
            ref={messageRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 p-3 bg-indigo-100 text-indigo-700 rounded-lg"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {students.map((student) => {
          const id = student._id;
          const status = attendance[id];

          return (
            <motion.div
              key={id}
              whileHover={{ backgroundColor: "#f9fafb" }}
              className={`flex items-center justify-between px-6 py-4 border-b transition
              ${errorStudent === id ? "bg-red-50" : ""}
            `}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
                  {student.firstName.charAt(0)}
                </div>

                <div>
                  <p className="font-medium text-gray-800">
                    {student.firstName} {student.middleName} {student.lastName}
                  </p>

                  <p className="text-xs text-gray-400">
                    Roll No: {student.studentData.rollNumber} - Code:{" "}
                    {student.studentData.studentCode}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => markStatus(id, "PRESENT")}
                  className={`px-4 py-1 rounded-full text-sm font-medium transition
                  ${
                    status === "PRESENT"
                      ? "bg-green-600 text-white"
                      : "bg-green-100 text-green-700"
                  }
                `}
                >
                  Present
                </button>

                <button
                  onClick={() => markStatus(id, "ABSENT")}
                  className={`px-4 py-1 rounded-full text-sm font-medium transition
                  ${
                    status === "ABSENT"
                      ? "bg-red-600 text-white"
                      : "bg-red-100 text-red-700"
                  }
                `}
                >
                  Absent
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Present:{" "}
          <span className="text-green-600 font-semibold">{presentCount}</span> •
          Absent:{" "}
          <span className="text-red-600 font-semibold">{absentCount}</span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl shadow-md font-semibold"
        >
          {loading ? "Submitting..." : "Submit Attendance"}
        </button>
      </div>
    </div>
  );
};

export default TeacherAttendance;
