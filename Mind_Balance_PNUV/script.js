const storage = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};

const appState = {
  moodEntries: storage.get("mb_moodEntries", []),
  completedChallenges: storage.get("mb_completedChallenges", []),
  lastStress: storage.get("mb_lastStress", null),
  lastSleep: storage.get("mb_lastSleep", null)
};

document.getElementById("menuToggle").addEventListener("click", () => {
  document.getElementById("navLinks").classList.toggle("open");
});

const calmModal = document.getElementById("calmModal");
const activityModal = document.getElementById("activityModal");
const activityContent = document.getElementById("activityContent");

document.getElementById("openCalm").addEventListener("click", () => calmModal.classList.add("open"));
document.getElementById("closeCalm").addEventListener("click", () => calmModal.classList.remove("open"));
document.getElementById("closeActivity").addEventListener("click", closeActivity);

const calmMessages = [
  "Вдиши полека, задржи кратко и издиши. Не мора сè да се реши одеднаш.",
  "Опушти ги рамената и направи мала пауза од екранот.",
  "Фокусирај се на една задача. Еден мал чекор е доволен за почеток.",
  "Разговор со доверлива личност може да го направи денот полесен.",
  "Погледни околу себе и именувај три работи што ги гледаш."
];

document.getElementById("calmNext").addEventListener("click", () => {
  document.getElementById("calmText").textContent = calmMessages[Math.floor(Math.random() * calmMessages.length)];
});

function closeActivity() {
  activityModal.classList.remove("open");
  activityContent.innerHTML = "";
  clearInterval(window.breathingInterval);
}

function openActivity(html) {
  activityContent.innerHTML = html;
  activityModal.classList.add("open");
}

document.getElementById("stressForm").addEventListener("submit", (event) => {
  event.preventDefault();
  let score = 0;
  for (let i = 1; i <= 5; i++) {
    score += Number(document.querySelector(`input[name="q${i}"]:checked`).value);
  }

  let level, message, recommendation, icon, className;
  if (score <= 5) {
    level = "Низок стрес";
    message = "Моментално изгледа дека добро се справуваш со училишните обврски.";
    recommendation = "Продолжи со редовни паузи, добар сон и разговор со луѓе што те поддржуваат.";
    icon = "🌿";
    className = "low";
  } else if (score <= 10) {
    level = "Умерен стрес";
    message = "Постојат знаци на притисок. Ова е добар момент да воведеш мали навики за баланс.";
    recommendation = "Пробај вежба за дишење, намали телефон пред спиење и планирај кратки паузи од учење.";
    icon = "🌤️";
    className = "medium";
  } else {
    level = "Висок стрес";
    message = "Изгледа дека стресот е повисок. Не мора да се справуваш сам/а.";
    recommendation = "Разговарај со доверлива личност, направи пауза и подели ги задачите на помали чекори.";
    icon = "🫶";
    className = "high";
  }

  const result = document.getElementById("stressResult");
  result.className = `result-panel ${className}`;
  result.innerHTML = `
    <div class="result-icon">${icon}</div>
    <h3>${level}</h3>
    <p><strong>Резултат:</strong> ${score}/15</p>
    <p>${message}</p>
    <p><strong>Препорака:</strong> ${recommendation}</p>
  `;

  appState.lastStress = { score, level };
  storage.set("mb_lastStress", appState.lastStress);
  updateDashboard();

  if (score > 10) setTimeout(() => calmModal.classList.add("open"), 600);
});

document.getElementById("openBreathing").addEventListener("click", () => {
  openActivity(`
    <h2>Вежба за дишење</h2>
    <p>Следи го кругот. Кога пишува „Вдиши“ вдиши полека, кога пишува „Задржи“ задржи кратко, а кога пишува „Издиши“ издиши полека.</p>
    <div class="breathing-circle" id="breathingCircle">Подготви се</div>
    <button class="primary-btn" id="startBreathing">Започни вежба</button>
  `);
  document.getElementById("startBreathing").addEventListener("click", startBreathing);
});

