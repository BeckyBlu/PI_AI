const form = document.getElementById("chat-form");
const input = document.getElementById("chat-input");
const messages = document.getElementById("chat-messages");
const sendButton = document.getElementById("send-button");

function safeText(value) {
  if (value === null || value === undefined) return "";
  return String(value);
}

function appendBubble(role, text) {
  if (!messages) return;

  const wrapper = document.createElement("div");
  wrapper.className = `bubble ${role}`;

  const label = document.createElement("div");
  label.className = "bubble-role";
  label.textContent = role === "user" ? "You" : "Assistant";

  const body = document.createElement("div");
  body.className = "bubble-text";
  body.textContent = safeText(text) || "(empty)";

  wrapper.appendChild(label);
  wrapper.appendChild(body);
  messages.appendChild(wrapper);
  messages.scrollTop = messages.scrollHeight;
}

function setLoading(isLoading) {
  if (sendButton) sendButton.disabled = isLoading;
  if (input) input.disabled = isLoading;
}

async function sendMessage(messageText) {
  setLoading(true);
  appendBubble("assistant", "thinking...");

  const thinkingBubble = messages?.lastElementChild;

  try {
    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: messageText }),
    });

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = { response: "Invalid server response." };
    }

    const assistantText = safeText(data?.response).trim() || "I’m sorry, I don’t have a response right now.";

    if (thinkingBubble && thinkingBubble.parentElement === messages) {
      const textNode = thinkingBubble.querySelector(".bubble-text");
      if (textNode) {
        textNode.textContent = assistantText;
      } else {
        appendBubble("assistant", assistantText);
      }
    } else {
      appendBubble("assistant", assistantText);
    }
  } catch (error) {
    const fallback = "I couldn’t reach the server. Please check your connection and try again.";

    if (thinkingBubble && thinkingBubble.parentElement === messages) {
      const textNode = thinkingBubble.querySelector(".bubble-text");
      if (textNode) {
        textNode.textContent = fallback;
      } else {
        appendBubble("assistant", fallback);
      }
    } else {
      appendBubble("assistant", fallback);
    }

    console.error("chat request failed", error);
  } finally {
    setLoading(false);
    if (input) input.focus();
  }
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const messageText = safeText(input?.value).trim();
    if (!messageText) return;

    appendBubble("user", messageText);
    if (input) input.value = "";

    sendMessage(messageText);
  });
}
