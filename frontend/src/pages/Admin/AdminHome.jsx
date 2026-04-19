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
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AdminHome = () => {
  const navigate = useNavigate();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchAttendance = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:8000/api/attendance/all-students-today-attendance",
        { withCredentials: true },
      );

      if (response.data.success) {
        setRecords(response.data.records);
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

  // 🔥 Calculations
  const totalStudents = records.length;
  const presentCount = records.filter((r) => r.status === "PRESENT").length;
  const absentCount = records.filter((r) => r.status === "ABSENT").length;

  const presentPercentage =
    totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;

  const absentPercentage =
    totalStudents > 0 ? ((absentCount / totalStudents) * 100).toFixed(1) : 0;

  const chartData = [
    {
      name: "Today",
      Total: totalStudents,
      Present: presentCount,
      Absent: absentCount,
    },
  ];

  return (
    <div className="pt-24 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          Attendance Dashboard
        </h2>
        <p className="text-gray-500 mt-1">
          Today's attendance summary and visualization
        </p>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : message ? (
        <p className="text-red-500">{message}</p>
      ) : (
        <>
          {/* 🔥 Clickable Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Total */}
            <div
              onClick={() =>
                records.length > 0 &&
                navigate("/admin/admin-all-students-attendace")
              }
              className="cursor-pointer bg-white rounded-2xl shadow-md p-6 
                         border-l-4 border-indigo-500 hover:shadow-xl hover:scale-105 transition duration-300"
            >
              <p className="text-sm text-gray-500">
                Total Student's - (Present/Absent)
              </p>

              {records.length === 0 ? (
                <p className="text-sm text-red-500 mt-3">
                  Attendance not marked today
                </p>
              ) : (
                <h3 className="text-4xl font-bold mt-3 text-indigo-600">
                  {totalStudents}
                </h3>
              )}
            </div>

            {/* Present */}
            <div
              onClick={() =>
                records.length > 0 && navigate("/admin/admin-present-students")
              }
              className="cursor-pointer bg-white rounded-2xl shadow-md p-6 
                         border-l-4 border-green-500 hover:shadow-xl hover:scale-105 transition duration-300"
            >
              <p className="text-sm text-gray-500">Present Students</p>

              {records.length === 0 ? (
                <p className="text-sm text-red-500 mt-3">
                  Attendance not marked today
                </p>
              ) : (
                <>
                  <h3 className="text-4xl font-bold mt-3 text-green-600">
                    {presentCount}
                  </h3>
                  <p className="text-sm mt-2 text-gray-500">
                    {presentPercentage}% of total
                  </p>
                </>
              )}
            </div>

            {/* Absent */}
            <div
              onClick={() =>
                records.length > 0 && navigate("/admin/admin-absent-students")
              }
              className="cursor-pointer bg-white rounded-2xl shadow-md p-6 
                         border-l-4 border-red-500 hover:shadow-xl hover:scale-105 transition duration-300"
            >
              <p className="text-sm text-gray-500">Absent Students</p>

              {records.length === 0 ? (
                <p className="text-sm text-red-500 mt-3">
                  Attendance not marked today
                </p>
              ) : (
                <>
                  <h3 className="text-4xl font-bold mt-3 text-red-600">
                    {absentCount}
                  </h3>
                  <p className="text-sm mt-2 text-gray-500">
                    {absentPercentage}% of total
                  </p>
                </>
              )}
            </div>
          </div>

          {/* 📊 Chart Section */}
          <div className="bg-white rounded-2xl shadow-md p-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-6">
              Attendance Visualization
            </h3>

            <div className="w-full h-[400px] outline-none focus:outline-none">
              <ResponsiveContainer>
                <BarChart data={chartData} tabIndex={-1}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  {/* 🔥 Total Bar */}
                  <Bar dataKey="Total" fill="#6366f1" radius={[8, 8, 0, 0]} />

                  {/* Present Bar */}
                  <Bar dataKey="Present" fill="#16a34a" radius={[8, 8, 0, 0]} />

                  {/* Absent Bar */}
                  <Bar dataKey="Absent" fill="#dc2626" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminHome;
