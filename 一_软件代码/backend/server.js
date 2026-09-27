/**
 * ChatIQ AI - 全內置 AI 客服系統（零原生依賴版）
 * 無需 better-sqlite3，用 JSON 文件存儲，開箱即用
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ===== JSON 文件數據庫 =====
const DB_FILE = path.join(__dirname, 'data.json');
let db = { customers: [], conversations: [], messages: [], orders: [], settings: {} };

function loadDB() {
    try { db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8')); } catch(e) {
        db = { customers: [], conversations: [], messages: [], orders: [], settings: {} };
        saveDB();
    }
}
function saveDB() { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); }
loadDB();

// ===== 內置 AI 引擎 =====
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
        if (['要','想買','訂','落單','下單','buy','want'].some(w => m.includes(w)))
            return this.pick(['好呀！AI 已創建訂單，請確認產品、數量、地址。','收到！幫您安排落單，今日出貨。','AI 正在生成訂單，請話我知您要邊款。']);
        if (['太貴','平啲','便宜','減價','too expensive'].some(w => m.includes(w)))
            return this.pick(['明白！新客有9折，考慮入門款更划算。','今日確認幫您申請會員價再平5%。','套裝優惠買兩件95折、三件88折。']);
        if (['投訴','差','壞','唔滿意','refund'].some(w => m.includes(w)))
            return '非常抱歉！已轉專責同事，30分鐘內聯絡您。';
        return this.pick(['您好！已收到您訊息，專業人員會盡快回覆。','收到！緊急問題可打門市電話。','您好！請問想了解價格、預約定送貨？']);
    }
    catToQ(c) { return {price:'價格',hours:'營業時間',address:'地址',discount:'優惠',delivery:'送貨',return:'退換',pay:'付款',stock:'現貨',booking:'預約',member:'會員'}[c]||''; }
}
const ai = new BuiltInAI();

// ===== API =====
app.get('/api/customers', (req, res) => res.json(db.customers));
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

app.get('/api/orders', (req, res) => res.json(db.orders));
app.put('/api/orders/:id/status', (req, res) => {
    const o = db.orders.find(x => x.id === req.params.id);
    if (o) { o.status = req.body.status; saveDB(); }
    res.json({ success: true });
});

app.post('/webhook/whatsapp', (req, res) => {
    try {
        const msgs = req.body.entry?.[0]?.changes?.[0]?.value?.messages || [];
        for (const msg of msgs) {
            const from = msg.from, text = msg.text?.body || '';
            console.log(`[WhatsApp] ${from}: ${text}`);
            let cust = db.customers.find(c => c.phone === from);
            if (!cust) {
                cust = { id: 'C'+Date.now(), name: from, phone: from, grade: 'lead', total_spent: 0, orders_count: 0 };
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
            console.log(`[AI] -> ${from}: ${reply}`);
        }
        saveDB();
    } catch(e) { console.error(e); }
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`ChatIQ AI 已啟動: http://localhost:${PORT}`);
});
