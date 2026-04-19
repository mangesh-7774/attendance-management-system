/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import api from "../../util/axios";
import dayjs from "dayjs";
import { FiCalendar } from "react-icons/fi";

const StudentWorkingDays = () => {
  const [workingDays, setWorkingDays] = useState([]);
  const [months, setMonths] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchAttendanceMonths = async () => {
    try {
      const res = await api.get(
        "/api/attendance/featech-attenance-months",
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

  const fetchWorkingDays = async (month) => {
    try {
      setLoading(true);

      const response = await api.get(
        "/api/attendance/student-attendance-records",
        { withCredentials: true },
      );

      if (response.data.success) {
        const monthRecords = response.data.attendanceDetails.filter(
          (r) => dayjs(r.date).format("YYYY-MM") === month,
        );

        const formattedRecords = monthRecords.map((r) => ({
          date: r.date,
          day: r.day,
          status: "WORKING DAY",
        }));

        setWorkingDays(formattedRecords);
      }
    } catch (error) {
      setMessage("Failed to fetch working days");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceMonths();
  }, []);

  useEffect(() => {
    if (currentMonth) {
      fetchWorkingDays(currentMonth);
    }
  }, [currentMonth]);

  if (loading)
    return <p className="text-gray-500 mt-24 text-center">Loading...</p>;

  if (message)
    return <p className="text-red-500 mt-24 text-center">{message}</p>;

  return (
    <div className="pt-24 px-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Working Days</h2>
        {currentMonth && (
          <p className="text-gray-500 mt-1">
            Records for {dayjs(currentMonth + "-01").format("MMMM YYYY")}
          </p>
        )}
      </div>

      {/* TABLE */}
      {workingDays.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-8 mb-10 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">
                  Day
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {workingDays.map((record, index) => (
                <tr key={index} className="hover:bg-blue-50">
                  <td className="px-6 py-4 text-gray-800">{record.date}</td>
                  <td className="px-6 py-4 text-gray-600">{record.day}</td>
                  <td className="px-6 py-4 text-blue-600 font-semibold">
                    {record.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-18 bg-white rounded-2xl shadow-md mb-10">
          <FiCalendar className="text-6xl text-blue-400 mb-6" />
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">
            No Working Days
          </h3>
          <p className="text-gray-500 text-center">
            No attendance records for this month.
          </p>
        </div>
      )}

      {/* MONTH BUTTONS */}
      <div className="flex justify-center gap-3 flex-wrap">
        {months.map((month) => (
          <button
            key={month}
            onClick={() => setCurrentMonth(month)}
            className={`px-4 py-2 rounded-lg border transition
            ${
              currentMonth === month
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50"
            }`}
          >
            {dayjs(month + "-01").format("MMMM YYYY")}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudentWorkingDays;
