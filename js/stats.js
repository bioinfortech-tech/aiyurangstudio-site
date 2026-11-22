// 방문 통계 비콘: 페이지 경로·유입 경로·언어·화면 폭만 보낸다 (IP는 서버에 저장하지 않음). DNT/GPC 켜져 있으면 보내지 않는다.
(function () {
  var HOST = "https://s.yurangstudio.com";
  try {
    if (navigator.doNotTrack === "1" || window.doNotTrack === "1" || navigator.globalPrivacyControl) return;
    if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname)) return;
    var q = new URLSearchParams(location.search).get("utm_source") || "";
    var d = JSON.stringify({ p: location.pathname, r: document.referrer, l: navigator.language, w: screen.width, u: q });
    var url = HOST + "/api/hit";
    if (!(navigator.sendBeacon && navigator.sendBeacon(url, d))) fetch(url, { method: "POST", body: d, keepalive: true, mode: "cors", credentials: "omit" });
  } catch (e) {}
})();
