const isTeacher = (req, res, next) => {
  if (req.user.role !== "TEACHER") {
    return res.status(403).json({
      success: false,
      message: "Only teachers can perform this action",
    });
  }

  next();
};

export { isTeacher };
