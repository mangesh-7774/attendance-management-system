import React from "react";
import { useState } from "react";
import api from "../../util/axios";
import { useNavigate } from "react-router-dom";

const AdminAddHoliday = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.reason) {
      setMessage("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post(
        "/api/holiday/add-holiday",
        formData,
        { withCredentials: true },
      );

      if (res.data.success) {
        setMessage("Holiday added successfully!");
        setFormData({ date: "", reason: "" });
        setTimeout(() => navigate("/admin/admin-calendar"), 1000);
      } else {
        setMessage(res.data.message || "Failed to add holiday");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-24 p-6 bg-gray-50 min-h-screen">
      <div className="bg-white  p-8 mt-12 rounded-xl shadow-md w-full max-w-md mx-auto">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Add Holiday
        </h2>

        {message && <p className="mb-4 text-green-600">{message}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-gray-600 mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1">Reason</label>
            <input
              type="text"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              placeholder="Enter reason for holiday"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => navigate("/admin/admin-calendar")}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
            >
              {loading ? "Adding..." : "Add Holiday"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAddHoliday;
