// ===== ChatIQ AI 模擬數據 =====

// 客戶數據
const customers = [
    {
        id: 'C001', name: '黃志明', phone: '+852 9123 4567', grade: 'A',
        totalSpent: 28400, orders: 12, lastContact: '2026-09-26',
        tags: ['高意向', '老客戶', '美容產品'], avatarColor: '#10b981',
        aiInsight: '客戶對高端產品接受度高，建議推薦最新護膚套裝。過去3個月消費增長45%，是VIP級別客戶。',
        sentiment: 'positive', location: '香港島', leadScore: 92, intentCategory: '高意向',
        timeline: [
            { time: '09-26 14:30', event: '咨詢新款精華液，AI自動回覆' },
            { time: '09-20 11:00', event: '購買面膜套裝 HK$1,280' },
            { time: '09-15 16:45', event: '人工跟進，客戶表示滿意' }
        ]
    },
    {
        id: 'C002', name: '李美玲', phone: '+852 6234 5678', grade: 'A',
        totalSpent: 19200, orders: 8, lastContact: '2026-09-27',
        tags: ['高意向', '需跟進', '健身課程'], avatarColor: '#10b981',
        aiInsight: '客戶正在比較3家健身中心，價格敏感度中等。建議今日內發出優惠方案，成交概率78%。',
        sentiment: 'neutral', location: '九龍', leadScore: 35, intentCategory: '低意向',
        timeline: [
            { time: '09-27 10:15', event: '詢問私人教練課程價格' },
            { time: '09-25 09:30', event: 'AI自動回覆營業時間' },
            { time: '09-22 18:00', event: '預約體驗課' }
        ]
    },
    {
        id: 'C003', name: '張偉強', phone: '+852 5345 6789', grade: 'B',
        totalSpent: 8600, orders: 5, lastContact: '2026-09-24',
        tags: ['已報價', '潛在客戶'], avatarColor: '#2563eb',
        aiInsight: '客戶對報價反應積極，但預算有限。建議提供分期方案或入門級產品，成交概率62%。',
        sentiment: 'positive', location: '新界', leadScore: 65, intentCategory: '中意向',
        timeline: [
            { time: '09-24 15:00', event: '收到報價，表示需要考慮' },
            { time: '09-23 11:20', event: '咨詢產品規格' }
        ]
    },
    {
        id: 'C004', name: '陳淑儀', phone: '+852 9456 7890', grade: 'B',
        totalSpent: 5400, orders: 3, lastContact: '2026-09-27',
        tags: ['高意向', '新客戶'], avatarColor: '#2563eb',
        aiInsight: '新客戶，首次咨詢就表現強烈購買意圖。建議快速回覆並提供新客戶優惠，成交概率85%。',
        sentiment: 'positive', location: '香港島', leadScore: 92, intentCategory: '高意向',
        timeline: [
            { time: '09-27 09:00', event: '首次發訊息，詢問產品詳情' },
            { time: '09-27 09:02', event: 'AI自動回覆，客戶繼續追問' }
        ]
    },
    {
        id: 'C005', name: '林家豪', phone: '+852 6567 8901', grade: 'C',
        totalSpent: 1200, orders: 1, lastContact: '2026-09-10',
        tags: ['一般客戶'], avatarColor: '#94a3b8',
        aiInsight: '客戶只購買過一次低價產品，近期無互動。可發送促銷信息嘗試喚醒，預計回覆率20%。',
        sentiment: 'neutral', location: '九龍', leadScore: 35, intentCategory: '低意向',
        timeline: [
            { time: '09-10 14:00', event: '購買單品 HK$1,200' }
        ]
    },
    {
        id: 'C006', name: '王詠詩', phone: '+852 9678 9012', grade: 'lead',
        totalSpent: 0, orders: 0, lastContact: '2026-09-27',
        tags: ['潛在客戶', '高意向', '留學咨詢'], avatarColor: '#f59e0b',
        aiInsight: '留學咨詢客戶，目標明確（英國碩士），預算充足。建議立即轉人工顧問跟進，成交概率90%。',
        sentiment: 'positive', location: '香港島', leadScore: 92, intentCategory: '高意向',
        timeline: [
            { time: '09-27 11:30', event: '咨詢英國留學申請服務' },
            { time: '09-27 11:31', event: 'AI自動回覆，客戶預約顧問' }
        ]
    },
    {
        id: 'C007', name: '鄭凱文', phone: '+852 5789 0123', grade: 'B',
        totalSpent: 12800, orders: 6, lastContact: '2026-09-26',
        tags: ['老客戶', '餐飲設備'], avatarColor: '#2563eb',
        aiInsight: '餐廳老闆，定期採購設備。上次採購後30天，建議主動聯繫了解新需求，復購概率70%。',
        sentiment: 'positive', location: '九龍', leadScore: 72, intentCategory: '中意向',
        timeline: [
            { time: '09-26 10:00', event: '查詢保養服務' },
            { time: '08-28 15:00', event: '採購廚具 HK$8,000' }
        ]
    },
    {
        id: 'C008', name: '何麗華', phone: '+852 6890 1234', grade: 'C',
        totalSpent: 600, orders: 1, lastContact: '2026-09-05',
        tags: ['一般客戶', '流失風險'], avatarColor: '#94a3b8',
        aiInsight: '⚠️ 流失風險：超過20天無互動，且只消費過一次。建議發送個人化優惠券挽回。',
        sentiment: 'negative', location: '新界', leadScore: 25, intentCategory: '低意向',
        timeline: [
            { time: '09-05 12:00', event: '購買特價商品 HK$600' }
        ]
    }
];

