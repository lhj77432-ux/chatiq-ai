// ===== ChatIQ AI 主應用 =====

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
        'ai-settings': 'AI 設定'
    };
    document.getElementById('pageTitle').textContent = titles[page] || '';

    document.getElementById('sidebar').classList.remove('open');

    if (page === 'dashboard') initDashboard();
    if (page === 'conversations') renderChatList();
    if (page === 'customers') renderCustomers();
    if (page === 'orders') renderOrders();
    if (page === 'analytics') initAnalytics();
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
            { name: '對話數', type: 'bar', data: trendData.messages, itemStyle: { color: '#64d2ff', borderRadius: [6,6,0,0] } },
            { name: '成交數', type: 'line', data: trendData.conversions, itemStyle: { color: '#30d158' }, smooth: true, lineStyle: { width: 3 } },
            { name: '營業額', type: 'line', yAxisIndex: 1, data: trendData.revenue, itemStyle: { color: '#ff9f0a' }, smooth: true, lineStyle: { width: 3 } }
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
                { value: 12, name: 'A級', itemStyle: { color: '#30d158' } },
                { value: 45, name: 'B級', itemStyle: { color: '#0071e3' } },
                { value: 210, name: 'C級', itemStyle: { color: '#aeaeb2' } },
                { value: 61, name: '潛在客戶', itemStyle: { color: '#ff9f0a' } }
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
            '<div style="font-size:11px;color:var(--text-tertiary);margin-top:2px;">' + a.time + '</div></div></div>';
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
        '<div style="font-size:11px;color:var(--text-secondary);font-weight:400;">' + statusText + '</div></div></div>' +
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

function sendMessage() {
    var input = document.getElementById('chatInput');
    var text = input.value.trim();
    if (!text || !currentConversation) return;

    var conv = conversations.find(function(c) { return c.id === currentConversation; });
    var now = new Date();
    var time = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

    conv.messages.push({ from: 'agent', text: text, time: time });
    conv.lastMessage = text;
    conv.lastTime = time;
    input.value = '';

    openConversation(currentConversation);
    renderChatList();

    setTimeout(function() {
        var autoReplies = ['好的，多謝！', '那我幾時可以收到？', 'OK，我考慮下', '好呀，麻煩你', '收到，謝謝'];
        var autoReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
        conv.messages.push({ from: 'customer', text: autoReply, time: time });
        conv.lastMessage = autoReply;
        openConversation(currentConversation);
        renderChatList();
    }, 1500);
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
            '<div class="customer-meta">' +
            '<div class="customer-meta-item">消費額<strong>HK$ ' + c.totalSpent.toLocaleString() + '</strong></div>' +
            '<div class="customer-meta-item">訂單數<strong>' + c.orders + ' 單</strong></div>' +
            '<div class="customer-meta-item">所在地<strong>' + c.location + '</strong></div>' +
            '<div class="customer-meta-item">最後聯絡<strong>' + c.lastContact + '</strong></div>' +
            '</div><div class="customer-tags">' + tagsHtml + '</div></div>';
    }).join('');
}

function filterCustomers() { renderCustomers(); }

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
        '<p style="font-size:12px;color:var(--text-secondary);">情緒狀態：' + (sentimentMap[c.sentiment] || '一般') + '</p></div>' +
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

function exportCustomers() {
    showToast('客戶資料已匯出為 CSV');
}

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
        var aiTag = o.aiGenerated ? '<span style="font-size:10px;background:#ede9fe;color:#7c3aed;padding:1px 5px;border-radius:6px;">AI</span>' : '';
        var action = '';
        if (o.status === 'pending') action = '<button class="btn-secondary btn-sm" onclick="updateOrderStatus(\'' + o.id + '\',\'confirmed\')">確認</button>';
        if (o.status === 'confirmed') action = '<button class="btn-secondary btn-sm" onclick="updateOrderStatus(\'' + o.id + '\',\'completed\')">完成</button>';
        return '<tr><td style="font-family:monospace;font-size:12px;">' + o.id + '</td>' +
            '<td>' + o.customerName + '</td>' +
            '<td>' + o.product + ' ' + aiTag + '</td>' +
            '<td><strong>HK$ ' + o.amount.toLocaleString() + '</strong></td>' +
            '<td><span class="order-status ' + statusClasses[o.status] + '">' + statusLabels[o.status] + '</span></td>' +
            '<td style="font-size:12px;color:var(--text-secondary);">' + o.time + '</td>' +
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
                { value: 328, name: '總諮詢客戶', itemStyle: { color: '#64d2ff' } },
                { value: 186, name: '有意向', itemStyle: { color: '#0071e3' } },
                { value: 112, name: '報價/試用', itemStyle: { color: '#30d158' } },
                { value: 78, name: '確認訂單', itemStyle: { color: '#ff9f0a' } },
                { value: 56, name: '完成付款', itemStyle: { color: '#bf5af2' } }
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
            { name: '滿意', type: 'line', stack: 'total', areaStyle: {}, smooth: true, data: [65, 68, 70, 72, 75, 78, 80], itemStyle: { color: '#30d158' } },
            { name: '中性', type: 'line', stack: 'total', areaStyle: {}, smooth: true, data: [25, 23, 22, 20, 18, 16, 14], itemStyle: { color: '#ff9f0a' } },
            { name: '不滿', type: 'line', stack: 'total', areaStyle: {}, smooth: true, data: [10, 9, 8, 8, 7, 6, 6], itemStyle: { color: '#ff453a' } }
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
                { value: 142, name: '香港島', itemStyle: { color: '#0071e3' } },
                { value: 108, name: '九龍', itemStyle: { color: '#30d158' } },
                { value: 65, name: '新界', itemStyle: { color: '#ff9f0a' } },
                { value: 13, name: '澳門/內地', itemStyle: { color: '#bf5af2' } }
            ]
        }]
    });
}

function renderHotQuestions() {
    var el = document.getElementById('hotQuestions');
    el.innerHTML = hotQuestions.map(function(q, i) {
        var rankCls = i < 3 ? 'top' + (i + 1) : '';
        return '<div class="question-item"><div class="question-rank ' + rankCls + '">' + (i + 1) +
            '</div><div class="question-text">' + q.text + '</div>' +
            '<div class="question-count">' + q.count + ' 次</div></div>';
    }).join('');
}

function renderWeeklyReport() {
    document.getElementById('weeklyReport').innerHTML =
        '<h4>本週經營簡報（AI 自動生成）</h4>' +
        '<p>本週共收到 <span class="highlight">1,247 則對話</span>，AI 自動回覆率達 <span class="highlight">87%</span>，節省約 <span class="highlight">42 小時</span>人工時間。</p>' +
        '<p>成交轉化率 <span class="highlight">34.2%</span>，較上週提升 8%。成交額 HK$87,420，環比增長 31%。</p>' +
        '<p>發現 <span class="highlight">4 位高意向潛在客戶</span>，建議立即跟進。同時有 <span class="warning-text">1 位客戶有流失風險</span>，建議發送優惠挽回。</p>' +
        '<p style="margin-top:8px;color:var(--text-secondary);font-size:12px;">建議：本週客戶最常問「營業時間」和「價格」，建議在歡迎訊息中主動提供，可再提升轉化率約 5%。</p>';
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
