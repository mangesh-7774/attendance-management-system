import axios from "axios";
import React from "react";
import { Link, useNavigate } from "react-router-dom";

const StudentHeader = () => {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const firstName = storedUser?.firstName || "Admin";
  const lastName = storedUser?.lastName || "";

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/user/logout",
        {},
        { withCredentials: true },
      );

      localStorage.clear();
      sessionStorage.clear();

      navigate("/");
    } catch (error) {
      console.log("Logout error:", error);

      localStorage.clear();
      sessionStorage.clear();
      navigate("/");
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md px-8 py-3 flex items-center justify-between z-50">
      {/* Left Section */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-indigo-600 tracking-wide">
          AttendanceMGMT
        </h1>

        <span className="text-xs text-gray-500 mt-1">
          {firstName} {lastName}
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-8 text-gray-700 font-medium">
        <Link
          to="/student/student-home"
          className="hover:text-indigo-600 transition"
        >
          Home
        </Link>

        <Link
          to="/student/student-attendance"
          className="hover:text-indigo-600 transition"
        >
          Attendance
        </Link>

        <Link
          to="/student/student-report"
          className="hover:text-indigo-600 transition"
        >
          Reports
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default StudentHeader;
