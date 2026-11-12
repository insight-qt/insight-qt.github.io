/* TikTok Insight · Khám nhanh 1 clip (bấm từ dấu trang trên Safari iPhone / máy tính)
   Đọc dữ liệu clip ngay trên trang TikTok đang mở (trình duyệt thật, có cookie) rồi mở trang kết quả. */
(async function () {
  var APP = 'https://insight-qt.github.io/';
  var vid = (location.pathname.match(/\/(?:video|photo)\/(\d+)/) || [])[1];
  if (!/tiktok\.com$/.test(location.hostname) || !vid) { alert('Mở một clip TikTok trên trình duyệt (link có /video/) rồi bấm lại.'); return; }
  // tìm khối dữ liệu của đúng clip/post ảnh (id + stats) ở bất kỳ chỗ nào trong JSON của trang
  function find(o, d) {
    if (!o || typeof o !== 'object' || d > 12) return null;
    if (String(o.id) === vid && (o.stats || o.statsV2) && o.author) return o;
    for (var k in o) { var r = find(o[k], d + 1); if (r) return r; }
    return null;
  }
  function fromHtml(html) {
    var re = /<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/g, m;
    while ((m = re.exec(html))) { try { var r = find(JSON.parse(m[1]), 0); if (r) return r; } catch (e) {} }
    return null;
  }
  function fromDoc() {
    var ss = document.querySelectorAll('script[type="application/json"]');
    for (var i = 0; i < ss.length; i++) { try { var r = find(JSON.parse(ss[i].textContent), 0); if (r) return r; } catch (e) {} }
    return null;
  }
  async function get(u) { try { return await fetch(u, { credentials: 'include' }).then(function (r) { return r.text(); }); } catch (e) { return ''; } }
  var user = (location.pathname.match(/\/@([^/]+)/) || [])[1] || '';
  var it = fromDoc();
  // TikTok là trang 1 lần tải: lướt sang clip khác thì dữ liệu trên trang vẫn là clip cũ → tải lại đúng clip.
  // Post ảnh: trang /photo/ thường không kèm số liệu → thử trang /video/ cùng id, rồi API chi tiết.
  if (!it) it = fromHtml(await get(location.origin + location.pathname));
  if (!it && user) it = fromHtml(await get(location.origin + '/@' + user + '/video/' + vid));
  if (!it) { try { var j = JSON.parse(await get(location.origin + '/api/item/detail/?aid=1988&itemId=' + vid)); it = j && j.itemInfo && j.itemInfo.itemStruct; if (it && String(it.id) !== vid) it = null; } catch (e) { it = null; } }
  if (!it) { alert('TikTok chưa trả số liệu post này. Tải lại trang rồi bấm lại. Post ảnh: thử mở link dạng /video/ thay cho /photo/.'); return; }
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
