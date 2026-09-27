// ===== ChatIQ AI 引擎（豐富版）=====
// 多場景、多風格 AI 回覆、客戶分析、意向評分

const AIEngine = {

    // ===== 知識庫：每條知識配多套話術 =====
    knowledge: [
        {
            q: '營業時間',
            answers: [
                '我們星期一至六 10:00-20:00 營業，星期日休息。歡迎隨時預約到店體驗！',
                '您好！營業時間為星期一至六 10:00-20:00。星期日及公眾假期休息，敬請預先預約。',
                '我們朝早10點到晚8點開門，星期一至六營業，日日照常休息。週末前來建議預約，避免等候。'
            ]
        },
        {
            q: '價格',
            answers: [
                '我們產品由 HK$99 起，不同系列價格各異。請問您想了解哪款產品？我發詳細價目表給您。',
                '您好！入門級產品 HK$99 起，熱賣套裝約 HK$380-1,280。方便告訴我您的需求嗎？為您精準推薦。',
                '價格視乎產品系列，由 HK$99 到 HK$2,000 不等。您可以先告訴我想解決什麼問題，我幫您揀最划算的。'
            ]
        },
        {
            q: '地址',
            answers: [
                '我們在香港銅鑼灣時代廣場對面。港鐵銅鑼灣站A出口行3分鐘就到，門口有藍色招牌。',
                '地址：銅鑼灣恩平道28號2樓。港鐵銅鑼灣站F出口直行5分鐘。門店有專人接待，歡迎預約。',
                '銅鑼灣時代廣場對面就是我們。地鐵銅鑼灣站A出口，過馬路就行到。停車可泊時代廣場停車場。'
            ]
        },
        {
            q: '優惠',
            answers: [
                '新客戶首次消費即享9折！另外每月1號有會員專屬折扣，現在下單再送小禮品一份。',
                '而家有緊新客優惠：首單9折，滿 HK$500 再減 HK$50。會員另有積分計劃，儲夠分數可以換產品。',
                '本月份限定：買兩件95折，買三件88折。新客仲有迎賓禮品包。您想睇邊款？我幫您計最抵組合。'
            ]
        },
        {
            q: '送貨',
            answers: [
                '訂單滿 HK$500 免費送貨，一般1-2工作天送到。未滿 HK$500 運費 HK$30，急單即日送貨 HK$50。',
                '本地訂單滿 HK$500 免運費，1-2日送達。順豐智能櫃/門市自取都得。急單可安排即日速遞。',
                '送貨方面：滿 HK$500 免費，唔滿就 HK$30 運費。一般第二日就到。您要送到邊度？我幫你睇邊種方式最方便。'
            ]
        },
        {
            q: '退換',
            answers: [
                '產品收到7日內如有品質問題，可免費退換。請保留完整包裝及單據，我們會安排上門回收。',
                '我們有7日滿意保證：唔滿意可以退換，只需保留單據和原裝包裝。品質問題更是全額退款。',
                '收到貨7日內，如有任何問題都可以退換。過了7日但有品質問題，我們都會跟進處理。請放心選購。'
            ]
        },
        {
            q: '付款',
            answers: [
                '我們支援：Visa/Mastercard、轉數快 FPS、AlipayHK、WeChat Pay、PayPal、銀行轉帳。',
                '付款方式好靈活：信用卡、轉數快、支付寶、微信支付都得。門市亦接受現金。',
                '信用卡、FPS轉數快、AlipayHK、WeChat Pay、PayPal全部支援。網上下單可即時付款，安全方便。'
            ]
        },
        {
            q: '預約',
            answers: [
                '可以！請問您想預約什麼服務？大概幾點方便？我幫您留位，確認後會發提醒訊息給您。',
                '預約好簡單：話我知您想預約邊項服務、幾時方便，我即刻幫您安排。到時直接到店就得。',
                '想預約嘅話，請講您方便嘅日期同時間，同埋邊項服務。我會即刻幫您book位，發確認訊息。'
            ]
        },
        {
            q: '現貨',
            answers: [
                '幫您睇到了，這款有現貨！今日下單今日可以出貨，最快聽日送到。要幫您留貨嗎？',
                '這款現貨充足，您隨時可以落單。如果係熱賣款，建議早啲落單，因為有時會斷貨。',
                '有現貨嘅！而家下單，今日就安排出貨。您要送到邊個地址？我幫您計運費同到貨時間。'
            ]
        },
        {
            q: '會員',
            answers: [
                '成為會員即享：消費1蚊=1分，1000分扣HK$100。會員專屬價、生日禮、優先試新產品。免費註冊。',
                '我們嘅會員計劃：每消費 HK$1 儲1分，積分可換產品或現金折扣。會員仲有專屬折扣日同生日禮遇。',
                '會員免費加入，即時有95折。之後消費儲分，儲夠可以換禮品。年費全免，隨時可以退會。'
            ]
        },
        {
            q: '門市',
            answers: [
                '門市地址：銅鑼灣恩平道28號2樓。歡迎到店體驗，有專人介紹產品。需要預約嗎？',
                '我們有銅鑼灣旗艦店同旺角分店兩間。您邊間方便？我發詳細地址同營業時間。',
                '門市欢迎隨時來參觀，唔使預約都得。如果想有專人一對一講解，建議book個時間，我幫你安排。'
            ]
        },
        {
            q: '產品推薦',
            answers: [
                '請問您想解決什麼問題？或者有什麼偏好？比如：膚質、用途、預算範圍。我幫您配最適合嘅組合。',
                '想我幫您揀嘅話，話我知：1)您嘅需求 2)預算大概幾多 3)有冇特別偏好。我推薦最切合您嘅。',
                '我們最熱賣嘅係三款：入門保濕系列 HK$380、升級抗皺系列 HK$680、全套護膚套裝 HK$1,280。您傾向邊款？'
            ]
        }
    ],

    // ===== 關鍵詞 =====
    keywords: {
        price: ['幾錢', '價錢', '價格', '幾多', 'how much', 'price', 'cost', '多少', '怎麼賣'],
        hours: ['幾點', '營業', '開幾耐', '時間', 'hour', 'open', 'time', '幾點開', '幾點關'],
        address: ['邊度', '地址', '喺邊', 'where', 'address', 'location', '邊間', '邊間舖'],
        order: ['落單', '下單', '買', '訂', 'order', 'buy', 'want', '要', '畀錢'],
        discount: ['優惠', '折扣', '平', '特價', 'discount', 'promo', 'cheap', '幾平', '減'],
        delivery: ['送貨', '郵寄', '幾時到', 'delivery', 'shipping', '幾時送到', '運費'],
        return: ['退', '換', 'refund', 'return', 'exchange', '退換', '唔要'],
        pay: ['付款', '支付', 'pay', 'payment', '信用卡', '轉數快', 'alipay'],
        stock: ['現貨', '有冇貨', '存貨', 'stock', 'available', '幾時有'],
        booking: ['預約', 'book', 'appointment', '訂位', '約'],
        member: ['會員', '積分', 'member', 'vip', '分數'],
        recommend: ['推薦', '介紹', '推', 'recommend', 'suggest', '邊款好', '買邊款']
    },

    // ===== 回覆風格變體 =====
    greetingVariants: [
        '您好！我是 ChatIQ AI 助手，請問有什麼可以幫到您？',
        '你好呀！歡迎聯絡我們，我係 AI 客服，有咩問題儘管問。',
        '您好！很高興為您服務。請問想了解什麼產品或服務？'
    ],

    // 生成 AI 回覆
    generateReply(customerMessage, customerId) {
        const msg = customerMessage.toLowerCase();

        // 問候語檢測
        if (['你好', 'hi', 'hello', '在嗎', '在不在', '嗨', '喂'].some(w => msg === w || msg === w + '呀' || msg === w + '啊')) {
            return this.personalizeReply(this.greetingVariants[Math.floor(Math.random() * this.greetingVariants.length)], customerId);
        }

        // 匹配知識庫（多套話術隨機選）
        for (const kb of this.knowledge) {
            if (msg.includes(kb.q.toLowerCase())) {
                const ans = kb.answers[Math.floor(Math.random() * kb.answers.length)];
                return this.personalizeReply(ans, customerId);
            }
        }

        // 匹配關鍵詞
        for (const [category, words] of Object.entries(this.keywords)) {
            for (const word of words) {
                if (msg.includes(word)) {
                    const kb = this.knowledge.find(k => k.q === this.categoryToQuestion(category));
                    if (kb) {
                        const ans = kb.answers[Math.floor(Math.random() * kb.answers.length)];
                        return this.personalizeReply(ans, customerId);
                    }
                }
            }
        }

        // 購買意圖
        if (this.hasPurchaseIntent(msg)) {
            return this.generateOrderReply(customerId);
        }

        // 議價/嫌貴
        if (this.hasBargainIntent(msg)) {
            return this.generateBargainReply(customerId);
        }

        // 投訴/不滿
        if (this.hasComplaint(msg)) {
            return this.generateComplaintReply(customerId);
        }

        // 感謝
        if (['多謝', '谢谢', 'thank', 'thanks', 'thx'].some(w => msg.includes(w))) {
            const thanks = [
                '不客氣！有任何問題隨時搵我。記得收貨後分享使用感受喔！',
                '客氣啦！多謝您嘅支持。如果鍾意，歡迎介紹朋友嚟，朋友都有優惠。',
                '唔使客氣！希望您鍾意我們嘅產品。使用上有任何問題，隨時聯絡我哋。'
            ];
            return thanks[Math.floor(Math.random() * thanks.length)];
        }

        // 再見
        if (['拜拜', '再见', 'bye', '88', '走了'].some(w => msg.includes(w))) {
            return '拜拜！多謝您嘅查詢，歡迎隨時再聯絡。祝您有愉快嘅一天！';
        }

        // 默認：多套兜底
        const fallbacks = [
            '您好！我係 AI 助手。我們嘅專業人員會盡快回覆您。您都可以先了解我哋嘅產品資訊，或者留下需求，我哋會優先處理。',
            '收到您嘅訊息！我先幫您記低。如果係緊急問題，建議直接打門市電話。一般查詢我哋會喺幾分鐘內回覆。',
            '您好！多謝您聯絡我哋。請問您想了解邊方面嘅資訊？產品價格、預約、送貨定其他？我可以即刻幫您解答。'
        ];
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    },

    categoryToQuestion(cat) {
        const map = {
            price: '價格', hours: '營業時間', address: '地址',
            discount: '優惠', delivery: '送貨', return: '退換', pay: '付款',
            order: '價格', stock: '現貨', booking: '預約', member: '會員', recommend: '產品推薦'
        };
        return map[cat] || '';
    },

    personalizeReply(reply, customerId) {
        const customer = customers.find(c => c.id === customerId);
        if (customer && customer.grade === 'A') {
            const vip = [
                `尊敬的 ${customer.name} 先生/小姐，${reply} 作為我們的VIP客戶，您額外享有會員積分雙倍獎勵！`,
                `${customer.name} 先生/小姐您好！${reply} 您係我哋VIP，我幫您安排優先出貨。`,
                `${customer.name} 先生/小姐！${reply} VIP客戶我哋會額外送多份小禮品。`
            ];
            return vip[Math.floor(Math.random() * vip.length)];
        }
        return reply;
    },

    hasPurchaseIntent(msg) {
        const intentWords = ['要', '想買', '訂', '落單', '下單', 'order', 'buy', 'want', '畀錢', '付款', '買一個', '畀我'];
        return intentWords.some(w => msg.includes(w));
    },

    hasBargainIntent(msg) {
        const words = ['太貴', '平啲', '便宜', '可唔可以平', '減價', '優惠多啲', '再減', 'cheap', 'discount more', 'too expensive'];
        return words.some(w => msg.includes(w));
    },

    hasComplaint(msg) {
        const words = ['投訴', '差', '壞', '唔滿意', '退貨', '欺騙', '無人回', 'bad', 'terrible', 'angry', 'refund'];
        return words.some(w => msg.includes(w));
    },

    generateOrderReply(customerId) {
        const templates = [
            '好呀！我已經幫您記低需求。AI 已自動為您創建訂單，稍後發確認訊息。\n\n麻煩您話我知：\n1. 產品名稱\n2. 數量\n3. 送貨地址\n\n我哋會盡快為您安排！',
            '收到！幫您安排落單。為咗快啲處理，請話我知：\n• 您想要邊款產品？\n• 要幾多件？\n• 送去邊個地址？\n\n今日落單今日出貨！',
            '太好了！我已記錄您嘅需求。AI 正在為您生成訂單，請確認：\n產品：______\n數量：______\n地址：______\n\n確認後我哋即時安排。'
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    },

    generateBargainReply(customerId) {
        const templates = [
            '明白您嘅預算考慮。我哋而家有新客9折，或者您考慮入門級款，性價比更高。要我發詳細比較俾您嗎？',
            '了解！如果您今日確認，我可以幫您申請會員價，大約再平5%。呢個係今個月最低價了，要幫您申請嗎？',
            '體諒體諒！我哋經常有套裝優惠，買兩件95折、三件88折。您同朋友夾埋買最抵。要我推薦套裝組合嗎？'
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    },

    generateComplaintReply(customerId) {
        const templates = [
            '非常抱歉為您帶來不便！我已將您的個案轉給專責同事，會在30分鐘內聯絡您跟進。請問您的訂單編號是？',
            '對唔住！呢個情況我哋十分重視。麻煩您提供訂單號碼同問題情況，我立即轉人工主管跟進，一定俾您滿意答覆。',
            '很抱歉讓您有唔好嘅體驗。我哋承諾7日內可以退換，並且會主動聯絡了解情況。請留下聯絡電話，我哋盡快回覆。'
        ];
        return templates[Math.floor(Math.random() * templates.length)];
    },

    // AI 意向評分
    scoreLead(customerId, messages) {
        let score = 50;
        const customer = customers.find(c => c.id === customerId);
        if (!customer) return 50;

        if (customer.grade === 'A') score += 25;
        else if (customer.grade === 'B') score += 12;
        else if (customer.grade === 'lead') score += 18;

        const allText = messages.map(m => m.text.toLowerCase()).join(' ');
        const positiveSignals = ['想買', '要', '訂', '幾時有', '價錢', '地址', 'ok', '好', '冇問題', '想睇', '點買', 'how much', 'want', 'need', 'interested', '預約', '幾號'];
        const negativeSignals = ['太貴', '唔要', '再講', '考慮下', '不用', '不需要', 'too expensive', 'maybe later', '算吧'];

        for (const s of positiveSignals) if (allText.includes(s)) score += 6;
        for (const s of negativeSignals) if (allText.includes(s)) score -= 8;

        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.from === 'customer') score += 8;

        const customerMsgs = messages.filter(m => m.from === 'customer');
        score += Math.min(customerMsgs.length * 2, 12);

        return Math.max(5, Math.min(99, score));
    },

    // 情緒分析
    analyzeSentiment(message) {
        const msg = message.toLowerCase();
        const positive = ['多謝', '好', '唔錯', '滿意', 'thank', 'great', 'good', 'perfect', 'ok', 'nice', '正', '抵'];
        const negative = ['唔滿意', '投訴', '差', '壞', '退', '差勁', 'bad', 'terrible', 'angry', 'upset', '貴', '呃人'];
        let score = 0;
        for (const w of positive) if (msg.includes(w)) score++;
        for (const w of negative) if (msg.includes(w)) score--;
        if (score > 0) return 'positive';
        if (score < 0) return 'negative';
        return 'neutral';
    },

    // 跟進建議
    generateFollowUp(customerId) {
        const customer = customers.find(c => c.id === customerId);
        if (!customer) return '建議：了解客戶需求後再跟進。';

        if (customer.grade === 'A') {
            return `建議：${customer.name} 是高價值VIP，可推薦新產品或升級方案。保持每週一次互動，節日發個人化問候。`;
        } else if (customer.grade === 'lead') {
            return `建議：${customer.name} 是新潛在客戶，建議24小時內人工跟進，提供免費評估或試用，加速轉化。`;
        } else if (customer.tags.includes('流失風險')) {
            return `建議：${customer.name} 有流失風險，建議發送個人化優惠券（如8折券）+ 問候訊息挽回。`;
        } else if (customer.tags.includes('需跟進')) {
            return `建議：${customer.name} 正在比較中，建議今日內發出限時優惠，製造緊迫感促成決定。`;
        }
        return `建議：保持適度跟進，發送有用內容或季節性優惠維持關係。`;
    },

    // 生成快捷回覆建議（對話頁右側/下方）
    suggestReplies(customerMessage) {
        const msg = (customerMessage || '').toLowerCase();
        if (msg.includes('價') || msg.includes('幾錢') || msg.includes('price')) {
            return ['發送價目表', '推薦熱賣套裝', '提供新客優惠'];
        }
        if (msg.includes('送') || msg.includes('郵寄') || msg.includes('delivery')) {
            return ['確認送貨地址', '發送運費說明', '建議智能櫃自取'];
        }
        if (msg.includes('好') || msg.includes('ok') || msg.includes('可以')) {
            return ['協助下單', '發送付款連結', '預約到店'];
        }
        if (msg.includes('考慮') || msg.includes('諗下')) {
            return ['發送限時優惠', '提供免費試用', '3日後跟進'];
        }
        return ['發送歡迎訊息', '了解需求預算', '邀請到店體驗'];
    }
};
