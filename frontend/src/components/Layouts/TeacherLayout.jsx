import React from "react";
import TeacherHeader from "../../pages/Teacher/TeacherHeader";
import { Outlet } from "react-router-dom";

const TeacherLayout = () => {
  return (
    <>
      <TeacherHeader />
      <Outlet />
    </>
  );
};

export default TeacherLayout;
