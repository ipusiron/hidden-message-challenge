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
    // s5: the holes show a full-size つ, so writing it as seen is also accepted
    { id: 's5', grid: ['あいうえお', 'かきくけこ', 'さしすせそ', 'たちつてと', 'なにぬねの'],
      mask: ['00000', '10100', '00100', '11000', '00100'], solution: { rotation: 2, anagram: true }, answers: ['すとけっこう', 'すとけつこう'] }
  ].map(s => ({ ...s, grid: s.grid.map(row => [...row]), mask: s.mask.map(row => [...row].map(Number)) }));

  const SETS = { headline: HEADLINE, removeChar: REMOVE, position: POSITION, stencil: STENCIL };

  // ---------- English set ----------
  // Historical texts (source: true) are public domain; their sources are in source.<id> of js/i18n.js.
  // The two World War I cables follow Hoy (1932), the earliest printing whose page could be checked.
  const EN_HEADLINE = [
    { id: 'ea1', text: 'Hope the weather holds this week.\nI finally fixed the old bicycle.\nDo write when you get the chance.\n' +
      'Every day here is much the same.', answers: ['hide'] },
    { id: 'ea2', text: 'Remember to water the garden.\nUncle Tom says hello to everyone.\nNext month we visit the coast.\nNot much else has happened.\n' +
      'Oliver passed his driving test.\nWrite back soon.', answers: ['runnow'] },
    { id: 'ea3', text: 'Nothing new to report from the farm.\nOur lambs arrived early this spring.\nRain has kept us indoors most days.\n' +
      'The roof still leaks in the barn.\nHannah sends her love to the children.\nGrandfather is walking again.\n' +
      'All of us hope to see you at Easter.\nTell Peter the fence is mended.\nEveryone asks after you.', answers: ['northgate'] },
    { id: 'ea4', source: true, text: 'Elizabeth it is in vain you say\n“Love not” — thou sayest it in so sweet a way:\nIn vain those words from ' +
      'thee or L. E. L.\nZantippe’s talents had enforced so well:\nAh! if that language from thy heart arise,\n' +
      'Breathe it less gently forth — and veil thine eyes.\nEndymion, recollect, when Luna tried\nTo cure his love — ' +
      'was cured of all beside —\nHis folly — pride — and passion — for he died.', answers: ['elizabeth'] },
    { id: 'ea5', source: true, text: 'A boat, beneath a sunny sky,\nLingering onward dreamily\nIn an evening of July——\n\nChildren three that ' +
      'nestle near,\nEager eye and willing ear,\nPleased a simple tale to hear——\n\nLong has paled that sunny sky:\n' +
      'Echoes fade and memories die:\nAutumn frosts have slain July.\n\nStill she haunts me, phantomwise,\nAlice ' +
      'moving under skies\nNever seen by waking eyes.\n\nChildren yet, the tale to hear,\nEager eye and willing ' +
      'ear,\nLovingly shall nestle near.\n\nIn a Wonderland they lie,\nDreaming as the days go by,\nDreaming as the ' +
      'summers die:\n\nEver drifting down the stream——\nLingering in the golden gleam——\nLife, what is it but a ' +
      'dream?', answers: ['alicepleasanceliddell'] }
  ];

  // Each picture word sounds like the letter to remove
  const EN_REMOVE = [
    { id: 'er1', picture: '🐝 "bee"', cipher: 'BMEBETBMBEABTNOON', remove: ['B'], answers: ['meetmeatnoon'] },
    { id: 'er2', picture: '🍵 "tea"', cipher: 'TRUNHOTMENOWT', remove: ['T'], answers: ['runhomenow'] },
    { id: 'er3', picture: '🌊 "sea"', cipher: 'BCRCINCGTHEMACPC', remove: ['C'], answers: ['bringthemap'] },
    { id: 'er4', picture: '👁️ "eye"', cipher: 'ITHIEPILANHASICHIANIGIEIDI', remove: ['I'], answers: ['theplanhaschanged'] },
    { id: 'er5', picture: '🐝 "bee" + 🍵 "tea"', cipher: 'TCOBMTEALONTE', remove: ['B', 'T'], answers: ['comealone'] }
  ];

  const EN_POSITION = [
    { id: 'ep1', source: true, text: 'President’s embargo ruling should have immediate notice. Grave situation affecting international law. ' +
      'Statement foreshadows ruin of many neutrals. Yellow journals unifying national excitement immensely.',
      rule: { kind: 'words', index: 0 }, answers: ['pershingsailsfromnyjunei', 'pershingsailsfromnyjune1'] },
    { id: 'ep2', text: 'Still extra quiet here.', rule: { kind: 'words', index: -1 }, answers: ['late'] },
    { id: 'ep3', text: 'Dear Ann, spring is here. Our garden is green, orange lilies in bloom. Next week we travel.',
      rule: { kind: 'mark', marks: [',', '.'], offset: 1, lettersOnly: true }, answers: ['soon'] },
    { id: 'ep4', source: true, text: 'Apparently neutrals’ protest is thoroughly discounted and ignored. Isman hard hit. Blockade issue affects ' +
      'pretext for embargo on by-products, ejecting suets and vegetable oils.',
      rule: { kind: 'words', index: 1 }, answers: ['pershingsailsfromnyjunei', 'pershingsailsfromnyjune1'] },
    { id: 'ep5', source: true, text: 'WORTHIE SIR JOHN—Hope, that is yᵉ beste comfort of yᵉ afflictyd, cannot much, I fear me, help you now. That I ' +
      'wolde saye to you, is this only: if ever I may be able to requite that I do owe you, stand not upon asking of ' +
      'me. ’Tis not much I can do: but what I can do, bee you verie sure I wille. I knowe that, if dethe comes, if ' +
      'ordinary men fear it, it frights not you, accounting it for a high honour, to have such a rewarde of your ' +
      'loyalty. Pray yet that you may be spared this soe bitter, cup. I fear not that you will grudge any ' +
      'sufferings: only if bie submission you can turn them away, ’tis the part of a wise man. Tell me, an if you ' +
      'can, to do for you any thinge that you wolde have done. The general goes back on Wednesday. Restinge your ' +
      'servant to command.\nR. T.',
      rule: { kind: 'mark', marks: [',', '.', ':', '—'], offset: 3, lettersOnly: true }, answers: ['panelateastendofchapelslides'] }
  ];

  // Stencils: letters placed row by row; the mask is stored turned back, so `solution.rotation` reveals the message
  const EN_STENCIL = [
    // es1: the holes sit one column in from the edge, so some show through where the card is first laid (one right, one up)
    { id: 'es1', grid: ['UNTJW', 'YBFST', 'YJJPT', 'GRXYQ', 'ASQEB'], mask: ['00000', '00010', '00010', '00010', '00000'],
      solution: { rotation: 0 }, answers: ['spy'] },
    { id: 'es2', grid: ['CUCOY', 'HRLDU', 'RIBUE', 'RRQYK', 'ACTRP'], mask: ['00100', '11000', '00000', '00000', '10000'],
      solution: { rotation: 1 }, answers: ['code'] },
    { id: 'es3', grid: ['USUQB', 'VSECR', 'HHWXW', 'TQETE', 'IWRUX'], mask: ['00000', '01100', '00000', '11100', '00010'],
      solution: { rotation: 2 }, answers: ['secret'] },
    { id: 'es4', grid: ['SFTAD', 'ZLNBJ', 'YRIHH', 'ADABS', 'MCTHE'], mask: ['10000', '00010', '10100', '00100', '10000'],
      solution: { rotation: 2, anagram: true }, answers: ['hidden'] },
    { id: 'es5', grid: ['EAYTL', 'TKHIT', 'XTAZK', 'CKATD', 'ACWNV'], mask: ['01010', '00011', '00111', '10110', '00011'],
      solution: { rotation: 1 }, answers: ['attackatdawn'] }
  ].map(s => ({ ...s, grid: s.grid.map(row => [...row]), mask: s.mask.map(row => [...row].map(Number)) }));

  const EN = { headline: EN_HEADLINE, removeChar: EN_REMOVE, position: EN_POSITION, stencil: EN_STENCIL };
  const BY_SET = { ja: SETS, en: EN };
  return { BY_SET };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = HiddenData;
