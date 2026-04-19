/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import api from "../../util/axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [step, setStep] = useState("login");

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const res = await api.get("/api/user/check-admin");

      if (!res.data.adminExists) {
        navigate("/setup-admin");
      }
    };

    checkAdmin();
  }, []);

  const handleUserLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await api.post(
        "/api/user/login-user",
        { email, password },
        { withCredentials: true },
      );

      const data = response.data;

      localStorage.setItem("user", JSON.stringify(data.user));

      const role = data.user.role;

      if (role === "ADMIN") navigate("/admin/admin-home");
      else if (role === "TEACHER") navigate("/teacher/home");
      else navigate("/student/student-home");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    try {
      setLoading(true);

      const res = await api.post(
        "/api/user/send-otp",
        { email },
        { withCredentials: true },
      );

      setMessage(res.data.message);
      setIsError(false);
      setStep("otp");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send OTP");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);

      const res = await api.post(
        "/api/user/verify-otp",
        { otp },
        { withCredentials: true },
      );

      setMessage(res.data.message);
      setIsError(false);
      setStep("password");
    } catch (error) {
      setMessage(error.response?.data?.message || "OTP verification failed");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const setPasswordHandler = async () => {
    try {
      setLoading(true);

      const res = await api.post(
        "/api/user/set-password",
        { password: newPassword },
        { withCredentials: true },
      );

      setMessage(res.data.message);
      setIsError(false);

      setTimeout(() => setStep("login"), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || "Password setup failed");
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-indigo-200 px-4">
      <div className="flex gap-6 w-full max-w-4xl items-stretch">
        {/* LOGIN CARD */}
        <div className="w-full h-[72vh] bg-white shadow-2xl rounded-2xl p-8 flex flex-col justify-center">
          <div>
            <h2 className="text-3xl font-bold text-center text-indigo-600 mb-8">
              Attendance Login
            </h2>

            {/* LOGIN */}
            {step === "login" && (
              <form onSubmit={handleUserLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-0"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-0"
                />

                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg">
                  Login
                </button>

                <p
                  className="text-center text-sm text-indigo-600 cursor-pointer"
                  onClick={() => setStep("email")}
                >
                  First time login? Set Password
                </p>
              </form>
            )}

            {/* EMAIL */}
            {step === "email" && (
              <div className="space-y-4">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-0"
                />

                <button
                  onClick={sendOtp}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg"
                >
                  Send OTP
                </button>

                <p
                  className="text-center text-sm text-gray-500 cursor-pointer"
                  onClick={() => setStep("login")}
                >
                  ← Back to Login
                </p>
              </div>
            )}

            {/* OTP */}
            {step === "otp" && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-0"
                />

                <button
                  onClick={verifyOtp}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg"
                >
                  Verify OTP
                </button>

                <p
                  className="text-center text-sm text-gray-500 cursor-pointer"
                  onClick={() => setStep("login")}
                >
                  ← Back to Login
                </p>
              </div>
            )}

            {/* PASSWORD */}
            {step === "password" && (
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Create Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-0"
                />

                <button
                  onClick={setPasswordHandler}
                  className="w-full bg-indigo-600 text-white py-2 rounded-lg"
                >
                  Set Password
                </button>

                <p
                  className="text-center text-sm text-gray-500 cursor-pointer"
                  onClick={() => setStep("login")}
                >
                  ← Back to Login
                </p>
              </div>
            )}
          </div>

          {message && (
            <p
              className={`text-sm text-center mt-4 ${isError ? "text-red-500" : "text-green-600"}`}
            >
              {message}
            </p>
          )}
        </div>

        {/* DEMO CARD */}
        <div className="w-full h-[72vh] bg-white shadow-2xl rounded-2xl px-6 py-4 pt-10 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              🚀 Demo Accounts
            </h3>
            <p className="text-xs text-gray-500">Quick login access</p>
          </div>

          {/* FLEX CARDS (AUTO FIT) */}
          <div className="flex flex-col gap-2 flex-1 justify-center">
            {/* ADMIN */}
            <div className="p-2 border rounded-lg flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-semibold text-indigo-600">Admin</h4>
                <p className="text-xs text-gray-600">admin@gmail.com</p>
                <p className="text-xs text-gray-600">123456</p>
              </div>

              <button
                onClick={() => {
                  setEmail("admin@gmail.com");
                  setPassword("123456");
                }}
                className="mt-1 text-[10px] bg-indigo-100 text-indigo-600 px-2 py-[2px] rounded"
              >
                Auto Fill
              </button>
            </div>

            {/* TEACHER */}
            <div className="p-2 border rounded-lg flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-semibold text-green-600">
                  Teacher
                </h4>
                <p className="text-xs text-gray-600">teacher@gmail.com</p>
                <p className="text-xs text-gray-600">123456</p>
              </div>

              <button
                onClick={() => {
                  setEmail("teacher@gmail.com");
                  setPassword("123456");
                }}
                className="mt-1 text-[10px] bg-green-100 text-green-600 px-2 py-[2px] rounded"
              >
                Auto Fill
              </button>
            </div>

            {/* STUDENT */}
            <div className="p-2 border rounded-lg flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-semibold text-orange-600">
                  Student
                </h4>
                <p className="text-xs text-gray-600">student@gmail.com</p>
                <p className="text-xs text-gray-600">123456</p>
              </div>

              <button
                onClick={() => {
                  setEmail("student@gmail.com");
                  setPassword("123456");
                }}
                className="mt-1 text-[10px] bg-orange-100 text-orange-600 px-2 py-[2px] rounded"
              >
                Auto Fill
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
