/* eslint-disable no-unused-vars */
import api from "../../util/axios";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, User, Calendar } from "lucide-react";

const AdminAllClasses = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setStatus("");

      const res = await api.get(
        "/api/class/all-classes",
        { withCredentials: true },
      );

      if (res.data.success) {
        const data = res.data.allClasses;
        setClasses(data);

        if (data.length === 0) {
          setStatus("empty");
        }
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div className="pt-24 px-8 pb-10 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
          Classes Management
        </h2>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-gray-500 text-lg text-center mt-10">
          Loading classes...
        </p>
      )}

      {/* Error */}
      {!loading && status === "error" && (
        <p className="text-red-500 text-lg text-center mt-10">
          Failed to load classes. Please try again.
        </p>
      )}

      {/* Empty State */}
      {!loading && status === "empty" && (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <div className="bg-indigo-100 p-6 rounded-full mb-4">
            <Users size={40} className="text-indigo-500" />
          </div>

          <h3 className="text-xl font-semibold text-gray-700">
            No Classes Found
          </h3>

          <p className="text-gray-500 mt-2">
            Looks like no classes have been created yet.
          </p>
        </div>
      )}

      {/* Classes Grid */}
      {!loading && classes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {classes.map((cls) => (
            <div
              key={cls._id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 p-6 transition-all duration-300 hover:-translate-y-2"
            >
              {/* Title */}
              <h3 className="text-xl font-semibold text-indigo-600 mb-4 group-hover:text-indigo-700 transition">
                {cls.name}
              </h3>

              {/* Info */}
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-indigo-500" />
                  <span>
                    {cls.teacher?.firstName} {cls.teacher?.lastName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span>ID: {cls.teacher?.teacherData?.empolyeeId}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users size={16} className="text-green-500" />
                  <span>{cls.students?.length || 0} Students</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-orange-500" />
                  <span>{new Date(cls.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAllClasses;
