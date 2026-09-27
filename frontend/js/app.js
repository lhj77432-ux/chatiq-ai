// ===== ChatIQ AI 主應用 =====
// 數據持久化
function saveData() {
    try {
        localStorage.setItem('chatiq_customers', JSON.stringify(customers));
        localStorage.setItem('chatiq_orders', JSON.stringify(orders));
        localStorage.setItem('chatiq_conversations', JSON.stringify(conversations));
    } catch(e) {}
}
function loadData() {
    try {
        var c = localStorage.getItem('chatiq_customers');
        if (c) customers = JSON.parse(c);
        var o = localStorage.getItem('chatiq_orders');
        if (o) orders = JSON.parse(o);
        var cv = localStorage.getItem('chatiq_conversations');
        if (cv) conversations = JSON.parse(cv);
    } catch(e) {}
}

let currentPage = 'dashboard';
let currentConversation = null;
let currentChatFilter = 'all';
let charts = {};

// ===== 登入/登出 =====
function doLogin() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    initDashboard();
    showToast('歡迎使用 ChatIQ AI！');
}

function doLogout() {
    document.getElementById('app').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
}

// ===== 頁面切換 =====
function switchPage(page) {
    currentPage = page;
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector('.nav-item[data-page="' + page + '"]').classList.add('active');

    const titles = {
        'dashboard': '數據總覽',
        'conversations': '對話管理',
        'customers': '客戶管理',
        'orders': '訂單管理',
        'analytics': '數據分析',
        'ai-settings': 'AI 設定',
        'broadcast': '營銷推廣',
    'products': '產品目錄'
    };
    document.getElementById('pageTitle').textContent = titles[page] || '';

    document.getElementById('sidebar').classList.remove('open');

    if (page === 'dashboard') initDashboard();
    if (page === 'conversations') renderChatList();
    if (page === 'customers') renderCustomers();
    if (page === 'orders') renderOrders();
    if (page === 'analytics') initAnalytics();
    if (page === 'broadcast') renderBroadcastCount();
    if (page === 'products') renderProducts();
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

// ===== Dashboard =====
function initDashboard() {
    renderTrendChart();
    renderPieChart();
    renderLeadList();
    renderAlertList();
}

function renderTrendChart() {
    const el = document.getElementById('trendChart');
    if (!el) return;
    if (charts.trend) charts.trend.dispose();
    charts.trend = echarts.init(el);
    charts.trend.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['對話數', '成交數', '營業額'], bottom: 0 },
        grid: { left: 50, right: 50, top: 20, bottom: 40 },
        xAxis: { type: 'category', data: trendData.dates },
        yAxis: [
            { type: 'value', name: '數量' },
            { type: 'value', name: '金額', position: 'right' }
        ],
        series: [
            { name: '對話數', type: 'bar', data: trendData.messages, itemStyle: { color: '#818cf8', borderRadius: [6,6,0,0] } },
            { name: '成交數', type: 'line', data: trendData.conversions, itemStyle: { color: '#16a34a' }, smooth: true, lineStyle: { width: 3 } },
            { name: '營業額', type: 'line', yAxisIndex: 1, data: trendData.revenue, itemStyle: { color: '#d97706' }, smooth: true, lineStyle: { width: 3 } }
        ]
    });
}

function renderPieChart() {
    const el = document.getElementById('pieChart');
    if (!el) return;
    if (charts.pie) charts.pie.dispose();
    charts.pie = echarts.init(el);
    charts.pie.setOption({
        tooltip: { trigger: 'item' },
        legend: { bottom: 0 },
        series: [{
            type: 'pie',
            radius: ['45%', '70%'],
            center: ['50%', '45%'],
            label: { formatter: '{b}: {c}人 ({d}%)' },
            itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
            data: [
                { value: 12, name: 'A級', itemStyle: { color: '#4f46e5' } },
                { value: 45, name: 'B級', itemStyle: { color: '#0891b2' } },
                { value: 210, name: 'C級', itemStyle: { color: '#a1a1aa' } },
                { value: 61, name: '潛在客戶', itemStyle: { color: '#ea580c' } }
            ]
        }]
    });
}

function renderLeadList() {
    const el = document.getElementById('leadList');
    el.innerHTML = hotLeads.map(function(lead) {
        return '<div class="lead-item" onclick="openCustomerDetail(\'' + lead.customerId + '\')">' +
            '<div class="lead-avatar">' + lead.name.charAt(0) + '</div>' +
            '<div class="lead-info"><div class="lead-name">' + lead.name + '</div>' +
            '<div class="lead-desc">' + lead.desc + '</div></div>' +
            '<span class="lead-score">' + lead.score + '</span></div>';
    }).join('');
}

function renderAlertList() {
    const el = document.getElementById('alertList');
    el.innerHTML = alerts.map(function(a) {
        return '<div class="alert-item ' + a.type + '">' +
            '<div><div style="font-size:13px;">' + a.text + '</div>' +
            '<div style="font-size:11px;color:var(--text-3);margin-top:2px;">' + a.time + '</div></div></div>';
    }).join('');
}

