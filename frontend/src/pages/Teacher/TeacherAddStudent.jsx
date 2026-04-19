/* eslint-disable no-unused-vars */
import React from "react";
import { useState } from "react";
import api from "../../util/axios";
import { useNavigate } from "react-router-dom";

const TeacherAddStudent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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

      const res = await api.post(
        "/api/user/register-student",
        formData,
        { withCredentials: true },
      );

      if (res.data.success) {
        setMessage("Student registered successfully ✅");

        setFormData({
          firstName: "",
          middleName: "",
          lastName: "",
          email: "",
        });
        setTimeout(() => {
          navigate("/teacher/students");
        }, 1000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to register student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Register Student
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
            {loading ? "Registering..." : "Register Student"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherAddStudent;
