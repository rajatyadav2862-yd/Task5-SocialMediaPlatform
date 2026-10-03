const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware_auth");

router.get("/me", auth, async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (e) { next(e); }
});

router.put("/me", auth, async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { name, bio, avatar } },
      { new: true, runValidators: true }
    ).select("-password");
    res.json({ success: true, user });
  } catch (e) { next(e); }
});

router.get("/:username", async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, user });
  } catch (e) { next(e); }
});

module.exports = router;
