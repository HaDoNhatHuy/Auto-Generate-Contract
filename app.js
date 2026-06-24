// ─── Tab switching ───────────────────────────────────────
let currentTab = 'hdnt';
function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach((b, i) =>
    b.classList.toggle('active', ['hdnt', 'hdmb'][i] === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
}

// ─── Product rows ────────────────────────────────────────
function addProductRow() {
  const tbody = document.getElementById('product-rows');
  const idx = tbody.children.length + 1;
  const tr = document.createElement('tr');
  tr.dataset.idx = idx;
  tr.innerHTML =
    '<td class="col-stt" style="text-align:center;color:var(--text-secondary);font-size:12px">' + idx + '</td>' +
    '<td><input type="text" placeholder="Tên sơn…" oninput="recalc()"></td>' +
    '<td><input type="text" placeholder="Mã sơn…"></td>' +
    '<td><input type="number" min="0" step="any" placeholder="0" oninput="recalc()"></td>' +
    '<td><input type="number" min="0" step="any" placeholder="0" oninput="recalc()"></td>' +
    '<td><input type="text" readonly style="background:var(--tag-bg);cursor:default" placeholder="Tự tính"></td>' +
    '<td class="col-del"><button class="del-row-btn" onclick="delRow(this)" title="Xóa dòng">&#x2715;</button></td>';
  tbody.appendChild(tr);
  recalc();
}

function delRow(btn) {
  btn.closest('tr').remove();
  reindex();
  recalc();
}

function reindex() {
  document.querySelectorAll('#product-rows tr').forEach((tr, i) => {
    tr.querySelector('td.col-stt').textContent = i + 1;
  });
}

function recalc() {
  let totalQty = 0, totalAmt = 0;
  document.querySelectorAll('#product-rows tr').forEach(tr => {
    const cells = tr.querySelectorAll('input');
    const qty = parseFloat(cells[2].value) || 0;
    const price = parseFloat(cells[3].value) || 0;
    const amt = qty * price;
    cells[4].value = amt > 0 ? fmtNum(amt) : '';
    totalQty += qty;
    totalAmt += amt;
  });
  const vatRate = getVatRate();
  const tax = Math.round(totalAmt * vatRate / 100);
  const grand = totalAmt + tax;
  document.getElementById('sum-qty').textContent = totalQty > 0 ? fmtNum(totalQty) : '—';
  document.getElementById('sum-tax').textContent = totalAmt > 0 ? fmtNum(tax) : '—';
  document.getElementById('sum-total').textContent = totalAmt > 0 ? fmtNum(grand) : '—';
  const words = document.getElementById('mb-tien-chu');
  if (words) words.value = totalAmt > 0 ? moneyToWords(grand) : '';
}

function fmtNum(n) {
  return n.toLocaleString('vi-VN');
}

function getVatRate() {
  const raw = v('mb-vat-rate').replace('%', '').replace(',', '.');
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 10;
}

function fmtVatRate(rate) {
  return Number(rate || 0).toLocaleString('vi-VN', {
    maximumFractionDigits: 2
  }) + '%';
}

// ─── Custom fields ────────────────────────────────────────
function addCustomField(type) {
  const list = document.getElementById(type + '-custom-list');
  const row = document.createElement('div');
  row.className = 'custom-field-row';
  row.innerHTML =
    '<input type="text" placeholder="Tên trường (ví dụ: PhiVanChuyen)">' +
    '<input type="text" placeholder="Giá trị">' +
    '<button class="del-custom-btn" onclick="this.closest(\'.custom-field-row\').remove()" title="Xóa">&#x2715;</button>';
  list.appendChild(row);
}

function getCustomFields(type) {
  const fields = {};
  document.querySelectorAll('#' + type + '-custom-list .custom-field-row').forEach(row => {
    const inputs = row.querySelectorAll('input');
    const key = inputs[0].value.trim().toUpperCase().replace(/\s+/g, '_');
    const val = inputs[1].value.trim();
    if (key) fields[key] = val;
  });
  return fields;
}

// ─── Helper ──────────────────────────────────────────────
function v(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function parseDateParts(value) {
  value = String(value || '').trim();
  var match = value.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (match) {
    return {
      d: match[1].padStart(2, '0'),
      m: match[2].padStart(2, '0'),
      y: match[3]
    };
  }

  match = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    return {
      d: match[3].padStart(2, '0'),
      m: match[2].padStart(2, '0'),
      y: match[1]
    };
  }

  return null;
}

function dateValueToDisplay(value) {
  var p = parseDateParts(value);
  return p ? p.d + '/' + p.m + '/' + p.y : '';
}

function openDatePicker(id) {
  var picker = document.getElementById(id);
  if (!picker) return;
  if (typeof picker.showPicker === 'function') {
    try {
      picker.showPicker();
      return;
    } catch (err) {}
  }
  picker.focus();
  picker.click();
}

function syncDateDisplay(id) {
  var picker = document.getElementById(id);
  var display = document.getElementById(id + '-display');
  if (!picker || !display) return;
  display.value = dateValueToDisplay(picker.value);
}

function fmtDate(value) {
  var p = parseDateParts(value);
  if (!p) return 'ngày ___ tháng ___ năm ____';
  return 'ngày ' + p.d + ' tháng ' + p.m + ' năm ' + p.y;
}

function fmtDateShort(value) {
  var p = parseDateParts(value);
  if (!p) return '31 tháng 12 năm ____';
  return p.d + ' tháng ' + p.m + ' năm ' + p.y;
}

function readThreeDigits(num, full) {
  var digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  var hundred = Math.floor(num / 100);
  var ten = Math.floor((num % 100) / 10);
  var unit = num % 10;
  var words = [];

  if (hundred > 0 || full) {
    words.push(digits[hundred] + ' trăm');
  }
  if (ten > 1) {
    words.push(digits[ten] + ' mươi');
    if (unit === 1) words.push('mốt');
    else if (unit === 5) words.push('lăm');
    else if (unit > 0) words.push(digits[unit]);
  } else if (ten === 1) {
    words.push('mười');
    if (unit === 5) words.push('lăm');
    else if (unit > 0) words.push(digits[unit]);
  } else if (unit > 0) {
    if (hundred > 0 || full) words.push('lẻ');
    words.push(digits[unit]);
  }

  return words.join(' ');
}

function numberToVietnameseWords(value) {
  var n = Math.round(Math.abs(Number(value) || 0));
  if (n === 0) return 'không';

  var units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  var groups = [];
  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }

  var parts = [];
  for (var i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    var full = i < groups.length - 1;
    var text = readThreeDigits(groups[i], full);
    if (units[i]) text += ' ' + units[i];
    parts.push(text);
  }
  return parts.join(' ');
}