function startBreathing() {
  const circle = document.getElementById("breathingCircle");
  const button = document.getElementById("startBreathing");
  const phases = [
    { text: "Вдиши", cls: "expand" },
    { text: "Задржи", cls: "hold" },
    { text: "Издиши", cls: "shrink" }
  ];
  let step = 0;
  button.disabled = true;
  clearInterval(window.breathingInterval);

  function nextPhase() {
    const phase = phases[step % phases.length];
    circle.className = `breathing-circle ${phase.cls}`;
    circle.textContent = phase.text;
    step++;
    if (step > 8) {
      clearInterval(window.breathingInterval);
      circle.className = "breathing-circle";
      circle.textContent = "Готово";
      button.disabled = false;
    }
  }

  nextPhase();
  window.breathingInterval = setInterval(nextPhase, 3500);
}

const quotes = [
  "„Малите чекори се сепак напредок.“",
  "„Одморот е дел од продуктивноста.“",
  "„Оценките не ја дефинираат твојата вредност.“",
  "„Дозволено е да направиш пауза.“",
  "„Една задача во еден момент е доволна.“",
  "„Напредокот е поважен од совршенството.“"
];

document.getElementById("quoteBtn").addEventListener("click", () => {
  document.getElementById("quoteText").textContent = quotes[Math.floor(Math.random() * quotes.length)];
});

const rouletteIdeas = [
  "Испиј вода 💧",
  "Истегни се 2 минути 🤸",
  "Слушај омилена музика 🎧",
  "Излези на свеж воздух 🌳",
  "Разговарај со пријател 💬",
  "Направи длабоко дишење 🌬️",
  "Средѝ го бирото ✨",
  "Запиши една грижа и еден мал чекор 📝"
];

document.getElementById("openRoulette").addEventListener("click", () => {
  openActivity(`
    <h2>Рулет за грижа за себе</h2>
    <p>Кликни на копчето и добиј мала активност за подобар ден.</p>
    <div class="roulette-wheel" id="rouletteWheel">🎡</div>
    <div class="roulette-result" id="rouletteResult">Подготвено за вртење</div>
    <button class="secondary-btn" id="spinRoulette">Заврти рулет</button>
  `);

  document.getElementById("spinRoulette").addEventListener("click", () => {
    const wheel = document.getElementById("rouletteWheel");
    wheel.classList.add("spin");
    setTimeout(() => {
      wheel.classList.remove("spin");
      document.getElementById("rouletteResult").textContent = rouletteIdeas[Math.floor(Math.random() * rouletteIdeas.length)];
    }, 1200);
  });
});

const gameArea = document.getElementById("gameArea");
let gameTimer = null;
let spawnTimer = null;
let score = 0;
let timeLeft = 30;

document.getElementById("startGameBtn").addEventListener("click", () => {
  score = 0;
  timeLeft = 30;
  document.getElementById("gameScore").textContent = score;
  document.getElementById("gameTime").textContent = timeLeft;
  gameArea.innerHTML = "";

  clearInterval(gameTimer);
  clearInterval(spawnTimer);

  gameTimer = setInterval(() => {
    timeLeft--;
    document.getElementById("gameTime").textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(gameTimer);
      clearInterval(spawnTimer);
      gameArea.innerHTML = `<p class="game-placeholder">Крај на игра · Поени: ${score}</p>`;
    }
  }, 1000);

  spawnTimer = setInterval(spawnItem, 700);
});

function spawnItem() {
  const calmItems = ["🌟", "💗", "🌿", "☁️", "🦋"];
  const stressItems = ["😡", "📚", "⚡", "⏰"];
  const calm = Math.random() > 0.28;
  const item = document.createElement("span");
  item.className = "falling-item";
  item.textContent = calm ? calmItems[Math.floor(Math.random() * calmItems.length)] : stressItems[Math.floor(Math.random() * stressItems.length)];
  item.style.left = Math.random() * 88 + "%";
  item.style.animationDuration = (2.8 + Math.random() * 2.2) + "s";
  item.addEventListener("click", () => {
    score += calm ? 2 : -2;
    if (score < 0) score = 0;
    document.getElementById("gameScore").textContent = score;
    item.remove();
  });
  gameArea.appendChild(item);
  setTimeout(() => item.remove(), 5200);
}

document.querySelectorAll(".mood-options button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".mood-options button").forEach((b) => b.classList.remove("active"));
    button.classList.add("active");
    const entry = { mood: button.dataset.mood, emoji: button.dataset.emoji, date: new Date().toLocaleDateString("mk-MK") };
    appState.moodEntries.push(entry);
    appState.moodEntries = appState.moodEntries.slice(-7);
    storage.set("mb_moodEntries", appState.moodEntries);
    document.getElementById("moodSaved").textContent = `Зачувано: ${entry.emoji} ${entry.mood}`;
    document.getElementById("todayMoodText").textContent = `Денес се чувствуваш: ${entry.emoji} ${entry.mood}`;
    renderMoodCalendar();
    updateDashboard();
    drawMoodChart();
  });
});

