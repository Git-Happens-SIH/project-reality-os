/**
 * Project Reality OS — consent-aware cookie + first-run helpers
 * Cookies only written after explicit consent.
 * Onboarding only after opt-in; users can always escape.
 */
(function (global) {
  var PREFIX = 'pros_';
  var ONBOARDED = PREFIX + 'onboarded';
  var STEP = PREFIX + 'onboard_step';
  var DRAFT = PREFIX + 'onboard_draft';
  var COOKIE_CONSENT = PREFIX + 'cookie_consent';
  var ONBOARD_CONSENT = PREFIX + 'onboard_consent';
  var YEAR = 365 * 24 * 60 * 60;

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, String(value)); } catch (e) {}
  }
  function safeRemove(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }
  function sessionGet(key) {
    try { return sessionStorage.getItem(key); } catch (e) { return null; }
  }
  function sessionSet(key, value) {
    try { sessionStorage.setItem(key, String(value)); } catch (e) {}
  }
  function sessionRemove(key) {
    try { sessionStorage.removeItem(key); } catch (e) {}
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function writeCookieRaw(name, value, maxAgeSec) {
    var age = typeof maxAgeSec === 'number' ? maxAgeSec : YEAR;
    var secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie =
      name + '=' + encodeURIComponent(value) +
      '; path=/; max-age=' + age +
      '; SameSite=Lax' + secure;
  }

  function deleteCookieRaw(name) {
    document.cookie = name + '=; path=/; max-age=0; SameSite=Lax';
  }

  function hasCookieConsent() {
    return readPref(COOKIE_CONSENT) === '1';
  }

  function hasAnsweredCookieConsent() {
    var v = readPref(COOKIE_CONSENT);
    return v === '1' || v === '0';
  }

  function hasOnboardConsent() {
    return readPref(ONBOARD_CONSENT) === '1';
  }

  function hasDeclinedOnboarding() {
    return readPref(ONBOARD_CONSENT) === '0';
  }

  function hasAnsweredOnboardConsent() {
    var v = readPref(ONBOARD_CONSENT);
    return v === '1' || v === '0';
  }

  /** Read preference: cookie (if allowed) → localStorage → sessionStorage */
  function readPref(name) {
    return getCookie(name) || safeGet(name) || sessionGet(name);
  }

  /**
   * Persist preference. Consent flags always go to localStorage.
   * Other keys: cookies only if consented; else sessionStorage (this visit only).
   */
  function setPref(name, value, maxAgeSec) {
    var str = String(value);
    var isConsentFlag = name === COOKIE_CONSENT || name === ONBOARD_CONSENT;

    if (isConsentFlag) {
      safeSet(name, str);
      if (hasCookieConsent() || name === COOKIE_CONSENT) {
        writeCookieRaw(name, str, maxAgeSec);
      }
      return;
    }

    if (hasCookieConsent()) {
      writeCookieRaw(name, str, maxAgeSec);
      safeSet(name, str);
      sessionRemove(name);
    } else {
      sessionSet(name, str);
      safeRemove(name);
      deleteCookieRaw(name);
    }
  }

  function deletePref(name) {
    deleteCookieRaw(name);
    safeRemove(name);
    sessionRemove(name);
  }

  function setCookieConsent(accepted) {
    var val = accepted ? '1' : '0';
    safeSet(COOKIE_CONSENT, val);
    writeCookieRaw(COOKIE_CONSENT, val);
    if (!accepted) {
      // Wipe non-consent cookies; keep answers in session only
      [ONBOARDED, STEP, DRAFT, PREFIX + 'role', PREFIX + 'project'].forEach(function (k) {
        deleteCookieRaw(k);
      });
    }
  }

  function setOnboardConsent(accepted) {
    setPref(ONBOARD_CONSENT, accepted ? '1' : '0');
    if (!accepted) {
      setPref(ONBOARDED, 'skipped');
      deletePref(STEP);
      deletePref(DRAFT);
    }
  }

  function isOnboarded() {
    var v = readPref(ONBOARDED);
    return v === '1' || v === 'skipped';
  }

  function getStep() {
    var raw = readPref(STEP);
    if (!raw || raw === 'done') return 0;
    var n = parseInt(raw, 10);
    return isNaN(n) ? 0 : Math.max(0, n);
  }

  function setStep(n) {
    setPref(STEP, String(n));
  }

  function getDraft() {
    var raw = readPref(DRAFT);
    if (!raw) return {};
    try { return JSON.parse(raw); } catch (e) { return {}; }
  }

  function setDraft(obj) {
    setPref(DRAFT, JSON.stringify(obj || {}));
  }

  function markOnboarded(prefs) {
    prefs = prefs || {};
    setPref(ONBOARDED, '1');
    setPref(STEP, 'done');
    if (prefs.role) setPref(PREFIX + 'role', prefs.role);
    if (prefs.project) setPref(PREFIX + 'project', prefs.project);
    if (prefs.name) safeSet(PREFIX + 'name', prefs.name);
    if (prefs.crew) safeSet(PREFIX + 'crew', prefs.crew);
    if (prefs.org) safeSet(PREFIX + 'org', prefs.org);
    if (prefs.path) safeSet(PREFIX + 'path', prefs.path);
    if (prefs.goals) safeSet(PREFIX + 'goals', JSON.stringify(prefs.goals));
    if (prefs.notifications) safeSet(PREFIX + 'notifications', JSON.stringify(prefs.notifications));
    if (prefs.invites) safeSet(PREFIX + 'invites', JSON.stringify(prefs.invites));
    deletePref(DRAFT);
  }

  /** Exit without finishing — user escapes. Never traps again unless they opt in. */
  function skipOnboarding(dest) {
    setOnboardConsent(false);
    setPref(ONBOARDED, 'skipped');
    deletePref(STEP);
    deletePref(DRAFT);
    if (dest) location.href = dest;
  }

  function resetOnboarding() {
    deletePref(ONBOARDED);
    deletePref(STEP);
    deletePref(DRAFT);
    deletePref(ONBOARD_CONSENT);
  }

  function homeForRole(role) {
    role = role || readPref(PREFIX + 'role') || 'engineer';
    if (role === 'planner' || role === 'lead') return 'project-reality-os-dashboard.html';
    return 'project-reality-os-site-report.html';
  }

  /**
   * Soft gate only: never force-lock users.
   * Resume redirect only if they opted into onboarding, have unfinished draft, and cookies/session say so.
   */
  function requireOnboarded(opts) {
    opts = opts || {};
    if (isOnboarded()) return false;
    if (!hasOnboardConsent()) return false;
    if (location.pathname.indexOf('onboarding') !== -1) return false;
    var step = getStep();
    if (step <= 0) return false;
    var dest = opts.redirect || 'project-reality-os-onboarding.html';
    location.replace(dest);
    return true;
  }

  function redirectIfOnboarded() {
    if (!isOnboarded()) return false;
    if (hasDeclinedOnboarding() && readPref(ONBOARDED) === 'skipped') {
      // Skipped users who open onboarding URL see consent again — don't auto-bounce to app
      return false;
    }
    if (readPref(ONBOARDED) === '1') {
      location.replace(homeForRole());
      return true;
    }
    return false;
  }

  /** True when first-run consent dialog should show. */
  function needsFirstRunConsent() {
    if (isOnboarded() && hasAnsweredCookieConsent()) return false;
    if (hasAnsweredOnboardConsent() && hasAnsweredCookieConsent()) return false;
    return true;
  }

  global.PROS = {
    ONBOARDED: ONBOARDED,
    STEP: STEP,
    DRAFT: DRAFT,
    COOKIE_CONSENT: COOKIE_CONSENT,
    ONBOARD_CONSENT: ONBOARD_CONSENT,
    getCookie: getCookie,
    setCookie: setPref,
    deleteCookie: deletePref,
    readPref: readPref,
    setPref: setPref,
    hasCookieConsent: hasCookieConsent,
    hasAnsweredCookieConsent: hasAnsweredCookieConsent,
    hasOnboardConsent: hasOnboardConsent,
    hasDeclinedOnboarding: hasDeclinedOnboarding,
    hasAnsweredOnboardConsent: hasAnsweredOnboardConsent,
    setCookieConsent: setCookieConsent,
    setOnboardConsent: setOnboardConsent,
    isOnboarded: isOnboarded,
    getStep: getStep,
    setStep: setStep,
    getDraft: getDraft,
    setDraft: setDraft,
    markOnboarded: markOnboarded,
    skipOnboarding: skipOnboarding,
    resetOnboarding: resetOnboarding,
    homeForRole: homeForRole,
    requireOnboarded: requireOnboarded,
    redirectIfOnboarded: redirectIfOnboarded,
    needsFirstRunConsent: needsFirstRunConsent,
    safeGet: safeGet,
    safeSet: safeSet
  };
})(window);
