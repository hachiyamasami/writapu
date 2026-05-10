// === Criteria definitions ===
const CRITERIA = {
  'p2-opinion': [
    { key: 'content',   label: '内容', icon: '内', iconClass: 'ic', scoreClass: 'scc', max: 4,
      stdText: '意見とそれに沿った理由2つが含まれているか',
      advice: '自分の意見と理由を2つ書きましょう。意見と矛盾する理由は書かないようにしてください。' },
    { key: 'structure', label: '構成', icon: '構', iconClass: 'is', scoreClass: 'scs', max: 4,
      stdText: '英文の構成や流れがわかりやすく論理的であるか',
      advice: 'First / Second / For example などの接続詞を使って、論理的な流れを作りましょう。意見→理由→まとめの順が効果的です。' },
    { key: 'vocabulary', label: '語彙', icon: '語', iconClass: 'iv', scoreClass: 'scv', max: 4,
      stdText: '課題に相応しい語彙を正しく使えているか',
      advice: '同じ単語の繰り返しを避け、多様な語彙を使いましょう。スペルミスに注意してください。' },
    { key: 'grammar',   label: '文法', icon: '文', iconClass: 'ig', scoreClass: 'scg', max: 4,
      stdText: '文構造のバリエーションやそれらを正しく使えているか',
      advice: '関係代名詞など複雑な文構造も取り入れましょう。不完全な文（主語・動詞が欠ける）に注意してください。' },
  ],
  'p2-email': [
    { key: 'content',   label: '内容', icon: '内', iconClass: 'ic', scoreClass: 'scc', max: 4,
      stdText: '下線部に関する疑問文が2つ正しく書けており、返信として自然か',
      advice: '下線部（下線の語句）について具体的な疑問文を2つ書きましょう。Where / How big / How many / When / What can you do など疑問詞を使うと具体的になります。' },
    { key: 'vocabulary', label: '語彙', icon: '語', iconClass: 'iv', scoreClass: 'scv', max: 4,
      stdText: '準2級レベルにふさわしい語彙を適切に使えているか',
      advice: '同じ単語の繰り返しを避け、スペルミスに注意しましょう。文頭の大文字も確認してください。' },
    { key: 'grammar',   label: '文法', icon: '文', iconClass: 'ig', scoreClass: 'scg', max: 4,
      stdText: '文法的に正しい英文か、文構造にバリエーションがあるか',
      advice: '疑問文の語順（Do you / What is など）に特に注意しましょう。冠詞・三単現のs・時制の誤りも採点対象です。' },
  ],
  '3-opinion': [
    { key: 'content',   label: '内容', icon: '内', iconClass: 'ic', scoreClass: 'scc', max: 4,
      stdText: '自分の考えとそれに沿った理由2つが含まれているか',
      advice: '自分の考えと理由を2つ書きましょう。意見と矛盾する理由は書かないようにしてください。' },
    { key: 'structure', label: '構成', icon: '構', iconClass: 'is', scoreClass: 'scs', max: 4,
      stdText: '英文の構成や流れがわかりやすいか',
      advice: 'First / Second / Also などの接続詞を使って、まとまりのある文章を作りましょう。' },
    { key: 'vocabulary', label: '語彙', icon: '語', iconClass: 'iv', scoreClass: 'scv', max: 4,
      stdText: '課題に相応しい語彙を正しく使えているか',
      advice: '同じ単語の繰り返しを避け、多様な語彙を使いましょう。スペルミスに注意してください。' },
    { key: 'grammar',   label: '文法', icon: '文', iconClass: 'ig', scoreClass: 'scg', max: 4,
      stdText: '文法的に正しい英文が書けているか',
      advice: '不完全な文（主語・動詞が欠ける）に注意してください。三単現の s なども確認しましょう。' },
  ],
  '3-email': [
    { key: 'content',   label: '内容', icon: '内', iconClass: 'ic', scoreClass: 'scc', max: 3,
      stdText: '2つの質問に正しく答えているか',
      advice: 'タスクをきちんとこなすことが最重要です。2つの質問に漏れなく答えましょう。' },
    { key: 'vocabulary', label: '語彙', icon: '語', iconClass: 'iv', scoreClass: 'scv', max: 3,
      stdText: '課題に相応しい語彙を正しく使えているか',
      advice: '正確なスペルで書きましょう。文頭の大文字・複数形なども採点対象です。' },
    { key: 'grammar',   label: '文法', icon: '文', iconClass: 'ig', scoreClass: 'scg', max: 3,
      stdText: '文法的に正しい英文が書けているか',
      advice: '不完全な文にも気をつけてください。三単現の s や時制にも注意しましょう。' },
  ],
};

