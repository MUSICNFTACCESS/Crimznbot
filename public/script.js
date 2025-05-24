const input = document.getElementById("user-input");
const chatOutput = document.getElementById("chat-output");

async function askCrimznBot() {
  const message = input.value;
  if (!message.trim()) return;

  const userMessageEl = document.createElement("div");
  userMessageEl.textContent = "You: " + message;
  userMessageEl.style.color = "#ff9900";
  chatOutput.appendChild(userMessageEl);

  input.value = "";

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();
    const botMessageEl = document.createElement("div");
    botMessageEl.textContent = "CrimznBot: " + data.reply;
    botMessageEl.style.color = "#00ff99";
    chatOutput.appendChild(botMessageEl);
    chatOutput.scrollTop = chatOutput.scrollHeight;
  } catch (err) {
    const errorEl = document.createElement("div");
    errorEl.textContent = "Error: Unable to reach CrimznBot.";
    errorEl.style.color = "red";
    chatOutput.appendChild(errorEl);
  }
}
