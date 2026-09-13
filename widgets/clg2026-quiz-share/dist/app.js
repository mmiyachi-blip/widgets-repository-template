const TYPES = {
  t1: { name: "変革ドライバー型", icon: "🏛️", desc: "理念やビジョンを、実行可能な構造とカルチャーに変えていく推進者タイプ。組織の同質化やサイロに、正面から向き合おうとしています。", highlights: [
    "大企業のサイロや同質化を、9年かけてどう突破したかの実例",
    "覚悟を持って一歩踏み出す、経営としての意思決定プロセス",
    "カルチャー変革を「形」から組織に実装する具体的な手法"
  ]},
  t2: { name: "AIネイティブ戦略家型", icon: "🤖", desc: "AIを前提に、事業や成長のあり方そのものを再設計しようとする戦略家タイプ。既存事業と新しい成長機会の両立を模索しています。", highlights: [
    "全社一斉ではなく「特区」から始めるAI変革の進め方",
    "既存事業とAI新規事業を両立させる二軸の経営体制",
    "製品が同質化する時代に競争優位となる「届ける力」の作り方"
  ]},
  t3: { name: "データ司令官型", icon: "📊", desc: "顧客の状態を数値とデータで可視化し、組織の意思決定の共通言語をつくるタイプ。ヘルススコアや指標設計への関心が高めです。", highlights: [
    "マーケ・営業・CSをまたいで通じる、ヘルススコアの共通言語化",
    "「活用度」と「ファン度」を組み込んだ指標設計の考え方",
    "NRRや解約リスクを可視化する仕組みづくりの勘所"
  ]},
  t4: { name: "スケール職人型", icon: "⚙️", desc: "限られた人数で、最大の顧客を支える仕組み化と生産性のプロタイプ。ロングテール顧客の扱い方に強い関心があります。", highlights: [
    "1人で数億円規模の顧客を支える生産性構造の作り方",
    "ロングテール顧客を「コスト」から「収益源」に変える発想転換",
    "ハイタッチと仕組み化を両立させる設計のポイント"
  ]},
  t5: { name: "共創プロデューサー型", icon: "🌱", desc: "コミュニティやパートナーとの共創で、事業の可能性を広げるタイプ。エコシステムへの投資対効果を見極めようとしています。", highlights: [
    "コミュニティ・Education投資の費用対効果をどう見極めるか",
    "デジタルファーストでCSとマーケを融合させる事例",
    "パートナーエコシステムが生み出す中長期の競争優位"
  ]},
};
const TRACKS = { A: { label: "経営トラック", chip: "経営トラック 向け" }, B: { label: "実践トラック", chip: "実践トラック 向け" } };
const SESSIONS = [
  { id: "A1", track: "A", time: "14:00-14:30", title: "大企業で「お客様大事」は、なぜ動かなくなるのか ― 創業の理念を、文化として組織に実装した9年間", speaker: "元パナソニック コネクト株式会社 CEO　樋口 泰行 氏", weights: { t1: 3, t2: 0, t3: 0, t4: 0, t5: 0 } },
  { id: "A2", track: "A", time: "14:45-15:15", title: "競争優位はGTMの設計力に移った ― ソフトバンクが挑む組織変革とデジタル顧客育成", speaker: "ソフトバンク株式会社　原田 博行 氏", weights: { t1: 1, t2: 0, t3: 3, t4: 2, t5: 0 } },
  { id: "A3", track: "A", time: "15:25-15:55", title: "製品サポートからカスタマーサクセス企業への転換 ― 顧客中心経営への変革のリアル", speaker: "CTCテクノロジー株式会社　本田 和也 氏", weights: { t1: 2, t2: 0, t3: 0, t4: 0, t5: 0 } },
  { id: "A4", track: "A", time: "16:05-16:45", title: "AIネイティブへの転換は、2026年 ― レベニュープロセスから始まる全社構造改革", speaker: "株式会社ビズリーチ　外山 英幸 氏", weights: { t1: 0, t2: 3, t3: 0, t4: 0, t5: 0 } },
  { id: "A5", track: "A", time: "16:55-17:35", title: "ナレッジワーク社が目指すAX共創圏 ― 顧客・パートナーと共に描くAI変革エコシステム", speaker: "株式会社ナレッジワーク　麻野 耕司 氏", weights: { t1: 0, t2: 1, t3: 0, t4: 0, t5: 3 } },
  { id: "A6", track: "A", time: "17:45-18:15", title: "「人×AI」が解く、成長の方程式 ― 既存事業のスケールと非連続な飛躍の両立への挑戦", speaker: "jinjer株式会社　冨永 健 氏", weights: { t1: 0, t2: 2, t3: 0, t4: 1, t5: 0 } },
  { id: "B1", track: "B", time: "14:45-15:15", title: "プリ・ポストセールスの融合で実現する顧客LTV最大化への挑戦", speaker: "パーソルキャリア株式会社　金澤 万梨香 氏", weights: { t1: 0, t2: 2, t3: 0, t4: 2, t5: 0 } },
  { id: "B2", track: "B", time: "15:25-15:55", title: "1人で数億円の顧客を守る ― 圧倒的生産性を誇る2社が実践する“顧客が顧客を育てる”仕組み", speaker: "HENNGE株式会社／株式会社オービックビジネスコンサルタント", weights: { t1: 0, t2: 0, t3: 1, t4: 3, t5: 1 } },
  { id: "B3", track: "B", time: "16:05-16:35", title: "創業50年を超えるリーディングカンパニーが取ったSaaSへのビジネス変革に伴うGTM戦略", speaker: "パラマウントベッド株式会社／株式会社プロシップ", weights: { t1: 1, t2: 0, t3: 2, t4: 0, t5: 2 } },
];

