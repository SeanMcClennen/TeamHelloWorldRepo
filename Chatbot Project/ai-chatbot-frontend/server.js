const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const helmet = require("helmet");
require("dotenv").config();

const User = require("./models/User.js");
const Chatbox = require("./models/Chat.js");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// MongoDB connection
mongoose
  .connect("mongodb://127.0.0.1:27017/your-database-name", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// ---------- Routes ----------

// Home/Login/Signup

app.get("/", (req, res) => res.render("landing"));
app.get("/signup", (req, res) => res.render("signup"));
app.get("/login", (req, res) => res.render("login"));

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.send("Username already exists!");

    const newUser = new User({ username, password });
    await newUser.save();

    const defaultConvos = [
      { name: "convo1", messages: [] },
      { name: "convo2", messages: [] },
      { name: "convo3", messages: [] },
    ];

    const newChat = new Chatbox({
      user_id: newUser._id,
      conversations: defaultConvos,
    });

    await newChat.save();

    req.session.userId = newUser._id;
    req.session.save(() => res.redirect("/chat"));
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).send("Error signing up");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.send("Invalid credentials.");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.send("Invalid credentials.");

    req.session.userId = user._id;
    res.redirect("/chat");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Login error.");
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

// Chat page (list conversations)

app.get("/chat", async (req, res) => {
  if (!req.session.userId) return res.redirect("/");

  try {
    const chatbox = await Chatbox.findOne({ user_id: req.session.userId });

    const conversations = chatbox?.conversations.map((c) => ({
      name: c.name,
      id: c.name,
    })) || [];

    res.render("chat", { conversations });
  } catch (err) {
    console.error("Error loading chat page:", err);
    res.status(500).send("Error loading chat");
  }
});

// ---------- Conversation Routes ----------

// View a conversation
app.get("/convo/:convoId", async (req, res) => {
  const convoId = req.params.convoId;
  if (!req.session.userId) return res.redirect("/");

  try {
    const chatbox = await Chatbox.findOne({ user_id: req.session.userId });
    const conversation = chatbox?.conversations.find(c => c.name === convoId) || { messages: [] };

    res.render("convo", { conversation: conversation.messages, convoId });
  } catch (err) {
    console.error("Error loading conversation:", err);
    res.status(500).send("Error loading conversation");
  }
});

// OLD ROUTE (no longer used - commented out)
// app.post('/convo/:convoId/send', async (req, res) => {
//   const userId = req.session.userId;
//   const convoId = req.params.convoId;
//   const { message } = req.body;

//   console.log("→ POST to /convo/:convoId/send");
//   console.log("User ID:", userId);
//   console.log("Convo ID:", convoId);
//   console.log("Message:", message);

//   try {
//     const chatbox = await Chatbox.findOne({ user_id: userId });
//     if (!chatbox) {
//       console.log(" No chatbox found.");
//       return res.status(404).json({ error: "Chatbox not found" });
//     }

//     const conversation = chatbox.conversations.find(c => c.name === convoId);
//     if (!conversation) {
//       console.log(" Conversation not found in chatbox.");
//       return res.status(404).json({ error: "Conversation not found" });
//     }

//     conversation.messages.push({ message: message, sender: "user" });

//     const botMessage = "This is a bot reply to: " + message;
//     conversation.messages.push({ message: botMessage, sender: "bot" });

//     await chatbox.save();
//     console.log(" Message saved and reply sent.");

//     res.json({ userMessage: message, botMessage });
//   } catch (err) {
//     console.error(" Error sending message:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// NEW ROUTE (only saves a message)
app.post('/convo/:convoId/save', async (req, res) => {
  const userId = req.session.userId;
  const convoId = req.params.convoId;
  const { sender, message } = req.body;

  console.log("→ POST to /convo/:convoId/save");
  console.log("User ID:", userId);
  console.log("Convo ID:", convoId);
  console.log("Sender:", sender);
  console.log("Message:", message);

  try {
    const chatbox = await Chatbox.findOne({ user_id: userId });
    if (!chatbox) {
      console.log(" No chatbox found.");
      return res.status(404).json({ error: "Chatbox not found" });
    }

    const conversation = chatbox.conversations.find(c => c.name === convoId);
    if (!conversation) {
      console.log(" Conversation not found in chatbox.");
      return res.status(404).json({ error: "Conversation not found" });
    }

    conversation.messages.push({ message, sender });
    await chatbox.save();

    console.log(" Message saved.");
    res.sendStatus(200);
  } catch (err) {
    console.error(" Error saving message:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// ---------- Start Server ----------

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
