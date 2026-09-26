// Shared progress store (one saved progress per puzzle set), tabs, help dialog, set and language switching.
const Store = (() => {
  const KEYS = { ja: 'hidden-message-challenge-progress', en: 'hidden-message-challenge-progress-en' };
  const SET_KEY = 'hidden-message-challenge-set';
  const sizesOf = set => Object.fromEntries(Object.entries(HiddenData.BY_SET[set]).map(([kind, list]) => [kind, list.length]));
  const states = {};
  let set = 'ja';

  function read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }       // storage may be blocked
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage may be blocked */ }
  }
  const fire = name => document.dispatchEvent(new Event(name));

  // The saved set wins; otherwise the set follows the display language
  function init(language) {
    for (const s of Object.keys(KEYS)) {
      const json = read(KEYS[s]);
      states[s] = json ? Progress.parse(json, sizesOf(s)) : Progress.empty();
    }
    const saved = read(SET_KEY);
    set = saved === 'ja' || saved === 'en' ? saved : (language === 'en' ? 'en' : 'ja');
  }

  // fn receives the current state and returns the next one
  function update(fn) {
    states[set] = fn(states[set]);
    write(KEYS[set], JSON.stringify(states[set]));
    fire('progresschange');
  }

  // Clears the progress of the current set only
  function reset() {
    try { localStorage.removeItem(KEYS[set]); } catch (e) { /* storage may be blocked */ }
    states[set] = Progress.empty();
    fire('progressreset');
    fire('progresschange');
  }

  function chooseSet(value) {
    if (!(value in KEYS) || value === set) return;
    set = value;
    write(SET_KEY, value);
    fire('setchange');
    fire('progresschange');
  }

  return {
    init, update, reset, chooseSet,
    puzzles: kind => HiddenData.BY_SET[set][kind],
    get set() { return set; },
    get sizes() { return sizesOf(set); },
    get state() { return states[set]; }
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  I18n.init();
  Store.init(I18n.language);

  // ---------- Puzzle set ----------
  const setSwitch = document.getElementById('set-switch');
  const setButtons = [...document.querySelectorAll('.set-button')];
  function renderSet() {
    setButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.set === Store.set)));
  }
  setButtons.forEach(button => button.addEventListener('click', () => Store.chooseSet(button.dataset.set)));
  document.addEventListener('setchange', renderSet);
  renderSet();

  // ---------- Tabs (WAI-ARIA tabs pattern) ----------
  const tabs = [...document.querySelectorAll('.tab-button')];

  function activateTab(tab, focus) {
    tabs.forEach(btn => {
      const selected = btn === tab;
      btn.classList.toggle('active', selected);
      btn.setAttribute('aria-selected', String(selected));
      btn.tabIndex = selected ? 0 : -1;
      document.getElementById(btn.dataset.tab).hidden = !selected;
    });
    setSwitch.hidden = tab.dataset.tab === 'maker';          // the maker does not use the puzzle sets
    if (focus) tab.focus();
    document.dispatchEvent(new CustomEvent('tabchange', { detail: tab.dataset.tab }));
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTab(tab, false));
    tab.addEventListener('keydown', event => {
      const keys = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: tabs.length - 1 };
      if (!(event.key in keys)) return;
      event.preventDefault();
      activateTab(tabs[(keys[event.key] + tabs.length) % tabs.length], true);
    });
  });

  // ---------- Help dialog ----------
  const helpButton = document.getElementById('help-button');
  const helpModal = document.getElementById('help-modal');
  const helpBody = document.getElementById('help-body');

  function renderHelp() {
    helpBody.replaceChildren();
    for (const n of [1, 2, 3, 4, 6, 7, 5]) {
      const heading = document.createElement('h3');
      heading.textContent = I18n.t(`help.s${n}.h`);
      const text = document.createElement('p');
      text.textContent = I18n.t(`help.s${n}.p`);
      helpBody.append(heading, text);
    }
  }

  helpButton.addEventListener('click', () => {
    renderHelp();
    helpModal.showModal();
  });
  document.getElementById('help-close').addEventListener('click', () => helpModal.close());
  helpModal.addEventListener('click', event => {
    if (event.target === helpModal) helpModal.close();
  });
  helpModal.addEventListener('close', () => helpButton.focus());

  // ---------- Language ----------
  function renderLevels() {
    document.querySelectorAll('.level').forEach(el => { el.textContent = I18n.t('level.label', { stars: el.dataset.stars }); });
  }
  document.getElementById('lang-button').addEventListener('click', () => {
    I18n.setLanguage(I18n.language === 'ja' ? 'en' : 'ja');
  });
  document.addEventListener('languagechange', () => {
    renderLevels();
    if (helpModal.open) renderHelp();
  });
  renderLevels();
});