// === State ===
let currentGradeType = 'p2-opinion';
let currentQuestion = null;
let isCustomMode = false;
let settingsStates = Array(7).fill(false);

// === DOM helper ===
const $ = id => document.getElementById(id);

// === Screen management ===
function showScreen(name) {
  ['landing', 'main', 'settings'].forEach(s => {
    $('screen-' + s).style.display = s === name ? 'block' : 'none';
  });
  if (name === 'settings') resetSettings();
  window.scrollTo(0, 0);
}

// === API key management ===
function getApiKey() { return localStorage.getItem('raitapu_api_key'); }
function saveApiKey(key) { localStorage.setItem('raitapu_api_key', key); }
function deleteApiKey() { localStorage.removeItem('raitapu_api_key'); }

// === Main screen ===
function initMain() {
  const saved = localStorage.getItem('raitapu_grade') || 'p2-opinion';
  currentGradeType = saved;
  $('grade-select').value = saved;
  loadNewQuestion();
}

function handleGradeChange() {
  currentGradeType = $('grade-select').value;
  localStorage.setItem('raitapu_grade', currentGradeType);
  $('answer-ta').value = '';
  updateWordCount();
  hideResults();
  if (isCustomMode) {
    renderCustomQuestion();
  } else {
    loadNewQuestion();
  }
}

function loadNewQuestion() {
  const list = QUESTIONS[currentGradeType];
  const idx = Math.floor(Math.random() * list.length);
  currentQuestion = list[idx];
  renderQuestion();
  $('answer-ta').value = '';
  updateWordCount();
  hideResults();
}

function toggleCustomMode() {
  isCustomMode = !isCustomMode;
  const btn = $('custom-mode-btn');
  btn.textContent = isCustomMode ? '↺ ランダム出題に戻る' : '✏ 自分で問題を入力する';
  btn.classList.toggle('active', isCustomMode);
  $('answer-ta').value = '';
  updateWordCount();
  hideResults();
  if (isCustomMode) {
    renderCustomQuestion();
  } else {
    loadNewQuestion();
  }
}

function senderName() {
  return currentGradeType === '3-email' ? 'James' : 'Alex';
}

function buildInstHtml() {
  const type = currentGradeType;
  let inst = [];
  if (type === 'p2-opinion') {
    inst = [
      'あなたは，外国人の知り合いから以下のQUESTIONをされました。',
      'QUESTIONについて，あなたの<u>意見とその理由を2つ</u>英文で書きなさい。',
      '語数の目安は50語〜60語です。',
      '解答がQUESTIONに対応していないと判断された場合は，<u>0点と採点されることがあります。</u>QUESTIONをよく読んでから答えてください。',
    ];
  } else if (type === 'p2-email') {
    inst = [
      'あなたは，外国人の知り合い（Alex）から，Eメールで質問を受け取りました。このEメールを読み，それに対する返信メールを書きなさい。',
      'あなたが書く返信メールの中で，AlexのEメール文中の<u>下線部について，より理解を深めるために，下線部の特徴を問う具体的な質問を2つ</u>しなさい。',
      '語数の目安は40語〜50語です。',
      '解答がAlexのEメールに対応していないと判断された場合は，<u>0点と採点されることがあります。</u>',
    ];
  } else if (type === '3-opinion') {
    inst = [
      'あなたは，外国人の友達から以下のQUESTIONをされました。',
      'QUESTIONについて，あなたの<u>考えとその理由を2つ</u>英文で書きなさい。',
      '語数の目安は25語〜35語です。',
      '解答がQUESTIONに対応していないと判断された場合は，<u>0点と採点されることがあります。</u>QUESTIONをよく読んでから答えてください。',
    ];
  } else {
    inst = [
      'あなたは，外国人の友達（James）から以下のEメールを受け取りました。Eメールを読み，それに対する返信メールを書きなさい。',
      '友達（James）からの<u>2つの質問（下線部）に対応する内容</u>を，あなた自身で自由に考えて答えなさい。',
      '語数の目安は15語〜25語です。',
      '解答がJamesのEメールに対応していないと判断された場合は，<u>0点と採点されることがあります。</u>',
    ];
  }
  return '<ul class="q-inst">' + inst.map(s => `<li>${s}</li>`).join('') + '</ul>';
}

