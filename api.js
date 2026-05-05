async function scoreAnswer(apiKey, gradeType, question, answerText) {
  const systemPrompt = PROMPTS[gradeType];
  const userMessage = buildUserMessage(gradeType, question, answerText);

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n' + userMessage }] }],
        generationConfig: { temperature: 0.2 },
      }),
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const msg = errData.error?.message || `APIエラー（HTTP ${res.status}）`;
    if (res.status === 400 && msg.includes('API_KEY'))
      throw new Error('APIキーが無効です。設定を確認してください。');
    if (res.status === 429)
      throw new Error('リクエスト数の上限に達しました。しばらく待ってから再試行してください。');
    if (msg.includes('high demand') || msg.includes('overloaded') || res.status === 503)
      throw new Error('AIサーバーが混雑しています。しばらく待ってから再試行してください。');
    throw new Error(`採点エラー（HTTP ${res.status}）: ${msg}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error('AIの返答を解析できませんでした。もう一度試してください。');
  }
}

function buildUserMessage(gradeType, question, answerText) {
  if (gradeType.includes('email')) {
    const bodyText = question.body.replace(/<[^>]+>/g, '');
    return `以下のEメールと解答を採点してください。\n\n【問題（受け取ったEメール）】\nFrom: ${question.from}\n${bodyText}\n\n【受験者の解答】\n${answerText}`;
  }
  return `以下の問題と解答を採点してください。\n\n【QUESTION】\n${question.text}\n\n【受験者の解答】\n${answerText}`;
}
