const isAdmin = (req, res, next) => {
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Only admins can perform this action",
    });
  }

  next();
};

export { isAdmin };
