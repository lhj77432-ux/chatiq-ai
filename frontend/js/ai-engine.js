// ===== ChatIQ AI Engine v4.0 - 真實 AI + 規則引擎 =====
// 真實 AI: Pollinations 免費 API（無需商家 Key）
// 規則引擎：API 失敗時自動降級

const AIEngine = {
    context: {},
    businessContext: `你是 ChatIQ，香港一家叫「生活精品」的 WhatsApp 專屬客服。
你嘅身份：親切、有禮、識做生意嘅店員，唔係機器人。
產品資料：
- 手工咖啡杯 HK$128（陶瓷，手工拉坯，禮物首選）
- 不鏽鋼保溫壺 HK$380（12小時保溫，304不鏽鋼，送禮得體）
- 手工玻璃杯套裝 HK$260（4隻裝，手吹玻璃）
- 木製托盤 HK$199（胡桃木，茶具搭配）
- 智能香薰機 HK$450（靜音，定時功能，家居放鬆）
- 皮革錢包 HK$680（頭層牛皮，手工縫製）
店舖資料：銅鑼灣恩平道28號2樓，港鐵銅鑼灣站A出口3分鐘。星期一至六10:00-20:00，星期日及公眾假期休息。
優惠：新客首單9折，滿HK$500免運費，買2件95折3件88折，會員免費入会即95折。
送貨：本地1-2工作天，順豐智能櫃可選。滿HK$500免費，否則HK$30。
退換：7日滿意保證，品質問題全額退貨，運費我方承擔。
付款：Visa/Mastercard/FPS轉數快/AlipayHK/WeChat Pay/PayPal/門市現金。
回覆要求：
- 用繁體中文，像真人店員講嘢
- 簡短，2-3句，唔好太長
- 適當用粵語口氣（嘅、咗、喺、唔、喎）但唔好太誇張
- 如果客戶係普通話就用普通話，英文就用英文
- 主動推薦產品但唔好硬銷
- 客戶問價錢要講具體數字
- 客戶猶豫時提一下優惠
- 唔好講「我係AI」或「我係機器人」
- 唔好用markdown格式`,
    async generateReplyAsync(msg, customerId, history) {
        msg = (msg||'').trim();
        if (!msg) return '您好！請講多啲詳情。';
        if (!this.context[customerId]) this.context[customerId] = { history: [] };
        const ctx = this.context[customerId];
        ctx.history.push({role:'user',content:msg});
        if (ctx.history.length > 10) ctx.history.shift();
        try {
            const h = (history||ctx.history).slice(-6).map(m => (m.role||'user')+': '+m.content).join('\n');
            const prompt = this.businessContext + '\n\n對話：\n' + h + '\n\n客戶：' + msg + '\n回覆：';
            const ctl = new AbortController();
            const timer = setTimeout(()=>ctl.abort(), 12000);
            const res = await fetch('https://text.pollinations.ai/' + encodeURIComponent(prompt), {signal: ctl.signal});
            clearTimeout(timer);
            if (res.ok) {
                const text = (await res.text()).trim();
                if (text && text.length > 2) { ctx.history.push({role:'assistant',content:text}); return text; }
            }
        } catch(e) { console.log('AI降級到規則引擎'); }
        return this._ruleReply(msg);
    },
    generateReply(msg, customerId) { return this._ruleReply(msg); },
    _ruleReply(msg) {
        const m = (msg||'').toLowerCase();
        const rules = [
            {k:['你好','您好','hi','hello','在嗎','早晨'],r:['您好！我係ChatIQ，今日有咩幫到您？','Hi！歡迎，想了解產品定優惠？']},
            {k:['幾點','營業','開門','時間','几点','open'],r:['星期一至六10:00-20:00，星期日休息。而家開緊門！']},
            {k:['幾錢','價錢','價格','多少錢','how much','price'],r:['產品由HK$128起。熱賣：咖啡杯HK$128、保溫壺HK$380、香薰機HK$450。']},
            {k:['邊度','地址','在哪','where','address'],r:['銅鑼灣恩平道28號，港鐵A出口行3分鐘。']},
            {k:['優惠','折扣','平','特價','discount'],r:['新客首單9折！滿HK$500再減HK$50。']},
            {k:['送貨','郵寄','運費','delivery'],r:['滿HK$500免運費，1-2日到。唔滿HK$30。']},
            {k:['退','換','refund','return'],r:['7日內有問題包退換，品質問題全額退款。']},
            {k:['付款','支付','信用卡','轉數快','fps','pay'],r:['支援信用卡、FPS、AlipayHK、WeChat Pay、PayPal。']},
            {k:['多謝','谢谢','thank','唔該'],r:['唔客氣！有問題隨時搵我。']},
            {k:['拜拜','bye','再見'],r:['拜拜！歡迎隨時再搵我。']},
            {k:['太貴','平啲','便宜'],r:['新客已經9折！買兩件95折，三件88折。']},
            {k:['想買','落單','下單','訂','我要'],r:['好呀！話我知您要邊款、幾多件，即刻幫您安排！']}
        ];
        for (const rule of rules) {
            for (const w of rule.k) { if (m.includes(w.toLowerCase())) return rule.r[Math.floor(Math.random()*rule.r.length)]; }
        }
        return '您好！想了解產品價錢、門市地址、定送貨安排？話我知！';
    },
    analyzeSentiment(msg) {
        const m=(msg||'').toLowerCase(); let s=0;
        ['多謝','好','唔錯','滿意','good'].forEach(w=>{if(m.includes(w))s++;});
        ['投訴','差','壞','退','bad','貴'].forEach(w=>{if(m.includes(w))s--;});
        return s>0?'positive':s<0?'negative':'neutral';
    },
    scoreLead(id,msgs) {
        let sc=50; const all=(msgs||[]).map(m=>(m.text||'').toLowerCase()).join(' ');
        ['想買','要','價錢','地址','預約','落單'].forEach(w=>{if(all.includes(w))sc+=7;});
        ['太貴','唔要','考慮下'].forEach(w=>{if(all.includes(w))sc-=10;});
        return Math.max(5,Math.min(99,sc));
    },
    suggestReplies(msg) {
        const m=(msg||'').toLowerCase();
        if(m.includes('價')||m.includes('幾錢')) return ['發送價目表','推薦熱賣','新客優惠'];
        if(m.includes('送')||m.includes('郵寄')) return ['確認地址','運費說明'];
        if(m.includes('好')||m.includes('ok')) return ['協助下單','付款連結'];
        if(m.includes('退')||m.includes('壞')) return ['轉人工','安排退款'];
        return ['歡迎訊息','了解預算','邀請到店'];
    },
    generateFollowUp(cid) {
        const c=(typeof customers!=='undefined'?customers:[]).find(x=>x.id===cid);
        if(!c) return '建議了解客戶需求後跟進。';
        if(c.grade==='A') return c.name+' 係高價值客戶，建議推薦新產品。';
        return '保持適度跟進，發送季節優惠。';
    }
};