/* ===========================================================
   YILDIZ – Mobile-Menü (Ergänzungsschicht)
   Kompakte Bar (großes Logo · Sprach-Dropdown · Telefon · Hamburger)
   + Slide-in-Menü. An <body> gehängt (außerhalb der React-Wurzel
   #dc-root), damit React-Re-Renders nichts überschreiben.
   Sprachumschaltung wird an die echten (verborgenen) DE/EN/TR-Buttons
   durchgereicht.
   =========================================================== */
(function () {
  "use strict";
  var LOGO = "assets/yildiz-logo.svg";
  var TEL = "tel:+4917662449413";
  var HOURS = "Mo–Sa · 10:00 – 00:00";
  var NAV = [
    ["KONZEPTE", "#konsept"],
    ["GRILL", "#izgara"],
    ["FLEISCHTHEKE", "#fleischtheke"],
    ["SPEISEKARTE", "#menu"],
    ["KONTAKT", "#iletisim"],
  ];
  var LANGS = ["DE", "EN", "TR"];
  var activeLang = "DE"; // Standard = kanonische Sprache

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (html != null) e.innerHTML = html;
    return e;
  }

  function build() {
    if (document.getElementById("yzm-bar")) return;

    // ---- Fixe Bar (ohne Logo – Logo sitzt zentriert im Hero) ----
    var bar = el("div", { id: "yzm-bar" });
    var spacer = el("span", { class: "yzm-spacer" }); // hält die Controls rechts

    var right = el("div", { class: "yzm-right" });

    // Sprach-Dropdown
    var dd = el("div", { class: "yzm-langdd" });
    var ddBtn = el("button", { class: "yzm-langbtn", type: "button", "aria-haspopup": "true", "aria-expanded": "false", "aria-label": "Sprache wählen" },
      '<span class="lbl">' + activeLang + '</span><span class="chev">▼</span>');
    var ddList = el("div", { class: "yzm-langlist", role: "menu" });
    LANGS.forEach(function (code) {
      var b = el("button", { type: "button", role: "menuitem", "data-lang": code }, langLabel(code));
      b.addEventListener("click", function () {
        activeLang = code;
        proxyLang(code);
        updateLangUI();
        closeLang();
      });
      ddList.appendChild(b);
    });
    ddBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      dd.classList.toggle("open");
      ddBtn.setAttribute("aria-expanded", dd.classList.contains("open") ? "true" : "false");
    });
    dd.appendChild(ddBtn); dd.appendChild(ddList);

    var tel = el("a", { class: "yzm-tel", href: TEL, "aria-label": "Anrufen" }, "&#9742;");
    var burger = el("button", { class: "yzm-burger", type: "button", "aria-label": "Menü öffnen", "aria-expanded": "false" });
    burger.appendChild(el("span"));

    right.appendChild(dd); right.appendChild(tel); right.appendChild(burger);
    bar.appendChild(spacer); bar.appendChild(right);

    // ---- Scrim + Menü ----
    var scrim = el("div", { id: "yzm-scrim" });
    var menu = el("div", { id: "yzm-menu", role: "dialog", "aria-modal": "true", "aria-label": "Navigation" });

    var head = el("div", { class: "yzm-head" });
    head.appendChild(el("img", { src: LOGO, alt: "YILDIZ" }));
    var close = el("button", { class: "yzm-close", type: "button", "aria-label": "Menü schließen" }, "&times;");
    head.appendChild(close);
    menu.appendChild(head);
    menu.appendChild(el("div", { class: "yzm-hours" }, HOURS));

    var nav = el("nav", { class: "yzm-nav" });
    NAV.forEach(function (n) {
      var a = el("a", { href: n[1] }, n[0]);
      a.addEventListener("click", function () { closeMenu(); });
      nav.appendChild(a);
    });
    menu.appendChild(nav);

    var order = el("a", { class: "yzm-order", href: TEL }, "&#128722;&nbsp; Jetzt anrufen &amp; bestellen");
    order.addEventListener("click", function () { closeMenu(); });
    menu.appendChild(order);

    document.body.appendChild(bar);
    document.body.appendChild(scrim);
    document.body.appendChild(menu);

    // Logo in den Hero-Textfluss einfügen (oben) – schiebt Text nach unten
    ensureFlowLogo();
    window.addEventListener("resize", ensureFlowLogo);
    [200, 600, 1200, 2000, 3500].forEach(function (t) { setTimeout(ensureFlowLogo, t); });
    // Nach React-Re-Renders (z. B. Sprachwechsel) Logo wieder einfügen
    var root = document.getElementById("dc-root");
    if (root && "MutationObserver" in window) {
      var mo = new MutationObserver(function () {
        clearTimeout(mo._t); mo._t = setTimeout(ensureFlowLogo, 60);
      });
      mo.observe(root, { childList: true, subtree: true });
    }

    burger.addEventListener("click", openMenu);
    close.addEventListener("click", closeMenu);
    scrim.addEventListener("click", closeMenu);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeMenu(); closeLang(); } });
    // Klick außerhalb schließt das Sprach-Dropdown
    document.addEventListener("click", function () { closeLang(); });

    updateLangUI();
  }

  function langLabel(code) {
    return { DE: "Deutsch", EN: "English", TR: "Türkçe" }[code] || code;
  }

  // Text-SVG + Fleisch-SVG nebeneinander ganz oben in die Hero-Textspalte einfügen
  // (nimmt sich Platz -> schiebt HANNOVER/H1 nach unten, Text bleibt lesbar)
  var ASPECT_TEXT = 1404 / 485;  // ~2.89
  var ASPECT_MEAT = 1521 / 740;  // ~2.06
  function sizeFlow(box) {
    var col = box.parentElement || box;
    var w = col.clientWidth || 340;
    var gap = 14;
    var H = (w - gap) / (ASPECT_TEXT + ASPECT_MEAT);
    H = H * 0.84;                        // etwas kleiner (wie Design-Beispiel, füllt nicht ganz)
    H = Math.max(44, Math.min(H, 120));  // Desktop-Deckel 120px
    var t = box.querySelector(".yzm-text"), m = box.querySelector(".yzm-meat");
    if (t) t.style.height = Math.round(H) + "px";
    if (m) m.style.height = Math.round(H) + "px";
  }
  function ensureFlowLogo() {
    var h1 = document.querySelector("#dc-root h1"); // erster H1 = Hero-Headline
    if (!h1) return;
    var container = h1.parentElement; // Textspalte im Hero
    if (!container) return;
    var existing = container.querySelector(":scope > .yzm-heroflow");
    if (existing) {
      if (existing !== container.firstElementChild) container.insertBefore(existing, container.firstChild);
      sizeFlow(existing);
      return;
    }
    var box = el("div", { class: "yzm-heroflow" });
    box.appendChild(el("img", { class: "yzm-text", src: "assets/yildiz-text.svg", alt: "YILDIZ – Haus des Fleisches & Grills" }));
    box.appendChild(el("img", { class: "yzm-meat", src: "assets/yildiz-fleisch.svg", alt: "", "aria-hidden": "true" }));
    container.insertBefore(box, container.firstChild);
    sizeFlow(box);
  }

  function openMenu() {
    document.documentElement.classList.add("yzm-open");
    var b = document.querySelector("#yzm-bar .yzm-burger");
    if (b) b.setAttribute("aria-expanded", "true");
  }
  function closeMenu() {
    document.documentElement.classList.remove("yzm-open");
    var b = document.querySelector("#yzm-bar .yzm-burger");
    if (b) b.setAttribute("aria-expanded", "false");
  }
  function closeLang() {
    var dd = document.querySelector("#yzm-bar .yzm-langdd");
    if (dd) { dd.classList.remove("open"); var b = dd.querySelector(".yzm-langbtn"); if (b) b.setAttribute("aria-expanded", "false"); }
  }
  function updateLangUI() {
    var lbl = document.querySelector("#yzm-bar .yzm-langbtn .lbl");
    if (lbl) lbl.textContent = activeLang;
    LANGS.forEach(function (code) {
      var it = document.querySelector('#yzm-bar .yzm-langlist button[data-lang="' + code + '"]');
      if (it) it.classList.toggle("active", code === activeLang);
    });
  }

  // Findet die echten DE/EN/TR-Buttons im (verborgenen) Original-Header
  function realLangEl(code) {
    var host = document.getElementById("dc-root") || document.body;
    var cands = host.querySelectorAll("button, a");
    for (var i = 0; i < cands.length; i++) {
      if ((cands[i].textContent || "").trim().toUpperCase() === code) return cands[i];
    }
    return null;
  }
  function proxyLang(code) {
    var real = realLangEl(code);
    if (real) real.click();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
  // Falls React die Seite spät aufbaut, einmalig nachziehen
  setTimeout(build, 800);
})();
