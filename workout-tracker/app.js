(function () {
  'use strict';

  var STORAGE_KEY = 'workoutTrackerData';

  var DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var DAY_ACCENTS = [
    'var(--botanist)', 'var(--aquamarine)', 'var(--grape-soda)',
    'var(--matcha)', 'var(--grape-soda)', 'var(--aquamarine)', 'var(--botanist)'
  ];
  var MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  var state = {
    currentWeekStart: startOfWeek(today()),
    view: 'week'
  };

  var data = loadData();

  // ---------- storage ----------
  function loadData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { entries: {} };
      var parsed = JSON.parse(raw);
      if (!parsed.entries) parsed.entries = {};
      return parsed;
    } catch (e) {
      console.error('Could not read saved data, starting fresh.', e);
      return { entries: {} };
    }
  }

  function saveData() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Could not save data.', e);
    }
  }

  function getEntry(key) {
    return data.entries[key] || { name: '', done: false, muted: false, time: '', notes: '' };
  }

  function updateEntry(key, patch) {
    var current = getEntry(key);
    data.entries[key] = Object.assign({}, current, patch);
    saveData();
  }

  // ---------- date helpers ----------
  function today() {
    var d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  function addDays(date, n) {
    var d = new Date(date);
    d.setDate(d.getDate() + n);
    return d;
  }

  function startOfWeek(date) {
    var d = new Date(date);
    var dow = (d.getDay() + 6) % 7; // Monday = 0
    return addDays(d, -dow);
  }

  function dateKey(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var day = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  function sameDay(a, b) {
    return dateKey(a) === dateKey(b);
  }

  function formatWeekRange(weekStart) {
    var weekEnd = addDays(weekStart, 6);
    var sameYear = weekStart.getFullYear() === weekEnd.getFullYear();
    var sameMonth = weekStart.getMonth() === weekEnd.getMonth();
    var startStr = MONTH_NAMES[weekStart.getMonth()] + ' ' + weekStart.getDate();
    var endStr = (sameMonth ? '' : MONTH_NAMES[weekEnd.getMonth()] + ' ') + weekEnd.getDate();
    return startStr + ' \u2013 ' + endStr + ', ' + weekEnd.getFullYear();
  }

  function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ---------- week view ----------
  function renderWeek() {
    document.getElementById('week-range-label').textContent = formatWeekRange(state.currentWeekStart);

    var list = document.getElementById('day-list');
    list.innerHTML = '';

    for (var i = 0; i < 7; i++) {
      var date = addDays(state.currentWeekStart, i);
      var key = dateKey(date);
      var entry = getEntry(key);
      list.appendChild(buildDayRow(date, key, entry, i));
    }
  }

  function buildDayRow(date, key, entry, dayIndex) {
    var row = document.createElement('div');
    row.className = 'day-row';
    if (entry.muted) row.classList.add('is-muted');
    if (sameDay(date, today())) row.classList.add('is-today');
    row.style.setProperty('--day-accent', DAY_ACCENTS[dayIndex]);

    var showDetails = entry.done && !entry.muted;

    row.innerHTML =
      '<div class="day-row-top">' +
        '<span class="day-label">' + DAY_NAMES[dayIndex] + '</span>' +
        '<input type="text" class="name-input" placeholder="What\'s the plan?" value="' + escapeHtml(entry.name) + '"' + (entry.muted ? ' disabled' : '') + '>' +
        '<label class="done-toggle"><input type="checkbox" class="done-input"' + (entry.done ? ' checked' : '') + (entry.muted ? ' disabled' : '') + '> Done</label>' +
        '<button type="button" class="mute-btn' + (entry.muted ? ' is-active' : '') + '" aria-label="' + (entry.muted ? 'Unmute this day' : 'Mute this day') + '" aria-pressed="' + (entry.muted ? 'true' : 'false') + '">' + moonIcon() + '</button>' +
      '</div>' +
      '<div class="day-row-details' + (showDetails ? '' : ' is-hidden') + '">' +
        '<input type="time" class="time-input" value="' + escapeHtml(entry.time) + '">' +
        '<input type="text" class="notes-input" placeholder="Quick notes..." value="' + escapeHtml(entry.notes) + '">' +
      '</div>' +
      (entry.muted ? '<div class="muted-note">Muted \u2014 excluded from tracking and stats</div>' : '');

    row.querySelector('.name-input').addEventListener('input', function (e) {
      updateEntry(key, { name: e.target.value });
    });

    row.querySelector('.done-input').addEventListener('change', function (e) {
      updateEntry(key, { done: e.target.checked });
      renderWeek();
    });

    row.querySelector('.mute-btn').addEventListener('click', function () {
      updateEntry(key, { muted: !getEntry(key).muted });
      renderWeek();
    });

    var timeInput = row.querySelector('.time-input');
    if (timeInput) {
      timeInput.addEventListener('change', function (e) {
        updateEntry(key, { time: e.target.value });
      });
    }

    var notesInput = row.querySelector('.notes-input');
    if (notesInput) {
      notesInput.addEventListener('input', function (e) {
        updateEntry(key, { notes: e.target.value });
      });
    }

    return row;
  }

  function moonIcon() {
    return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  // ---------- stats view ----------
  function computeStreak() {
    var streak = 0;
    var d = today();
    var first = true;
    while (true) {
      var key = dateKey(d);
      var entry = data.entries[key];
      if (entry && entry.muted) {
        d = addDays(d, -1);
        first = false;
        continue;
      }
      if (entry && entry.done) {
        streak++;
        d = addDays(d, -1);
        first = false;
        continue;
      }
      if (first) {
        d = addDays(d, -1);
        first = false;
        continue;
      }
      break;
    }
    return streak;
  }

  function computeTotal() {
    var total = 0;
    Object.keys(data.entries).forEach(function (key) {
      var e = data.entries[key];
      if (e.done && !e.muted) total++;
    });
    return total;
  }

  function computeWeeklySeries(numWeeks) {
    var weeks = [];
    var cursor = startOfWeek(today());
    for (var i = numWeeks - 1; i >= 0; i--) {
      var weekStart = addDays(cursor, -7 * i);
      var count = 0;
      for (var d = 0; d < 7; d++) {
        var key = dateKey(addDays(weekStart, d));
        var e = data.entries[key];
        if (e && e.done && !e.muted) count++;
      }
      weeks.push({ label: MONTH_NAMES[weekStart.getMonth()] + ' ' + weekStart.getDate(), count: count });
    }
    return weeks;
  }

  function renderStats() {
    document.getElementById('stat-streak').textContent = computeStreak();
    document.getElementById('stat-total').textContent = computeTotal();

    var series = computeWeeklySeries(8);
    var hasData = series.some(function (w) { return w.count > 0; }) || computeTotal() > 0;

    var chartEl = document.getElementById('trend-chart');
    var emptyEl = document.getElementById('trend-empty');

    if (!hasData) {
      chartEl.innerHTML = '';
      emptyEl.classList.remove('is-hidden');
      return;
    }
    emptyEl.classList.add('is-hidden');
    chartEl.innerHTML = buildBarChartSvg(series);
  }

  function buildBarChartSvg(series) {
    var width = 640, height = 180;
    var padding = { top: 10, bottom: 26, left: 10, right: 10 };
    var chartW = width - padding.left - padding.right;
    var chartH = height - padding.top - padding.bottom;
    var maxCount = Math.max.apply(null, series.map(function (w) { return w.count; }));
    if (maxCount < 1) maxCount = 1;

    var n = series.length;
    var gap = 10;
    var barW = (chartW - gap * (n - 1)) / n;

    var bars = '';
    var labels = '';
    for (var i = 0; i < n; i++) {
      var w = series[i];
      var barH = (w.count / maxCount) * (chartH - 18);
      var x = padding.left + i * (barW + gap);
      var y = padding.top + (chartH - 18) - barH;
      bars += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + Math.max(barH, 2) +
        '" rx="4" fill="var(--aquamarine)"></rect>';
      bars += '<text x="' + (x + barW / 2) + '" y="' + (y - 6) + '" text-anchor="middle" class="bar-count">' + w.count + '</text>';
      labels += '<text x="' + (x + barW / 2) + '" y="' + (height - 6) + '" text-anchor="middle" class="bar-label">' + w.label + '</text>';
    }

    return '<svg viewBox="0 0 ' + width + ' ' + height + '" xmlns="http://www.w3.org/2000/svg">' +
      '<style>.bar-count{font:500 11px Inter, sans-serif; fill: var(--ink-soft);} .bar-label{font:400 10px Inter, sans-serif; fill: var(--ink-faint);}</style>' +
      bars + labels +
      '</svg>';
  }

  // ---------- view switching ----------
  function setView(view) {
    state.view = view;
    document.getElementById('week-view').classList.toggle('is-hidden', view !== 'week');
    document.getElementById('stats-view').classList.toggle('is-hidden', view !== 'stats');
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      var active = btn.getAttribute('data-view') === view;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    if (view === 'stats') renderStats();
  }

  // ---------- init ----------
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('prev-week').addEventListener('click', function () {
      state.currentWeekStart = addDays(state.currentWeekStart, -7);
      renderWeek();
    });
    document.getElementById('next-week').addEventListener('click', function () {
      state.currentWeekStart = addDays(state.currentWeekStart, 7);
      renderWeek();
    });
    document.getElementById('jump-today').addEventListener('click', function () {
      state.currentWeekStart = startOfWeek(today());
      renderWeek();
    });
    document.querySelectorAll('.tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setView(btn.getAttribute('data-view'));
      });
    });

    renderWeek();
  });
})();