// ===== 對話管理 =====
function renderChatList() {
    const el = document.getElementById('chatConversations');
    let list = conversations;
    if (currentChatFilter === 'unread') list = list.filter(function(c) { return c.unread > 0; });
    if (currentChatFilter === 'ai') list = list.filter(function(c) { return c.status === 'ai'; });
    if (currentChatFilter === 'human') list = list.filter(function(c) { return c.status === 'human'; });

    el.innerHTML = list.map(function(conv) {
        var unreadCls = conv.unread > 0 ? 'unread' : '';
        var activeCls = currentConversation === conv.id ? 'active' : '';
        var aiBadge = conv.status === 'ai' ? '<span class="ai-handling">AI 處理中</span>' : '';
        var unreadBadge = conv.unread > 0 ? '<span class="chat-conv-badge">' + conv.unread + '</span>' : '';
        return '<div class="chat-conv-item ' + unreadCls + ' ' + activeCls + '" onclick="openConversation(\'' + conv.id + '\')">' +
            '<div class="chat-conv-avatar">' + conv.customerName.charAt(0) + '</div>' +
            '<div class="chat-conv-info"><div class="chat-conv-name">' + conv.customerName +
            '<span class="chat-conv-time">' + conv.lastTime + '</span></div>' +
            '<div class="chat-conv-preview">' + conv.lastMessage + '</div>' + aiBadge + unreadBadge + '</div></div>';
    }).join('');
}

function filterChatTab(tab, el) {
    currentChatFilter = tab;
    document.querySelectorAll('.chat-tab').forEach(function(t) { t.classList.remove('active'); });
    el.classList.add('active');
    renderChatList();
}

function filterChats() {
    var query = document.getElementById('chatSearch').value.toLowerCase();
    document.querySelectorAll('.chat-conv-item').forEach(function(item) {
        var name = item.querySelector('.chat-conv-name').textContent.toLowerCase();
        item.style.display = name.includes(query) ? '' : 'none';
    });
}

function openConversation(convId) {
    var c = conversations.find(function(x) { return x.id === convId; });
    if (c && c.status === 'human') { setTimeout(showAiAssist, 300); } else { var ap = document.getElementById('aiAssistPanel'); if (ap) ap.style.display = 'none'; }
    currentConversation = convId;
    var conv = conversations.find(function(c) { return c.id === convId; });
    if (!conv) return;

    conv.unread = 0;
    updateUnreadBadge();
    renderChatList();

    var statusText = conv.status === 'ai' ? 'AI 自動回覆中' : '人工服務中';
    document.getElementById('chatHeader').innerHTML =
        '<div style="display:flex;align-items:center;gap:10px;">' +
        '<div class="chat-conv-avatar" style="width:32px;height:32px;font-size:12px;">' + conv.customerName.charAt(0) + '</div>' +
        '<div><div>' + conv.customerName + '</div>' +
        '<div style="font-size:11px;color:var(--text-2);font-weight:400;">' + statusText + '</div></div></div>' +
        '<button class="btn-secondary btn-sm" onclick="viewCustomerFromChat(\'' + conv.customerId + '\')">查看客戶資料</button>';

    var msgsEl = document.getElementById('chatMessages');
    msgsEl.innerHTML = conv.messages.map(function(m) {
        var tag = m.tag ? '<span class="msg-tag ai-tag">' + m.tag + '</span>' : '';
        return '<div class="msg ' + m.from + '">' + m.text.replace(/\n/g, '<br>') + tag +
            '<div class="msg-time">' + m.time + '</div></div>';
    }).join('');
    msgsEl.scrollTop = msgsEl.scrollHeight;

    document.getElementById('chatInputArea').style.display = 'block';
    renderAISuggestions(conv);
}

function renderAISuggestions(conv) {
    var el = document.getElementById('aiSuggestions');
    var lastCustomerMsg = conv.messages.filter(function(m) { return m.from === 'customer'; }).pop();
    if (!lastCustomerMsg) { el.innerHTML = ''; return; }
    var suggestions = AIEngine.suggestReplies(lastCustomerMsg.text);
    el.innerHTML = suggestions.map(function(s) {
        return '<button class="ai-suggestion" onclick="useSuggestion(\'' + s + '\')">' + s + '</button>';
    }).join('');
}

function useSuggestion(text) {
    document.getElementById('chatInput').value = text;
}

function aiGenerateReply() {
    if (!currentConversation) return;
    var conv = conversations.find(function(c) { return c.id === currentConversation; });
    var lastCustomerMsg = conv.messages.filter(function(m) { return m.from === 'customer'; }).pop();
    if (!lastCustomerMsg) return;
    var reply = AIEngine.generateReply(lastCustomerMsg.text, conv.customerId);
    document.getElementById('chatInput').value = reply;
    showToast('AI 已生成回覆，請確認後發送');
}

var autoReplyOn = true;