// 對話數據
const conversations = [
    {
        id: 'conv1', customerId: 'C004', customerName: '陳淑儀', unread: 2, status: 'ai',
        lastMessage: '請問這個產品有現貨嗎？我想今日買', lastTime: '09:20',
        messages: [
            { from: 'customer', text: '你好，我想問下你哋嘅精華液幾錢？', time: '09:15' },
            { from: 'ai', text: '您好！我們的精華液有兩款：\n\n✨ 保濕精華 HK$380/30ml\n✨ 抗皺精華 HK$520/30ml\n\n請問您關注哪方面的護膚需求呢？我可以為您推薦最適合的款式。', time: '09:15', tag: 'AI' },
            { from: 'customer', text: '我想要保濕嗰隻，有冇現貨？', time: '09:18' },
            { from: 'customer', text: '請問這個產品有現貨嗎？我想今日買', time: '09:20' }
        ]
    },
    {
        id: 'conv2', customerId: 'C006', customerName: '王詠詩', unread: 1, status: 'ai',
        lastMessage: '好的，那我明天下午過來', lastTime: '11:45',
        messages: [
            { from: 'customer', text: '你好，我想咨詢英國留學申請', time: '11:30' },
            { from: 'ai', text: '您好！很高興為您服務。我們提供英國留學全流程服務，包括選校、文書、申請、簽證。請問您目前是什麼學歷背景？想申請什麼專業呢？', time: '11:30', tag: 'AI' },
            { from: 'customer', text: '我而家讀緊Year 3，GPA 3.5，想申請Business相關碩士', time: '11:35' },
            { from: 'ai', text: '您的背景很不錯！GPA 3.5申請英國Top 30大學的Business碩士很有競爭力。我們的資深顧問可以為您做免費評估。請問您方便預約一個顧問咨詢嗎？我們可以安排明天下午3點。', time: '11:36', tag: 'AI' },
            { from: 'customer', text: '好的，那我明天下午過來', time: '11:45' }
        ]
    },
    {
        id: 'conv3', customerId: 'C002', customerName: '李美玲', unread: 0, status: 'human',
        lastMessage: '我考慮一下，遲啲回覆你', lastTime: '昨天',
        messages: [
            { from: 'customer', text: '請問私人教練課程幾錢一堂？', time: '昨天 15:00' },
            { from: 'ai', text: '您好！我們的私人教練課程：\n\n💪 單堂 HK$500\n💪 10堂套票 HK$4,200（慳HK$800）\n💪 20堂套票 HK$7,600（慳HK$2,400）\n\n首次體驗堂只需 HK$99，要幫您預約嗎？', time: '昨天 15:01', tag: 'AI' },
            { from: 'customer', text: '10堂同20堂分別幾多錢一堂？', time: '昨天 15:10' },
            { from: 'agent', text: '美玲你好！10堂套票平均HK$420/堂，20堂套票平均HK$380/堂。如果您是認真想練出效果，20堂套票最划算，而且我們會免費贈送身體成分分析和飲食建議。要我幫您安排體驗堂先感受下嗎？', time: '昨天 15:20' },
            { from: 'customer', text: '我考慮一下，遲啲回覆你', time: '昨天 15:30' }
        ]
    },
    {
        id: 'conv4', customerId: 'C001', customerName: '黃志明', unread: 0, status: 'ai',
        lastMessage: '多謝！咁我聽日去攞貨', lastTime: '昨天',
        messages: [
            { from: 'customer', text: '新款精華液到貨未？', time: '昨天 14:00' },
            { from: 'ai', text: '黃先生您好！新款保濕精華已經到貨啦 🎉 您是我們的VIP客戶，可以享受85折優惠，原價HK$380，優惠價HK$323。要幫您留一支嗎？', time: '昨天 14:01', tag: 'AI' },
            { from: 'customer', text: '多謝！咁我聽日去攞貨', time: '昨天 14:05' }
        ]
    },
    {
        id: 'conv5', customerId: 'C003', customerName: '張偉強', unread: 0, status: 'human',
        lastMessage: '個價錢可以再平啲嗎？', lastTime: '09-24',
        messages: [
            { from: 'customer', text: '我想訂100個貨架，報價幾多？', time: '09-24 10:00' },
            { from: 'agent', text: '張先生您好！100個貨架的批發價是HK$45,000，包含送貨和安裝。如果今天確認訂單，可以額外贈送5個備用層板。', time: '09-24 11:00' },
            { from: 'customer', text: '個價錢可以再平啲嗎？', time: '09-24 15:00' }
        ]
    },
    {
        id: 'conv6', customerId: 'C007', customerName: '鄭凱文', unread: 1, status: 'ai',
        lastMessage: '好，那下個月再見', lastTime: '昨天',
        messages: [
            { from: 'customer', text: '你好，想問下廚具保養服務幾錢？', time: '昨天 10:00' },
            { from: 'ai', text: '鄭先生您好！我們的廚具保養服務：\n• 單次檢查 HK$800\n• 年度保養計劃 HK$3,800（4次上門，包更換消耗品）\n\n您係餐廳老闆，建議年度計劃最划算，平均每次 HK$950。要幫您預約上門嗎？', time: '昨天 10:01', tag: 'AI' },
            { from: 'customer', text: '年度計劃包唔包零件？', time: '昨天 10:15' },
            { from: 'ai', text: '包嘅！年度計劃包埋常用消耗零件（門鉸、密封圈、爐頭火蓋），人工都包。大型維修先需要額外報價。\n\n您想約幾號上門？我幫您book優先時段。', time: '昨天 10:16', tag: 'AI' },
            { from: 'customer', text: '我考慮下，下個月先再訂', time: '昨天 10:30' },
            { from: 'ai', text: '冇問題！我幫您記低，下個月1號會發提醒同最新優惠俾您。到時有新客/回頭客優惠，可能再平少少。', time: '昨天 10:31', tag: 'AI' },
            { from: 'customer', text: '好，那下個月再見', time: '昨天 10:35' }
        ]
    },
    {
        id: 'conv7', customerId: 'C005', customerName: '林家豪', unread: 0, status: 'ai',
        lastMessage: '收到，多謝', lastTime: '09-25',
        messages: [
            { from: 'customer', text: '你好，上次買嘅產品想退換', time: '09-25 14:00' },
            { from: 'ai', text: '林先生您好！請問係咩問題呢？我哋7日內可以免費退換。麻煩您提供：\n1. 訂單編號\n2. 產品名稱\n3. 問題情況（最好附相）\n\n我幫您即刻安排。', time: '09-25 14:01', tag: 'AI' },
            { from: 'customer', text: '訂單係ORD20260915004，產品個蓋唔緊', time: '09-25 14:15' },
            { from: 'ai', text: '收到！ORD20260915004 我幫您查到了。呢個情況屬於品質問題，我哋全數退換，唔使您俾錢。\n\n兩個選擇：\nA. 我哋上門換新（明日下午）\nB. 您拿去銅鑼灣門市即場換\n\n您揀邊個？', time: '09-25 14:16', tag: 'AI' },
            { from: 'customer', text: '上門啦，麻煩你', time: '09-25 14:20' },
            { from: 'ai', text: '好！已幫您預約明日下午2-4點上門更換。師傅會帶新產品同收據。提醒訊息會提前發俾您。', time: '09-25 14:21', tag: 'AI' },
            { from: 'customer', text: '收到，多謝', time: '09-25 14:25' }
        ]
    },
    {
        id: 'conv8', customerId: 'C008', customerName: '何麗華', unread: 0, status: 'human',
        lastMessage: '不用了，謝謝', lastTime: '09-20',
        messages: [
            { from: 'agent', text: '何小姐您好！好耐冇聯絡啦。最近我哋新到一批產品，專為舊客戶預留了9折優惠。想了解下您最近有咩需要？', time: '09-20 11:00' },
            { from: 'customer', text: '最近冇咩需要', time: '09-20 15:00' },
            { from: 'agent', text: '明白！我唔騷擾您。如果之後有需要，隨時搵我。另外送您一張8折券，30日有效，作為心意。', time: '09-20 15:30' },
            { from: 'customer', text: '不用了，謝謝', time: '09-20 16:00' }
        ]
    }
];

