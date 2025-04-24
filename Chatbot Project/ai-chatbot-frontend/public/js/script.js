console.log("script.js loaded");

window.convoId = "<%= convoId %>";
console.log("window.convoId set to:", window.convoId);

document.addEventListener("DOMContentLoaded", function () {
  const chatContainer = document.querySelector(".chat-container");
  const convoId = chatContainer?.dataset.convoid;
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");

  if (!chatBox || !userInput || !sendButton || !convoId) {
    console.error("Missing required elements or convoId.");
    return;
  }

  sendButton.addEventListener("click", sendMessage);
  userInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  async function sendMessage() {
    console.log("sendMessage() called");
    const message = userInput.value.trim();
    if (!message) return;

    // Add user's message immediately
    addMessage(message, "user");
    userInput.value = "";

    try {
      // Save user message to your backend
      await saveMessageToDatabase(convoId, "user", message);

      // Send message to AI API and get bot response
      const botReply = await sendMessageToAI(message);

      if (botReply) {
        addMessage(botReply, "bot");

        // Save bot response to your backend
        await saveMessageToDatabase(convoId, "bot", botReply);
      }
    } catch (err) {
      console.error("Send error:", err);
    }
  }

  function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.classList.add("message", sender);
    msg.textContent = text;
    chatBox.appendChild(msg);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  async function sendMessageToAI(userMessage) {
    const response = await fetch('http://localhost:8000/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: userMessage,
        is_reply: false,
        username: "user" // Adjust if you want to support usernames later
      }),
    });

    const data = await response.json();
    return data.response;
  }

  async function saveMessageToDatabase(convoId, sender, message) {
    const res = await fetch(`/convo/${convoId}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender, message }),
    });

    if (!res.ok) {
      console.error("Failed to save message to database");
    }
  }
});