const QUESTIONS = [
  { key: "track", title: "今、あなたがCLGについて考える立場は？", choices: [
    { label: "経営層・事業責任者（戦略を描く側）", value: "A" },
    { label: "実務担当者・現場推進者（戦術を練り実行する側）", value: "B" },
  ]},
  { title: "今、社内でいちばん頭を悩ませているのは？", choices: [
    { label: "事業部間のサイロや意思決定の遅さで、変革が前に進まない", type: "t1" },
    { label: "AIをどう事業成長の武器にするか、まだ答えが出ていない", type: "t2" },
    { label: "本当はスケールしたいのに、結局ハイタッチから離れられない", type: "t4" },
  ]},
  { title: "LTVの最大化の実現のために、今一番力を入れたい打ち手は？", choices: [
    { label: "AIを前提に、事業や成長の仕組みそのものを作り変える", type: "t2" },
    { label: "顧客データやヘルススコアで、打ち手の精度を上げる", type: "t3" },
    { label: "顧客やパートナーへの体系的な学習を通じて、企業のブランド価値を確立する", type: "t5" },
  ]},
  { title: "あなたの組織は、今どのフェーズに近い？", choices: [
    { label: "理念やビジョンはあるが、まだ現場の実行にまで落ちていない", type: "t1" },
    { label: "顧客数の拡大スピードに、人的リソースが追いついていない", type: "t4" },
    { label: "個別対応はできているが、学びやノウハウを「仕組み」として広げられていない", type: "t5" },
  ]},
  { title: "このカンファレンスで一番知りたいのは？", choices: [
    { label: "AIを前提にした事業・成長戦略の描き方", type: "t2" },
    { label: "データやヘルススコアを共通言語にする方法", type: "t3" },
    { label: "生産性を上げながら、顧客体験の質を落とさない仕組みづくり", type: "t4" },
  ]},
];

const TICKET_URL = "https://www.gainsight.co.jp/clg2026#ticket";
const QUIZ_SHARE_URL = "https://communities.gainsight.com/p/clgconference2026";
const EVENT_DATE_LABEL = "2026.10.06(火) JPタワー ホール＆カンファレンス";