function renderCustomQuestion() {
  const isEmail = currentGradeType.includes('email');
  const sender = senderName();
  const instHtml = buildInstHtml();

  let contentHtml = '';
  if (isEmail) {
    const is3Email = currentGradeType === '3-email';
    const underlinePlaceholder = is3Email
      ? '下線を引きたい質問文を入力（複数ある場合は改行で区切る）'
      : '下線を引きたい語句を入力（例: a farmers\' market）';
    contentHtml = `<div class="q-blk">
      <div class="email-box custom-email-box">
        <div class="email-from">From: ${sender}</div>
        <div class="custom-email-fixed">Hi,</div>
        <textarea class="q-custom-ta" id="custom-question-ta" placeholder="ここにEメールの本文を入力してください..."></textarea>
        <div class="custom-email-fixed">Your friend,<br>${sender}</div>
      </div>
      <div class="custom-underline-wrap">
        <span class="custom-underline-label">下線部</span>
        <textarea class="custom-underline-ta" id="custom-underline-ta" rows="2" placeholder="${underlinePlaceholder}"></textarea>
        <p class="custom-underline-note">本文中の文字列と完全一致させてください。採点で下線部として扱われます。</p>
      </div>
    </div>`;
  } else {
    contentHtml = `<div class="q-blk">
      <div class="q-lbl">QUESTION</div>
      <textarea class="q-custom-ta" id="custom-question-ta" placeholder="ここに問題文を入力してください..."></textarea>
    </div>`;
  }

  $('question-body').innerHTML = instHtml + contentHtml;

  const open = $('email-reply-open');
  const close = $('email-reply-close');
  const ta = $('answer-ta');
  if (isEmail) {
    $('email-reply-salutation').textContent = `Hi, ${sender}!`;
    open.style.display = 'block';
    close.style.display = 'block';
    ta.classList.add('email-mode');
  } else {
    open.style.display = 'none';
    close.style.display = 'none';
    ta.classList.remove('email-mode');
  }
}

function trimEmailWrapper(text, sender) {
  // "From: ..." 行を除去
  text = text.replace(/^From:\s*\S+[^\n]*\n?/i, '');
  // "Hi!" / "Hi," / "Hi, Name!" などを除去
  text = text.replace(/^Hi[,!]?\s*(?:,?\s*\w+\s*!?)?\s*\n?/i, '');
  // 末尾の "Your friend, / Name" を除去
  text = text.replace(/\n?Your friend,?\s*\n?\s*\w+\s*$/i, '');
  // 末尾の "Best wishes, / Name" を除去
  text = text.replace(/\n?Best wishes,?\s*\n?\s*\w+\s*$/i, '');
  return text.trim();
}

function buildCustomQuestion() {
  const type = currentGradeType;
  const isEmail = type.includes('email');
  const ta = $('custom-question-ta');
  if (!ta || !ta.value.trim()) return null;

  if (isEmail) {
    const sender = senderName();
    const body = trimEmailWrapper(ta.value.trim(), sender);
    const wordMin = type === 'p2-email' ? 40 : 15;
    const wordMax = type === 'p2-email' ? 50 : 25;

    let bodyHtml = body.replace(/\n/g, '<br>');
    const underlineTa = $('custom-underline-ta');
    if (underlineTa && underlineTa.value.trim()) {
      const parts = underlineTa.value.split('\n').map(s => s.trim()).filter(Boolean);
      parts.forEach(part => {
        const escaped = part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        bodyHtml = bodyHtml.replace(new RegExp(escaped, 'g'), `<u>${part}</u>`);
      });
    }

    return {
      from: sender,
      body: `Hi,<br><br>${bodyHtml}<br><br>Your friend,<br>${sender}`,
      wordMin,
      wordMax,
    };
  } else {
    const wordMin = type === 'p2-opinion' ? 50 : 25;
    const wordMax = type === 'p2-opinion' ? 60 : 35;
    return { text: ta.value.trim(), wordMin, wordMax };
  }
}

