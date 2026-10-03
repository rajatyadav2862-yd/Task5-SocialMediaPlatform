const router = require("express").Router();
const Post = require("../models/Post");
const auth = require("../middleware_auth");

router.get("/", async (req, res, next) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("author", "name username avatar")
      .populate("comments.user", "name username avatar");
    res.json({ success: true, posts });
  } catch (e) { next(e); }
});

router.post("/", auth, async (req, res, next) => {
  try {
    const { text = "", mediaUrl = "", mediaType = "" } = req.body;
    if (!text.trim() && !mediaUrl.trim())
      return res.status(400).json({ success: false, message: "Write something or add media URL" });

    const post = await Post.create({
      author: req.user._id,
      text: text.trim(),
      mediaUrl: mediaUrl.trim(),
      mediaType
    });
    const populated = await Post.findById(post._id).populate("author", "name username avatar");
    res.status(201).json({ success: true, post: populated });
  } catch (e) { next(e); }
});

router.post("/:id/like", auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    const index = post.likes.findIndex(id => id.toString() === req.user._id.toString());
    if (index >= 0) post.likes.splice(index, 1);
    else post.likes.push(req.user._id);

    await post.save();
    res.json({ success: true, liked: index < 0, likesCount: post.likes.length });
  } catch (e) { next(e); }
});

router.post("/:id/comments", auth, async (req, res, next) => {
  try {
    const text = (req.body.text || "").trim();
    if (!text) return res.status(400).json({ success: false, message: "Comment cannot be empty" });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });

    post.comments.push({ user: req.user._id, text });
    await post.save();
    const updated = await Post.findById(post._id)
      .populate("author", "name username avatar")
      .populate("comments.user", "name username avatar");
    res.status(201).json({ success: true, post: updated });
  } catch (e) { next(e); }
});

router.delete("/:id", auth, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found" });
    if (post.author.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "You can delete only your own post" });
    await post.deleteOne();
    res.json({ success: true, message: "Post deleted" });
  } catch (e) { next(e); }
});

module.exports = router;
