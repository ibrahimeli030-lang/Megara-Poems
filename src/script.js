// ---- DOM references ----------------------------------------------------
const form = document.getElementById("poem-form");
const topicInput = document.getElementById("topic-input");
const generateBtn = document.getElementById("generate-btn");
const inputError = document.getElementById("input-error");

const resultCard = document.getElementById("result-card");
const loadingState = document.getElementById("loading-state");
const loadingText = document.getElementById("loading-text");
const errorState = document.getElementById("error-state");
const errorText = document.getElementById("error-text");
const poemOutput = document.getElementById("poem-output");
const poemHeading = document.getElementById("poem-heading");
const poemText = document.getElementById("poem-text");

const copyBtn = document.getElementById("copy-btn");
const newBtn = document.getElementById("new-btn");
const copyConfirmation = document.getElementById("copy-confirmation");

let isLoading = false;

// ---- Form submit ---------------------------------------------------------
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isLoading) return;

  const topic = topicInput.value.trim();

  if (!topic) {
    showInputError();
    return;
  }

  clearInputError();
  await generatePoem(topic);
});

// Clear the inline validation message as soon as the user starts typing again
topicInput.addEventListener("input", () => {
  if (!inputError.hidden) clearInputError();
});

function showInputError() {
  inputError.hidden = false;
  topicInput.classList.add("input-invalid");
  topicInput.focus();
}

function clearInputError() {
  inputError.hidden = true;
  topicInput.classList.remove("input-invalid");
}

// ---- Core generation flow --------------------------------------------
async function generatePoem(topic) {
  setLoading(true, topic);
  showResultCard();

  try {
    const poem = await fetchPoemFromAI(topic);
    renderPoem(topic, poem);
  } catch (err) {
    console.error(err);
    renderError(err);
  } finally {
    setLoading(false);
  }
}

async function fetchPoemFromAI(topic) {
  if (!CONFIG.API_KEY || CONFIG.API_KEY === "YOUR_ANTHROPIC_API_KEY_HERE") {
    throw new Error(
      "No API key set. Open script.js and add your Anthropic API key to CONFIG.API_KEY.",
    );
  }

  const response = await fetch(CONFIG.API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CONFIG.API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: CONFIG.MODEL,
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: `Write a short, original poem (10-16 lines) about "${topic}". Return ONLY the poem text itself, with no title, no preamble, and no explanation before or after it.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    const message =
      errorBody?.error?.message ||
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const textBlock = data?.content?.find((block) => block.type === "text");

  if (!textBlock?.text) {
    throw new Error("The AI didn't return any poem text. Please try again.");
  }

  return textBlock.text.trim();
}

// ---- Rendering helpers -------------------------------------------------
function showResultCard() {
  resultCard.hidden = false;
  resultCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function setLoading(loading, topic) {
  isLoading = loading;
  generateBtn.disabled = loading;
  topicInput.disabled = loading;
  generateBtn.classList.toggle("is-loading", loading);

  if (loading) {
    loadingText.textContent = `Generating a poem about ${topic}…`;
    loadingState.hidden = false;
    errorState.hidden = true;
    poemOutput.hidden = true;
  } else {
    loadingState.hidden = true;
  }
}

function renderPoem(topic, poem) {
  errorState.hidden = true;
  poemHeading.textContent = topic;
  poemText.textContent = poem;
  poemOutput.hidden = false;
  copyConfirmation.hidden = true;
}

function renderError(err) {
  poemOutput.hidden = true;
  errorState.hidden = false;
  errorText.textContent =
    err?.message ||
    "Something went wrong while generating your poem. Please try again.";
}

// ---- Result actions: copy + generate another -------------------------
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(poemText.textContent);
    copyConfirmation.hidden = false;
    setTimeout(() => {
      copyConfirmation.hidden = true;
    }, 2000);
  } catch (err) {
    console.error("Copy failed:", err);
  }
});

newBtn.addEventListener("click", () => {
  topicInput.value = "";
  poemOutput.hidden = true;
  resultCard.hidden = true;
  topicInput.focus();
});
