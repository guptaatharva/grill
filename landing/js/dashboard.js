/* Grill examiner dashboard: sample cohort data + interactions. */
(function () {
  'use strict';

  var STATUS = {
    confirmed:  { label: 'Confirmed',  pill: 'bg-ok/15 text-ok ring-ok/30',       bar: 'bg-ok' },
    overridden: { label: 'Overridden', pill: 'bg-ember-500/15 text-ember-300 ring-ember-500/30', bar: 'bg-ember-500' },
    review:     { label: 'Review',     pill: 'bg-warn/15 text-warn ring-warn/30', bar: 'bg-warn' },
    viva:       { label: 'In viva',    pill: 'bg-live/15 text-live ring-live/30', bar: 'bg-live' },
    pending:    { label: 'Not started', pill: 'bg-coal-600/60 text-ash-300 ring-coal-600', bar: 'bg-ash-500' }
  };

  // Sample data only.
  var sessions = [
    { id: 1,  name: 'Student 01', repo: 'shop-api',        commit: 'a1b2c3d', status: 'confirmed',  viva: 82, tests: [5, 5] },
    { id: 2,  name: 'Student 02', repo: 'library-mgr',     commit: '9f04e1a', status: 'review',     viva: 58, tests: [2, 5] },
    { id: 3,  name: 'Student 03', repo: 'chat-server',     commit: '3c7d2b8', status: 'viva',       viva: null, tests: null },
    { id: 4,  name: 'Student 04', repo: 'expense-tracker', commit: 'e81f0aa', status: 'overridden', viva: 70, was: 74, tests: [4, 5] },
    { id: 5,  name: 'Student 05', repo: 'url-shortener',   commit: '57bc9d2', status: 'confirmed',  viva: 91, tests: [5, 5] },
    { id: 6,  name: 'Student 06', repo: 'todo-rest',       commit: 'c02e6f1', status: 'review',     viva: 44, tests: [1, 5] },
    { id: 7,  name: 'Student 07', repo: 'quiz-engine',     commit: '6ad31be', status: 'confirmed',  viva: 76, tests: [4, 5] },
    { id: 8,  name: 'Student 08', repo: 'hotel-booking',   commit: 'b4e9c07', status: 'pending',    viva: null, tests: null },
    { id: 9,  name: 'Student 09', repo: 'inventory-api',   commit: '11d8f4c', status: 'confirmed',  viva: 67, tests: [3, 5] },
    { id: 10, name: 'Student 10', repo: 'blog-cms',        commit: 'f7a2e93', status: 'review',     viva: 63, tests: [3, 5] },
    { id: 11, name: 'Student 11', repo: 'weather-cache',   commit: '2be5a61', status: 'viva',       viva: null, tests: null },
    { id: 12, name: 'Student 12', repo: 'auth-service',    commit: 'd90c4e5', status: 'confirmed',  viva: 85, tests: [5, 5] }
  ];

  var audit = [
    { who: 'Dr. Rao', what: 'Overrode Student 04 viva 74 → 70', why: 'Q6 answer cited the wrong middleware; follow-up confirmed the gap.', when: 'Today, 10:42' },
    { who: 'System',  what: 'Rescored Student 10 (3 passes averaged)', why: 'Spread 61–65, within ±5%.', when: 'Today, 09:15' },
    { who: 'Dr. Rao', what: 'Edited rubric weight “Error handling” 15% → 20%', why: '', when: 'Yesterday, 17:03' }
  ];

  var filter = 'all';
  var query = '';
  var editing = null;

  var $ = function (sel) { return document.querySelector(sel); };
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- KPIs ---------- */
  function renderKpis() {
    var scored = sessions.filter(function (s) { return s.viva != null; });
    var started = sessions.filter(function (s) { return s.status !== 'pending'; });
    var passed = 0, total = 0;
    scored.forEach(function (s) { if (s.tests) { passed += s.tests[0]; total += s.tests[1]; } });
    var avg = scored.length ? Math.round(scored.reduce(function (a, s) { return a + s.viva; }, 0) / scored.length) : '–';
    var review = sessions.filter(function (s) { return s.status === 'review'; }).length;

    $('[data-kpi="submitted"]').textContent = started.length;
    $('[data-kpi="total"]').textContent = sessions.length;
    $('[data-kpi="avg"]').textContent = avg;
    $('[data-kpi="tests"]').textContent = total ? Math.round(passed / total * 100) + '%' : '–';
    $('[data-kpi="review"]').textContent = review;
    $('[data-count="review"]').textContent = review;
  }

  /* ---------- Histogram ---------- */
  function renderHistogram() {
    var bins = [[0, 39], [40, 49], [50, 59], [60, 69], [70, 79], [80, 89], [90, 100]];
    var counts = bins.map(function (b) {
      return sessions.filter(function (s) { return s.viva != null && s.viva >= b[0] && s.viva <= b[1]; }).length;
    });
    var max = Math.max.apply(null, counts.concat([1]));
    $('#histogram').innerHTML = counts.map(function (c, i) {
      var pass = bins[i][0] >= 60;
      var h = c ? Math.max(8, c / max * 100) : 2;
      return '<div class="group relative flex h-full flex-1 items-end">' +
        '<span class="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-xs text-ash-300 ' + (c ? '' : 'hidden') + '">' + c + '</span>' +
        '<div title="' + bins[i][0] + '–' + bins[i][1] + ': ' + c + ' student' + (c === 1 ? '' : 's') + '" class="w-full rounded-t-md transition-all ' +
        (pass ? 'bg-gradient-to-t from-ember-600 to-ember-300' : 'bg-coal-600 group-hover:bg-ash-500') +
        '" style="height:' + h + '%"></div></div>';
    }).join('');
    $('#histogram-labels').innerHTML = bins.map(function (b) {
      return '<span class="flex-1 text-center">' + (b[0] === 0 ? '<40' : b[0] + '+') + '</span>';
    }).join('');
  }

  /* ---------- Status breakdown ---------- */
  function renderStatus() {
    var keys = Object.keys(STATUS);
    var counts = {};
    keys.forEach(function (k) { counts[k] = sessions.filter(function (s) { return s.status === k; }).length; });
    $('#status-bar').innerHTML = keys.filter(function (k) { return counts[k]; }).map(function (k) {
      return '<div class="' + STATUS[k].bar + ' border-r-2 border-coal-800 last:border-0" style="width:' + (counts[k] / sessions.length * 100) + '%" title="' + STATUS[k].label + ': ' + counts[k] + '"></div>';
    }).join('');
    $('#status-legend').innerHTML = keys.map(function (k) {
      return '<li class="flex items-center gap-3"><span class="h-2.5 w-2.5 rounded-full ' + STATUS[k].bar + '"></span>' +
        '<span class="text-ash-300">' + STATUS[k].label + '</span><span class="ml-auto font-mono">' + counts[k] + '</span></li>';
    }).join('');
  }

  /* ---------- Filters + table ---------- */
  function renderFilters() {
    var opts = [['all', 'All']].concat(Object.keys(STATUS).map(function (k) { return [k, STATUS[k].label]; }));
    $('#filters').innerHTML = opts.map(function (o) {
      var on = o[0] === filter;
      return '<button type="button" data-filter="' + o[0] + '" aria-pressed="' + on + '" class="whitespace-nowrap rounded-md px-2.5 py-1.5 font-medium ' +
        (on ? 'bg-coal-700 text-ash-50 ring-1 ring-inset ring-coal-600' : 'text-ash-300 hover:text-ash-50') + '">' + o[1] + '</button>';
    }).join('');
  }

  function scoreCell(s) {
    if (s.viva == null) return '<span class="text-ash-500">–</span>';
    var color = s.viva >= 70 ? 'text-ok' : s.viva >= 55 ? 'text-warn' : 'text-bad';
    var was = s.was != null ? '<span class="mr-1 text-ash-500 line-through">' + s.was + '</span>' : '';
    return '<div class="flex items-center gap-3"><span class="w-14 font-mono">' + was + '<span class="' + color + '">' + s.viva + '</span></span>' +
      '<div class="hidden h-1.5 w-20 overflow-hidden rounded-full bg-coal-600 sm:block"><div class="h-full rounded-full bg-ember-500" style="width:' + s.viva + '%"></div></div></div>';
  }

  function testsCell(s) {
    if (!s.tests) return '<span class="text-ash-500">–</span>';
    var dots = '';
    for (var i = 0; i < s.tests[1]; i++) {
      dots += '<span class="h-2 w-2 rounded-sm ' + (i < s.tests[0] ? 'bg-ok' : 'bg-coal-600') + '"></span>';
    }
    return '<div class="flex items-center gap-2"><span class="flex gap-1" aria-hidden="true">' + dots + '</span><span class="font-mono text-xs text-ash-300">' + s.tests[0] + '/' + s.tests[1] + '</span></div>';
  }

  function renderRows() {
    var q = query.trim().toLowerCase();
    var list = sessions.filter(function (s) {
      return (filter === 'all' || s.status === filter) &&
        (!q || s.name.toLowerCase().indexOf(q) > -1 || s.repo.toLowerCase().indexOf(q) > -1);
    });
    $('#empty').classList.toggle('hidden', list.length > 0);
    $('#rows').innerHTML = list.map(function (s) {
      var st = STATUS[s.status];
      var initials = 'S' + s.name.replace(/\D/g, '');
      var canOverride = s.viva != null;
      return '<tr class="hover:bg-coal-700/50">' +
        '<td class="px-5 py-3"><div class="flex items-center gap-3"><span class="grid h-8 w-8 place-items-center rounded-full bg-coal-700 font-mono text-xs text-ash-300">' + esc(initials) + '</span><span class="font-medium">' + esc(s.name) + '</span></div></td>' +
        '<td class="px-5 py-3"><span>' + esc(s.repo) + '</span> <span class="font-mono text-xs text-ash-500">@' + esc(s.commit) + '</span></td>' +
        '<td class="px-5 py-3"><span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ' + st.pill + '">' +
          (s.status === 'viva' ? '<span class="h-1.5 w-1.5 animate-pulse rounded-full bg-live"></span>' : '') + st.label + '</span></td>' +
        '<td class="px-5 py-3">' + scoreCell(s) + '</td>' +
        '<td class="px-5 py-3">' + testsCell(s) + '</td>' +
        '<td class="px-5 py-3 text-right">' +
          (canOverride ? '<button type="button" data-override="' + s.id + '" class="rounded-lg border border-coal-600 px-3 py-1.5 text-xs font-medium text-ash-300 hover:border-ember-500 hover:text-ember-300">Override</button>' : '') +
          (s.status === 'review' ? ' <button type="button" data-confirm="' + s.id + '" class="rounded-lg bg-ok/15 px-3 py-1.5 text-xs font-medium text-ok hover:bg-ok/25">Confirm</button>' : '') +
        '</td></tr>';
    }).join('');
  }

  /* ---------- Audit ---------- */
  function renderAudit() {
    $('#audit-list').innerHTML = audit.map(function (a) {
      var dot = a.who === 'System' ? 'bg-live' : 'bg-ember-500';
      return '<li class="relative"><span class="absolute -left-[25px] top-1.5 h-2.5 w-2.5 rounded-full ring-4 ring-coal-800 ' + dot + '"></span>' +
        '<p><span class="font-medium">' + esc(a.who) + '</span> <span class="text-ash-300">' + esc(a.what) + '</span></p>' +
        (a.why ? '<p class="mt-0.5 text-ash-300">“' + esc(a.why) + '”</p>' : '') +
        '<p class="mt-0.5 font-mono text-xs text-ash-500">' + esc(a.when) + '</p></li>';
    }).join('');
  }

  function renderAll() {
    renderKpis(); renderHistogram(); renderStatus(); renderFilters(); renderRows(); renderAudit();
  }

  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.remove('opacity-0', 'translate-y-4');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { t.classList.add('opacity-0', 'translate-y-4'); }, 2200);
  }

  function now() {
    var d = new Date();
    return 'Today, ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }

  /* ---------- Events ---------- */
  $('#filters').addEventListener('click', function (e) {
    var b = e.target.closest('[data-filter]');
    if (!b) return;
    filter = b.getAttribute('data-filter');
    renderFilters(); renderRows();
  });

  $('#search').addEventListener('input', function (e) { query = e.target.value; renderRows(); });

  $('#rows').addEventListener('click', function (e) {
    var ov = e.target.closest('[data-override]');
    var cf = e.target.closest('[data-confirm]');
    if (cf) {
      var s = sessions.find(function (x) { return x.id === +cf.getAttribute('data-confirm'); });
      s.status = 'confirmed';
      audit.unshift({ who: 'Dr. Rao', what: 'Confirmed ' + s.name + ' at ' + s.viva, why: '', when: now() });
      renderAll();
      toast(s.name + ' confirmed');
    }
    if (ov) {
      editing = sessions.find(function (x) { return x.id === +ov.getAttribute('data-override'); });
      $('#ov-name').textContent = editing.name;
      $('#ov-current').textContent = editing.viva;
      $('#ov-score').value = editing.viva;
      $('#ov-reason').value = '';
      $('#ov-error').classList.add('hidden');
      $('#override').showModal();
      $('#ov-score').focus();
    }
  });

  $('#ov-save').addEventListener('click', function (e) {
    var score = parseInt($('#ov-score').value, 10);
    var reason = $('#ov-reason').value.trim();
    var err = $('#ov-error');
    if (isNaN(score) || score < 0 || score > 100) { e.preventDefault(); err.textContent = 'Score must be between 0 and 100.'; err.classList.remove('hidden'); return; }
    if (reason.length < 10) { e.preventDefault(); err.textContent = 'Give a reason of at least 10 characters. It goes in the audit trail.'; err.classList.remove('hidden'); return; }
    if (score === editing.viva) { e.preventDefault(); err.textContent = 'That is the current score.'; err.classList.remove('hidden'); return; }
    var old = editing.viva;
    if (editing.was == null) editing.was = old;
    editing.viva = score;
    editing.status = 'overridden';
    audit.unshift({ who: 'Dr. Rao', what: 'Overrode ' + editing.name + ' viva ' + old + ' → ' + score, why: reason, when: now() });
    renderAll();
    toast('Override saved and logged');
  });

  $('#export-btn').addEventListener('click', function () {
    var head = ['student', 'repo', 'commit', 'status', 'viva', 'original_viva', 'tests_passed', 'tests_total'];
    var lines = [head.join(',')].concat(sessions.map(function (s) {
      return [s.name, s.repo, s.commit, STATUS[s.status].label, s.viva == null ? '' : s.viva, s.was == null ? '' : s.was,
        s.tests ? s.tests[0] : '', s.tests ? s.tests[1] : ''].map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(',');
    }));
    var url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/csv' }));
    var a = document.createElement('a');
    a.href = url; a.download = 'csc413-section-b.csv';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast('CSV exported');
  });

  // Mobile sidebar
  var sidebar = $('#sidebar'), backdrop = $('#backdrop'), menuBtn = $('#menu-btn');
  function setMenu(open) {
    sidebar.classList.toggle('-translate-x-full', !open);
    backdrop.classList.toggle('hidden', !open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.addEventListener('click', function () { setMenu(sidebar.classList.contains('-translate-x-full')); });
  backdrop.addEventListener('click', function () { setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  renderAll();
})();
