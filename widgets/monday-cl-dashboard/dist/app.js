const CLOSED_SUCCESS_STATUS_ID = "1I0017YS8AFRMU8633Q1UQ82Q59GAD98Q83M";

function extractJsonRpcMessage(raw) {
  if (raw && typeof raw === "object" && (raw.result || raw.error)) return raw;
  const text = typeof raw === "string" ? raw : JSON.stringify(raw);
  if (text.indexOf("data:") !== -1) {
    const blocks = text.split(/\r?\n\r?\n/);
    for (const block of blocks) {
      const dataLines = block
        .split(/\r?\n/)
        .filter((line) => line.indexOf("data:") === 0)
        .map((line) => line.slice(5).trim())
        .join("\n");
      if (!dataLines || dataLines === "[DONE]") continue;
      try {
        const parsed = JSON.parse(dataLines);
        if (parsed.result || parsed.error) return parsed;
      } catch (e) {
        continue;
      }
    }
    throw new Error("CSMCPの応答（event-stream）を解析できませんでした。");
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("CSMCPの応答を解析できませんでした。");
  }
}

function toolPayload(rawResponse) {
  const message = extractJsonRpcMessage(rawResponse);
  if (message.error) throw new Error(message.error.message || "CSMCPツールがエラーを返しました。");
  const result = message.result;
  if (!result) return {};
  if (result.isError) {
    const errText = (result.content || []).map((c) => c.text || "").filter(Boolean).join("\n");
    throw new Error(errText || "CSMCPツールがエラーを返しました。");
  }
  if (result.structuredContent) return result.structuredContent;
  const text = (result.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");
  if (!text) return result;
  try {
    return JSON.parse(text);
  } catch (e) {
    return { text };
  }
}

function findRecords(value) {
  if (!value || typeof value !== "object") return [];
  for (const key of ["records", "data", "results", "items"]) {
    if (Array.isArray(value[key]) && value[key].every((item) => item && typeof item === "object")) {
      return value[key];
    }
  }
  for (const nested of Object.values(value)) {
    const found = findRecords(nested);
    if (found.length) return found;
  }
  return [];
}

function dueClass(dueDate) {
  if (!dueDate) return "";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  if (isNaN(due.getTime())) return "";
  return due < today ? "color:#B3261E;font-weight:600" : "";
}

export async function init(sdk) {
  await sdk.whenReady();
  const props = sdk.getProps();
  const widgetServiceSdk = new window.WidgetServiceSDK();

  const companyNameEl = sdk.$(".cl-company-name");
  const csmEl = sdk.$(".cl-csm");
  const listEl = sdk.$(".cl-cta-list");
  const dueInput = sdk.$(".cl-due");
  const registerBtn = sdk.$(".cl-register");
  const formMsg = sdk.$(".cl-form-msg");

  if (companyNameEl) companyNameEl.textContent = props.company_name || "(未設定)";
  if (csmEl) csmEl.textContent = "CSM: " + (props.csm_name || "-");

  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 7);
  if (dueInput) dueInput.value = defaultDue.toISOString().slice(0, 10);

  function showFormMsg(text, ok) {
    if (!formMsg) return;
    formMsg.textContent = text;
    formMsg.className = "cl-msg cl-form-msg " + (ok ? "ok" : "err");
  }

  function renderCtas(records) {
    if (!listEl) return;
    if (!records.length) {
      listEl.innerHTML = '<div class="cl-empty">オープンCTAはありません。</div>';
      return;
    }
    listEl.innerHTML = "";
    records.forEach((record) => {
      const row = document.createElement("div");
      row.className = "cl-cta-row";
      const name = record.Name || record.name || "(無題)";
      const due = record.DueDate || record.due_date || "";
      const priority = (record.PriorityId__gr && record.PriorityId__gr.Name) || record.PriorityId__gr_Name || "-";
      const status = (record.StatusId__gr && record.StatusId__gr.Name) || record.StatusId__gr_Name || "-";
      const gsid = record.Gsid || record.gsid || "";
      row.innerHTML =
        "<span>" + name + "</span>" +
        "<span style=\"" + dueClass(due) + "\">" + (due ? due.slice(0, 10) : "-") + "</span>" +
        "<span>" + priority + "</span>" +
        "<span>" + status + "</span>" +
        "<span></span>";
      const closeBtn = document.createElement("button");
      closeBtn.className = "cl-btn small";
      closeBtn.textContent = "クローズ";
      closeBtn.addEventListener("click", () => closeCta(gsid, closeBtn));
      row.lastElementChild.appendChild(closeBtn);
      listEl.appendChild(row);
    });
  }

  async function loadOpenCtas() {
    if (listEl) listEl.innerHTML = '<div class="cl-empty">読み込み中…</div>';
    try {
      const raw = await widgetServiceSdk.connectors.composite.execute({
        permalink: "cs-mcp-fetch-open-ctas",
        payload: { company_id: props.company_id }
      });
      const payload = toolPayload(raw);
      renderCtas(findRecords(payload));
    } catch (error) {
      console.error("fetch open ctas failed:", error);
      if (listEl) listEl.innerHTML = '<div class="cl-empty">CTA一覧を取得できませんでした。</div>';
    }
  }

  async function closeCta(gsid, buttonEl) {
    if (!gsid) return;
    if (buttonEl) {
      buttonEl.disabled = true;
      buttonEl.textContent = "処理中…";
    }
    try {
      const raw = await widgetServiceSdk.connectors.composite.execute({
        permalink: "cs-mcp-close-cta",
        payload: { cta_gsid: gsid, target_status_id: CLOSED_SUCCESS_STATUS_ID }
      });
      toolPayload(raw);
      await loadOpenCtas();
    } catch (error) {
      console.error("close cta failed:", error);
      if (buttonEl) {
        buttonEl.disabled = false;
        buttonEl.textContent = "クローズ";
      }
      showFormMsg("CTAのクローズに失敗しました: " + error.message, false);
    }
  }

  async function registerCta() {
    const nameInput = sdk.$(".cl-name");
    const nameErr = sdk.$(".cl-name-err");
    const dueErr = sdk.$(".cl-due-err");
    const statusSel = sdk.$(".cl-status");
    const prioritySel = sdk.$(".cl-priority");
    const reasonSel = sdk.$(".cl-reason");
    const descInput = sdk.$(".cl-desc");

    const name = (nameInput.value || "").trim();
    const due = dueInput.value;

    let ok = true;
    if (nameErr) nameErr.style.display = "none";
    if (dueErr) dueErr.style.display = "none";
    if (!name) {
      if (nameErr) nameErr.style.display = "block";
      ok = false;
    }
    if (!due) {
      if (dueErr) dueErr.style.display = "block";
      ok = false;
    }
    if (!ok) return;

    registerBtn.disabled = true;
    registerBtn.textContent = "登録中…";
    formMsg.className = "cl-msg cl-form-msg";

    try {
      const raw = await widgetServiceSdk.connectors.composite.execute({
        permalink: "cs-mcp-create-cta",
        payload: {
          cta_name: name,
          company_id: props.company_id,
          type_id: props.type_id,
          status_id: statusSel.value,
          priority_id: prioritySel.value,
          reason_id: reasonSel.value,
          owner_id: props.owner_id,
          due_date: due,
          description: (descInput.value || "").trim()
        }
      });
      toolPayload(raw);
      showFormMsg("CTAを登録しました。", true);
      nameInput.value = "";
      descInput.value = "";
      await loadOpenCtas();
    } catch (error) {
      console.error("create cta failed:", error);
      showFormMsg("CTAの登録に失敗しました: " + error.message, false);
    } finally {
      registerBtn.disabled = false;
      registerBtn.textContent = "CTAを登録";
    }
  }

  if (registerBtn) registerBtn.addEventListener("click", registerCta);

  sdk.on("propsChanged", (newProps) => {
    Object.assign(props, newProps);
    if (companyNameEl) companyNameEl.textContent = props.company_name || "(未設定)";
    if (csmEl) csmEl.textContent = "CSM: " + (props.csm_name || "-");
    loadOpenCtas();
  });

  await loadOpenCtas();
}
