const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    sender: { type: String, enum: ["user", "bot"], required: true },
    message: { type: String, required: true }, // Kept "message" to match screenshot
    timestamp: { type: Date, default: Date.now }
});

const conversationSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'conversation1'
  messages: [messageSchema],
});

const chatSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  conversations: [conversationSchema]
});


module.exports = mongoose.model("Chatbox", chatSchema); // Renamed to "Chatbox" to match the screenshot
