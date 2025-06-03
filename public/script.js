const input = document.getElementById("user-input");
const chatOutput = document.getElementById("chat-output");

let freeQuestionsLeft = 3;

updateCounter();

async function askCrimznBot() {
  const message = input.value.trim();
  if (!message || freeQuestionsLeft <= 0) return;

  appendMessage("You", message);
  input.value = "";

  try {
    const res = await fetch("https://crimznbot.onrender.com/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    appendMessage("CrimznBot", data.reply);
    freeQuestionsLeft--;
    updateCounter();

    if (freeQuestionsLeft <= 0) {
      input.disabled = true;
      document.getElementById("paywall").style.display = "block";
    }
  } catch (err) {
    appendMessage("CrimznBot", "Error: Failed to get response from backend.");
  }
}

function appendMessage(sender, message) {
  const el = document.createElement("div");
  el.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatOutput.appendChild(el);
  chatOutput.scrollTop = chatOutput.scrollHeight;
}

function updateCounter() {
  const counter = document.getElementById("counter");
  if (counter) counter.textContent = `Questions remaining: ${freeQuestionsLeft}`;
}
