// Grill landing page behaviour
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile navigation toggle
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');

  function closeMenu() {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  toggle.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  links.addEventListener('click', function (e) {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      closeMenu();
      toggle.focus();
    }
  });

  // Header border on scroll
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Highlight the nav link for the section in view
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]:not(.btn)');
  if ('IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    navAnchors.forEach(function (a) {
      var section = document.querySelector(a.getAttribute('href'));
      if (section) sectionObserver.observe(section);
    });

    // Reveal cards on scroll
    var revealTargets = document.querySelectorAll('.step, .feature, .timeline li, .table-card, .badge-demo');
    if (!reduceMotion) {
      var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealTargets.forEach(function (el) {
        el.classList.add('reveal');
        revealObserver.observe(el);
      });
    }
  }

  // Hero: typed sample answer + countdown timer
  var typing = document.querySelector('.typing');
  var answer = 'The catch block calls conn.rollback(), so the stock decrement on line 49 is undone. ' +
               'The connection is released in finally on line 57, so it is returned even on error.';
  if (typing) {
    if (reduceMotion) {
      typing.textContent = answer;
    } else {
      var i = 0;
      (function type() {
        typing.textContent = answer.slice(0, ++i);
        if (i < answer.length) setTimeout(type, 28 + Math.random() * 40);
      })();
    }
  }

  var timer = document.querySelector('[data-timer]');
  if (timer && !reduceMotion) {
    var remaining = parseInt(timer.dataset.timer, 10);
    setInterval(function () {
      remaining = remaining > 0 ? remaining - 1 : 90;
      var m = Math.floor(remaining / 60);
      var s = String(remaining % 60).padStart(2, '0');
      timer.textContent = m + ':' + s;
    }, 1000);
  }

  // Badge plugin playground
  var badgeEl = document.querySelector('#badge-preview [data-grill-badge]');
  var preview = document.getElementById('badge-preview');
  var badgeForm = document.getElementById('badge-form');
  if (badgeEl && badgeForm && window.GrillBadge) {
    var badge = GrillBadge.mount(badgeEl);
    badgeForm.addEventListener('input', function () {
      var data = new FormData(badgeForm);
      var theme = data.get('theme');
      preview.classList.toggle('light', theme === 'light');
      badge.update({
        user: data.get('user').trim() || 'student',
        repo: data.get('repo').trim() || 'repo',
        score: data.get('score'),
        theme: theme
      });
    });
  }

  // CTA form: client-side validation only (no backend yet)
  var ctaForm = document.getElementById('cta-form');
  var ctaMsg = document.getElementById('cta-msg');
  var emailInput = document.getElementById('cta-email');
  ctaForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var email = emailInput.value.trim();
    var valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    ctaMsg.className = 'form-msg ' + (valid ? 'ok' : 'err');
    ctaMsg.textContent = valid
      ? 'Thanks! We\'ll be in touch about the pilot cohort.'
      : 'Please enter a valid email address.';
    emailInput.setAttribute('aria-invalid', String(!valid));
    if (valid) ctaForm.reset();
  });

  // Footer year
  document.getElementById('year').textContent = new Date().getFullYear();
})();
