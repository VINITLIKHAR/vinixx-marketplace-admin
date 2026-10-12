/* Vinixx Admin – interactions only. All page content (and dummy data) lives in the HTML files. */
(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* Sidebar (mobile drawer) */
  var sb = $('.sidebar'), bd = $('.backdrop');
  function drawer(open) { if (!sb) return; sb.classList.toggle('open', open); bd.classList.toggle('open', open); document.body.style.overflow = open ? 'hidden' : ''; }
  $$('.menu-btn').forEach(function (b) { b.addEventListener('click', function () { drawer(true); }); });
  $$('.sb-close').forEach(function (b) { b.addEventListener('click', function () { drawer(false); }); });
  if (bd) bd.addEventListener('click', function () { drawer(false); });
  window.addEventListener('resize', function () { if (window.innerWidth > 991) drawer(false); });

  /* Profile dropdown */
  var pf = $('.profile');
  if (pf) {
    $('.profile-btn', pf).addEventListener('click', function (e) { e.stopPropagation(); pf.classList.toggle('open'); });
    document.addEventListener('click', function () { pf.classList.remove('open'); });
  }

  /* Toast */
  function toast(msg) { var t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2400); }
  document.addEventListener('click', function (e) { var b = e.target.closest('[data-toast]'); if (b) { e.preventDefault(); toast(b.dataset.toast); } });
  $$('form[data-toast-submit]').forEach(function (f) { f.addEventListener('submit', function (e) { e.preventDefault(); toast(f.dataset.toastSubmit); }); });

  /* Table search + filters (match on data-* attributes of each <tr>) */
  $$('[data-table-card]').forEach(function (card) {
    var q = $('.js-search', card), filters = $$('.js-filter', card), rows = $$('tbody tr[data-row]', card), empty = $('.js-empty', card), count = $('.js-count', card);
    function run() {
      var term = q ? q.value.toLowerCase().trim() : '', shown = 0;
      rows.forEach(function (r) {
        if (!r.parentNode) return;
        var ok = !term || r.textContent.toLowerCase().indexOf(term) > -1;
        filters.forEach(function (f) { if (ok && f.value && (r.dataset[f.dataset.key] || '') !== f.value) ok = false; });
        r.hidden = !ok; if (ok) shown++;
      });
      if (empty) empty.hidden = shown > 0;
      if (count) count.textContent = shown;
    }
    if (q) q.addEventListener('input', run);
    filters.forEach(function (f) { f.addEventListener('change', run); });
    card._run = run;
  });

  /* Delete confirmation modal */
  var modal = $('#confirm-modal'), pending = null;
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-delete]');
    if (b && modal) { pending = b.closest('tr') || b.closest('[data-removable]'); $('#confirm-text', modal).textContent = b.dataset.delete || 'This record will be removed.'; modal.classList.add('open'); return; }
    if (e.target.closest('[data-modal-close]') || e.target === modal) { if (modal) modal.classList.remove('open'); pending = null; }
    if (e.target.closest('[data-modal-confirm]')) {
      if (pending) { var card = pending.closest('[data-table-card]'); pending.remove(); if (card && card._run) card._run(); }
      modal.classList.remove('open'); pending = null; toast('Deleted (demo)');
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal) modal.classList.remove('open'); });

  /* Vendor-only fields on the user form */
  var roles = $$('input[name="role"]');
  if (roles.length) {
    var vo = $$('.vendor-only');
    var sync = function () { var v = ($('input[name="role"]:checked') || {}).value === 'vendor'; vo.forEach(function (x) { x.hidden = !v; }); };
    roles.forEach(function (r) { r.addEventListener('change', sync); }); sync();
  }

  /* Image upload preview */
  $$('.upload input[type=file]').forEach(function (inp) {
    inp.addEventListener('change', function () {
      var f = inp.files[0], lab = inp.closest('.upload'); if (!f) return;
      var img = $('img', lab) || lab.insertBefore(document.createElement('img'), lab.firstChild);
      img.src = URL.createObjectURL(f); var s = $('span', lab); if (s) s.textContent = f.name;
    });
  });

  /* Status update (orders / support) */
  $$('[data-apply-status]').forEach(function (b) {
    b.addEventListener('click', function () {
      var sel = $(b.dataset.applyStatus), badge = $(b.dataset.badge); if (!sel || !badge) return;
      var o = sel.options[sel.selectedIndex]; badge.textContent = o.text; badge.className = 'badge ' + (o.dataset.cls || 'b-mute');
      toast('Status updated to ' + o.text + ' (demo)');
    });
  });

  /* Login: phone -> OTP */
  var lf = $('#login-phone-form');
  if (lf) {
    var step2 = $('#login-otp-form'), boxes = $$('.otp-row input');
    lf.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!/^[0-9]{10}$/.test($('#mobile').value)) return toast('Please enter a valid 10-digit mobile number');
      lf.hidden = true; step2.hidden = false; $('#sent-to').textContent = '+91 ' + $('#mobile').value; boxes[0].focus(); toast('OTP sent (demo OTP: 123456)');
    });
    boxes.forEach(function (b, i) {
      b.addEventListener('input', function () { b.value = b.value.replace(/\D/g, '').slice(0, 1); if (b.value && boxes[i + 1]) boxes[i + 1].focus(); });
      b.addEventListener('keydown', function (e) { if (e.key === 'Backspace' && !b.value && boxes[i - 1]) boxes[i - 1].focus(); });
    });
    step2.addEventListener('submit', function (e) {
      e.preventDefault();
      if (boxes.map(function (x) { return x.value; }).join('').length < 6) return toast('Enter the 6-digit OTP');
      location.href = 'dashboard.html';
    });
    $('#change-number').addEventListener('click', function () { step2.hidden = true; lf.hidden = false; });
  }
})();
