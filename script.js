
"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const STORAGE_KEY = "slothflow-tasks-v1";

const state = {
  mode: "plan",
  filter: "all",
  tasks: [],
  lastInput: "",
  lastResult: null,
  busy: false,
  connection: false
};

const EXAMPLE = `I need to prepare for my college MST exams, finish physics notes, practice C programming loops, reply to college messages, clean my desk, and plan tomorrow. I feel overwhelmed and don't know where to start.`;

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

function updateDate() {
  $("#todayDate").textContent = new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short"
  }).format(new Date());
}

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    if (Array.isArray(saved)) {
      state.tasks = saved
        .filter(task =>
          task &&
          typeof task.id === "string" &&
          typeof task.title === "string"
        )
        .map(task => ({
          id: task.id,
          title: task.title.slice(0, 200),
          category: String(task.category || "Personal").slice(0, 40),
          priority: ["High", "Medium", "Low"].includes(task.priority)
            ? task.priority
            : "Medium",
          completed: Boolean(task.completed)
        }));
    }
  } catch {
    state.tasks = [];
    showToast("Saved tasks could not be loaded.");
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  } catch {
    showToast("Browser storage is unavailable. Tasks may not persist.");
  }
}

function createTask(title, category = "Personal", priority = "Medium") {
  return {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    title: title.trim().slice(0, 200),
    category,
    priority,
    completed: false
  };
}

function renderStats() {
  const completed = state.tasks.filter(task => task.completed).length;
  const remaining = state.tasks.length - completed;
  const percent = state.tasks.length
    ? Math.round((completed / state.tasks.length) * 100)
    : 0;

  $("#completedCount").textContent = completed;
  $("#remainingCount").textContent = remaining;
  $("#progressPercent").textContent = percent;
  $("#progressBar").style.width = `${percent}%`;
  $("#navTaskCount").textContent = remaining;

  $(".pace-progress-fill").style.width = `${percent}%`;
}

