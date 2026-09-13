const form = document.getElementById("generator-form");
const input = document.getElementById("topic-input");
const errorMsg = document.getElementById("error-msg");
const generateBtn = document.getElementById("generate-btn");

const placeholderEl = document.getElementById("output-placeholder");
const loadingEl = document.getElementById("output-loading");
const loadingText = document.getElementById("loading-text");
const resultEl = document.getElementById("output-result");
const outputText = document.getElementById("output-text");
const copyBtn = document.getElementById("copy-btn");
const regenerateBtn = document.getElementById("regenerate-btn");
const toast = document.getElementById("toast");

let lastTopic = "";
let typeTimer = null;

/* ---------- Poem templates ---------- */
const POEMS = [
  (t) => `In quiet hours, ${t} appears,
A gentle light through all the years.
It softens every path we roam,
And turns the stranger's house a home.`,

  (t) => `Ode to ${t}, so wild and free,
You dance like sunlight on the sea.
No words of mine could quite define
The simple joy when you are mine.`,

  (t) => `${capitalize(t)} whispers in the evening breeze,
A fleeting gift among the trees.
And every heart that stops to see
Finds something there it longs to be.`,

  (t) => `If ${t} were mine for just a day,
I'd hold the fading light at bay.
And when the stars begin to gleam,
I'd weave it softly into dream.`,
];

/* ---------- Helpers ---------- */
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 2200);
}

function typeText(text) {
  clearInterval(typeTimer);
  outputText.innerHTML = '<span class="caret"></span>';
  const caret = outputText.querySelector(".caret");
  let i = 0;
  typeTimer = setInterval(() => {
    if (i >= text.length) {
      clearInterval(typeTimer);
      caret.remove();
      return;
    }
    caret.before(document.createTextNode(text[i]));
    i++;
  }, 16);
}

/* ---------- Generate flow ---------- */
function setLoading(isLoading, topic) {
  generateBtn.disabled = isLoading;
  generateBtn.classList.toggle("loading", isLoading);
  placeholderEl.hidden = isLoading;
  resultEl.hidden = true;
  loadingEl.hidden = !isLoading;
  if (isLoading) {
    loadingText.textContent = `Generating a poem about ${topic}..`;
  }
}

function generate(topic) {
  errorMsg.hidden = true;
  input.classList.remove("invalid");

  topic = topic.trim();
  if (!topic) {
    errorMsg.textContent = "Please enter a topic first.";
    errorMsg.hidden = false;
    input.classList.add("invalid");
    input.focus();
    return;
  }

  lastTopic = topic;
  setLoading(true, topic);

  // Brief, natural-feeling delay before revealing the poem
  setTimeout(
    () => {
      setLoading(false, true);
      loadingEl.hidden = true;
      resultEl.hidden = false;
      typeText(pick(POEMS)(topic));
    },
    1300 + Math.random() * 700,
  );
}

/* ---------- Events ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  generate(input.value);
});

input.addEventListener("input", () => {
  errorMsg.hidden = true;
  input.classList.remove("invalid");
});

copyBtn.addEventListener("click", async () => {
  const text = outputText.textContent;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied to clipboard! 📋");
  } catch {
    showToast("Copy failed — select the text manually.");
  }
});

regenerateBtn.addEventListener("click", () =>
  generate(lastTopic || input.value),
);

/* Focus input on load, like the original */
input.focus();