// 中央自動回覆：只要對話狀態是 ai 且最後一條是客戶發的，就自動回
function autoReplyIfNeeded(conv) {
    if (!conv || conv.status !== 'ai' || !autoReplyOn) return;
    var lastMsg = conv.messages[conv.messages.length - 1];
    if (!lastMsg || lastMsg.from !== 'customer') return;
    // 快速回覆，800ms 內響應
    setTimeout(async function() {
        var ai = await AIEngine.generateReplyAsync(lastMsg.text, conv.customerId);
        var t = new Date();
        var tm = t.getHours().toString().padStart(2,'0')+':'+t.getMinutes().toString().padStart(2,'0');
        conv.messages.push({from:'agent', text:ai, time:tm, tag:'AI'});
        conv.lastMessage = ai; conv.lastTime = tm; conv.unread = 0;
        if (currentConversation === conv.id) openConversation(conv.id);
        renderChatList(); updateUnreadBadge(); saveData();
    }, 800);
}
function sendMessage() {
    var input = document.getElementById('chatInput');
    var text = input.value.trim();
    if (!text || !currentConversation) return;
    var conv = conversations.find(function(c) { return c.id === currentConversation; });
    var now = new Date();
    var time = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
    conv.messages.push({ from: 'agent', text: text, time: time });
    conv.lastMessage = text; conv.lastTime = time;
    input.value = '';
    openConversation(currentConversation); renderChatList(); saveData();
    setTimeout(function() {
        var replies = ['你好，請問保溫壺幾錢？','有冇優惠？','幾時送到？','你們店在哪？','買兩件有折扣嗎？','我考慮下先'];
        var r = replies[Math.floor(Math.random()*replies.length)];
        conv.messages.push({ from: 'customer', text: r, time: time });
        conv.lastMessage = r; openConversation(currentConversation); renderChatList(); saveData();
        autoReplyIfNeeded(conv);
    }, 1000);
}
function simulateNewCustomer() {
    var samples = [
        { name: '陳小姐', msg: '你好，保溫壺幾錢？' },
        { name: 'Mr. Lee', msg: 'Hi, is the coffee cup in stock?' },
        { name: '黃生', msg: '請問幾點開門？' },
        { name: 'Mary', msg: '送貨要幾耐？' }
    ];
    var s = samples[Math.floor(Math.random()*samples.length)];
    var newId = 'conv'+Date.now();
    var now = new Date();
    var time = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
    var nc = { id: newId, customerId: 'C'+Date.now(), customerName: s.name, lastMessage: s.msg, lastTime: time, unread: 1, status: 'ai', messages: [{from:'customer',text:s.msg,time:time}] };
    conversations.unshift(nc);
    renderChatList(); updateUnreadBadge(); saveData();
    showToast('新客戶 '+s.name+' 來訊，AI 自動回覆中...');
    autoReplyIfNeeded(nc);
}
function toggleAutoReply() {
    autoReplyOn = !autoReplyOn;
    showToast(autoReplyOn ? 'AI 自動回覆已開啟' : 'AI 自動回覆已關閉');
    var el = document.getElementById('autoReplyToggle');
    if (el) el.textContent = autoReplyOn ? '自動回覆：開啟' : '自動回覆：關閉';
}

function addTag(tag) {
    showToast('已添加標籤：' + tag);
}

function takeOver() {
    if (!currentConversation) return;
    var conv = conversations.find(function(c) { return c.id === currentConversation; });
    conv.status = 'human';
    openConversation(currentConversation);
    renderChatList();
    showToast('已轉人工服務，AI 將暫停自動回覆');
    setTimeout(showAiAssist, 500);
}
function resumeAI() {
    if (!currentConversation) return;
    var conv = conversations.find(function(c) { return c.id === currentConversation; });
    conv.status = 'ai';
    document.getElementById('aiAssistPanel').style.display = 'none';
    openConversation(currentConversation);
    renderChatList();
    showToast('已恢復 AI 自動回覆');
    autoReplyIfNeeded(conv);
}

function addInternalNote() {
    if (!currentConversation) return;
    var note = prompt('輸入內部備註（客戶看不到）：');
    if (!note) return;
    var conv = conversations.find(function(c) { return c.id === currentConversation; });
    conv.internalNote = note;
    showToast('內部備註已保存');
    saveData();
}

function viewCustomerFromChat(customerId) {
    openCustomerDetail(customerId);
}

function updateUnreadBadge() {
    var total = conversations.reduce(function(sum, c) { return sum + c.unread; }, 0);
    var badge = document.getElementById('unreadBadge');
    badge.textContent = total;
    badge.style.display = total > 0 ? '' : 'none';
}

// ===== 客戶管理 =====
function renderCustomers() {
    var filter = document.getElementById('customerFilter').value;
    var search = document.getElementById('customerSearch').value.toLowerCase();
    var list = customers;

    if (filter !== 'all') list = list.filter(function(c) { return c.grade === filter; });
    if (search) list = list.filter(function(c) {
        return c.name.toLowerCase().includes(search) || c.phone.includes(search);
    });

    var gradeLabels = { A: 'A級', B: 'B級', C: 'C級', lead: '潛在' };
    var gradeClasses = { A: 'grade-badge-A', B: 'grade-badge-B', C: 'grade-badge-C', lead: 'grade-badge-lead' };

    var el = document.getElementById('customerGrid');
    el.innerHTML = list.map(function(c) {
        var tagsHtml = c.tags.map(function(t) {
            var cls = t.includes('高意向') ? 'hot' : '';
            if (t.includes('跟進')) cls += ' need-follow';
            return '<span class="customer-tag ' + cls + '">' + t + '</span>';
        }).join('');
        return '<div class="customer-card" onclick="openCustomerDetail(\'' + c.id + '\')">' +
            '<div class="customer-card-header">' +
            '<div class="customer-avatar grade-' + c.grade + '">' + c.name.charAt(0) + '</div>' +
            '<div style="flex:1;"><div class="customer-name">' + c.name + '</div>' +
            '<div class="customer-phone">' + c.phone + '</div></div>' +
            '<span class="customer-grade ' + gradeClasses[c.grade] + '">' + gradeLabels[c.grade] + '</span></div>' +
            '<div style="display:flex;align-items:center;gap:6px;margin:8px 0 4px;">' +
            '<span style="font-size:11px;color:var(--text-2);">意向</span>' +
            '<span style="font-size:11px;font-weight:600;color:' + (c.leadScore>=80?'#dc2626':c.leadScore>=60?'#ea580c':'#a1a1aa') + ';">' + (c.intentCategory||'未分級') + '</span>' +
            '<div style="flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden;">' +
            '<div style="width:' + (c.leadScore||50) + '%;height:100%;background:' + (c.leadScore>=80?'#dc2626':c.leadScore>=60?'#ea580c':'#a1a1aa') + ';border-radius:2px;"></div></div>' +
            '<span style="font-size:11px;font-weight:600;">' + (c.leadScore||50) + '</span></div>' +
            '<div class="customer-meta">' +
            '<div class="customer-meta-item">消費額<strong>HK$ ' + c.totalSpent.toLocaleString() + '</strong></div>' +
            '<div class="customer-meta-item">訂單數<strong>' + c.orders + ' 單</strong></div>' +
            '<div class="customer-meta-item">所在地<strong>' + c.location + '</strong></div>' +
            '<div class="customer-meta-item">最後聯絡<strong>' + c.lastContact + '</strong></div>' +
            '</div><div class="customer-tags">' + tagsHtml + '</div></div>';
    }).join('');
}

