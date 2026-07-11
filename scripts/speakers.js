const AVATAR_COLORS = ["#004f9f", "#1ca64d", "#862e91", "#c49a2c", "#c0392b", "#0f8a8a"];

// Where each track meets; sessions open to everyone default to the main venue room.
const TRACK_ROOMS = {
  technical: "Colloquium Room 906",
  careers: "Room 203",
  wie: "Room 205",
  all: "Colloquium Room 906"
};

let speakers = [];
let schedule = [];

document.addEventListener("DOMContentLoaded", async () => {
  const gridEl = document.getElementById("speakers-grid");
  const searchEl = document.getElementById("speakers-search");
  const modalEl = document.getElementById("speakers-modal");
  if (!gridEl) return;

  try {
    const [speakersRes, scheduleRes] = await Promise.all([fetch("speakers.json"), fetch("schedule.json")]);
    if (!speakersRes.ok) throw new Error("Network response not ok.");
    speakers = await speakersRes.json();
    schedule = scheduleRes.ok ? await scheduleRes.json() : [];
  } catch (err) {
    console.error("Error loading speakers:", err);
    gridEl.innerHTML = "<p>Error loading speaker data.</p>";
    return;
  }

  renderGrid(gridEl, speakers);

  searchEl.addEventListener("input", () => {
    const query = searchEl.value.trim().toLowerCase();
    const filtered = query
      ? speakers.filter((s) =>
          [s.name, s.affiliation, s.title].some((field) => (field || "").toLowerCase().includes(query))
        )
      : speakers;
    renderGrid(gridEl, filtered);
  });

  gridEl.addEventListener("click", (e) => {
    const card = e.target.closest(".speaker-card");
    if (!card) return;
    openModal(speakers[Number(card.dataset.index)]);
  });

  modalEl.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) closeModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
});

function renderGrid(container, list) {
  if (list.length === 0) {
    container.innerHTML = `<p class="speakers-empty">No speakers match your search.</p>`;
    return;
  }

  container.innerHTML = list
    .map((speaker) => {
      const index = speakers.indexOf(speaker);
      return `
        <button type="button" class="speaker-card" data-index="${index}">
          ${renderPhoto(speaker)}
          <div class="speaker-card-name">${speaker.name}</div>
          ${speaker.affiliation ? `<div class="speaker-card-affiliation">${speaker.affiliation}</div>` : ""}
        </button>
      `;
    })
    .join("");
}

function renderPhoto(speaker) {
  return `
    <img
      class="speaker-card-photo"
      src="resources/speakerpictures/${speaker.photo}"
      alt="${speaker.name}"
      loading="lazy"
      onerror="this.replaceWith(makeAvatar('${escapeAttr(speaker.name)}'))">
  `;
}

function makeAvatar(name) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const color = AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length];
  const span = document.createElement("span");
  span.className = "speaker-card-photo speaker-card-avatar";
  span.style.background = color;
  span.textContent = initials;
  return span;
}

function parseTime12h(timeStr) {
  const m = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const ap = m[3].toUpperCase();
  if (ap === "PM" && h !== 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return { h, m: min };
}

function formatTime12h(h, m) {
  const ap = h < 12 ? "AM" : "PM";
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ap}`;
}

function formatTimeRange(timeStr, duration) {
  const start = parseTime12h(timeStr);
  if (!start) return timeStr;
  const totalMinutes = start.h * 60 + start.m + duration;
  const end = { h: Math.floor(totalMinutes / 60) % 24, m: totalMinutes % 60 };
  return `${formatTime12h(start.h, start.m)} – ${formatTime12h(end.h, end.m)}`;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function escapeAttr(str) {
  return String(str).replace(/'/g, "\\'");
}

// Names are spelled slightly differently between speakers.json and schedule.json
// (e.g. "Anuradha C Bahl" vs "Anuradha C. Bahl"), so compare loosely.
function normalizeName(str) {
  return String(str)
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function findSessionsForSpeaker(name) {
  const target = normalizeName(name);
  const matches = [];

  schedule.forEach((item) => {
    item.sessions.forEach((s) => {
      if ((s.speakers || []).some((n) => normalizeName(n) === target)) {
        matches.push({
          dayLabel: item.dayLabel,
          time: item.time,
          duration: item.duration,
          room: TRACK_ROOMS[s.track]
        });
      }
    });
  });

  return matches;
}

function renderSessionSchedule(speaker) {
  const matches = findSessionsForSpeaker(speaker.name);
  if (matches.length === 0) return "";

  return matches
    .map((m) => {
      const timeRange = m.duration ? formatTimeRange(m.time, m.duration) : m.time;
      const room = m.room ? ` · ${m.room}` : "";
      return `<div class="speakers-modal-session-when">${m.dayLabel} · ${timeRange}${room}</div>`;
    })
    .join("");
}

function openModal(speaker) {
  const modalEl = document.getElementById("speakers-modal");
  const bodyEl = document.getElementById("speakers-modal-body");

  const formattedAbstract = (speaker.abstract || "")
    .split("\n\n")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${p}</p>`)
    .join("");

  bodyEl.innerHTML = `
    ${renderPhoto(speaker)}
    <h3 id="speakers-modal-name">${speaker.name}</h3>
    ${speaker.affiliation ? `<h4>${speaker.affiliation}</h4>` : ""}
    ${speaker.title ? `<div class="speakers-modal-session"><span class="speakers-modal-session-label">Session Title</span><div class="speakers-modal-session-title">${speaker.title}</div>${renderSessionSchedule(speaker)}</div>` : ""}
    ${formattedAbstract ? `<div class="speakers-modal-abstract">${formattedAbstract}</div>` : ""}
  `;

  modalEl.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  const modalEl = document.getElementById("speakers-modal");
  modalEl.hidden = true;
  document.body.style.overflow = "";
}
