import { Feature, PartnerLink, User, UserRole } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'u1',
    name: '系統管理員',
    email: 'admin@company.com',
    role: UserRole.ADMIN,
    isActive: true,
    createdAt: '2023-01-01',
    avatarUrl: 'https://picsum.photos/id/1/200/200'
  },
  {
    id: 'u2',
    name: '王小明 (內部同仁)',
    email: 'staff@company.com',
    role: UserRole.STAFF,
    isActive: true,
    createdAt: '2023-02-15',
    avatarUrl: 'https://picsum.photos/id/2/200/200'
  },
  {
    id: 'u3',
    name: '合作夥伴 A',
    email: 'partner@external.com',
    role: UserRole.PARTNER,
    isActive: true,
    createdAt: '2023-05-20',
    avatarUrl: 'https://picsum.photos/id/3/200/200'
  }
];

export const MOCK_FEATURES: Feature[] = [
  {
    id: 'f1',
    title: '自動報表生成器 v2.0',
    description: '一鍵匯出週報與月報，支援 Excel 與 PDF 格式，大幅減少人工整理時間。',
    category: '自動化工具',
    tags: ['報表', '效率', 'Finance'],
    targetAudience: ['營運', '財務'],
    status: 'ONLINE',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Dummy video
    docContent: '## 使用教學\n1. 登入系統\n2. 選擇日期區間\n3. 點擊匯出',
    updatedAt: '2023-10-01'
  },
  {
    id: 'f2',
    title: 'LINE 官方帳號機器人',
    description: '整合客服問答與訂單查詢功能，降低人工客服負擔。',
    category: '客戶服務',
    tags: ['LINE', 'Chatbot', 'CS'],
    targetAudience: ['客服', '行銷'],
    status: 'TESTING',
    updatedAt: '2023-10-15'
  },
  {
    id: 'f3',
    title: '搭車金申請系統',
    description: '晚歸同仁專用的計程車費補助申請入口，需上傳收據。',
    category: '行政流程',
    tags: ['行政', '福利'],
    targetAudience: ['全體同仁'],
    status: 'ONLINE',
    updatedAt: '2023-09-20'
  },
  {
    id: 'f4',
    title: '異業合作數據儀表板 (Tableau)',
    description: '查看即時流量與轉換率，僅限特定專案使用。',
    category: '數據分析',
    tags: ['Tableau', 'Data'],
    targetAudience: ['營運', '合作夥伴'],
    status: 'ONLINE',
    updatedAt: '2023-10-20'
  }
];

export const MOCK_LINKS: PartnerLink[] = [
  {
    id: 'l1',
    title: '品牌合作活動報表入口',
    description: '查看本季品牌聯名活動的即時銷售數據。',
    url: 'https://google.com',
    category: '數據報表',
    visibleTo: [UserRole.ADMIN, UserRole.STAFF, UserRole.PARTNER],
    isActive: true
  },
  {
    id: 'l2',
    title: '活動名單上傳後台',
    description: '供行銷人員上傳白名單使用的內部工具。',
    url: 'https://google.com',
    category: '營運操作',
    visibleTo: [UserRole.ADMIN, UserRole.STAFF],
    isActive: true
  },
  {
    id: 'l3',
    title: '系統管理後台 (Legacy)',
    description: '舊版訂單管理系統，預計年底停用。',
    url: 'https://google.com',
    category: '系統管理',
    visibleTo: [UserRole.ADMIN],
    isActive: true
  },
  {
    id: 'l4',
    title: '合作夥伴素材下載區',
    description: '獲取最新的 Logo 與行銷 Banner。',
    url: 'https://google.com',
    category: '資源下載',
    visibleTo: [UserRole.ADMIN, UserRole.STAFF, UserRole.PARTNER],
    isActive: true
  }
];