function filterCustomers() {
    var grade = document.getElementById('customerFilter').value;
    var intent = document.getElementById('intentFilter') ? document.getElementById('intentFilter').value : 'all';
    var search = document.getElementById('customerSearch').value.toLowerCase();
    var list = customers;
    if (grade !== 'all') list = list.filter(function(c) { return c.grade === grade; });
    if (intent !== 'all') list = list.filter(function(c) { return c.intentCategory === intent; });
    if (search) list = list.filter(function(c) { return c.name.toLowerCase().includes(search) || c.phone.includes(search); });
    var gradeLabels = { A: 'A級', B: 'B級', C: 'C級', lead: '潛在' };
    var gradeClasses = { A: 'grade-badge-A', B: 'grade-badge-B', C: 'grade-badge-C', lead: 'grade-badge-lead' };
    var el = document.getElementById('customerGrid');
    el.innerHTML = list.map(function(c) {
        var tagsHtml = c.tags.map(function(t) {
            var cls = t.includes('高意向') ? 'hot' : '';
            if (t.includes('跟進')) cls += ' need-follow';
            return '<span class="customer-tag ' + cls + '">' + t + '</span>';
        }).join('');
        return '<div class="customer-card" onclick="openCustomerDetail(\'' + c.id + '\')">' +
            '<div class="customer-card-header">' +
            '<div class="customer-avatar grade-' + c.grade + '">' + c.name.charAt(0) + '</div>' +
            '<div style="flex:1;"><div class="customer-name">' + c.name + '</div>' +
            '<div class="customer-phone">' + c.phone + '</div></div>' +
            '<span class="customer-grade ' + gradeClasses[c.grade] + '">' + gradeLabels[c.grade] + '</span></div>' +
            '<div style="display:flex;align-items:center;gap:6px;margin:8px 0 4px;">' +
            '<span style="font-size:11px;color:var(--text-2);">意向</span>' +
            '<span style="font-size:11px;font-weight:600;color:' + (c.leadScore>=80?'#dc2626':c.leadScore>=60?'#ea580c':'#a1a1aa') + ';">' + (c.intentCategory||'未分級') + '</span>' +
            '<div style="flex:1;height:4px;background:var(--border);border-radius:2px;overflow:hidden;">' +
            '<div style="width:' + (c.leadScore||50) + '%;height:100%;background:' + (c.leadScore>=80?'#dc2626':c.leadScore>=60?'#ea580c':'#a1a1aa') + ';border-radius:2px;"></div></div>' +
            '<span style="font-size:11px;font-weight:600;">' + (c.leadScore||50) + '</span></div>' +
            '<div class="customer-meta">' +
            '<div class="customer-meta-item">消費額<strong>HK$ ' + c.totalSpent.toLocaleString() + '</strong></div>' +
            '<div class="customer-meta-item">訂單數<strong>' + c.orders + ' 單</strong></div>' +
            '<div class="customer-meta-item">所在地<strong>' + c.location + '</strong></div>' +
            '<div class="customer-meta-item">最後聯絡<strong>' + c.lastContact + '</strong></div>' +
            '</div><div class="customer-tags">' + tagsHtml + '</div></div>';
    }).join('');
}

function openCustomerDetail(customerId) {
    var c = customers.find(function(x) { return x.id === customerId; });
    if (!c) return;

    document.getElementById('modalCustomerName').textContent = c.name + ' 的客戶詳情';
    var sentimentMap = { positive: '滿意', neutral: '一般', negative: '不滿' };

    var tagsHtml = c.tags.map(function(t) {
        var cls = t.includes('高意向') ? 'hot' : '';
        return '<span class="customer-tag ' + cls + '">' + t + '</span>';
    }).join('');

    var timelineHtml = c.timeline.map(function(t) {
        return '<div class="timeline-item"><div class="timeline-dot"></div>' +
            '<div><span class="timeline-time">' + t.time + '</span><div>' + t.event + '</div></div></div>';
    }).join('');

    document.getElementById('modalCustomerBody').innerHTML =
        '<div class="customer-detail-section"><h4>基本資料</h4>' +
        '<p>' + c.phone + ' | ' + c.location + ' | 累計消費 HK$' + c.totalSpent.toLocaleString() + '</p></div>' +
        '<div class="customer-detail-section"><h4>AI 客戶分析</h4>' +
        '<div class="ai-insight">' + c.aiInsight + '</div>' +
        '<p style="font-size:12px;color:var(--text-2);">情緒狀態：' + (sentimentMap[c.sentiment] || '一般') + '</p></div>' +
        '<div class="customer-detail-section"><h4>標籤</h4><div class="customer-tags">' + tagsHtml + '</div></div>' +
        '<div class="customer-detail-section"><h4>跟進建議（AI 生成）</h4>' +
        '<div class="ai-insight">' + AIEngine.generateFollowUp(customerId) + '</div></div>' +
        '<div class="customer-detail-section"><h4>互動記錄</h4>' +
        '<div class="detail-timeline">' + timelineHtml + '</div></div>';

    document.getElementById('customerModal').style.display = 'flex';
}

function closeModal(id) {
    document.getElementById(id).style.display = 'none';
}

