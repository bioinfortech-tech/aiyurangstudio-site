/* language helper: window.YR_LANG = ko | en | ja | zh (from <html lang>), window.YR_ROOT = site root URL, window.YR_S = UI strings for this language */
(function(){
var L=(document.documentElement.lang||"ko").slice(0,2).toLowerCase();
if(L!=="en"&&L!=="ja"&&L!=="zh")L="ko";
var cs=document.currentScript,src=cs&&cs.src?cs.src:"";
window.YR_LANG=L;
window.YR_ROOT=src?src.replace(/js\/[^\/]*$/,""):"";
var S={
ko:{play:function(t){return t+" 재생";},menuOpen:"메뉴 열기",menuClose:"메뉴 닫기",sending:"전송 중",send:"문의 보내기",okH:"문의가 접수되었습니다.",okP:"확인 후 직접 연락드리겠습니다.",err:"전송 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",net:"네트워크 오류입니다. 연결을 확인해주세요.",
 notes:["컷 길이 조정","색감 확인","자막 위치","BGM 볼륨"],all:"전체",cats:{brand:"광고 · 브랜드",product:"제품",vh:"버추얼 휴먼",short:"숏폼"},
 showreel:"유랑스튜디오 쇼릴",
 shop:"우리 가게",today:"오늘 예약 가능",book:"예약하기",shopBook:"우리 가게 예약"},
en:{play:function(t){return "Play "+t;},menuOpen:"Open menu",menuClose:"Close menu",sending:"Sending",send:"Send inquiry",okH:"Your inquiry has been received.",okP:"We will review it and get back to you directly.",err:"Something went wrong while sending. Please try again in a moment.",net:"Network error. Please check your connection.",
 notes:["Adjust cut length","Check color","Subtitle position","BGM volume"],all:"All",cats:{brand:"Advertising · Brand",product:"Product",vh:"Virtual Human",short:"Short-form"},
 showreel:"YURANGSTUDIO Showreel",
 shop:"Our Shop",today:"Booking open today",book:"Book now",shopBook:"Our Shop Booking"},
ja:{play:function(t){return t+"を再生";},menuOpen:"メニューを開く",menuClose:"メニューを閉じる",sending:"送信中",send:"送信する",okH:"お問い合わせを受け付けました。",okP:"内容を確認のうえ、こちらから直接ご連絡いたします。",err:"送信中にエラーが発生しました。しばらくしてからもう一度お試しください。",net:"ネットワークエラーです。接続をご確認ください。",
 notes:["カット尺の調整","色味の確認","字幕の位置","BGMの音量"],all:"すべて",cats:{brand:"広告・ブランド",product:"製品",vh:"バーチャルヒューマン",short:"ショート動画"},
 showreel:"YURANGSTUDIO ショーリール",
 shop:"当店",today:"本日ご予約可能",book:"予約する",shopBook:"当店 ご予約"},
zh:{play:function(t){return "播放 "+t;},menuOpen:"打开菜单",menuClose:"关闭菜单",sending:"发送中",send:"提交咨询",okH:"已收到您的咨询。",okP:"我们确认后会直接与您联系。",err:"发送时出现错误，请稍后再试。",net:"网络错误，请检查网络连接。",
 notes:["调整镜头时长","确认色彩","字幕位置","BGM 音量"],all:"全部",cats:{brand:"广告 · 品牌",product:"产品",vh:"虚拟人",short:"短视频"},
 showreel:"YURANGSTUDIO 作品集锦",
 shop:"我们的门店",today:"今日可预约",book:"立即预约",shopBook:"门店预约"}
};
window.YR_S=S[L];
})();
