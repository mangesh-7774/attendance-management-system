/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { FiCalendar, FiSmile } from "react-icons/fi";

const StudentPresentDays = () => {
  const [presentRecords, setPresentRecords] = useState([]);
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
        const filtered = response.data.presentRecords.filter(
          (r) => dayjs(r.date).format("YYYY-MM") === month,
        );

        setPresentRecords(filtered);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage("Failed to fetch present records");
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
        <h2 className="text-3xl font-bold text-gray-800">Present Records</h2>

        {currentMonth && (
          <p className="text-gray-500 mt-1">
            Records for {dayjs(currentMonth + "-01").format("MMMM YYYY")}
          </p>
        )}
      </div>

      {/* Table */}
      {presentRecords.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-8 mb-10 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">
                  Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {presentRecords.map((record, idx) => (
                <tr key={idx} className="hover:bg-green-50 transition">
                  <td className="px-6 py-4 text-gray-800">{record.date}</td>
                  <td className="px-6 py-4 text-gray-600">{record.day}</td>
                  <td className="px-6 py-4 text-green-600 font-semibold">
                    {record.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-14 bg-white rounded-2xl shadow-md mb-10">
          <FiCalendar className="text-6xl text-green-400 mb-6" />

          <h3 className="text-2xl font-semibold text-gray-700 mb-2">
            No Present Records
          </h3>

          <p className="text-gray-500 mb-4 text-center px-4">
            No present attendance records for this month.
          </p>

          <FiSmile className="text-4xl text-green-300" />
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
                ? "bg-green-500 text-white border-green-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
            }`}
          >
            {dayjs(month + "-01").format("MMMM YYYY")}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudentPresentDays;
