const API_URL = "https://crimznbot.onrender.com/api/chat";

document.getElementById("chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const userInput = document.getElementById("user-input").value.trim();
  const chatResponse = document.getElementById("chat-response");

  if (!userInput) return;

  chatResponse.innerText = "Thinking...";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message: userInput })
    });

    const data = await response.json();
    chatResponse.innerText = data.reply || "No reply.";
  } catch (error) {
    console.error(error);
    chatResponse.innerText = "Error: Could not reach CrimznBot.";
  }
});
