/* YILDIZ – Kontaktformular → Supabase (contact_messages)
   Additive Schicht wie mobile.js: Event-Delegation auf document,
   überlebt Re-Renders des Templates (Sprachwechsel etc.). */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://tplyqbagcivumqxmihts.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_Qe4Rmr14ib1o9t7Dwi7PMw_ILxSjxfW';

  var MSG = {
    de: {
      missing: 'Bitte alle Felder ausfüllen.',
      sending: 'Wird gesendet…',
      ok: 'Danke! Wir melden uns schnellstmöglich.',
      err: 'Senden fehlgeschlagen. Ruf uns gern direkt an: 0176 62449413',
      wait: 'Bitte warte einen Moment, bevor du erneut sendest.',
    },
    en: {
      missing: 'Please fill in all fields.',
      sending: 'Sending…',
      ok: 'Thanks! We will get back to you as soon as possible.',
      err: 'Sending failed. Feel free to call us: 0176 62449413',
      wait: 'Please wait a moment before sending again.',
    },
    tr: {
      missing: 'Lütfen tüm alanları doldurun.',
      sending: 'Gönderiliyor…',
      ok: 'Teşekkürler! En kısa sürede size döneceğiz.',
      err: 'Gönderilemedi. Bizi doğrudan arayabilirsiniz: 0176 62449413',
      wait: 'Tekrar göndermeden önce lütfen biraz bekleyin.',
    },
  };

  var loadedAt = Date.now();      // Zeit-Tor gegen Bots
  var lastSentAt = 0;             // Drossel: max. 1 Nachricht / 30 s
  var busy = false;

  function t() {
    var lang = (document.documentElement.lang || 'de').slice(0, 2);
    return MSG[lang] || MSG.de;
  }

  function setStatus(text, color) {
    var el = document.getElementById('yz-cf-status');
    if (el) { el.textContent = text; el.style.color = color; }
  }

  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.id !== 'yz-contact-form') return;
    e.preventDefault();
    if (busy) return;

    var m = t();
    var name = (document.getElementById('yz-cf-name') || {}).value || '';
    var contact = (document.getElementById('yz-cf-contact') || {}).value || '';
    var message = (document.getElementById('yz-cf-msg') || {}).value || '';
    var honeypot = (document.getElementById('yz-cf-hp') || {}).value || '';

    name = name.trim(); contact = contact.trim(); message = message.trim();

    // Honeypot gefüllt oder Formular in <3 s abgeschickt → still "ok" (Bot)
    if (honeypot || Date.now() - loadedAt < 3000) {
      setStatus(m.ok, '#7fbf7f');
      return;
    }
    if (!name || !contact || !message) { setStatus(m.missing, '#e8a13f'); return; }
    if (Date.now() - lastSentAt < 30000) { setStatus(m.wait, '#e8a13f'); return; }

    busy = true;
    setStatus(m.sending, '#c9a24b');
    var btn = document.getElementById('yz-cf-send');
    if (btn) btn.disabled = true;

    fetch(SUPABASE_URL + '/rest/v1/contact_messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: SUPABASE_KEY,
        Authorization: 'Bearer ' + SUPABASE_KEY,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        name: name.slice(0, 120),
        contact: contact.slice(0, 160),
        message: message.slice(0, 2000),
        lang: (document.documentElement.lang || 'de').slice(0, 2),
        page: location.pathname,
      }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        lastSentAt = Date.now();
        setStatus(t().ok, '#7fbf7f');
        var n = document.getElementById('yz-cf-name');
        var c = document.getElementById('yz-cf-contact');
        var msg = document.getElementById('yz-cf-msg');
        if (n) n.value = ''; if (c) c.value = ''; if (msg) msg.value = '';
      })
      .catch(function () { setStatus(t().err, '#e86a5f'); })
      .then(function () {
        busy = false;
        if (btn) btn.disabled = false;
      });
  });
})();
