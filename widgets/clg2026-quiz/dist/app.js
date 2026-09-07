const TYPES = {
  t1: { name: "変革ドライバー型", icon: "🏛️", desc: "理念やビジョンを、実行可能な構造とカルチャーに変えていく推進者タイプ。組織の同質化やサイロに、正面から向き合おうとしています。" },
  t2: { name: "AIネイティブ戦略家型", icon: "🤖", desc: "AIを前提に、事業や成長のあり方そのものを再設計しようとする戦略家タイプ。既存事業と新しい成長機会の両立を模索しています。" },
  t3: { name: "データ司令官型", icon: "📊", desc: "顧客の状態を数値とデータで可視化し、組織の意思決定の共通言語をつくるタイプ。ヘルススコアや指標設計への関心が高めです。" },
  t4: { name: "スケール職人型", icon: "⚙️", desc: "限られた人数で、最大の顧客を支える仕組み化と生産性のプロタイプ。ロングテール顧客の扱い方に強い関心があります。" },
  t5: { name: "共創プロデューサー型", icon: "🌱", desc: "コミュニティやパートナーとの共創で、事業の可能性を広げるタイプ。エコシステムへの投資対効果を見極めようとしています。" },
};

const TRACKS = {
  A: { label: "経営トラック", chip: "経営トラック 向け" },
  B: { label: "実践トラック", chip: "実践トラック 向け" },
};

const SESSIONS = [
  { id: "A1", track: "A", time: "14:00-14:30", title: "大企業で「お客様大事」は、なぜ動かなくなるのか ― 創業の理念を、文化として組織に実装した9年間",
    speaker: "元パナソニック コネクト株式会社 CEO　樋口 泰行 氏", weights: { t1: 3, t2: 0, t3: 0, t4: 0, t5: 0 } },
  { id: "A2", track: "A", time: "14:45-15:15", title: "競争優位はGTMの設計力に移った ― ソフトバンクが挑む組織変革とデジタル顧客育成",
    speaker: "ソフトバンク株式会社　原田 博行 氏", weights: { t1: 1, t2: 0, t3: 3, t4: 2, t5: 0 } },
  { id: "A3", track: "A", time: "15:25-15:55", title: "製品サポートからカスタマーサクセス企業への転換 ― 顧客中心経営への変革のリアル",
    speaker: "CTCテクノロジー株式会社　本田 和也 氏", weights: { t1: 2, t2: 0, t3: 0, t4: 0, t5: 0 } },
  { id: "A4", track: "A", time: "16:05-16:45", title: "AIネイティブへの転換は、2026年 ― レベニュープロセスから始まる全社構造改革",
    speaker: "株式会社ビズリーチ　外山 英幸 氏", weights: { t1: 0, t2: 3, t3: 0, t4: 0, t5: 0 } },
  { id: "A5", track: "A", time: "16:55-17:35", title: "ナレッジワーク社が目指すAX共創圏 ― 顧客・パートナーと共に描くAI変革エコシステム",
    speaker: "株式会社ナレッジワーク　麻野 耕司 氏", weights: { t1: 0, t2: 1, t3: 0, t4: 0, t5: 3 } },
  { id: "A6", track: "A", time: "17:45-18:15", title: "「人×AI」が解く、成長の方程式 ― 既存事業のスケールと非連続な飛躍の両立への挑戦",
    speaker: "jinjer株式会社　冨永 健 氏", weights: { t1: 0, t2: 2, t3: 0, t4: 1, t5: 0 } },

  { id: "B1", track: "B", time: "14:45-15:15", title: "プリ・ポストセールスの融合で実現する顧客LTV最大化への挑戦",
    speaker: "パーソルキャリア株式会社　金澤 万梨香 氏", weights: { t1: 0, t2: 2, t3: 0, t4: 2, t5: 0 } },
  { id: "B2", track: "B", time: "15:25-15:55", title: "1人で数億円の顧客を守る ― 圧倒的生産性を誇る2社が実践する“顧客が顧客を育てる”仕組み",
    speaker: "HENNGE株式会社／株式会社オービックビジネスコンサルタント", weights: { t1: 0, t2: 0, t3: 1, t4: 3, t5: 1 } },
  { id: "B3", track: "B", time: "16:05-16:35", title: "創業50年を超えるリーディングカンパニーが取ったSaaSへのビジネス変革に伴うGTM戦略",
    speaker: "パラマウントベッド株式会社／株式会社プロシップ", weights: { t1: 1, t2: 0, t3: 2, t4: 0, t5: 2 } },
];

