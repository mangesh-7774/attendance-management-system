/* eslint-disable no-unused-vars */
import api from "../../util/axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const TeacherEditStudent = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchStudent = async () => {
    try {
      const res = await api.get(
        `/api/user/class-students`,
        { withCredentials: true },
      );

      const student = res.data.students.find((s) => s._id === studentId);

      if (student) {
        setFormData({
          firstName: student.firstName,
          middleName: student.middleName,
          lastName: student.lastName,
          email: student.email,
        });
      }
    } catch (error) {
      setMessage("Failed to load student data");
    }
  };

  useEffect(() => {
    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.put(
        `/api/user/update-student/${studentId}`,
        formData,
        { withCredentials: true },
      );

      if (res.data.success) {
        setMessage("Student updated successfully ✅");

        setTimeout(() => {
          navigate("/teacher/students");
        }, 1000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to update student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Update Student
        </h2>

        {message && <p className="mb-4 text-sm text-blue-600">{message}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <input
            type="text"
            name="middleName"
            placeholder="Middle Name"
            value={formData.middleName}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition"
          >
            {loading ? "Updating..." : "Update Student"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherEditStudent;
