// Maker tab: build your own acrostic, removal cipher or stencil, and check that it reads back and does not stand out.
document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const message = $('maker-message');
  const lines = $('maker-lines');
  const nulls = $('maker-nulls');
  const rate = $('maker-rate');
  const lineCheck = $('maker-line-check');
  const grid = $('maker-grid');
  const output = $('maker-output');
  const copyStatus = $('maker-copy-status');
  const findingsList = $('maker-findings');
  const generate = $('maker-generate');
  const status = $('maker-status');
  const SEVERITY = ['error', 'warning', 'ok', 'info'];
  const BLOCKS = { acrostic: ['maker-acrostic'], removal: ['maker-removal', 'maker-actions'], stencil: ['maker-actions'] };
  let attempt = 0;          // "make again" changes the seed
  let made = null;          // { method, text, findings, grid? } of the last result

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  const method = () => document.querySelector('input[name="maker-method"]:checked').value;
  const nullChars = () => HiddenCore.messageLetters(nulls.value);      // units, so a decomposed character stays whole

  // Screen readers hear one short summary, and only when it changes (the lists themselves are not live regions).
  // `again` re-announces an unchanged summary, for "make again".
  function announce(finding, again) {
    const text = finding ? I18n.t(finding.key, finding.values || {}) : '';
    if (status.textContent === text && !again) return;
    status.textContent = '';
    requestAnimationFrame(() => { status.textContent = text; });
  }
  const mostSevere = findings => findings.slice().sort((a, b) => SEVERITY.indexOf(a.level) - SEVERITY.indexOf(b.level))[0];

  function renderFindings(findings) {
    findingsList.replaceChildren(...findings.map(f => {
      const item = el('li', `finding finding-${f.level}`);
      item.append(el('span', `finding-level finding-level-${f.level}`, I18n.t(`finding.${f.level}`)),
        el('span', 'finding-text', I18n.t(f.key, f.values || {})));
      return item;
    }));
  }

  // The acrostic is checked as you type
  function renderAcrostic() {
    if (HiddenCore.messageLetters(message.value).length === 0) {
      lineCheck.replaceChildren();
      renderFindings([{ level: 'info', key: 'maker.empty' }]);
      announce({ key: 'maker.empty' });
      return;
    }
    const report = HiddenCore.acrosticReport(message.value, lines.value);
    lineCheck.replaceChildren(...report.lines.map((line, i) => {
      const key = !line.expected ? 'maker.line.extra' : line.ok ? 'maker.line.ok' : 'maker.line.ng';
      return el('li', line.ok ? 'line-ok' : 'line-ng', I18n.t(key, { n: i + 1, char: line.char, expected: line.expected }));
    }));
    const findings = [...report.findings];
    if (report.next) findings.unshift({ level: 'info', key: 'maker.next', values: { char: report.next } });
    renderFindings(findings);
    // a wrong line head matters more than progress
    const wrong = report.lines.findIndex(l => l.expected && !l.ok);
    const lineIssue = wrong >= 0 &&
      { key: 'maker.line.ng', values: { n: wrong + 1, char: report.lines[wrong].char, expected: report.lines[wrong].expected } };
    announce(lineIssue || findings.find(f => f.key === 'maker.acrostic.done') || findings.find(f => f.key === 'maker.next') || mostSevere(findings));
  }

  function renderGrid(result) {
    grid.hidden = !result;
    if (!result) return;
    grid.replaceChildren(...result.grid.map((row, y) => {
      const tr = el('tr');
      row.forEach((ch, x) => tr.append(el('td', 'cell' + (result.mask[y][x] ? ' hole' : ''), ch)));
      return tr;
    }));
  }

  // Removal and stencil are made on request
  function make() {
    const text = message.value;
    const rand = HiddenCore.rng(HiddenCore.seedOf(`${method()}|${text}|${nulls.value}|${rate.value}|${attempt}`));
    if (HiddenCore.messageLetters(text).length === 0) {
      made = { method: method(), text: '', findings: [{ level: 'info', key: 'maker.empty' }] };
    } else if (method() === 'removal') {
      const findings = HiddenCore.removalReport(text, nullChars(), '');
      if (nullChars().length === 0) findings.push({ level: 'error', key: 'maker.removal.noNulls' });
      const blocked = findings.some(f => f.level === 'error');
      const cipher = blocked ? '' : HiddenCore.makeRemoval(text, nullChars(), { rate: Number(rate.value), rand });
      made = { method: 'removal', text: cipher, findings: blocked ? findings : HiddenCore.removalReport(text, nullChars(), cipher) };
    } else {
      const result = HiddenCore.makeStencil(text, { rand });
      const findings = HiddenCore.stencilReport(text, result);
      // plain-text copy: the grid, a blank line, then the stencil with ■ for holes
      const rows = result ? [...result.grid.map(row => row.join('')), '', ...result.mask.map(row => row.map(h => (h ? '■' : '□')).join(''))] : [];
      made = { method: 'stencil', grid: result, findings, text: rows.join('\n') };
    }
    render(true);            // a new result is announced even when its summary is the same as before
  }

  function render(fromGenerate = false) {
    const m = method();
    new Set(Object.values(BLOCKS).flat()).forEach(id => { $(id).hidden = !BLOCKS[m].includes(id); });
    $('maker-output-label').textContent = I18n.t(m === 'stencil' ? 'maker.outputStencil' : 'maker.output');
    generate.textContent = I18n.t(made && made.method === m && made.text ? 'maker.regenerate' : 'maker.generate');
    if (m === 'acrostic') {
      $('maker-result').hidden = true;
      renderGrid(null);
      renderAcrostic();
      return;
    }
    const current = made && made.method === m ? made : null;
    $('maker-result').hidden = !(current && current.text);
    output.value = current ? current.text : '';
    output.rows = Math.max(3, output.value.split('\n').length);        // the stencil text is 11 lines
    renderGrid(current && m === 'stencil' ? current.grid : null);
    renderFindings(current ? current.findings : []);
    announce(current ? mostSevere(current.findings) : null, fromGenerate);
  }

  generate.addEventListener('click', () => {
    attempt += 1;
    copyStatus.textContent = '';
    make();
  });
  document.querySelectorAll('input[name="maker-method"]').forEach(radio => radio.addEventListener('change', () => {
    copyStatus.textContent = '';
    render();
  }));
  // Changing the input invalidates the last result
  for (const input of [message, nulls, rate]) {
    input.addEventListener('input', () => {
      made = null;
      attempt = 0;
      copyStatus.textContent = '';
      render();
    });
  }
  lines.addEventListener('input', renderAcrostic);

  $('maker-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      copyStatus.textContent = I18n.t('maker.copied');
    } catch (e) {
      output.focus();
      output.select();
      copyStatus.textContent = I18n.t('maker.copyFailed');
    }
  });
  document.addEventListener('languagechange', () => {
    copyStatus.textContent = '';
    render();
  });
  render();
});
