// Puzzle data. Hints and explanations live in js/i18n.js under the ids below.
// `answers` lists the accepted spellings; the tests check that each one follows from the rule with HiddenCore.
const HiddenData = (() => {
  // Acrostic (read the first character of each line). `heads` gives the readings when a line starts with a kanji.
  const HEADLINE = [
    { id: 'h1', text: 'たったいま\nすきなひとに\nけっこんしようと\nてがみをおくった', answers: ['たすけて'] },
    { id: 'h2', text: '桜の花が咲く季節になりました\n母に会いに行こう\n悲しい気持ちが吹き飛びます\nいつまでも心に残る思い出です',
      heads: ['さくら', 'はは', 'かな', 'い'], answers: ['さくらははかない'] },
    { id: 'h3', text: 'からころも\nきつつなれにし\nつましあれば\nはるばるきぬる\nたびをしぞおもふ', answers: ['かきつはた', 'かきつばた'] },
    // h4 and h5 are quotations: the source is shown under the text (source.<id> in js/i18n.js)
    { id: 'h4', text: 'あくびがでるわ\nいやけがさすわ\nしにたいくらい\nてんでたいくつ\nまぬけなあなた\nすべってころべ', source: true,
      answers: ['あいしてます'] },
    { id: 'h5', text: 'えものにされる\nるおれはキラのそんざいを\nしってい\nつにころされるだけだ\nてまねきしているあい\nいずれしけいになるか\nると\nかんがえ',
      source: true, answers: ['えるしつているか', 'えるしっているか'] }
  ];

  // Character removal (the picture hint is a pun naming the characters to remove)
  const REMOVE = [
    { id: 'r1', picture: '🐛「けむし」', cipher: 'けあけりがけとけうけ', remove: ['け'], answers: ['ありがとう'] },
    { id: 'r2', picture: '🧽「けしごむ」', cipher: 'こごんごにむちむはごよごろむしむいご天ご気', remove: ['ご', 'む'],
      answers: ['こんにちはよろしい天気', 'こんにちはよろしいてんき'] },
    { id: 'r3', picture: '🧍📖「ひとりでよんでね」', cipher: 'ひあひすひひさんひじひひひにこひうひえひひんひであひひおうひ', remove: ['ひ'], answers: ['あすさんじにこうえんであおう'] },
    { id: 'r4', picture: '🔍「むしめがね」', cipher: 'がおねがはめがねよめうごがざねいがまねすめ', remove: ['め', 'が', 'ね'], answers: ['おはようございます'] },
    { id: 'r5', picture: '🐞「てんとうむし」', cipher: 'うたのてんしとうんといいうてちにんちでんすと', remove: ['て', 'ん', 'と', 'う'], answers: ['たのしいいちにちです'] }
  ];

  // Position rules. `reading` is the kana text the rule is applied to when the text itself contains kanji.
  const POSITION = [
    { id: 'p1', text: '春がきた。夏はあそびの。秋はよみ書し。冬は寒い。', rule: { kind: 'mark', marks: ['。'], offset: -1 }, answers: ['たのしい'] },
    { id: 'p2', text: '朝の空は明るい、だれかに会えそうな気がした。\n駅前の花壇には花が咲き、いろとりどりでにぎやかだった。\n' +
      'ベンチに座って少し休む、すずしい風が吹いていた。\n通りすがりの子どもが笑う、きれいな声が響いた。',
      rule: { kind: 'mark', marks: ['、'], offset: 1 }, answers: ['だいすき'] },
    { id: 'p3', text: 'あした、しんげきする。きかんするひは、まだきまっていない', rule: { kind: 'mark', marks: ['、', '。'], offset: 3 },
      answers: ['げんき'] },
    { id: 'p4', text: '逢坂も　果ては行き来の　関もゐず　尋ねて来ば来　来なば帰さじ',
      reading: 'あふさかも　はてはいききの　せきもゐず　たづねてこばこ　きなばかへさじ',
      rule: { kind: 'segments', separator: '　', order: 'firstLast', stripDakuten: true }, answers: ['あはせたきものすこし'] },
    { id: 'p5', text: 'いろはにほへと　ちりぬるをわか　よたれそつねな　らむうゐのおく　やまけふこえて　あさきゆめみし　ゑひもせす',
      rule: { kind: 'segments', separator: '　', order: 'last' }, answers: ['とかなくてしす', 'とがなくてしす'] }
  ];

  // Stencils. `solution` is where the holes show the message; `anagram` means the letters must be rearranged.
  const STENCIL = [
    { id: 's1', grid: ['さしすせそ', 'かきくけこ', 'なにぬねの', 'たちつてと', 'らりるれろ'],
      mask: ['10000', '10000', '10000', '00100', '01000'], solution: { rotation: 0 }, answers: ['さかなつり'] },
    { id: 's2', grid: ['いろはにほ', 'へとちりぬ', 'るをわかよ', 'たれそつね', 'ならむうゐ'],
      mask: ['00100', '00000', '11110', '00000', '00000'], solution: { rotation: 2, anagram: true }, answers: ['わかをよむ'] },
    { id: 's3', grid: ['さしすせそ', 'まみむめも', 'やいゆえよ', 'はひふへほ', 'わいうえを'],
      mask: ['00001', '10000', '01110', '00000', '00000'], solution: { rotation: 3, anagram: true }, answers: ['さむいふゆ'] },
    { id: 's4', grid: ['きょうはい', 'いてんきで', 'すねあした', 'もはれると', 'いいですね'],
      mask: ['00001', '00001', '00101', '00100', '00100'], solution: { rotation: 3 }, answers: ['きょうあした'] },
    { id: 's5', grid: ['あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの'],
      mask: ['00000', '10100', '00100', '11000', '00100'], solution: { rotation: 2, anagram: true }, answers: ['すとけっこう'] }
  ].map(s => ({ ...s, grid: s.grid.map(row => [...row]), mask: s.mask.map(row => [...row].map(Number)) }));

  const SETS = { headline: HEADLINE, removeChar: REMOVE, position: POSITION, stencil: STENCIL };
  return { HEADLINE, REMOVE, POSITION, STENCIL, SETS };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = HiddenData;
