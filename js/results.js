// Results tab: scores by challenge, radar chart, rank, sharing, image download and reset.
document.addEventListener('DOMContentLoaded', () => {
  const $ = id => document.getElementById(id);
  const canvas = $('radar-chart');
  const notice = $('results-notice');
  const resetModal = $('reset-modal');
  const PAGE_URL = 'https://ipusiron.github.io/hidden-message-challenge/';
  const COLORS = { grid: '#cbd5e1', axis: '#94a3b8', fill: 'rgba(79, 70, 229, 0.25)', line: '#4338ca', text: '#1f2937' };

  const current = () => Progress.summary(Store.state, Store.sizes, HiddenCore.rank);
  const kindName = kind => I18n.t(`tab.${kind}`);

  // Four axes starting at 12 o'clock, clockwise
  function drawRadar(ctx, size, summary) {
    const cx = size / 2, cy = size / 2, radius = size * 0.32;
    const point = (i, r) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / Progress.KINDS.length;
      return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
    };
    const polygon = (r, values) => {
      ctx.beginPath();
      Progress.KINDS.forEach((kind, i) => {
        const [x, y] = point(i, values ? (r * values[i]) / 100 : r);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath();
    };
    ctx.clearRect(0, 0, size, size);
    ctx.lineWidth = 1;
    ctx.strokeStyle = COLORS.grid;
    for (const step of [0.25, 0.5, 0.75, 1]) { polygon(radius * step); ctx.stroke(); }
    ctx.strokeStyle = COLORS.axis;
    Progress.KINDS.forEach((kind, i) => {
      const [x, y] = point(i, radius);
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
    });
    polygon(radius, Progress.KINDS.map(kind => summary.perKind[kind].percent));
    ctx.fillStyle = COLORS.fill; ctx.fill();
    ctx.strokeStyle = COLORS.line; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = COLORS.text;
    ctx.font = `bold ${Math.round(size / 26)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    Progress.KINDS.forEach((kind, i) => {
      const [x, y] = point(i, radius + size * 0.1);
      ctx.fillText(`${kindName(kind)} ${summary.perKind[kind].percent}%`, x, y);
    });
  }

  function render() {
    const summary = current();
    drawRadar(canvas.getContext('2d'), canvas.width, summary);
    const list = Progress.KINDS.map(kind => I18n.t('results.chartItem', { name: kindName(kind), percent: summary.perKind[kind].percent }));
    canvas.setAttribute('aria-label', I18n.t('results.chart', { list: list.join(I18n.t('results.chartSep')) }));
    $('kind-scores').replaceChildren(...Progress.KINDS.map(kind => {
      const item = document.createElement('li');
      const k = summary.perKind[kind];
      item.textContent = `${kindName(kind)}: ${I18n.t('common.count', { solved: k.solved, total: k.total })} (${k.percent}%)`;
      return item;
    }));
    $('results-total').textContent = I18n.t('results.total', summary);
    $('results-rank').textContent = I18n.t('results.rank', { rank: summary.rank, title: I18n.t(`rank.${summary.rank}`) });
    const params = new URLSearchParams({ text: I18n.t('results.shareText', summary), url: PAGE_URL });
    $('share-x').href = `https://twitter.com/intent/tweet?${params}`;
  }

  // A 1200 x 630 summary image (the usual size for link previews)
  function downloadImage() {
    const summary = current();
    const image = document.createElement('canvas');
    image.width = 1200;
    image.height = 630;
    const ctx = image.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, image.width, image.height);
    ctx.fillStyle = COLORS.line;
    ctx.textAlign = 'center';
    ctx.font = 'bold 48px sans-serif';
    ctx.fillText('Hidden Message Challenge', 600, 80);
    ctx.fillStyle = COLORS.text;
    ctx.font = '26px sans-serif';
    ctx.fillText(I18n.t('results.imageTitle'), 600, 128);
    const chart = document.createElement('canvas');
    chart.width = chart.height = 440;
    drawRadar(chart.getContext('2d'), 440, summary);
    ctx.drawImage(chart, 60, 160);
    ctx.textAlign = 'left';
    ctx.font = '28px sans-serif';
    Progress.KINDS.forEach((kind, i) => {
      const k = summary.perKind[kind];
      ctx.fillText(`${kindName(kind)}: ${k.solved}/${k.total} (${k.percent}%)`, 580, 230 + i * 56);
    });
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(I18n.t('results.total', summary), 580, 480);
    ctx.fillText(I18n.t('results.rank', { rank: summary.rank, title: I18n.t(`rank.${summary.rank}`) }), 580, 530);
    const link = document.createElement('a');
    link.href = image.toDataURL('image/png');
    link.download = 'hidden-message-challenge-result.png';
    link.click();
  }

  $('download-image').addEventListener('click', downloadImage);
  $('reset-all').addEventListener('click', () => resetModal.showModal());
  $('reset-cancel').addEventListener('click', () => resetModal.close());
  $('reset-ok').addEventListener('click', () => {
    resetModal.close();
    Store.reset();
    notice.textContent = I18n.t('reset.done');
  });
  resetModal.addEventListener('close', () => $('reset-all').focus());
  document.addEventListener('progresschange', render);
  document.addEventListener('languagechange', () => {
    notice.textContent = '';
    render();
  });
  render();
});
