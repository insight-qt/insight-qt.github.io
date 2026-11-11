/* TikTok Insight · phân tích kênh (chạy hoàn toàn trong trình duyệt) */
(function (G) {
  const NEW_DAYS = 7;
  const WEEKDAY = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
  const HOURS = [[0, 6, "0–6h"], [6, 11, "6–11h"], [11, 14, "11–14h"], [14, 18, "14–18h"], [18, 22, "18–22h"], [22, 24, "22–24h"]];
  const DURS = [[0, 16, "<15s"], [16, 31, "15–30s"], [31, 61, "30–60s"], [61, 181, "1–3 phút"], [181, 1e9, ">3 phút"]];
  const PAID_TAG = /#(ad|ads|advert|sponsored|sponsor|quangcao|qc|hoptac|hợptác|collab|partner|brandpartner|paidpartnership|taitro|tàitrợ|booking)\b/i;
  // comment cho thấy người xem nhận ra quảng cáo
  const AD_TALK = /qu[ảa]ng c[áa]o|\bqc\b|\bads?\b|t[àa]i tr[ợo]|sponsor|booking|nh[ậa]n bao nhi[êe]u|bao nhi[êe]u (ti[ềe]n|c[áa]t)|\bpr\b|seeding|đ[ưu][ợo]c tr[ảa] ti[ềe]n|clip (qc|pr)|l[ạa]i (qc|pr|qu[ảa]ng)/i;
  // caption kiểu bán hàng / kêu gọi mua
  const SALE_CTA = /gi[ảa]m gi[áa]|m[ãa] gi[ảa]m|voucher|link (ở |o )?bio|mua ngay|đ[ặa]t h[àa]ng|[ưu]u đ[ãa]i|khuy[ếe]n m[ãa]i|freeship|flash ?sale|deal\b|săn sale|t[ảa]i app|đăng k[ýy] ngay/i;
  const DEEP = { fast: { top: 12, bottom: 12, newest: 8, spread: 8 }, smart: { top: 25, bottom: 25, newest: 15, spread: 20 } };

  const median = xs => { if (!xs.length) return null; const a = [...xs].sort((x, y) => x - y), m = a.length >> 1; return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2; };
  // 0,12 → "1/8", 0,4 → "40%": dễ hình dung hơn phần trăm nhỏ
  const frac = r => r > 0 && r < 0.34 ? "1/" + Math.round(1 / r) : Math.round(r * 100) + "%";
  const ratio = (a, b) => (typeof a === "number" && b ? a / b : null);
  const wkIdx = d => (d.getDay() + 6) % 7; // Thứ 2 = 0

  function kNum(t) {
    t = String(t || "").trim().replace(/\s/g, "");
    const m = t.match(/^([\d.,]+)([KkMmBbNnTt]r?)?/);
    if (!m) return null;
    if (m[2]) {
      const u = m[2].toLowerCase(), n = parseFloat(m[1].replace(",", "."));
      return Math.round(n * (u === "k" || u === "n" ? 1e3 : u === "m" || u === "tr" ? 1e6 : 1e9));
    }
    return parseInt(m[1].replace(/[.,]/g, ""), 10) || 0;
  }
  // ID clip TikTok chứa thời điểm đăng ở 32 bit đầu
  function idTs(id) { try { const t = Number(BigInt(id) >> 32n); return t > 14e8 && t < 22e8 ? t : null; } catch (e) { return null; } }

  function cleanVtt(text) {
    const out = [], seen = new Set();
    for (const raw of String(text || "").split(/\r?\n/)) {
      let s = raw.trim();
      if (!s || /^(WEBVTT|NOTE|Kind:|Language:)/.test(s) || s.includes("-->") || /^\d+$/.test(s)) continue;
      s = s.replace(/<[^>]+>/g, "").trim();
      if (s && !seen.has(s)) { seen.add(s); out.push(s); }
    }
    return out.join(" ");
  }

  function videoFrom(d) {
    const cm = (d.comments || []).filter(c => (c.text || "").trim()).sort((a, b) => (b.likes || 0) - (a.likes || 0));
    return {
      id: String(d.id), url: d.url, channel: d.channel, ts: d.createTime || idTs(d.id),
      views: d.views, likes: d.likes, comments_count: d.comments_count, shares: d.shares, saves: d.saves, duration: d.duration,
      caption: (d.caption || "").trim(), hashtags: d.hashtags || [], music: d.music || "", original_sound: !!d.original_sound,
      is_photo: !!d.is_photo, pinned: !!d.pinned, pinned_api: !!d.pinned, paid_flags: d.paid_flags || [], shop: !!d.shop, mentions: d.mentions || [],
      labels: d.labels || [], kw: d.kw || [], loc: d.loc || "",
      transcript: cleanVtt(d.vtt),
      comments: cm.map(c => ({ text: c.text.trim(), likes: c.likes || 0, replies: c.replies || 0, by: c.by || "", biz: !!c.biz,
        reply_list: (c.reply_list || []).filter(r => (r.text || "").trim()).map(r => ({ text: r.text, likes: r.likes || 0, by_creator: !!r.by_creator, by: r.by || "", biz: !!r.biz })) })),
      scanned: new Date().toISOString(),
    };
  }

  /* Số liệu đầy đủ của từng clip bắt được khi cuộn trang kênh (chưa có comment / phụ đề) → bản ghi "thin" */
  function mergeItems(vids, recs) {
    for (const rec of recs || []) {
      const v = videoFrom(rec), old = vids[v.id];
      if (old && !old.lite && !old.thin) {           // đã soi sâu: chỉ cập nhật số liệu, giữ comment + phụ đề
        for (const k of ["views", "likes", "comments_count", "shares", "saves", "labels", "kw", "paid_flags", "shop", "pinned_api", "mentions"]) old[k] = v[k];
        old.pinned = !!(v.pinned || old.pinned); old.stale = false; snap(old, v.views);
      } else {
        vids[v.id] = snap({ ...v, thin: true, lite: false, hist: (old && old.hist) || [], pinned: !!(v.pinned || (old && old.pinned)) }, v.views);
      }
    }
    return vids;
  }

  /* Lịch sử view qua các lần quét: [[giây, view], …]. Cùng ngày thì ghi đè. */
  function snap(v, views, at) {
    if (typeof views !== "number") return v;
    at = at || Math.floor(Date.now() / 1000);
    const h = (v.hist || []).filter(x => Array.isArray(x));
    if (h.length && at - h[h.length - 1][0] < 12 * 3600) h[h.length - 1] = [at, Math.max(views, h[h.length - 1][1])]; else h.push([at, views]);
    v.hist = h.slice(-30); return v;
  }
  /* Clip bạn tự xác nhận: marks = {id: "paid" | "organic"} */
  function applyMarks(vids, marks) {
    if (!marks || !Object.keys(marks).length) return vids;
    const out = {};
    for (const k in vids) out[k] = marks[k] ? { ...vids[k], mark: marks[k] } : vids[k];
    return out;
  }
  const idOf = u => (String(u).match(/\/(?:video|photo)\/(\d+)/) || String(u).match(/^(\d{15,})$/) || [])[1] || null;

  /* Gộp danh sách clip đọc từ trang kênh (chỉ view + ngày) vào dữ liệu đang có */
  function mergeLinks(vids, links, handle) {
    const ids = links.map(l => l.url.replace(/\/$/, "").split("/").pop());
    const after = ids.slice(3, 12).map(idTs).filter(Boolean), ref = after.length ? Math.min(...after) : 0;
    const pinned = new Set(ids.slice(0, 3).filter(id => ref && idTs(id) && idTs(id) < ref - 14 * 86400));
    for (const id of ids) if (vids[id]) vids[id].pinned = pinned.has(id) || (!vids[id].lite && vids[id].pinned_api) || false;
    for (const l of links) {
      const id = l.url.replace(/\/$/, "").split("/").pop();
      const gv = kNum(l.views);
      if (vids[id] && !vids[id].lite) {
        if (gv != null) {
          const v = vids[id]; v.views_grid = gv; snap(v, gv);
          // view trên lưới lệch >10% so với lần soi sâu → số liệu cũ, cần soi lại (lưới làm tròn kiểu 12,3K nên chừa sai số)
          if (gv >= 1000 && v.views && Math.abs(gv / v.views - 1) > 0.1) { v.stale = true; v.views = gv; }
        }
        continue;
      }
      vids[id] = snap({ ...(vids[id] || {}), id, url: l.url, channel: handle, ts: idTs(id), views: gv, lite: true, comments: [], hashtags: [], pinned: pinned.has(id) }, gv);
    }
    return vids;
  }


  /* Khoảng ngày: {preset:"all"|"30"|"90"|"180"|"365"|"custom", from:"YYYY-MM-DD", to:"YYYY-MM-DD"} → giây */
  const RANGE_NAMES = { all: "Toàn kênh", "30": "30 ngày qua", "90": "3 tháng qua", "180": "6 tháng qua", "365": "1 năm qua" };
  function rangeBounds(r) {
    if (!r || !r.preset || r.preset === "all") return null;
    if (r.preset === "custom") {
      const f = r.from ? Date.parse(r.from + "T00:00:00") / 1000 : 0, t = r.to ? Date.parse(r.to + "T23:59:59") / 1000 : Infinity;
      return (f || t !== Infinity) ? { from: f, to: t } : null;
    }
    return { from: Math.floor(Date.now() / 1000) - Number(r.preset) * 86400, to: Infinity };
  }
  function rangeLabel(r) {
    const b = rangeBounds(r); if (!b) return RANGE_NAMES.all;
    if (r.preset !== "custom") return RANGE_NAMES[r.preset];
    return (b.from ? date_(b.from) : "đầu kênh") + " → " + (b.to !== Infinity ? date_(b.to) : "nay");
  }
  function filterRange(vids, r) {
    const b = rangeBounds(r); if (!b) return vids;
    const out = {};
    for (const k in vids) { const v = vids[k], t = v.ts || idTs(v.id); if (t && t >= b.from && t <= b.to) out[k] = v; }
    return out;
  }

  /* Chọn clip soi sâu: top view, bottom view, mới nhất, rải đều ở giữa. mode "all" = tất cả */
  function plan(vids, mode, range) {
    const DEEP_SMART = DEEP[mode] || DEEP.fast;
    const all = Object.values(filterRange(vids, range)).filter(v => v.url);
    const stale = all.filter(v => v.stale && !v.lite && !v.thin).map(v => v.url);
    if (mode === "all") return stale.concat(all.filter(v => v.lite || v.thin).map(v => v.url));
    const withv = all.filter(v => typeof v.views === "number").sort((a, b) => b.views - a.views);
    const newest = [...all].sort((a, b) => (b.ts || 0) - (a.ts || 0));
    const pick = [], seen = new Set();
    const add = (vs, n) => { for (const v of vs) { if (n <= 0) break; if (seen.has(v.id)) continue; seen.add(v.id); n--; if (v.lite || v.thin) pick.push(v.url); } };
    add(withv.slice(0, DEEP_SMART.top), DEEP_SMART.top);
    add([...withv].reverse().slice(0, DEEP_SMART.bottom), DEEP_SMART.bottom);
    add(newest, DEEP_SMART.newest);
    const mid = withv.slice(DEEP_SMART.top, Math.max(DEEP_SMART.top, withv.length - DEEP_SMART.bottom));
    const step = Math.max(1, Math.floor(mid.length / DEEP_SMART.spread));
    add(mid.filter((_, i) => i % step === 0), DEEP_SMART.spread);
    if (!withv.length) add(newest, DEEP_SMART.top + DEEP_SMART.bottom + DEEP_SMART.newest + DEEP_SMART.spread);
    return stale.concat(pick.filter(u => !stale.includes(u)));
  }

  /* Mốc share/view tham khảo theo cỡ kênh (ttcalculator.net, ~1,4 triệu clip 11/2025–01/2026, nguồn bên thứ ba) */
  function shareBench(f) {
    if (!f) return { tier: "trung bình TikTok", rate: 0.0041 };
    const t = [[1e4, "kênh dưới 10K follower", 0.0072], [5e4, "kênh 10K–50K", 0.0051], [2e5, "kênh 50K–200K", 0.0038], [1e6, "kênh 200K–1M", 0.0031], [Infinity, "kênh trên 1M", 0.0025]];
    const x = t.find(r => f < r[0]); return { tier: x[1], rate: x[2] };
  }

  function analyze(vids, followers) {
    const rows = Object.values(vids).filter(v => typeof v.views === "number").map(v => ({ ...v }))
      .sort((a, b) => (b.ts || 0) - (a.ts || 0));
    if (!rows.length) return { rows: [], summary: {}, tables: {} };
    const now = Date.now() / 1000;
    for (const v of rows) {
      if (v.lite) { v.er = v.share_r = v.save_r = v.cmt_r = null; }
      else {
        const eng = ["likes", "comments_count", "shares", "saves"].reduce((a, k) => a + (v[k] || 0), 0);
        v.er = ratio(eng, v.views); v.share_r = ratio(v.shares || 0, v.views); v.save_r = ratio(v.saves || 0, v.views); v.cmt_r = ratio(v.comments_count || 0, v.views);
      }
      const words = (v.transcript || "").split(/\s+/).filter(Boolean);
      v.wpm = v.duration && words.length ? Math.round(words.length / v.duration * 60) : null;
      v.hook = words.slice(0, 22).join(" ") || (v.caption || "").slice(0, 90);
      const tags = (v.hashtags || []).map(h => "#" + h.toLowerCase()).join(" ") + " " + (v.caption || "").toLowerCase();
      // Chỉ tin dấu hiệu công bố rõ ràng. Cờ isAd của TikTok KHÔNG dùng: clip organic viral vẫn có thể mang cờ này
      // (nhiều khả năng chỉ là "cho phép dùng làm quảng cáo"), không có nghĩa là đã chạy ads.
      // Cờ isAd: theo các bên thu thập dữ liệu TikTok, nghĩa là clip từng được chạy quảng cáo trả phí (Spark Ads / Quảng bá).
      // TikTok không công bố tài liệu nên tool coi là dấu hiệu rất mạnh của NGHI ADS, không coi là creator tự khai.
      v.is_ad_flag = (v.paid_flags || []).includes("isAd");
      v.paid_flags = (v.paid_flags || []).filter(f => f !== "isAd");
      v.self_declared = !!(v.paid_flags.length || PAID_TAG.test(tags));
      v.declared = v.mark === "paid" || (v.mark !== "organic" && v.self_declared);
      v.isNew = !!(v.ts && now - v.ts < NEW_DAYS * 86400);
    }
    const medAll = median(rows.map(v => v.views)) || 1;
    const medErAll = median(rows.filter(v => v.er != null).map(v => v.er)) || 0;
    const medCmtAll = median(rows.filter(v => v.cmt_r != null).map(v => v.cmt_r)) || 0;
    const medShareAll = median(rows.filter(v => v.share_r != null).map(v => v.share_r)) || 0;
    const me = String((rows.find(v => v.channel) || {}).channel || "").toLowerCase();
    for (const v of rows) {
      const sig = [];   // [điểm, lý do]
      const age = v.ts ? (now - v.ts) / 86400 : null;
      // 1. View vẫn tăng đều khi clip đã cũ (clip organic thường chững sau 1–2 tuần)
      const h = (v.hist || []).filter(x => Array.isArray(x) && typeof x[1] === "number").sort((a, b) => a[0] - b[0]);
      if (h.length >= 2 && v.ts) {
        const a = h.find(x => (x[0] - v.ts) / 86400 >= 14), b = h[h.length - 1];
        if (a && b !== a) {
          const days = (b[0] - a[0]) / 86400, gain = b[1] - a[1], g = a[1] ? gain / a[1] : 0;
          v.growth = { days: Math.round(days), pct: g, gain, ageAt: Math.round((a[0] - v.ts) / 86400) };
          if (days >= 2 && g >= 0.1 && g / days * 7 >= 0.15 && gain >= 0.5 * medAll)
            sig.push([2, `view vẫn tăng ${Math.round(g * 100)}% (+${Math.round(gain).toLocaleString("vi-VN")}) trong ${Math.round(days)} ngày dù clip đã đăng ${v.growth.ageAt} ngày`]);
        }
      }
      // Kiểm trên kênh thật: isAd bật cả ở clip vài nghìn view, nhất là clip gắn TikTok Shop → nghĩa là clip được đưa vào
      // quảng cáo (thường là quảng cáo tự động cho clip bán hàng), không cho biết bao nhiêu view đến từ ads. Cần thêm dấu hiệu khác.
      if (v.is_ad_flag) sig.push([1.5, "TikTok đánh dấu clip này đã được đưa vào quảng cáo (chưa rõ chạy nhiều hay ít)"]);
      if (!v.lite) {
        // 2. Tài khoản doanh nghiệp / tài khoản được tag vào comment
        const ment = new Set((v.mentions || []).map(x => String(x).toLowerCase()).filter(x => x && x !== me));
        const all = (v.comments || []).flatMap(c => [c, ...(c.reply_list || [])]);
        const bizBy = [...new Set(all.filter(c => c.by && c.by.toLowerCase() !== me && (c.biz || ment.has(c.by.toLowerCase()))).map(c => "@" + c.by))];
        if (bizBy.length) sig.push([1.5, `tài khoản doanh nghiệp hoặc được tag (${bizBy.slice(0, 3).join(", ")}) vào comment`]);
        // 3. Người xem nhắc tới quảng cáo
        const talk = (v.comments || []).filter(c => AD_TALK.test(c.text)).length;
        if (talk >= 2) sig.push([talk >= 4 ? 1.5 : 1, `${talk} comment nhắc tới quảng cáo, tài trợ`]);
        // 4. View cao mà người xem thờ ơ
        if (rows.length >= 8 && v.views >= 3 * medAll && v.er != null) {
          if (v.er <= 0.5 * medErAll && (v.cmt_r || 0) <= 0.5 * medCmtAll) sig.push([medShareAll && v.share_r != null && v.share_r <= 0.5 * medShareAll ? 2 : 1.5, `view gấp ${(v.views / medAll).toFixed(1).replace(".", ",")} lần clip thường, nhưng tỉ lệ người xem có like, comment, share chỉ bằng ${frac(v.er / (medErAll || 1))} mức thường của kênh`]);
          else if (medShareAll && v.share_r != null && v.share_r <= 0.3 * medShareAll) sig.push([1, `view gấp ${(v.views / medAll).toFixed(1).replace(".", ",")} lần clip thường, nhưng gần như không ai share`]);
        }
        // 5. Dấu vết thương mại (yếu, chỉ cộng thêm)
        if (ment.size) sig.push([0.5, `caption tag ${[...ment].slice(0, 3).map(x => "@" + x).join(", ")}`]);
        if (v.shop) sig.push([0.5, "gắn giỏ hàng / sản phẩm"]);
        if (SALE_CTA.test(v.caption || "")) sig.push([0.5, "caption kiểu bán hàng"]);
      }
      v.ad_score = sig.reduce((a, x) => a + x[0], 0);
      v.ad_reasons = sig.sort((a, b) => b[0] - a[0]).map(x => x[1]);
      v.suspect = !v.declared && v.mark !== "organic" && v.ad_score >= 2;
      v.paid_src = v.mark === "paid" ? "bạn xác nhận" : !v.declared ? "" : v.paid_flags.length ? "nhãn quảng cáo trong dữ liệu TikTok (" + v.paid_flags.join(", ") + ")" : "creator tự ghi trong caption";
      v.kind = v.declared ? "PAID" : v.suspect ? "NGHI ADS" : "ORGANIC";
    }
    const org = rows.filter(v => v.kind === "ORGANIC" && !v.isNew);
    const baseOrganic = org.length >= 5;
    let base = baseOrganic ? org : rows.filter(v => !v.isNew);
    if (!base.length) base = rows;
    const med = median(base.map(v => v.views)) || 1;
    rows.forEach(v => { v.x_med = v.views / med; });
    const n = base.length, byV = [...base].sort((a, b) => b.views - a.views), cut = Math.max(1, Math.round(n * 0.2));
    const top = new Set(byV.slice(0, cut).map(v => v.id)), bot = n >= 5 ? new Set(byV.slice(-cut).map(v => v.id)) : new Set();
    const win = new Set(base.filter(v => v.x_med >= 2 || (top.has(v.id) && v.x_med >= 1.3)).map(v => v.id));
    const flop = new Set(base.filter(v => n >= 5 && (v.x_med <= 0.4 || (bot.has(v.id) && v.x_med <= 0.7))).map(v => v.id));
    const ers = base.filter(v => v.er != null).map(v => v.er).sort((a, b) => a - b);
    const erCut = ers.length >= 5 ? ers[Math.floor(ers.length * 0.8)] : null;
    const medShare = median(base.filter(v => v.share_r != null).map(v => v.share_r));
    const baseIds = new Set(base.map(v => v.id)), viral = new Set();
    for (const v of rows) {
      if (v.isNew) { v.label = "MỚI"; v.er_high = false; continue; }
      if (v.kind !== "ORGANIC" && baseOrganic) { v.label = v.kind; v.er_high = false; continue; }
      if (baseIds.has(v.id) && v.x_med >= 5 && (!followers || v.views >= followers) && (v.share_r == null || medShare == null || v.share_r >= medShare)) { viral.add(v.id); v.label = "VIRAL"; }
      else v.label = win.has(v.id) ? "WIN" : flop.has(v.id) ? "FLOP" : "ỔN";
      v.er_high = erCut != null && v.er != null && v.er >= erCut && v.label !== "WIN" && v.label !== "VIRAL";
    }
    const dt = v => (v.ts ? new Date(v.ts * 1000) : null);
    function group(keyf, order, minN = 1, src = base) {
      const g = new Map();
      for (const v of src) for (const k of keyf(v)) { if (!g.has(k)) g.set(k, []); g.get(k).push(v); }
      let out = [...g].filter(([, vs]) => vs.length >= minN).map(([k, vs]) => ({
        key: k, n: vs.length, med_views: median(vs.map(x => x.views)), med_x: median(vs.map(x => x.x_med)),
        win: vs.filter(x => x.label === "WIN" || x.label === "VIRAL").length, flop: vs.filter(x => x.label === "FLOP").length,
        med_er: median(vs.filter(x => x.er != null).map(x => x.er)),
      }));
      out.sort(order ? (a, b) => order.indexOf(a.key) - order.indexOf(b.key) : (a, b) => b.med_x - a.med_x);
      return out;
    }
    const baseT = base.filter(v => !v.pinned);   // clip ghim là clip cũ treo đầu kênh: không tính vào dòng thời gian
    const durKey = v => v.is_photo ? ["Ảnh (photo)"] : v.duration ? DURS.filter(([a, b]) => a <= v.duration && v.duration < b).map(d => d[2]) : [];
    const tables = {
      kind: group(v => [v.kind], ["ORGANIC", "PAID", "NGHI ADS"], 1, rows.filter(v => !v.isNew)),
      duration: group(durKey, DURS.map(d => d[2]).concat(["Ảnh (photo)"])),
      weekday: group(v => (dt(v) ? [WEEKDAY[wkIdx(dt(v))]] : []), WEEKDAY, 1, baseT),
      hour: group(v => (dt(v) ? HOURS.filter(([a, b]) => a <= dt(v).getHours() && dt(v).getHours() < b).map(h => h[2]) : []), HOURS.map(h => h[2]), 1, baseT),
      sound: group(v => (v.lite || !v.music ? [] : [v.original_sound ? "Âm thanh gốc" : "Nhạc / sound có sẵn"])),
      hashtag: group(v => [...new Set((v.hashtags || []).map(h => "#" + h.toLowerCase()))], null, 2).slice(0, 25),
      topic: group(v => [...new Set(v.labels || [])], null, 2).slice(0, 12),
      keyword: group(v => [...new Set((v.kw || []).map(x => x.toLowerCase()))], null, 2).slice(0, 20),
      month: group(v => (dt(v) ? [dt(v).toISOString().slice(0, 7)] : []), null, 1, baseT).sort((a, b) => (a.key < b.key ? -1 : 1)),
    };
    tables.heat = {
      hours: HOURS.map(h => h[2]), organic: baseOrganic,
      rows: WEEKDAY.map((day, di) => ({ day, cells: HOURS.map(([a, b]) => {
        const vs = baseT.filter(v => dt(v) && wkIdx(dt(v)) === di && a <= dt(v).getHours() && dt(v).getHours() < b);
        return { n: vs.length, med: median(vs.map(x => x.views)), x: median(vs.map(x => x.x_med)) };
      }) })),
    };
    const bench = shareBench(followers);
    const tl = rows.filter(v => !v.pinned), ts = tl.map(v => v.ts).filter(Boolean), span = ts.length > 1 ? (Math.max(...ts) - Math.min(...ts)) / 86400 : 0;
    const views = rows.map(v => v.views);
    const summary = {
      n: rows.length, base_n: n, base_organic: baseOrganic, med_views: med,
      mean_views: views.reduce((a, b) => a + b, 0) / views.length, max_views: Math.max(...views), min_views: Math.min(...views),
      med_er: median(base.filter(v => v.er != null).map(v => v.er)), med_share: medShare,
      med_save: median(base.filter(v => v.save_r != null).map(v => v.save_r)),
      share_bench: bench, med_cmt: median(base.filter(v => v.cmt_r != null).map(v => v.cmt_r)),
      is_ad_flag: rows.filter(v => v.is_ad_flag).length,
      first: ts.length ? Math.min(...ts) : null, last: ts.length ? Math.max(...ts) : null,
      per_week: span >= 7 ? Math.round(tl.length / (span / 7) * 10) / 10 : null, pinned: rows.filter(v => v.pinned).length,
      viral: viral.size, win: [...win].filter(id => !viral.has(id)).length, flop: flop.size,
      new: rows.filter(v => v.isNew).length, organic: rows.filter(v => v.kind === "ORGANIC").length,
      paid: rows.filter(v => v.kind === "PAID").length, suspect: rows.filter(v => v.kind === "NGHI ADS").length,
      shop: rows.filter(v => v.shop).length, deep: rows.filter(v => !v.lite && !v.thin).length, full: rows.filter(v => !v.lite).length,
      with_transcript: rows.filter(v => v.transcript).length, comments_got: rows.reduce((a, v) => a + (v.comments || []).length, 0),
    };
    return { rows, summary, tables };
  }

  /* ---------- lọc comment khi xuất ---------- */
  const norm = t => String(t || "").replace(/@\S+/g, " ").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim().toLowerCase();
  const isNoise = t => { const n = norm(t); return !n || /^((ha|he|hi|hj|hihi|kk|k|z|kaka|keke)+\s*)+$/.test(n); };
  // ký tự vô hình / ô trống mà spam hay dùng (braille trống, hangul filler, zero-width…)
  const INVIS = /[\u2800\u3164\uFFA0\u115F\u1160\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF\u00AD\u034F\u17B4\u17B5\u180E]/g;
  const clean = t => { t = String(t || "").replace(INVIS, " ").replace(/\s+/g, " ").trim(); return t.length > 300 ? t.slice(0, 300) + "…" : t; };
  function pickComments(cm, cap) {
    const out = [], seen = new Map(), short = new Map(); let dropped = 0;
    cm = (cm || []).map(c => ({ ...c, text: clean(c.text), reply_list: (c.reply_list || []).map(r => ({ ...r, text: clean(r.text) })) }));
    for (const c0 of cm) {
      const k = norm(c0.text);
      if (isNoise(c0.text)) { dropped++; continue; }
      if (k.split(" ").length <= 2 && !((c0.reply_list || []).length || c0.replies)) { short.set(k, (short.get(k) || 0) + 1); continue; }
      if (seen.has(k)) { const s = seen.get(k); s.dup = (s.dup || 1) + 1; continue; }
      const c = { ...c0, reply_list: (c0.reply_list || []).filter(r => !isNoise(r.text)) };
      seen.set(k, c); out.push(c);
    }
    return { list: cap ? out.slice(0, cap) : out, dropped, shorts: [...short].sort((a, b) => b[1] - a[1]), total: out.length };
  }

  /* ---------- xuất markdown ---------- */
  const n_ = v => (typeof v === "number" ? Math.round(v).toLocaleString("de-DE") : "–");
  const p_ = (v, d = 1) => (v == null ? "–" : (v * 100).toFixed(d).replace(".", ",") + "%");
  const x_ = v => (v == null ? "–" : v.toFixed(1).replace(".", ",") + "×");
  const pad = x => String(x).padStart(2, "0");
  const date_ = (ts, withTime, short) => { if (!ts) return "–"; const d = new Date(ts * 1000);
    return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + (short ? String(d.getFullYear()).slice(2) : d.getFullYear()) + (withTime ? " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) : ""); };
  const DEPTH = { gon: [15, 5, 2, 40], vua: [40, 15, 4, 120], du: [0, 0, 0, 0] };

  function buildMd(meta, vids, depth, brief, range) {
    const ranged = !!rangeBounds(range);
    const { rows, summary: s, tables: t } = analyze(filterRange(vids, range), meta.followers);
    const [capHot, capOk, capRep, trOk] = DEPTH[depth] || DEPTH.vua;
    const h = meta.handle, o = [];
    o.push(`# Channel pack · @${h} · ${date_(Date.now() / 1000)} · ${rows.length} clip`, "");
    if (brief) o.push(brief.trim(), "", "---", "");
    o.push("# DỮ LIỆU KÊNH", "", "## D1. Tổng quan", "",
      `- Kênh: **${meta.nickname || h}** (@${h})${meta.verified ? " · tích xanh" : ""}`,
      `- Bio: ${(meta.bio || "(trống)").replace(/\n/g, " / ")}${meta.link ? " · link: " + meta.link : ""}`,
      `- Follower ${n_(meta.followers)} · Tổng tim ${n_(meta.hearts)} · Kênh có ${n_(meta.videos)} clip · có số liệu của ${rows.length} clip (đủ like / comment / share / save: ${s.full || 0} clip) · đọc comment + phụ đề ${s.deep || 0} clip đại diện`,
      ...(ranged ? [`- **Khoảng ngày phân tích: ${rangeLabel(range)}** — chỉ xét clip đăng trong khoảng này; mức chuẩn ×TV, WIN/FLOP/VIRAL đều tính trong khoảng này, không phải toàn kênh.`] : []),
      ...(s.pinned ? [`- ${s.pinned} clip ghim (clip cũ treo đầu kênh) có nhãn như thường nhưng không tính vào giai đoạn, tần suất, bảng theo tháng / thứ / giờ.`] : []),
      ...(!ranged && meta.videos && rows.length < meta.videos * 0.6 ? [`- ⚠ Mới đọc được ${rows.length}/${n_(meta.videos)} clip của kênh (TikTok chỉ cho tải tới đó). Kết luận chỉ đúng cho giai đoạn bên dưới, không phải cả kênh.`] : []),
      `- Giai đoạn: ${date_(s.first)} → ${date_(s.last)}${s.per_week ? ` · đăng trung bình ${String(s.per_week).replace(".", ",")} clip/tuần` : ""}`,
      `- View: trung vị ${n_(s.med_views)} · trung bình ${n_(s.mean_views)} · cao nhất ${n_(s.max_views)} · thấp nhất ${n_(s.min_views)}`,
      `- Trung vị (clip đã soi sâu): tương tác/view ${p_(s.med_er)} · share/view ${p_(s.med_share, 2)} · save/view ${p_(s.med_save, 2)} · comment/view ${p_(s.med_cmt, 2)}`,
      ...(s.med_share != null ? [`- Mốc share/view tham khảo cho ${s.share_bench.tier}: ${p_(s.share_bench.rate, 2)} (số liệu bên thứ ba, chỉ để định hướng) → kênh này ${s.med_share >= s.share_bench.rate * 1.2 ? "**được share nhiều hơn mặt bằng**" : s.med_share <= s.share_bench.rate * 0.8 ? "**được share ít hơn mặt bằng**" : "ngang mặt bằng"}. TikTok coi xem hết và share là tín hiệu mạnh; follower không phải yếu tố trực tiếp.`] : []),
      ...((meta.fhist || []).length >= 2 ? [(() => { const h = meta.fhist, a = h[0], b = h[h.length - 1], d = b[1] - a[1]; return `- Follower qua các lần quét: ${n_(a[1])} (${date_(a[0])}) → ${n_(b[1])} (${date_(b[0])}) · ${d >= 0 ? "+" : ""}${n_(d)} trong ${Math.max(1, Math.round((b[0] - a[0]) / 86400))} ngày`; })()] : []),
      `- Loại clip: ${s.organic} organic · ${s.paid} paid có công bố · ${s.suspect} nghi chạy ads · ${s.shop} clip gắn giỏ hàng / sản phẩm`,
      `- ${s.viral} clip VIRAL · ${s.win} clip WIN · ${s.flop} clip FLOP · ${s.new} clip MỚI (chưa đủ ${NEW_DAYS} ngày) · ${s.with_transcript}/${s.deep} clip soi sâu có phụ đề · ${n_(s.comments_got)} comment đã lấy`,
      "", "**Cách gắn nhãn** (đã tính sẵn, không cần tính lại):",
      "- `×TV` = view của clip chia view trung vị của kênh. 1,0× là mức bình thường của kênh này.",
      "- **WIN** = ≥ 2×TV, hoặc thuộc 20% clip nhiều view nhất và ≥ 1,3×TV. **FLOP** = ≤ 0,4×TV, hoặc thuộc 20% ít view nhất và ≤ 0,7×TV. Còn lại **ỔN**.",
      "- **VIRAL** = ≥ 5×TV **và** view ≥ số follower của kênh (đã lan ra ngoài tệp fan), share/view không thấp hơn mức thường. VIRAL tính riêng, không đếm vào WIN.",
      `- **MỚI** = đăng chưa tới ${NEW_DAYS} ngày, view còn đang lên → không chấm win/flop, không tính vào mức chuẩn.`,
      "- **ER cao** = tương tác/view thuộc top 20% kênh dù view không nổi → khán giả thích nhưng chưa được đẩy rộng.",
      "- Tương tác = (like + comment + share + save) / view. Clip chưa soi sâu chỉ có view + ngày đăng (cột khác để –).",
      "- Clip soi sâu được chọn đại diện: nhiều view nhất, ít view nhất, mới nhất và rải đều ở giữa.",
      "- **PAID** = đã xác nhận chạy ads: creator tự ghi trong caption (#ad #quangcao #hoptac #taitro…) hoặc người dùng tool xác nhận. TikTok không công khai clip nào được boost (kể cả Spark Ads brand chạy bằng mã của creator), và view từ ads được cộng thẳng vào clip.",
      "- **NGHI ADS** = không ai khai nhưng cộng đủ dấu hiệu: view vẫn tăng đều khi clip đã cũ, tài khoản doanh nghiệp / được tag vào comment, người xem nhắc tới quảng cáo, view cao mà tương tác thấp, dấu vết bán hàng. Là suy luận, mỗi clip kèm lý do. **Khi phân tích: đừng coi clip NGHI ADS là bằng chứng content tốt.**",
      "- " + (s.base_organic ? `Mức chuẩn ×TV và nhãn WIN/FLOP chỉ tính trên clip **ORGANIC** đã đăng ≥ ${NEW_DAYS} ngày; clip PAID / NGHI ADS được so riêng.` : "Kênh có quá ít clip organic nên mức chuẩn tính trên toàn bộ clip."), "");
    o.push("## D2. Bảng toàn bộ clip (mới → cũ)", "",
      "| # | Ngày | Dài | View | ×TV | Nhãn | Tương tác | Share | Save | Cmt | Hook / caption |", "|---|---|---|---|---|---|---|---|---|---|---|");
    rows.forEach((v, i) => {
      v._i = i + 1;
      const lab = v.label + (v.er_high ? " · ER cao" : "") + (v.shop ? " · giỏ hàng" : "") + (v.pinned ? " · ghim" : "");
      const dur = v.is_photo ? "ảnh" : v.duration ? v.duration + "s" : "–";
      o.push(`| ${v._i} | ${date_(v.ts, false, true)} | ${dur} | ${n_(v.views)} | ${x_(v.x_med)} | ${lab} | ${p_(v.er)} | ${p_(v.share_r, 2)} | ${p_(v.save_r, 2)} | ${n_(v.comments_count)} | ${(v.hook || "").replace(/[|\n]/g, " ").slice(0, 70)} |`);
    });
    o.push("");
    const table = (title, g, head) => {
      if (!g || !g.length) return;
      o.push(`### ${title}`, "", `| ${head} | Số clip | View trung vị | ×TV trung vị | WIN | FLOP | Tương tác TV |`, "|---|---|---|---|---|---|---|");
      g.forEach(r => o.push(`| ${r.key} | ${r.n} | ${n_(r.med_views)} | ${x_(r.med_x)} | ${r.win} | ${r.flop} | ${p_(r.med_er)} |`));
      o.push("");
    };
    o.push("## D3. So sánh theo nhóm", "", "_Nhóm chỉ có 1–2 clip thì chỉ để tham khảo, đừng kết luận từ đó." + (s.base_organic ? " Trừ bảng Organic vs paid, các bảng chỉ tính clip organic đã đủ 7 ngày._" : "_"), "");
    table("Organic vs paid", t.kind, "Loại");
    table("Theo độ dài", t.duration, "Độ dài");
    if (t.heat) {
      o.push("### Thứ × khung giờ đăng (view trung vị · số clip)", "", "| Thứ | " + t.heat.hours.join(" | ") + " |", "|---|" + "---|".repeat(t.heat.hours.length));
      t.heat.rows.forEach(r => o.push(`| ${r.day} | ` + r.cells.map(c => (c.n ? `${n_(c.med)} · ${c.n}` : "–")).join(" | ") + " |"));
      o.push("");
    }
    table("Theo thứ đăng", t.weekday, "Thứ");
    table("Theo giờ đăng", t.hour, "Khung giờ");
    table("Theo âm thanh", t.sound, "Loại");
    table("Theo hashtag (dùng ≥ 2 lần)", t.hashtag, "Hashtag");
    table("Theo tháng", t.month, "Tháng");
    if ((t.topic || []).length) table("Theo chủ đề TikTok tự gắn cho clip", t.topic, "Chủ đề");
    if ((t.keyword || []).length) table("Từ khoá tìm kiếm TikTok gợi ý dưới clip (clip lên nhờ search nào)", t.keyword, "Từ khoá");
    const sus = rows.filter(v => v.kind === "NGHI ADS");
    if (sus.length) {
      o.push("## D3b. Clip nghi chạy ads và lý do", "", "_Gồm cả clip chưa soi sâu (dấu hiệu view tăng đều lấy từ các lần quét)._", "");
      sus.sort((a, b) => b.ad_score - a.ad_score).forEach(v => o.push(`- ${date_(v.ts)} · ${n_(v.views)} view · ${v.url} — ${v.ad_reasons.join("; ")}`));
      o.push("");
    }
    const ord = { VIRAL: 0, WIN: 1, FLOP: 2, "ỔN": 3, PAID: 4, "NGHI ADS": 5, "MỚI": 6 };
    o.push("## D4. Chi tiết từng clip", "", "_Chỉ gồm clip đã soi sâu. Thứ tự: VIRAL → WIN → FLOP → ỔN → PAID → NGHI ADS → MỚI. Số # khớp với bảng ở mục D2._", "");
    [...rows].filter(v => !v.lite && !v.thin).sort((a, b) => (ord[a.label] - ord[b.label]) || (b.x_med - a.x_med)).forEach(v => {
      const hot = ["VIRAL", "WIN", "FLOP", "PAID", "NGHI ADS"].includes(v.label) || v.er_high;
      o.push(`### #${v._i} · ${v.label}${v.er_high ? " · ER cao" : ""} · ${x_(v.x_med)} · ${date_(v.ts, true)}`, `- Link: ${v.url}`,
        `- View ${n_(v.views)} · Like ${n_(v.likes)} · Cmt ${n_(v.comments_count)} · Share ${n_(v.shares)} · Save ${n_(v.saves)}` +
        (v.duration ? ` · Dài ${v.duration}s` : "") + (v.wpm ? ` · nói ~${v.wpm} từ/phút` : ""));
      if ((v.hashtags || []).length) o.push("- Hashtag: " + v.hashtags.map(x => "#" + x).join(" "));
      if (v.music) o.push(`- Âm thanh: ${v.music}${v.original_sound ? " (gốc)" : ""}`);
      if (v.kind !== "ORGANIC" || v.shop) {
        const sig = [];
        if (v.declared) sig.push(v.paid_src === "bạn xác nhận" ? "người dùng tool xác nhận đã chạy ads" : "creator tự ghi quảng cáo / hợp tác trong caption");
        if (!v.declared) sig.push(...(v.ad_reasons || []));
        o.push(`- Loại: **${v.kind}** · dấu hiệu: ${sig.join("; ")}`);
      }
      if ((v.labels || []).length || (v.kw || []).length) o.push(`- TikTok xếp vào: ${(v.labels || []).join(", ") || "–"}${(v.kw || []).length ? " · từ khoá gợi ý: " + v.kw.join(", ") : ""}`);
      o.push(`- Caption: ${v.caption || "(trống)"}`);
      let tr = v.transcript || "";
      if (tr && !hot && trOk) { const w = tr.split(/\s+/); tr = w.slice(0, trOk).join(" ") + (w.length > trOk ? " …(rút gọn)" : ""); }
      o.push(`- Transcript (phụ đề tự động, có thể sai chính tả): ${tr || "(không có phụ đề)"}`);
      const P = pickComments(v.comments, hot ? capHot : capOk);
      if (P.list.length || P.shorts.length) {
        o.push(`- Comment, xếp theo like (${P.list.length}/${P.total} comment có ý${P.dropped ? `, bỏ ${P.dropped} comment chỉ emoji/cười` : ""}):`);
        P.list.forEach(c => {
          o.push(`  - [${n_(c.likes)} like${c.replies ? ` · ${c.replies} trả lời` : ""}${c.dup ? ` · ${c.dup} người viết y vậy` : ""}] ${c.text}`);
          (capRep ? c.reply_list.slice(0, capRep) : c.reply_list).forEach(r => o.push(`    - ↳ ${r.by_creator ? "**creator trả lời** " : ""}[${n_(r.likes)} like] ${r.text}`));
        });
        if (P.shorts.length) o.push(`  - Comment 1–2 chữ (${P.shorts.reduce((a, x) => a + x[1], 0)}): ` + P.shorts.slice(0, 20).map(([k, c]) => `«${k}»${c > 1 ? " ×" + c : ""}`).join(" · "));
      } else o.push("- Comment: (không có / không lấy được)");
      o.push("");
    });
    return o.join("\n").trim() + "\n";
  }

  G.TTI = { mergeItems, shareBench, analyze, buildMd, plan, snap, applyMarks, idOf, rangeBounds, rangeLabel, filterRange, RANGE_NAMES, mergeLinks, videoFrom, kNum, idTs, cleanVtt, pickComments, NEW_DAYS };
})(window);
