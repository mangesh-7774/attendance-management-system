import axios from "axios";
import React, { useEffect, useState } from "react";

const PresentStudents = () => {
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
        const presentRecords = response.data.records.filter(
          (record) => record.status === "PRESENT",
        );

        setRecords(presentRecords);
      } else {
        setMessage(response.data.message);
      }
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      setMessage("Failed to fetch attendance records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  return (
    <div className="pt-24 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800">
          Today's Present Students
        </h2>
        <p className="text-gray-500 mt-1">
          Complete list of students marked present today
        </p>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500">Loading...</p>
        ) : message ? (
          <p className="p-6 text-red-500">{message}</p>
        ) : records.length === 0 ? (
          <p className="p-6 text-gray-500">No present students found</p>
        ) : (
          <table className="w-full text-left">
            {/* Table Head */}
            <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Student Code</th>
                <th className="px-6 py-4">Full Name</th>
                <th className="px-6 py-4">Class Name</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="text-gray-700">
              {records.map((record) => (
                <tr
                  key={record._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    {record.student?.studentData?.studentCode}
                  </td>

                  <td className="px-6 py-4">
                    {record.student?.firstName} {record.student?.middleName}{" "}
                    {record.student?.lastName}
                  </td>

                  <td className="px-6 py-4">{record.className || "N/A"}</td>

                  <td className="px-6 py-4">
                    {new Date(record.date).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-600">
                      PRESENT
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PresentStudents;
