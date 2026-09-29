/**
 * DEVFOLIO — script.js
 */
"use strict";

/* =========================================================
   PROJECT DATA
   Leave empty to show the academic empty state.
   Add entries to render project cards.
   ========================================================= */
const PROJECTS = [];

/* --------------------------------------------------------- */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* THEME */
const THEME_KEY = "devfolio-theme";
const root = document.documentElement;

function getStoredTheme() {
  try { return localStorage.getItem(THEME_KEY); } catch { return null; }
}
function storeTheme(theme) {
  try { localStorage.setItem(THEME_KEY, theme); } catch {}
}
function applyTheme(theme) {
  root.setAttribute("data-theme", theme);
}
function initTheme() {
  const stored = getStoredTheme();
  const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  applyTheme(stored || (prefersLight ? "light" : "dark"));
}
$(".theme-toggle")?.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  storeTheme(next);
});

/* SCROLL PROGRESS + TOPBAR */
const progressBar = $(".scroll-progress");
const topbar = $(".topbar");

function onScroll() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = pct + "%";
  topbar?.classList.toggle("is-scrolled", scrollTop > 8);
}
window.addEventListener("scroll", onScroll, { passive: true });

/* PROJECTS RENDER */
function renderProjects() {
  const wrap  = $("#projects");
  const empty = $("#projects-empty");
  if (!wrap) return;

  if (!Array.isArray(PROJECTS) || PROJECTS.length === 0) {
    wrap.hidden = true;
    wrap.innerHTML = "";
    if (empty) empty.hidden = false;
    return;
  }

  if (empty) empty.hidden = true;
  wrap.hidden = false;

  wrap.innerHTML = PROJECTS.map((p) => {
    const href = p.href || "#";
    const target = p.href ? ' target="_blank" rel="noreferrer"' : "";
    return `
      <a class="project" href="${href}"${target} aria-label="${p.title}">
        <div class="project__thumb">
          ${p.badge ? `<span class="chip project__badge">${p.badge}</span>` : ""}
          <img class="project__img" src="${p.img}" alt="${p.title}" loading="lazy" />
        </div>
        <div class="project__body">
          <h3 class="project__title">${p.title}</h3>
          <p class="project__tag">${p.tag}</p>
        </div>
      </a>
    `;
  }).join("");
}

/* TABS */
function initTabs() {
  const tabs = $$(".tab");
  const indicator = $(".tabs__indicator");
  if (!tabs.length) return;

  function moveIndicator(tab) {
    if (!indicator) return;
    indicator.style.width = tab.offsetWidth + "px";
    indicator.style.transform = `translateX(${tab.offsetLeft - 6}px)`;
  }
  function activate(tab, focus = true) {
    tabs.forEach((t) => {
      const isTarget = t === tab;
      t.classList.toggle("is-active", isTarget);
      t.setAttribute("aria-selected", String(isTarget));
      t.tabIndex = isTarget ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls"));
      if (panel) {
        panel.classList.toggle("is-active", isTarget);
        panel.hidden = !isTarget;
      }
    });
    moveIndicator(tab);
    if (focus) tab.focus();
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => activate(tab, false));
    tab.addEventListener("keydown", (e) => {
      const map = { ArrowRight: 1, ArrowLeft: -1, Home: "first", End: "last" };
      const action = map[e.key];
      if (!action) return;
      e.preventDefault();
      if (action === "first") activate(tabs[0]);
      else if (action === "last") activate(tabs[tabs.length - 1]);
      else activate(tabs[(i + action + tabs.length) % tabs.length]);
    });
  });

  const active = $(".tab.is-active") || tabs[0];
  requestAnimationFrame(() => moveIndicator(active));
  window.addEventListener("resize", () => moveIndicator($(".tab.is-active") || tabs[0]));
}

/* FORM */
function initForm() {
  const form = $("#contact-form");
  const status = $("#form-status");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      status.textContent = "Please fill in all required fields correctly.";
      status.style.color = "var(--danger)";
      return;
    }
    const name = form.name.value.trim();
    status.textContent = `Thanks ${name || "there"} — your message is on its way!`;
    status.style.color = "var(--success)";
    form.reset();
    setTimeout(() => (status.textContent = ""), 6000);
  });
}

/* CURSOR */
function initCursor() {
  if (window.matchMedia("(hover: none)").matches) return;
  const cursor = $(".cursor");
  const dot = $(".cursor-dot");
  if (!cursor || !dot) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let cx = mx, cy = my;

  window.addEventListener("mousemove", (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    document.body.classList.add("has-cursor");
  });

  function tick() {
    cx += (mx - cx) * 0.15;
    cy += (my - cy) * 0.15;
    cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  tick();

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest("a, button, input, textarea, .chip, .tab"))
      cursor.classList.add("is-hover");
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest("a, button, input, textarea, .chip, .tab"))
      cursor.classList.remove("is-hover");
  });
}

/* BOOT */
function init() {
  initTheme();
  renderProjects();
  initTabs();
  initForm();
  initCursor();
  onScroll();

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}
document.addEventListener("DOMContentLoaded", init);