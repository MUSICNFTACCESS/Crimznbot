// Fetch live prices on page load
document.addEventListener('DOMContentLoaded', async () => {
  const priceDiv = document.querySelector('#prices');
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd');
    const data = await response.json();
    priceDiv.innerHTML = `
      Bitcoin: $${data.bitcoin.usd} | 
      Ethereum: $${data.ethereum.usd} | 
      Solana: $${data.solana.usd}
    `;
  } catch (err) {
    priceDiv.innerHTML = 'Error loading prices';
  }
});

// Play beat on first click
let isFirstClick = true;
document.addEventListener('click', () => {
  if (isFirstClick) {
    const audio = document.querySelector('#background-beat');
    audio.play().catch(err => console.error('Audio play error:', err));
    isFirstClick = false;
  }
});

// Chat form submission
document.querySelector('#chat-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const input = document.querySelector('#chat-form input');
  const userMessage = input.value.trim();
  if (!userMessage) return;

  const chatBox = document.querySelector('#chatbox');
  chatBox.innerHTML += `> You: ${userMessage}<br>`;

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage })
    });

    const data = await response.json();
    chatBox.innerHTML += `> CrimznBot: ${data.reply}<br>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    chatBox.innerHTML += `> CrimznBot: Error reaching server.<br>`;
  }

  input.value = '';
});
