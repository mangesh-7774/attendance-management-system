/* eslint-disable no-unused-vars */
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const AdminTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);

  // DELETE MODAL
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // EDIT MODAL
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    className: "",
  });

  /* ================= FETCH ================= */
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8000/api/user/get-all-teachers",
        { withCredentials: true },
      );
      setTeachers(res.data.allTeachers || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  /* ================= DELETE ================= */
  const openDeleteModal = (teacher) => {
    setSelectedTeacher(teacher);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `http://localhost:8000/api/user/delete-teacher/${selectedTeacher._id}`,
        { withCredentials: true },
      );

      setTeachers((prev) => prev.filter((t) => t._id !== selectedTeacher._id));

      setShowDeleteModal(false);
      setSelectedTeacher(null);
    } catch (error) {
      alert("Failed to delete teacher");
    }
  };

  /* ================= EDIT ================= */
  const openEditModal = (teacher) => {
    setSelectedTeacher(teacher);

    setEditData({
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      className: teacher.className,
    });

    setShowEditModal(true);
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const updateTeacher = async () => {
    try {
      await axios.put(
        `http://localhost:8000/api/user/update-teacher/${selectedTeacher._id}`,
        editData,
        { withCredentials: true },
      );

      fetchTeachers();
      setShowEditModal(false);
    } catch (error) {
      alert("Failed to update teacher");
    }
  };

  return (
    <div className="pt-25 p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-semibold">Teachers Management</h2>

        <Link to="/admin/admin-add-teacher">
          <button className="bg-indigo-600 text-white px-5 py-2 rounded-lg">
            + Add Teacher with Class Assignment
          </button>
        </Link>
      </div>

      {/* TABLE */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-6">Loading...</p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-200 text-sm">
              <tr>
                <th className="px-6 py-3">Emp ID</th>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Class</th>
                <th className="px-6 py-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {teachers.map((t) => (
                <tr key={t._id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-4">{t.teacherData?.empolyeeId}</td>

                  <td className="px-6 py-4">
                    {t.firstName} {t.lastName}
                  </td>

                  <td className="px-6 py-4">{t.email}</td>

                  <td className="px-6 py-4">{t.className}</td>

                  <td className="px-6 py-4 flex justify-center gap-4">
                    {/* EDIT */}
                    <FiEdit
                      className="cursor-pointer text-blue-600 hover:scale-110 transition"
                      onClick={() => openEditModal(t)}
                    />

                    {/* DELETE */}
                    <FiTrash2
                      className="cursor-pointer text-red-600 hover:scale-110 transition"
                      onClick={() => openDeleteModal(t)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ================= DELETE MODAL ================= */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-3 text-red-600">
              Delete Teacher
            </h3>

            <p className="text-gray-600 mb-4">
              Are you sure you want to delete{" "}
              <b>{selectedTeacher?.firstName}</b>?
              <br />
              <br />
              ⚠️ This will delete the teacher and assigned class also.
              <br />
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/10 backdrop-blur-sm z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">
              Edit Teacher
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                name="firstName"
                value={editData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                name="lastName"
                value={editData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="w-full border p-2 rounded"
              />

              <input
                type="email"
                name="email"
                value={editData.email}
                onChange={handleChange}
                placeholder="Email"
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                name="className"
                value={editData.className}
                onChange={handleChange}
                placeholder="Class Name"
                className="w-full border p-2 rounded"
              />
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>

              <button
                onClick={updateTeacher}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeachers;
