import React from "react";
import StudentHeader from "../../pages/Student/StudentHeader";
import { Outlet } from "react-router-dom";

const StudentLayout = () => {
  return (
    <>
      <StudentHeader />
      <Outlet />
    </>
  );
};

export default StudentLayout;
