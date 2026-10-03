require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Post = require("./models/Post");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Post.deleteMany({});
  await User.deleteMany({});

  const password = await bcrypt.hash("Password123", 10);
  const users = await User.create([
    { name: "Aarav Sharma", username: "aarav", email: "aarav@example.com", password, bio: "Building useful things on the web.", avatar: "https://i.pravatar.cc/150?img=12" },
    { name: "Meera Singh", username: "meera", email: "meera@example.com", password, bio: "Design • Coffee • Code", avatar: "https://i.pravatar.cc/150?img=47" },
    { name: "Kabir Verma", username: "kabir", email: "kabir@example.com", password, bio: "Learning something new every day.", avatar: "https://i.pravatar.cc/150?img=33" }
  ]);

  await Post.create([
    {
      author: users[0]._id,
      text: "Welcome to Task 5 Social! This sample post demonstrates the feed, likes and comments.",
      mediaUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      mediaType: "image",
      likes: [users[1]._id]
    },
    {
      author: users[1]._id,
      text: "A clean interface makes a social feed easier to explore.",
      mediaUrl: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
      mediaType: "image",
      comments: [{ user: users[2]._id, text: "Looks great!" }]
    },
    {
      author: users[2]._id,
      text: "Sample dataset loaded successfully. Login with any demo account using Password123.",
      mediaType: ""
    }
  ]);

  console.log("Seed complete.");
  console.log("Demo login: aarav@example.com / Password123");
  await mongoose.disconnect();
}
seed().catch(e => { console.error(e); process.exit(1); });
