(function () {
  /* TikTok Insight · nút ⚡ — chạy trên tab TikTok, đọc kênh rồi gửi dữ liệu về tab web.
     Địa chỉ trang web và tên miền TikTok được trang web điền vào khi tạo nút. */
  var APP = '%%APP%%', APPURL = '%%APPURL%%', HOST = new RegExp('%%HOST%%');
  if (!HOST.test(location.hostname)) { alert('TikTok Insight: mở trang kênh TikTok (tiktok.com/@tenkenh) rồi bấm lại nút ⚡.'); return; }
  if (window.__tti && window.__tti.running) { window.__tti.show(); return; }
  var S = window.__tti = { running: true, stop: false };
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var N = function (x) { return x == null || x === '' ? null : Number(x); };

  /* ---------- khung tiến độ trên trang TikTok ---------- */
  var box = document.createElement('div');
  box.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:2147483647;width:300px;background:#16151a;color:#f2f1f5;' +
    'font:13px/1.45 -apple-system,BlinkMacSystemFont,sans-serif;border-radius:14px;padding:14px 16px;box-shadow:0 10px 30px rgba(0,0,0,.35)';
  box.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><b>⚡ TikTok Insight</b>' +
    '<button id="tti-x" style="background:#2a2830;color:#f2f1f5;border:0;border-radius:8px;padding:4px 10px;cursor:pointer;font:inherit">Dừng</button></div>' +
    '<div id="tti-m" style="color:#c9c6d2">Đang chuẩn bị…</div>' +
    '<div style="height:5px;background:#2a2830;border-radius:9px;margin-top:10px;overflow:hidden"><i id="tti-b" style="display:block;height:100%;width:0;background:#9a74ff;transition:width .3s"></i></div>' +
    '<button id="tti-go" style="margin-top:12px;width:100%;background:#9a74ff;color:#120f1a;border:0;border-radius:9px;padding:8px 10px;cursor:pointer;font:inherit;font-weight:600">Mở trang TikTok Insight →</button>' +
    '<div id="tti-n" style="display:none;margin-top:8px;font-size:12px;color:#e8b54a"></div>';
  document.body.appendChild(box);
  var $m = box.querySelector('#tti-m'), $b = box.querySelector('#tti-b');
  box.querySelector('#tti-x').onclick = function () { S.stop = true; say('Đang dừng…'); };
  S.show = function () { box.style.display = 'block'; };
  function say(t, p) { $m.textContent = t; if (p != null) $b.style.width = Math.round(p * 100) + '%'; }
  function done(t) { S.running = false; say(t, 1); var b = box.querySelector('#tti-x'); b.textContent = 'Đóng'; b.onclick = function () { box.remove(); }; }

  /* ---------- kết nối với tab web ----------
     Mọi dữ liệu gửi đi đều được giữ lại trong tab này. Lỡ đóng tab TikTok Insight thì bấm nút trong khung:
     tool mở lại trang, kết nối lại và gửi bù toàn bộ, không mất clip nào. */
  var target = window.opener && !window.opener.closed ? window.opener : null;
  if (!target && window.__ttiWin && !window.__ttiWin.closed) target = window.__ttiWin;   // nút ⚡ đã mở sẵn lúc bấm
  if (!target) target = window.open(APPURL + '#from-tiktok', 'tikinsight');
  if (!target) { done('Trình duyệt chặn cửa sổ bật lên. Cho phép popup cho tiktok.com rồi bấm lại ⚡.'); return; }
  var acked = false, waiters = [], LOG = [], $n = box.querySelector('#tti-n');
  function lost() { return !target || target.closed; }
  function send(m) {
    if (m.type !== 'hello') LOG.push(m);
    if (lost()) { $n.style.display = 'block'; $n.textContent = 'Tab TikTok Insight đã đóng. Dữ liệu vẫn được giữ ở đây, bấm nút phía trên để mở lại và lưu.'; return; }
    try { target.postMessage(m, APP); } catch (e) {}
  }
  async function reconnect() {
    target = window.open(APPURL + '#from-tiktok', 'tikinsight');
    if (!target) { $n.style.display = 'block'; $n.textContent = 'Trình duyệt chặn cửa sổ bật lên. Cho phép popup cho tiktok.com rồi bấm lại.'; return; }
    acked = false;
    for (var t = 0; t < 40 && !acked; t++) { try { target.postMessage({ type: 'hello' }, APP); } catch (e) {} await sleep(500); }
    if (!acked) return;
    var copy = LOG.slice();
    for (var i = 0; i < copy.length; i++) { try { target.postMessage(copy[i], APP); } catch (e) {} if (i % 10 === 9) await sleep(50); }
    $n.style.display = 'block'; $n.style.color = '#4cc38a'; $n.textContent = 'Đã mở lại và gửi bù ' + copy.length + ' mục. Không mất dữ liệu.';
  }
  // Luôn mở (hoặc chuyển sang) tab tên 'tikinsight', kết nối lại rồi gửi bù: dù tab cũ còn hay mất, tab mở ra đều đủ dữ liệu.
  box.querySelector('#tti-go').onclick = function () { reconnect(); };
  window.addEventListener('message', function (e) {
    if (e.origin !== APP || !e.data) return;
    if (e.data.type === 'ack') { acked = true; S.from = +e.data.from || 0; }
    waiters.slice().forEach(function (w) { if (w.type === e.data.type) { waiters.splice(waiters.indexOf(w), 1); w.res(e.data); } });
  });
  function waitFor(type, ms) { return new Promise(function (res) { waiters.push({ type: type, res: res }); setTimeout(function () { res(null); }, ms); }); }

  /* ---------- bắt số liệu mà chính trang kênh TikTok tải về khi cuộn (không tốn thêm request) ---------- */
  var CAP = {};
  function grab(j) { (j && j.itemList || []).forEach(function (it) { if (it && it.id) CAP[String(it.id)] = it; }); }
  function hook(w) {
    try {
      if (!w || w.__ttiHooked || !w.fetch) return; w.__ttiHooked = 1;
      var of = w.fetch;
      w.fetch = function () {
        var a = arguments, p = of.apply(this, a);
        try { var u = String(a[0] && a[0].url || a[0]); if (/\/api\/post\/item_list/.test(u)) p.then(function (r) { r.clone().json().then(grab).catch(function () {}); }); } catch (e) {}
        return p;
      };
      var XO = w.XMLHttpRequest && w.XMLHttpRequest.prototype; if (!XO) return;
      var oo = XO.open, os = XO.send;
      XO.open = function (m, u) { this.__ttiU = u; return oo.apply(this, arguments); };
      XO.send = function () { var x = this; if (/\/api\/post\/item_list/.test(String(x.__ttiU))) x.addEventListener('load', function () { try { grab(JSON.parse(x.responseText)); } catch (e) {} }); return os.apply(this, arguments); };
    } catch (e) {}
  }

  /* ---------- đọc 1 clip bằng fetch (không mở trang, không phát video) ---------- */
  var O = { pages: 4, repTop: 8, repMax: 10 };   // chế độ Kỹ / Toàn bộ   // 200 comment + 8 chuỗi reply mỗi clip: đủ thấy quy luật, nhanh gấp 2–3 lần
  function pick(txt) {
    var s = (JSON.parse(txt).__DEFAULT_SCOPE__ || {})['webapp.video-detail'] || {};
    return { it: s.itemInfo && s.itemInfo.itemStruct, code: s.statusCode };
  }
  async function collect(url) {
    var path = new URL(url, location.origin).pathname, wantId = (path.match(/\/(?:video|photo)\/(\d+)/) || [])[1];
    var it = CAP[wantId] || null, code, why = '';
    if (!it && location.pathname === path) { try { var p0 = pick(document.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__').textContent); it = p0.it; } catch (e) {} }
    for (var k = 0; k < 2 && !(it && String(it.id) === wantId); k++) {
      try {
        var r = await fetch(location.origin + path, { credentials: 'include' });
        if (r.status === 403 || r.status === 429) return { blocked: true };
        var html = await r.text();
        var m = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
        if (m) { var p1 = pick(m[1]); it = p1.it; code = p1.code; } else why = 'trang trả ' + Math.round(html.length / 1000) + 'KB';
      } catch (e) { why = String(e); }
      if (!it) await sleep(2000);
    }
    if (!it) return { error: 'Không đọc được clip' + (code ? ' (mã ' + code + ')' : why ? ' (' + why + ')' : '') };
    var id = String(it.id || wantId), comments = [], cursor = 0;
    for (var pg = 0; pg < O.pages; pg++) {
      var d = await fetch(location.origin + '/api/comment/list/?aid=1988&aweme_id=' + id + '&count=50&cursor=' + cursor, { credentials: 'include' })
        .then(function (x) { return x.json(); }).catch(function () { return {}; });
      (d.comments || []).forEach(function (c) { var t = (c.text || '').replace(/\n/g, ' ').trim(); if (t) comments.push({ cid: c.cid, text: t, likes: c.digg_count || 0, replies: c.reply_comment_total || 0, by: (c.user && c.user.unique_id) || '', biz: !!(c.user && c.user.enterprise_verify_reason) }); });
      if (!d.has_more) break; cursor = d.cursor || cursor + 50; await sleep(200);
    }
    var authorId = it.author && it.author.id;
    var withRep = comments.filter(function (c) { return c.replies > 0 && c.cid; }).sort(function (a, b) { return b.likes - a.likes; }).slice(0, O.repTop);
    for (var i = 0; i < withRep.length; i++) {
      var c = withRep[i];
      var rr = await fetch(location.origin + '/api/comment/list/reply/?aid=1988&item_id=' + id + '&comment_id=' + c.cid + '&count=' + O.repMax + '&cursor=0', { credentials: 'include' })
        .then(function (x) { return x.json(); }).catch(function () { return {}; });
      c.reply_list = (rr.comments || []).map(function (x) {
        return { text: (x.text || '').replace(/\n/g, ' ').trim(), likes: x.digg_count || 0, by_creator: !!(x.user && authorId && String(x.user.uid) === String(authorId)), by: (x.user && x.user.unique_id) || '', biz: !!(x.user && x.user.enterprise_verify_reason) };
      }).filter(function (x) { return x.text; }).sort(function (a, b) { return b.likes - a.likes; });
      await sleep(100);
    }
    var st = it.statsV2 || it.stats || {}, vtt = '', subs = (it.video && it.video.subtitleInfos) || [];
    var sub = subs.filter(function (x) { return /^vi/i.test(x.LanguageCodeName || ''); })[0] || subs[0];
    if (sub && sub.Url) { try { vtt = await fetch(sub.Url).then(function (x) { return x.text(); }); } catch (e) {} }
    return toRec(it, comments, vtt);
  }
  /* bản ghi 1 clip từ dữ liệu TikTok (itemStruct) */
  function toRec(it, comments, vtt) {
    var st = it.statsV2 || it.stats || {}, id = String(it.id);
    var paid = []; if (it.isAd) paid.push('isAd');
    Object.keys(it).forEach(function (k2) { var v = it[k2]; if (/brand|commerc|paid|partner|sponsor|promot/i.test(k2) && v && !(Array.isArray(v) && !v.length) && !(typeof v === 'object' && !Array.isArray(v) && !Object.keys(v).length)) paid.push(k2); });
    var anchors = (it.anchors || []).map(function (a) { try { return JSON.parse(a.logExtra || '{}').anchor_type || ''; } catch (e) { return ''; } }).filter(Boolean);
    var au = (it.author && it.author.uniqueId) || '';
    return {
      id: id, url: 'https://www.tiktok.com/@' + au + '/' + (it.imagePost ? 'photo' : 'video') + '/' + id, channel: au, createTime: N(it.createTime),
      views: N(st.playCount), likes: N(st.diggCount), comments_count: N(st.commentCount), shares: N(st.shareCount), saves: N(st.collectCount),
      duration: N(it.video && it.video.duration), caption: it.desc || '', vtt: vtt || '', comments: comments || [],
      hashtags: (it.textExtra || []).map(function (x) { return x.hashtagName; }).filter(Boolean),
      mentions: (it.textExtra || []).map(function (x) { return x.userUniqueId; }).filter(Boolean),
      labels: (it.diversificationLabels || []).filter(function (x) { return typeof x === 'string'; }),
      kw: (it.suggestedWords || []).map(function (x) { return typeof x === 'string' ? x : (x && (x.word || x.text)) || ''; }).filter(Boolean).slice(0, 10),
      loc: it.locationCreated || '',
      music: (it.music && it.music.title) || '', original_sound: !!(it.music && it.music.original), is_photo: !!it.imagePost, pinned: !!it.isPinnedItem,
      paid_flags: paid, shop: anchors.some(function (t) { return /SHOP|COMMERCE|ECOM|PRODUCT|AFFILIATE|SHOWCASE/i.test(t); }) || !!(it.products && it.products.length) || +it.isECVideo === 1,
    };
  }

  /* ---------- đọc danh sách clip của kênh trên trang hiện tại ---------- */
  function metaFromScope(sc) {
    var u = sc && sc['webapp.user-detail'];
    if (u && u.userInfo && u.userInfo.user && u.userInfo.user.uniqueId) {
      var i = u.userInfo, us = i.user, s0 = i.statsV2 || i.stats || {};
      return { handle: us.uniqueId, nickname: us.nickname, bio: us.signature, verified: !!us.verified, private: !!us.privateAccount,
        followers: +s0.followerCount || 0, hearts: +(s0.heartCount || s0.heart) || 0, videos: +s0.videoCount || 0, link: (us.bioLink && us.bioLink.link) || '' };
    }
    var it = sc && sc['webapp.video-detail'] && sc['webapp.video-detail'].itemInfo && sc['webapp.video-detail'].itemInfo.itemStruct;
    if (it && it.author && it.author.uniqueId) {
      var a = it.author, st = it.authorStatsV2 || it.authorStats || {};
      return { handle: a.uniqueId, nickname: a.nickname, bio: a.signature, verified: !!a.verified, private: !!a.privateAccount,
        followers: +st.followerCount || 0, hearts: +(st.heartCount || st.heart) || 0, videos: +st.videoCount || 0, link: '' };
    }
    return null;
  }
  async function fetchMeta(path) {
    try {
      var html = await fetch(path, { credentials: 'include' }).then(function (r) { return r.text(); });
      var m = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
      return m ? metaFromScope(JSON.parse(m[1]).__DEFAULT_SCOPE__) : null;
    } catch (e) { return null; }
  }
  function userMeta(D) {
    D = D || document;
    try {
      var u = JSON.parse(D.getElementById('__UNIVERSAL_DATA_FOR_REHYDRATION__').textContent).__DEFAULT_SCOPE__['webapp.user-detail'];
      var i = u.userInfo || {}, us = i.user || {}, s = i.statsV2 || i.stats || {};
      return { handle: us.uniqueId, nickname: us.nickname, bio: us.signature, verified: !!us.verified, private: !!us.privateAccount,
        followers: +s.followerCount || 0, hearts: +(s.heartCount || s.heart) || 0, videos: +s.videoCount || 0, link: (us.bioLink && us.bioLink.link) || '' };
    } catch (e) { return null; }
  }
  function idTs(u) { try { var id = String(u).replace(/\/$/, '').split('/').pop(); var t = Number(BigInt(id) >> BigInt(32)); return t > 14e8 && t < 22e8 ? t : 0; } catch (e) { return 0; } }
  function gridLinks(h, D) {
    var out = [], seen = {};
    (D || document).querySelectorAll('a[href*="/video/"],a[href*="/photo/"]').forEach(function (a) {
      var u = a.href.split('?')[0];
      if (u.toLowerCase().indexOf('/@' + h + '/') < 0 || seen[u]) return; seen[u] = 1;
      var v = a.querySelector('[data-e2e="video-views"]'); out.push({ url: u, views: v ? v.innerText : '' });
    });
    return out;
  }
  async function listChannel(meta, D, W) {
    D = D || document; W = W || window;
    var h = (meta.handle || '').toLowerCase(), last = -1, stable = 0, refresh = 0, links = [];
    for (var k = 0; k < Math.max(60, meta.videos / 3 + 60); k++) {
      if (S.stop) break;
      links = gridLinks(h, D);
      var t = D.body.innerText.slice(0, 6000);
      if (!links.length && /Something went wrong|Đã xảy ra lỗi|Có lỗi xảy ra/i.test(t)) {
        if (++refresh > 4) return { blocked: true, links: [] };
        var b = [].slice.call(D.querySelectorAll('button')).filter(function (x) { return /^(Refresh|Làm mới|Thử lại|Tải lại)$/i.test(x.innerText.trim()); })[0];
        if (b) b.click(); say('TikTok báo lỗi danh sách clip, đang thử lại…'); await sleep(3500); continue;
      }
      if (meta.videos && links.length >= meta.videos) break;
      // có chọn khoảng ngày: lưới xếp mới → cũ, khi 6 clip cuối đều cũ hơn mốc bắt đầu thì thôi cuộn (clip ghim nằm đầu nên không ảnh hưởng)
      if (S.from && links.length >= 6 && links.slice(-6).every(function (l) { var t = idTs(l.url); return t && t < S.from; })) { S.reachedFrom = true; break; }
      stable = links.length === last ? stable + 1 : 0; last = links.length;
      if ((stable >= 8 && links.length) || stable >= 12) break;
      var oldest = links.length ? idTs(links[links.length - 1].url) : 0;
      say('Đang đọc danh sách clip: ' + links.length + '/' + (meta.videos || '?') + (S.from && oldest ? ' · đã tới ' + new Date(oldest * 1000).toLocaleDateString('vi-VN') : ''), meta.videos ? links.length / meta.videos * 0.15 : 0);
      W.scrollTo(0, D.body.scrollHeight); await sleep(1300);
    }
    return { links: links, blocked: !links.length && meta.videos > 0 };
  }

  /* ---------- chạy ---------- */
  (async function () {
    say('Đang kết nối với trang TikTok Insight…');
    for (var t = 0; t < 40 && !acked; t++) { send({ type: 'hello' }); await sleep(500); }
    if (!acked) { done('Không kết nối được trang TikTok Insight. Mở trang web của tool rồi bấm lại ⚡.'); return; }
    var isVideo = /\/(video|photo)\/\d+/.test(location.pathname);
    var meta = userMeta(), D = document, W = window, frame = null;
    // Đang xem một clip → mở ngầm trang kênh của người đăng trong khung ẩn rồi quét cả kênh
    var owner = (location.pathname.match(/^\/@([^/?#]+)/) || [])[1];
    var hookIv = null;
    if (owner) {
      say('Đang mở ngầm kênh @' + decodeURIComponent(owner) + ' để đọc số liệu…');
      frame = document.createElement('iframe');
      frame.src = '/@' + owner;
      frame.style.cssText = 'position:fixed;left:-3000px;top:0;width:1200px;height:900px;opacity:0;pointer-events:none;border:0';
      document.body.appendChild(frame);
      hookIv = setInterval(function () { try { var fw = frame && frame.contentWindow; if (fw && /^\/@/.test(fw.location.pathname)) hook(fw); } catch (e) {} }, 5);
      await new Promise(function (r) { frame.onload = r; setTimeout(r, 20000); });
      try { D = frame.contentDocument; W = frame.contentWindow; } catch (e) { D = null; }
      if (!D) { clearInterval(hookIv); frame.remove(); frame = null; D = document; W = window; hook(window); meta = userMeta(); }
      // Thông tin kênh: Safari hay trả khung trống chưa có dữ liệu → thử lần lượt nhiều nguồn
      for (var w = 0; w < 6 && frame && !meta; w++) { meta = userMeta(D); if (!meta) await sleep(700); }
      if (!meta) meta = await fetchMeta('/@' + owner);
      if (!meta) meta = await fetchMeta(location.pathname);
      if (!meta) meta = { handle: decodeURIComponent(owner), nickname: '', bio: '', followers: 0, hearts: 0, videos: 0, link: '' };
      // chờ lưới clip trong khung ẩn hiện ra (Safari dựng chậm)
      if (frame) for (var g = 0; g < 20 && !gridLinks(meta.handle.toLowerCase(), D).length; g++) await sleep(700);
    }
    if (!isVideo && !meta) { done('Hãy mở trang kênh (tiktok.com/@tenkenh) hoặc một clip rồi bấm ⚡.'); return; }
    var urls = [];
    if (isVideo && !frame) {
      // trình duyệt không cho mở trang kênh ẩn → không đoán bừa, chỉ đường cho người dùng
      var go = box.querySelector('#tti-go'); go.textContent = 'Mở trang kênh @' + (meta ? meta.handle : decodeURIComponent(owner || '')) + ' →';
      go.onclick = function () { location.href = '/@' + (meta ? meta.handle : owner); };
      done('Trình duyệt này không cho đọc kênh từ trang clip. Bấm nút bên dưới để mở trang kênh, rồi bấm ⚡ lần nữa.'); return;
    } else {
      if (meta.private) { if (frame) frame.remove(); done('Kênh để riêng tư, không đọc được.'); return; }
      var L = await listChannel(meta, D, W);
      var wasFrame = !!frame;
      if (hookIv) clearInterval(hookIv);
      if (frame) { frame.remove(); frame = null; }
      if (wasFrame && !L.links.length && !L.blocked && !Object.keys(CAP).length) {
        var go2 = box.querySelector('#tti-go'); go2.textContent = 'Mở trang kênh @' + meta.handle + ' →';
        go2.onclick = function () { location.href = '/@' + meta.handle; };
        done('Không đọc được danh sách clip từ trang này. Bấm nút bên dưới để mở trang kênh, rồi bấm ⚡ lần nữa.'); return;
      }
      if (L.blocked) {
        send({ type: 'channel', meta: meta, links: [], blocked: true });
        done('TikTok không cho xem danh sách clip khi chưa đăng nhập. Đăng nhập TikTok trên trình duyệt này rồi tải lại trang kênh và bấm ⚡.'); return;
      }
      var items = Object.keys(CAP).map(function (k) { return toRec(CAP[k]); });
      send({ type: 'channel', meta: meta, links: L.links, items: items });
      say((S.reachedFrom ? 'Đã đọc tới mốc ngày đã chọn. ' : 'Có ' + Math.max(L.links.length, items.length) + ' clip' + (items.length ? ', đủ số liệu ' + items.length + ' clip' : '') + '. ') + 'Đang chọn clip để đọc comment…', 0.15);
      var plan = await waitFor('plan', 15000);
      urls = (plan && plan.urls) || [];
      if (plan && plan.mode === 'fast') O = { pages: 2, repTop: 5, repMax: 10 };   // chế độ Nhanh: 100 comment + 5 chuỗi reply mỗi clip
      if (!urls.length) { send({ type: 'finished' }); done(S.from ? 'Xong: các clip trong khoảng ngày đã chọn đều đã được soi sâu.' : 'Xong: đã cập nhật view + ngày đăng của ' + L.links.length + ' clip.'); return; }
    }
    /* soi sâu song song, tự giảm tốc khi TikTok từ chối */
    var i = 0, n = 0, K = 3, pause = 500, blocks = 0, slow = false, t0 = Date.now();
    function eta() { if (n < 2) return 0; return Math.round((Date.now() - t0) / n * (urls.length - n) / 1000); }
    function etaTxt(sec) { return !sec ? '' : sec < 60 ? ' · còn chưa tới 1 phút' : ' · còn khoảng ' + Math.round(sec / 60) + ' phút'; }
    async function worker(wid) {
      while (i < urls.length && !S.stop) {
        if (slow && wid > 0) return;  // đã giảm tốc → chỉ giữ 1 luồng
        var u = urls[i++], r;
        try { r = await collect(u); } catch (e) { r = { error: String(e && e.message || e) }; }
        if (r.blocked) {
          blocks++; i--; urls.push(urls.splice(i, 1)[0]);   // đưa clip này về cuối hàng, thử lại sau
          if (blocks > 6) { S.stop = true; S.blockedOut = true; break; }
          slow = true; pause = 4000; say('TikTok từ chối vì đọc nhanh quá, giảm tốc và thử lại…');
          await sleep(15000); continue;
        }
        n++;
        send(r.error ? { type: 'error', url: u, error: r.error, of: urls.length, eta: eta() } : { type: 'video', data: r, of: urls.length, eta: eta() });
        say('Đang đọc comment ' + n + '/' + urls.length + ' clip' + etaTxt(eta()), 0.15 + 0.85 * n / urls.length);
        await sleep(pause + Math.random() * 900);
      }
    }
    var ws = []; for (var w = 0; w < K; w++) ws.push(worker(w)); await Promise.all(ws);
    send({ type: 'finished', stopped: S.stop, blocked: !!S.blockedOut });
    done(S.blockedOut ? 'TikTok tạm từ chối (đọc nhiều quá). Dữ liệu đã lấy vẫn dùng được, thử lại sau ít phút.'
      : S.stop ? 'Đã dừng. Dữ liệu đã lấy được đã lưu ở tab TikTok Insight.' : 'Xong ' + n + ' clip. Quay lại tab TikTok Insight để xem.');
  })();
})();