export async function init(sdk) {
  await sdk.whenReady();

  let currentQ = 0;
  let track = null;
  let scores = { t1: 0, t2: 0, t3: 0, t4: 0, t5: 0 };
  let resultTypeKey = null;
  let resultTypeInfo = null;
  let resultSession = null;
  let resultTimer = null;
  let answeredChoices = [];

  const screens = {
    intro: sdk.$("#clg2026std-screen-intro"),
    quiz: sdk.$("#clg2026std-screen-quiz"),
    result: sdk.$("#clg2026std-screen-result"),
  };

  const progressRow = sdk.$("#clg2026std-progressRow");
  const progressFill = sdk.$("#clg2026std-progressFill");
  const progressLabel = sdk.$("#clg2026std-progressLabel");
  const qIndexLabel = sdk.$("#clg2026std-qIndexLabel");
  const qTitle = sdk.$("#clg2026std-qTitle");
  const qChoices = sdk.$("#clg2026std-qChoices");
  const resultIcon = sdk.$("#clg2026std-resultIcon");
  const resultTypeName = sdk.$("#clg2026std-resultTypeName");
  const resultTypeDesc = sdk.$("#clg2026std-resultTypeDesc");
  const resultTrackChip = sdk.$("#clg2026std-resultTrackChip");
  const primarySessionSlot = sdk.$("#clg2026std-primarySessionSlot");
  const otherSessionsSlot = sdk.$("#clg2026std-otherSessionsSlot");
  const shareCanvas = sdk.$("#clg2026std-shareCanvas");

  function showScreen(name) {
    Object.values(screens).forEach((s) => s.classList.remove("active"));
    screens[name].classList.add("active");
  }

  function trackClick(questionIndex, questionTitle, choiceLabel) {
    new window.WidgetServiceSDK().connectors.execute({
      permalink: "airtable-click-event",
      method: "POST",
      payload: {
        fields: {
          questionIndex: String(questionIndex),
          questionTitle,
          choiceLabel,
          clickedAt: new Date().toISOString(),
        },
      },
    }).catch(() => {});
  }

  function submitEmailRecord(email) {
    return new window.WidgetServiceSDK().connectors.execute({
      permalink: "airtable-email-submission",
      method: "POST",
      payload: {
        fields: {
          email,
          resultTypeKey,
          resultTypeName: resultTypeInfo.name,
          track,
          recommendedSessionId: resultSession.id,
          answers: answeredChoices.join(" / "),
          submittedAt: new Date().toISOString(),
        },
      },
    });
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function renderQuestion() {
    const q = QUESTIONS[currentQ];
    qIndexLabel.textContent = "QUESTION " + (currentQ + 1);
    qTitle.textContent = q.title;
    progressLabel.textContent = "Q" + (currentQ + 1) + " / " + QUESTIONS.length;
    progressFill.style.width = ((currentQ) / QUESTIONS.length * 100) + "%";

    qChoices.innerHTML = "";
    const letters = ["A", "B", "C"];
    q.choices.forEach((choice, i) => {
      const btn = document.createElement("button");
      btn.className = "choice";
      btn.innerHTML = "<b>" + letters[i] + "</b>" + choice.label;
      btn.addEventListener("click", () => selectChoice(q, choice));
      qChoices.appendChild(btn);
    });
  }

  function selectChoice(q, choice) {
    trackClick(currentQ, q.title, choice.label);
    answeredChoices.push(choice.label);
    if (q.key === "track") {
      track = choice.value;
    } else {
      scores[choice.type] += 1;
    }
    currentQ++;
    if (currentQ < QUESTIONS.length) {
      renderQuestion();
    } else {
      progressFill.style.width = "100%";
      resultTimer = setTimeout(showResult, 250);
    }
  }

  function pickMajorityType() {
    let best = "t1", bestScore = -1;
    Object.keys(scores).forEach((t) => {
      if (scores[t] > bestScore) { bestScore = scores[t]; best = t; }
    });
    return best;
  }

  function rankSessions() {
    const pool = SESSIONS.filter((s) => s.track === track);
    const scored = pool.map((s) => {
      let dot = 0;
      Object.keys(scores).forEach((t) => (dot += (s.weights[t] || 0) * scores[t]));
      return { session: s, dot };
    });
    scored.sort((a, b) => b.dot - a.dot);
    return scored.map((x) => x.session);
  }

  function renderSessionCard(session, isPrimary, highlights) {
    const div = document.createElement("div");
    div.className = "session-card" + (isPrimary ? " primary" : "");
    let html = (isPrimary ? '<div class="pick-tag">YOUR BEST MATCH</div>' : "") +
      '<div class="session-time">' + session.time + "　｜　" + TRACKS[session.track].label + "</div>" +
      '<div class="session-title">' + session.title + "</div>" +
      '<div class="session-speaker">' + session.speaker + "</div>";
    if (highlights && highlights.length) {
      html += '<div class="session-highlights-label">✨ このセッションで学べること</div>' +
        '<ul class="session-highlights">' + highlights.map((h) => "<li>" + h + "</li>").join("") + "</ul>";
    }
    div.innerHTML = html;
    return div;
  }

  function showResult() {
    resultTypeKey = pickMajorityType();
    resultTypeInfo = TYPES[resultTypeKey];
    resultIcon.textContent = resultTypeInfo.icon;
    resultTypeName.textContent = resultTypeInfo.name;
    resultTypeDesc.textContent = resultTypeInfo.desc;
    resultTrackChip.textContent = TRACKS[track].chip;

    const ranked = rankSessions();
    resultSession = ranked[0];
    primarySessionSlot.innerHTML = "";
    otherSessionsSlot.innerHTML = "";
    primarySessionSlot.appendChild(renderSessionCard(ranked[0], true, resultTypeInfo.highlights));
    ranked.slice(1, 3).forEach((s) => otherSessionsSlot.appendChild(renderSessionCard(s, false)));

    progressRow.classList.remove("show");
    showScreen("result");
  }

  function startQuiz() {
    currentQ = 0;
    track = null;
    scores = { t1: 0, t2: 0, t3: 0, t4: 0, t5: 0 };
    answeredChoices = [];
    emailForm.style.display = "none";
    emailSuccess.style.display = "none";
    emailInput.value = "";
    progressRow.classList.add("show");
    renderQuestion();
    showScreen("quiz");
  }

  function goToTicket() {
    window.open(TICKET_URL, "_blank");
  }

  function shareText() {
    return "【CLG Leaders Summit 2026｜診断結果】\n"
      + "私は「" + resultTypeInfo.name + "」\n\n"
      + "おすすめ👇\n"
      + "「" + resultSession.title + "」\n\n"
      + "10/6、会場で続きを。\n"
      + QUIZ_SHARE_URL + "\n\n"
      + "#CLG20261006 #Gainsight";
  }

  function wrapText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const chars = text.split("");
    let line = "", yy = y, lines = 0;
    for (let i = 0; i < chars.length; i++) {
      const test = line + chars[i];
      if (ctx.measureText(test).width > maxWidth && line !== "") {
        ctx.fillText(line, x, yy);
        line = chars[i];
        yy += lineHeight;
        lines++;
        if (maxLines && lines >= maxLines) { return yy; }
      } else {
        line = test;
      }
    }
    ctx.fillText(line, x, yy);
    return yy + lineHeight;
  }

  function drawShareCanvas() {
    const ctx = shareCanvas.getContext("2d");
    const w = shareCanvas.width, h = shareCanvas.height;
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#1a1033");
    grad.addColorStop(0.55, "#0e1a30");
    grad.addColorStop(1, "#062028");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    function blob(x, y, r, c1) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, c1);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 0.55;
    blob(w * 0.08, h * 0.06, 420, "#8a6bff");
    blob(w * 0.95, h * 0.95, 460, "#38e5d6");
    ctx.globalAlpha = 1;

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 42px sans-serif";
    ctx.fillText("Gainsight", 64, 110);
    ctx.font = "28px sans-serif";
    ctx.fillStyle = "#a9b4c7";
    ctx.fillText("Customer-Led Growth Leaders Summit 2026", 64, 150);

    ctx.font = "26px sans-serif";
    ctx.fillStyle = "#a9b4c7";
    ctx.fillText("今のあなたの挑戦テーマ", 64, 240);
    ctx.font = "100px sans-serif";
    ctx.fillText(resultTypeInfo.icon, 64, 350);
    ctx.font = "bold 66px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(resultTypeInfo.name, 64, 450);
    ctx.font = "30px sans-serif";
    ctx.fillStyle = "#dfe4ee";
    let yAfterDesc = wrapText(ctx, resultTypeInfo.desc, 64, 510, w - 128, 42, 3);

    ctx.font = "bold 32px sans-serif";
    ctx.fillStyle = "#38e5d6";
    ctx.fillText("🎯 おすすめセッション", 64, yAfterDesc + 40);
    ctx.font = "bold 38px sans-serif";
    ctx.fillStyle = "#ffffff";
    let yAfterTitle = wrapText(ctx, resultSession.title, 64, yAfterDesc + 100, w - 128, 48, 3);
    ctx.font = "27px sans-serif";
    ctx.fillStyle = "#a9b4c7";
    ctx.fillText(resultSession.speaker, 64, yAfterTitle + 20);
    ctx.fillText(resultSession.time + "　" + TRACKS[resultSession.track].label, 64, yAfterTitle + 58);

    ctx.font = "bold 30px sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(EVENT_DATE_LABEL, 64, h - 100);
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "#a9b4c7";
    ctx.fillText("#CLG2026 #CustomerLedGrowth", 64, h - 60);
  }

  function downloadShareImage() {
    drawShareCanvas();
    const link = document.createElement("a");
    link.download = "clg2026-result.png";
    link.href = shareCanvas.toDataURL("image/png");
    link.click();
  }

  function shareToX() {
    const url = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText());
    window.open(url, "_blank");
  }

  function toggleEmailForm() {
    emailSuccess.style.display = "none";
    emailForm.style.display = (emailForm.style.display === "none" || !emailForm.style.display) ? "block" : "none";
  }

  async function submitEmail() {
    const email = emailInput.value.trim();

    emailFormError.style.display = "none";
    if (!isValidEmail(email)) {
      emailFormError.textContent = "正しいメールアドレスを入力してください。";
      emailFormError.style.display = "block";
      return;
    }

    emailSubmitBtn.disabled = true;
    emailSubmitBtn.textContent = "送信中…";
    try {
      await submitEmailRecord(email);
      emailForm.style.display = "none";
      emailSuccess.style.display = "block";
    } catch (e) {
      emailFormError.textContent = "送信に失敗しました。時間をおいて再度お試しください。";
      emailFormError.style.display = "block";
    } finally {
      emailSubmitBtn.disabled = false;
      emailSubmitBtn.textContent = "送信";
    }
  }

  const startBtn = sdk.$("#clg2026std-start-btn");
  const ticketBtn = sdk.$("#clg2026std-ticket-btn");
  const restartBtn = sdk.$("#clg2026std-restart-btn");
  const downloadBtn = sdk.$("#clg2026std-download-btn");
  const shareXBtn = sdk.$("#clg2026std-share-x-btn");
  const shareMailBtn = sdk.$("#clg2026std-share-mail-btn");
  const emailForm = sdk.$("#clg2026std-emailForm");
  const emailInput = sdk.$("#clg2026std-emailInput");
  const emailSubmitBtn = sdk.$("#clg2026std-emailSubmitBtn");
  const emailFormError = sdk.$("#clg2026std-emailFormError");
  const emailSuccess = sdk.$("#clg2026std-emailSuccess");
  const emailTicketBtn = sdk.$("#clg2026std-emailTicketBtn");

  startBtn.addEventListener("click", startQuiz);
  ticketBtn.addEventListener("click", goToTicket);
  restartBtn.addEventListener("click", startQuiz);
  downloadBtn.addEventListener("click", downloadShareImage);
  shareXBtn.addEventListener("click", shareToX);
  shareMailBtn.addEventListener("click", toggleEmailForm);
  emailSubmitBtn.addEventListener("click", submitEmail);
  emailTicketBtn.addEventListener("click", goToTicket);

  sdk.on("destroy", () => {
    clearTimeout(resultTimer);
    startBtn.removeEventListener("click", startQuiz);
    ticketBtn.removeEventListener("click", goToTicket);
    restartBtn.removeEventListener("click", startQuiz);
    downloadBtn.removeEventListener("click", downloadShareImage);
    shareXBtn.removeEventListener("click", shareToX);
    shareMailBtn.removeEventListener("click", toggleEmailForm);
    emailSubmitBtn.removeEventListener("click", submitEmail);
    emailTicketBtn.removeEventListener("click", goToTicket);
  });
}