function moneyToWords(value) {
  var words = numberToVietnameseWords(value);
  return upperFirst(words) + ' đồng chẵn./.';
}

function getProducts() {
  const rows = [];
  document.querySelectorAll('#product-rows tr').forEach((tr, i) => {
    const inputs = tr.querySelectorAll('input');
    const qty = parseFloat(inputs[2].value) || 0;
    const price = parseFloat(inputs[3].value) || 0;
    rows.push({
      stt: i + 1,
      ten: inputs[0].value.trim(),
      ma: inputs[1].value.trim(),
      sl: qty,
      dongia: price,
      thanhtien: qty * price
    });
  });
  return rows;
}

// ─── Data collectors ─────────────────────────────────────
function getHDNTData() {
  return {
    soHD:      v('nt-so-hd')       || '___/HĐNT/____',
    ngayKy:    fmtDate(v('nt-ngay-ky')),
    ngayHetHL: fmtDateShort(v('nt-ngay-het-hl')),
    bTen:      v('nt-b-ten')       || '[TÊN CÔNG TY BÊN MUA]',
    bMST:      v('nt-b-mst')       || '[MST]',
    bDiaChi:   v('nt-b-diachi')    || '[ĐỊA CHỈ]',
    bDT:       v('nt-b-dt')        || '[ĐIỆN THOẠI]',
    bSTK:      v('nt-b-stk')       || '[SỐ TÀI KHOẢN]',
    bNganHang: v('nt-b-nganhang')  || '[NGÂN HÀNG]',
    bDaiDien:  v('nt-b-daidien')   || '[HỌ TÊN]',
    bChucVu:   v('nt-b-chucvu')    || '[CHỨC VỤ]',
    baoBi:     v('nt-bao-bi')      || '[QUY CÁCH ĐÓNG GÓI]',
    tgGiao:    v('nt-tg-giao')     || '[THỜI GIAN GIAO HÀNG]',
    ddGiao:    v('nt-dd-giao')     || '[ĐỊA ĐIỂM GIAO HÀNG]',
    thanhToan: v('nt-thanh-toan')  || '[ĐIỀU KHOẢN THANH TOÁN]',
    custom:    getCustomFields('nt')
  };
}

function getHDMBData() {
  const prods = getProducts();
  let totalQty = 0, totalAmt = 0;
  prods.forEach(p => { totalQty += p.sl; totalAmt += p.thanhtien; });
  const vatRate = getVatRate();
  const tax = Math.round(totalAmt * vatRate / 100);
  const grand = totalAmt + tax;
  return {
    soHD:      v('mb-so-hd')       || '___/HĐMB/____',
    ngayKy:    fmtDate(v('mb-ngay-ky')),
    bTen:      v('mb-b-ten')       || '[TÊN CÔNG TY BÊN MUA]',
    bMST:      v('mb-b-mst')       || '[MST]',
    bDiaChi:   v('mb-b-diachi')    || '[ĐỊA CHỈ]',
    bDT:       v('mb-b-dt')        || '[ĐIỆN THOẠI]',
    bSTK:      v('mb-b-stk')       || '[SỐ TÀI KHOẢN]',
    bNganHang: v('mb-b-nganhang')  || '[NGÂN HÀNG]',
    bDaiDien:  v('mb-b-daidien')   || '[HỌ TÊN]',
    bChucVu:   v('mb-b-chucvu')    || '[CHỨC VỤ]',
    prods,
    tongSL:    totalQty,
    tongHang:  totalAmt,
    vatRate:   vatRate,
    vatLabel:  fmtVatRate(vatRate),
    thue:      tax,
    tongCong:  grand,
    tienChu:   totalAmt > 0 ? moneyToWords(grand) : '[SỐ TIỀN BẰNG CHỮ]',
    tgGiao:    v('mb-tg-giao')     || '[THỜI GIAN GIAO HÀNG]',
    ddGiao:    v('mb-dd-giao')     || '[ĐỊA ĐIỂM GIAO HÀNG]',
    thanhToan: v('mb-thanh-toan')  || '[ĐIỀU KHOẢN THANH TOÁN]',
    thanhLy:   v('mb-thanh-ly')    || 'Hợp đồng được thanh lý khi hai bên hoàn thành xong quyền và nghĩa vụ theo quy định hợp đồng.',
    custom:    getCustomFields('mb')
  };
}

// ─── Preview HTML ─────────────────────────────────────────
function ph(text) {
  return '<span class="ph">' + text + '</span>';
}

