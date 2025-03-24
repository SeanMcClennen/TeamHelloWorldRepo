document.addEventListener("DOMContentLoaded", function () {
    console.log("JavaScript loaded!"); // Debugging step 1

    const chatBox = document.getElementById("chat-box");
    const userInput = document.getElementById("user-input");
    const sendButton = document.getElementById("send-button");

    if (!chatBox || !userInput || !sendButton) {
        console.error("One or more elements are missing!");
        return;
    }

    function sendMessage() {
        console.log("Send button clicked!"); // Debugging step 2

        const message = userInput.value.trim();
        if (message === "") return;

        addMessage(message, "user");
        userInput.value = "";

        setTimeout(() => {
            addMessage(getBotResponse(message), "bot");
        }, 1000);
    }

    function addMessage(text, sender) {
        console.log(`Adding message: ${text} from ${sender}`); // Debugging step 3

        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender);
        messageDiv.textContent = text;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    function getBotResponse(userMessage) {
        const responses = {
            "hello": "Hi there!",
            "how are you": "I'm a chatbot, doing great!",
            "bye": "Goodbye! Have a great day!",
            "default": "I'm not sure how to respond to that."
        };

        return responses[userMessage.toLowerCase()] || responses["default"];
    }

    userInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            sendMessage();
        }
    });

    sendButton.addEventListener("click", sendMessage);
});