// 訂單數據
const orders = [
    { id: 'ORD20260927001', customerId: 'C004', customerName: '陳淑儀', product: '保濕精華液 30ml', amount: 323, status: 'pending', time: '2026-09-27 09:22', aiGenerated: true },
    { id: 'ORD20260927002', customerId: 'C006', customerName: '王詠詩', product: '留學評估服務（免費）', amount: 0, status: 'confirmed', time: '2026-09-27 11:50', aiGenerated: true },
    { id: 'ORD20260926001', customerId: 'C001', customerName: '黃志明', product: '新款保濕精華液', amount: 323, status: 'confirmed', time: '2026-09-26 14:10', aiGenerated: true },
    { id: 'ORD20260925003', customerId: 'C007', customerName: '鄭凱文', product: '廚具保養服務', amount: 1500, status: 'completed', time: '2026-09-25 10:30' },
    { id: 'ORD20260924001', customerId: 'C003', customerName: '張偉強', product: '貨架 x100（報價中）', amount: 45000, status: 'pending', time: '2026-09-24 11:00' },
    { id: 'ORD20260922002', customerId: 'C002', customerName: '李美玲', product: '健身體驗堂', amount: 99, status: 'completed', time: '2026-09-22 18:00', aiGenerated: true },
    { id: 'ORD20260920001', customerId: 'C001', customerName: '黃志明', product: '面膜套裝', amount: 1280, status: 'completed', time: '2026-09-20 11:00' },
    { id: 'ORD20260915004', customerId: 'C005', customerName: '林家豪', product: '單品 x1', amount: 1200, status: 'completed', time: '2026-09-15 14:00' },
    { id: 'ORD20260910002', customerId: 'C008', customerName: '何麗華', product: '特價商品', amount: 600, status: 'cancelled', time: '2026-09-10 12:00' }
];