const QUESTIONS = [
  {
    key: "track",
    title: "今、あなたがCLGについて考える立場は？",
    choices: [
      { label: "経営層・事業責任者（戦略を描く側）", value: "A" },
      { label: "実務担当者・現場推進者（戦術を練り実行する側）", value: "B" },
    ],
  },
  {
    title: "今、社内でいちばん頭を悩ませているのは？",
    choices: [
      { label: "事業部間のサイロや意思決定の遅さで、変革がなかなか前に進まない", type: "t1" },
      { label: "AIをどう事業成長の武器にするか、まだ答えが出ていない", type: "t2" },
      { label: "顧客の状態がデータで見えておらず、感覚頼みの判断になっている", type: "t3" },
      { label: "顧客数は増えているのに、支える人手が全く足りていない", type: "t4" },
      { label: "コミュニティやセルフサーブへの投資判断がなかなかできない", type: "t5" },
    ],
  },
  {
    title: "今、一番強く意識している成果指標は？",
    choices: [
      { label: "カルチャー変革の定着度・全社の意思決定スピード", type: "t1" },
      { label: "AI活用による新規事業や成長方程式そのもの", type: "t2" },
      { label: "NRR・ヘルススコア・解約リスクの可視化精度", type: "t3" },
      { label: "1人あたりが支えられる顧客数・生産性", type: "t4" },
      { label: "コミュニティの活性度・エンゲージメントのROI", type: "t5" },
    ],
  },
  {
    title: "あなたの組織は、今どのフェーズに近い？",
    choices: [
      { label: "理念やビジョンはあるが、まだ現場の実行にまで落ちていない", type: "t1" },
      { label: "AIネイティブな事業モデルへ踏み出す入口に立っている", type: "t2" },
      { label: "データ基盤はあるが、まだ十分に使いこなせていない", type: "t3" },
      { label: "顧客数の拡大スピードに、人的リソースが追いついていない", type: "t4" },
      { label: "コミュニティや顧客教育の仕組みを、これから強化したい", type: "t5" },
    ],
  },
  {
    title: "このカンファレンスで一番知りたいのは？",
    choices: [
      { label: "大企業の変革を実際に成功させた組織のつくり方", type: "t1" },
      { label: "AIを前提にした事業・成長戦略の描き方", type: "t2" },
      { label: "データやヘルススコアを共通言語にする方法", type: "t3" },
      { label: "少人数でスケールする仕組み・生産性の作り方", type: "t4" },
      { label: "コミュニティ／エコシステムでLTVを伸ばす方法", type: "t5" },
    ],
  },
];

const TICKET_URL = "https://www.gainsight.co.jp/clg2026#ticket";

export async function init(sdk) {
  await sdk.whenReady();

  let currentQ = 0;
  let track = null;
  let scores = { t1: 0, t2: 0, t3: 0, t4: 0, t5: 0 };
  let resultTimer = null;

  const screens = {
    intro: sdk.$("#clg2026-screen-intro"),
    quiz: sdk.$("#clg2026-screen-quiz"),
    result: sdk.$("#clg2026-screen-result"),
  };

  const progressRow = sdk.$("#clg2026-progressRow");
  const progressFill = sdk.$("#clg2026-progressFill");
  const progressLabel = sdk.$("#clg2026-progressLabel");
  const qIndexLabel = sdk.$("#clg2026-qIndexLabel");
  const qTitle = sdk.$("#clg2026-qTitle");
  const qChoices = sdk.$("#clg2026-qChoices");
  const resultIcon = sdk.$("#clg2026-resultIcon");
  const resultTypeName = sdk.$("#clg2026-resultTypeName");
  const resultTypeDesc = sdk.$("#clg2026-resultTypeDesc");
  const resultTrackChip = sdk.$("#clg2026-resultTrackChip");
  const primarySessionSlot = sdk.$("#clg2026-primarySessionSlot");
  const otherSessionsSlot = sdk.$("#clg2026-otherSessionsSlot");

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

  function renderQuestion() {
    const q = QUESTIONS[currentQ];
    qIndexLabel.textContent = "QUESTION " + (currentQ + 1);
    qTitle.textContent = q.title;
    progressLabel.textContent = "Q" + (currentQ + 1) + " / " + QUESTIONS.length;
    progressFill.style.width = ((currentQ) / QUESTIONS.length * 100) + "%";

    qChoices.innerHTML = "";
    const letters = ["A", "B", "C", "D", "E"];
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

  function renderSessionCard(session, isPrimary) {
    const div = document.createElement("div");
    div.className = "session-card" + (isPrimary ? " primary" : "");
    div.innerHTML =
      (isPrimary ? '<div class="pick-tag">YOUR BEST MATCH</div>' : "") +
      '<div class="session-time">' + session.time + "　｜　" + TRACKS[session.track].label + "</div>" +
      '<div class="session-title">' + session.title + "</div>" +
      '<div class="session-speaker">' + session.speaker + "</div>";
    return div;
  }

  function showResult() {
    const majorType = pickMajorityType();
    const typeInfo = TYPES[majorType];

    resultIcon.textContent = typeInfo.icon;
    resultTypeName.textContent = typeInfo.name;
    resultTypeDesc.textContent = typeInfo.desc;
    resultTrackChip.textContent = TRACKS[track].chip;

    const ranked = rankSessions();
    primarySessionSlot.innerHTML = "";
    otherSessionsSlot.innerHTML = "";

    primarySessionSlot.appendChild(renderSessionCard(ranked[0], true));
    ranked.slice(1, 3).forEach((s) => otherSessionsSlot.appendChild(renderSessionCard(s, false)));

    progressRow.classList.remove("show");
    showScreen("result");
  }

  function startQuiz() {
    currentQ = 0;
    track = null;
    scores = { t1: 0, t2: 0, t3: 0, t4: 0, t5: 0 };
    progressRow.classList.add("show");
    renderQuestion();
    showScreen("quiz");
  }

  function goToTicket() {
    window.open(TICKET_URL, "_blank");
  }

  const startBtn = sdk.$("#clg2026-start-btn");
  const ticketBtn = sdk.$("#clg2026-ticket-btn");
  const restartBtn = sdk.$("#clg2026-restart-btn");

  startBtn.addEventListener("click", startQuiz);
  ticketBtn.addEventListener("click", goToTicket);
  restartBtn.addEventListener("click", startQuiz);

  sdk.on("destroy", () => {
    clearTimeout(resultTimer);
    startBtn.removeEventListener("click", startQuiz);
    ticketBtn.removeEventListener("click", goToTicket);
    restartBtn.removeEventListener("click", startQuiz);
  });
}