function renderQuestion() {
  const type = currentGradeType;
  const q = currentQuestion;
  const isEmail = type.includes('email');

  const instHtml = buildInstHtml();

  let contentHtml = '';
  if (isEmail) {
    contentHtml = `<div class="q-blk"><div class="email-box"><div class="email-from">From: ${q.from}</div>${q.body}</div></div>`;
  } else {
    contentHtml = `<div class="q-blk"><div class="q-lbl">QUESTION</div><div class="q-txt">${q.text}</div></div>`;
  }

  $('question-body').innerHTML =
    instHtml + contentHtml +
    '<div class="q-foot"><button class="new-btn" id="new-question-btn">↺ 次の問題へ</button></div>';

  $('new-question-btn').addEventListener('click', loadNewQuestion);

  const open = $('email-reply-open');
  const close = $('email-reply-close');
  const ta = $('answer-ta');
  if (isEmail) {
    $('email-reply-salutation').textContent = `Hi, ${q.from}!`;
    open.style.display = 'block';
    close.style.display = 'block';
    ta.classList.add('email-mode');
  } else {
    open.style.display = 'none';
    close.style.display = 'none';
    ta.classList.remove('email-mode');
  }
}

function updateWordCount() {
  const text = $('answer-ta').value.trim();
  const count = text === '' ? 0 : text.split(/\s+/).filter(w => w.length > 0).length;
  $('word-count').textContent = count;
}

function hideResults() {
  $('result-block').style.display = 'none';
  $('errors-block').style.display = 'none';
  $('overall-block').style.display = 'none';
  $('loading-block').style.display = 'none';
}