document.getElementById("sleepBtn").addEventListener("click", () => {
  const hours = Number(document.getElementById("sleepHours").value);
  const box = document.getElementById("sleepResult");
  box.className = "sleep-result";

  if (!hours && hours !== 0) {
    box.textContent = "Внеси број на часови.";
    return;
  }

  let text, className, status;
  if (hours >= 8 && hours <= 10) {
    text = "Зелено: добар сон. Продолжи со оваа рутина.";
    className = "good";
    status = "добар";
  } else if (hours >= 6 && hours < 8) {
    text = "Жолто: океј, но обиди се со малку повеќе сон.";
    className = "okay";
    status = "среден";
  } else {
    text = "Црвено: недоволно/премногу сон. Намали екран пред спиење и направи мирна рутина.";
    className = "poor";
    status = "лош";
  }

  box.classList.add(className);
  box.textContent = text;
  appState.lastSleep = { hours, status };
  storage.set("mb_lastSleep", appState.lastSleep);
  updateDashboard();
});

let detoxSeconds = 300;
let detoxInterval = null;

function renderTimer() {
  const minutes = Math.floor(detoxSeconds / 60).toString().padStart(2, "0");
  const seconds = (detoxSeconds % 60).toString().padStart(2, "0");
  document.getElementById("detoxTimer").textContent = `${minutes}:${seconds}`;
}

document.getElementById("startTimerBtn").addEventListener("click", () => {
  clearInterval(detoxInterval);
  detoxInterval = setInterval(() => {
    detoxSeconds--;
    renderTimer();
    if (detoxSeconds <= 0) {
      clearInterval(detoxInterval);
      alert("Одлично! Заврши 5 минутна дигитална пауза.");
      detoxSeconds = 300;
      renderTimer();
    }
  }, 1000);
});

document.getElementById("resetTimerBtn").addEventListener("click", () => {
  clearInterval(detoxInterval);
  detoxSeconds = 300;
  renderTimer();
});

document.querySelectorAll(".challenge-card").forEach((card) => {
  if (appState.completedChallenges.includes(card.dataset.challenge)) {
    card.classList.add("done");
    card.querySelector("span").textContent = "Завршено ✓";
  }

  card.addEventListener("click", () => {
    const id = card.dataset.challenge;
    if (!appState.completedChallenges.includes(id)) appState.completedChallenges.push(id);
    else appState.completedChallenges = appState.completedChallenges.filter((x) => x !== id);

    storage.set("mb_completedChallenges", appState.completedChallenges);
    card.classList.toggle("done");
    card.querySelector("span").textContent = card.classList.contains("done") ? "Завршено ✓" : "Завршено";
    updateDashboard();
  });
});

function renderMoodCalendar() {
  const container = document.getElementById("moodCalendar");
  const entries = appState.moodEntries;
  const emptySlots = Math.max(0, 7 - entries.length);
  container.innerHTML = "";

  for (let i = 0; i < emptySlots; i++) {
    const box = document.createElement("div");
    box.className = "day-box";
    box.innerHTML = `<span>—</span><small>празно</small>`;
    container.appendChild(box);
  }

  entries.forEach((entry) => {
    const box = document.createElement("div");
    box.className = "day-box";
    box.innerHTML = `<span>${entry.emoji}</span><small>${entry.date}</small>`;
    container.appendChild(box);
  });

  const positive = entries.filter((e) => e.mood === "добро").length;
  const stressful = entries.filter((e) => e.mood === "стресно").length;
  let summary = "Нема доволно податоци за неделен преглед.";

  if (entries.length >= 3) {
    summary = positive >= stressful
      ? "Оваа недела е претежно позитивна или стабилна. Продолжи со малите здрави навики."
      : "Оваа недела има повеќе стресни записи. Пробај повеќе паузи и разговор со доверлива личност.";
  }

  document.getElementById("weekSummary").textContent = summary;
}

