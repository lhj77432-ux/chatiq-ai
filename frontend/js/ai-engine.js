// ===== ChatIQ AI Engine v3.0 - 智能對話引擎 =====
// 支援模糊匹配、上下文記憶、產品推薦、情緒識別、主動追問
// 純前端運行，無需外部 API

const AIEngine = {

    // 對話上下文記憶
    context: {},  // customerId -> { lastTopic, lastProduct, history, budget }

    // ===== 產品庫（動態讀取，這裡做 fallback）=====
    products: [
        { name: '經典手工咖啡杯', price: 128, tags: ['杯','茶具','陶瓷','禮物','咖啡'] },
        { name: '不鏽鋼保溫壺', price: 380, tags: ['保溫','壺','不鏽鋼','禮物','家用'] },
        { name: '手工玻璃杯套裝', price: 260, tags: ['玻璃','套裝','杯','禮物'] },
        { name: '木製托盤', price: 199, tags: ['木','托盤','家用','茶具'] },
        { name: '智能香薰機', price: 450, tags: ['香薰','放鬆','家用','禮物'] },
        { name: '手工皮革錢包', price: 680, tags: ['皮革','錢包','禮物','耐用'] }
    ],

    // ===== 意圖識別：每個意圖配大量同義詞 =====
    intents: {
        greeting: {
            words: ['你好','您好','hi','hello','在嗎','在不在','嗨','喂','早晨','晚安','下午好','hey','yo','嗨呀'],
            responses: [
                '您好！我係 ChatIQ AI 助手，今日有咩可以幫到您？',
                '你好呀！歡迎聯絡我哋，想了解產品、預約定優惠？',
                'Hi！多謝您搵我，請問有咩問題？',
                '您好！今日天氣咁好，係咪想睇下新款？我幫您介紹。'
            ]
        },
        hours: {
            words: ['幾點','營業','開門','關門','時間','幾點開','幾點關','開幾耐','營業時間','幾點收','几点','几点下班','几点开门','hour','open','close','幾點落','几点关门'],
            responses: [
                '我哋星期一至六 10:00-20:00 營業，星期日休息。而家就係營業時間，歡迎到店！',
                '營業時間：星期一至六朝早10點到晚8點。星期日同公眾假期休息。您大概幾點到？我幫您留位。',
                '朝早10點開，夜晚8點關，星期一至六開。星期日休息。如果想約專人介紹，建議 book 個時間。'
            ]
        },
        price: {
            words: ['幾錢','價錢','價格','幾多錢','多少錢','怎么賣','怎麼賣','how much','price','cost','幾多','貴唔貴','平唔平','价位','价格','多少钱','咋卖的','怎么卖的'],
            responses: null  // 動態生成
        },
        address: {
            words: ['邊度','地址','喺邊','在哪','在哪里','where','address','location','邊間舖','邊間店','怎麼去','怎么去','点去','點去','怎麼走','怎么走','map'],
            responses: [
                '我哋喺銅鑼灣恩平道28號2樓，港鐵銅鑼灣站A出口行3分鐘就到。門口有藍色招牌。',
                '地址：銅鑼灣時代廣場對面。港鐵F出口直行5分鐘。到咗打俾我哋，我落嚟接您。',
                '銅鑼灣恩平道28號。時代廣場隔離行過馬路就到。您搭港鐵最方便，A出口3分鐘。'
            ]
        },
        discount: {
            words: ['優惠','折扣','平啲','特價','減價','優惠碼','coupon','discount','promo','著數','抵買','幾錢減','有咩著數','什麼优惠','有优惠吗','便宜点','打折'],
            responses: null  // 動態生成
        },
        delivery: {
            words: ['送貨','郵寄','幾時到','幾時送到','運費','shipping','delivery','快遞','寄貨','幾號到','多久到','几天到','发什么快递','包邮吗','运费','包郵'],
            responses: [
                '滿 HK$500 免費送貨，1-2工作天到。唔滿 HK$500 運費 HK$30。順豐智能櫃都得，您邊個地址？我幫您睇邊種方式最快。',
                '本地訂單滿 HK$500 免運費，一般第二日就到。急單可以即日速遞，HK$50。要送邊度？',
                '送貨：滿 HK$500 免費，唔滿就 HK$30。順豐、智能櫃、門市自取都得。您鍾意邊種？'
            ]
        },
        return: {
            words: ['退','換','refund','return','exchange','退換','退貨','唔要','想退','壞咗','壞了','質量問題','有問題','7天','七日'],
            responses: [
                '收到貨7日內有任何問題都可以退換，品質問題全額退款。請保留單據同包裝，我哋安排上門回收。',
                '7日滿意保證：唔滿意可以退換。如果係品質問題，運費我哋出。您嘅訂單編號係幾多？我幫您查。',
                '7日內任何問題都可以退。過咗7日但係品質問題，我哋都會跟進。放心選購啦！'
            ]
        },
        pay: {
            words: ['付款','支付','pay','payment','信用卡','轉數快','fps','alipay','wechat','微信','支付寶','paypal','銀行','現金','點樣付','怎么付','如何付款','能用支付宝吗'],
            responses: [
                '我哋支援好多方法：Visa/Mastercard、轉數快 FPS、AlipayHK、WeChat Pay、PayPal、銀行轉賬，門市都收現金。',
                '付款好方便：信用卡、轉數快、支付寶、微信支付都得。網上下單即時過數，安全有保障。',
                '信用卡、FPS、AlipayHK、WeChat Pay、PayPal 全部支援。您鍾意邊種？'
            ]
        },
        stock: {
            words: ['現貨','有冇貨','存貨','stock','available','有貨嗎','有現貨嗎','幾時有貨','断货','没货了吗','有库存吗','现货'],
            responses: null
        },
        booking: {
            words: ['預約','book','appointment','訂位','約時間','预约','约时间','能约吗','怎么预约','要预约吗'],
            responses: [
                '可以預約！請講您想預約邊項服務同幾點方便。我幫您 book 位，確認後發提醒訊息俾您。',
                '預約好簡單：話我知日期、時間同服務項目就得。您今個星期幾方便？',
                '想 book 位嘅話，請講：1) 邊項服務 2) 日期時間。我即刻幫您安排。'
            ]
        },
        member: {
            words: ['會員','積分','member','vip','分數','入會','会员','积分','会员卡','怎么办会员'],
            responses: [
                '會員免費加入！即時95折，消費 HK$1 儲1分，1000分扣 HK$100。仲有生日禮同專屬折扣日。要幫您登記嗎？',
                '入會完全免費，即時有會員價。每消費1蚊儲1分，儲夠可以換產品。年費全免。',
                '成為會員即享95折 + 雙倍積分優惠。只需講您個名同電話就得，30秒搞掂。'
            ]
        },
        recommend: {
            words: ['推薦','介紹','推','recommend','suggest','邊款好','買邊款','推啥','推荐一下','有什么推荐','什么好','买哪个','选哪个'],
            responses: null
        },
        thanks: {
            words: ['多謝','谢谢','thank','thanks','thx','唔該','感谢','多谢','谢谢啦'],
            responses: [
                '唔客氣！有問題隨時搵我，收貨後記得分享感受喔！',
                '客氣啦！多謝支持。鍾意嘅話歡迎介紹朋友嚟，朋友都有優惠。',
                '唔使客氣！希望您鍾意，使用上有任何問題隨時聯絡我哋。'
            ]
        },
        bye: {
            words: ['拜拜','再见','bye','88','走了','拜拜啦','回見','回头见','下次聊','先这样'],
            responses: [
                '拜拜！多謝查詢，歡迎隨時再搵我。祝您有愉快嘅一日！',
                'Bye bye！有咩問題隨時返嚟搵我。再見！',
                '回見啦！多謝您嘅時間，祝生活愉快。'
            ]
        },
        complaint: {
            words: ['投訴','差','壞','唔滿意','退貨','欺騙','無人回','bad','terrible','angry','upset','差勁','垃圾','骗','呃人','质量差','服务差'],
            responses: null
        },
        priceQuery: {
            words: ['太貴','平啲','便宜','減價','優惠多啲','再減','too expensive','too pricey','能不能便宜','便宜点','太贵了','有点贵','打个折','再优惠'],
            responses: null
        },
        buyIntent: {
            words: ['要','想買','訂','落單','下單','我要','畀錢','買一個','畀我','帮我留','我订','我买','下单','怎么买','买它','就要这个'],
            responses: null
        },
        location: {
            words: ['銅鑼灣','旺角','尖沙咀','邊區','在哪区','分店','有几间店','哪里有店','你们在哪'],
            responses: [
                '我哋而家有銅鑼灣旗艦店同旺角分店。銅鑼灣係恩平道28號，旺角就係彌敦道636號。您邊間方便？',
                '銅鑼灣同旺角都有門市。銅鑼灣旗艦店最大，體驗產品最齊。旺角店就方便九龍嘅朋友。要邊間地址？'
            ]
        },
        hoursCheck: {
            words: ['而家開門','现在开门','开门吗','营业吗','开门了吗','今天开吗','今日開嗎','現在營業嗎','现在营业吗','休息吗','放假吗'],
            responses: [
                '而家就係營業時間！星期一至六 10:00-20:00。您係咪而家過嚟？我幫您留位。',
                '開緊門架！今日係營業日，10:00-20:00。歡迎隨時到店。'
            ]
        },
        productQuery: {
            words: ['咖啡杯','保溫壺','保溫杯','玻璃杯','托盤','香薰','錢包','杯','壺','盤','機','套裝','產品','款','系列','边个好','哪款'],
            responses: null
        }
    },

    // 中文繁簡混合模糊匹配
    normalize(s) {
        return (s||'').toLowerCase()
            .replace(/[？?！!。，,.\s~～]/g, '')
            .replace(/[的地得]/g, '')
            .trim();
    },

    // 計算意圖匹配分數
    scoreIntent(msg, intentWords) {
        const normalized = this.normalize(msg);
        let score = 0;
        for (const w of intentWords) {
            const nw = this.normalize(w);
            if (normalized === nw) score += 100;        // 完全匹配
            else if (normalized.includes(nw)) score += 20;  // 包含
            else if (nw.length >= 2 && this.fuzzyIncludes(normalized, nw)) score += 10; // 模糊
        }
        return score;
    },

    // 簡單模糊匹配（處理錯別字）
    fuzzyIncludes(text, word) {
        if (word.length < 2) return false;
        // 檢查連續2字是否有匹配
        for (let i = 0; i <= word.length - 2; i++) {
            if (!text.includes(word.substring(i, i+2))) return false;
        }
        return true;
    },

    pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; },

    generateReply(customerMessage, customerId) {
        const lang = this.detectLang(customerMessage||'');
        const result = this._generateReply(customerMessage, customerId);
        return this.localize(result, lang);
    },

    detectLang(msg) {
        const m = (msg||'').toLowerCase();
        if (/^[a-zA-Z0-9\s\?\!\.\,\'\"\-]+$/.test(m) && m.length > 3) return 'en';
        const cantonese = ['係','嘅','喺','咗','唔','咩','啲','俾','搵','嗰','嚟','咁','佢','哋','靚','喺邊','幾錢','邊度','唔該','唔要','唔好'];
        const mandarin = ['请问','怎么','我们','你们','什么','这个','那个','多少钱','哪里','可以','谢谢','你好','一下','现在','今天','明天','为什么'];
        let cs=0, ms=0;
        for (const w of cantonese) if (m.includes(w)) cs++;
        for (const w of mandarin) if (m.includes(w)) ms++;
        if (cs > ms) return 'zh-HK';
        if (ms > cs) return 'zh-CN';
        if (/[吗们说这个还过这]/.test(m)) return 'zh-CN';
        return 'zh-HK';
    },
    localize(text, lang) {
        if (lang === 'zh-HK') return text;
        if (lang === 'zh-CN') {
            return text.replace(/您好/g,'你好').replace(/我哋/g,'我们').replace(/您/g,'你')
                .replace(/係/g,'是').replace(/嘅/g,'的').replace(/喺/g,'在').replace(/咗/g,'了')
                .replace(/唔/g,'不').replace(/咩/g,'什么').replace(/啲/g,'些').replace(/俾/g,'给')
                .replace(/搵/g,'找').replace(/嗰/g,'那').replace(/嚟/g,'来').replace(/咁/g,'这么')
                .replace(/佢/g,'他').replace(/哋/g,'们').replace(/幾錢/g,'多少钱').replace(/邊度/g,'哪里')
                .replace(/唔該/g,'不客气').replace(/多謝/g,'谢谢').replace(/而家/g,'现在')
                .replace(/聽日/g,'明天').replace(/今日/g,'今天').replace(/買/g,'买').replace(/過/g,'过')
                .replace(/個/g,'个').replace(/點/g,'点').replace(/講/g,'说').replace(/睇/g,'看')
                .replace(/幫/g,'帮').replace(/優惠/g,'优惠').replace(/營業/g,'营业').replace(/時間/g,'时间')
                .replace(/開/g,'开').replace(/關/g,'关').replace(/送貨/g,'送货').replace(/客戶/g,'客户')
                .replace(/產品/g,'产品').replace(/訂/g,'订').replace(/單/g,'单');
        }
        return 'Thanks for your message! We will get back to you shortly. You can ask about pricing, location, opening hours, or delivery.';
    },

    _generateReply(customerMessage, customerId) {
        const msg = (customerMessage || '').trim();
        if (!msg) return '您好！我收到您嘅訊息，請講多啲詳情，我幫您處理。';
        const lang = this.detectLang(msg);
        if (!this.context[customerId]) this.context[customerId] = { history: [], lastTopic: null, lastProduct: null, lang: lang };
        const ctx = this.context[customerId];
        ctx.history.push(msg);
        if (ctx.history.length > 10) ctx.history.shift();
        ctx.lang = lang;

        // 1. 先打分所有意圖，取最高分
        let bestIntent = null, bestScore = 0;
        for (const [name, intent] of Object.entries(this.intents)) {
            const s = this.scoreIntent(msg, intent.words || []);
            if (s > bestScore) { bestScore = s; bestIntent = name; }
        }

        // 2. 分類處理
        if (bestScore >= 20) {
            switch (bestIntent) {
                case 'greeting': return this.personalize(this.pick(this.intents.greeting.responses), customerId);
                case 'hours': return this.personalize(this.pick(this.intents.hours.responses), customerId);
                case 'address': return this.personalize(this.pick(this.intents.address.responses), customerId);
                case 'discount': return this.dynamicDiscount(ctx, customerId);
                case 'delivery': return this.personalize(this.pick(this.intents.delivery.responses), customerId);
                case 'return': return this.personalize(this.pick(this.intents.return.responses), customerId);
                case 'pay': return this.personalize(this.pick(this.intents.pay.responses), customerId);
                case 'booking': return this.personalize(this.pick(this.intents.booking.responses), customerId);
                case 'member': return this.personalize(this.pick(this.intents.member.responses), customerId);
                case 'thanks': return this.pick(this.intents.thanks.responses);
                case 'bye': return this.pick(this.intents.bye.responses);
                case 'location': return this.pick(this.intents.location.responses);
                case 'hoursCheck': return this.pick(this.intents.hoursCheck.responses);
                case 'price': return this.dynamicPrice(ctx, customerId);
                case 'stock': return this.dynamicStock(ctx, customerId);
                case 'recommend': return this.dynamicRecommend(ctx, customerId);
                case 'complaint': return this.dynamicComplaint(ctx, customerId);
                case 'priceQuery': return this.dynamicBargain(ctx, customerId);
                case 'buyIntent': return this.dynamicBuy(ctx, customerId);
                case 'productQuery': return this.dynamicProductQuery(msg, ctx, customerId);
            }
        }

        // 3. 上下文相關：如果上次講過某產品，這次可能跟進
        if (ctx.lastProduct && ctx.history.length >= 2) {
            return this.followUpProduct(ctx, customerId);
        }

        // 4. 實在唔知講咩：主動追問，唔好死氣沉沉
        const openers = [
            `您好！我收到您嘅訊息：「${msg.substring(0, 20)}${msg.length > 20 ? '...' : ''}」。\n\n請問您想了解：\n1. 產品價錢\n2. 門市地址同營業時間\n3. 送貨安排\n4. 預約到店\n\n話我知號碼就得，我即刻幫您！`,
            '您好！多謝聯絡。我哋主要賣生活精品，價錢 HK$99 起。\n\n想我幫您做啲咩？\n• 介紹熱賣產品\n• 查詢價錢同現貨\n• 預約到店體驗\n• 其他查詢',
            'Hi！我係 AI 助手。睇嚟您有問題想問，不過我仲未完全明白。\n\n您可以：\n1. 問我產品資料（例如：「保溫壺幾錢」）\n2. 預約到店\n3. 查訂單狀態\n\n請講多啲！'
        ];
        return this.pick(openers);
    },

    // ===== 動態生成回覆 =====

    dynamicPrice(ctx, customerId) {
        // 如果提到具體產品
        for (const p of this.products) {
            if (ctx.history.join(' ').includes(p.name.substring(0,2)) || ctx.lastProduct === p.name) {
                ctx.lastProduct = p.name;
                const resp = `「${p.name}」HK$${p.price}。${p.tags.includes('禮物') ? `呢款好多人買嚟做禮物，送人好得體。` : ''}您想了解詳情定直接落單？`;
                return this.personalize(resp, customerId);
            }
        }
        // 一般價格查詢
        const resp = [
            `我哋產品由 HK$99 起到 HK$680 不等。熱賣嘅係：\n• 手工咖啡杯 HK$128\n• 保溫壺 HK$380\n• 香薰機 HK$450\n\n請問您想邊款？我發詳細資料俾您。`,
            `價錢範圍好大，HK$99 到 HK$680 都有。您大概預算幾多？我幫您揀最適合嘅。`,
            `入門款 HK$99-200，熱賣款 HK$200-500，高級款 HK$500+。您想送禮定自用？我推薦最夾嘅。`
        ];
        return this.personalize(this.pick(resp), customerId);
    },

    dynamicDiscount(ctx, customerId) {
        const resp = [
            `而家有緊優惠：\n🎉 新客首單9折\n🎉 滿 HK$500 減 HK$50\n🎉 買兩件95折、三件88折\n\n您想睇邊款？我幫您計最抵組合。`,
            `本月限定：新客9折 + 送小禮品。如果您今日落單，我再幫您申請會員價，額外5% off！要幫您book嗎？`,
            `而家著數好多：\n• 新客9折\n• 會員95折\n• 買滿 HK$500 免運費\n\n您而家落單最划算！想睇邊款？`
        ];
        ctx.lastTopic = 'discount';
        return this.personalize(this.pick(resp), customerId);
    },

    dynamicStock(ctx, customerId) {
        if (ctx.lastProduct) {
            return `「${ctx.lastProduct}」而家有現貨！今日落單今日出貨，最快聽日送到。要幫您留貨嗎？`;
        }
        return `我幫您查下——大部份熱賣款都有現貨！您想問邊款產品？話我知，我即刻幫您睇庫存。`;
    },

    dynamicRecommend(ctx, customerId) {
        const budget = ctx.budget;
        let picks;
        if (budget && budget < 200) {
            picks = this.products.filter(p => p.price <= 200);
        } else if (budget && budget > 500) {
            picks = this.products.filter(p => p.price >= 400);
        } else {
            picks = [this.products[1], this.products[4], this.products[3]]; // 熱賣
        }
        const list = picks.map(p => `• ${p.name} — HK$${p.price}`).join('\n');
        return `我幫您揀咗幾款熱賣：\n${list}\n\n請問您預算大概幾多？送禮定自用？我可以再精准推薦。`;
    },

    dynamicComplaint(ctx, customerId) {
        const resp = [
            `非常抱歉！我已經即刻轉專責同事，30分鐘內一定聯絡您。\n\n麻煩您話我知：\n1. 訂單編號\n2. 具體問題\n\n我哋一定俾您滿意處理方案。`,
            `對唔住！呢個情況我哋好重視。馬上安排人工主管跟進。請留低您嘅電話，我哋5分鐘內回覆。`,
            `很抱歉讓您有唔好體驗。7日內我哋包退包換，而家即刻幫您處理。請問訂單號碼係？`
        ];
        return this.pick(resp);
    },

    dynamicBargain(ctx, customerId) {
        const resp = [
            `明白！其實而家已經有新客9折。如果您今日確認，我再幫您申請會員價，總共大約 15% off。呢個係今個月最抵價了，要幫您申請嗎？`,
            `體諒體諒！您考慮入門款性價比最高。或者同朋友夾件買，三件88折，平均每件平好多。要我推薦套裝嗎？`,
            `了解！如果您係新客，頭單已經9折。我哋冇得再減，但可以送您小禮品（價值 HK$50）。要幫您落單嗎？`
        ];
        return this.pick(resp);
    },

    dynamicBuy(ctx, customerId) {
        const resp = [
            `好呀！幫您安排落單。\n\n請確認：\n1. 您想要邊款？（可以講名或者描述）\n2. 要幾多件？\n3. 送貨地址？\n\n今日落單今日出貨！`,
            `收到！AI 已為您創建草稿訂單。\n\n麻煩您講：\n• 產品名稱\n• 數量\n• 送邊個地址\n\n確認後我哋即時處理。`,
            `太好了！想幫您快啲完成。\n\n請話我知您要邊款產品，我即刻確認庫存同價錢，1分鐘內俾您付款連結。`
        ];
        return this.personalize(this.pick(resp), customerId);
    },

    dynamicProductQuery(msg, ctx, customerId) {
        for (const p of this.products) {
            if (msg.includes(p.name.substring(0,2)) || p.tags.some(t => msg.includes(t))) {
                ctx.lastProduct = p.name;
                return `「${p.name}」詳細資料：\n💰 價錢：HK$${p.price}\n📦 現貨：充足\n🏷️ 類別：${p.tags.join('、')}\n\n您想了解多啲，定直接落單？`;
            }
        }
        return this.dynamicRecommend(ctx, customerId);
    },

    followUpProduct(ctx, customerId) {
        const followUps = [
            `關於「${ctx.lastProduct}」，仲有咩想了解？價錢、送貨定現貨？我一次過答您。`,
            `您仲考慮緊「${ctx.lastProduct}」嗎？而家落單有新客9折，今日出貨。要幫您留嗎？`
        ];
        return this.pick(followUps);
    },

    personalize(reply, customerId) {
        // 這裡可以接入客戶等級資料，暫時保留原樣
        return reply;
    },

    // ===== 情緒分析 =====
    analyzeSentiment(message) {
        const msg = (message||'').toLowerCase();
        const positive = ['多謝','好','唔錯','滿意','thank','great','good','perfect','ok','nice','正','抵','愛','鍾意','喜歡','方便','快'];
        const negative = ['唔滿意','投訴','差','壞','退','差勁','bad','terrible','angry','upset','貴','呃人','騙','慢','垃圾','失望'];
        let score = 0;
        for (const w of positive) if (msg.includes(w)) score++;
        for (const w of negative) if (msg.includes(w)) score--;
        if (score > 0) return 'positive';
        if (score < 0) return 'negative';
        return 'neutral';
    },

    // ===== 意向評分 =====
    scoreLead(customerId, messages) {
        let score = 50;
        const allText = (messages||[]).map(m => (m.text||'').toLowerCase()).join(' ');
        const positive = ['想買','要','訂','幾時有','價錢','地址','ok','好','冇問題','想睇','點買','預約','幾號','幫我留','落單','下單','好呀','好的'];
        const negative = ['太貴','唔要','再講','考慮下','不用','不需要','算吧','再說','諗下','唔使'];
        for (const s of positive) if (allText.includes(s)) score += 7;
        for (const s of negative) if (allText.includes(s)) score -= 10;
        const customerMsgs = (messages||[]).filter(m => m.from === 'customer' || m.from_type === 'customer');
        score += Math.min(customerMsgs.length * 3, 15);
        return Math.max(5, Math.min(99, score));
    },

    // ===== 快捷回覆建議 =====
    suggestReplies(customerMessage) {
        const msg = (customerMessage||'').toLowerCase();
        if (msg.includes('價') || msg.includes('幾錢') || msg.includes('price'))
            return ['發送價目表','推薦熱賣套裝','提供新客優惠'];
        if (msg.includes('送') || msg.includes('郵寄') || msg.includes('delivery'))
            return ['確認送貨地址','發送運費說明','建議智能櫃自取'];
        if (msg.includes('好') || msg.includes('ok') || msg.includes('可以') || msg.includes('好呀'))
            return ['協助下單','發送付款連結','預約到店'];
        if (msg.includes('考慮') || msg.includes('諗下') || msg.includes('諗緊'))
            return ['發送限時優惠','提供免費試用','3日後跟進'];
        if (msg.includes('退') || msg.includes('壞') || msg.includes('差'))
            return ['轉人工跟進','安排退款','補寄新品'];
        return ['發送歡迎訊息','了解需求預算','邀請到店體驗'];
    },

    // ===== 跟進建議 =====
    generateFollowUp(customer) {
        if (!customer) return '建議：了解客戶需求後再跟進。';
        if (customer.grade === 'A')
            return `建議：${customer.name} 係高價值VIP，可推薦新產品或升級方案。保持每週互動。`;
        if (customer.tags?.includes('流失風險'))
            return `建議：${customer.name} 有流失風險，建議發8折券+個人問候挽回。`;
        if (customer.tags?.includes('需跟進'))
            return `建議：${customer.name} 比較中，建議今日發限時優惠製造緊迫感。`;
        return `建議：保持適度跟進，發送有用內容或季節優惠。`;
    }
};