async function handleSubmit() {
  const apiKey = getApiKey();
  if (!apiKey) { showScreen('settings'); return; }

  const answerText = $('answer-ta').value.trim();
  if (!answerText) { alert('英文を入力してください。'); return; }

  let questionForScoring = currentQuestion;
  if (isCustomMode) {
    questionForScoring = buildCustomQuestion();
    if (!questionForScoring) { alert('問題文を入力してください。'); return; }
  }

  const btn = $('submit-btn');
  btn.disabled = true;
  btn.textContent = '採点中…';
  hideResults();
  $('loading-block').style.display = 'block';

  try {
    const result = await scoreAnswer(apiKey, currentGradeType, questionForScoring, answerText);
    $('loading-block').style.display = 'none';
    renderResult(result);
    $('result-block').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    $('loading-block').style.display = 'none';
    alert('採点に失敗しました。\n\n' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '採点する →';
  }
}

function renderResult(result) {
  const criteria = CRITERIA[currentGradeType];
  const total = criteria.reduce((s, c) => s + (result.scores?.[c.key] || 0), 0);
  const maxTotal = criteria.reduce((s, c) => s + c.max, 0);

  let rows = '';
  criteria.forEach(c => {
    const score = Math.max(0, Math.min(c.max, result.scores?.[c.key] || 0));
    const comment = (result.comments?.[c.key] || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    rows += `<tr>
      <td class="obs-td"><div class="obs-icon ${c.iconClass}">${c.label}</div></td>
      <td class="sc-td"><div class="score-frac ${c.scoreClass}">${score}<span class="score-den">/${c.max}</span></div></td>
      <td>
        <div class="std-txt">${c.stdText}</div>
        <button class="adv-btn" onclick="toggleAdvice(this)"><span>▶</span> アドバイス</button>
        <div class="adv-box">${c.advice}</div>
      </td>
      <td><div class="cmt-txt">${comment}</div></td>
    </tr>`;
  });

  $('result-body').innerHTML = `
    <div class="res-top">
      <div style="display:flex;align-items:baseline;gap:4px">
        <span class="total-big">${total}</span>
        <span class="total-den">/${maxTotal}</span>
        <span class="total-lbl">点</span>
      </div>
      <button class="print-btn" onclick="window.print()">🖨 印刷</button>
    </div>
    <table>
      <thead>
        <tr>
          <th class="obs-td">観点</th>
          <th class="ctr">スコア</th>
          <th style="width:200px">採点基準</th>
          <th>コメント</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  $('result-block').style.display = 'block';

  const esc = s => String(s ?? '').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // errors block
  const rawErrors = Array.isArray(result.errors) ? result.errors : [];
  const errors = rawErrors.map(e => {
    if (typeof e === 'string') return e;
    const kind  = e['誤りの種類'] || '';
    const wrong = e['誤った表現'] || '';
    const right = e['正しい表現'] || '';
    if (kind && wrong && right) return `${kind}：${wrong} → ${right}`;
    return e.correction ?? e.error ?? e.message ?? JSON.stringify(e);
  }).filter(Boolean);
  if (errors.length > 0) {
    $('errors-list').innerHTML = errors.map(e => `<li>${esc(e)}</li>`).join('');
    $('errors-none').style.display = 'none';
  } else {
    $('errors-list').innerHTML = '';
    $('errors-none').style.display = 'block';
  }
  $('errors-block').style.display = 'block';

  // overall block
  const overall = esc(result.overall);
  $('overall-text').innerHTML = overall ? `<div class="overall-comment">${overall}</div>` : '';
  $('overall-block').style.display = 'block';
}

function toggleAdvice(btn) {
  const box = btn.nextElementSibling;
  box.classList.toggle('show');
  btn.querySelector('span').textContent = box.classList.contains('show') ? '▼' : '▶';
}

// === API key deletion ===
function handleDeleteApiKey() {
  if (confirm('APIキーを削除します。よろしいですか？\n削除後はランディング画面に移動します。')) {
    deleteApiKey();
    showScreen('landing');
  }
}

// === Settings screen ===
function resetSettings() {
  settingsStates.fill(false);
  for (let i = 0; i < 7; i++) {
    $('cb' + i).className = 'cb';
  }
  $('cbAll').className = 'all-cb';
  $('api-inp').disabled = true;
  $('api-inp').value = '';
  $('save-api-btn').disabled = true;
}

function toggleSettingsCheck(i) {
  settingsStates[i] = !settingsStates[i];
  $('cb' + i).className = 'cb' + (settingsStates[i] ? ' on' : '');
  updateSettingsAllState();
}

function toggleAllSettings() {
  const next = !settingsStates.every(s => s);
  settingsStates.fill(next);
  for (let i = 0; i < 7; i++) {
    $('cb' + i).className = 'cb' + (next ? ' on' : '');
  }
  updateSettingsAllState();
}

function updateSettingsAllState() {
  const all = settingsStates.every(s => s);
  $('cbAll').className = 'all-cb' + (all ? ' on' : '');
  $('api-inp').disabled = !all;
  $('save-api-btn').disabled = !all;
}

function handleSave() {
  const key = $('api-inp').value.trim();
  if (!key) { alert('APIキーを入力してください。'); return; }
  if (!/^AIza[A-Za-z0-9_\-]{30,}$/.test(key)) {
    alert('APIキーの形式が正しくありません。\n「AIza」で始まる39文字程度の文字列を入力してください。');
    return;
  }
  saveApiKey(key);
  showScreen('main');
  initMain();
}

// === Initialization ===
function init() {
  // Landing
  $('landing-cta').addEventListener('click', () => showScreen('settings'));
  $('landing-cta2').addEventListener('click', () => showScreen('settings'));

  // Main nav
  $('nav-settings').addEventListener('click', () => showScreen('settings'));
  $('api-change-btn').addEventListener('click', () => showScreen('settings'));
  $('api-delete-btn').addEventListener('click', handleDeleteApiKey);

  // Grade selector
  $('grade-select').addEventListener('change', handleGradeChange);

  // Custom mode toggle
  $('custom-mode-btn').addEventListener('click', toggleCustomMode);

  // Answer textarea
  $('answer-ta').addEventListener('input', updateWordCount);

  // Submit
  $('submit-btn').addEventListener('click', handleSubmit);

  // Settings checkboxes (event delegation)
  $('agree-list').addEventListener('click', e => {
    const item = e.target.closest('[data-idx]');
    if (item) toggleSettingsCheck(parseInt(item.dataset.idx));
  });
  $('all-row').addEventListener('click', toggleAllSettings);
  $('settings-back').addEventListener('click', () => {
    if (getApiKey()) showScreen('main');
    else showScreen('landing');
  });
  $('save-api-btn').addEventListener('click', handleSave);

  // Initial screen
  if (getApiKey()) {
    showScreen('main');
    initMain();
  } else {
    showScreen('landing');
  }
}

window.addEventListener('DOMContentLoaded', init);
