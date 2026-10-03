const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function tokenFor(user) {
  return jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const exists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] });
    if (exists) return res.status(409).json({ success: false, message: "Email or username already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, username, email, password: hash });
    res.status(201).json({
      success: true,
      token: tokenFor(user),
      user: { id: user._id, name: user.name, username: user.username, email: user.email, bio: user.bio, avatar: user.avatar }
    });
  } catch (e) { next(e); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: (email || "").toLowerCase() });
    if (!user || !(await bcrypt.compare(password || "", user.password)))
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    res.json({
      success: true,
      token: tokenFor(user),
      user: { id: user._id, name: user.name, username: user.username, email: user.email, bio: user.bio, avatar: user.avatar }
    });
  } catch (e) { next(e); }
});

module.exports = router;
