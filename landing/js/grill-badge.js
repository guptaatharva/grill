/*!
 * GrillBadge: embeddable "Verified by Grill" badge plugin.
 * Vanilla JS, no dependencies. Renders inside a Shadow DOM so host-page CSS
 * cannot leak in or out.
 *
 * Usage (auto-init):
 *   <script src="grill-badge.js"></script>
 *   <div data-grill-badge data-user="student01" data-repo="shop-api"
 *        data-score="82" data-commit="a1b2c3d" data-theme="dark"></div>
 *
 * Usage (API):
 *   const badge = GrillBadge.mount(el, { user, repo, score, commit, theme });
 *   badge.update({ score: 90 });
 *   badge.destroy();
 */
(function (global) {
  'use strict';

  var DEFAULTS = {
    user: 'student',
    repo: 'repo',
    score: 0,
    commit: '',
    theme: 'dark',
    href: '#'
  };

  var THEMES = {
    dark:  { bg: '#1e1915', fg: '#f3ece4', muted: '#b3a597', border: '#3a312a' },
    light: { bg: '#ffffff', fg: '#1e1915', muted: '#6b5e52', border: '#e2d8cd' }
  };

  var instances = new WeakMap();

  function clampScore(value) {
    var n = parseInt(value, 10);
    if (isNaN(n)) return 0;
    return Math.max(0, Math.min(100, n));
  }

  function level(score) {
    if (score >= 80) return { label: 'Strong', color: '#5fcf8a' };
    if (score >= 60) return { label: 'Solid', color: '#ff7a2f' };
    return { label: 'Developing', color: '#f2c14e' };
  }

  function readDataset(el) {
    var d = el.dataset;
    var opts = {};
    ['user', 'repo', 'score', 'commit', 'theme', 'href'].forEach(function (key) {
      if (d[key] !== undefined) opts[key] = d[key];
    });
    return opts;
  }

  function createEl(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text; // textContent: never injects HTML
    return node;
  }

  function styles(t, lvl, score) {
    // Ring progress: circumference of r=16 circle
    var c = 2 * Math.PI * 16;
    return [
      ':host { display: inline-block; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; }',
      'a { display: inline-flex; align-items: center; gap: 12px; text-decoration: none;',
      '    background: ' + t.bg + '; color: ' + t.fg + '; border: 1px solid ' + t.border + ';',
      '    border-radius: 12px; padding: 10px 16px 10px 10px; line-height: 1.25;',
      '    box-shadow: 0 6px 18px -8px rgba(0,0,0,.35); transition: transform .15s; }',
      'a:hover { transform: translateY(-1px); }',
      'a:focus-visible { outline: 2px solid ' + lvl.color + '; outline-offset: 2px; }',
      '.ring { position: relative; width: 40px; height: 40px; flex: none; }',
      '.ring svg { transform: rotate(-90deg); }',
      '.ring .track { stroke: ' + t.border + '; }',
      '.ring .bar { stroke: ' + lvl.color + '; stroke-dasharray: ' + c + ';',
      '    stroke-dashoffset: ' + (c * (1 - score / 100)) + '; transition: stroke-dashoffset .5s ease; }',
      '.ring span { position: absolute; inset: 0; display: grid; place-items: center;',
      '    font-size: 12px; font-weight: 700; }',
      '.top { font-size: 11px; text-transform: uppercase; letter-spacing: .08em; color: ' + lvl.color + '; font-weight: 700; }',
      '.top::before { content: "\\2713  "; }',
      '.name { font-size: 14px; font-weight: 600; }',
      '.meta { font-size: 11px; color: ' + t.muted + '; font-family: ui-monospace, Consolas, monospace; }'
    ].join('\n');
  }

  function render(instance) {
    var o = instance.options;
    var score = clampScore(o.score);
    var t = THEMES[o.theme] || THEMES.dark;
    var lvl = level(score);
    var root = instance.root;

    root.textContent = '';

    var style = createEl('style');
    style.textContent = styles(t, lvl, score);

    var link = createEl('a');
    link.href = /^(https?:|#|\/)/.test(o.href) ? o.href : '#'; // block javascript: URLs
    link.setAttribute('aria-label',
      'Verified by Grill: ' + o.user + '/' + o.repo + ', score ' + score + ' out of 100, ' + lvl.label);

    var ring = createEl('div', 'ring');
    ring.setAttribute('aria-hidden', 'true');
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 40 40');
    svg.setAttribute('width', '40');
    svg.setAttribute('height', '40');
    ['track', 'bar'].forEach(function (cls) {
      var circle = document.createElementNS(ns, 'circle');
      circle.setAttribute('class', cls);
      circle.setAttribute('cx', '20');
      circle.setAttribute('cy', '20');
      circle.setAttribute('r', '16');
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke-width', '4');
      circle.setAttribute('stroke-linecap', 'round');
      svg.appendChild(circle);
    });
    ring.appendChild(svg);
    ring.appendChild(createEl('span', '', String(score)));

    var text = createEl('div');
    text.appendChild(createEl('div', 'top', 'Verified by Grill · ' + lvl.label));
    text.appendChild(createEl('div', 'name', o.user + ' / ' + o.repo));
    if (o.commit) {
      text.appendChild(createEl('div', 'meta', '@' + String(o.commit).slice(0, 7)));
    }

    link.appendChild(ring);
    link.appendChild(text);
    root.appendChild(style);
    root.appendChild(link);
  }

  function mount(el, options) {
    if (!el || el.nodeType !== 1) throw new Error('GrillBadge.mount: expected an element');

    var existing = instances.get(el);
    if (existing) {
      existing.update(options || {});
      return existing;
    }

    var instance = {
      el: el,
      root: el.shadowRoot || el.attachShadow({ mode: 'open' }),
      options: Object.assign({}, DEFAULTS, readDataset(el), options || {}),
      update: function (next) {
        Object.assign(instance.options, next || {});
        render(instance);
        el.dispatchEvent(new CustomEvent('grillbadge:update', { detail: Object.assign({}, instance.options) }));
        return instance;
      },
      destroy: function () {
        instance.root.textContent = '';
        instances.delete(el);
      }
    };

    instances.set(el, instance);
    render(instance);
    return instance;
  }

  function init(scope) {
    var nodes = (scope || document).querySelectorAll('[data-grill-badge]');
    return Array.prototype.map.call(nodes, function (node) { return mount(node); });
  }

  global.GrillBadge = {
    version: '0.1.0',
    mount: mount,
    init: init,
    get: function (el) { return instances.get(el) || null; }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); });
  } else {
    init();
  }
})(window);