function updateDashboard() {
  document.getElementById("completedCount").textContent = appState.completedChallenges.length;
  const lastMoodEntry = appState.moodEntries[appState.moodEntries.length - 1];
  document.getElementById("lastMood").textContent = lastMoodEntry ? lastMoodEntry.emoji : "—";
  document.getElementById("lastStress").textContent = appState.lastStress ? `${appState.lastStress.score}/15` : "—";
  document.getElementById("lastSleep").textContent = appState.lastSleep ? `${appState.lastSleep.hours}h` : "—";
}

function drawMoodChart() {
  const canvas = document.getElementById("moodChart");
  const ctx = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const counts = { добро: 0, неутрално: 0, стресно: 0 };
  appState.moodEntries.forEach((e) => counts[e.mood]++);

  const values = [
    { label: "Добро", value: counts.добро },
    { label: "Неутрално", value: counts.неутрално },
    { label: "Стресно", value: counts.стресно }
  ];

  const max = Math.max(1, ...values.map((v) => v.value));
  const barWidth = 90;
  const gap = 55;
  const startX = 70;

  ctx.font = "16px Poppins";
  ctx.fillStyle = "#6b7280";
  ctx.fillText("Записи за расположение", 22, 28);

  values.forEach((item, index) => {
    const x = startX + index * (barWidth + gap);
    const barHeight = (item.value / max) * 140;
    const y = height - 58 - barHeight;

    const gradient = ctx.createLinearGradient(x, y, x, height - 58);
    gradient.addColorStop(0, "#7c6cff");
    gradient.addColorStop(1, "#ffb7d5");

    ctx.fillStyle = gradient;
    roundRect(ctx, x, y, barWidth, barHeight || 6, 16);
    ctx.fill();

    ctx.fillStyle = "#1f2340";
    ctx.font = "bold 18px Poppins";
    ctx.fillText(item.value, x + 38, y - 10);

    ctx.fillStyle = "#6b7280";
    ctx.font = "13px Poppins";
    ctx.fillText(item.label, x + 12, height - 24);
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

/* Фиксен чет */
const chatWindow = document.getElementById("chatWindow");
document.getElementById("chatButton").addEventListener("click", () => chatWindow.classList.toggle("open"));
document.getElementById("closeChat").addEventListener("click", () => chatWindow.classList.remove("open"));

const chatResponses = [
  { keys: ["умор", "замор", "уморно", "измор"], text: "Пробај 5 минути пауза, испиј вода и избери само една мала задача за почеток." },
  { keys: ["стрес", "стресно", "нервоз"], text: "Пробај ја вежбата за дишење. Потоа запиши која задача е најважна и почни од неа." },
  { keys: ["таж", "лошо"], text: "Жал ми е што се чувствуваш така. Разговор со доверлива личност може да помогне." },
  { keys: ["сон", "спие"], text: "Намали телефон 30 минути пред спиење и направи мирна вечерна рутина." },
  { keys: ["учење", "тест", "испрашување"], text: "Пробај 25 минути учење и 5 минути пауза. Полесно е кога задачите се поделени." },
  { keys: ["пријател", "другар", "сама", "сам"], text: "Испрати порака до некој близок. Поддршката е важен дел од добросостојбата." }
];

document.getElementById("chatForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = document.getElementById("chatInput");
  const text = input.value.trim();
  if (!text) return;

  addMessage(text, "user-message");

  const lower = text.toLowerCase();
  const found = chatResponses.find((item) => item.keys.some((key) => lower.includes(key)));
  const response = found ? found.text : "Те слушам. Пробај мала пауза, запиши што чувствуваш и разговарај со доверлива личност.";

  setTimeout(() => addMessage(response, "bot-message"), 350);
  input.value = "";
});

function addMessage(text, className) {
  const body = document.getElementById("chatBody");
  const msg = document.createElement("div");
  msg.className = className;
  msg.textContent = text;
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
}

renderMoodCalendar();
renderTimer();
updateDashboard();
drawMoodChart();

const lastMoodEntry = appState.moodEntries[appState.moodEntries.length - 1];
if (lastMoodEntry) {
  document.getElementById("todayMoodText").textContent = `Последно расположение: ${lastMoodEntry.emoji} ${lastMoodEntry.mood}`;
  document.getElementById("moodSaved").textContent = `Зачувано: ${lastMoodEntry.emoji} ${lastMoodEntry.mood}`;
}
