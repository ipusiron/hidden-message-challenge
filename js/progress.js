// Progress state (pure). The UI stores it as one JSON value; broken or old values fall back to an empty state.
const Progress = (() => {
  const KINDS = ['headline', 'removeChar', 'position', 'stencil'];

  const emptyKind = () => ({ current: 0, solved: [], missed: [] });
  const empty = () => Object.fromEntries(KINDS.map(k => [k, emptyKind()]));

  // Keeps only valid, in-range, unique indices
  function parse(json, sizes) {
    const state = empty();
    let data = null;
    try { data = JSON.parse(json); } catch (e) { return state; }
    if (!data || typeof data !== 'object') return state;
    for (const kind of KINDS) {
      const src = data[kind], size = sizes[kind];
      if (!src || typeof src !== 'object') continue;
      const valid = list => (Array.isArray(list) ? [...new Set(list.filter(i => Number.isInteger(i) && i >= 0 && i < size))].sort((a, b) => a - b) : []);
      state[kind].solved = valid(src.solved);
      state[kind].missed = valid(src.missed).filter(i => !state[kind].solved.includes(i));
      state[kind].current = Number.isInteger(src.current) && src.current >= 0 && src.current < size ? src.current : 0;
    }
    return state;
  }

  const clone = state => JSON.parse(JSON.stringify(state));

  // A correct answer clears an earlier miss; a wrong answer after solving changes nothing.
  function record(state, kind, index, correct) {
    const next = clone(state), k = next[kind];
    if (correct) {
      if (!k.solved.includes(index)) k.solved = [...k.solved, index].sort((a, b) => a - b);
      k.missed = k.missed.filter(i => i !== index);
    } else if (!k.solved.includes(index) && !k.missed.includes(index)) {
      k.missed = [...k.missed, index].sort((a, b) => a - b);
    }
    return next;
  }

  function select(state, kind, index) {
    const next = clone(state);
    next[kind].current = index;
    return next;
  }

  function dotState(state, kind, index) {
    const k = state[kind];
    return k.solved.includes(index) ? 'solved' : k.missed.includes(index) ? 'missed' : 'todo';
  }

  function summary(state, sizes, rank) {
    const perKind = {};
    let solved = 0, total = 0;
    for (const kind of KINDS) {
      const n = state[kind].solved.length;
      perKind[kind] = { solved: n, total: sizes[kind], percent: Math.round((n / sizes[kind]) * 100) };
      solved += n;
      total += sizes[kind];
    }
    const percent = total ? Math.round((solved / total) * 100) : 0;
    return { perKind, solved, total, percent, rank: rank(percent) };
  }

  return { KINDS, empty, parse, record, select, dotState, summary };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = Progress;
