/**
 * Recommendation dock — fixed lower-right dynamic suggestions.
 * Mount: include this script; optionally set window.PROS_RECOMMENDATION first.
 *
 * Pattern: primary option shown; Alternatives opens drawer; pick promotes;
 * CTA confirms. Options are page-configurable.
 */
(function () {
  "use strict";

  var DEFAULT_LABELS = {
    title: "Want me to apply this schedule update?",
    alternatives: "Alternatives",
    otherOptions: "Other options",
    accepted: "Accepted",
  };

  var DEFAULT_OPTIONS = [
    {
      key: "high",
      body:
        'Link Pier P7 pour to <span class="rec-entity">WBS 4.2.1</span> with confidence <span class="rec-pill is-green">92%</span>',
      short: "Link Pier P7 → WBS 4.2.1 · 92%",
      signal: 3,
      tone: "var(--green)",
      label: "High confidence",
      cta: "Accept",
      ctaVariant: "primary",
    },
    {
      key: "review",
      body:
        'Flag crane idle against <span class="rec-entity">Package C</span> booking — <span class="rec-pill is-orange">needs review</span>',
      short: "Flag Package C crane conflict",
      signal: 2,
      tone: "var(--orange)",
      label: "Needs review",
      cta: "Open conflict",
      ctaVariant: "secondary",
      href: "project-reality-os-delay-conflict.html",
    },
    {
      key: "none",
      body:
        'Hold for planner — <strong>no auto-link</strong> until a human decides.',
      short: "Hold — no auto-link",
      signal: 0,
      tone: "var(--muted)",
      label: "No signal",
      cta: "Keep on hold",
      ctaVariant: "secondary",
    },
  ];

  function meterHtml(signal, tone) {
    var bars = "";
    for (var i = 0; i < 3; i++) {
      bars +=
        '<span class="' +
        (i < signal ? "is-on" : "") +
        '" style="--rec-tone:' +
        tone +
        '"></span>';
    }
    return '<span class="rec-meter" aria-hidden="true">' + bars + "</span>";
  }

  function btnClass(variant, accepted) {
    if (accepted) return "btn btn-sm btn-success";
    if (variant === "secondary") return "btn btn-sm btn-secondary";
    return "btn btn-sm btn-primary";
  }

  function mount(config) {
    config = config || {};
    var labels = Object.assign({}, DEFAULT_LABELS, config.labels || {});
    var options =
      config.options && config.options.length
        ? config.options
        : DEFAULT_OPTIONS;

    var selected = 0;
    var open = false;
    var accepted = false;

    var dock = document.createElement("aside");
    dock.className = "rec-dock";
    dock.setAttribute("aria-label", "Recommendation");
    dock.innerHTML =
      '<div class="rec-card" role="region" aria-live="polite">' +
      '<div class="rec-card-pad">' +
      '<span class="rec-card-title"></span>' +
      '<p class="rec-card-body"></p>' +
      "</div>" +
      '<div class="rec-drawer" data-drawer>' +
      '<div class="rec-drawer-inner">' +
      '<div class="rec-drawer-panel">' +
      '<p class="rec-drawer-label"></p>' +
      '<div data-options></div>' +
      "</div></div></div>" +
      '<div class="rec-footer">' +
      '<span class="rec-footer-meta" data-meta></span>' +
      '<span class="rec-footer-actions">' +
      '<button type="button" class="btn btn-sm btn-secondary" data-alt aria-expanded="false"></button>' +
      '<button type="button" class="btn btn-sm btn-primary" data-cta></button>' +
      "</span></div></div>";

    document.body.appendChild(dock);

    var elTitle = dock.querySelector(".rec-card-title");
    var elBody = dock.querySelector(".rec-card-body");
    var elDrawer = dock.querySelector("[data-drawer]");
    var elDrawerLabel = dock.querySelector(".rec-drawer-label");
    var elOptions = dock.querySelector("[data-options]");
    var elMeta = dock.querySelector("[data-meta]");
    var elAlt = dock.querySelector("[data-alt]");
    var elCta = dock.querySelector("[data-cta]");

    elTitle.textContent = labels.title;
    elDrawerLabel.textContent = labels.otherOptions;
    elAlt.textContent = labels.alternatives;

    function render() {
      var active = options[selected];

      elBody.style.animation = "none";
      // force reflow for fade replay
      void elBody.offsetWidth;
      elBody.style.animation = "";
      elBody.innerHTML = active.body;

      elDrawer.classList.toggle("is-open", open);
      elDrawer.setAttribute("aria-hidden", open ? "false" : "true");
      elDrawer.inert = !open;
      elAlt.setAttribute("aria-expanded", open ? "true" : "false");

      elMeta.innerHTML =
        meterHtml(active.signal, active.tone) +
        "<span>" +
        active.label +
        "</span>";

      elCta.className = btnClass(active.ctaVariant, accepted);
      elCta.textContent = accepted ? labels.accepted : active.cta;

      var othersHtml = "";
      options.forEach(function (o, i) {
        if (i === selected) return;
        othersHtml +=
          '<button type="button" class="rec-option" data-pick="' +
          i +
          '">' +
          meterHtml(o.signal, o.tone) +
          '<span class="rec-option-short">' +
          o.short +
          "</span>" +
          '<span class="rec-option-label">' +
          o.label +
          "</span></button>";
      });
      elOptions.innerHTML = othersHtml;
    }

    elAlt.addEventListener("click", function () {
      open = !open;
      render();
    });

    elCta.addEventListener("click", function () {
      var active = options[selected];
      if (accepted) return;
      accepted = true;
      render();
      if (typeof config.onAccept === "function") {
        config.onAccept(active);
      } else if (active.href) {
        window.location.href = active.href;
      }
    });

    elOptions.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-pick]");
      if (!btn) return;
      selected = Number(btn.getAttribute("data-pick"));
      accepted = false;
      render();
    });

    render();
    return dock;
  }

  window.PROSRecommendation = { mount: mount, defaults: DEFAULT_OPTIONS };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      mount(window.PROS_RECOMMENDATION || {});
    });
  } else {
    mount(window.PROS_RECOMMENDATION || {});
  }
})();
