(function () {
  var d = document, root = d.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.addEventListener('load', function () { d.body.classList.add('loaded'); });
  setTimeout(function () { d.body.classList.add('loaded'); }, 600);

  // Reveal on scroll
  var els = d.querySelectorAll('.rv, .clip');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  // Process index: swap the preview photo on hover/focus (desktop)
  var peek = d.querySelector('.ppeek img'), peekCap = d.querySelector('.ppeek figcaption');
  if (peek) {
    d.querySelectorAll('.pindex a[data-img]').forEach(function (a) {
      var show = function () {
        if (peek.getAttribute('src') === a.dataset.img) return;
        peek.style.opacity = '0';
        setTimeout(function () {
          peek.src = a.dataset.img; peek.alt = a.dataset.alt || '';
          peekCap.textContent = a.dataset.cap || '';
          peek.style.opacity = '1';
        }, reduce ? 0 : 160);
      };
      a.addEventListener('mouseenter', show); a.addEventListener('focus', show);
    });
  }

  // Build sequence: the pipe fills as you scroll through the stations
  var seq = d.querySelector('.seq');
  if (seq) {
    var flow = seq.querySelector('.flow'), items = seq.querySelectorAll('li');
    var tick = function () {
      var r = seq.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
      if (reduce) p = 1;
      flow.style.setProperty('--fill', (p * 100) + '%');
      items.forEach(function (li) {
        var lr = li.getBoundingClientRect();
        li.classList.toggle('on', reduce || lr.top < vh * 0.6);
      });
    };
    flow.style.setProperty('--fill', '0%');
    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick); tick();
  }

  // Projects: filter by process
  var filters = d.querySelector('.filters');
  if (filters) {
    filters.hidden = false;
    var figs = d.querySelectorAll('.gal figure[data-cat]');
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      filters.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      var c = b.dataset.f;
      figs.forEach(function (f) { f.hidden = !(c === 'all' || f.dataset.cat.split(' ').indexOf(c) > -1); });
      var n = d.getElementById('count');
      if (n) n.textContent = d.querySelectorAll('.gal figure[data-cat]:not([hidden])').length + ' photos';
    });
  }

  // RFQ: live drawing-sheet summary + sample-only submit
  var form = d.getElementById('rfq');
  if (form) {
    var out = function (k, v) {
      var el = d.querySelector('[data-out="' + k + '"]'); if (!el) return;
      el.textContent = v || '--'; el.classList.toggle('empty', !v);
    };
    var sync = function () {
      var fd = new FormData(form);
      out('company', fd.get('company'));
      out('process', fd.getAll('process').join(', '));
      out('industry', fd.get('industry'));
      out('material', fd.getAll('material').join(', '));
      out('qty', fd.get('quantity'));
      out('timeline', fd.get('timeline'));
      out('code', fd.get('code'));
      var f = form.querySelector('input[type=file]');
      out('files', f && f.files.length ? f.files.length + ' file' + (f.files.length > 1 ? 's' : '') + ' attached' : '');
      var s = (fd.get('scope') || '').trim();
      out('scope', s.length > 90 ? s.slice(0, 90) + '...' : s);
    };
    form.addEventListener('input', sync); form.addEventListener('change', sync); sync();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var m = d.getElementById('sent'); m.classList.add('show'); m.focus();
    });
  }
})();