function buildHDNTPreview(d) {
  var customHTML = '';
  var keys = Object.keys(d.custom);
  if (keys.length > 0) {
    customHTML = '<p class="clause-title" style="margin-top:16px">THÔNG TIN BỔ SUNG</p>';
    keys.forEach(function(k) {
      customHTML += '<p>- ' + k + ': ' + ph(d.custom[k]) + '</p>';
    });
  }

  return '<div class="preview-doc">' +
    '<p class="doc-title">HỢP ĐỒNG NGUYÊN TẮC</p>' +
    '<p class="doc-number">Số: ' + ph(d.soHD) + '</p>' +
    '<p class="doc-subtitle"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>Độc lập – Tự do – Hạnh phúc</p>' +
    '<p><em>Hôm nay, <strong>' + ph(d.ngayKy) + '</strong>, tại Thành Phố Hồ Chí Minh chúng tôi gồm:</em></p><br>' +
    '<p><strong>BÊN BÁN: CÔNG TY TNHH SƠN HẢI VÂN</strong></p>' +
    '<p>- Địa chỉ: 45/5 Phạm Viết Chánh, Phường Cầu Ông Lãnh, TP Hồ Chí Minh, Việt Nam</p>' +
    '<p>- Số điện thoại: 0703220606 &nbsp;&nbsp;&nbsp;&nbsp; Email: info@sonhaivan.com</p>' +
    '<p>- Mã số thuế: 0306051611</p>' +
    '<p>- Số tài khoản: 31010000664973 – NH Đầu tư & Phát triển VN – CN TP HCM</p>' +
    '<p>- Đại diện: Ông <strong>NGUYỄN HỮU KHÁNH</strong> &nbsp;&nbsp; Chức vụ: <strong>Giám đốc</strong></p><br>' +
    '<p><strong>BÊN MUA: ' + ph(d.bTen) + '</strong></p>' +
    '<p>- Địa chỉ: ' + ph(d.bDiaChi) + '</p>' +
    '<p>- Điện thoại: ' + ph(d.bDT) + '</p>' +
    '<p>- Số tài khoản: ' + ph(d.bSTK) + '</p>' +
    '<p>- Ngân hàng: ' + ph(d.bNganHang) + '</p>' +
    '<p>- Mã số thuế: ' + ph(d.bMST) + '</p>' +
    '<p>- Đại diện: Ông ' + ph(d.bDaiDien) + ' &nbsp;&nbsp; Chức vụ: <strong>' + ph(d.bChucVu) + '</strong></p><br>' +
    '<p class="clause-title">ĐIỀU 1: HÀNG HÓA, SỐ LƯỢNG, GIÁ CẢ</p>' +
    '<p>- Hàng hóa: các loại sơn mang nhãn hiệu Hải Vân do Công ty Sơn Hải Vân sản xuất.</p>' +
    '<p>- Bao bì đóng gói: thùng tròn ' + ph(d.baoBi) + '</p>' +
    '<p>- Số lượng: theo yêu cầu của bên mua.</p>' +
    '<p>- Giá cả: theo thỏa thuận giữa hai bên tại thời điểm ký kết.</p>' +
    '<p class="clause-title">ĐIỀU 2: PHƯƠNG THỨC GIAO NHẬN</p>' +
    '<p>- Thời gian giao hàng: ' + ph(d.tgGiao) + ' kể từ ngày nhận được đơn đặt hàng chính thức của bên Mua.</p>' +
    '<p>- Địa điểm giao hàng: ' + ph(d.ddGiao) + '</p>' +
    '<p>- Vận chuyển: hàng được vận chuyển bằng xe bên Bán.</p>' +
    '<p class="clause-title">ĐIỀU 3: PHƯƠNG THỨC THANH TOÁN</p>' +
    '<p>3.1 ' + ph(d.thanhToan) + '</p>' +
    '<p class="clause-title">ĐIỀU 8: THỜI HẠN HỢP ĐỒNG</p>' +
    '<p>Hợp đồng có hiệu lực kể từ ngày ký đến hết ngày ' + ph(d.ngayHetHL) + '.</p>' +
    customHTML +
    '<div class="sign-row">' +
      '<div class="sign-col"><p><strong>ĐẠI DIỆN BÊN MUA</strong><br><em>(' + d.bTen + ')</em></p></div>' +
      '<div class="sign-col"><p><strong>ĐẠI DIỆN BÊN BÁN</strong><br><em>(Công ty TNHH Sơn Hải Vân)</em></p></div>' +
    '</div>' +
  '</div>';
}

