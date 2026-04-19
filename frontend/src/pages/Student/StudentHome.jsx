/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const StudentHome = () => {
  const navigate = useNavigate();
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:8000/api/attendance/student-attendance-records",
        { withCredentials: true },
      );
      if (response.data.success) {
        setAttendance(response.data);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage("Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  if (loading)
    return <p className="text-gray-500 mt-24 text-center">Loading...</p>;
  if (message)
    return <p className="text-red-500 mt-24 text-center">{message}</p>;
  if (!attendance) return null;

  const {
    studentName,
    studentCode,
    workingDays,
    presentDays,
    absentDays,
    attendancePercentage,
  } = attendance;

  const chartData = [
    {
      name: "Attendance",
      Total: workingDays,
      Present: presentDays,
      Absent: absentDays,
    },
  ];

  return (
    <div className="pt-24 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">My Attendance</h2>
        <p className="text-gray-500 mt-1">
          Attendance summary for {studentName} (Code: {studentCode})
        </p>
      </div>

      {/* Clickable Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Total Working Days */}
        <div
          onClick={() => navigate("/student/working-days")}
          className="cursor-pointer bg-white rounded-2xl shadow-md p-6 border-l-4 border-indigo-500
                     hover:shadow-xl hover:scale-105 transition duration-300"
        >
          <p className="text-sm text-gray-500">Total Working Days</p>
          <h3 className="text-4xl font-bold mt-3 text-indigo-600">
            {workingDays}
          </h3>
        </div>

        {/* Present Days */}
        <div
          onClick={() => navigate("/student/present-days")}
          className="cursor-pointer bg-white rounded-2xl shadow-md p-6 border-l-4 border-green-500
                     hover:shadow-xl hover:scale-105 transition duration-300"
        >
          <p className="text-sm text-gray-500">Present Days</p>
          <h3 className="text-4xl font-bold mt-3 text-green-600">
            {presentDays}
          </h3>
          <p className="text-sm mt-2 text-gray-500">
            {attendancePercentage}% of total
          </p>
        </div>

        {/* Absent Days */}
        <div
          onClick={() => navigate("/student/absent-days")}
          className="cursor-pointer bg-white rounded-2xl shadow-md p-6 border-l-4 border-red-500
                     hover:shadow-xl hover:scale-105 transition duration-300"
        >
          <p className="text-sm text-gray-500">Absent Days</p>
          <h3 className="text-4xl font-bold mt-3 text-red-600">{absentDays}</h3>
          <p className="text-sm mt-2 text-gray-500">
            {((absentDays / workingDays) * 100).toFixed(2)}% of total
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-6">
          Attendance Visualization
        </h3>
        <div className="w-full h-[400px]">
          <ResponsiveContainer>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Total" fill="#6366f1" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Present" fill="#16a34a" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Absent" fill="#dc2626" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StudentHome;
