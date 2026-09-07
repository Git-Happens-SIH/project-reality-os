/**
 * Project Reality OS — circle loader overlay
 * Cached SVG: assets/circle-loader.svg (Aperture, circleloaders.dominikakissi.com)
 */
(function (global) {
  var SVG_URL = 'assets/circle-loader.svg';
  var CACHE_NAME = 'pros-circle-loader-v1';
  var TRANSITION_MS = 2000;
  var SLOW_LOAD_MS = 280;
  var AUTH_RE = /project-reality-os-auth/i;
  var overlay = null;
  var shownAt = 0;
  var navigating = false;

  function cacheSvg() {
    if (!('caches' in global)) {
      // Fallback: warm HTTP cache
      try {
        var img = new Image();
        img.src = SVG_URL;
      } catch (e) {}
      return;
    }
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(SVG_URL).then(function (hit) {
        if (hit) return hit;
        return cache.add(SVG_URL);
      });
    }).catch(function () {
      try {
        var img = new Image();
        img.src = SVG_URL;
      } catch (e) {}
    });
  }

  function ensureStyles() {
    if (document.getElementById('pros-loader-style')) return;
    var style = document.createElement('style');
    style.id = 'pros-loader-style';
    style.textContent =
      '#pros-loader-overlay{' +
        'position:fixed;inset:0;z-index:99999;' +
        'display:flex;align-items:center;justify-content:center;' +
        'background:#FCF9F0;' +
        'opacity:0;visibility:hidden;pointer-events:none;' +
        'transition:opacity .22s ease,visibility .22s ease;' +
      '}' +
      '#pros-loader-overlay.is-on{' +
        'opacity:1;visibility:visible;pointer-events:auto;' +
      '}' +
      '#pros-loader-overlay img,' +
      '#pros-loader-overlay .pros-loader-svg svg{' +
        'width:96px;height:96px;display:block;' +
      '}' +
      '@media (prefers-reduced-motion:reduce){' +
        '#pros-loader-overlay{transition:none}' +
      '}';
    document.head.appendChild(style);
  }

  var svgMarkup = null;

  function loadSvgMarkup() {
    if (svgMarkup) return Promise.resolve(svgMarkup);
    var fromCache = ('caches' in global)
      ? caches.open(CACHE_NAME).then(function (cache) {
          return cache.match(SVG_URL).then(function (res) {
            return res ? res.text() : null;
          });
        }).catch(function () { return null; })
      : Promise.resolve(null);

    return fromCache.then(function (text) {
      if (text) {
        svgMarkup = text;
        return svgMarkup;
      }
      return fetch(SVG_URL).then(function (res) {
        return res.text();
      }).then(function (text) {
        svgMarkup = text;
        if ('caches' in global) {
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(SVG_URL, new Response(text, {
              headers: { 'Content-Type': 'image/svg+xml' }
            }));
          }).catch(function () {});
        }
        return svgMarkup;
      }).catch(function () {
        // Fallback img if fetch blocked (e.g. odd file:// setups)
        return null;
      });
    });
  }

  function fillOverlay(el) {
    loadSvgMarkup().then(function (markup) {
      if (!el) return;
      if (markup) {
        el.innerHTML = '<div class="pros-loader-svg" aria-hidden="true">' + markup + '</div>';
      } else if (!el.querySelector('img, svg')) {
        el.innerHTML =
          '<img src="' + SVG_URL + '" width="96" height="96" alt="Loading" decoding="async" />';
      }
    });
  }

  function ensureOverlay() {
    ensureStyles();
    if (overlay) return overlay;
    overlay = document.getElementById('pros-loader-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'pros-loader-overlay';
      overlay.setAttribute('role', 'status');
      overlay.setAttribute('aria-live', 'polite');
      overlay.setAttribute('aria-busy', 'false');
      overlay.innerHTML =
        '<img src="' + SVG_URL + '" width="96" height="96" alt="Loading" decoding="async" />';
      (document.body || document.documentElement).appendChild(overlay);
      fillOverlay(overlay);
    }
    return overlay;
  }

  function show() {
    var el = ensureOverlay();
    shownAt = Date.now();
    el.setAttribute('aria-busy', 'true');
    el.classList.add('is-on');
  }

  function hide() {
    if (!overlay) return;
    overlay.classList.remove('is-on');
    overlay.setAttribute('aria-busy', 'false');
  }

  function hideAfterMin(minMs) {
    var wait = Math.max(0, (minMs || 0) - (Date.now() - shownAt));
    global.setTimeout(hide, wait);
  }

  function go(url, holdMs) {
    if (navigating) return;
    navigating = true;
    show();
    var ms = typeof holdMs === 'number' ? holdMs : TRANSITION_MS;
    global.setTimeout(function () {
      global.location.href = url;
    }, ms);
  }

  function isAuthHref(href) {
    if (!href) return false;
    try {
      var u = new URL(href, global.location.href);
      if (u.origin !== global.location.origin) return false;
      return AUTH_RE.test(u.pathname);
    } catch (e) {
      return AUTH_RE.test(String(href));
    }
  }

  function bindAuthTransitions() {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
      if (!a) return;
      var href = a.getAttribute('href');
      if (!isAuthHref(href)) return;
      e.preventDefault();
      go(a.href, TRANSITION_MS);
    }, true);
  }

  function bootPageLoad() {
    var started = Date.now();
    var revealed = false;

    function maybeShowSlow() {
      if (revealed) return;
      if (document.readyState === 'complete') return;
      show();
    }

    // Only flash loader when load is slow
    global.setTimeout(maybeShowSlow, SLOW_LOAD_MS);

    function finish() {
      if (revealed) return;
      revealed = true;
      if (overlay && overlay.classList.contains('is-on')) {
        hideAfterMin(400);
      }
    }

    if (document.readyState === 'complete') {
      finish();
    } else {
      global.addEventListener('load', finish);
      // Safety: never leave overlay stuck
      global.setTimeout(finish, 8000);
    }

    // If page already slow when script runs, show now
    if (Date.now() - started > SLOW_LOAD_MS && document.readyState !== 'complete') {
      show();
    }
  }

  function init(opts) {
    opts = opts || {};
    cacheSvg();
    if (document.body) {
      ensureOverlay();
    } else {
      document.addEventListener('DOMContentLoaded', ensureOverlay);
    }
    if (opts.pageLoad !== false) bootPageLoad();
    if (opts.authTransition !== false) {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindAuthTransitions);
      } else {
        bindAuthTransitions();
      }
    }
    // Landing → auth: hold ~2s when coming from transition flag
    if (opts.holdOnEntry) {
      var params = new URLSearchParams(global.location.search);
      if (params.get('pros_loading') === '1' || sessionStorage.getItem('pros_show_loader') === '1') {
        try { sessionStorage.removeItem('pros_show_loader'); } catch (e) {}
        show();
        hideAfterMin(TRANSITION_MS);
      }
    }
  }

  global.ProsLoader = {
    show: show,
    hide: hide,
    go: go,
    init: init,
    TRANSITION_MS: TRANSITION_MS,
    SVG_URL: SVG_URL
  };

  // Auto-init: landing + auth pages
  var path = (global.location.pathname || '').toLowerCase();
  var isLanding = /landing\.html$/.test(path) || path.endsWith('/') || /index\.html$/.test(path);
  var isAuth = AUTH_RE.test(path);
  if (isLanding || isAuth || document.documentElement.hasAttribute('data-pros-loader')) {
    init({
      pageLoad: true,
      authTransition: isLanding || document.documentElement.hasAttribute('data-pros-loader-auth'),
      holdOnEntry: isAuth
    });
  }
})(window);