function buildHDMBPreview(d) {
  var prodRows = d.prods.map(function(p, i) {
    return '<tr><td>' + (i+1) + '</td><td>' + p.ten + '</td><td>' + p.ma + '</td>' +
      '<td>' + (p.sl || '') + '</td>' +
      '<td>' + (p.dongia ? p.dongia.toLocaleString('vi-VN') : '') + '</td>' +
      '<td>' + (p.thanhtien ? p.thanhtien.toLocaleString('vi-VN') : '') + '</td></tr>';
  }).join('');

  var customHTML = '';
  var keys = Object.keys(d.custom);
  if (keys.length > 0) {
    customHTML = '<p class="clause-title" style="margin-top:16px">THÔNG TIN BỔ SUNG</p>';
    keys.forEach(function(k) {
      customHTML += '<p>- ' + k + ': ' + ph(d.custom[k]) + '</p>';
    });
  }

  return '<div class="preview-doc">' +
    '<p class="doc-title">HỢP ĐỒNG MUA BÁN</p>' +
    '<p class="doc-number">Số: ' + ph(d.soHD) + '</p>' +
    '<p class="doc-subtitle"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong><br>Độc lập – Tự do – Hạnh phúc</p>' +
    '<p><em>Hôm nay, <strong>' + ph(d.ngayKy) + '</strong>, tại thành phố Hồ Chí Minh chúng tôi gồm:</em></p><br>' +
    '<p><strong>Bên Bán (bên A): CÔNG TY TNHH SƠN HẢI VÂN</strong></p>' +
    '<p>- Địa chỉ: 45/5 Phạm Viết Chánh, Phường Cầu Ông Lãnh, TP Hồ Chí Minh, Việt Nam</p>' +
    '<p>- Số điện thoại: 0703220606 &nbsp;&nbsp;&nbsp;&nbsp; Email: info@sonhaivan.com</p>' +
    '<p>- Số tài khoản: 3100 664 973 – NH Đầu tư & Phát triển Việt Nam – CN Tp. HCM.</p>' +
    '<p>- Mã số thuế: 0306051611</p>' +
    '<p>- Đại diện: Ông <strong>Nguyễn Hữu Khánh</strong> &nbsp;&nbsp; Chức vụ: <strong>Giám đốc</strong></p><br>' +
    '<p><strong>Bên Mua (bên B): ' + ph(d.bTen) + '</strong></p>' +
    '<p>- Địa chỉ: ' + ph(d.bDiaChi) + '</p>' +
    '<p>- Điện thoại: ' + ph(d.bDT) + '</p>' +
    '<p>- Số tài khoản: ' + ph(d.bSTK) + '</p>' +
    '<p>- Ngân hàng: ' + ph(d.bNganHang) + '</p>' +
    '<p>- Mã số thuế: ' + ph(d.bMST) + '</p>' +
    '<p>- Đại diện: Ông ' + ph(d.bDaiDien) + ' &nbsp;&nbsp; Chức vụ: <strong>' + ph(d.bChucVu) + '</strong></p><br>' +
    '<p class="clause-title">ĐIỀU 1: HÀNG HÓA, SỐ LƯỢNG, GIÁ CẢ</p>' +
    '<table>' +
      '<thead><tr><th>STT</th><th>Tên sơn</th><th>Mã sơn</th><th>Số lượng (Lít)</th><th>Đơn giá (VNĐ/Lít)</th><th>Thành tiền</th></tr></thead>' +
      '<tbody>' + prodRows + '</tbody>' +
      '<tfoot>' +
        '<tr><td colspan="3"><strong>TỔNG</strong></td><td><strong>' + (d.tongSL > 0 ? d.tongSL.toLocaleString('vi-VN') : '') + '</strong></td><td></td><td><strong>' + (d.tongHang > 0 ? d.tongHang.toLocaleString('vi-VN') : '') + '</strong></td></tr>' +
        '<tr><td colspan="5"><strong>THUẾ GTGT ' + d.vatLabel + '</strong></td><td><strong>' + (d.tongHang > 0 ? d.thue.toLocaleString('vi-VN') : '') + '</strong></td></tr>' +
        '<tr><td colspan="5"><strong>TỔNG CỘNG</strong></td><td><strong>' + (d.tongCong > 0 ? d.tongCong.toLocaleString('vi-VN') : '') + '</strong></td></tr>' +
      '</tfoot>' +
    '</table>' +
    '<p><em>Số tiền bằng chữ: ' + ph(d.tienChu) + '</em></p>' +
    '<p class="clause-title">ĐIỀU 2: PHƯƠNG THỨC GIAO NHẬN</p>' +
    '<p>2.1 Thời gian giao hàng: ' + ph(d.tgGiao) + ' kể từ ngày bên A nhận được đơn đặt hàng của bên B.</p>' +
    '<p>2.2 Địa điểm giao hàng: ' + ph(d.ddGiao) + '</p>' +
    '<p>2.3 Vận chuyển: Hàng được vận chuyển bằng xe của bên A.</p>' +
    '<p class="clause-title">ĐIỀU 3: PHƯƠNG THỨC THANH TOÁN</p>' +
    '<p>3.1 ' + ph(d.thanhToan) + '</p>' +
    '<p class="clause-title">ĐIỀU 7: ĐIỀU KHOẢN CHUNG</p>' +
    '<p>7.3 ' + ph(d.thanhLy) + '</p>' +
    customHTML +
    '<div class="sign-row">' +
      '<div class="sign-col"><p><strong>ĐẠI DIỆN BÊN B</strong><br><em>(' + d.bTen + ')</em></p></div>' +
      '<div class="sign-col"><p><strong>ĐẠI DIỆN BÊN A</strong><br><em>(Công ty TNHH Sơn Hải Vân)</em></p></div>' +
    '</div>' +
  '</div>';
}

// ─── Modal ────────────────────────────────────────────────
var activeType = 'hdnt';
function openPreview(type) {
  activeType = type;
  var data = type === 'hdnt' ? getHDNTData() : getHDMBData();
  document.getElementById('modal-title').textContent =
    type === 'hdnt' ? 'Hợp Đồng Nguyên Tắc – Xem trước' : 'Hợp Đồng Mua Bán – Xem trước';
  document.getElementById('modal-body').innerHTML =
    type === 'hdnt' ? buildHDNTPreview(data) : buildHDMBPreview(data);
  document.getElementById('modal-word-btn').onclick = function() { downloadWord(type); };
  document.getElementById('modal-pdf-btn').onclick = function() { downloadPDF(type); };
  document.getElementById('modal-overlay').classList.add('open');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}
