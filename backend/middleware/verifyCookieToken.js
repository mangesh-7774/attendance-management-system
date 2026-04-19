import jwt from "jsonwebtoken";

const verifyTempCookie = (req, res, next) => {
  const token = req.cookies.verifyToken;

  if (!token)
    return res.status(401).json({
      success: false,
      message: "You are not verified or verification session expired",
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.purpose !== "EMAIL_VERIFY") {
      return res.status(403).json({ success: false, message: "Invalid token" });
    }

    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Verification token expired",
    });
  }
};

export { verifyTempCookie };