// ===== 匯出/匯入 =====
function downloadFile(filename, content, mime) {
    var blob = new Blob(['\uFEFF' + content], { type: mime });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
}
function exportCustomers() {
    var rows = customers.map(function(c){return '<tr><td>'+c.id+'</td><td>'+c.name+'</td><td>'+c.phone+'</td><td>'+(c.grade||'')+'</td><td>HK$'+(c.totalSpent||0)+'</td><td>'+(c.orders||0)+'</td></tr>';}).join('');
    var html='<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"></head><body><h1>ChatIQ 客戶名單</h1><p>匯出：'+new Date().toLocaleString('zh-HK')+'</p><table border="1" cellpadding="6" style="border-collapse:collapse;font-family:sans-serif"><tr style="background:#f0f0f0"><th>ID</th><th>姓名</th><th>電話</th><th>等級</th><th>消費額</th><th>訂單數</th></tr>'+rows+'</table></body></html>';
    downloadFile('客戶名單.doc', html, 'application/msword');
    showToast('客戶名單已匯出為 Word 文件');
}
function exportOrdersCSV(){var csv='訂單編號,客戶,產品,金額,狀態,時間\n';orders.forEach(function(o){csv+=o.id+','+o.customerName+','+o.product+',HK$'+o.amount+','+o.status+','+o.time+'\n';});downloadFile('訂單記錄.csv',csv,'text/csv');showToast('訂單已匯出為 CSV');}
function exportConversationsPDF(){var rows=conversations.map(function(c){var msgs=(c.messages||[]).map(function(m){return '<div><b>'+(m.from==='ai'?'AI':'客戶')+':</b> '+m.text+'</div>';}).join('');return '<tr><td>'+c.customerName+'</td><td>'+c.lastTime+'</td><td>'+msgs+'</td></tr>';}).join('');var html='<html><head><meta charset="utf-8"><style>body{font-family:sans-serif;padding:30px}table{width:100%;border-collapse:collapse}td,th{border:1px solid #ddd;padding:8px;vertical-align:top}th{background:#f5f5f5}</style></head><body><h1>對話記錄</h1><p>'+new Date().toLocaleString('zh-HK')+'</p><table><tr><th>客戶</th><th>時間</th><th>對話內容</th></tr>'+rows+'</table><p style="color:#666;font-size:12px">按 Ctrl+P 可列印或存為 PDF</p></body></html>';var w=window.open('','_blank');w.document.write(html);w.document.close();setTimeout(function(){w.print();},500);showToast('對話記錄已開啟，可存為 PDF');}
function exportAllJSON(){var data={customers:customers,orders:orders,conversations:conversations,exportedAt:new Date().toISOString()};downloadFile('chatiq備份.json',JSON.stringify(data,null,2),'application/json');showToast('所有數據已備份');}
function importData(type){var input=document.createElement('input');input.type='file';input.accept='.json,.csv,.txt';input.onchange=function(e){var file=e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(ev){try{var text=ev.target.result.replace(/^\uFEFF/,'');if(file.name.endsWith('.json')){var data=JSON.parse(text);if(Array.isArray(data)){data.forEach(function(c){customers.push({id:'C'+Date.now()+Math.random(),name:c.name||'未命名',phone:c.phone||'',grade:c.grade||'B',totalSpent:c.totalSpent||0,orders:c.orders||0,ordersCount:c.ordersCount||0,location:c.location||'',lastContact:c.lastContact||'剛才',tags:c.tags||['新匯入'],timeline:[{time:'剛才',event:'從檔案匯入'}],aiInsight:'從外部檔案匯入的客戶',sentiment:'neutral'});});showToast('成功匯入 '+data.length+' 個客戶');renderCustomers();}}else{var lines=text.split('\n').filter(function(l){return l.trim();});lines.slice(1).forEach(function(line){var p=line.split(',');customers.push({id:'C'+Date.now()+Math.random(),name:p[0]||'未命名',phone:p[1]||'',grade:'B',totalSpent:0,orders:0,location:'',lastContact:'剛才',tags:['新匯入'],timeline:[{time:'剛才',event:'從CSV匯入'}],aiInsight:'從CSV匯入',sentiment:'neutral'});});showToast('成功匯入 '+(lines.length-1)+' 個客戶');renderCustomers();}}catch(err){showToast('匯入失敗：檔案格式錯誤');}};reader.readAsText(file,'utf-8');};input.click();}

// ===== 訂單管理 =====
function renderOrders() {
    var filter = document.getElementById('orderFilter').value;
    var list = orders;
    if (filter !== 'all') list = list.filter(function(o) { return o.status === filter; });

    var statusLabels = { pending: '待確認', confirmed: '已確認', completed: '已完成', cancelled: '已取消' };
    var statusClasses = { pending: 'status-pending', confirmed: 'status-confirmed', completed: 'status-completed', cancelled: 'status-cancelled' };

    var total = list.reduce(function(sum, o) { return sum + o.amount; }, 0);
    document.getElementById('orderSummary').innerHTML = '共 ' + list.length + ' 筆訂單，總額 <strong>HK$ ' + total.toLocaleString() + '</strong>';

    document.getElementById('orderTableBody').innerHTML = list.map(function(o) {
        var aiTag = o.aiGenerated ? '<span style="font-size:10px;background:var(--accent-light);color:var(--accent);padding:1px 5px;border-radius:6px;">AI</span>' : '';
        var action = '';
        if (o.status === 'pending') action = '<button class="btn-secondary btn-sm" onclick="updateOrderStatus(\'' + o.id + '\',\'confirmed\')">確認</button>';
        if (o.status === 'confirmed') action = '<button class="btn-secondary btn-sm" onclick="updateOrderStatus(\'' + o.id + '\',\'completed\')">完成</button>';
        return '<tr><td style="font-family:monospace;font-size:12px;">' + o.id + '</td>' +
            '<td>' + o.customerName + '</td>' +
            '<td>' + o.product + ' ' + aiTag + '</td>' +
            '<td><strong>HK$ ' + o.amount.toLocaleString() + '</strong></td>' +
            '<td><span class="order-status ' + statusClasses[o.status] + '">' + statusLabels[o.status] + '</span></td>' +
            '<td style="font-size:12px;color:var(--text-2);">' + o.time + '</td>' +
            '<td>' + action + '</td></tr>';
    }).join('');
}

