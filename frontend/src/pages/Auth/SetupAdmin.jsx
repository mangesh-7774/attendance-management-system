import api from "../../util/axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const SetupAdmin = () => {
  const navigate = useNavigate();

  const [adminExists, setAdminExists] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    department: "",
    empolyeeId: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await api.get(
          "/api/user/check-admin",
        );

        if (res.data.adminExists) {
          setAdminExists(true);
        }
      } catch (error) {
        console.log(error);
      }
    };

    checkAdmin();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const res = await api.post(
        "/api/user/register-admin",
        formData,
      );

      setMessage(res.data.message);
      setIsError(false);

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      setIsError(true);
      setMessage(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-100 via-white to-indigo-200 px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
          System Admin Setup
        </h2>

        {adminExists ? (
          <div className="text-center space-y-4">
            <p className="text-red-500 font-medium">
              Admin already exists in the system.
            </p>

            <button
              onClick={() => navigate("/login")}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="text"
              name="middleName"
              placeholder="Middle Name"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="email"
              name="email"
              placeholder="Admin Email"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="text"
              name="department"
              placeholder="Department"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
            />

            <input
              type="text"
              name="empolyeeId"
              placeholder="Employee ID"
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-400"
            />

            {message && (
              <p
                className={`text-sm text-center ${isError ? "text-red-500" : "text-green-600"}`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold"
            >
              {loading ? "Creating Admin..." : "Create Admin"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SetupAdmin;
