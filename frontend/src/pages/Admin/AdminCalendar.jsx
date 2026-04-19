/* eslint-disable no-unused-vars */
import api from "../../util/axios";
import React, { useEffect, useState } from "react";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const AdminCalendar = () => {
  const navigate = useNavigate();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (message) {
      setShowMessage(true);
      const timer = setTimeout(() => {
        setShowMessage(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await api.get(
        "/api/holiday/get-holidays",
        { withCredentials: true },
      );
      if (res.data.success) {
        setHolidays(res.data.holidays);
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      setMessage("Failed to fetch holidays");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this holiday?"))
      return;
    try {
      await api.delete(
        `/api/holiday/cancel-holiday/${id}`,
        { withCredentials: true },
      );
      fetchHolidays();
      setMessage("Holiday deleted successfully");
    } catch (err) {
      alert("Failed to delete holiday");
    }
  };

  return (
    <div className="pt-24 px-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Holidays</h2>
          <p className="text-gray-500 mt-1">Manage all college holidays</p>
        </div>

        {/* Message */}
        {message && (
          <p
            className={`mb-4 text-green-600 transition-opacity duration-500 ease-in-out ${
              showMessage ? "opacity-100" : "opacity-0"
            }`}
          >
            {message}
          </p>
        )}

        {/* Add Holiday */}
        <button
          onClick={() => navigate("/admin/add-holiday")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-semibold transition"
        >
          Add Holiday
        </button>
      </div>

      {/* Holidays Table */}
      <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
        {loading ? (
          <p className="p-6 text-gray-500">Loading...</p>
        ) : holidays.length === 0 ? (
          <p className="p-6 text-gray-500">No holidays found</p>
        ) : (
          <table className="min-w-max w-full table-fixed text-left">
            <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
              <tr>
                <th className="px-20 py-3 text-left">Date</th>
                <th className="px-20 py-3 text-left">Day</th>
                <th className="px-20 py-3 text-left">Reason</th>
                <th className="px-20 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {holidays.map((holiday) => (
                <tr
                  key={holiday._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-20 py-3">{holiday.date}</td>
                  <td className="px-20 py-3">{holiday.day}</td>
                  <td className="px-20 py-3">{holiday.reason}</td>
                  <td className="px-20 py-3 flex gap-2">

                    <FiEdit
                       onClick={() =>
                        navigate(`/admin/edit-holiday/${holiday._id}`)
                      }
                      className="cursor-pointer text-blue-600 hover:scale-110 transition"
                    />

                    {/* DELETE */}
                    <FiTrash2
                      onClick={() => handleDelete(holiday._id)}
                      className="cursor-pointer text-red-600 hover:scale-110 transition"
                    />
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

export default AdminCalendar;