function filterOrders() { renderOrders(); }

function updateOrderStatus(orderId, status) {
    var order = orders.find(function(o) { return o.id === orderId; });
    if (order) {
        order.status = status;
        renderOrders();
        showToast('訂單狀態已更新');
    }
}

// ===== 數據分析 =====
function initAnalytics() {
    renderFunnelChart();
    renderSentimentChart();
    renderRegionChart();
    renderHotQuestions();
    renderWeeklyReport();
}

function renderFunnelChart() {
    var el = document.getElementById('funnelChart');
    if (!el) return;
    if (charts.funnel) charts.funnel.dispose();
    charts.funnel = echarts.init(el);
    charts.funnel.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c}人' },
        series: [{
            type: 'funnel',
            left: '10%', width: '80%',
            label: { formatter: '{b}\n{c}人 ({d}%)' },
            itemStyle: { borderRadius: 4 },
            data: [
                { value: 328, name: '總諮詢客戶', itemStyle: { color: '#c7d2fe' } },
                { value: 186, name: '有意向', itemStyle: { color: '#818cf8' } },
                { value: 112, name: '報價/試用', itemStyle: { color: '#6366f1' } },
                { value: 78, name: '確認訂單', itemStyle: { color: '#4f46e5' } },
                { value: 56, name: '完成付款', itemStyle: { color: '#4338ca' } }
            ]
        }]
    });
}

function renderSentimentChart() {
    var el = document.getElementById('sentimentChart');
    if (!el) return;
    if (charts.sentiment) charts.sentiment.dispose();
    charts.sentiment = echarts.init(el);
    charts.sentiment.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['滿意', '中性', '不滿'], bottom: 0 },
        grid: { left: 40, right: 20, top: 20, bottom: 40 },
        xAxis: { type: 'category', data: trendData.dates },
        yAxis: { type: 'value', name: '佔比(%)', max: 100 },
        series: [
            { name: '滿意', type: 'line', stack: 'total', areaStyle: {}, smooth: true, data: [65, 68, 70, 72, 75, 78, 80], itemStyle: { color: '#16a34a' } },
            { name: '中性', type: 'line', stack: 'total', areaStyle: {}, smooth: true, data: [25, 23, 22, 20, 18, 16, 14], itemStyle: { color: '#d97706' } },
            { name: '不滿', type: 'line', stack: 'total', areaStyle: {}, smooth: true, data: [10, 9, 8, 8, 7, 6, 6], itemStyle: { color: '#dc2626' } }
        ]
    });
}

function renderRegionChart() {
    var el = document.getElementById('regionChart');
    if (!el) return;
    if (charts.region) charts.region.dispose();
    charts.region = echarts.init(el);
    charts.region.setOption({
        tooltip: { trigger: 'item' },
        series: [{
            type: 'pie',
            radius: '65%',
            label: { formatter: '{b}: {c}人' },
            itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
            data: [
                { value: 142, name: '香港島', itemStyle: { color: '#4f46e5' } },
                { value: 108, name: '九龍', itemStyle: { color: '#16a34a' } },
                { value: 65, name: '新界', itemStyle: { color: '#d97706' } },
                { value: 13, name: '澳門/內地', itemStyle: { color: '#a1a1aa' } }
            ]
        }]
    });
}

function renderHotQuestions() {
    var el = document.getElementById('hotQuestions');
    el.innerHTML = hotQuestions.map(function(q, i) {
        var rankCls = i < 3 ? 'top' : '';
        return '<div class="question-item"><div class="question-rank ' + rankCls + '">' + (i + 1) +
            '</div><div class="question-text">' + q.text + '</div>' +
            '<div class="question-count">' + q.count + ' 次</div></div>';
    }).join('');
}

