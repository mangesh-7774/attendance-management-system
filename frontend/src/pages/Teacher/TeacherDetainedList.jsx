import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";

const TeacherDetainedList = () => {
  const [criteria, setCriteria] = useState(75);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDetainedStudents = async (value = criteria) => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:8000/api/attendance/detained-list?criteria=${criteria}`,
        {
          params: { criteria: value },
          withCredentials: true,
        },
      );

      setStudents(res.data.students);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetainedStudents();
  }, []);

  const handleFilter = (e) => {
    const value = e.target.value;
    setCriteria(value);
    fetchDetainedStudents(value);
  };

  return (
    <div className="pt-24 p-8 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-gray-800">Detained List</h2>
          <p className="text-gray-500">
            Student list whose attendance is less than{" "}
            <span className="font-bold">{criteria}%</span>
          </p>
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200 w-fit">
          <label className="text-sm font-semibold text-gray-700">
            Show students below
          </label>

          <div className="relative">
            <select
              value={criteria}
              onChange={handleFilter}
              className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
            >
              <option value="75">75%</option>
              <option value="70">70%</option>
              <option value="65">65%</option>
              <option value="60">60%</option>
              <option value="50">50%</option>
            </select>

            {/* dropdown arrow */}
            <span className="absolute right-3 top-2.5 text-gray-500 pointer-events-none">
              ▼
            </span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-red-300/50 hover:bg-red-100">
            <tr>
              <th className="p-3 text-left">Student Name</th>
              <th className="p-3 text-left">Student Code</th>
              <th className="p-3 text-left">Present Days</th>
              <th className="p-3 text-left">Absent Days</th>
              <th className="p-3 text-left">Working Days</th>
              <th className="p-3 text-left">Percentage</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-6">
                  Loading...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center p-6">
                  No detained students found
                </td>
              </tr>
            ) : (
              students.map((student, index) => (
                <tr key={index} className="border-t">
                  <td className="p-3">{student.studentName}</td>

                  <td className="p-3">{student.studentCode}</td>

                  <td className="p-3">{student.presentDays}</td>

                  <td className="p-3">{student.absentDays}</td>

                  <td className="p-3">{student.workingDays}</td>

                  <td className="p-3 font-semibold text-red-500">
                    {student.percentage}%
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherDetainedList;
