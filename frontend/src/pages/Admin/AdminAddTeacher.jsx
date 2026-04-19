import axios from "axios";
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminAddTeacher = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    className: "",
    empolyeeId: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setIsError(false);

      const response = await axios.post(
        "http://localhost:8000/api/user/register-teacher",
        formData,
        { withCredentials: true },
      );

      if (response.data.success) {
        setMessage(response.data.message);

        setTimeout(() => {
          navigate("/admin/admin-teachers");
        }, 1000);
      }
    } catch (error) {
      setIsError(true);
      setMessage(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="pt-24 min-h-[100vh] bg-gray-50 flex items-center justify-center px-4">
        {/* Form Card */}
        <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-center text-indigo-600 mb-8">
            Add Teacher
          </h2>

          <form onSubmit={handleAddTeacher} className="space-y-6">
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                required
              />

              <input
                type="text"
                name="middleName"
                placeholder="Middle Name"
                value={formData.middleName}
                onChange={handleChange}
                className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
              />

              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                required
              />

              <input
                type="text"
                name="className"
                placeholder="Class Name"
                value={formData.className}
                onChange={handleChange}
                className="border px-4 py-2 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                required
              />
            </div>

            {/* Message */}
            {message && (
              <p
                className={`text-sm text-center ${
                  isError ? "text-red-500" : "text-green-600"
                }`}
              >
                {message}
              </p>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold transition"
            >
              {loading ? "Adding..." : "Add Teacher"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AdminAddTeacher;