function renderWeeklyReport() {
    var convCount = 1247, aiRate = 87, hoursSaved = 42;
    var convRate = 34.2, revenue = 87420, revenueGrowth = 31;
    var hotLeads = 4, atRisk = 1;
    var topQ = '營業時間', secondQ = '產品價格';

    var html = '<h4>AI 經營分析與行動建議</h4>';
    html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0;">';
    html += '<div style="padding:12px;background:var(--accent-light);border-radius:8px;border-left:3px solid var(--accent);"><strong>營運概況</strong><br><small>本週對話 ' + convCount + ' 則，AI 回覆率 ' + aiRate + '%，節省 ' + hoursSaved + ' 小時</small></div>';
    html += '<div style="padding:12px;background:var(--success-light);border-radius:8px;border-left:3px solid var(--success);"><strong>成交表現</strong><br><small>轉化率 ' + convRate + '%，營業額 HK$' + revenue.toLocaleString() + '（+' + revenueGrowth + '%）</small></div>';
    html += '</div>';

    html += '<div style="margin:16px 0;"><strong style="font-size:14px;">AI 建議行動：</strong></div>';
    html += '<div style="display:flex;flex-direction:column;gap:8px;">';
    html += '<div style="padding:10px;background:var(--warning-light);border-radius:8px;display:flex;gap:10px;align-items:flex-start;"><span style="width:22px;height:22px;background:var(--accent);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0;">1</span><div><strong>優化歡迎訊息</strong><br><small>客戶最常問「' + topQ + '」和「' + secondQ + '」，建議在新客進來的第一句就主動提供，可減少 30% 重複問答，預估提升轉化率 5-8%。</small></div></div>';
    html += '<div style="padding:10px;background:var(--accent-light);border-radius:8px;display:flex;gap:10px;align-items:flex-start;"><span style="width:22px;height:22px;background:var(--accent);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0;">2</span><div><strong>跟進 ' + hotLeads + ' 位高意向客戶</strong><br><small>系統識別 ' + hotLeads + ' 位客戶詢問後未下單，建議今日內發送限時優惠（9折券），製造緊迫感。預估轉化其中 1-2 位。</small></div></div>';
    html += '<div style="padding:10px;background:var(--danger-light);border-radius:8px;display:flex;gap:10px;align-items:flex-start;"><span style="width:22px;height:22px;background:var(--accent);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0;">3</span><div><strong>挽回 ' + atRisk + ' 位流失風險客戶</strong><br><small>有客戶超過 20 天無互動，建議發送「我們想念你」專屬優惠（85折），附新品推薦。</small></div></div>';
    html += '<div style="padding:10px;background:#f5f3ff;border-radius:8px;display:flex;gap:10px;align-items:flex-start;"><span style="width:22px;height:22px;background:var(--accent);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0;">4</span><div><strong>優化熱門問題回覆</strong><br><small>「' + topQ + '」被問了 186 次，建議把它設為快捷回覆按鈕，一鍵發送，提升回覆速度。</small></div></div>';
    html += '<div style="padding:10px;background:var(--success-light);border-radius:8px;display:flex;gap:10px;align-items:flex-start;"><span style="width:22px;height:22px;background:var(--accent);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;flex-shrink:0;">5</span><div><strong>投放建議</strong><br><small>香港島客戶最多（142人），建議在銅鑼灣門市附近加強 WhatsApp 廣告投放，回報率最高。</small></div></div>';
    html += '</div>';

    html += '<div style="margin-top:16px;padding:12px;background:var(--surface);border-radius:8px;"><strong>下週預測</strong><br><small>按目前趨勢，下週對話量約 ' + Math.round(convCount*1.1) + ' 則，營業額預估 HK$' + Math.round(revenue*1.15).toLocaleString() + '。建議庫存準備提升 15%。</small></div>';

    document.getElementById('weeklyReport').innerHTML = html;
}

// ===== 設定 =====
function switchSettingsTab(tab) {
    document.querySelectorAll('.settings-tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.settings-panel').forEach(function(p) { p.classList.remove('active'); });
    event.target.classList.add('active');
    document.getElementById('settings-' + tab).classList.add('active');
}

function saveSettings(type) {
    showToast('設定已儲存');
}

function handleFileUpload(input) {
    var files = input.files;
    for (var i = 0; i < files.length; i++) {
        (function(f) {
            var item = document.createElement('div');
            item.className = 'knowledge-item';
            item.innerHTML = '<span>' + f.name + '</span><span class="kb-status">索引中...</span><button class="btn-link" onclick="removeKB(this)">刪除</button>';
            document.getElementById('knowledgeList').appendChild(item);
            setTimeout(function() {
                item.querySelector('.kb-status').textContent = '已索引';
            }, 1500);
        })(files[i]);
    }
}

function removeKB(btn) {
    btn.parentElement.remove();
    showToast('已刪除');
}

function addKBEntry() {
    var text = document.getElementById('kbManual').value.trim();
    if (!text) return;
    var item = document.createElement('div');
    item.className = 'knowledge-item';
    item.innerHTML = '<span>手動添加條目</span><span class="kb-status">已索引</span><button class="btn-link" onclick="removeKB(this)">刪除</button>';
    document.getElementById('knowledgeList').appendChild(item);
    document.getElementById('kbManual').value = '';
    showToast('知識條目已添加');
}

// ===== 通知 =====
function showNotification() {
    var panel = document.getElementById('notificationPanel');
    var list = document.getElementById('notificationList');
    list.innerHTML = notifications.map(function(n) {
        return '<div class="notification-item ' + (n.unread ? 'unread' : '') + '">' +
            '<div class="notif-title">' + n.title + '</div><div>' + n.desc + '</div>' +
            '<div class="notif-time">' + n.time + '</div></div>';
    }).join('');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}

function hideNotification() {
    document.getElementById('notificationPanel').style.display = 'none';
}

// ===== Toast =====
function showToast(msg) {
    var toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.style.display = 'block';
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(function() { toast.style.display = 'none'; }, 2500);
}

window.addEventListener('resize', function() {
    Object.values(charts).forEach(function(c) { if (c) c.resize(); });
});

// ===== 營銷推廣 =====
var templates = {
    discount: '您好！本店限時優惠：全場9折，滿HK$500再減HK$50。今個星期有效，歡迎到店選購！',
    newproduct: '您好！本店新到一批手工生活精品，包括新款咖啡杯同香薰機。歡迎到店睇下！',
    invite: '您好！誠邀您到本店體驗新品，到店即送小禮品一份。地址：銅鑼灣恩平道28號。',
    followup: '您好！多謝之前光顧，最近有新產品上架，仲有會員專屬優惠。想了解下嗎？'
};
function loadTemplate() {
    var t = document.getElementById('broadcastTemplate').value;
    if (templates[t]) document.getElementById('broadcastMsg').value = templates[t];
}
function renderBroadcastCount() {
    var seg = document.getElementById('broadcastSegment').value;
    var count = customers.length;
    if (seg !== 'all') count = customers.filter(function(c){return c.grade===seg;}).length;
    document.getElementById('broadcastResult').innerHTML = '已選擇 <strong>' + count + '</strong> 位客戶';
}
function sendBroadcast() {
    var msg = document.getElementById('broadcastMsg').value.trim();
    if (!msg) { showToast('請輸入訊息內容'); return; }
    var seg = document.getElementById('broadcastSegment').value;
    var list = customers;
    if (seg !== 'all') list = customers.filter(function(c){return c.grade===seg;});
    showToast('正在發送給 ' + list.length + ' 位客戶...');
    setTimeout(function() {
        document.getElementById('broadcastResult').innerHTML = '<div style="padding:16px;background:var(--success-light);border-radius:8px;border:1px solid var(--success-border);"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px;margin-right:4px;"><polyline points="20 6 9 17 4 12"/></svg>已成功發送 ' + list.length + ' 則訊息<br><small style="color:var(--text-2);">狀態：已送達 ' + list.length + '，已讀 ' + Math.floor(list.length*0.7) + '</small></div>';
        showToast('群發完成！');
    }, 1500);
}

