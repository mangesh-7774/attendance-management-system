/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { FiCalendar, FiSmile } from "react-icons/fi";

const StudentReport = () => {
  const [reportData, setReportData] = useState({});
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

  const fetchReport = async (month) => {
    try {
      setLoading(true);
      setMessage("");

      const startDate = dayjs(month + "-01")
        .startOf("month")
        .format("YYYY-MM-DD");

      const endDate =
        month === dayjs().format("YYYY-MM")
          ? dayjs().format("YYYY-MM-DD")
          : dayjs(month + "-01")
              .endOf("month")
              .format("YYYY-MM-DD");

      const response = await axios.get(
        `http://localhost:8000/api/attendance/generate-attendance-report-student?startDate=${startDate}&endDate=${endDate}`,
        { withCredentials: true },
      );

      if (response.data.success) {
        setReportData((prev) => ({
          ...prev,
          [month]: response.data.studentReports,
        }));
      } else {
        setReportData((prev) => ({ ...prev, [month]: [] }));
      }
    } catch (error) {
      setReportData((prev) => ({ ...prev, [month]: [] }));
      setMessage("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceMonths();
  }, []);

  useEffect(() => {
    if (currentMonth) {
      fetchReport(currentMonth);
    }
  }, [currentMonth]);

  const studentReports = reportData[currentMonth] || [];

  const hasAttendance =
    studentReports.length > 0 &&
    studentReports.some((student) => student.presentDays > 0);

  if (loading)
    return <p className="text-gray-500 mt-24 text-center">Loading...</p>;

  if (message)
    return <p className="text-red-500 mt-24 text-center">{message}</p>;

  return (
    <div className="pt-24 px-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Monthly Attendance Report
      </h2>

      <div className="mb-6">
        {currentMonth && (
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            {dayjs(currentMonth + "-01").format("MMMM YYYY")}
          </h3>
        )}

        {hasAttendance ? (
          <div className="bg-white rounded-2xl shadow-md p-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-center">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase">
                    Student Name
                  </th>

                  <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase">
                    Student Code
                  </th>

                  <th className="px-6 py-3 text-xs font-medium text-green-700 uppercase">
                    Present Days
                  </th>

                  <th className="px-6 py-3 text-xs font-medium text-red-700 uppercase">
                    Absent Days
                  </th>

                  <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase">
                    Working Days
                  </th>

                  <th className="px-6 py-3 text-xs font-medium text-gray-700 uppercase">
                    Percentage
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {studentReports.map((student, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-800 font-medium">
                      {student.studentName}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {student.studentCode}
                    </td>

                    <td className="px-6 py-4 text-green-600 font-semibold">
                      {student.presentDays}
                    </td>

                    <td className="px-6 py-4 text-red-600 font-semibold">
                      {student.absentDays}
                    </td>

                    <td className="px-6 py-4 text-gray-800">
                      {student.workingDays}
                    </td>

                    <td className="px-6 py-4 text-gray-800">
                      {student.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 bg-white rounded-2xl shadow-md">
            <FiCalendar className="text-6xl text-gray-400 mb-4" />

            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No Attendance Records
            </h3>

            <p className="text-gray-500 text-center px-6">
              Attendance was not taken for this month.
            </p>

            <FiSmile className="text-4xl text-gray-300 mt-2" />
          </div>
        )}
      </div>

      {/* Month Buttons */}
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

export default StudentReport;
