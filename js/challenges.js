// The four challenge panels share one flow: show a puzzle, give up to three hints, check the answer, move on.
// What differs (drawing, the second hint, the plaintext) comes from the kind-specific objects below.
document.addEventListener('DOMContentLoaded', () => {
  const template = document.getElementById('answer-template');

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  // Replaces the content with `text`, wrapping the characters at `indices` in <mark>
  function marked(container, text, indices, className) {
    const set = new Set(indices);
    container.replaceChildren(...[...text].map((ch, i) => (set.has(i) ? el('mark', className, ch) : document.createTextNode(ch))));
  }

  // ---------- Acrostic ----------
  const headline = {
    plain: p => (p.heads ? p.heads.join('') : HiddenCore.acrostic(p.text).map(h => h.char).join('')),
    reset() {},
    render(p, view) {
      const heads = HiddenCore.acrostic(p.text);
      document.getElementById('headline-cipher').replaceChildren(...p.text.split('\n').map((line, row) => {
        const li = el('li', 'cipher-line');
        const head = heads.find(h => h.row === row);
        if (view.highlight && head) li.append(line.slice(0, head.col), el('mark', 'mark', head.char), line.slice(head.col + 1));
        else li.textContent = line;
        return li;
      }));
    },
    hint2(p, view) {
      view.highlight = true;
      return p.heads ? () => I18n.t('msg.hint2Reading', { heads: p.heads.join(' / ') }) : () => I18n.t('msg.hint2Headline');
    }
  };

  // ---------- Character removal ----------
  const charInputs = [...document.querySelectorAll('#removeChar .char-input')];
  const fillRemove = p => charInputs.forEach((input, n) => { input.value = p.remove[n] || ''; });
  const removeChar = {
    plain: p => HiddenCore.removeChars(p.cipher, p.remove).plain,
    reset() { charInputs.forEach(input => { input.value = ''; }); },
    render(p) {
      document.getElementById('removeChar-picture').textContent = p.picture;
      charInputs.forEach(input => input.setAttribute('aria-label', I18n.t('removeChar.charLabel', { n: input.dataset.n })));
      const chosen = charInputs.map(input => input.value.trim()).filter(Boolean);
      const { plain, removed } = HiddenCore.removeChars(p.cipher, chosen);
      marked(document.getElementById('removeChar-cipher'), p.cipher, removed, 'mark removed');
      document.getElementById('removeChar-preview').textContent =
        chosen.length ? I18n.t('removeChar.preview', { text: plain }) : I18n.t('removeChar.previewEmpty');
    },
    hint2(p) {
      fillRemove(p);
      return () => I18n.t('msg.hint2Remove');
    },
    onSolved: fillRemove
  };

  // ---------- Position rules ----------
  const ruleText = rule => HiddenCore.describeRule(rule, (key, values) => I18n.t(key, values));

  const position = {
    plain: p => HiddenCore.applyRule(p.reading || p.text, p.rule).plain,
    reset() {},
    render(p, view) {
      document.getElementById('position-rule').textContent = I18n.t('position.rule', { rule: ruleText(p.rule) });
      const { indices } = HiddenCore.applyRule(p.reading || p.text, p.rule);
      marked(document.getElementById('position-cipher'), p.text, view.highlight && !p.reading ? indices : [], 'mark');
      // The kana reading appears with the first hint; the rule is applied to it
      const reading = document.getElementById('position-reading');
      reading.hidden = !(p.reading && (view.hints.length > 0 || view.solved));
      if (reading.hidden) return;
      const body = el('span', 'reading-text');
      marked(body, p.reading, view.highlight ? indices : [], 'mark');
      reading.replaceChildren(el('span', 'reading-label', I18n.t('position.readingLabel')), body);
    },
    hint2(p, view) {
      view.highlight = true;
      return () => I18n.t('msg.hint2Position');
    }
  };

  // ---------- Stencil ----------
  // Where the card's own top-left corner ends up after quarter turns clockwise (row, column)
  const cornerAfter = (turns, n) => [[0, 0], [0, n - 1], [n - 1, n - 1], [n - 1, 0]][turns % 4];
  const stencil = {
    plain: p => HiddenCore.visible(p.grid, p.mask, p.solution).plain,
    reset(p, view) {
      Object.assign(view, { laid: false, rotation: 0, dx: 1, dy: -1 });     // start off-centre so the card must be aligned
    },
    render(p, view) {
      const turned = HiddenCore.rotate(p.mask, view.rotation);
      const n = turned.length, corner = cornerAfter(view.rotation, n);
      document.getElementById('stencil-grid').replaceChildren(...p.grid.map((row, y) => {
        const tr = el('tr');
        row.forEach((ch, x) => {
          const r = y - view.dy, c = x - view.dx;
          const onCard = view.laid && r >= 0 && r < n && c >= 0 && c < n;
          const hole = onCard && turned[r][c] === 1;
          const td = el('td', 'cell' + (onCard ? (hole ? ' hole' : ' covered') : '') +
            (onCard && r === corner[0] && c === corner[1] ? ' corner' : ''), onCard && !hole ? '' : ch);
          tr.append(td);
        });
        return tr;
      }));
      document.getElementById('stencil-toggle').textContent = I18n.t(view.laid ? 'stencil.hide' : 'stencil.show');
      document.querySelectorAll('#stencil [data-move], #stencil-rotate').forEach(button => { button.disabled = !view.laid; });
      document.getElementById('stencil-state').textContent =
        view.laid ? I18n.t('stencil.state', { deg: view.rotation * 90, dx: view.dx, dy: view.dy }) : '';
      const seen = HiddenCore.visible(p.grid, p.mask, view).plain;
      document.getElementById('stencil-seen').textContent = view.laid ? I18n.t('stencil.seen', { text: seen || '-' }) : I18n.t('stencil.seenNone');
    },
    hint2(p) {
      const key = p.solution.anagram ? 'msg.hint2StencilAnagram' : 'msg.hint2Stencil';
      return () => I18n.t(key, { deg: p.solution.rotation * 90 });
    },
    onSolved(p, view) {
      Object.assign(view, { laid: true, rotation: p.solution.rotation, dx: 0, dy: 0 });
    }
  };

  // ---------- Shared flow ----------
  function createChallenge(kind, spec) {
    const panel = document.getElementById(kind);
    panel.append(template.content.cloneNode(true));
    I18n.apply(panel);
    const form = panel.querySelector('.answer-form');
    const source = el('p', 'source');                   // for quoted puzzles: kept apart from the text itself
    form.before(source);
    const input = form.querySelector('.answer-input');
    input.id = `${kind}-answer`;
    form.querySelector('.answer-label').htmlFor = input.id;
    const hintButton = form.querySelector('.hint-button');
    const feedback = form.querySelector('.feedback');
    const hintList = form.querySelector('.hint-list');
    const explain = form.querySelector('.explain');
    const dots = panel.querySelector('.progress-dots');
    const puzzles = () => Store.puzzles(kind);       // follows the chosen puzzle set
    const view = { index: 0, hints: [], feedback: null, solved: false, highlight: false };
    const puzzle = () => puzzles()[view.index];

    function drawStatus() {
      feedback.textContent = view.feedback ? I18n.t(view.feedback.key) : '';
      feedback.className = 'feedback' + (view.feedback ? ' ' + view.feedback.tone : '');
      hintList.replaceChildren(...view.hints.map(text => el('li', 'hint-item', text())));
      hintButton.disabled = view.hints.length >= 3;
      explain.hidden = !view.solved;
      if (view.solved) explain.textContent = I18n.t('msg.plain', { text: spec.plain(puzzle()) }) + ' ' + I18n.t(`explain.${puzzle().id}`);
    }

    function drawProgress() {
      const state = Store.state;
      dots.replaceChildren(...puzzles().map((p, i) => {
        const dot = Progress.dotState(state, kind, i);
        const button = el('button', `dot dot-${dot}` + (i === view.index ? ' dot-current' : ''));
        button.type = 'button';
        const stateText = I18n.t(`common.dot${dot[0].toUpperCase()}${dot.slice(1)}`);
        const label = I18n.t('common.dot', { n: i + 1, state: i === view.index ? I18n.t('common.dotCurrent', { state: stateText }) : stateText });
        button.setAttribute('aria-label', label);
        button.title = label;
        if (i === view.index) button.setAttribute('aria-current', 'true');
        button.addEventListener('click', () => load(i));
        return button;
      }));
      panel.querySelector('.progress-count').textContent = I18n.t('common.count', { solved: state[kind].solved.length, total: puzzles().length });
      panel.querySelector('.progress-current').textContent = I18n.t('common.current', { n: view.index + 1 });
    }

    function draw() {
      spec.render(puzzle(), view);
      input.placeholder = I18n.t(Store.set === 'en' ? 'common.placeholderEn' : 'common.placeholder');
      // puzzle content is in the set's language, which can differ from the page language
      panel.querySelectorAll('.cipher, #removeChar-picture, .stencil-grid').forEach(node => { node.lang = Store.set; });
      input.lang = Store.set;
      source.hidden = !puzzle().source;
      source.textContent = puzzle().source ? I18n.t(`source.${puzzle().id}`) : '';
      drawStatus();
      drawProgress();
    }

    function load(index) {
      Object.assign(view, { index, hints: [], feedback: null, solved: false, highlight: false });
      spec.reset(puzzle(), view);
      input.value = '';
      Store.update(state => Progress.select(state, kind, index));
      draw();
    }

    hintButton.addEventListener('click', () => {
      const p = puzzle(), level = view.hints.length + 1;
      if (level === 1) view.hints.push(() => I18n.t('msg.hint1', { text: I18n.t(`hint.${p.id}`) }));
      if (level === 2) view.hints.push(spec.hint2(p, view));
      if (level === 3) {
        const letters = [...p.answers[0]];
        const start = letters.slice(0, Math.ceil(letters.length / 3)).join('');
        view.hints.push(() => I18n.t('msg.hint3', { start, n: letters.length }));
      }
      draw();
    });

    form.addEventListener('submit', event => {
      event.preventDefault();
      const p = puzzle();
      if (HiddenCore.isBlank(input.value)) {
        view.feedback = { key: 'msg.blank', tone: 'info' };
        drawStatus();
        return;
      }
      const correct = HiddenCore.isCorrect(input.value, p.answers);
      Store.update(state => Progress.record(state, kind, view.index, correct));
      view.feedback = { key: correct ? 'msg.correct' : 'msg.wrong', tone: correct ? 'ok' : 'ng' };
      if (correct) {
        Object.assign(view, { solved: true, highlight: true });
        if (spec.onSolved) spec.onSolved(p, view);
      }
      draw();
    });

    form.querySelector('.next-button').addEventListener('click', () => load((view.index + 1) % puzzles().length));
    document.addEventListener('languagechange', draw);
    document.addEventListener('progresschange', drawProgress);
    document.addEventListener('progressreset', () => load(0));
    document.addEventListener('setchange', () => load(Store.state[kind].current));
    load(Store.state[kind].current);
    return { view, draw };
  }

  createChallenge('headline', headline);
  const removePanel = createChallenge('removeChar', removeChar);
  createChallenge('position', position);
  const stencilPanel = createChallenge('stencil', stencil);

  charInputs.forEach(input => input.addEventListener('input', removePanel.draw));

  document.getElementById('stencil-toggle').addEventListener('click', () => {
    stencilPanel.view.laid = !stencilPanel.view.laid;
    stencilPanel.draw();
  });
  document.querySelectorAll('#stencil [data-move]').forEach(button => button.addEventListener('click', () => {
    const [mx, my] = button.dataset.move.split(',').map(Number);
    const v = stencilPanel.view;
    v.dx = Math.max(-4, Math.min(4, v.dx + mx));
    v.dy = Math.max(-4, Math.min(4, v.dy + my));
    stencilPanel.draw();
  }));
  document.getElementById('stencil-rotate').addEventListener('click', () => {
    stencilPanel.view.rotation = (stencilPanel.view.rotation + 1) % 4;
    stencilPanel.draw();
  });
});
