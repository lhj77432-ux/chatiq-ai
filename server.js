/**
 * ChatIQ AI - WhatsApp AI Customer Service & CRM
 * All-in-one: built-in AI, JSON storage, export/import, no external API needed.
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'frontend')));

// ===== JSON file database =====
const DB_FILE = path.join(__dirname, 'data.json');
let db = {
  customers: [], conversations: [], messages: [], orders: [],
  products: [], knowledge_base: [], settings: {}
};

function loadDB() {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    // ensure arrays exist
    ['customers','conversations','messages','orders','products','knowledge_base'].forEach(k => {
      if (!Array.isArray(db[k])) db[k] = [];
    });
  } catch(e) {
    seedData();
    saveDB();
  }
}
function saveDB() { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }

function seedData() {
  db.products = [
    { id: 'P001', name: '經典手工咖啡杯', price: 128, stock: 50, category: '茶具', desc: '陶瓷手製，350ml' },
    { id: 'P002', name: '不鏽鋼保溫壺', price: 380, stock: 30, category: '廚具', desc: '1L，24小時保溫' },
    { id: 'P003', name: '手工玻璃杯套裝', price: 260, stock: 20, category: '茶具', desc: '4隻裝' },
    { id: 'P004', name: '木製托盤', price: 199, stock: 15, category: '廚具', desc: '胡桃木，35cm' }
  ];
  db.customers = [
    { id: 'C001', name: '鄭老闆', phone: '85291234567', grade: 'A', total_spent: 8600, orders_count: 12, tags: ['回頭客','餐飲'] },
    { id: 'C002', name: '林小姐', phone: '85298765432', grade: 'B', total_spent: 3200, orders_count: 5, tags: ['觀光客'] },
    { id: 'C003', name: '何生', phone: '85295551234', grade: 'C', total_spent: 0, orders_count: 0, tags: ['流失風險'] }
  ];
  db.orders = [
    { id: 'O001', customer_id: 'C001', items: ['P002'], total: 380, status: 'completed', date: '2026-09-20' },
    { id: 'O002', customer_id: 'C002', items: ['P001','P003'], total: 388, status: 'shipped', date: '2026-09-25' }
  ];
  db.conversations = [
    { id: 'conv1', customer_id: 'C001', status: 'ai', last_message: '好的，今天發貨。', last_time: '2026-09-27 10:30' },
    { id: 'conv2', customer_id: 'C002', status: 'human', last_message: '稍後回复你。', last_time: '2026-09-27 11:00' }
  ];
  db.messages = [
    { conversation_id: 'conv1', from_type: 'customer', text: '你好，保溫壺有現貨嗎？', is_ai: 0, sent_at: '2026-09-27 10:28' },
    { conversation_id: 'conv1', from_type: 'ai', text: '呢款現貨充足，隨時落單！', is_ai: 1, sent_at: '2026-09-27 10:28' },
    { conversation_id: 'conv1', from_type: 'customer', text: '好，幫我留一個', is_ai: 0, sent_at: '2026-09-27 10:29' },
    { conversation_id: 'conv1', from_type: 'ai', text: '好的，今天發貨。', is_ai: 1, sent_at: '2026-09-27 10:30' }
  ];
}
loadDB();

// ===== Built-in AI engine =====
class BuiltInAI {
  constructor() {
    this.knowledge = [
      { q: '營業時間', answers: ['星期一至六 10:00-20:00 營業，星期日休息。歡迎預約到店！', '營業時間為星期一至六 10:00-20:00，星期日休息。', '朝早10點到晚8點開門，星期一至六營業。'] },
      { q: '價格', answers: ['產品由 HK$99 起，請問您想了解邊款？我發詳細價目表俾您。', '入門級 HK$99 起，熱賣套裝 HK$380-1,280。話我知您需求。', '價格視乎系列，HK$99 到 HK$2,000 不等。'] },
      { q: '地址', answers: ['銅鑼灣時代廣場對面，港鐵A出口行3分鐘。', '銅鑼灣恩平道28號2樓，地鐵F出口直行5分鐘。', '銅鑼灣時代廣場對面，A出口過馬路就到。'] },
      { q: '優惠', answers: ['新客首單9折！滿 HK$500 再減 HK$50。', '本月限定：買兩件95折，買三件88折。', '新客9折，每月1號會員專屬折扣。'] },
      { q: '送貨', answers: ['滿 HK$500 免費送貨，1-2工作天送到。', '本地訂單滿 HK$500 免運，順豐智能櫃都得。', '送貨滿 HK$500 免費，一般第二日到。'] },
      { q: '退換', answers: ['收到7日內如有品質問題可免費退換。', '7日滿意保證，唔滿意可以退換。', '7日內任何問題都可以退換。'] },
      { q: '付款', answers: ['支援 Visa/Mastercard、轉數快、AlipayHK、WeChat Pay。', '信用卡、轉數快、支付寶、微信支付都得。', '信用卡、FPS、AlipayHK、WeChat Pay 全部支援。'] },
      { q: '預約', answers: ['可以！請講您想預約邊項服務同幾點方便。', '預約好簡單，話我知日期同時間就得。', '請講方便嘅日期同時間，我幫您book位。'] },
      { q: '現貨', answers: ['呢款有現貨！今日落單今日出貨。', '呢款現貨充足，隨時落單。', '有現貨！而家落單今日出貨。'] },
      { q: '會員', answers: ['會員免費加入，即時95折，儲分換產品。', '每消費 HK$1 儲1分，會員有專屬折扣日。', '免費入會，即時95折。'] }
    ];
    this.keywords = {
      price: ['幾錢','價錢','價格','幾多','how much','price'],
      hours: ['幾點','營業','時間','open'],
      address: ['邊度','地址','where','address'],
      discount: ['優惠','折扣','平','特價','discount'],
      delivery: ['送貨','郵寄','幾時到','delivery'],
      return: ['退','換','refund','退換'],
      pay: ['付款','支付','pay','信用卡'],
      stock: ['現貨','有冇貨','stock'],
      booking: ['預約','book','appointment'],
      member: ['會員','積分','member']
    };
  }
  pick(a) { return a[Math.floor(Math.random()*a.length)]; }

  generateReply(msg, customer) {
    const m = (msg||'').toLowerCase();
    if (['你好','hi','hello','在嗎','嗨'].some(w => m.trim() === w))
      return this.pick(['您好！我係 ChatIQ AI 助手，有咩可以幫到您？','你好呀！歡迎聯絡，有咩問題儘管問。','您好！請問想了解什麼產品？']);
    if (['多謝','谢谢','thank','thanks'].some(w => m.includes(w)))
      return this.pick(['唔客氣！有問題隨時搵我。','客氣啦！多謝支持。','唔使客氣！希望您鍾意。']);
    // Check imported knowledge base first
    for (const kb of db.knowledge_base) {
      if (kb.q && m.includes(kb.q.toLowerCase())) return kb.a || kb.answers?.[0] || '收到！';
    }
    for (const kb of this.knowledge) {
      if (m.includes(kb.q.toLowerCase())) {
        let r = this.pick(kb.answers);
        if (customer && customer.grade === 'A') r += ' 您係VIP，額外送小禮品。';
        return r;
      }
    }
    for (const [cat, words] of Object.entries(this.keywords)) {
      for (const w of words) {
        if (m.includes(w)) {
          const kb = this.knowledge.find(k => k.q === this.catToQ(cat));
          if (kb) return this.pick(kb.answers);
        }
      }
    }
    if (['要','想買','訂','落單','下單','buy','want'].some(w => m.includes(w))) {
      // Try to recommend a product
      const p = db.products[Math.floor(Math.random()*db.products.length)];
      if (p) return `好呀！推薦您「${p.name}」HK$${p.price}，有現貨！今日落單今日出貨。`;
      return this.pick(['好呀！AI 已創建訂單，請確認產品、數量、地址。','收到！幫您安排落單，今日出貨。']);
    }
    if (['太貴','平啲','便宜','減價'].some(w => m.includes(w)))
      return this.pick(['明白！新客有9折，考慮入門款更划算。','今日確認幫您申請會員價再平5%。','套裝優惠買兩件95折、三件88折。']);
    if (['投訴','差','壞','唔滿意','refund'].some(w => m.includes(w)))
      return '非常抱歉！已轉專責同事，30分鐘內聯絡您。';
    return this.pick(['您好！已收到您訊息，專業人員會盡快回覆。','收到！緊急問題可打門市電話。','您好！請問想了解價格、預約定送貨？']);
  }
  catToQ(c) { return {price:'價格',hours:'營業時間',address:'地址',discount:'優惠',delivery:'送貨',return:'退換',pay:'付款',stock:'現貨',booking:'預約',member:'會員'}[c]||''; }
}
const ai = new BuiltInAI();

// ===== API: CRUD =====
app.get('/api/customers', (req, res) => res.json(db.customers));
app.post('/api/customers', (req, res) => {
  const c = { id: 'C'+Date.now(), ...req.body };
  db.customers.push(c); saveDB(); res.json(c);
});
app.get('/api/products', (req, res) => res.json(db.products));
app.post('/api/products', (req, res) => {
  const p = { id: 'P'+Date.now(), ...req.body };
  db.products.push(p); saveDB(); res.json(p);
});
app.get('/api/orders', (req, res) => res.json(db.orders));
app.put('/api/orders/:id/status', (req, res) => {
  const o = db.orders.find(x => x.id === req.params.id);
  if (o) { o.status = req.body.status; saveDB(); }
  res.json({ success: true });
});
app.get('/api/conversations', (req, res) => {
  const list = db.conversations.map(c => {
    const cust = db.customers.find(x => x.id === c.customer_id);
    return { ...c, customer_name: cust ? cust.name : 'Unknown' };
  });
  res.json(list);
});
app.get('/api/conversations/:id/messages', (req, res) => {
  res.json(db.messages.filter(m => m.conversation_id === req.params.id));
});
app.post('/api/conversations/:id/send', (req, res) => {
  const { text, from_type } = req.body;
  const cid = req.params.id;
  db.messages.push({ conversation_id: cid, from_type, text, is_ai: 0, sent_at: new Date().toISOString() });
  if (from_type === 'customer') {
    let conv = db.conversations.find(c => c.id === cid);
    if (!conv) { conv = { id: cid, customer_id: 'C001', status: 'ai', last_message: '', last_time: '' }; db.conversations.push(conv); }
    const cust = db.customers.find(c => c.id === conv.customer_id);
    const reply = ai.generateReply(text, cust);
    db.messages.push({ conversation_id: cid, from_type: 'ai', text: reply, is_ai: 1, sent_at: new Date().toISOString() });
    conv.last_message = reply;
    conv.last_time = new Date().toLocaleString('zh-HK');
  }
  saveDB();
  res.json({ success: true });
});

// ===== EXPORT: PDF (printable HTML), Word (.doc), CSV, JSON =====
function esc(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

app.get('/api/export/conversations.pdf', (req, res) => {
  let rows = db.conversations.map(c => {
    const cust = db.customers.find(x => x.id === c.customer_id);
    const msgs = db.messages.filter(m => m.conversation_id === c.id);
    return `<tr><td>${esc(cust?.name||'')}</td><td>${esc(c.last_time||'')}</td><td>${msgs.map(m=>`<div><b>${m.from_type==='ai'?'AI':'客'}</b>: ${esc(m.text)}</div>`).join('')}</td></tr>`;
  }).join('');
  const html = `<html><head><meta charset="utf-8"><title>對話記錄</title><style>body{font-family:sans-serif;padding:30px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px}th{background:#f5f5f5}</style></head><body><h1>ChatIQ AI 對話記錄</h1><p>匯出時間：${new Date().toLocaleString('zh-HK')}</p><table><tr><th>客戶</th><th>時間</th><th>對話內容</th></tr>${rows}</table></body></html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="conversations.html"');
  res.send(html);
});

app.get('/api/export/customers.doc', (req, res) => {
  let rows = db.customers.map(c => `<tr><td>${esc(c.id)}</td><td>${esc(c.name)}</td><td>${esc(c.phone)}</td><td>${esc(c.grade)}</td><td>HK$${c.total_spent||0}</td><td>${c.orders_count||0}</td></tr>`).join('');
  const html = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset="utf-8"><title>客戶名單</title></head><body><h1>ChatIQ AI 客戶名單</h1><p>匯出時間：${new Date().toLocaleString('zh-HK')}</p><table border="1"><tr><th>ID</th><th>姓名</th><th>電話</th><th>等級</th><th>消費額</th><th>訂單數</th></tr>${rows}</table></body></html>`;
  res.setHeader('Content-Type', 'application/msword');
  res.setHeader('Content-Disposition', 'attachment; filename="customers.doc"');
  res.send(html);
});

app.get('/api/export/orders.csv', (req, res) => {
  let csv = '訂單ID,客戶,產品,金額,狀態,日期\n';
  db.orders.forEach(o => {
    const cust = db.customers.find(c => c.id === o.customer_id);
    csv += `${o.id},${cust?.name||''},${(o.items||[]).join(';')},HK$${o.total},${o.status},${o.date}\n`;
  });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
  res.send('\uFEFF' + csv);
});

app.get('/api/export/products.csv', (req, res) => {
  let csv = '產品ID,名稱,價格,庫存,分類,描述\n';
  db.products.forEach(p => { csv += `${p.id},${p.name},HK$${p.price},${p.stock},${p.category},${p.desc}\n`; });
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="products.csv"');
  res.send('\uFEFF' + csv);
});

app.get('/api/export/all.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="chatiq-data.json"');
  res.send(JSON.stringify(db, null, 2));
});

// ===== IMPORT: products, customers, knowledge base =====
app.post('/api/import/products', (req, res) => {
  const items = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'Expected array' });
  let added = 0;
  items.forEach(p => {
    if (p.name) { db.products.push({ id: 'P'+Date.now()+added, ...p }); added++; }
  });
  saveDB();
  res.json({ success: true, added });
});

app.post('/api/import/customers', (req, res) => {
  const items = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'Expected array' });
  let added = 0;
  items.forEach(c => {
    if (c.name) { db.customers.push({ id: 'C'+Date.now()+added, grade:'B', total_spent:0, orders_count:0, tags:[], ...c }); added++; }
  });
  saveDB();
  res.json({ success: true, added });
});

app.post('/api/import/knowledge', (req, res) => {
  const items = req.body;
  if (!Array.isArray(items)) return res.status(400).json({ error: 'Expected array' });
  items.forEach(kb => { if (kb.q) db.knowledge_base.push(kb); });
  saveDB();
  res.json({ success: true, added: items.length });
});

app.get('/api/products', (req, res) => res.json(db.products));
app.get('/api/knowledge', (req, res) => res.json(db.knowledge_base));

// ===== WhatsApp webhook =====
app.post('/webhook/whatsapp', (req, res) => {
  try {
    const msgs = req.body.entry?.[0]?.changes?.[0]?.value?.messages || [];
    for (const msg of msgs) {
      const from = msg.from, text = msg.text?.body || '';
      let cust = db.customers.find(c => c.phone === from);
      if (!cust) {
        cust = { id: 'C'+Date.now(), name: from, phone: from, grade: 'lead', total_spent: 0, orders_count: 0, tags: [] };
        db.customers.push(cust);
      }
      let conv = db.conversations.find(c => c.customer_id === cust.id);
      if (!conv) {
        conv = { id: 'conv'+Date.now(), customer_id: cust.id, status: 'ai', last_message: text, last_time: new Date().toLocaleString('zh-HK'), unread: 0 };
        db.conversations.push(conv);
      }
      db.messages.push({ conversation_id: conv.id, from_type: 'customer', text, is_ai: 0 });
      const reply = ai.generateReply(text, cust);
      db.messages.push({ conversation_id: conv.id, from_type: 'ai', text: reply, is_ai: 1 });
      conv.last_message = reply;
    }
    saveDB();
  } catch(e) { console.error(e); }
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`ChatIQ AI running on port ${PORT}`);
});
