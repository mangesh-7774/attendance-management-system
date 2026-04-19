import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Home from "./pages/Home";
import "./app.css";
import SetupAdmin from "./pages/Auth/SetupAdmin";
import AdminLayout from "./components/Layouts/AdminLayout";
import AdminHome from "./pages/Admin/AdminHome";
import TeacherLayout from "./components/Layouts/TeacherLayout";
import TeacherHome from "./pages/Teacher/TeacherHome";
import StudentLayout from "./components/Layouts/StudentLayout";
import StudentHome from "./pages/Student/StudentHome";
import AdminTeachers from "./pages/Admin/AdminTeachers";
import AdminAddTeacher from "./pages/Admin/AdminAddTeacher";
import AdminAllClasses from "./pages/Admin/AdminAllClasses";
// import AdminAddClass from "./pages/Admin/AdminAddClass";
import AllStudentsCardDetails from "./pages/Admin/AllStudentsCardDetails";
import AbsentStudents from "./pages/Admin/AbsentStudents";
import PresentStudents from "./pages/Admin/PresentStudents";
import AdminReports from "./pages/Admin/AdminReports";
import AdminCalendar from "./pages/Admin/AdminCalendar";
import AdminAddHoliday from "./pages/Admin/AdminAddHoliday";
import AdminEditHoliday from "./pages/Admin/AdminEditHoliday";
import TeacherAttendance from "./pages/Teacher/TeacherAttendance";
import TeacherAllStudentsCard from "./pages/Teacher/TeacherAllStudentsCard";
import TeacherAbsentStudentsCard from "./pages/Teacher/TeacherAbsentStudentsCard";
import TeacherPresentStudents from "./pages/Teacher/TeacherPresentStudents";
import TeacherStudent from "./pages/Teacher/TeacherStudent";
import TeacherAddStudent from "./pages/Teacher/TeacherAddStudent";
import TeacherEditStudent from "./pages/Teacher/TeacherEditStudent";
import TeacherDetainedList from "./pages/Teacher/TeacherDetainedList";
import TeacherReport from "./pages/Teacher/TeacherReport";
import StudentWorkingDays from "./pages/Student/StudentWorkingDays";
import StudentPresentDays from "./pages/Student/StudentPresentDays";
import StudentAbsentDays from "./pages/Student/StudentAbsentDays";
import StudentAttendance from "./pages/Student/StudentAttendance";
import StudentReport from "./pages/Student/StudentReport";
import VerifyAccount from "./pages/Auth/VerifyAccount";

function App() {
  const router = createBrowserRouter([
    {
      path: "/setup-admin",
      element: <SetupAdmin />,
    },
    {
      path: "/",
      element: <Navigate to="/login" />,
    },
    {
      path: "/login",
      element: <Home />,
    },
    {
      path: "/verify-account",
      element: <VerifyAccount />,
    },
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        {
          path: "admin-home",
          element: <AdminHome />,
        },
        {
          path: "admin-teachers",
          element: <AdminTeachers />,
        },
        {
          path: "admin-add-teacher",
          element: <AdminAddTeacher />,
        },
        {
          path: "admin-all-classes",
          element: <AdminAllClasses />,
        },
        {
          path: "admin-all-students-attendace",
          element: <AllStudentsCardDetails />,
        },
        {
          path: "admin-present-students",
          element: <PresentStudents />,
        },
        {
          path: "admin-absent-students",
          element: <AbsentStudents />,
        },
        {
          path: "admin-reports",
          element: <AdminReports />,
        },
        {
          path: "admin-calendar",
          element: <AdminCalendar />,
        },
        {
          path: "add-holiday",
          element: <AdminAddHoliday />,
        },
        {
          path: "edit-holiday/:id",
          element: <AdminEditHoliday />,
        },
      ],
    },
    {
      path: "/teacher",
      element: <TeacherLayout />,
      children: [
        {
          path: "home",
          element: <TeacherHome />,
        },
        {
          path: "attendance",
          element: <TeacherAttendance />,
        },
        {
          path: "all-present-absent",
          element: <TeacherAllStudentsCard />,
        },
        {
          path: "absent",
          element: <TeacherAbsentStudentsCard />,
        },
        {
          path: "present",
          element: <TeacherPresentStudents />,
        },
        {
          path: "students",
          element: <TeacherStudent />,
        },
        {
          path: "register-student",
          element: <TeacherAddStudent />,
        },
        {
          path: "update-student/:studentId",
          element: <TeacherEditStudent />,
        },
        {
          path: "detained-list",
          element: <TeacherDetainedList />,
        },
        {
          path: "report",
          element: <TeacherReport />,
        },
      ],
    },
    {
      path: "/student",
      element: <StudentLayout />,
      children: [
        {
          path: "student-home",
          element: <StudentHome />,
        },
        {
          path: "working-days",
          element: <StudentWorkingDays />,
        },
        {
          path: "present-days",
          element: <StudentPresentDays />,
        },
        {
          path: "absent-days",
          element: <StudentAbsentDays />,
        },
        {
          path: "student-attendance",
          element: <StudentAttendance />,
        },
        {
          path: "student-report",
          element: <StudentReport />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
