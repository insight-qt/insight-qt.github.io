/* TikTok Insight · phân tích kênh (chạy hoàn toàn trong trình duyệt) */
(function (G) {
  const NEW_DAYS = 7;
  const WEEKDAY = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
  const HOURS = [[0, 6, "0–6h"], [6, 11, "6–11h"], [11, 14, "11–14h"], [14, 18, "14–18h"], [18, 22, "18–22h"], [22, 24, "22–24h"]];
  const DURS = [[0, 16, "<15s"], [16, 31, "15–30s"], [31, 61, "30–60s"], [61, 181, "1–3 phút"], [181, 1e9, ">3 phút"]];
  // Hashtag công bố hợp tác / tài trợ: là nội dung có brand (brand deal), KHÔNG có nghĩa là view đến từ ads
  const PAID_TAG = /#(ad|ads|advert|sponsored|sponsor|quangcao|qc|partner|brandpartner|paidpartnership|booking)(?![\p{L}\p{N}_])|#(hoptac|hợptác|taitro|tàitrợ|donghanh|đồnghành)[\p{L}\p{N}_]*/iu;
  // Brand phổ biến ở Việt Nam (FMCG, F&B, ngân hàng, ví, sàn TMĐT, viễn thông, xe, điện máy, mỹ phẩm, giáo dục, tuyển dụng…)
  const BRANDS = new Set(["7eleven", "marvis", "gaviscon", "abib", "zenyum", "durex", "colgate", "closeup", "7up", "acb", "acecook", "acer", "acnes", "adidas", "aeon", "agoda", "agribank", "aia", "aice", "aji", "ajingon", "ajinomoto", "anessa", "anhang", "ankhang", "apple", "aquafina", "ariel", "asus", "bachhoaxanh", "baemin", "bamboo", "baoviet", "barona", "befood", "bia333", "bibica", "bibigo", "bidv", "bigc", "bioderma", "biofermin", "biore", "biti's", "bitis", "blackrouge", "bluestone", "bmw", "bobapop", "bobby", "bocalex", "bosch", "budweiser", "burgerking", "cailan", "canifa", "canon", "careerbuilder", "carlsberg", "casper", "castrol", "cellphones", "cerave", "cfresh", "chinsu", "chocopie", "cholimex", "chubb", "circlek", "closeup", "coca", "cocacola", "cocoon", "cogaihalan", "colgate", "comfee", "congcaphe", "coolmate", "coopfood", "coopmart", "daiichi", "daikin", "danisa", "dasani", "datbike", "decolgen", "dell", "diana", "dienmayxanh", "digiworld", "dilmah", "dingtea", "dominos", "dookki", "dove", "downy", "drpong", "drthanh", "duolingo", "durex", "dutchlady", "electrolux", "emart", "eucerin", "eugica", "familymart", "fanta", "fecredit", "fixderma", "focallure", "fpt", "fptplay", "fptshop", "fpttelecom", "funiki", "fwd", "galaxyplay", "garnier", "geely", "generali", "gillette", "gogi", "gojek", "gongcha", "grab", "growplus", "gs25", "gsm", "guardian", "habeco", "hadalabo", "haidilao", "handy", "hanoibeer", "haohao", "hasaki", "haugiang", "hauvang", "hazeline", "hdbank", "headandshoulders", "headshoulders", "heineken", "highlands", "highlandscoffee", "hm", "hoanghamobile", "homecredit", "honda", "hondaviet", "huawei", "huggies", "hygienegel", "hyundai", "innisfree", "iphone", "itel", "itviec", "jeep", "jisulife", "jobstreet", "jollibee", "judydoll", "kangaroo", "karofi", "katinat", "kfc", "kichikichi", "kido", "kinhdo", "kitkat", "klairs", "klook", "knorr", "kokomi", "kotex", "lalamove", "lancome", "laneige", "larocheposay", "larue", "laurier", "lavie", "lays", "lazada", "lenovo", "lexus", "lifebuoy", "lipton", "locklock", "longchau", "loreal", "lotte", "lotteria", "lpbank", "maggi", "manulife", "manwah", "masan", "maybelline", "mazda", "mbbank", "mcdonalds", "meatsnack", "mediheal", "meizan", "mercedes", "merino", "merries", "merzy", "midea", "miliket", "ministop", "miohya", "mirinda", "mitsubishi", "mixue", "mobifone", "momo", "moony", "msb", "msi", "myvnpt", "namabank", "nammngu", "namngu", "neptune", "nescafe", "nestle", "netflix", "nike", "nissin", "nokia", "numberone", "nutifood", "nutriboost", "nutrinest", "ocb", "ohya", "oishi", "olay", "olong", "omachi", "omo", "oolong", "oppo", "oralb", "oreo", "orion", "palmolive", "pampers", "panadol", "panasonic", "pandora", "pantene", "pepsi", "perspirex", "petrolimex", "peugeot", "pharmacity", "phela", "philips", "phuclong", "piaggio", "pizza4ps", "pizzahut", "playmore", "playtogether", "poco", "pond", "ponds", "ponnie", "popeyes", "popmart", "porsche", "pringles", "prudential", "pslove", "puma", "rakuten", "realme", "redbull", "redmi", "rejoice", "revive", "rexona", "rockstar", "rohto", "romand", "romano", "sabeco", "sacombank", "safeguard", "saigonbeer", "saigontourist", "samsung", "santen", "seabank", "selsun", "sendo", "senka", "sensodyne", "shb", "shell", "shiseido", "shopee", "shopeefood", "shopeepay", "simply", "snickers", "solite", "sontoa", "sonvn", "spotify", "sprite", "starbucks", "sting", "strepsils", "strongbow", "sulwhasoo", "sunhouse", "sunlight", "sunplay", "sunsilk", "surfsach", "suzuki", "tanhiepphat", "teaplus", "techcombank", "tefal", "tgdd", "thecoffeehouse", "thegioididong", "thegioiskinfood", "thepizzacompany", "thienlong", "thmilk", "thorakao", "thp", "thtruemilk", "tienlong", "tiffy", "tiger", "tigerbalm", "tiki", "tiktokshop", "tocotoco", "topcv", "topica", "toshiba", "toyota", "tpbank", "traphaco", "traveloka", "tresemme", "trungnguyen", "tuongan", "tv360", "uniben", "unilever", "uniqlo", "vaseline", "vespa", "vib", "viber", "vichy", "vieclam24h", "vieon", "vietcombank", "vietinbank", "vietjet", "vietnamairlines", "vietnamworks", "vietqr", "vietravel", "viettel", "viettelmoney", "viettelstore", "vifon", "vinamilk", "vinaphone", "vincom", "vinfast", "vinfastvf", "vingroup", "vinhomes", "vinmec", "vinpearl", "vinschool", "visa", "vivo", "vnpay", "vnpt", "vocarimex", "vpbank", "vtvgo", "wakeup", "warrior", "watsons", "whisper", "winmart", "xanhsm", "xiaomi", "xylitol", "yamaha", "yody", "ysl", "zalopay", "zara"]);
  const PREFIX3 = new Set(["ysl", "omo", "kfc", "bmw", "fpt", "7up"]);
  // từ thường chứa tên hãng bên trong (#kinhdoanh ⊃ kinhdo, #nganhang ⊃ anhang, #jobposting ⊃ sting) → không phải brand
  const NOT_BRAND = /^(kinhdoanh|nganhang|jobposting|posting|tuyendung|vieclam|congviec|hoclam|kiemtien|lamgiau|taichinh|dautu|baohiem|batdongsan|giaoduc|suckhoe|amthuc|dulich|thoitrang|lamdep|congnghe|marketing|sales?|startup)/;
  const brandOf = h => { h = String(h).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]/g, "");
    if (NOT_BRAND.test(h)) return null;
    const core = h.replace(/(vietnam|vn|official|vietnamofficial|global)$/, "") || h;
    // tên hãng phải đứng đầu tag (#knorrvietnam, #samsunggalaxy) hoặc là đuôi dài từ 6 ký tự (#nuocmamchinsu); không khớp giữa chừng
    for (const b of BRANDS) { if (b.length >= 6 ? (h.startsWith(b) || core.endsWith(b)) : b.length >= 4 ? (h.startsWith(b) || core === b) : core === b || (PREFIX3.has(b) && h.startsWith(b))) return b; } return null; };
  // câu công bố tài trợ viết thường trong caption
  const SPONSOR_TXT = /(được|do)\s+tài\s*trợ|nội\s+dung\s+(được\s+)?tài\s*trợ|hợp\s+tác\s+(cùng|với)\s+\S|sponsored\s+by|paid\s+partnership|in\s+partnership\s+with/i;
  // Kênh công nghệ: review sản phẩm có tên hãng là chuyện thường ngày, chưa chắc là booking.
  // Tên hãng/sản phẩm chỉ tính là brand khi đi kèm dấu hiệu booking (lời kiểu được gửi máy, hashtag chiến dịch, tag nhà bán lẻ, tag tài khoản hãng).
  const TOPIC = new Set(["apple","iphone","ipad","macbook","airpods","applewatch","imac","ios","samsung","galaxy","xiaomi","redmi","poco","oppo","vivo","realme","honor","huawei","google","pixel","android","windows","microsoft","surface","lenovo","thinkpad","legion","asus","rog","zenbook","vivobook","acer","predator","dell","xps","alienware","hp","lg","sony","bose","jbl","marshall","anker","baseus","ugreen","logitech","razer","intel","amd","nvidia","dyson","ecovacs","roborock","dreame","eufy","tplink","garmin","nintendo","playstation","xbox","canon","nikon","fujifilm","gopro","insta360","dji","kindle","chatgpt","openai","gemini","copilot","nothing","oneplus","tecno","infinix","msi","gigabyte","philips","panasonic","sharp","toshiba","casio","amazfit","huami","beats","sennheiser","shokz","edifier","soundpeats","tecnopro"]);
  const TOPIC_RE = new RegExp("(?<![\\p{L}\\p{N}])(" + [...TOPIC].filter(x => x.length >= 3 && !["ios","nothing","rog","xps","hp","lg"].includes(x)).join("|") + ")(?![\\p{L}\\p{N}])", "giu");
  // nhà bán lẻ công nghệ: tag / nhắc tên = hợp tác với nhà bán lẻ
  const RETAIL = /^(cellphones?(vn)?|thegioididong|tgdd|fptshop|hoanghamobile|didongviet|shopdunk|dienmayxanh|nguyenkim|phongvu|gearvn|anphatpc|viettelstore|mobilecity|xtmobile|minhtuanmobile|clickbuy|bachlongmobile|topzone|ankhang)/i;
  // lời kiểu booking hay gặp ở kênh review: được gửi máy, có dịp trải nghiệm, cảm ơn hãng, mã giảm giá…
  const TECH_BOOK = /(c[oó] d[iị]p|[đd][uư][ợo]c m[ờo]i) (tr[ảa]i nghi[ệe]m|d[ùu]ng th[ửu]|tham d[ựu])|[đd][uư][ợo]c (h[ãa]ng|b[êe]n|team|anh em|nh[ãa]n h[àa]ng)[^.!?\n]{0,30}(g[ửu]i|t[ặa]ng|cho m[ượu]n)|tr[ảa]i nghi[ệe]m s[ớo]m|c[ảa]m [ơo]n (h[ãa]ng|b[êe]n|team|nh[ãa]n h[àa]ng)|s[ựu] ki[ệe]n ra m[ắa]t|m[ãa] gi[ảa]m gi[áa]|voucher|ư[uư] [đd][ãa]i|[đd][ặa]t tr[ưuướ][ớo]c ngay|mua (ngay )?t[ạa]i|link (trong|[ởo]) bio/i;
  // hashtag chung chung, viết hoa kiểu CamelCase nhưng không phải brand
  // hashtag kiểu tên hãng + đuôi Việt Nam / official (#knorrvietnam, #abibvn), trừ các chủ đề chung
  const SUFFIX_BRAND = /^[a-z][a-z0-9]{2,}(vietnam|vn|official|vietnamofficial|global)$/i;
  const GENERIC_SFX = /^(tiktok|xuhuong|trend|dulich|amthuc|monngon|review|hai|haihuoc|comedy|food|travel|music|nhac|phim|film|game|giaitri|congso|sinhvien|hoc|giaoduc|cuocsong|lamdep|thoitrang|fashion|beauty|skincare|makeup|mebe|baby|giadinh|nauan|cooking|anvat|streetfood|cafe|coffee|bongda|football|thethao|sport|gym|fitness|yoga|tinhyeu|love|meme|vlog|daily|life|dance|nhay|cover|sing|ca|kpop|vpop|rap|anime|manga|art|draw|photo|xe|oto|moto|congnghe|tech|edu|story|chuyen|tamsu|news|tintuc|vietnam|saigon|hanoi|danang|nguoi|ban|em|anh|chi|me|bo|con|nha|viet|xinh)(vietnam|vn|official|vietnamofficial|global)$/i;
  // Clip "Trả lời @tên" (trả lời comment): TikTok gắn người comment như một lượt tag → không phải collab.
  // Dữ liệu cũ chưa tách loại tag: caption mở đầu "Trả lời @" / "Replying to @" thì bỏ tag đầu tiên.
  const replyFree = v => { const ms = (v.mentions || []).filter(x => !v.reply_to || String(x).toLowerCase() !== String(v.reply_to).toLowerCase()); return !v.reply_to && /^\s*(tr[aả] l[oờ]i|replying to|reply to)\s+@/i.test(v.caption || "") ? ms.slice(1) : ms; };
  const GENERIC_TAG = /^(fyp|foryou|foryoupage|xuhuong|trend|trending|viral|tiktok|tiktokawards|tiktokvietnam|capcut|learnontiktok|thanhcongnghe|hoccungtiktok|edutok|tiktokgiaitri|thanhthoiluottet|worldcup|backtoschool|tet|giangsinh|christmas|noel|halloween|valentine|trungthu)/i;
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
      is_photo: !!d.is_photo, pinned: !!d.pinned, pinned_api: !!d.pinned, paid_flags: d.paid_flags || [], shop: !!d.shop, mentions: d.mentions || [], reply_to: d.reply_to || "",
      labels: d.labels || [], kw: d.kw || [], loc: d.loc || "",
      transcript: cleanVtt(d.vtt), ost: d.ost || [], cover: d.cover || "", ocr: d.ocr,
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
        for (const k of ["views", "likes", "comments_count", "shares", "saves", "paid_flags", "shop", "pinned_api"]) old[k] = v[k];
        if (v.cover) old.cover = v.cover; if ((v.ost || []).length) old.ost = v.ost;
        for (const k of ["labels", "kw", "mentions"]) if ((v[k] || []).length) old[k] = v[k]; if (v.reply_to) { old.reply_to = v.reply_to; old.mentions = v.mentions || []; }   // dữ liệu khi cuộn không có chủ đề → giữ cái đã có
        old.pinned = !!(v.pinned || old.pinned); old.stale = false; snap(old, v.views);
      } else {
        vids[v.id] = snap({ ...v, thin: true, lite: false, hist: (old && old.hist) || [], pinned: !!(v.pinned || (old && old.pinned)),
          ocr: old ? old.ocr : undefined, labels: (v.labels || []).length ? v.labels : (old && old.labels) || [], kw: (v.kw || []).length ? v.kw : (old && old.kw) || [] }, v.views);
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
  // marks: đánh dấu tay; accounts: hồ sơ các tài khoản được tag trong caption (brand / creator), do nút ⚡ kiểm
  function applyMarks(vids, marks, accounts) {
    marks = marks || {}; accounts = accounts || {};
    if (!Object.keys(marks).length && !Object.keys(accounts).length) return vids;
    const out = {};
    for (const k in vids) {
      const v = vids[k], acc = {};
      (v.mentions || []).forEach(m => { const a = accounts[String(m).toLowerCase()]; if (a) acc[String(m).toLowerCase()] = a; });
      out[k] = marks[k] || Object.keys(acc).length ? { ...v, ...(marks[k] ? { mark: marks[k] } : {}), ...(Object.keys(acc).length ? { ment_acc: acc } : {}) } : v;
    }
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
    const sub = filterRange(vids, range), all = Object.values(sub).filter(v => v.url && !v.gone);
    const need = v => v.lite || v.thin;
    const stale = all.filter(v => v.stale && !v.lite && !v.thin).map(v => v.url);
    if (mode === "all") return stale.concat(all.filter(need).map(v => v.url));
    // Ưu tiên đọc comment ở clip ORGANIC (đó mới là bằng chứng content), clip ads chỉ đọc vài cái để tham khảo
    const rows = analyze(sub, 0).rows.filter(r => r.url), byId = new Map(rows.map(r => [r.id, r]));
    const org = rows.filter(r => r.kind === "ORGANIC" && r.label !== "MỚI" && typeof r.x_med === "number").sort((a, b) => b.x_med - a.x_med);
    const paid = rows.filter(r => r.kind !== "ORGANIC").sort((a, b) => (b.views || 0) - (a.views || 0));
    const newest = [...rows].sort((a, b) => (b.ts || 0) - (a.ts || 0));
    const pick = [], seen = new Set();
    const add = (vs, n) => { for (const r of vs) { if (n <= 0) break; if (seen.has(r.id)) continue; seen.add(r.id); n--; const v = sub[r.id] || r; if (need(v)) pick.push(v.url); } };
    add(org.slice(0, DEEP_SMART.top), DEEP_SMART.top);
    add([...org].reverse().slice(0, DEEP_SMART.bottom), DEEP_SMART.bottom);
    add(newest, DEEP_SMART.newest);
    const mid = org.slice(DEEP_SMART.top, Math.max(DEEP_SMART.top, org.length - DEEP_SMART.bottom));
    const step = Math.max(1, Math.floor(mid.length / DEEP_SMART.spread));
    add(mid.filter((_, k) => k % step === 0), DEEP_SMART.spread);
    add(paid, Math.min(5, Math.ceil(DEEP_SMART.spread / 2)));
    if (!rows.length) add(newest, DEEP_SMART.top + DEEP_SMART.bottom + DEEP_SMART.newest + DEEP_SMART.spread);
    void byId;
    return stale.concat(pick.filter(u => !stale.includes(u)));
  }


  /* Mốc share/view tham khảo theo cỡ kênh (ttcalculator.net, ~1,4 triệu clip 11/2025–01/2026, nguồn bên thứ ba) */
  function shareBench(f) {
    if (!f) return { tier: "trung bình TikTok", rate: 0.0041 };
    const t = [[1e4, "kênh dưới 10K follower", 0.0072], [5e4, "kênh 10K–50K", 0.0051], [2e5, "kênh 50K–200K", 0.0038], [1e6, "kênh 200K–1M", 0.0031], [Infinity, "kênh trên 1M", 0.0025]];
    const x = t.find(r => f < r[0]); return { tier: x[1], rate: x[2] };
  }

  function analyze(vids, followers) {
    const rows = Object.values(vids).filter(v => typeof v.views === "number" && !v.gone).map(v => ({ ...v }))
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
      v.hook = words.slice(0, 22).join(" ") || (v.ost || []).join(" · ").slice(0, 90) || (v.ocr || "").slice(0, 90) || (v.caption || "").slice(0, 90);
      const tags = (v.hashtags || []).map(h => "#" + h.toLowerCase()).join(" ") + " " + (v.caption || "").toLowerCase();
      // Chỉ tin dấu hiệu công bố rõ ràng. Cờ isAd của TikTok KHÔNG dùng: clip organic viral vẫn có thể mang cờ này
      // (nhiều khả năng chỉ là "cho phép dùng làm quảng cáo"), không có nghĩa là đã chạy ads.
      // Cờ isAd: theo các bên thu thập dữ liệu TikTok, nghĩa là clip từng được chạy quảng cáo trả phí (Spark Ads / Quảng bá).
      // TikTok không công bố tài liệu nên tool coi là dấu hiệu rất mạnh của NGHI ADS, không coi là creator tự khai.
      v.is_ad_flag = (v.paid_flags || []).includes("isAd");
      v.paid_flags = (v.paid_flags || []).filter(f => f !== "isAd");
      // Công bố hợp tác (hashtag, nhãn "Paid partnership" của TikTok) → nội dung có brand, view vẫn là organic nếu không chạy ads
      v.brand_src = [];
      const disc = [...new Set(((v.hashtags || []).map(h => "#" + h)).filter(h => PAID_TAG.test(h)))];
      if (disc.length) v.brand_src.push("công bố hợp tác " + disc.slice(0, 2).join(" "));
      else if (PAID_TAG.test(tags) || SPONSOR_TXT.test(v.caption || "")) v.brand_src.push("caption ghi rõ là nội dung tài trợ / hợp tác");
      if (v.paid_flags.length) v.brand_src.push("TikTok ghi nhãn hợp tác thương hiệu");
      v.self_declared = false;
      v.declared = v.mark === "paid";   // cờ isAd xét ở vòng sau, khi đã có mức tương tác chuẩn
      v.isNew = !!(v.ts && now - v.ts < NEW_DAYS * 86400);
    }
    // Cờ isAd của TikTok: clip đã được đưa vào ads, nhưng không cho biết bao nhiêu view là tiền.
    // Kiểm trên kênh thật: clip ads của brand có tương tác chỉ ~1/4 mức thường; clip viral organic có cờ vẫn tương tác cao.
    // → có cờ + tương tác ≤ 60% mức thường của các clip không cờ: PAID. Có cờ mà tương tác vẫn tự nhiên: giữ nhãn thật, kèm "Cờ ads".
    // Hashtag chiến dịch của brand: viết kiểu CamelCase (#NuocMamCHINSU, #TeaPlus), không phải hashtag quen của kênh
    const tagCnt = {};
    rows.forEach(v => new Set((v.hashtags || []).map(h => h.toLowerCase())).forEach(h => { tagCnt[h] = (tagCnt[h] || 0) + 1; }));
    const ownCut = Math.max(6, rows.length * 0.12);
    const meN = String((rows.find(v => v.channel) || {}).channel || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    // kênh công nghệ: TikTok xếp ≥ 25% clip vào chủ đề công nghệ, hoặc ≥ 25% caption nhắc tên hãng công nghệ
    const techShare = rows.filter(v => (v.labels || []).some(l => /tech/i.test(l))).length / rows.length;
    const nameShare = rows.filter(v => { TOPIC_RE.lastIndex = 0; return TOPIC_RE.test(v.caption || ""); }).length / rows.length;
    const techCh = techShare >= 0.25 || nameShare >= 0.25;
    const rareCut = Math.max(2, Math.floor(rows.length * 0.03));
    for (const v of rows) {
      const hs = (v.hashtags || []).filter(h => !PAID_TAG.test("#" + h));
      // bỏ brand trùng tên kênh (kênh chính chủ của brand) và hashtag kênh dùng ở gần nửa số clip
      const known = [...new Set(hs.filter(h => { const b = brandOf(h); return b && !meN.includes(b) && (rows.length < 5 || (tagCnt[h.toLowerCase()] || 0) <= rows.length * 0.4); }))];
      const camp = [...new Set(hs.filter(h => !brandOf(h) && (tagCnt[h.toLowerCase()] || 0) < ownCut && h.length >= 4 && /\p{Lu}/u.test(h.slice(1)) && /\p{Ll}/u.test(h) && !GENERIC_TAG.test(h)))];
      // hashtag hiếm kiểu tên hãng + vietnam/vn/official (#knorrvietnam, #abibvn): tag brand booking, kể cả hãng chưa có trong danh sách
      const rare = h => (tagCnt[h.toLowerCase()] || 0) <= rareCut && !GENERIC_TAG.test(h) && !brandOf(h) && !camp.includes(h) && !meN.includes(h.toLowerCase().replace(/[^a-z0-9]/g, ""));
      const tail = [...new Set(hs.filter(h => rare(h) && h.length >= 4 && /^[a-z0-9]+$/i.test(h) && (
        SUFFIX_BRAND.test(h) && !GENERIC_SFX.test(h))))];
      const retail = [...new Set(hs.filter(h => RETAIL.test(h)).concat(((v.caption || "").match(/[@#]?[\p{L}\p{N}_.]+/gu) || []).map(x => x.replace(/^[@#]/, "")).filter(h => RETAIL.test(h) && h.length >= 4)))];
      const bookTxt = ((v.caption || "") + " " + (v.ost || []).join(" ")).match(TECH_BOOK);
      TOPIC_RE.lastIndex = 0;
      const named = [...new Set([...((v.caption || "") + " " + (v.ost || []).join(" ")).matchAll(TOPIC_RE)].map(m => m[1].toLowerCase()))];
      // kênh công nghệ: hashtag tên hãng/sản phẩm (#iphone, #samsung) chỉ là chủ đề, trừ khi có thêm dấu hiệu booking
      const topicOnly = techCh ? known.filter(h => TOPIC.has(brandOf(h)) && !RETAIL.test(h)) : [];
      const known2 = known.filter(h => !topicOnly.includes(h) && !RETAIL.test(h));
      const cue = camp.length || tail.length || retail.length || bookTxt || known2.length;
      if (retail.length) v.brand_src.push("nhắc / tag nhà bán lẻ " + retail.slice(0, 2).join(", "));
      if (bookTxt) v.brand_src.push("caption có lời kiểu booking «" + bookTxt[0].trim() + "»");
      if (known2.length) v.brand_src.push("hashtag brand " + known2.slice(0, 3).map(h => "#" + h).join(" "));
      if (topicOnly.length && cue) v.brand_src.push("hashtag hãng " + topicOnly.slice(0, 3).map(h => "#" + h).join(" "));
      if (camp.length) v.brand_src.push("hashtag kiểu chiến dịch " + camp.slice(0, 3).map(h => "#" + h).join(" "));
      if (tail.length) v.brand_src.push("hashtag lạ kiểu tag brand " + tail.slice(0, 3).map(h => "#" + h).join(" "));
      // nhắc tên hãng / sản phẩm mà không có dấu hiệu booking: ghi lại để AI soi thêm, không gắn Brand
      v.product = cue ? [] : [...new Set(named.concat(topicOnly.map(h => h.toLowerCase())))].slice(0, 4);
      v.brand_tags = known.concat(camp, tail);
    }
    const medErClean = median(rows.filter(v => !v.is_ad_flag && !v.declared && v.er != null).map(v => v.er)) || 0;
    for (const v of rows) {
      if (!v.is_ad_flag || v.declared || v.mark === "organic") continue;
      // Dữ liệu công khai không tách được "viral thật nhưng có cờ" với "chạy ads mà nội dung vẫn hay" (đều tương tác tốt)
      // → mặc định PAID cho an toàn; người dùng biết clip không chạy ads thì đánh dấu organic.
      v.ad_low_er = v.er == null || !medErClean || v.er <= 0.6 * medErClean;
      v.declared = true; v.flag_paid = true;
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
      // 1b. Caption tag tài khoản brand: TikTok xác nhận là tổ chức (isOrganization) → gần như chắc là hợp tác có trả tiền
      const acc = v.ment_acc || {};
      const brands = Object.keys(acc).filter(x => x !== me && acc[x].org);
      const bizTag = Object.keys(acc).filter(x => x !== me && !acc[x].org && acc[x].biz);
      if (brands.length) v.brand_src.push(`tag tài khoản brand ${brands.slice(0, 3).map(x => "@" + x).join(", ")}`);
      else if (bizTag.length) sig.push([0.5, `caption tag tài khoản business ${bizTag.slice(0, 3).map(x => "@" + x).join(", ")}`]);
      // Kiểm trên kênh thật: isAd bật cả ở clip vài nghìn view, nhất là clip gắn TikTok Shop → nghĩa là clip được đưa vào
      // quảng cáo (thường là quảng cáo tự động cho clip bán hàng), không cho biết bao nhiêu view đến từ ads. Cần thêm dấu hiệu khác.
      if (!v.lite) {
        // 2. Tài khoản doanh nghiệp / tài khoản được tag vào comment
        const ment = new Set(replyFree(v).map(x => String(x).toLowerCase()).filter(x => x && x !== me));
        const all = (v.comments || []).flatMap(c => [c, ...(c.reply_list || [])]);
        // Chỉ tài khoản doanh nghiệp (TikTok xác minh) mới là dấu hiệu ads. Creator được tag rồi vào comment là collab, không phải ads.
        const bizSet = new Set(all.filter(c => c.by && c.biz && c.by.toLowerCase() !== me).map(c => c.by.toLowerCase()));
        const bizBy = [...bizSet].map(x => "@" + x);
        if (bizBy.length) sig.push([1.5, `tài khoản doanh nghiệp ${bizBy.slice(0, 3).join(", ")} vào comment${[...bizSet].some(x => ment.has(x)) ? " (cũng là tài khoản được tag trong caption)" : ""}`]);
        // 3. Người xem nhắc tới quảng cáo
        const talk = (v.comments || []).filter(c => AD_TALK.test(c.text)).length;
        if (talk >= 2) sig.push([talk >= 4 ? 1.5 : 1, `${talk} comment nhắc tới quảng cáo, tài trợ`]);
        // 4. View cao mà người xem thờ ơ
        if (rows.length >= 8 && v.views >= 3 * medAll && v.er != null) {
          if (v.er <= 0.5 * medErAll && (v.cmt_r || 0) <= 0.5 * medCmtAll) sig.push([medShareAll && v.share_r != null && v.share_r <= 0.5 * medShareAll ? 2 : 1.5, `view gấp ${(v.views / medAll).toFixed(1).replace(".", ",")} lần clip thường, nhưng tỉ lệ người xem có like, comment, share chỉ bằng ${frac(v.er / (medErAll || 1))} mức thường của kênh`]);
          else if (medShareAll && v.share_r != null && v.share_r <= 0.3 * medShareAll) sig.push([1, `view gấp ${(v.views / medAll).toFixed(1).replace(".", ",")} lần clip thường, nhưng gần như không ai share`]);
        }
        // 5. Dấu vết thương mại (yếu, chỉ cộng thêm)
        if ([...ment].some(x => bizSet.has(x))) sig.push([0.5, "caption tag tài khoản doanh nghiệp"]);
        if (v.shop) sig.push([0.5, "gắn giỏ hàng / sản phẩm"]);
        if (SALE_CTA.test(v.caption || "")) sig.push([0.5, "caption kiểu bán hàng"]);
      }
      { const biz = new Set((v.comments || []).flatMap(c => [c, ...(c.reply_list || [])]).filter(c => c.biz && c.by).map(c => c.by.toLowerCase()));
        v.collab = [...new Set(replyFree(v).map(x => String(x).toLowerCase()).filter(x => x && x !== me && !biz.has(x) && !(acc[x] && acc[x].org)))]; }
      v.ad_score = sig.reduce((a, x) => a + x[0], 0);
      v.ad_reasons = sig.sort((a, b) => b[0] - a[0]).map(x => x[1]);
      v.suspect = !v.declared && v.mark !== "organic" && v.ad_score >= 2;
      v.paid_src = v.mark === "paid" ? "bạn xác nhận" : !v.declared ? "" : v.flag_paid ? (v.ad_low_er ? `TikTok gắn cờ quảng cáo, tương tác chỉ bằng ${v.er != null && medErClean ? frac(v.er / medErClean) : "–"} mức thường: view chủ yếu đến từ ads` : "TikTok gắn cờ quảng cáo, nhưng tương tác vẫn tự nhiên: có thể chỉ chạy ít, hoặc clip vốn đã hay") : v.paid_flags.length ? "nhãn quảng cáo trong dữ liệu TikTok (" + v.paid_flags.join(", ") + ")" : "creator tự ghi trong caption";
      v.kind = v.declared ? "PAID" : v.suspect ? "NGHI ADS" : "ORGANIC";
      v.brand = v.brand_src.length > 0;
    }
    const org = rows.filter(v => v.kind === "ORGANIC" && !v.isNew);
    const baseOrganic = org.length >= 5;
    let base = baseOrganic ? org : rows.filter(v => !v.isNew);
    if (!base.length) base = rows;
    const med = median(base.map(v => v.views)) || 1;
    // Mức chuẩn cuốn chiếu: mỗi clip so với median ~20 clip organic đăng gần nó nhất (trước + sau), tránh thiên lệch khi kênh đang lên/xuống.
    // Kênh dưới 10 clip organic thì dùng median chung.
    const ROLL = 20, MIN_BASE = 10;
    const baseByTs = base.filter(v => v.ts).sort((a, b) => a.ts - b.ts);
    const rollMed = v => {
      if (!v.ts || baseByTs.length < MIN_BASE) return med;
      const pick = baseByTs.filter(x => x.id !== v.id).sort((a, b) => Math.abs(a.ts - v.ts) - Math.abs(b.ts - v.ts)).slice(0, ROLL);
      return median(pick.map(x => x.views)) || med;
    };
    rows.forEach(v => { v.base_views = rollMed(v); v.x_med = v.views / v.base_views; });
    const n = base.length, byX = [...base].sort((a, b) => b.x_med - a.x_med), cut = Math.max(1, Math.round(n * 0.1));
    const top = new Set(byX.slice(0, cut).map(v => v.id));
    const win = new Set(base.filter(v => v.x_med >= 3 || (top.has(v.id) && v.x_med >= 2)).map(v => v.id));
    const flop = new Set(base.filter(v => n >= 5 && v.x_med <= 0.4).map(v => v.id));
    const ers = base.filter(v => v.er != null).map(v => v.er).sort((a, b) => a - b);
    const erCut = ers.length >= 5 ? ers[Math.floor(ers.length * 0.8)] : null;
    const medShare = median(base.filter(v => v.share_r != null).map(v => v.share_r));
    const baseIds = new Set(base.map(v => v.id)), viral = new Set();
    for (const v of rows) {
      if (v.isNew) { v.label = "MỚI"; v.er_high = false; continue; }
      if (v.kind !== "ORGANIC" && baseOrganic) { v.label = v.kind; v.er_high = false; continue; }
      if (baseIds.has(v.id) && v.x_med >= 5 && (!followers || v.views >= followers) && (v.share_r == null || medShare == null || v.share_r >= medShare)) { viral.add(v.id); v.label = "VIRAL"; v.super = v.x_med >= 10 || (followers > 0 && v.views >= 5 * followers); }
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
      kind: group(v => [v.kind === "ORGANIC" && v.brand ? "CÓ BRAND" : v.kind], ["ORGANIC", "CÓ BRAND", "PAID", "NGHI ADS"], 2, rows.filter(v => !v.isNew)),
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
      n: rows.length, base_n: n, conc: (() => { const vs = base.filter(v => !v.pinned).map(v => v.views).sort((a, b) => b - a), tt = vs.reduce((a, b) => a + b, 0), k = Math.max(1, Math.round(vs.length * 0.1)); return vs.length >= 10 && tt ? vs.slice(0, k).reduce((a, b) => a + b, 0) / tt : null; })(), reach: followers ? med / followers : null, thin_base: n < MIN_BASE, super_viral: rows.filter(v => v.super).length, base_organic: baseOrganic, med_views: med,
      mean_views: views.reduce((a, b) => a + b, 0) / views.length, max_views: Math.max(...views), min_views: Math.min(...views),
      med_er: median(base.filter(v => v.er != null).map(v => v.er)), med_share: medShare,
      med_save: median(base.filter(v => v.save_r != null).map(v => v.save_r)),
      share_bench: bench, med_cmt: median(base.filter(v => v.cmt_r != null).map(v => v.cmt_r)),
      is_ad_flag: rows.filter(v => v.is_ad_flag).length,
      first: ts.length ? Math.min(...ts) : null, last: ts.length ? Math.max(...ts) : null,
      per_week: span >= 7 ? Math.round(tl.length / (span / 7) * 10) / 10 : null, pinned: rows.filter(v => v.pinned).length,
      viral: viral.size, win: [...win].filter(id => !viral.has(id)).length, flop: flop.size,
      new: rows.filter(v => v.isNew).length, organic: rows.filter(v => v.kind === "ORGANIC").length,
      paid: rows.filter(v => v.kind === "PAID").length, brand: rows.filter(v => v.brand).length, suspect: rows.filter(v => v.kind === "NGHI ADS").length,
      shop: rows.filter(v => v.shop).length, deep: rows.filter(v => !v.lite && !v.thin).length, full: rows.filter(v => !v.lite).length,
      with_transcript: rows.filter(v => v.transcript).length, comments_got: rows.reduce((a, v) => a + (v.comments || []).filter(c => String(c.by || "").toLowerCase() !== String(v.channel || "").toLowerCase()).length, 0),
      own_cmts: rows.reduce((a, v) => a + (v.comments || []).filter(c => c.by && String(c.by).toLowerCase() === String(v.channel || "").toLowerCase()).length, 0),
    };
    return { rows, summary, tables };
  }


  /* ---------- Kê đơn: giải pháp rút thẳng từ số liệu, chỉ đưa khi đủ bằng chứng ---------- */
  function prescribe(a) {
    const { rows, summary: s, tables: t } = a, out = [];
    if (!rows || !rows.length) return out;
    // nói bằng lời thay cho "1,5×": gấp X lần / chỉ bằng Y% / ngang
    const Vs = v => v == null ? "–" : v >= 1.15 ? `gấp ${(Math.round(v * 10) / 10).toString().replace(".", ",")} lần` : v <= 0.87 ? `chỉ bằng ${Math.round(v * 100)}%` : "ngang";
    const V = v => v == null ? "–" : Vs(v) + " mức thường";
    const P = (v, d = 1) => (v * 100).toFixed(d).replace(".", ",") + "%";
    const day = v => { if (!v.ts) return ""; const d = new Date(v.ts * 1000); return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + String(d.getFullYear()).slice(2); };
    const cap = v => { const c = String(v.caption || v.vtt || "").replace(/#\S+/g, "").replace(/\s+/g, " ").trim(); return c.length > 54 ? c.slice(0, 54) + "…" : c || "(không caption)"; };
    const ref = v => `“${cap(v)}” (${day(v)}, view ${Vs(v.x_med)})`;
    const org = rows.filter(v => v.kind === "ORGANIC" && !v.isNew && !v.pinned);
    if (org.length < 6) return [{ k: "data", score: 9, t: "Chưa đủ dữ liệu để kê đơn", d: `Mới có ${org.length} clip organic đủ ${NEW_DAYS} ngày. Quét rộng khoảng ngày hơn hoặc chờ kênh đăng thêm.` }];
    // 1. Nhân bản clip thắng
    const wins = org.filter(v => v.label === "WIN" || v.label === "VIRAL").sort((a, b) => b.x_med - a.x_med);
    if (wins.length >= 2) out.push({ k: "win", score: 8, t: "Làm tiếp kiểu clip đang thắng",
      d: `${wins.length} clip vượt hẳn mặt bằng. Mổ 3 clip đầu: hook, đề tài, format giống nhau ở đâu, rồi làm thêm 3–5 clip cùng công thức: ${wins.slice(0, 3).map(ref).join(" · ")}.` });
    // 2. Đăng lại clip khán giả mê mà thuật toán bỏ qua
    const sleepers = org.filter(v => v.er_high && (v.label === "ỔN" || v.label === "FLOP")).sort((a, b) => b.er - a.er);
    if (sleepers.length >= 2) out.push({ k: "er", score: 7, t: "Đăng lại clip bị ngủ quên, thay hook",
      d: `${sleepers.length} clip ai xem cũng tương tác mạnh nhưng không được đẩy. Nội dung ổn, 3 giây đầu chưa giữ được người lướt. Giữ ruột, quay lại câu mở: ${sleepers.slice(0, 3).map(v => `${ref(v)}, tương tác ${P(v.er)}`).join(" · ")}.` });
    // 3. Độ dài
    const dur = (t.duration || []).filter(g => g.n >= 4 && g.med_x != null);
    if (dur.length >= 2) {
      const best = [...dur].sort((a, b) => b.med_x - a.med_x)[0], most = [...dur].sort((a, b) => b.n - a.n)[0], tot = dur.reduce((a, g) => a + g.n, 0);
      if (best.key !== most.key && best.med_x >= most.med_x * 1.4) out.push({ k: "dur", score: 6 + Math.min(2, best.med_x / most.med_x - 1),
        t: `Dồn về clip ${best.key}`, d: `Clip ${best.key} có view ${V(best.med_x)} (${best.n} clip). Clip ${most.key} view ${V(most.med_x)} mà đang chiếm ${Math.round(most.n / tot * 100)}% số clip.` });
    }
    // 4. Giờ đăng
    const cells = []; ((t.heat || {}).rows || []).forEach(r => r.cells.forEach((c, i) => { if (c.n >= 3 && c.x != null) cells.push({ day: r.day, hour: t.heat.hours[i], n: c.n, x: c.x }); }));
    if (cells.length >= 3) {
      const best = [...cells].sort((a, b) => b.x - a.x)[0], most = [...cells].sort((a, b) => b.n - a.n)[0];
      if (best.x >= 1.3 && (best.day !== most.day || best.hour !== most.hour) && best.x >= most.x * 1.4) out.push({ k: "time", score: 5 + Math.min(2, best.x / most.x - 1),
        t: `Thử đăng vào ${best.day}, ${best.hour}`, d: `Khung này view ${V(best.x)} (${best.n} clip). Hiện kênh đăng nhiều nhất vào ${most.day} ${most.hour} (${most.n} clip), view ${V(most.x)}. Chuyển vài clip sang ${best.day} ${best.hour} trong 3–4 tuần rồi khám lại.` });
    }
    // 5. Chủ đề
    const top = (t.topic || []).filter(g => g.n >= 3 && g.med_x != null);
    if (top.length >= 2) {
      const hi = top[0], lo = top[top.length - 1];
      if (hi.med_x >= 1.5) out.push({ k: "topic", score: 5.5, t: `Đẩy mạnh chủ đề ${hi.key}`, d: `TikTok xếp ${hi.n} clip vào “${hi.key}”, view ${V(hi.med_x)}.${lo.med_x <= 0.7 && lo.key !== hi.key ? ` Ngược lại “${lo.key}” view ${V(lo.med_x)} (${lo.n} clip): bớt, hoặc đổi góc kể.` : ""}` });
    }
    // 6. Share
    if (s.med_share != null && s.share_bench && s.med_share < s.share_bench.rate * 0.8) {
      const sh = org.filter(v => v.share_r != null).sort((a, b) => b.share_r - a.share_r).slice(0, 2);
      out.push({ k: "share", score: 6, t: "Làm clip để người ta gửi cho nhau",
        d: `Share/view ${P(s.med_share, 2)}, dưới mốc ${P(s.share_bench.rate, 2)} của ${s.share_bench.tier}. Share là tín hiệu TikTok dùng để đẩy ra ngoài tệp fan. Cần nhiều clip kiểu “gửi cho đứa bạn”: tình huống ai cũng từng gặp, mẹo dùng được ngay.${sh.length ? ` Clip được share nhiều nhất: ${sh.map(v => `${ref(v)}, share ${P(v.share_r, 2)}`).join(" · ")}.` : ""}` });
    }
    // 7. Phụ thuộc vài clip nổ
    const vs = org.map(v => v.views).sort((a, b) => b - a), tot = vs.reduce((a, b) => a + b, 0), k = Math.max(1, Math.round(vs.length * 0.1));
    const conc = tot ? vs.slice(0, k).reduce((a, b) => a + b, 0) / tot : 0;
    if (vs.length >= 10 && conc >= 0.6) out.push({ k: "conc", score: 6.5, t: "Bớt sống nhờ vài clip nổ",
      d: `${k} clip (10% số clip) gánh ${Math.round(conc * 100)}% tổng view organic. Phần còn lại view thấp và không đều. Ưu tiên một format lặp lại được (series, chuyên mục cố định) để nâng mặt bằng, thay vì chờ clip nổ tiếp.` });
    // 8. Flop nhiều
    const fl = org.filter(v => v.label === "FLOP");
    if (fl.length >= 3 && fl.length / org.length >= 0.3) out.push({ k: "flop", score: 5, t: "Cắt bớt kiểu clip hay hụt",
      d: `${Math.round(fl.length / org.length * 100)}% clip organic là FLOP. Xem điểm chung của nhóm này trước khi đăng tiếp: ${fl.sort((a, b) => a.x_med - b.x_med).slice(0, 3).map(ref).join(" · ")}.` });
    // 9. Nhịp đăng
    if (s.per_week != null && s.per_week < 2) out.push({ k: "freq", score: 4.5, t: "Đăng đều hơn", d: `${String(s.per_week).replace(".", ",")} clip/tuần là thưa, thuật toán khó học được tệp người xem. Thử 3–4 clip/tuần trong 4 tuần rồi khám lại.` });
    // 10. Ads gánh view
    const kd = Object.fromEntries((t.kind || []).map(g => [g.key, g]));
    if (kd.PAID && kd.ORGANIC && kd.PAID.n >= 3 && kd.PAID.n >= 0.25 * (kd.PAID.n + kd.ORGANIC.n)) out.push({ k: "paid", score: 4, t: "Tách bạch view organic với view ads",
      d: `${kd.PAID.n} clip chạy ads, chiếm ${Math.round(kd.PAID.n / (kd.PAID.n + kd.ORGANIC.n) * 100)}% số clip. Đọc độ khoẻ của kênh qua clip organic, đừng nhìn tổng view.` });
    return out.sort((a, b) => b.score - a.score).slice(0, 5);
  }

  /* ---------- lọc comment khi xuất ---------- */
  const norm = t => String(t || "").replace(/@\S+/g, " ").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim().toLowerCase();
  const isNoise = t => { const n = norm(t); return !n || /^((ha|he|hi|hj|hihi|kk|k|z|kaka|keke)+\s*)+$/.test(n); };
  // ký tự vô hình / ô trống mà spam hay dùng (braille trống, hangul filler, zero-width…)
  const INVIS = /[\u2800\u3164\uFFA0\u115F\u1160\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF\u00AD\u034F\u17B4\u17B5\u180E]/g;
  const clean = t => { t = String(t || "").replace(INVIS, " ").replace(/\s+/g, " ").trim(); return t.length > 300 ? t.slice(0, 300) + "…" : t; };
  function pickComments(cm, cap, owner) {
    const out = [], seen = new Map(), short = new Map(); let dropped = 0;
    const me = String(owner || "").toLowerCase();
    const own = me ? (cm || []).filter(c => String(c.by || "").toLowerCase() === me).map(c => clean(c.text)) : [];
    if (me) cm = (cm || []).filter(c => String(c.by || "").toLowerCase() !== me);
    cm = (cm || []).map(c => ({ ...c, text: clean(c.text), reply_list: (c.reply_list || []).map(r => ({ ...r, text: clean(r.text) })) }));
    for (const c0 of cm) {
      const k = norm(c0.text);
      if (isNoise(c0.text)) { dropped++; continue; }
      if (k.split(" ").length <= 2 && !((c0.reply_list || []).length || c0.replies)) { short.set(k, (short.get(k) || 0) + 1); continue; }
      if (seen.has(k)) { const s = seen.get(k); s.dup = (s.dup || 1) + 1; continue; }
      const c = { ...c0, reply_list: (c0.reply_list || []).filter(r => !isNoise(r.text)) };
      seen.set(k, c); out.push(c);
    }
    return { list: cap ? out.slice(0, cap) : out, dropped, shorts: [...short].sort((a, b) => b[1] - a[1]), total: out.length, own };
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
      `- Trung vị: tương tác/view ${p_(s.med_er)} · share/view ${p_(s.med_share, 2)} · save/view ${p_(s.med_save, 2)} · comment/view ${p_(s.med_cmt, 2)}`,
      ...(s.med_share != null ? [`- Mốc share/view tham khảo cho ${s.share_bench.tier}: ${p_(s.share_bench.rate, 2)} (số liệu bên thứ ba, chỉ để định hướng) → kênh này ${s.med_share >= s.share_bench.rate * 1.2 ? "**được share nhiều hơn mặt bằng**" : s.med_share <= s.share_bench.rate * 0.8 ? "**được share ít hơn mặt bằng**" : "ngang mặt bằng"}. TikTok coi xem hết và share là tín hiệu mạnh; follower không phải yếu tố trực tiếp.`] : []),
      ...((meta.fhist || []).length >= 2 ? [(() => { const h = meta.fhist, a = h[0], b = h[h.length - 1], d = b[1] - a[1]; return `- Follower qua các lần quét: ${n_(a[1])} (${date_(a[0])}) → ${n_(b[1])} (${date_(b[0])}) · ${d >= 0 ? "+" : ""}${n_(d)} trong ${Math.max(1, Math.round((b[0] - a[0]) / 86400))} ngày`; })()] : []),
      `- Loại clip: ${s.organic} organic · ${s.brand} clip có brand (brand deal) · ${s.paid} clip chạy ads · ${s.suspect} nghi chạy ads · ${s.shop} clip gắn giỏ hàng / sản phẩm`,
      `- ${s.viral} clip VIRAL · ${s.win} clip WIN · ${s.flop} clip FLOP · ${s.new} clip MỚI (chưa đủ ${NEW_DAYS} ngày) · ${s.with_transcript}/${s.deep} clip đọc comment có phụ đề · ${n_(s.comments_got)} comment của khán giả đã lấy${s.own_cmts ? ` (bỏ ${s.own_cmts} comment của chính kênh)` : ""}`,
      "", "**Cách gắn nhãn** (đã tính sẵn, không cần tính lại):",
            "- **×TV** = view của clip ÷ view trung vị của ~20 clip organic đăng cùng giai đoạn (gần nhất trước và sau nó), nên kênh đang lên hay đang xuống vẫn so công bằng.",
      "- **WIN** = ≥ 3×TV, hoặc ≥ 2×TV và thuộc 10% clip vượt chuẩn mạnh nhất. **FLOP** = ≤ 0,4×TV. Còn lại **ỔN**.",
      "- **VIRAL** = ≥ 5×TV **và** view ≥ số follower của kênh (đã lan ra ngoài tệp fan), share/view không thấp hơn mức thường. **SIÊU VIRAL** = VIRAL và ≥ 10×TV hoặc view ≥ 5 lần follower. VIRAL tính riêng, không đếm vào WIN.",
      ...(s.thin_base ? [`- ⚠️ **Mẫu mỏng:** chỉ có ${s.base_n} clip organic đủ ${NEW_DAYS} ngày để làm chuẩn (cần ≥ 10). Nhãn chỉ để tham khảo, đừng kết luận chắc.`] : []),
      `- **MỚI** = đăng chưa tới ${NEW_DAYS} ngày, view còn đang lên → không chấm win/flop, không tính vào mức chuẩn.`,
      "- **ER cao** = tương tác/view thuộc top 20% kênh dù view không nổi → khán giả thích nhưng chưa được đẩy rộng.",
      "- Tương tác = (like + comment + share + save) / view. Mọi clip đều đủ số liệu; comment, reply và phụ đề chỉ đọc ở các clip đại diện (mục D4).",
      "- Clip được đọc comment là clip đại diện: nhiều view nhất, ít view nhất, mới nhất và rải đều ở giữa.",
      "- **brand** = nội dung có brand (brand deal): creator công bố hợp tác (#hoptaccung…, #taitro, #ad…, nhãn hợp tác của TikTok), dùng hashtag chiến dịch của brand (#NuocMamCHINSU…), hoặc tag tài khoản brand. View vẫn là organic nếu không chạy ads, nên clip brand vẫn được chấm VIRAL/WIN/FLOP như thường. Nên so riêng clip brand với clip thường: brand có làm kênh mất chất không.",
      "- **PAID** = đã chạy ads: TikTok gắn cờ quảng cáo cho clip (lý do ghi rõ tương tác thấp hẳn hay vẫn tự nhiên), hoặc người dùng tool xác nhận. TikTok không công khai clip nào được boost (kể cả Spark Ads brand chạy bằng mã của creator), và view từ ads được cộng thẳng vào clip.",
      "- **collab @x** = caption tag một creator khác (không phải tài khoản doanh nghiệp): clip hợp tác giữa 2 creator, view có thể đến từ tệp fan của người kia. Không tính là ads.",
      "- **NGHI ADS** = không ai khai nhưng cộng đủ dấu hiệu: view vẫn tăng đều khi clip đã cũ, tài khoản doanh nghiệp (TikTok xác minh) vào comment, người xem nhắc tới quảng cáo, view cao mà tương tác thấp, dấu vết bán hàng. Là suy luận, mỗi clip kèm lý do. **Khi phân tích: đừng coi clip NGHI ADS là bằng chứng content tốt.**",
      "- " + (s.base_organic ? `Mức chuẩn ×TV và nhãn WIN/FLOP chỉ tính trên clip **ORGANIC** đã đăng ≥ ${NEW_DAYS} ngày; clip PAID / NGHI ADS được so riêng.` : "Kênh có quá ít clip organic nên mức chuẩn tính trên toàn bộ clip."), "");
    const rx = prescribe({ rows, summary: s, tables: t });
    if (rx.length) o.push("## D1b. Kê đơn của tool", "", "_Rút thẳng từ số liệu bằng luật đơn giản. AI kiểm lại bằng transcript + comment ở mục G: đồng ý, bác bỏ, hoặc đào sâu._", "", ...rx.map((r, i) => `${i + 1}. **${r.t}.** ${r.d}`), "");
    const D = dig({ rows }, meta && meta.handle);
    if (D.asks.length || D.series.length || D.rising.length || D.hook.length || D.booking.x != null || D.fans.n || D.cadence.length >= 2) {
      o.push("## D1c. Đào sâu của tool", "");
      if (D.asks.length) { o.push(`### Khán giả đang hỏi (${D.asked} câu hỏi, từ ${D.deep} clip đã đọc comment)`, "", "_Câu hỏi lặp lại = đề tài clip tiếp theo khán giả đã đặt sẵn._", "");
        D.asks.forEach(g => { o.push(`- **${g.name}** · ${g.n} câu · ${n_(g.likes)} like`); g.items.slice(0, 3).forEach(c => o.push(`  - «${c.text}» [${n_(c.likes)} like${c.answered ? " · kênh đã trả lời" : ""}] — dưới clip “${c.v.cap}” (${c.v.day})`)); }); o.push(""); }
      if (D.series.length) { o.push("### Series (clip có đánh số phần)", "");
        D.series.forEach(z => o.push(`- “${z.name}”: ` + z.parts.map(p => `P${p.part} ${n_(p.views)} (${x_(p.x)})`).join(" → ") + (z.keep != null ? (z.keep >= 1 ? ` · phần cuối gấp ${x_(z.keep).replace("×", " lần")} view phần đầu` : ` · phần cuối còn ${Math.round(z.keep * 100)}% view so với phần đầu`) : ""))); o.push(""); }
      if (D.rising.length) { o.push("### Clip cũ đang lên lại (so 2 lần quét gần nhất)", "");
        D.rising.slice(0, 5).forEach(r => o.push(`- “${r.cap}” (đăng ${r.day}, ${r.age} ngày trước): +${n_(r.gain)} view, khoảng ${n_(Math.round(r.perDay))} view/ngày${r.speed >= 1.2 ? `, nhanh gấp ${x_(r.speed).replace("×", " lần")} trước đó` : ""}${r.kind !== "ORGANIC" ? ` · ${r.kind}` : ""}`)); o.push(""); }
      if (D.booking.x != null) { const b = D.booking, r = b.x / b.xb; o.push(`### Clip booking so với clip thường (${b.n} clip có brand, ${b.nb} clip thường, không tính clip chạy ads)`, "",
        `- View (×TV trung vị): ${x_(b.x)} so với ${x_(b.xb)} → ${r >= 1.15 ? "booking vẫn ăn hơn" : r <= 0.85 ? "booking tụt view" : "ngang nhau"}`,
        `- Tương tác: ${p_(b.er)} so với ${p_(b.erb)} · Share/view: ${p_(b.sh, 2)} so với ${p_(b.shb, 2)}`,
        `- Booking ăn nhất: ` + b.best.map(v => `“${v.cap}” (${v.day}, ${x_(v.x)})`).join(" · "), `- Booking kém nhất: ` + b.worst.map(v => `“${v.cap}” (${v.day}, ${x_(v.x)})`).join(" · "), ""); }
      if (D.fans.n) o.push(`### Fan ruột (comment ở ≥ ${D.fans.min} clip, trong ${D.fans.deep} clip đã đọc comment)`, "", `- ${D.fans.n} người / ${D.fans.users} người comment · ${Math.round(D.fans.share * 100)}% comment đến từ họ`, ...D.fans.top.map(f => `- @${f.u}: ${f.clips} clip, ${f.cm} comment`), "");
      if (D.cadence.length >= 2) o.push(`### Nhịp đăng (khoảng cách tới clip trước · ~${String(Math.round(D.perWeek * 10) / 10).replace(".", ",")} clip/tuần trong 8 tuần gần nhất)`, "", ...D.cadence.map(g => `- ${g.name}: ${g.n} clip · ×TV trung vị ${x_(g.x)} · ${g.win} win/viral`), "");
      if (D.hook.length) { o.push(`### Công thức hook (so ×TV trung vị, ${D.base} clip organic)`, "");
        D.hook.forEach(f => o.push(`- ${f.name}: ${x_(f.ma)} (${f.na} clip) so với ${x_(f.mb)} khi không có (${f.nb} clip) → ${f.r >= 1 ? "đi cùng clip ăn hơn" : "đi cùng clip kém hơn"}`)); o.push("", "_Tương quan, chưa phải nhân quả: AI kiểm lại bằng transcript ở mục G._", ""); }
    }
    o.push("## D2. Bảng toàn bộ clip (mới → cũ)", "",
      "| # | Ngày | Dài | View | ×TV | Nhãn | Tương tác | Share | Save | Cmt | Hook / caption |", "|---|---|---|---|---|---|---|---|---|---|---|");
    rows.forEach((v, i) => {
      v._i = i + 1;
      const lab = (v.super ? "SIÊU VIRAL" : v.label) + (v.er_high ? " · ER cao" : "") + (v.shop ? " · giỏ hàng" : "") + (v.brand ? " · brand" : "") + (v.collab && v.collab.length ? " · collab " + v.collab.slice(0, 2).map(x => "@" + x).join(" ") : "") + (v.is_ad_flag && v.kind === "ORGANIC" ? " · cờ ads" : "") + (v.pinned ? " · ghim" : "");
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
      o.push("## D3b. Clip nghi chạy ads và lý do", "", "_Gồm cả clip chưa đọc comment (dấu hiệu view tăng đều lấy từ các lần quét)._", "");
      sus.sort((a, b) => b.ad_score - a.ad_score).forEach(v => o.push(`- ${date_(v.ts)} · ${n_(v.views)} view · ${v.url} — ${v.ad_reasons.join("; ")}`));
      o.push("");
    }
    const ord = { VIRAL: 0, WIN: 1, FLOP: 2, "ỔN": 3, PAID: 4, "NGHI ADS": 5, "MỚI": 6 };
    o.push("## D4. Chi tiết từng clip", "", "_Gồm các clip đã đọc comment và phụ đề. Thứ tự: VIRAL → WIN → FLOP → ỔN → PAID → NGHI ADS → MỚI. Số # khớp với bảng ở mục D2._", "");
    [...rows].filter(v => !v.lite && !v.thin).sort((a, b) => (ord[a.label] - ord[b.label]) || (b.x_med - a.x_med)).forEach(v => {
      const hot = ["VIRAL", "WIN", "FLOP", "PAID", "NGHI ADS"].includes(v.label) || v.er_high;
      o.push(`### #${v._i} · ${v.super ? "SIÊU VIRAL" : v.label}${v.er_high ? " · ER cao" : ""} · ${x_(v.x_med)} · ${date_(v.ts, true)}`, `- Link: ${v.url}`,
        `- View ${n_(v.views)} · Like ${n_(v.likes)} · Cmt ${n_(v.comments_count)} · Share ${n_(v.shares)} · Save ${n_(v.saves)}` +
        (v.duration ? ` · Dài ${v.duration}s` : "") + (v.wpm ? ` · nói ~${v.wpm} từ/phút` : ""));
      if ((v.hashtags || []).length) o.push("- Hashtag: " + v.hashtags.map(x => "#" + x).join(" "));
      if (v.music) o.push(`- Âm thanh: ${v.music}${v.original_sound ? " (gốc)" : ""}`);
      if (v.kind !== "ORGANIC" || v.shop) {
        const sig = [];
        if (v.declared) sig.push(v.paid_src === "bạn xác nhận" ? "người dùng tool xác nhận đã chạy ads" : v.paid_src);
        if (!v.declared) sig.push(...(v.ad_reasons || []));
        o.push(`- Loại: **${v.kind}** · dấu hiệu: ${sig.join("; ")}`);
      }
      if (v.brand) o.push(`- Có brand: ${v.brand_src.join("; ")}`);
      else if ((v.product || []).length) o.push(`- Nhắc tên hãng / sản phẩm: ${v.product.join(", ")} (chưa thấy dấu hiệu booking: AI soi transcript xem có lời cảm ơn hãng, được gửi máy, mã giảm giá…)`);
      if ((v.labels || []).length || (v.kw || []).length) o.push(`- TikTok xếp vào: ${(v.labels || []).join(", ") || "–"}${(v.kw || []).length ? " · từ khoá gợi ý: " + v.kw.join(", ") : ""}`);
      o.push(`- Caption: ${v.caption || "(trống)"}`);
      let tr = v.transcript || "";
      if (tr && !hot && trOk) { const w = tr.split(/\s+/); tr = w.slice(0, trOk).join(" ") + (w.length > trOk ? " …(rút gọn)" : ""); }
      o.push(`- Transcript (phụ đề tự động, có thể sai chính tả): ${tr || "(không có phụ đề: clip không có lời nói, hoặc TikTok chưa tạo phụ đề)"}`);
      if ((v.ost || []).length) o.push(`- Chữ trên màn hình (gõ bằng công cụ Text của TikTok): ${v.ost.slice(0, 8).map(t => "«" + t + "»").join(" · ")}`);
      if (v.ocr) o.push(`- Chữ trên ảnh bìa (tool đọc bằng OCR, có thể sai chữ/dấu): «${v.ocr}»`);
      const P = pickComments(v.comments, hot ? capHot : capOk, h);
      if (P.own.length) o.push(`- Kênh tự comment dưới clip (không tính là khán giả): ${P.own.slice(0, 3).map(t => "«" + t + "»").join(" · ")}`);
      if (P.list.length || P.shorts.length) {
        o.push(`- Comment của khán giả, xếp theo like (${P.list.length}/${P.total} comment có ý${P.dropped ? `, bỏ ${P.dropped} comment chỉ emoji/cười` : ""}):`);
        P.list.forEach(c => {
          o.push(`  - [${n_(c.likes)} like${c.replies ? ` · ${c.replies} trả lời` : ""}${c.dup ? ` · ${c.dup} người viết y vậy` : ""}] ${c.text}`);
          (capRep ? c.reply_list.slice(0, capRep) : c.reply_list).forEach(r => o.push(`    - ↳ ${r.by_creator ? "**creator trả lời** " : ""}[${n_(r.likes)} like] ${r.text}`));
        });
        if (P.shorts.length) o.push(`  - Comment 1–2 chữ (${P.shorts.reduce((a, x) => a + x[1], 0)}): ` + P.shorts.slice(0, 20).map(([k, c]) => `«${k}»${c > 1 ? " ×" + c : ""}`).join(" · "));
      } else o.push("- Comment của khán giả: (không có)");
      o.push("");
    });
    const rest = rows.filter(v => v.thin && (v.caption || "").length > 70);
    if (rest.length) {
      o.push("## D5. Caption đầy đủ của các clip còn lại", "", "_Clip có đủ số liệu nhưng chưa đọc comment; bảng D2 cắt caption ở 70 ký tự._", "");
      rest.forEach(v => o.push(`- #${v._i} · ${v.label} · ${x_(v.x_med)}: ${v.caption.replace(/\n/g, " ")}`));
      o.push("");
    }
    return o.join("\n").trim() + "\n";
  }

  /* ---------- Đào sâu: câu hỏi của khán giả · series · clip đang lên lại · công thức hook ---------- */
  function dig(a, handle) {
    const rows = (a && a.rows) || [], me = String(handle || (rows[0] && rows[0].channel) || "").toLowerCase();
    const X = v => (v == null ? "–" : v.toFixed(1).replace(".", ",") + "×");
    const day = v => { if (!v.ts) return ""; const d = new Date(v.ts * 1000); return String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0") + "/" + String(d.getFullYear()).slice(2); };
    const cap = (v, n = 48) => { const c = String(v.caption || "").replace(/#\S+/g, "").replace(/\s+/g, " ").trim() || String(v.hook || "").trim(); return c.length > n ? c.slice(0, n) + "…" : c || "(không caption)"; };
    const lc = t => String(t || "").toLowerCase().normalize("NFC");

    // 1. Khán giả đang hỏi gì → đề tài clip tiếp theo
    // từ khoá có ranh giới từ (tránh "bao giờ" khớp "áo gì", "top 1" khớp "p1")
    const W = src => new RegExp("(?<![\\p{L}\\p{N}])(?:" + src + ")(?![\\p{L}\\p{N}])", "iu");
    const ASK = [
      ["next", "Đòi phần tiếp", W("(?:phần|tập|part|p)\\s*\\d{1,2}|phần (?:sau|tiếp|tiếp theo|2)|tập (?:sau|tiếp)|ra tiếp|làm tiếp|tiếp đi|kể tiếp|hóng phần|chờ phần|còn nữa (?:không|ko|k)")],
      ["how", "Hỏi cách làm", W("làm sao|làm thế nào|làm như nào|cách nào|cách làm|hướng dẫn|chỉ (?:mình|em|tui|tôi|t|e) (?:với|cách|đi|nha)|học ở đâu|bắt đầu từ đâu|bắt đầu như nào|nên học|nên bắt đầu|cần học|học gì|học những gì|cần những gì|cần gì để")],
      ["buy", "Hỏi mua, giá, địa chỉ", W("giá bao nhiêu|bao nhiêu tiền|giá sao|mua ở đâu|mua sao|xin link|link mua|shop nào|địa chỉ|ở đâu vậy|ở đâu thế|ở đâu ạ|quán nào|chỗ nào")],
      ["name", "Hỏi tên nhạc, đồ, app", W("tên (?:bài|nhạc|app|sản phẩm|món|phim|quán|sách)|nhạc gì|bài gì|app gì|áo gì|son gì|máy gì|phim gì|sách gì|dùng gì|xài gì|tên gì")],
    ];
    // chỉ tính là "hỏi" khi câu thật sự là câu hỏi / lời xin: có dấu ?, từ để hỏi, hoặc lời nhờ
    const ASKY = W("làm sao|như nào|thế nào|ở đâu|bao nhiêu|là gì|gì vậy|gì thế|gì ạ|nào vậy|nào ạ|ai biết|có ai|cho (?:mình|em|tui|t|tôi|e) hỏi|xin (?:link|tên|cách|info|in4)|chỉ (?:mình|em|tui|tôi|t|e)|hướng dẫn (?:mình|em|tui|đi|với)|được không|đc không|đc k|được k|không ạ|ko ạ|vậy ạ|hả|nhỉ|chưa ạ");
    const isQ = t => /\?/.test(t) || ASKY.test(t);
    const groups = {}; ASK.forEach(([k, name]) => groups[k] = { k, name, n: 0, likes: 0, items: [] }); groups.other = { k: "other", name: "Câu hỏi khác", n: 0, likes: 0, items: [] };
    const seen = new Set(); let asked = 0;
    for (const v of rows) for (const c of v.comments || []) {
      const by = String(c.by || "").toLowerCase(); if (me && by === me) continue;
      const t = String(c.text || "").replace(/\s+/g, " ").trim(), l = lc(t); if (t.length < 8 || t.length > 220) continue;
      const key = l.replace(/[^\p{L}\p{N} ]/gu, "").replace(/\s+/g, " ").trim(); if (!key || seen.has(key)) continue;
      const lq = l.replace(/["“”«»][^"“”«»]{0,80}["“”«»]/g, " ");   // bỏ đoạn trích trong ngoặc kép: người ta đang kể, không phải hỏi
      const realQ = (lq.includes("?") && (lq.split("?").pop().match(/\p{L}+/gu) || []).length <= 3) || ASKY.test(lq);   // dấu ? phải nằm ở câu cuối
      let g = null; for (const [k, , re] of ASK) if (re.test(lq) && (k === "next" || realQ)) { g = k; break; }
      if (!g && realQ && t.split(" ").length >= 4) g = "other";
      if (!g) continue; seen.add(key); asked++;
      const G = groups[g]; G.n++; G.likes += c.likes || 0; G.items.push({ text: t, likes: c.likes || 0, replies: c.replies || 0, answered: (c.reply_list || []).some(r => r.by_creator), v: { id: v.id, url: v.url, cap: cap(v, 36), day: day(v) } });
    }
    const asks = Object.values(groups).filter(g => g.n).map(g => ({ ...g, items: g.items.sort((a, b) => b.likes - a.likes).slice(0, 5) }))
      .sort((a, b) => (a.k === "other") - (b.k === "other") || b.likes + b.n * 3 - (a.likes + a.n * 3));
    const deep = rows.filter(v => (v.comments || []).length).length;

    // 2. Series: clip có đánh số phần (P1, Phần 2, Tập 3, Part 4, #5…)
    const PART = /(?:^|[\s\-–|:(\[])(?:p|ph[aầ]n|t[aậ]p|part|pt|kỳ|k[iì])\s*\.?\s*(\d{1,3})(?![\d/.,:%kK])/i;
    const ser = {};
    for (const v of rows) {
      const src = String(v.caption || "") + " " + (v.ost || []).join(" ") + " " + (v.ocr || "");
      const m = src.match(PART); if (!m) continue;
      const part = +m[1]; if (!part || part > 200) continue;
      const before = String(v.caption || "").slice(0, Math.max(0, (v.caption || "").search(PART)));
      let base = lc(before || v.caption || "").replace(/#\S+/g, "").replace(/[^\p{L}\p{N} ]/gu, " ").replace(/\s+/g, " ").trim().split(" ").slice(0, 6).join(" ");
      if (!base) base = lc((v.hashtags || [])[0] || "khác");
      (ser[base] = ser[base] || []).push({ part, v });
    }
    // gộp các khoá series gần giống (một khoá là đầu của khoá kia)
    const keys = Object.keys(ser).sort((a, b) => a.length - b.length);
    for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
      const A = keys[i], B = keys[j]; if (!ser[A] || !ser[B]) continue;
      if (A.split(" ").length >= 2 && B.startsWith(A)) { ser[A].push(...ser[B]); delete ser[B]; }
    }
    // gộp tiếp series đổi tên giữa chừng ("10 ngày thoát ế cùng NVHL" / "10 ngày thoát ế của Niềm Vui Hoa Lá"):
    // chung ≥ 3 từ đầu (hoặc ≥ 60% số từ) và số phần gần như không trùng nhau → cùng một series
    const ws = k => k.split(" ").filter(Boolean), head = (a, b) => { let n = 0; while (n < a.length && n < b.length && a[n] === b[n]) n++; return n; };
    for (let merged = true; merged;) {
      merged = false; const ks = Object.keys(ser);
      for (let i = 0; i < ks.length && !merged; i++) for (let j = i + 1; j < ks.length && !merged; j++) {
        const A = ks[i], B = ks[j], wa = ws(A), wb = ws(B), common = wa.filter(w => wb.includes(w)).length;
        const near = head(wa, wb) >= 3 || (Math.min(wa.length, wb.length) >= 3 && common / Math.max(wa.length, wb.length) >= 0.6);
        const pa = new Set(ser[A].map(x => x.part)), clash = ser[B].filter(x => pa.has(x.part)).length;
        if (near && clash <= 1) { ser[A].push(...ser[B]); delete ser[B]; merged = true; }
      }
    }
    const series = Object.entries(ser).map(([k, list]) => {
      const byPart = {}; list.forEach(x => { if (!byPart[x.part] || (x.v.views || 0) > (byPart[x.part].v.views || 0)) byPart[x.part] = x; });
      const parts = Object.values(byPart).sort((a, b) => a.part - b.part).map(x => ({ part: x.part, id: x.v.id, url: x.v.url, views: x.v.views, x: x.v.x_med, label: x.v.label, day: day(x.v), isNew: !!x.v.isNew }));
      if (parts.length < 2) return null;
      const first = parts[0], last = parts.filter(p => !p.isNew).slice(-1)[0] || parts[parts.length - 1];
      const keep = first.views ? last.views / first.views : null;
      return { name: cap(list.sort((a, b) => a.part - b.part)[0].v, 44), parts, keep, avgX: parts.reduce((s, p) => s + (p.x || 0), 0) / parts.length };
    }).filter(Boolean).sort((a, b) => b.parts.length - a.parts.length || b.avgX - a.avgX).slice(0, 5);

    // 3. Clip cũ đang lên lại: view tăng mạnh giữa 2 lần quét gần nhất dù đã đăng lâu
    const now = Date.now() / 1000, rising = [];
    for (const v of rows) {
      const h = (v.hist || []).filter(x => Array.isArray(x)); if (h.length < 2 || !v.ts) continue;
      const [t1, a1] = h[h.length - 2], [t2, a2] = h[h.length - 1], dd = (t2 - t1) / 86400, age = (now - v.ts) / 86400;
      if (age < 14 || dd < 0.5 || a2 <= a1) continue;
      const gain = a2 - a1, perDay = gain / dd, grow = gain / Math.max(1, a1);
      const life = (a1) / Math.max(1, (t1 - v.ts) / 86400);   // view/ngày trung bình trước đó
      if (gain >= 1000 && grow / dd >= 0.03 && perDay >= 150) rising.push({ id: v.id, url: v.url, cap: cap(v), day: day(v), age: Math.round(age), gain, perDay, grow, speed: life ? perDay / life : null, views: a2, x: v.x_med, kind: v.kind });
    }
    rising.sort((a, b) => b.perDay - a.perDay);
    const scans = Math.max(0, ...rows.map(v => (v.hist || []).length));

    // 4. Công thức hook: đặc điểm nào đi cùng clip ăn view (so ×TV trung vị có / không có đặc điểm)
    const org = rows.filter(v => v.kind === "ORGANIC" && !v.isNew && !v.pinned && v.x_med != null);
    const med = xs => { const s = xs.slice().sort((a, b) => a - b), n = s.length; return n ? (n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2) : null; };
    const hookTxt = v => String((v.transcript || "").split(/\s+/).slice(0, 25).join(" ") || (v.ost || []).join(" ") || v.ocr || v.caption || "");
    const F = [
      ["Có chữ trên màn hình / ảnh bìa", v => !!((v.ost || []).length || v.ocr)],
      ["Có lời nói (phụ đề)", v => !!v.transcript],
      ["Mở đầu bằng câu hỏi", v => { const t = hookTxt(v).trim(); return /^(t[aạ]i sao|v[iì] sao|l[aà]m sao|c[oó] ai|b[aạ]n c[oó]|bao nhi[eê]u|c[aá]i g[iì]|ai )/i.test(t) || /\?/.test(t.split(/\s+/).slice(0, 15).join(" ")); }],
      ["Mở đầu có con số", v => /\d/.test(hookTxt(v).split(/\s+/).slice(0, 10).join(" "))],
      ["Nói nhanh (≥ 180 từ/phút)", v => v.wpm != null && v.wpm >= 180, v => v.wpm != null],
      ["Caption ngắn (≤ 60 ký tự)", v => String(v.caption || "").replace(/#\S+/g, "").trim().length <= 60],
      ["Dùng nhiều hashtag (≥ 5)", v => (v.hashtags || []).length >= 5],
      ["Dùng âm thanh gốc", v => !!v.original_sound, v => !!v.music],
      ["Clip dưới 30 giây", v => v.duration && v.duration < 30, v => !!v.duration],
      ["Clip trên 90 giây", v => v.duration && v.duration > 90, v => !!v.duration],
      ["Post ảnh", v => !!v.is_photo],
    ];
    const hook = [];
    for (const [name, has, ok] of F) {
      const pool = org.filter(v => !ok || ok(v)), A = pool.filter(has), B = pool.filter(v => !has(v));
      if (A.length < 3 || B.length < 3) continue;
      const ma = med(A.map(v => v.x_med)), mb = med(B.map(v => v.x_med)); if (!ma || !mb) continue;
      const r = ma / mb, wa = A.filter(v => v.label === "WIN" || v.label === "VIRAL").length / A.length, wb = B.filter(v => v.label === "WIN" || v.label === "VIRAL").length / B.length;
      if (r >= 1.25 || r <= 0.8) hook.push({ name, r, na: A.length, nb: B.length, ma, mb, wa, wb });
    }
    hook.sort((a, b) => Math.abs(Math.log(b.r)) - Math.abs(Math.log(a.r)));
    // 5. Booking có làm tụt view? So clip có brand với clip thường (bỏ clip chạy ads: view của ads là mua)
    const pool = rows.filter(v => !v.isNew && !v.pinned && !v.gone && v.x_med != null && v.kind !== "PAID" && v.kind !== "NGHI ADS");
    const mk = (xs, k) => med(xs.map(v => v[k]).filter(x => x != null));
    const bA = pool.filter(v => v.brand), bB = pool.filter(v => !v.brand);
    const brief = v => ({ id: v.id, url: v.url, cap: cap(v, 40), day: day(v), x: v.x_med, tag: (v.brand_tags || [])[0] || "" });
    const booking = { n: bA.length, nb: bB.length };
    if (bA.length >= 3 && bB.length >= 5) Object.assign(booking, {
      x: mk(bA, "x_med"), xb: mk(bB, "x_med"), er: mk(bA, "er"), erb: mk(bB, "er"), sh: mk(bA, "share_r"), shb: mk(bB, "share_r"),
      best: bA.slice().sort((a, b) => b.x_med - a.x_med).slice(0, 2).map(brief), worst: bA.slice().sort((a, b) => a.x_med - b.x_med).slice(0, 2).map(brief) });

    // 6. Fan ruột: người comment ở nhiều clip khác nhau (chỉ tính trên các clip đã đọc comment)
    const deepRows = rows.filter(v => (v.comments || []).length), fm = {}; let totC = 0;
    for (const v of deepRows) {
      const inClip = new Set();
      for (const c of v.comments || []) {
        const u = String(c.by || "").toLowerCase(); if (u === me && u) continue; totC++; if (!u) continue;
        const f = fm[u] = fm[u] || { u, clips: 0, cm: 0, likes: 0 }; f.cm++; f.likes += c.likes || 0;
        if (!inClip.has(u)) { inClip.add(u); f.clips++; }
      }
    }
    const minC = deepRows.length >= 20 ? 3 : 2, fl = Object.values(fm).filter(f => f.clips >= minC).sort((a, b) => b.clips - a.clips || b.cm - a.cm);
    const fans = { deep: deepRows.length, users: Object.keys(fm).length, min: minC, n: fl.length, share: totC ? fl.reduce((a, f) => a + f.cm, 0) / totC : 0, top: fl.slice(0, 5) };

    // 7. Nhịp đăng: khoảng cách tới clip đăng ngay trước (tính mọi clip) ảnh hưởng view thế nào
    const byT = rows.filter(v => v.ts).sort((a, b) => a.ts - b.ts), gapOf = {};
    for (let i = 1; i < byT.length; i++) gapOf[byT[i].id] = (byT[i].ts - byT[i - 1].ts) / 3600;
    const GB = [["Dưới 12 giờ", 0, 12], ["12–36 giờ", 12, 36], ["1,5–3 ngày", 36, 72], ["Trên 3 ngày", 72, 1e9]];
    const cadence = GB.map(([name, lo, hi]) => { const vs = pool.filter(v => gapOf[v.id] != null && gapOf[v.id] >= lo && gapOf[v.id] < hi); return { name, n: vs.length, x: mk(vs, "x_med"), win: vs.filter(v => v.label === "WIN" || v.label === "VIRAL").length }; }).filter(g => g.n >= 3);
    const perWeek = (() => { const recent = byT.filter(v => v.ts >= (byT.length ? byT[byT.length - 1].ts : 0) - 56 * 86400); return recent.length / 8; })();

    return { asks, asked, deep, series, rising, scans, hook: hook.slice(0, 6), base: org.length, booking, fans, cadence, perWeek };
  }
  G.TTI = { dig, mergeItems, shareBench, analyze, buildMd, plan, snap, applyMarks, idOf, rangeBounds, rangeLabel, filterRange, RANGE_NAMES, mergeLinks, prescribe, videoFrom, kNum, idTs, cleanVtt, pickComments, NEW_DAYS };
})(window);
