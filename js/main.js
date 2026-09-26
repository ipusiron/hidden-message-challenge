// Shared progress store, tabs, help dialog and language switching.
const Store = (() => {
  const KEY = 'hidden-message-challenge-progress';
  const sizes = Object.fromEntries(Object.entries(HiddenData.SETS).map(([kind, list]) => [kind, list.length]));
  let state = Progress.empty();

  function load() {
    let json = null;
    try { json = localStorage.getItem(KEY); } catch (e) { /* storage may be blocked */ }
    state = json ? Progress.parse(json, sizes) : Progress.empty();
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage may be blocked */ }
  }

  // fn receives the current state and returns the next one
  function update(fn) {
    state = fn(state);
    save();
    document.dispatchEvent(new Event('progresschange'));
  }

  function reset() {
    try { localStorage.removeItem(KEY); } catch (e) { /* storage may be blocked */ }
    state = Progress.empty();
    document.dispatchEvent(new Event('progressreset'));
    document.dispatchEvent(new Event('progresschange'));
  }

  load();
  return { sizes, update, reset, get state() { return state; } };
})();

document.addEventListener('DOMContentLoaded', () => {
  I18n.init();

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
    for (const n of [1, 2, 3, 4, 5]) {
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