function renderTasks() {
  const list = $("#taskList");

  const filtered = state.tasks.filter(task => {
    if (state.filter === "active") return !task.completed;
    if (state.filter === "completed") return task.completed;
    return true;
  });

  $("#emptyTasks").classList.toggle("hidden", filtered.length > 0);
  list.innerHTML = "";

  filtered.forEach(task => {
    const item = document.createElement("article");
    item.className = `task-item${task.completed ? " completed" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", `Complete ${task.title}`);

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderAll();
    });

    const details = document.createElement("div");
    details.className = "task-details";

    const title = document.createElement("span");
    title.className = "task-title";
    title.textContent = task.title;

    const category = document.createElement("span");
    category.className = "task-category";
    category.textContent = task.category;

    details.append(title, category);

    const priority = document.createElement("span");
    priority.className = `task-priority priority-${task.priority.toLowerCase()}`;
    priority.textContent = task.priority;

    const remove = document.createElement("button");
    remove.className = "delete-task";
    remove.type = "button";
    remove.textContent = "×";
    remove.setAttribute("aria-label", `Delete ${task.title}`);

    remove.addEventListener("click", () => {
      state.tasks = state.tasks.filter(item => item.id !== task.id);
      saveTasks();
      renderAll();
      showToast("Task removed.");
    });

    item.append(checkbox, details, priority, remove);
    list.appendChild(item);
  });

  renderStats();
}

function renderAll() {
  renderTasks();

  $$(".filter-button").forEach(button => {
    const active = button.dataset.filter === state.filter;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function addTask(title, category = "Personal", priority = "Medium") {
  const cleanTitle = title.trim();

  if (!cleanTitle) return false;

  if (state.tasks.length >= 300) {
    showToast("Keep your garden manageable: 300 tasks maximum.");
    return false;
  }

  state.tasks.unshift(createTask(cleanTitle, category, priority));
  saveTasks();
  renderAll();
  return true;
}

function setMode(mode) {
  state.mode = mode;

  $$(".tool-option").forEach(button => {
    const active = button.dataset.mode === mode;
    button.classList.toggle("selected", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function updateCharacterCount() {
  const length = $("#taskInput").value.length;
  $("#charCount").textContent = `${length} character${length === 1 ? "" : "s"}`;
}

function getSettings() {
  const baseUrl = $("#ollamaUrl").value.trim().replace(/\/+$/, "");
  const model = $("#modelName").value.trim();

  if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(baseUrl)) {
    throw new Error(
      "Use a local Ollama address such as http://localhost:11434."
    );
  }

  if (!/^[a-zA-Z0-9][a-zA-Z0-9._:/-]{0,100}$/.test(model)) {
    throw new Error("Enter a valid Ollama model name.");
  }

  return { baseUrl, model };
}

function setConnectionStatus(connected, message) {
  state.connection = connected;

  $("#connectionStatus").textContent = message;
  $("#modeIndicator").style.background = connected ? "#6eaa63" : "#c7a768";

  $("#modeText").textContent = connected
    ? `Local AI connected · ${$("#modelName").value.trim()}`
    : "Demo mode · No external AI service";

  $("#sidebarMode").textContent = connected
    ? "Connected local model"
    : "Local AI / Demo mode";
}

async function connectToOllama() {
  const { baseUrl, model } = getSettings();

  const response = await fetch(`${baseUrl}/api/tags`, {
    signal: AbortSignal.timeout(5000)
  });

  if (!response.ok) {
    throw new Error(`Ollama returned HTTP ${response.status}.`);
  }

  const data = await response.json();
  const models = Array.isArray(data.models) ? data.models : [];

  const installed = models.some(item =>
    item.name === model ||
    item.name === `${model}:latest` ||
    item.model === model
  );

  if (!installed) {
    throw new Error(
      `Model "${model}" is not installed. Download it in Ollama first.`
    );
  }

  setConnectionStatus(true, `Connected: ${model}`);
  showToast("Your local AI is ready.");
}

async function callLocalAI(text, mode) {
  const { baseUrl, model } = getSettings();

  const instructions = {
    plan: `Turn the user's input into a calm, realistic action plan.
Break the work into 3-7 small, concrete steps. Put the most important
or time-sensitive steps first. Keep each step manageable. Include a
short reassuring opening and a suggested first step.`,
    summarize: `Summarize the user's input in plain English.
Give a short summary, the key points, and any clear next action.
Do not invent facts.`,
    prioritize: `Help prioritize the user's tasks.
Group them into High, Medium and Low priority. Explain briefly why.
Favor urgent deadlines and meaningful outcomes, and keep the workload realistic.`
  };

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(120000),
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        {
          role: "system",
          content: `You are SlothFlow, a kind, practical, non-judgmental
productivity assistant. ${instructions[mode]}
Use concise headings and bullet points. Never shame the user or invent
deadlines. Do not claim you completed an action you only recommended.`
        },
        { role: "user", content: text }
      ],
      options: { temperature: 0.4 }
    })
  });

  if (!response.ok) {
    throw new Error(`AI request failed with HTTP ${response.status}.`);
  }

  const data = await response.json();
  const answer = data.message?.content?.trim();

  if (!answer) throw new Error("The model returned an empty answer.");

  return answer;
}

// Offline demo engine: no remote AI calls.
function generateDemo(text, mode) {
  const normalized = text
    .replace(/\r/g, "\n")
    .replace(/[•●▪]/g, "\n")
    .trim();

  let items = normalized
    .split(/\n|[,;]+|\s+(?:and then|then)\s+/i)
    .map(part => part.replace(/^[\s\d.)-]+/, "").trim())
    .filter(part => part.length > 2);

  const filler = /^(i need to|i have to|i want to|i should|please|also)$/i;
  items = items.filter(item => !filler.test(item));

  if (!items.length) {
    items = [normalized];
  }

  items = [...new Set(items)].slice(0, 12);

  const urgencyWords =
    /\b(urgent|today|tomorrow|deadline|exam|mst|submit|due|important|interview)\b/i;

  const effortWords =
    /\b(project|assignment|prepare|study|finish|complete|report|presentation)\b/i;

  const score = item =>
    (urgencyWords.test(item) ? 3 : 0) +
    (effortWords.test(item) ? 1 : 0);

  const sorted = [...items].sort((a, b) => score(b) - score(a));

  if (mode === "summarize") {
    const summary = sorted.slice(0, 3);

    return {
      title: "Here's the short version.",
      intro: "Let's make the noise a little quieter.",
      sections: [
        {
          title: "The essentials",
          items: summary
        },
        {
          title: "Your next move",
          items: [summary[0] || "Choose one small task to begin."]
        }
      ]
    };
  }

  if (mode === "prioritize") {
    const high = sorted.filter(item => score(item) >= 3);
    const medium = sorted.filter(item => score(item) === 1);
    const low = sorted.filter(item => score(item) === 0);

    return {
      title: "Your priorities, untangled.",
      intro: "This is a simple first pass based on words in your input. Adjust it to match your real deadlines.",
      sections: [
        { title: "High priority — check deadlines", items: high },
        { title: "Medium priority — make steady progress", items: medium },
        { title: "Low priority — save for later", items: low }
      ].filter(section => section.items.length)
    };
  }

  return {
    title: "Here's your lighter plan.",
    intro: "You don't need to do everything at once. Start with one small win.",
    sections: [
      {
        title: "Your action steps",
        items: sorted.slice(0, 7).map((item, index) =>
          `${index + 1}. ${item}`
        )
      },
      {
        title: "A gentle reminder",
        items: [
          "Start with the first step and give it 15 minutes.",
          "Take a short break before moving on.",
          "Move unfinished work to another session instead of rushing."
        ]
      }
    ]
  };
}

function renderOutput(result, mode, source) {
  state.lastResult = result;
  state.lastInput = source;
  state.lastResult.mode = mode;

  $("#outputTitle").textContent = result.title;
  $("#outputMeta").textContent =
    `${mode === "plan" ? "Action plan" : mode === "summarize" ? "Quick summary" : "Priority guide"} · ` +
    `${state.connection ? "Local open-weight model" : "Offline demo rules"}`;

  const container = $("#outputContent");
  container.replaceChildren();

  const intro = document.createElement("p");
  intro.textContent = result.intro || "";
  container.appendChild(intro);

  (result.sections || []).forEach(section => {
    const heading = document.createElement("h3");
    heading.textContent = section.title;
    container.appendChild(heading);

    const list = document.createElement("ul");

    (section.items || []).forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });

    container.appendChild(list);
  });

  $("#outputPanel").classList.remove("hidden");
  $("#outputPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function generatePlan() {
  const text = $("#taskInput").value.trim();

  if (!text) {
    showToast("Unload a few thoughts first 🌱");
    $("#taskInput").focus();
    return;
  }

  if (state.busy) return;

  state.busy = true;
  state.lastInput = text;

  const button = $("#generateButton");
  const original = button.innerHTML;

  button.disabled = true;
  button.textContent = "Taking a little breath...";

  try {
    let result;

    if (state.connection) {
      try {
        const answer = await callLocalAI(text, state.mode);

        result = {
          title: state.mode === "plan"
            ? "Your plan is ready."
            : state.mode === "summarize"
              ? "Here's the short version."
              : "Your priorities, untangled.",
          intro: answer,
          sections: []
        };
      } catch (error) {
        setConnectionStatus(false, error.message);
        showToast("Local AI failed. Using offline demo rules instead.");
        result = generateDemo(text, state.mode);
      }
    } else {
      // Small delay to make the demo interaction feel natural.
      await new Promise(resolve => setTimeout(resolve, 350));
      result = generateDemo(text, state.mode);
    }

    renderOutput(result, state.mode, text);
  } catch (error) {
    showToast(error.message || "Something went wrong.");
  } finally {
    state.busy = false;
    button.disabled = false;
    button.innerHTML = original;
  }
}

function outputAsText() {
  const result = state.lastResult;
  if (!result) return "";

  const lines = [result.title, "", result.intro || ""];

  (result.sections || []).forEach(section => {
    lines.push("", section.title);

    section.items.forEach(item => lines.push(`- ${item}`));
  });

  return lines.join("\n");
}

async function copyOutput() {
  const text = outputAsText();
  if (!text) return;

  try {
    await navigator.clipboard.writeText(text);
    showToast("Your plan has been copied.");
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand("copy");
    textarea.remove();

    showToast(copied ? "Copied!" : "Couldn't copy. Select the text manually.");
  }
}

function addGeneratedTasks() {
  const result = state.lastResult;

  if (!result) {
    showToast("Generate a plan first.");
    return;
  }

  let additions = [];

  if (result.sections?.length) {
    const section = result.sections.find(item =>
      /action steps|essentials/i.test(item.title)
    ) || result.sections[0];

    additions = section.items.map(item =>
      String(item).replace(/^\s*\d+[.)]\s*/, "").trim()
    );
  } else if (result.intro) {
    // Local AI output is plain text. Import individual non-heading lines.
    additions = result.intro
      .split(/\n+/)
      .map(line => line.replace(/^\s*[-*•\d.)]+\s*/, "").trim())
      .filter(line =>
        line.length > 3 &&
        !/^#{1,6}\s/.test(line) &&
        !/^(here('|’)s|your plan|action steps|summary|priorities)\b/i.test(line)
      );
  }

  additions = [...new Set(additions)].filter(Boolean).slice(0, 10);

  if (!additions.length) {
    showToast("No individual steps found to add.");
    return;
  }

  const existing = new Set(
    state.tasks.map(task => task.title.toLowerCase())
  );

  const fresh = additions.filter(item =>
    !existing.has(item.toLowerCase())
  );

  const capacity = Math.max(0, 300 - state.tasks.length);
  const accepted = fresh.slice(0, capacity);

  accepted.forEach((item, index) => {
    state.tasks.unshift(createTask(
      item,
      "AI plan",
      index === 0 ? "High" : "Medium"
    ));
  });

  saveTasks();
  renderAll();

  $("#tasks").scrollIntoView({ behavior: "smooth", block: "start" });

  if (!fresh.length) {
    showToast("These steps are already in your task garden.");
  } else {
    showToast(`${accepted.length} task${accepted.length === 1 ? "" : "s"} added.`);
  }
}

function bindEvents() {
  $("#taskInput").addEventListener("input", updateCharacterCount);

  $$(".tool-option").forEach(button => {
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.mode === state.mode)
    );

    button.addEventListener("click", () => {
      setMode(button.dataset.mode);
    });
  });

  $("#exampleButton").addEventListener("click", () => {
    $("#taskInput").value = EXAMPLE;
    updateCharacterCount();
    $("#taskInput").focus();
  });

  $("#generateButton").addEventListener("click", generatePlan);

  $("#regenerateButton").addEventListener("click", generatePlan);

  $("#copyOutput").addEventListener("click", copyOutput);

  $("#addTasksButton").addEventListener("click", addGeneratedTasks);

  $("#settingsToggle").addEventListener("click", () => {
    $("#settingsPanel").classList.toggle("hidden");
  });

  $("#testConnection").addEventListener("click", async () => {
    const button = $("#testConnection");
    button.disabled = true;
    $("#connectionStatus").textContent = "Checking local model...";

    try {
      await connectToOllama();
    } catch (error) {
      setConnectionStatus(false, error.message);
      showToast(error.message);
    } finally {
      button.disabled = false;
    }
  });

  $("#quickAddForm").addEventListener("submit", event => {
    event.preventDefault();

    const input = $("#quickTaskInput");

    if (addTask(input.value)) {
      input.value = "";
      showToast("A tiny step added 🌱");
      input.focus();
    }
  });

  $$(".filter-button").forEach(button => {
    button.addEventListener("click", () => {
      state.filter = button.dataset.filter;
      renderAll();
    });
  });

  $("#clearCompleted").addEventListener("click", () => {
    const before = state.tasks.length;

    state.tasks = state.tasks.filter(task => !task.completed);

    if (state.tasks.length === before) {
      showToast("No completed tasks to clear.");
      return;
    }

    saveTasks();
    renderAll();
    showToast("Your completed tasks have been cleared.");
  });

  $$(".nav-link").forEach(link => {
    link.addEventListener("click", () => {
      $$(".nav-link").forEach(item =>
        item.classList.toggle("active", item === link)
      );
    });
  });
}

function init() {
  updateDate();
  loadTasks();
  bindEvents();
  renderAll();
  updateCharacterCount();
  setMode("plan");

  setConnectionStatus(false, "Demo mode");

  // Seed a few example tasks on the first visit only.
  if (!state.tasks.length) {
    state.tasks = [
      createTask("Review one important college topic", "Study", "High"),
      createTask("Practice coding for 15 minutes", "Learning", "Medium"),
      createTask("Take a proper break", "Wellbeing", "Low")
    ];

    saveTasks();
    renderAll();
  }
}

document.addEventListener("DOMContentLoaded", init);
