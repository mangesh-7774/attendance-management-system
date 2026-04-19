import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const VerifyAccount = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const [loading, setLoading] = useState(false);

  const showMessage = (response) => {
    if (response.success) {
      setIsError(false);
      setMessage(response.message);
    } else {
      setIsError(true);
      setMessage(response.message);
    }

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleSendOtp = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8000/api/user/send-otp",
        { email },
        { withCredentials: true },
      );

      showMessage(res.data);

      if (res.data.success) {
        setStep(2);
      }
    } catch (error) {
      showMessage({
        success: false,
        message: error.response?.data?.message || "Failed to send OTP",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8000/api/user/verify-otp",
        { otp },
        { withCredentials: true },
      );

      showMessage(res.data);

      if (res.data.success) {
        setStep(3);
      }
    } catch (error) {
      showMessage({
        success: false,
        message: error.response?.data?.message || "OTP verification failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:8000/api/user/set-password",
        { password },
        { withCredentials: true },
      );

      showMessage(res.data);

      if (res.data.success) {
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      showMessage({
        success: false,
        message: error.response?.data?.message || "Failed to set password",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center text-indigo-600 mb-6">
          Verify Account
        </h2>

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Enter registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />

            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />

            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
            >
              {loading ? "Verifying OTP..." : "Verify OTP"}
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <input
              type="password"
              placeholder="Set password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded mb-4"
            />

            <button
              onClick={handleSetPassword}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              {loading ? "Setting Password..." : "Set Password"}
            </button>
          </>
        )}

        {message && (
          <div
            className={`mt-4 p-3 rounded text-center font-medium ${
              isError
                ? "bg-red-100 text-red-700 border border-red-300"
                : "bg-green-100 text-green-700 border border-green-300"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyAccount;
