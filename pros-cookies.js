/**
 * Project Reality OS — cookie + first-run helpers
 * Cookie is source of truth for onboarding gate; localStorage mirrors prefs.
 */
(function (global) {
  var PREFIX = 'pros_';
  var ONBOARDED = PREFIX + 'onboarded';
  var STEP = PREFIX + 'onboard_step';
  var DRAFT = PREFIX + 'onboard_draft';
  var YEAR = 365 * 24 * 60 * 60;

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
  function safeRemove(key) {
    try { localStorage.removeItem(key); } catch (e) {}
  }

  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  function setCookie(name, value, maxAgeSec) {
    var age = typeof maxAgeSec === 'number' ? maxAgeSec : YEAR;
    var secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie =
      name + '=' + encodeURIComponent(value) +
      '; path=/; max-age=' + age +
      '; SameSite=Lax' + secure;
    safeSet(name, String(value));
  }

  function deleteCookie(name) {
    document.cookie = name + '=; path=/; max-age=0; SameSite=Lax';
    safeRemove(name);
  }

  function isOnboarded() {
    return getCookie(ONBOARDED) === '1' || safeGet(ONBOARDED) === '1';
  }

  function getStep() {
    var raw = getCookie(STEP) || safeGet(STEP);
    if (!raw || raw === 'done') return 0;
    var n = parseInt(raw, 10);
    return isNaN(n) ? 0 : Math.max(0, n);
  }

  function setStep(n) {
    setCookie(STEP, String(n));
  }

  function getDraft() {
    var raw = getCookie(DRAFT) || safeGet(DRAFT);
    if (!raw) return {};
    try { return JSON.parse(raw); } catch (e) { return {}; }
  }

  function setDraft(obj) {
    var json = JSON.stringify(obj || {});
    setCookie(DRAFT, json);
  }

  function markOnboarded(prefs) {
    prefs = prefs || {};
    setCookie(ONBOARDED, '1');
    setCookie(STEP, 'done');
    if (prefs.role) {
      setCookie(PREFIX + 'role', prefs.role);
      safeSet(PREFIX + 'role', prefs.role);
    }
    if (prefs.project) {
      setCookie(PREFIX + 'project', prefs.project);
      safeSet(PREFIX + 'project', prefs.project);
    }
    if (prefs.name) safeSet(PREFIX + 'name', prefs.name);
    if (prefs.crew) safeSet(PREFIX + 'crew', prefs.crew);
    if (prefs.org) safeSet(PREFIX + 'org', prefs.org);
    if (prefs.path) safeSet(PREFIX + 'path', prefs.path);
    if (prefs.goals) safeSet(PREFIX + 'goals', JSON.stringify(prefs.goals));
    if (prefs.notifications) safeSet(PREFIX + 'notifications', JSON.stringify(prefs.notifications));
    if (prefs.invites) safeSet(PREFIX + 'invites', JSON.stringify(prefs.invites));
    deleteCookie(DRAFT);
  }

  function resetOnboarding() {
    deleteCookie(ONBOARDED);
    deleteCookie(STEP);
    deleteCookie(DRAFT);
  }

  function homeForRole(role) {
    role = role || safeGet(PREFIX + 'role') || getCookie(PREFIX + 'role') || 'engineer';
    if (role === 'planner' || role === 'lead') return 'project-reality-os-dashboard.html';
    return 'project-reality-os-site-report.html';
  }

  /** App pages: bounce first-time / incomplete users into onboarding. */
  function requireOnboarded(opts) {
    opts = opts || {};
    if (isOnboarded()) return false;
    var dest = opts.redirect || 'project-reality-os-onboarding.html';
    if (location.pathname.indexOf('onboarding') !== -1) return false;
    location.replace(dest);
    return true;
  }

  /** Onboarding page: skip wizard if already finished. */
  function redirectIfOnboarded() {
    if (!isOnboarded()) return false;
    location.replace(homeForRole());
    return true;
  }

  global.PROS = {
    ONBOARDED: ONBOARDED,
    STEP: STEP,
    DRAFT: DRAFT,
    getCookie: getCookie,
    setCookie: setCookie,
    deleteCookie: deleteCookie,
    isOnboarded: isOnboarded,
    getStep: getStep,
    setStep: setStep,
    getDraft: getDraft,
    setDraft: setDraft,
    markOnboarded: markOnboarded,
    resetOnboarding: resetOnboarding,
    homeForRole: homeForRole,
    requireOnboarded: requireOnboarded,
    redirectIfOnboarded: redirectIfOnboarded,
    safeGet: safeGet,
    safeSet: safeSet
  };
})(window);
