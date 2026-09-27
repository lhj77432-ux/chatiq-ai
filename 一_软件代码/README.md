# ChatIQ AI - 安裝與使用說明

## 簡介
ChatIQ AI 是一套 WhatsApp 智能客服與客戶分析系統，幫助中小企業自動回覆客戶、分析潛在客戶、管理訂單。

## 系統要求
- Node.js 16 或以上
- Windows / Mac / Linux 均可

## 快速啟動

### 第一步：安裝依賴
打開命令行，進入 backend 文件夾：
```
cd 一_软件代码\backend
npm install
```

### 第二步：啟動伺服器
```
npm start
```

### 第三步：打開瀏覽器
訪問：http://localhost:3000

演示賬號已預設，直接點擊「登入系統」即可。

## 功能清單

### 已完成（可直接演示）
- [x] 數據總覽面板（統計卡片 + 趨勢圖 + 餅圖）
- [x] 對話管理（聊天界面 + AI 建議回覆 + 轉人工）
- [x] 客戶管理（客戶列表 + 分級 + AI 分析 + 詳情彈窗）
- [x] 訂單管理（訂單列表 + 狀態更新）
- [x] 數據分析（銷售漏斗 + 情緒分析 + 熱門問題 + 每週簡報）
- [x] AI 設定頁面（API Key + 知識庫 + 自動回覆規則）
- [x] WhatsApp 連接配置頁面
- [x] 響應式設計（電腦 / 手機均可使用）

### 上線前需要配置
1. **大模型 API Key**：在「AI 設定 → API 設定」填入 OpenAI 或其他大模型 API Key
2. **WhatsApp Business API**：在「WhatsApp 連接」填入 API Token 和 Phone Number ID
3. **部署到伺服器**：將整個項目部署到雲伺服器（如 AWS / 數字海洋 / 香港伺服器）
4. **域名 + SSL**：綁定域名並配置 HTTPS（WhatsApp Webhook 要求 HTTPS）

## 技術架構
- 前端：HTML5 + CSS3 + 原生 JavaScript + ECharts
- 後端：Node.js + Express
- 數據庫：SQLite（零配置，文件級數據庫）
- AI：兼容 OpenAI API 格式（可切換 GPT / Claude / DeepSeek 等）

## 文件結構
```
一_软件代码/
├── frontend/           # 前端代碼
│   ├── index.html      # 主頁面
│   ├── css/style.css   # 樣式
│   └── js/
│       ├── app.js      # 主應用邏輯
│       ├── mock-data.js # 演示數據
│       └── ai-engine.js # AI 引擎
└── backend/            # 後端代碼
    ├── server.js       # Express 伺服器
    └── package.json    # 依賴配置
```
