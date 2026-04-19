import React, { useEffect, useState } from "react";
import api from "../../util/axios";
import { saveAs } from "file-saver";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminReports = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await api.get(
          "/api/attendance/attendance-classes",
          { withCredentials: true },
        );
        setClasses(res.data.classes);
      } catch {
        console.log("Failed to fetch classes");
      }
    };
    fetchClasses();
  }, []);

  const generateReport = async () => {
    if (!selectedClass || !startDate || !endDate) {
      alert("Please select class and date range");
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);
      setErrorMessage("");

      const res = await api.get(
        "/api/attendance/generate-attendance-report-admin",
        {
          params: { classId: selectedClass, startDate, endDate },
          withCredentials: true,
        },
      );
      setReport(res.data);
    } catch (err) {
      setReport(null);
      setErrorMessage(
        err.response?.data?.message || "Failed to generate report",
      );
    } finally {
      setLoading(false);
    }
  };

  // Download PDF
  const downloadPDF = async () => {
    if (!selectedClass || !startDate || !endDate) return;
    try {
      const res = await api.get(
        "/api/attendance/download-formal-report",
        {
          params: { classId: selectedClass, startDate, endDate, type: "pdf" },
          responseType: "blob",
          withCredentials: true,
        },
      );
      saveAs(
        new Blob([res.data], { type: "application/pdf" }),
        `attendance_report_${startDate}_to_${endDate}.pdf`,
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Download Excel
  const downloadExcel = async () => {
    if (!selectedClass || !startDate || !endDate) return;
    try {
      const res = await api.get(
        "/api/attendance/download-formal-report",
        {
          params: { classId: selectedClass, startDate, endDate, type: "excel" },
          responseType: "blob",
          withCredentials: true,
        },
      );
      saveAs(
        new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `attendance_report_${startDate}_to_${endDate}.xlsx`,
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Summary calculations
  const totalPresent = report
    ? report.studentReports.reduce((sum, s) => sum + s.presentDays, 0)
    : 0;
  const totalAbsent = report
    ? report.studentReports.reduce((sum, s) => sum + s.absentDays, 0)
    : 0;
  const overallPercentage =
    report && report.studentReports.length > 0
      ? (
          (totalPresent / (report.totalStudents * report.workingDays)) *
          100
        ).toFixed(2)
      : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-8 pt-24">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Attendance Reports
          </h1>
          <p className="text-gray-500">
            Generate and analyze attendance performance
          </p>
        </div>

        {/* Error */}
        {errorMessage && (
          <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-6">
            {errorMessage}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col md:flex-row items-center gap-4 mb-6">
          {/* Class */}
          <div className="flex-1 min-w-[180px]">
            <label className="text-gray-500 text-sm font-medium mb-1 block">
              Select Class
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Choose class</option>
              <option value="ALL">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.classId} value={cls.classId}>
                  {cls.className}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="flex-1 min-w-[150px]">
            <label className="text-gray-500 text-sm font-medium mb-1 block">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* End Date */}
          <div className="flex-1 min-w-[150px]">
            <label className="text-gray-500 text-sm font-medium mb-1 block">
              End Date
            </label>
            <input
              type="date"
              min={startDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-1 md:flex-row flex-col md:gap-2 gap-2 justify-end items-center">
            <button
              onClick={generateReport}
              className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-full font-semibold text-sm md:text-base transition duration-200 w-full md:w-auto md:flex-[2]"
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>

            <button
              onClick={downloadPDF}
              disabled={!report}
              className={`bg-red-600 text-white py-2 rounded-full font-semibold text-sm md:text-base transition duration-200 w-full md:w-auto flex-1
                ${!report ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"}`}
            >
              PDF
            </button>

            <button
              onClick={downloadExcel}
              disabled={!report}
              className={`bg-green-600 text-white py-2 rounded-full font-semibold text-sm md:text-base transition duration-200 w-full md:w-auto flex-1
                ${!report ? "opacity-50 cursor-not-allowed" : "hover:bg-green-700"}`}
            >
              Excel
            </button>
          </div>
        </div>

        {/* Summary Charts */}
        {report && report.studentReports.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-4 mb-6 flex flex-wrap gap-4 justify-around">
            <MiniRingChart
              label="Total Present"
              value={totalPresent}
              total={report.totalStudents * report.workingDays}
              color="#22c55e"
            />
            <MiniRingChart
              label="Total Absent"
              value={totalAbsent}
              total={report.totalStudents * report.workingDays}
              color="#ef4444"
            />
            <MiniRingChart
              label="Attendance %"
              value={overallPercentage}
              total={100}
              color="#3b82f6"
            />
          </div>
        )}

        {/* Table */}
        {report && report.studentReports.length > 0 && (
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 text-sm uppercase text-gray-600">
                <tr>
                  <th className="p-4">Student Code</th>
                  <th className="p-4">Name</th>
                  <th className="p-4">Present</th>
                  <th className="p-4">Absent</th>
                  <th className="p-4">Percentage</th>
                </tr>
              </thead>
              <tbody>
                {report.studentReports.map((student, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-4">{student.studentCode}</td>
                    <td className="p-4">{student.studentName}</td>
                    <td className="p-4 text-green-600 font-semibold">
                      {student.presentDays}
                    </td>
                    <td className="p-4 text-red-600 font-semibold">
                      {student.absentDays}
                    </td>
                    <td className="p-4 font-semibold">{student.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!hasSearched && (
          <div className="mt-6 p-6 bg-gray-50 rounded-2xl text-gray-500 text-center">
            Select class and date range, then click{" "}
            <strong>Generate Report</strong> to see attendance details.
          </div>
        )}
      </div>
    </div>
  );
};

const MiniRingChart = ({ label, value, total, color }) => {
  const data = {
    labels: ["Filled", "Empty"],
    datasets: [
      {
        data: [value, total - value],
        backgroundColor: [color, "#e5e7eb"],
        borderWidth: 0,
      },
    ],
  };
  const options = {
    cutout: "65%",
    plugins: { legend: { display: false } },
    animation: { animateRotate: true },
  };

  return (
    <div className="flex items-center gap-4 w-56 p-2">
      <div className="w-20 h-20">
        <Doughnut data={data} options={options} />
      </div>
      <div className="flex flex-col">
        <p className="text-gray-700 font-semibold text-base">{label}</p>
        <p className="text-gray-800 font-bold text-lg">
          {label === "Attendance %" ? `${value}%` : value}
        </p>
      </div>
    </div>
  );
};

export default AdminReports;
