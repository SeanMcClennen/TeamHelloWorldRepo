const express = require("express");
const path = require("path");
const helmet = require("helmet");

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// Set EJS as the templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
  res.render("landing");
});

app.get("/signup", (req, res) => {
    res.render("signup");
  });

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/chat", (req, res) => {
    res.render("chat");
});

// Move conversation routes outside of /chat
app.get("/convo1", (req, res) => {
    res.render("convo1", { question: "How’s the weather today?" });
});

app.get("/convo2", (req, res) => {
    res.render("convo2", { question: "Tell me a joke!" });
});

app.get("/convo3", (req, res) => {
    res.render("convo3", { question: "What’s the capital of France?" });
});

app.get("/convo4", (req, res) => {
    res.render("convo4", { question: "Translate 'hello' to Spanish." });
});

app.get("/convo5", (req, res) => {
    res.render("convo5", { question: "Give me a random fun fact." });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});