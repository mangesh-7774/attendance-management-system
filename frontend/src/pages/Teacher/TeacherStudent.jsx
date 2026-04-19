/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { FaTrash, FaEdit } from "react-icons/fa";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const TeacherStudent = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        "http://localhost:8000/api/user/class-students",
        { withCredentials: true },
      );

      if (response.data.students) {
        setStudents(response.data.students);
      } else {
        setMessage(response.data.message);
      }
    } catch (error) {
      setMessage("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this student?",
      );

      if (!confirmDelete) return;

      const response = await axios.delete(
        `http://localhost:8000/api/user/delete-student/${studentId}`,
        { withCredentials: true },
      );

      if (response.data.success) {
        setStudents(students.filter((student) => student._id !== studentId));
      }
    } catch (error) {
      alert("Failed to delete student");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="pt-24 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-700">
          Students Management
        </h2>

        <Link to="/teacher/register-student">
          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg shadow transition">
            + Add Student
          </button>
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500">Loading students...</p>
        ) : message ? (
          <p className="p-6 text-red-500">{message}</p>
        ) : (
          <table className="w-full text-left">
            {/* Header */}
            <thead className="bg-gray-200 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-6 py-3">Roll No</th>
                <th className="px-6 py-3">Student Code</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Class</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody className="text-gray-700">
              {students.map((student) => (
                <tr
                  key={student._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-6 py-4">
                    {student.studentData?.rollNumber}
                  </td>

                  <td className="px-6 py-4">
                    {student.studentData?.studentCode}
                  </td>

                  <td className="px-6 py-4">
                    {student.firstName} {student.middleName} {student.lastName}
                  </td>

                  <td className="px-6 py-4">{student.email}</td>

                  <td className="px-6 py-4">{student.department}</td>

                  <td className="px-6 py-4">{student.className}</td>

                  <td className="px-6 py-4 flex justify-center gap-4">
                    <Link
                      to={`/teacher/update-student/${student._id}`}
                      className="cursor-pointer text-blue-600 hover:scale-110 transition"
                      title="Update Student"
                    >
                      <FiEdit />
                    </Link>

                    <button
                      onClick={() => handleDelete(student._id)}
                      className="cursor-pointer text-red-600 hover:scale-110 transition"
                      title="Delete Student"
                    >
                      <FiTrash2 />
                    </button>
                    
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

export default TeacherStudent;