function handleOverlayClick(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

// ─── DOCX generation from original Word templates ────────
function safeFileName(value) {
  return String(value || 'HopDong')
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '') || 'HopDong';
}

function saveBlob(blob, filename) {
  if (typeof saveAs === 'function') {
    saveAs(blob, filename);
    return;
  }

  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function b64toAB(b64) {
  var bin = atob(b64);
  var buf = new ArrayBuffer(bin.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i < bin.length; i++) view[i] = bin.charCodeAt(i);
  return buf;
}

var WORD_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
var XML_NS = 'http://www.w3.org/XML/1998/namespace';

function directChildrenByLocalName(node, localName) {
  return Array.prototype.filter.call(node.childNodes, function(child) {
    return child.nodeType === 1 && child.localName === localName;
  });
}

function firstDirectChild(node, localName) {
  return directChildrenByLocalName(node, localName)[0] || null;
}

function attrByLocalName(node, localName) {
  if (!node || !node.attributes) return '';
  for (var i = 0; i < node.attributes.length; i++) {
    if (node.attributes[i].localName === localName) return node.attributes[i].value;
  }
  return '';
}

function runText(run) {
  var pieces = [];
  Array.prototype.forEach.call(run.getElementsByTagNameNS(WORD_NS, '*'), function(node) {
    if (node.localName === 't') pieces.push(node.textContent || '');
    if (node.localName === 'tab') pieces.push('\t');
    if (node.localName === 'br') pieces.push('\n');
  });
  return pieces.join('');
}

function paragraphText(paragraph) {
  var runs = paragraph.getElementsByTagNameNS(WORD_NS, 'r');
  return Array.prototype.map.call(runs, runText).join('');
}

function clearBoldFromNode(node) {
  if (!node) return;
  Array.prototype.slice.call(node.childNodes).forEach(function(child) {
    if (child.nodeType !== 1) return;
    if (child.localName === 'b' || child.localName === 'bCs') {
      node.removeChild(child);
    }
  });
}

function clearBoldFromParagraph(paragraph) {
  var pPr = firstDirectChild(paragraph, 'pPr');
  clearBoldFromNode(firstDirectChild(pPr, 'rPr'));
  Array.prototype.forEach.call(paragraph.getElementsByTagNameNS(WORD_NS, 'r'), function(run) {
    clearBoldFromNode(firstDirectChild(run, 'rPr'));
  });
}

function setParagraphText(doc, paragraph, value, options) {
  var runs = paragraph.getElementsByTagNameNS(WORD_NS, 'r');
  if (!runs.length) {
    var run = doc.createElementNS(WORD_NS, 'w:r');
    paragraph.appendChild(run);
    runs = [run];
  }

  setRunText(doc, runs[0], value);
  clearYellowFromRun(runs[0]);
  for (var i = 1; i < runs.length; i++) {
    setRunText(doc, runs[i], '');
    clearYellowFromRun(runs[i]);
  }
  if (options && options.bold === false) clearBoldFromParagraph(paragraph);
}

function insertParagraphAfter(doc, paragraph, value) {
  var clone = paragraph.cloneNode(true);
  setParagraphText(doc, clone, value);
  if (paragraph.nextSibling) paragraph.parentNode.insertBefore(clone, paragraph.nextSibling);
  else paragraph.parentNode.appendChild(clone);
  return clone;
}

function replaceSellerStaticInfo(doc) {
  var sellerAddress = '45/5 Phạm Viết Chánh, Phường Cầu Ông Lãnh, TP Hồ Chí Minh, Việt Nam';
  var sellerContact = 'Số điện thoại\t: 0703220606\t\tEmail: info@sonhaivan.com';
  var paragraphs = doc.getElementsByTagNameNS(WORD_NS, 'p');

  Array.prototype.forEach.call(paragraphs, function(paragraph) {
    var text = paragraphText(paragraph);
    var key = normalizeKey(text);
    if (key.indexOf('dia chi') !== -1 && key.indexOf('pham viet chanh') !== -1) {
      var prefix = key.indexOf('-') === 0 ? '-\tĐịa chỉ\t: ' : 'Địa chỉ\t: ';
      setParagraphText(doc, paragraph, prefix + sellerAddress, { bold: false });
      return;
    }

    if (key.indexOf('dien thoai') !== -1 && key.indexOf('028.6262.4100') !== -1) {
      setParagraphText(doc, paragraph, (key.indexOf('-') === 0 ? '-\t' : '') + sellerContact, { bold: false });
    }
  });
}

function insertHDNTBuyerBankInfo(doc, d) {
  var paragraphs = doc.getElementsByTagNameNS(WORD_NS, 'p');
  for (var i = 0; i < paragraphs.length; i++) {
    var key = normalizeKey(paragraphText(paragraphs[i]));
    if (key.indexOf('dien thoai') === 0 && key.indexOf('028.6262.4100') === -1) {
      var account = insertParagraphAfter(doc, paragraphs[i], 'Số tài khoản\t: ' + d.bSTK);
      insertParagraphAfter(doc, account, 'Ngân hàng\t: ' + d.bNganHang);
      return;
    }
  }
}

function rPrHasYellow(rPr) {
  if (!rPr) return false;

  var highlights = rPr.getElementsByTagNameNS(WORD_NS, 'highlight');
  for (var i = 0; i < highlights.length; i++) {
    var val = attrByLocalName(highlights[i], 'val').toLowerCase();
    if (val && val !== 'none') return true;
  }

  var shd = rPr.getElementsByTagNameNS(WORD_NS, 'shd');
  for (var j = 0; j < shd.length; j++) {
    var fill = attrByLocalName(shd[j], 'fill').toLowerCase();
    var color = attrByLocalName(shd[j], 'color').toLowerCase();
    if (fill === 'ffff00' || fill === 'yellow' || color === 'ffff00' || color === 'yellow') return true;
  }

  return false;
}

function isYellowRun(run) {
  return rPrHasYellow(firstDirectChild(run, 'rPr'));
}

function paragraphDefaultIsYellow(paragraph) {
  var pPr = firstDirectChild(paragraph, 'pPr');
  if (!pPr) return false;
  return rPrHasYellow(firstDirectChild(pPr, 'rPr'));
}

function normalizeMatch(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

function normalizeKey(value) {
  return normalizeMatch(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0111/g, 'd')
    .replace(/\u0110/g, 'd');
}

function upperFirst(value) {
  value = String(value || '');
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function appendRunContent(doc, run, value) {
  String(value == null ? '' : value).split('\n').forEach(function(line, lineIndex) {
    if (lineIndex) run.appendChild(doc.createElementNS(WORD_NS, 'w:br'));
    line.split('\t').forEach(function(part, partIndex) {
      if (partIndex) run.appendChild(doc.createElementNS(WORD_NS, 'w:tab'));
      if (part) {
        var t = doc.createElementNS(WORD_NS, 'w:t');
        if (/^\s|\s$/.test(part)) t.setAttributeNS(XML_NS, 'xml:space', 'preserve');
        t.textContent = part;
        run.appendChild(t);
      }
    });
  });
}

function setRunText(doc, run, value) {
  var rPr = firstDirectChild(run, 'rPr');
  while (run.firstChild) run.removeChild(run.firstChild);
  if (rPr) run.appendChild(rPr);
  appendRunContent(doc, run, value);
}

function cloneRunProperties(doc, sourceRPr, bold) {
  var clone = sourceRPr ? sourceRPr.cloneNode(true) : doc.createElementNS(WORD_NS, 'w:rPr');
  if (bold) {
    if (!firstDirectChild(clone, 'b')) clone.appendChild(doc.createElementNS(WORD_NS, 'w:b'));
    if (!firstDirectChild(clone, 'bCs')) clone.appendChild(doc.createElementNS(WORD_NS, 'w:bCs'));
  }
  return clone;
}

function setRunSegment(doc, run, sourceRPr, segment) {
  while (run.firstChild) run.removeChild(run.firstChild);
  run.appendChild(cloneRunProperties(doc, sourceRPr, !!segment.bold));
  appendRunContent(doc, run, segment.text);
  clearYellowFromRun(run);
}

function replaceRunsRichText(doc, runs, segments) {
  if (!runs.length || !segments.length) return;
  var first = runs[0];
  var parent = first.parentNode;
  var sourceRPr = firstDirectChild(first, 'rPr');
  runs.slice(1).forEach(function(run) {
    if (run.parentNode) run.parentNode.removeChild(run);
  });

  setRunSegment(doc, first, sourceRPr, segments[0]);
  var anchor = first;
  for (var i = 1; i < segments.length; i++) {
    if (!segments[i].text) continue;
    var run = doc.createElementNS(WORD_NS, 'w:r');
    setRunSegment(doc, run, sourceRPr, segments[i]);
    if (anchor.nextSibling) parent.insertBefore(run, anchor.nextSibling);
    else parent.appendChild(run);
    anchor = run;
  }
}

function clearYellowFromRun(run) {
  var rPr = firstDirectChild(run, 'rPr');
  if (!rPr) return;
  Array.prototype.slice.call(rPr.childNodes).forEach(function(child) {
    if (child.nodeType !== 1) return;
    if (child.localName === 'highlight') rPr.removeChild(child);
    if (child.localName === 'shd') {
      var fill = attrByLocalName(child, 'fill').toLowerCase();
      var color = attrByLocalName(child, 'color').toLowerCase();
      if (fill === 'ffff00' || fill === 'yellow' || color === 'ffff00' || color === 'yellow') {
        rPr.removeChild(child);
      }
    }
  });
}

function replaceRunsText(doc, runs, value) {
  if (!runs.length) return;
  if (value && typeof value === 'object' && Array.isArray(value.segments)) {
    replaceRunsRichText(doc, runs, value.segments);
    return;
  }
  setRunText(doc, runs[0], value);
  clearYellowFromRun(runs[0]);
  for (var i = 1; i < runs.length; i++) {
    setRunText(doc, runs[i], '');
    clearYellowFromRun(runs[i]);
  }
}

function highlightedSpans(paragraph) {
  var spans = [];
  var current = [];
  var runs = paragraph.getElementsByTagNameNS(WORD_NS, 'r');

  Array.prototype.forEach.call(runs, function(run) {
    var text = runText(run);
    if (!text) {
      if (current.length) spans.push(current);
      current = [];
      return;
    }
    if (isYellowRun(run)) {
      current.push(run);
    } else {
      if (current.length) spans.push(current);
      current = [];
    }
  });

  if (current.length) spans.push(current);
  return spans;
}

function replaceHighlightedSpans(doc, replacer) {
  var paragraphs = doc.getElementsByTagNameNS(WORD_NS, 'p');
  var spanIndex = 0;
  Array.prototype.forEach.call(paragraphs, function(paragraph) {
    highlightedSpans(paragraph).forEach(function(runs) {
      var source = runs.map(runText).join('');
      var replacement = replacer(source, spanIndex, paragraph, runs);
      if (replacement != null) replaceRunsText(doc, runs, replacement);
      spanIndex += 1;
    });
  });
}

function clearAllYellow(doc) {
  Array.prototype.forEach.call(doc.getElementsByTagNameNS(WORD_NS, 'r'), clearYellowFromRun);

  Array.prototype.slice.call(doc.getElementsByTagNameNS(WORD_NS, 'highlight')).forEach(function(node) {
    var val = attrByLocalName(node, 'val').toLowerCase();
    if ((val === 'yellow' || val === 'ffff00') && node.parentNode) node.parentNode.removeChild(node);
  });

  Array.prototype.slice.call(doc.getElementsByTagNameNS(WORD_NS, 'shd')).forEach(function(node) {
    var fill = attrByLocalName(node, 'fill').toLowerCase();
    var color = attrByLocalName(node, 'color').toLowerCase();
    if ((fill === 'ffff00' || fill === 'yellow' || color === 'ffff00' || color === 'yellow') && node.parentNode) {
      node.parentNode.removeChild(node);
    }
  });
}

function setCellText(doc, cell, value) {
  var texts = cell.getElementsByTagNameNS(WORD_NS, 't');
  if (texts.length > 0) {
    texts[0].textContent = String(value == null ? '' : value);
    for (var i = 1; i < texts.length; i++) texts[i].textContent = '';
    return;
  }

  var p = cell.getElementsByTagNameNS(WORD_NS, 'p')[0] || doc.createElementNS(WORD_NS, 'w:p');
  if (!p.parentNode) cell.appendChild(p);
  var r = doc.createElementNS(WORD_NS, 'w:r');
  var t = doc.createElementNS(WORD_NS, 'w:t');
  t.textContent = String(value == null ? '' : value);
  r.appendChild(t);
  p.appendChild(r);
}

function updateHDMBTable(xml, d) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) return xml;

  var table = doc.getElementsByTagNameNS(WORD_NS, 'tbl')[0];
  if (!table) return xml;

  var rows = directChildrenByLocalName(table, 'tr');
  if (rows.length < 5) return xml;

  var itemTemplate = rows[1];
  var totalRow = rows[2];
  var taxRow = rows[3];
  var grandRow = rows[4];
  table.removeChild(itemTemplate);

  var products = d.prods.filter(function(p) {
    return p.ten || p.ma || p.sl || p.dongia;
  });
  if (products.length === 0) {
    products = [{ ten: '', ma: '', sl: '', dongia: '', thanhtien: '' }];
  }

  products.forEach(function(p, i) {
    var row = itemTemplate.cloneNode(true);
    var cells = directChildrenByLocalName(row, 'tc');
    setCellText(doc, cells[0], i + 1);
    setCellText(doc, cells[1], p.ten || '');
    setCellText(doc, cells[2], p.ma || '');
    setCellText(doc, cells[3], p.sl ? fmtNum(p.sl) : '');
    setCellText(doc, cells[4], p.dongia ? fmtNum(p.dongia) : '');
    setCellText(doc, cells[5], p.thanhtien ? fmtNum(p.thanhtien) : '');
    table.insertBefore(row, totalRow);
  });

  var totalCells = directChildrenByLocalName(totalRow, 'tc');
  if (totalCells.length >= 6) {
    setCellText(doc, totalCells[3], d.tongSL ? fmtNum(d.tongSL) : '');
    setCellText(doc, totalCells[5], d.tongHang ? fmtNum(d.tongHang) : '');
  }

  var taxCells = directChildrenByLocalName(taxRow, 'tc');
  if (taxCells.length >= 4) {
    setCellText(doc, taxCells[1], 'THUẾ GTGT ' + d.vatLabel);
    setCellText(doc, taxCells[3], d.tongHang ? fmtNum(d.thue) : '');
  }

  var grandCells = directChildrenByLocalName(grandRow, 'tc');
  if (grandCells.length >= 4) {
    setCellText(doc, grandCells[3], d.tongCong ? fmtNum(d.tongCong) : '');
  }

  return new XMLSerializer().serializeToString(doc);
}

function updateHDMBTableDoc(doc, d) {
  var xml = new XMLSerializer().serializeToString(doc);
  var updated = updateHDMBTable(xml, d);
  return new DOMParser().parseFromString(updated, 'application/xml');
}

function replacementForHDNT(d) {
  return function(source) {
    var key = normalizeKey(source);
    if (key.indexOf('so:') === 0) return 'Số: ' + d.soHD;
    if (key.indexOf('ngay ') === 0 && key.indexOf(' thang ') !== -1 && key.indexOf(' nam ') !== -1) {
      return upperFirst(d.ngayKy);
    }
    if (key.indexOf('ben mua thanh toan') === 0) return d.thanhToan;
    if (key.indexOf('hop dong co hieu luc') === 0) {
      return 'Hợp đồng có hiệu lực kể từ ngày ký đến hết ngày ' + d.ngayHetHL + '.';
    }
    if (key.indexOf('ben mua:') === 0) return 'BÊN MUA: \t' + d.bTen;
    if (key.indexOf('dia chi') === 0) return 'Địa chỉ  \t: ' + d.bDiaChi;
    if (key.indexOf('dien thoai') === 0) return 'Điện thoại \t: ' + d.bDT;
    if (key.indexOf('ma so thue') === 0) return 'Mã số thuế\t: ' + d.bMST;
    if (key.indexOf('dai dien') === 0) {
      return {
        segments: [
          { text: 'Đại diện\t\t: ' },
          { text: d.bDaiDien, bold: true },
          { text: '\tChức vụ: ' },
          { text: d.bChucVu, bold: true }
        ]
      };
    }
    if (key.indexOf('20 lit') !== -1) return d.baoBi;
    if (key.indexOf('tu 1 den 5 ngay') === 0) return d.tgGiao;
    if (key.indexOf('tai kho ben mua') === 0) return d.ddGiao;
    return null;
  };
}

function replacementForHDMB(d) {
  return function(source) {
    var key = normalizeKey(source);
    if (key.indexOf('so:') === 0) return 'Số: ' + d.soHD;
    if (key.indexOf('ngay ') === 0 && key.indexOf(' thang ') !== -1 && key.indexOf(' nam ') !== -1) return d.ngayKy;
    if (key.indexOf('ben mua (') === 0) return null;
    if (key.indexOf('ben b thanh toan') === 0) return d.thanhToan;
    if (key.indexOf('hop dong duoc thanh ly') === 0) return d.thanhLy;
    if (key.indexOf('so tien bang chu') !== -1) return 'Số tiền bằng chữ: ' + d.tienChu;
    if (key.indexOf('trong vong') === 0) return d.tgGiao;
    if (key.indexOf('tai vinh long') === 0) return d.ddGiao;
    if (key.indexOf('ten don vi') !== -1) return '-\tTên đơn vị\t:  ' + d.bTen;
    if (key.indexOf('dia chi') !== -1) return '-\tĐịa chỉ\t: ' + d.bDiaChi;
    if (key.indexOf('dien thoai') !== -1) return '- \tĐiện thoại\t:\t' + d.bDT;
    if (key.indexOf('so tai khoan') !== -1) return '-\tSố tài khoản\t: ' + d.bSTK;
    if (key.indexOf('- ngan hang') === 0 || key.indexOf('ngan hang :') === 0 || key.indexOf('ngan hang\t:') === 0) {
      return '-\tNgân hàng\t: ' + d.bNganHang;
    }
    if (key.indexOf('ma so thue') !== -1) return '-\tMã số thuế\t: ' + d.bMST;
    if (key.indexOf('dai dien') !== -1) {
      return {
        segments: [
          { text: '-\tĐại diện\t\t: ' },
          { text: d.bDaiDien, bold: true },
          { text: '\t\tChức vụ: ' },
          { text: d.bChucVu, bold: true }
        ]
      };
    }
    return null;
  };
}

async function buildDocx(type) {
  if (typeof JSZip === 'undefined') {
    throw new Error('Chưa tải được thư viện JSZip. Hãy kiểm tra kết nối mạng hoặc mở lại trang.');
  }
  if (!window.TEMPLATES || !window.TEMPLATES[type]) {
    throw new Error('Không tìm thấy file mẫu Word nhúng trong templates.js.');
  }

  var zip = await JSZip.loadAsync(b64toAB(window.TEMPLATES[type]));
  var xml = await zip.file('word/document.xml').async('string');
  var doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) {
    throw new Error('Không đọc được cấu trúc XML của file mẫu Word.');
  }

  replaceSellerStaticInfo(doc);

  if (type === 'hdnt') {
    var nt = getHDNTData();
    replaceHighlightedSpans(doc, replacementForHDNT(nt));
    insertHDNTBuyerBankInfo(doc, nt);
  } else {
    var mb = getHDMBData();
    replaceHighlightedSpans(doc, replacementForHDMB(mb));
    doc = updateHDMBTableDoc(doc, mb);
  }

  clearAllYellow(doc);
  xml = new XMLSerializer().serializeToString(doc);
  zip.file('word/document.xml', xml);
  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

async function downloadWord(type) {
  try {
    showToast('Đang tạo file Word…');
    var data = type === 'hdnt' ? getHDNTData() : getHDMBData();
    var blob = await buildDocx(type);
    var fname = 'HopDong_' + safeFileName(data.soHD) + '.docx';
    saveBlob(blob, fname);
    showToast('Đã tải ' + fname);
  } catch (err) {
    console.error(err);
    showToast('Lỗi: ' + err.message);
  }
}

function downloadPDF(type) {
  var data = type === 'hdnt' ? getHDNTData() : getHDMBData();
  var content = type === 'hdnt' ? buildHDNTPreview(data) : buildHDMBPreview(data);
  var w = window.open('', '_blank');
  w.document.write('<!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"><title>Hợp Đồng</title><style>' +
    'body{font-family:"Times New Roman",Times,serif;font-size:13pt;padding:30px 48px;line-height:1.9;color:#111}' +
    '.doc-title{text-align:center;font-size:16pt;font-weight:bold;margin-bottom:2px}' +
    '.doc-subtitle{text-align:center;font-size:12pt;margin-bottom:14px}' +
    '.doc-number{text-align:center;font-weight:bold;margin-bottom:18px}' +
    '.ph{background:none}' +
    '.clause-title{font-weight:bold;margin-top:12px}' +
    'table{width:100%;border-collapse:collapse;margin:8px 0;font-size:11pt}' +
    'table th,table td{border:1px solid #333;padding:5px 9px}' +
    'table th{background:#f0f0f0}' +
    '.sign-row{display:flex;justify-content:space-between;margin-top:40px;text-align:center}' +
    '.sign-col{width:45%}' +
    '@media print{@page{margin:18mm}body{padding:0}}' +
    '</style></head><body>' + content +
    '<script>window.onload=function(){window.print();}<\/script></body></html>');
  w.document.close();
}

// ─── Toast ────────────────────────────────────────────────
function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(function() { t.classList.remove('show'); }, 3000);
}

// ─── Init ─────────────────────────────────────────────────
addProductRow();
['nt-ngay-ky', 'nt-ngay-het-hl', 'mb-ngay-ky'].forEach(syncDateDisplay);