// ===== 快捷回覆 =====
function insertQuickReply(text) {
    document.getElementById('chatInput').value = text;
}

// ===== 產品目錄 =====
function renderProducts() {
    var el = document.getElementById('productGrid');
    if (!el) return;
    el.innerHTML = products.map(function(p) {
        return '<div class="customer-card" style="cursor:default;">' +
            '<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">' +
            '<div style="width:48px;height:48px;background:var(--surface);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:24px;">' + p.emoji + '</div>' +
            '<div style="flex:1;"><div style="font-weight:600;font-size:14px;">' + p.name + '</div>' +
            '<div style="font-size:11px;color:var(--text-2);">' + p.category + '</div></div>' +
            '<div style="text-align:right;"><div style="font-weight:700;color:var(--accent);">HK$' + p.price + '</div>' +
            '<div style="font-size:10px;color:' + (p.stock<20?'#dc2626':'#16a34a') + ';">庫存 ' + p.stock + '</div></div></div>' +
            '<div style="font-size:12px;color:var(--text-2);margin-bottom:8px;">' + p.desc + '</div>' +
            '<button class="btn-secondary btn-sm" style="width:100%;" onclick="sendProductToChat(\'' + p.id + '\')">發送給客戶</button></div>';
    }).join('');
}

function showAddProduct() {
    var name = prompt('產品名稱？');
    if (!name) return;
    var price = parseInt(prompt('價格（HK$）？') || '0');
    var desc = prompt('產品描述？') || '';
    products.push({ id: 'P'+Date.now(), name: name, price: price, stock: 10, category: '其他', desc: desc, emoji: '📦' });
    renderProducts();
    showToast('產品已新增');
}

function sendProductToChat(productId) {
    var p = products.find(function(x) { return x.id === productId; });
    if (!p) return;
    if (!currentConversation) { showToast('請先選擇一個對話'); switchPage('conversations'); return; }
    var conv = conversations.find(function(c) { return c.id === currentConversation; });
    var now = new Date();
    var time = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
    var card = p.emoji + ' ' + p.name + '\n價格：HK$' + p.price + '\n' + p.desc + '\n庫存：' + p.stock + '件';
    conv.messages.push({ from: 'agent', text: card, time: time, tag: '產品' });
    conv.lastMessage = p.name; conv.lastTime = time;
    openConversation(currentConversation); renderChatList(); saveData();
    showToast('產品卡片已發送');
    switchPage('conversations');
}

// ===== 快捷回覆 =====
function toggleQuickReplies() {
    var panel = document.getElementById('quickReplyPanel');
    if (panel.style.display === 'flex') {
        panel.style.display = 'none';
    } else {
        panel.style.display = 'flex';
        panel.innerHTML = quickReplies.map(function(q) {
            return '<button class="btn-secondary btn-sm" style="font-size:11px;" onclick="useQuickReply(\'' + q.id + '\')" title="' + q.text.replace(/"/g,'&quot;') + '">' + q.title + '</button>';
        }).join('');
    }
}

function useQuickReply(qid) {
    var q = quickReplies.find(function(x) { return x.id === qid; });
    if (!q) return;
    document.getElementById('chatInput').value = q.text;
    document.getElementById('quickReplyPanel').style.display = 'none';
}

// ===== AI 輔助建議（人工模式） =====
function showAiAssist() {
    if (!currentConversation) return;
    var conv = conversations.find(function(c) { return c.id === currentConversation; });
    if (!conv || conv.status !== 'human') return;
    var lastCustomerMsg = null;
    for (var i = conv.messages.length - 1; i >= 0; i--) {
        if (conv.messages[i].from === 'customer') { lastCustomerMsg = conv.messages[i]; break; }
    }
    if (!lastCustomerMsg) return;
    var panel = document.getElementById('aiAssistPanel');
    panel.style.display = 'block';
    document.getElementById('aiAssistText').textContent = 'AI 正在構建回覆...';
    AIEngine.generateReplyAsync(lastCustomerMsg.text, conv.customerId).then(function(reply) {
        document.getElementById('aiAssistText').textContent = reply;
    });
}

function useAiAssist() {
    var text = document.getElementById('aiAssistText').textContent;
    if (text && text !== 'AI 正在構建回覆...') {
        document.getElementById('chatInput').value = text;
        document.getElementById('aiAssistPanel').style.display = 'none';
    }
}

// ===== 滿意度評價 =====
function sendCsat() {
    if (!currentConversation) return;
    var conv = conversations.find(function(c) { return c.id === currentConversation; });
    var now = new Date();
    var time = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
    conv.messages.push({ from: 'agent', text: '感謝您的咨詢！請為本次服務評分：\n⭐⭐⭐⭐⭐ 非常滿意\n⭐⭐⭐⭐ 滿意\n⭐⭐⭐ 一般\n⭐⭐ 不滿意\n⭐ 非常不滿意', time: time, tag: '評價' });
    conv.lastMessage = '請為服務評分'; conv.lastTime = time;
    openConversation(currentConversation); renderChatList(); saveData();
    showToast('已發送滿意度調查');
}
