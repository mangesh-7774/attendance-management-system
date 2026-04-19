/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { FiCalendar } from "react-icons/fi";

const StudentAttendance = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [months, setMonths] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchAttendanceMonths = async () => {
    try {
      const res = await axios.get(
        "http://localhost:8000/api/attendance/featech-attenance-months",
        { withCredentials: true },
      );

      if (res.data.success) {
        const fetchedMonths = res.data.months;

        setMonths(fetchedMonths);

        if (fetchedMonths.length > 0) {
          setCurrentMonth(fetchedMonths[0]);
        }
      }
    } catch (error) {
      console.log(error);
      setMessage("Failed to fetch attendance months");
    }
  };

  const fetchAttendance = async (month) => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:8000/api/attendance/student-attendance-records",
        { withCredentials: true },
      );

      if (response.data.success) {
        const monthRecords = response.data.attendanceDetails
          .filter((r) => dayjs(r.date).format("YYYY-MM") === month)
          .sort((a, b) => (dayjs(b.date).isAfter(dayjs(a.date)) ? 1 : -1));

        setAttendanceRecords(monthRecords);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage("Failed to fetch attendance records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceMonths();
  }, []);

  useEffect(() => {
    if (currentMonth) {
      fetchAttendance(currentMonth);
    }
  }, [currentMonth]);

  if (loading)
    return <p className="text-gray-500 mt-24 text-center">Loading...</p>;

  if (message)
    return <p className="text-red-500 mt-24 text-center">{message}</p>;

  return (
    <div className="pt-24 px-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Monthly Attendance</h2>

        {currentMonth && (
          <p className="text-gray-500 mt-1">
            Records for {dayjs(currentMonth + "-01").format("MMMM YYYY")}
          </p>
        )}
      </div>

      {/* Table */}
      {attendanceRecords.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-8 mb-10 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Date
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Day
                </th>

                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceRecords.map((record, idx) => (
                <tr
                  key={idx}
                  className={`hover:bg-gray-50 transition ${
                    record.status === "PRESENT"
                      ? "bg-green-50/20"
                      : "bg-red-50/20"
                  }`}
                >
                  <td className="px-6 py-4 text-gray-800 font-medium">
                    {record.date}
                  </td>

                  <td className="px-6 py-4 text-gray-600">{record.day}</td>

                  <td
                    className={`px-6 py-4 font-semibold ${
                      record.status === "PRESENT"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {record.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl shadow-md mb-10">
          <FiCalendar className="text-6xl text-gray-400 mb-6" />

          <h3 className="text-2xl font-semibold text-gray-700 mb-2">
            No Records
          </h3>

          <p className="text-gray-500 text-center">
            There are no attendance records for this month.
          </p>
        </div>
      )}

      {/* Month Buttons */}
      <div className="flex justify-center gap-3 flex-wrap">
        {months.map((month) => (
          <button
            key={month}
            onClick={() => setCurrentMonth(month)}
            className={`px-4 py-2 rounded-lg border transition
            ${
              currentMonth === month
                ? "bg-gray-800 text-white border-gray-800"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {dayjs(month + "-01").format("MMMM YYYY")}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudentAttendance;