// 高意向潛在客戶
const hotLeads = [
    { name: '陳淑儀', desc: '新客戶，強烈購買意圖，詢問現貨', score: '95%', customerId: 'C004' },
    { name: '王詠詩', desc: '留學咨詢，已預約顧問，預算充足', score: '90%', customerId: 'C006' },
    { name: '李美玲', desc: '比較3家健身中心，需今日發優惠', score: '78%', customerId: 'C002' },
    { name: '張偉強', desc: '大額訂單議價中，建議讓步5%', score: '62%', customerId: 'C003' }
];

// 提醒
const alerts = [
    { type: 'warning', text: '李美玲超過24小時未回覆，建議跟進', time: '1小時前' },
    { type: 'danger', text: '何麗華有流失風險，超過20天無互動', time: '3小時前' },
    { type: 'info', text: '黃志明的訂單已確認，待出貨', time: '昨天' },
    { type: 'warning', text: '張偉強的大額訂單等待回覆超過48小時', time: '昨天' }
];

// 通知
const notifications = [
    { title: '🤖 AI 自動創建了訂單', desc: '陳淑儀的保濕精華液訂單已自動生成', time: '5分鐘前', unread: true },
    { title: '🔥 發現高意向客戶', desc: '王詠詩成交概率90%，建議立即跟進', time: '30分鐘前', unread: true },
    { title: '📦 新訂單待確認', desc: '黃志明的訂單需要您確認出貨', time: '2小時前', unread: true },
    { title: '⚠️ 客戶流失預警', desc: '何麗華超過20天無互動', time: '昨天', unread: false },
    { title: '✅ 本週經營簡報已生成', desc: '點擊查看本週數據分析', time: '昨天', unread: false }
];

// 熱門問題
const hotQuestions = [
    { text: '營業時間是什麼？', count: 186 },
    { text: '產品價格是多少？', count: 152 },
    { text: '有沒有優惠/折扣？', count: 124 },
    { text: '如何下單/預約？', count: 98 },
    { text: '送貨需要多長時間？', count: 76 },
    { text: '可以退換貨嗎？', count: 54 },
    { text: '接受什麼付款方式？', count: 42 }
];

// 趨勢數據
const trendData = {
    dates: ['09-21', '09-22', '09-23', '09-24', '09-25', '09-26', '09-27'],
    messages: [120, 145, 132, 168, 195, 210, 177],
    conversions: [28, 35, 30, 42, 55, 60, 48],
    revenue: [12000, 15800, 13500, 18200, 22000, 25400, 18500]
};
