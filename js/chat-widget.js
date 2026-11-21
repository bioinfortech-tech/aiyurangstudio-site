/* 홈페이지 채팅 위젯. 처음엔 작은 버튼만 만들고, 눌렀을 때 비로소 css/chat.css 를 불러와 대화를 시작한다.
   서버 주소는 아래 API 한 곳만 고치면 된다 (또는 페이지에서 window.YR_CHAT_API 를 먼저 지정). 외부 CDN 없음. */
(function () {
  "use strict";
  var API = (window.YR_CHAT_API || "https://s.yurangstudio.com").replace(/\/$/, "");
  var KEY = "yr_chat_v1";
  var lang = (document.documentElement.lang || "ko").slice(0, 2).toLowerCase();
  if (["ko", "en", "ja", "zh"].indexOf(lang) < 0) lang = "ko";
  var T = {
    ko: { open: "채팅 상담 열기", close: "닫기", title: "YURANGSTUDIO", ph: "메시지를 입력하세요", send: "보내기", name: "이름 (선택)", contact: "이메일 또는 전화번호", priv: "상담을 위해 대화 내용과 남기신 연락처를 저장해요.", privLink: "개인정보 처리방침", err: "연결이 원활하지 않아요. 잠시 뒤 다시 시도해 주세요.", rate: "메시지를 너무 빨리 보내고 있어요. 잠시 뒤 다시 보내 주세요.", wait: "담당자가 확인 중이에요. 답이 오면 여기에 표시돼요.", log: "대화 내용" },
    en: { open: "Open chat", close: "Close", title: "YURANGSTUDIO", ph: "Type a message", send: "Send", name: "Name (optional)", contact: "Email or phone number", priv: "We store this conversation and any contact details you leave so we can follow up.", privLink: "Privacy policy", err: "Connection problem. Please try again in a moment.", rate: "You're sending messages too fast. Please wait a moment.", wait: "A person is looking at this. Their reply will appear here.", log: "Conversation" },
    ja: { open: "チャットを開く", close: "閉じる", title: "YURANGSTUDIO", ph: "メッセージを入力", send: "送信", name: "お名前（任意）", contact: "メールまたは電話番号", priv: "ご相談のため、会話内容と残された連絡先を保存します。", privLink: "プライバシーポリシー", err: "接続に問題があります。しばらくしてからお試しください。", rate: "送信が早すぎます。しばらくお待ちください。", wait: "担当者が確認中です。返信はここに表示されます。", log: "会話" },
    zh: { open: "打开在线咨询", close: "关闭", title: "YURANGSTUDIO", ph: "请输入消息", send: "发送", name: "姓名（选填）", contact: "邮箱或电话", priv: "为便于咨询，我们会保存对话内容和您留下的联系方式。", privLink: "隐私政策", err: "连接不稳定，请稍后再试。", rate: "发送过快，请稍候再试。", wait: "负责人正在查看，回复会显示在这里。", log: "对话" }
  }[lang];

  function load() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  function save(o) { try { if (o) localStorage.setItem(KEY, JSON.stringify(o)); else localStorage.removeItem(KEY); } catch (e) {} }

  // 버튼 (처음부터 있는 유일한 요소)
  var st = document.createElement("style");
  st.textContent = ".yrc-btn{position:fixed;z-index:96;right:20px;bottom:calc(20px + env(safe-area-inset-bottom));width:52px;height:52px;border-radius:50%;background:#F3EEE4;color:#0B0B0D;font-size:22px;line-height:1;display:flex;align-items:center;justify-content:center;border:0;cursor:pointer;box-shadow:0 8px 28px rgba(0,0,0,.45);transition:transform .35s cubic-bezier(.16,1,.3,1)}.yrc-btn:hover{transform:scale(1.06)}.yrc-btn:focus-visible{outline:2px solid #F3EEE4;outline-offset:3px}@media (max-width:520px){.yrc-btn{right:16px}}";
  document.head.appendChild(st);
  var btn = document.createElement("button");
  btn.type = "button"; btn.className = "yrc-btn"; btn.textContent = "💬";
  btn.setAttribute("aria-label", T.open); btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "yrc-panel");
  document.body.appendChild(btn);

  var panel, log, chips, form, input, nameIn, contactIn, hp, sendBtn, contactBox;
  var s = load() || {}, after = 0, seen = {}, buttons = [], handoff = false, busy = false, started = false, timer = 0, isOpen = false;

  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function linkify(node, text) {
    var re = /https?:\/\/[^\s<>"']+/g, last = 0, m;
    while ((m = re.exec(text))) {
      if (m.index > last) node.appendChild(document.createTextNode(text.slice(last, m.index)));
      var a = el("a", "", m[0]); a.href = m[0]; a.target = "_blank"; a.rel = "noopener"; node.appendChild(a);
      last = m.index + m[0].length;
    }
    if (last < text.length) node.appendChild(document.createTextNode(text.slice(last)));
  }
  function add(role, text, id) {
    if (id != null) { if (seen[id]) return; seen[id] = 1; if (id > after) after = id; }
    var m = el("div", "yrc-m yrc-" + (role === "visitor" ? "me" : role));
    linkify(m, text); log.appendChild(m); log.scrollTop = log.scrollHeight; return m;
  }
  function note(text) { var n = el("div", "yrc-note", text); log.appendChild(n); log.scrollTop = log.scrollHeight; return n; }
  function renderChips() {
    chips.textContent = "";
    if (handoff) return;
    buttons.forEach(function (b) {
      var c = el("button", "yrc-chip", b.label); c.type = "button";
      c.addEventListener("click", function () { post(b.label, b.id); });
      chips.appendChild(c);
    });
  }
  function setHandoff(h) {
    if (h && !handoff) { handoff = true; contactBox.classList.add("show"); renderChips(); }
  }

  function api(path, method, body) {
    return fetch(API + path, { method: method, headers: body ? { "content-type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined, mode: "cors" })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j.__status = r.status; return j; }); });
  }
  function startConv() {
    return api("/api/chat/start", "POST", { lang: lang }).then(function (j) {
      if (!j.cid) throw new Error("start");
      s = { cid: j.cid, token: j.token }; save(s); after = 0; seen = {};
      buttons = j.buttons || []; (j.messages || []).forEach(function (m) { add(m.role, m.text, m.id); }); renderChips();
    });
  }
  function poll() {
    if (!s.cid || busy) return Promise.resolve();
    return api("/api/chat/poll?cid=" + s.cid + "&token=" + s.token + "&after=" + after + "&all=1", "GET").then(function (j) {
      if (j.__status === 403) { save(null); s = {}; log.textContent = ""; return startConv(); }
      if (j.messages) j.messages.forEach(function (m) { add(m.role, m.text, m.id); });
      if (j.buttons) buttons = j.buttons;
      setHandoff(!!j.handoff); if (!j.handoff) renderChips();
    }).catch(function () {});
  }
  function schedule() {
    clearTimeout(timer);
    if (!started) return;
    timer = setTimeout(function () { poll().then(schedule); }, isOpen && !document.hidden ? 3000 : 15000);
  }
  document.addEventListener("visibilitychange", schedule);

  function post(text, btnId) {
    if (busy) return;
    var contact = contactIn.value.trim(), name = nameIn.value.trim();
    if (!text && !contact) return;
    busy = true; sendBtn.disabled = true;
    var mine = text ? add("visitor", text) : null;
    api("/api/chat/send", "POST", { cid: s.cid, token: s.token, text: text, btn: btnId || undefined, name: name, contact: contact, hp: hp.value })
      .then(function (j) {
        if (j.__status === 403) { save(null); s = {}; throw new Error("auth"); }
        if (j.__status === 429) { note(T.rate); return; }
        if (!j.ok) throw new Error("send");
        if (mine && j.id) { seen[j.id] = 1; if (j.id > after) after = j.id; }
        (j.messages || []).forEach(function (m) { add(m.role, m.text, m.id); });
        if (j.handoff) { var was = handoff; setHandoff(true); if (was && !(j.messages || []).length) note(T.wait); }
        input.value = ""; renderChips();
      })
      .catch(function () { note(T.err); })
      .then(function () { busy = false; sendBtn.disabled = false; input.focus(); });
  }

  function build() {
    var css = document.createElement("link"); css.rel = "stylesheet";
    css.href = (scriptBase() + "css/chat.css?v=1"); document.head.appendChild(css);
    panel = el("div", "yrc-panel"); panel.id = "yrc-panel"; panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", T.title);
    var head = el("div", "yrc-head"); head.appendChild(el("div", "yrc-title", T.title));
    var x = el("button", "yrc-x", "×"); x.type = "button"; x.setAttribute("aria-label", T.close); x.addEventListener("click", function () { toggle(false); });
    head.appendChild(x);
    log = el("div", "yrc-log"); log.setAttribute("role", "log"); log.setAttribute("aria-live", "polite"); log.setAttribute("aria-label", T.log);
    chips = el("div", "yrc-chips");
    contactBox = el("div", "yrc-contact");
    nameIn = el("input", "yrc-in"); nameIn.placeholder = T.name; nameIn.maxLength = 60; nameIn.autocomplete = "name"; nameIn.setAttribute("aria-label", T.name);
    contactIn = el("input", "yrc-in"); contactIn.placeholder = T.contact; contactIn.maxLength = 120; contactIn.autocomplete = "email"; contactIn.setAttribute("aria-label", T.contact);
    contactBox.appendChild(nameIn); contactBox.appendChild(contactIn);
    form = el("form", "yrc-form");
    input = el("input", "yrc-in"); input.placeholder = T.ph; input.maxLength = 1000; input.autocomplete = "off"; input.setAttribute("aria-label", T.ph);
    hp = el("input", "yrc-hp"); hp.type = "text"; hp.name = "website"; hp.tabIndex = -1; hp.autocomplete = "off"; hp.setAttribute("aria-hidden", "true");
    sendBtn = el("button", "yrc-send", T.send); sendBtn.type = "submit";
    form.appendChild(input); form.appendChild(hp); form.appendChild(sendBtn);
    form.addEventListener("submit", function (e) { e.preventDefault(); post(input.value.trim()); });
    var priv = el("p", "yrc-priv", T.priv + " "); var pa = el("a", "", T.privLink); pa.href = "/privacy/"; pa.target = "_blank"; pa.rel = "noopener"; priv.appendChild(pa);
    [head, log, chips, contactBox, form, priv].forEach(function (n) { panel.appendChild(n); });
    document.body.appendChild(panel);
    panel.addEventListener("keydown", function (e) { if (e.key === "Escape") { toggle(false); btn.focus(); } });
  }
  function scriptBase() {
    var sc = document.querySelector('script[src*="chat-widget.js"]');
    var src = sc ? sc.getAttribute("src") : "/js/chat-widget.js";
    return src.replace(/js\/chat-widget\.js.*$/, "");
  }

  function toggle(open) {
    isOpen = open; btn.setAttribute("aria-expanded", String(open)); btn.setAttribute("aria-label", open ? T.close : T.open);
    if (!panel) { if (!open) return; build(); }
    requestAnimationFrame(function () { panel.classList.toggle("open", open); });
    if (open) {
      if (!started) {
        started = true;
        (s.cid ? poll() : startConv())
          .then(function () { if (!s.cid) return startConv(); })
          .catch(function () { note(T.err); started = false; })
          .then(function () { schedule(); input.focus(); });
      } else { schedule(); input.focus(); }
    } else schedule();
  }
  btn.addEventListener("click", function () { toggle(!isOpen); });
})();
