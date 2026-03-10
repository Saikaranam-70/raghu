const jwt = require("jsonwebtoken");
const Admin = require("../model/Admin");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        console.log("called");
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.SECRET);

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    req.admin = admin;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};