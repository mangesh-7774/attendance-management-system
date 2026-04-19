const isStudent = (req, res, next) => {
  if (req.user.role !== "STUDENT") {
    return res.status(403).json({
      success: false,
      message: "Only students can perform this action",
    });
  }

  next();
};

export { isStudent };
