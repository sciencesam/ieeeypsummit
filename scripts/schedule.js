const TRACKS = {
  all: { label: "All Attendees" },
  technical: { label: "Technical Innovation & Applied AI", room: "Colloquium Room 906" },
  careers: { label: "AI in Careers & Professional Growth", room: "Room 203" },
  wie: { label: "Women in Engineering", room: "Room 205" }
};

const DAYS = [
  { key: "friday", label: "Friday", sub: "Aug 7", date: "2026-08-07" },
  { key: "saturday", label: "Saturday", sub: "Aug 8", date: "2026-08-08" },
  { key: "sunday", label: "Sunday", sub: "Aug 9", date: "2026-08-09" }
];

let schedule = [];
let activeDay = "friday";
let activeTrack = "all";

document.addEventListener("DOMContentLoaded", async () => {
  const dayTabsEl = document.getElementById("schedule-day-tabs");
  const trackFilterEl = document.getElementById("schedule-track-filter");
  const timelineEl = document.getElementById("schedule-timeline");
  if (!timelineEl) return;

  try {
    const response = await fetch("schedule.json");
    if (!response.ok) throw new Error("Network response not ok.");
    schedule = await response.json();
  } catch (err) {
    console.error("Error loading schedule:", err);
    timelineEl.innerHTML = "<p>Error loading schedule data.</p>";
    return;
  }

  const today = DAYS.find((d) => d.date === todayEasternISO());
  if (today) activeDay = today.key;

  renderDayTabs(dayTabsEl);
  renderTrackFilter(trackFilterEl);
  renderTimeline(timelineEl);

  // Refresh the "happening now" highlight every minute.
  setInterval(() => renderTimeline(timelineEl), 60000);
});

function renderDayTabs(container) {
  if (!container) return;
  container.innerHTML = DAYS.map(
    (day) => `
      <button
        type="button"
        class="schedule-tab${day.key === activeDay ? " active" : ""}"
        data-day="${day.key}">
        ${day.label}<span>${day.sub}</span>
      </button>
    `
  ).join("");

  container.querySelectorAll(".schedule-tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeDay = btn.dataset.day;
      container.querySelectorAll(".schedule-tab").forEach((b) => b.classList.toggle("active", b === btn));
      renderTimeline(document.getElementById("schedule-timeline"));
    });
  });
}

function renderTrackFilter(container) {
  if (!container) return;
  const chips = [{ key: "all", label: "All Tracks" }, ...Object.keys(TRACKS)
    .filter((key) => key !== "all")
    .map((key) => ({ key, label: TRACKS[key].label }))];

  container.innerHTML = chips
    .map(
      (chip) => `
        <button
          type="button"
          class="schedule-chip${chip.key === activeTrack ? " active" : ""}"
          data-track="${chip.key}">
          ${chip.label}
        </button>
      `
    )
    .join("");

  container.querySelectorAll(".schedule-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeTrack = btn.dataset.track;
      container.querySelectorAll(".schedule-chip").forEach((b) => b.classList.toggle("active", b === btn));
      renderTimeline(document.getElementById("schedule-timeline"));
    });
  });
}

function renderTimeline(container) {
  if (!container) return;

  const items = schedule.filter((item) => item.day === activeDay);
  container.innerHTML = items.map((item) => renderItem(item)).join("");
}

function renderItem(item) {
  const sessions =
    activeTrack === "all"
      ? item.sessions
      : item.sessions.filter((s) => s.track === "all" || s.track === activeTrack);

  // Parallel entries with no session left for the selected track filter are hidden.
  if (item.kind === "parallel" && activeTrack !== "all" && sessions.length === 0) {
    return "";
  }

  const duration = item.duration ? `<span class="schedule-duration">${formatDuration(item.duration)}</span>` : "";
  const notes = item.notes ? `<div class="schedule-notes">${item.notes}</div>` : "";
  const isNow = isHappeningNow(item);
  const nowBadge = isNow ? `<span class="schedule-now-badge">NOW</span>` : "";

  let body = "";
  if (sessions.length === 1 && sessions[0].track === "all") {
    body = `<div class="schedule-session schedule-session-all">${renderSessionText(sessions[0])}</div>`;
  } else if (sessions.length > 0) {
    body = `<div class="schedule-sessions schedule-sessions-${sessions.length}">${sessions
      .map(
        (s) => `
          <div class="schedule-session schedule-session-${s.track}${s.muted ? " schedule-session-muted" : ""}">
            <span class="schedule-track-label">${TRACKS[s.track].label}${TRACKS[s.track].room ? ` · ${TRACKS[s.track].room}` : ""}</span>
            ${renderSessionText(s)}
          </div>
        `
      )
      .join("")}</div>`;
  }

  return `
    <div class="schedule-item schedule-kind-${item.kind}${isNow ? " schedule-item-now" : ""}">
      <div class="schedule-time-col">
        <span class="schedule-time">${item.time}</span>
        ${duration}
        ${nowBadge}
      </div>
      <div class="schedule-content-col">
        <div class="schedule-title">${item.title}</div>
        ${body}
        ${notes}
      </div>
    </div>
  `;
}

function renderSessionText(session) {
  const speaker = session.speaker ? `<span class="schedule-speaker">${session.speaker}</span>` : "";
  const continues = session.continuesNote ? `<span class="schedule-continues-tag">→ ${session.continuesNote}</span>` : "";
  return `<span class="schedule-text">${session.text}</span>${speaker}${continues}`;
}

// All event times are Eastern (America/New_York); compare against Eastern "now"
// regardless of the visitor's own timezone/locale.
const EVENT_TIMEZONE = "America/New_York";

function nowEasternParts() {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: EVENT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const parts = fmt.formatToParts(new Date());
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  return { y: get("year"), mo: get("month"), d: get("day"), h: get("hour") % 24, m: get("minute") };
}

function todayEasternISO() {
  const p = nowEasternParts();
  return `${p.y}-${pad2(p.mo)}-${pad2(p.d)}`;
}

// Uses Date.UTC purely as a calendar calculator (handles month/day rollovers);
// no real UTC conversion is happening since both sides use the same Eastern wall-clock values.
function partsToMinutes(p) {
  return Date.UTC(p.y, p.mo - 1, p.d, p.h, p.m) / 60000;
}

function isHappeningNow(item) {
  const day = DAYS.find((d) => d.key === item.day);
  if (!day || !item.duration) return false;

  const t = parseTime12h(item.time);
  if (!t) return false;

  const [y, mo, d] = day.date.split("-").map(Number);
  const startMinutes = partsToMinutes({ y, mo, d, h: t.h, m: t.m });
  const endMinutes = startMinutes + item.duration;
  const nowMinutes = partsToMinutes(nowEasternParts());

  return nowMinutes >= startMinutes && nowMinutes < endMinutes;
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

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins ? `${hrs} hr ${mins} min` : `${hrs} hr`;
}
