/* TikTok Insight · Khám nhanh 1 clip (bấm từ dấu trang trên Safari iPhone / máy tính)
   Đọc dữ liệu clip ngay trên trang TikTok đang mở (trình duyệt thật, có cookie) rồi mở trang kết quả. */
(async function () {
  var APP = 'https://insight-qt.github.io/';
  var vid = (location.pathname.match(/\/(?:video|photo)\/(\d+)/) || [])[1];
  if (!/tiktok\.com$/.test(location.hostname) || !vid) { alert('Mở một clip TikTok trên trình duyệt (link có /video/) rồi bấm lại.'); return; }
  function itemFrom(txt) {
    try { var it = JSON.parse(txt).__DEFAULT_SCOPE__['webapp.video-detail'].itemInfo.itemStruct; return it && it.id ? it : null; } catch (e) { return null; }
  }
  var el = document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__');
  var it = el ? itemFrom(el.textContent) : null;
  // TikTok là trang 1 lần tải: lướt sang clip khác thì dữ liệu trên trang vẫn là clip cũ → tải lại đúng clip
  if (!it || String(it.id) !== vid) {
    try {
      var html = await fetch(location.origin + location.pathname, { credentials: 'include' }).then(function (r) { return r.text(); });
      var m = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
      it = m ? itemFrom(m[1]) : null;
    } catch (e) { it = null; }
  }
  if (!it) { alert('TikTok chưa trả số liệu clip này. Tải lại trang rồi bấm lại.'); return; }
  // chỉ giữ phần cần dùng, bỏ khối video nặng → link ngắn
  var au = it.author || {}, mu = it.music || {};
  var slim = {
    id: it.id, desc: it.desc, createTime: it.createTime, video: { duration: it.video && it.video.duration },
    author: { uniqueId: au.uniqueId, nickname: au.nickname, verified: au.verified },
    music: { title: mu.title, original: mu.original },
    stats: it.stats, statsV2: it.statsV2, authorStats: it.authorStats, authorStatsV2: it.authorStatsV2,
    diversificationLabels: it.diversificationLabels, suggestedWords: it.suggestedWords, isAd: it.isAd,
    isECVideo: it.isECVideo, anchors: (it.anchors || []).length ? [1] : [], locationCreated: it.locationCreated,
    poi: it.poi && it.poi.name ? { name: it.poi.name } : undefined, imagePost: it.imagePost ? {} : undefined,
    textExtra: (it.textExtra || []).map(function (x) { return x.userUniqueId ? { userUniqueId: x.userUniqueId } : { hashtagName: x.hashtagName }; })
  };
  location.href = APP + '#c=' + encodeURIComponent(location.origin + location.pathname + '\n"itemStruct":' + JSON.stringify(slim));
})();
