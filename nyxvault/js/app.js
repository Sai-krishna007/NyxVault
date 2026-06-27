/* =====================================================
   NYXVAULT — COMPLETE FRONTEND APPLICATION
   All pages rendered via JavaScript SPA routing
   ===================================================== */
'use strict';

window._selectedFolder = null;
window._fileViewMode = 'list';
window._searchQuery = '';
window._sortMode = 'Sort: Date Modified';
window._filterMode = null;
window._shareFilterMode = 'all';

// =============================================
// MOCK DATA
// =============================================
const MOCK = {
  user: {
    name: 'Alex Ryder',
    email: 'alex.ryder@nyxvault.io',
    role: 'Admin',
    avatar: 'AR',
    plan: 'Enterprise',
    mfa: true,
    joined: 'Jan 12, 2024',
  },

  stats: {
    totalFiles: 4827,
    storageUsed: 68.4,
    storageTotal: 100,
    alerts: 14,
    shares: 231,
    threats: 3,
    integrityScore: 97.2,
    uptime: 99.98,
  },

  recentFiles: [
    { name: 'Q4_Financial_Report_2025.pdf', type: 'pdf',  size: '2.4 MB', date: '2m ago',   encrypted: true  },
    { name: 'project_blueprint_v3.docx',    type: 'doc',  size: '1.1 MB', date: '18m ago',  encrypted: true  },
    { name: 'server_backups.tar.gz',        type: 'zip',  size: '890 MB', date: '2h ago',   encrypted: true  },
    { name: 'infra_diagram.png',            type: 'img',  size: '4.2 MB', date: '5h ago',   encrypted: false },
    { name: 'vault_keys_2025.key',          type: 'key',  size: '12 KB',  date: '1d ago',   encrypted: true  },
    { name: 'api_codebase.zip',             type: 'code', size: '34 MB',  date: '2d ago',   encrypted: true  },
  ],

  alerts: [
    { id:'ALT-001', sev:'critical', title:'Unauthorized Access Attempt',         desc:'Multiple failed login attempts from IP 185.220.101.34 (TOR exit node)',   time:'4 min ago',  status:'active'   },
    { id:'ALT-002', sev:'high',     title:'File Integrity Violation Detected',   desc:'SHA-256 hash mismatch on vault_keys_2025.key — possible tampering',       time:'31 min ago', status:'active'   },
    { id:'ALT-003', sev:'high',     title:'Anomalous Download Pattern',          desc:'User jdoe@acme.com downloaded 847 files in under 10 minutes',             time:'1h ago',     status:'reviewing' },
    { id:'ALT-004', sev:'medium',   title:'Expired Share Link Still Accessed',   desc:'Share link SL-0042 was accessed 6 hours after expiry from two IPs',       time:'2h ago',     status:'resolved'  },
    { id:'ALT-005', sev:'medium',   title:'Geolocation Anomaly',                 desc:'User account accessed from Russia — usual location is United States',     time:'4h ago',     status:'active'   },
    { id:'ALT-006', sev:'low',      title:'New Device Login',                    desc:'Account alex.ryder@nyxvault.io logged in from macOS 15 / Safari',        time:'6h ago',     status:'resolved'  },
    { id:'ALT-007', sev:'critical', title:'Malware Signature Detected',          desc:'Uploaded file "update_patch.exe" matched known ransomware signature',     time:'8h ago',     status:'blocked'   },
    { id:'ALT-008', sev:'high',     title:'Admin Privilege Escalation',          desc:'User m.chen@corp.io attempted to escalate to admin role without approval','time':'12h ago',  status:'blocked'   },
  ],

  auditLogs: [
    { id:'LOG-5291', user:'alex.ryder',  action:'FILE_DOWNLOAD',  resource:'Q4_Financial_Report_2025.pdf', ip:'203.0.113.42', time:'Today 12:04',    status:'success' },
    { id:'LOG-5290', user:'j.torres',    action:'FILE_SHARE',     resource:'project_blueprint_v3.docx',    ip:'198.51.100.7',  time:'Today 11:58',    status:'success' },
    { id:'LOG-5289', user:'m.chen',      action:'PRIVILEGE_ESC',  resource:'Admin Panel',                  ip:'192.168.1.52',  time:'Today 11:32',    status:'blocked' },
    { id:'LOG-5288', user:'s.patel',     action:'FILE_DELETE',    resource:'legacy_keys_2022.key',         ip:'10.0.0.24',     time:'Today 11:15',    status:'success' },
    { id:'LOG-5287', user:'alex.ryder',  action:'USER_CREATE',    resource:'k.morgan@corp.io',             ip:'203.0.113.42',  time:'Today 10:50',    status:'success' },
    { id:'LOG-5286', user:'system',      action:'INTEGRITY_SCAN', resource:'Vault Root',                   ip:'internal',      time:'Today 10:00',    status:'success' },
    { id:'LOG-5285', user:'j.torres',    action:'FILE_UPLOAD',    resource:'server_backups.tar.gz',        ip:'198.51.100.7',  time:'Yesterday 23:41','status':'success' },
    { id:'LOG-5284', user:'unknown',     action:'LOGIN_FAIL',     resource:'auth.nyxvault.io',             ip:'185.220.101.34','time':'Yesterday 22:55','status':'blocked' },
    { id:'LOG-5283', user:'s.patel',     action:'SHARE_REVOKE',   resource:'SL-0038',                      ip:'10.0.0.24',     time:'Yesterday 21:10','status':'success' },
    { id:'LOG-5282', user:'m.chen',      action:'FILE_UPLOAD',    resource:'infra_diagram.png',            ip:'192.168.1.52',  time:'Yesterday 18:34','status':'success' },
    { id:'LOG-5281', user:'alex.ryder',  action:'SETTINGS_EDIT',  resource:'Vault Security Config',        ip:'203.0.113.42',  time:'Yesterday 16:22','status':'success' },
    { id:'LOG-5280', user:'system',      action:'ALERT_TRIGGER',  resource:'ALT-007',                      ip:'internal',      time:'Yesterday 14:05','status':'warning' },
  ],

  shareLinks: [
    { id:'SL-0052', file:'Q4_Financial_Report_2025.pdf', recipients:['sarah@partner.io','board@corp.io'],    expiry:'2026-07-10', views:12, dl:3,  status:'active'  },
    { id:'SL-0051', file:'project_blueprint_v3.docx',    recipients:['dev-team@acme.com'],                   expiry:'2026-06-28', views:47, dl:11, status:'active'  },
    { id:'SL-0050', file:'infra_diagram.png',            recipients:['ops@nyxvault.io'],                     expiry:'2026-06-24', views:8,  dl:2,  status:'expiring'},
    { id:'SL-0049', file:'api_codebase.zip',             recipients:['external@vendor.io'],                  expiry:'2026-06-15', views:33, dl:7,  status:'expired' },
    { id:'SL-0048', file:'server_backups.tar.gz',        recipients:['backup@sre.io'],                       expiry:'2026-07-30', views:1,  dl:1,  status:'active'  },
  ],

  integrityFiles: [
    { name:'Q4_Financial_Report_2025.pdf', hash:'a3f8e2...d91c04', lastScan:'2min ago',   size:'2.4 MB', status:'verified', changes:0 },
    { name:'vault_keys_2025.key',          hash:'7bc432...MISMATCH',lastScan:'31min ago',  size:'12 KB',  status:'tampered', changes:1 },
    { name:'server_backups.tar.gz',        hash:'e501da...4f22ab', lastScan:'2h ago',     size:'890 MB', status:'verified', changes:0 },
    { name:'project_blueprint_v3.docx',    hash:'9d3710...bb97f3', lastScan:'5h ago',     size:'1.1 MB', status:'verified', changes:0 },
    { name:'infra_diagram.png',            hash:'2c89fb...881102', lastScan:'5h ago',     size:'4.2 MB', status:'unverified',changes:0},
    { name:'api_codebase.zip',             hash:'f04c7a...e220dd', lastScan:'2d ago',     size:'34 MB',  status:'verified', changes:0 },
  ],

  adminUsers: [
    { name:'Alex Ryder',     email:'alex.ryder@nyxvault.io', role:'Admin',     files:1204, lastActive:'Now',     status:'active',  color:'#00d4ff' },
    { name:'Jordan Torres',  email:'j.torres@corp.io',        role:'Manager',   files:847,  lastActive:'2h ago',  status:'active',  color:'#7b2fff' },
    { name:'Ming Chen',      email:'m.chen@corp.io',          role:'Analyst',   files:312,  lastActive:'5h ago',  status:'flagged', color:'#ff3366' },
    { name:'Saanvi Patel',   email:'s.patel@corp.io',         role:'Developer', files:567,  lastActive:'1d ago',  status:'active',  color:'#00ff88' },
    { name:'Kim Morgan',     email:'k.morgan@corp.io',         role:'Viewer',    files:128,  lastActive:'3d ago',  status:'inactive',color:'#ffaa00' },
    { name:'Reza Ahmadi',    email:'r.ahmadi@corp.io',         role:'Developer', files:445,  lastActive:'4h ago',  status:'active',  color:'#1a6fff' },
  ],

  chartActivity: {
    labels: ['Jun 18','Jun 19','Jun 20','Jun 21','Jun 22','Jun 23','Jun 24'],
    uploads: [41, 68, 53, 89, 72, 95, 120],
    downloads: [87, 102, 74, 130, 98, 144, 168],
    alerts:  [2, 5, 3, 8, 4, 12, 14],
  },

  chartStorage: {
    labels: ['Documents','Archives','Images','Code','Keys','Other'],
    data: [34, 28, 14, 13, 4, 7],
  },

  chartThreats: {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    malware:   [2, 1, 4, 2, 7, 3, 5],
    intrusion: [5, 3, 8, 4, 9, 2, 6],
    anomaly:   [3, 6, 2, 9, 4, 8, 3],
  },
};

// =============================================
// SVG ICONS (inline)
// =============================================
const ICONS = {
  dashboard: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`,
  upload:    `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  files:     `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`,
  sharing:   `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  integrity: `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  alerts:    `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  logs:      `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
  profile:   `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
  admin:     `<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 00-14.14 0M4.93 19.07a10 10 0 0014.14 0M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>`,
  lock:      `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`,
  bell:      `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
  search:    `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  settings:  `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 00-14.14 0M4.93 19.07a10 10 0 0014.14 0M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>`,
  shield:    `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  download:  `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  share:     `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  trash:     `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>`,
  copy:      `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>`,
  check:     `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
  x:         `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  eye:       `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
  grid:      `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  list:      `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
  filter:    `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  key:       `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,
  refresh:   `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`,
  export:    `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  plus:      `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  edit:      `<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  zap:       `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  cpu:       `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,
  server:    `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>`,
  user2:     `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`,
  globe:     `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>`,
};

// =============================================
// UTILITIES
// =============================================
const $ = id => document.getElementById(id);
const $q = sel => document.querySelector(sel);
const $qa = sel => document.querySelectorAll(sel);

function fileIcon(type) {
  const icons = {
    pdf: '📄', doc: '📝', zip: '🗜️', img: '🖼️', key: '🔑', code: '💻',
    folder: '📁', xls: '📊', txt: '📃', mp4: '🎬', csv: '📊',
  };
  return icons[type] || '📁';
}

function fileIconClass(type) {
  const cls = { pdf:'pdf', doc:'doc', zip:'zip', img:'img', key:'key', code:'code' };
  return cls[type] || 'doc';
}

function getFileTypeFromFilename(filename) {
  if (!filename) return 'doc';
  const ext = filename.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx', 'odt'].includes(ext)) return 'doc';
  if (['zip', 'rar', 'tar', 'gz', '7z'].includes(ext)) return 'zip';
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return 'img';
  if (['pem', 'key', 'pub', 'der', 'crt'].includes(ext)) return 'key';
  if (['js', 'py', 'json', 'css', 'html', 'sh', 'bat', 'go', 'rs', 'cpp', 'c', 'java', 'ts'].includes(ext)) return 'code';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'xls';
  if (['txt', 'log', 'md'].includes(ext)) return 'txt';
  if (['mp4', 'mkv', 'avi', 'mov'].includes(ext)) return 'mp4';
  return 'doc';
}

function severityClass(sev) {
  return { critical:'danger', high:'warning', medium:'cyan', low:'success' }[sev] || 'muted';
}

function actionBadge(action) {
  const map = {
    FILE_DOWNLOAD: 'cyan', FILE_UPLOAD: 'success', FILE_SHARE: 'purple',
    FILE_DELETE: 'danger', LOGIN_FAIL: 'danger', PRIVILEGE_ESC: 'danger',
    USER_CREATE: 'success', INTEGRITY_SCAN: 'cyan', ALERT_TRIGGER: 'warning',
    SETTINGS_EDIT: 'cyan', SHARE_REVOKE: 'warning',
  };
  return map[action] || 'muted';
}

function statusBadge(status) {
  const map = {
    active:'success', resolved:'muted', reviewing:'warning', blocked:'danger',
    expiring:'warning', expired:'danger', inactive:'muted', flagged:'danger',
    verified:'success', tampered:'danger', unverified:'warning',
    success:'success', warning:'warning', blocked:'danger',
  };
  return map[status] || 'muted';
}

function showToast(msg, type = 'info') {
  const icons = { success: '✅', error: '❌', info: '🔔', warning: '⚠️' };
  const tc = $('toast-container');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span class="toast-icon">${icons[type]}</span><span class="toast-msg">${msg}</span>`;
  tc.appendChild(t);
  setTimeout(() => { t.style.opacity='0'; t.style.transform='translateY(10px)'; t.style.transition='0.3s'; setTimeout(()=>t.remove(), 300); }, 3500);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 ** 2) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 ** 3) return (bytes / 1024 ** 2).toFixed(1) + ' MB';
  return (bytes / 1024 ** 3).toFixed(1) + ' GB';
}

// =============================================
// CHART.JS GLOBAL DEFAULTS
// =============================================
function setChartDefaults() {
  if (!window.Chart) return;
  Chart.defaults.color = '#8899bb';
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.font.size = 12;
}

// =============================================
// LAYOUT COMPONENTS
// =============================================
function renderBackground() {
  return `
    <div class="bg-grid"></div>
    <div class="bg-orbs">
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>
    </div>`;
}

function renderSidebar(activePage) {
  const isAuditor = MOCK.user.role === 'Auditor';
  const isAdmin = MOCK.user.role === 'Admin';

  const navItems = [
    { id:'dashboard', label:'Dashboard',         icon: ICONS.dashboard, badge: null  },
    ...(!isAuditor ? [
      { id:'upload',    label:'File Upload',        icon: ICONS.upload,    badge: null  },
    ] : []),
    { id:'files',     label:'File Manager',       icon: ICONS.files,     badge: null  },
    ...(!isAuditor ? [
      { id:'sharing',   label:'Secure Sharing',     icon: ICONS.sharing,   badge: null  },
    ] : []),
    { id:'integrity', label:'Integrity Monitor',  icon: ICONS.integrity, badge: null  },
    { id:'alerts',    label:'Alert Center',       icon: ICONS.alerts,    badge: null  },
    { id:'logs',      label:'Audit Logs',         icon: ICONS.logs,      badge: null  },
  ];
  
  const bottomNav = [
    { id:'profile',  label:'Profile',        icon: ICONS.profile,  badge: null },
    { id:'docs',     label:'Documentation',  icon: ICONS.logs,     badge: null },
    ...(isAdmin ? [
      { id:'admin',    label:'Admin Panel',    icon: ICONS.admin,    badge: null },
    ] : []),
  ];

  const renderItem = (item) => `
    <a class="nav-item ${activePage === item.id ? 'active' : ''}" href="#/${item.id}" id="nav-${item.id}">
      <span class="nav-icon">${item.icon}</span>
      <span>${item.label}</span>
      ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
    </a>`;

  return `
    <div class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">🔒</div>
        <span class="logo-text">NyxVault</span>
        <span class="logo-badge">v2.4</span>
      </div>
      <div class="sidebar-nav">
        <div class="sidebar-section">Main Menu</div>
        ${navItems.map(renderItem).join('')}
        <div class="sidebar-section" style="margin-top:12px">Account</div>
        ${bottomNav.map(renderItem).join('')}
      </div>
      <div class="sidebar-footer">
        <div class="sidebar-user" onclick="navigate('profile')">
          <div class="user-avatar">${MOCK.user.avatar}</div>
          <div class="user-info">
            <div class="user-name">${MOCK.user.name}</div>
            <div class="user-role">${MOCK.user.role} · ${MOCK.user.plan}</div>
          </div>
          <div class="online-dot"></div>
        </div>
      </div>
    </div>
    <div class="sidebar-overlay" id="sidebar-overlay" onclick="closeSidebar()"></div>`;
}

function renderNavbar(title, subtitle) {
  return `
    <nav class="navbar">
      <button class="hamburger-btn" onclick="toggleSidebar()">☰</button>
      <div class="navbar-title">${title} ${subtitle ? `<span>/ ${subtitle}</span>` : ''}</div>
      <div class="navbar-search">
        <span class="search-icon">${ICONS.search}</span>
        <input type="text" placeholder="Search files, logs, alerts…" id="global-search" />
      </div>
      <div class="navbar-actions">
        <button class="icon-btn" title="Refresh" onclick="showToast('Data refreshed','success')">${ICONS.refresh}</button>
        <button class="icon-btn" title="Notifications" onclick="navigate('alerts')">
          ${ICONS.bell}
          <span class="notif-dot"></span>
        </button>
        <button class="icon-btn" title="Settings" onclick="navigate('profile')">${ICONS.settings}</button>
        <div class="navbar-avatar" onclick="navigate('profile')" title="${MOCK.user.name}">${MOCK.user.avatar}</div>
      </div>
    </nav>`;
}

function renderAppLayout(activePage, navTitle, content) {
  return `
    ${renderBackground()}
    <div class="app-wrapper">
      ${renderSidebar(activePage)}
      ${renderNavbar(navTitle)}
      <main class="main-content animate-fade">
        ${content}
      </main>
    </div>`;
}

// =============================================
// PAGE: LANDING
// =============================================
// =============================================
// LANDING LAYOUT HELPER
// =============================================
function renderLandingLayout(content) {
  return `
    ${renderBackground()}
    <div class="landing">
      <nav class="landing-nav">
        <div class="landing-logo" onclick="navigate('')" style="cursor:pointer">
          <div class="logo-icon-sm">🔒</div>
          NyxVault
        </div>
        <div class="landing-nav-links">
          <a href="#/features">Features</a>
          <a href="#/security">Security</a>
          <a href="#/docs">Docs</a>
        </div>
        <div class="landing-nav-cta">
          <button class="btn btn-ghost btn-sm" onclick="navigate('login')">Sign In</button>
          <button class="btn btn-primary btn-sm" onclick="navigate('register')">Start Free Trial</button>
        </div>
      </nav>

      ${content}

      <footer class="landing-footer">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-weight:700;color:var(--text-secondary)">NyxVault</span>
          <span>© 2026. All rights reserved.</span>
        </div>
        <div style="display:flex;gap:20px">
          <a href="#" style="color:var(--text-muted)">Privacy</a>
          <a href="#" style="color:var(--text-muted)">Terms</a>
          <a href="#/security" style="color:var(--text-muted)">Security</a>
          <a href="#" style="color:var(--text-muted)">Status</a>
        </div>
        <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--success)">
          <div class="online-dot"></div> All systems operational
        </div>
      </footer>
    </div>`;
}

// =============================================
// PAGE: LANDING
// =============================================
function renderLanding() {
  const features = [
    { icon:'🔐', title:'Zero-Knowledge Encryption',  desc:'Your files are encrypted client-side before upload. We never see your data — only you hold the keys.' },
    { icon:'🛡️', title:'Real-Time Integrity Monitoring', desc:'Continuous SHA-256 hash verification detects even a single bit of tampering within seconds.' },
    { icon:'🔗', title:'Secure Share Links',         desc:'Generate time-limited, password-protected share links with per-recipient access controls.' },
    { icon:'📊', title:'Audit Trail & Compliance',   desc:'Full immutable audit logs for GDPR, SOC 2, HIPAA, and ISO 27001 compliance reporting.' },
    { icon:'⚡', title:'Threat Intelligence',        desc:'AI-powered anomaly detection identifies suspicious activity before breaches occur.' },
    { icon:'☁️', title:'Multi-Region Redundancy',    desc:'Files distributed across 12+ global regions with 99.99% uptime SLA guarantees.' },
  ];
  const tickers = [
    'AES-256-GCM Encryption','Zero-Knowledge Architecture','FIPS 140-2 Certified','SOC 2 Type II','GDPR Compliant','ISO 27001','HIPAA Ready','Multi-Region HA',
    'AES-256-GCM Encryption','Zero-Knowledge Architecture','FIPS 140-2 Certified','SOC 2 Type II','GDPR Compliant','ISO 27001','HIPAA Ready','Multi-Region HA',
  ];

  const content = `
      <!-- Hero -->
      <section class="hero" id="hero">
        <div class="hero-content">
          <div class="hero-badge">
            <span class="pulse"></span>
            System Status: All Secure — 99.98% Uptime
          </div>
          <h1>
            The <span class="gradient-text">Zero-Knowledge</span><br>
            Secure File Vault
          </h1>
          <p>Enterprise-grade cloud vault with AES-256 encryption, real-time integrity monitoring, and advanced threat detection. Your data stays yours — always.</p>
          <div class="hero-cta">
            <button class="btn btn-primary btn-lg" onclick="navigate('register')">
              🚀 Start Free Trial
            </button>
            <button class="btn btn-ghost btn-lg" onclick="navigate('login')">
              ${ICONS.eye} View Demo
            </button>
          </div>
          <div class="hero-stats">
            <div class="hero-stat"><div class="stat-num">50M+</div><div class="stat-desc">Files Secured</div></div>
            <div class="hero-stat"><div class="stat-num">12K+</div><div class="stat-desc">Enterprises</div></div>
            <div class="hero-stat"><div class="stat-num">99.98%</div><div class="stat-desc">Uptime SLA</div></div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="hero-card-mock">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
              <span style="font-family:var(--font-display);font-weight:700;color:var(--text-primary);font-size:14px">Security Overview</span>
              <span class="badge badge-success"><span class="blink"></span> LIVE</span>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
              ${['🛡️ Integrity Score<br><b style="color:var(--success);font-size:22px">97.2%</b>','⚠️ Active Alerts<br><b style="color:var(--danger);font-size:22px">14</b>','🔐 Encrypted Files<br><b style="color:var(--cyan);font-size:22px">4,827</b>','📡 Threat Blocked<br><b style="color:var(--warning);font-size:22px">3</b>'].map(s=>`
              <div style="background:var(--glass-3);border:1px solid var(--border);border-radius:var(--r-sm);padding:12px;font-size:11px;color:var(--text-muted)">${s}</div>`).join('')}
            </div>
            <div style="background:var(--glass-3);border:1px solid var(--border);border-radius:var(--r-sm);padding:12px;font-size:11px;color:var(--text-muted)">
              <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span>Storage Used</span><span style="color:var(--cyan)">68.4 / 100 GB</span></div>
              <div class="progress-bar"><div class="progress-fill" style="width:68.4%"></div></div>
            </div>
            <div style="margin-top:12px;display:flex;flex-direction:column;gap:6px">
              ${[
                ['vault_keys_2025.key','12 KB','verified'],
                ['Q4_Financial_Report.pdf','2.4 MB','verified'],
                ['server_backups.tar.gz','890 MB','scanning'],
              ].map(([n,s,st])=>`
              <div style="display:flex;align-items:center;gap:8px;padding:7px;background:var(--glass-3);border-radius:6px;font-size:11px">
                <span>🔑</span>
                <span style="color:var(--text-secondary);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${n}</span>
                <span style="color:var(--text-muted)">${s}</span>
                <span class="badge badge-${st==='verified'?'success':st==='scanning'?'warning':'danger'}" style="font-size:9px;padding:2px 6px">${st}</span>
              </div>`).join('')}
            </div>
          </div>
        </div>
      </section>

      <!-- Ticker -->
      <div class="security-ticker">
        <div class="ticker-track">
          ${tickers.map(t=>`<div class="ticker-item"><div class="ticker-dot"></div><span>${t}</span></div>`).join('')}
        </div>
      </div>

      <!-- Features -->
      <section class="features" id="features">
        <div class="section-heading">
          <div class="section-label">Platform Features</div>
          <h2>Security Without Compromise</h2>
          <p>Every feature engineered for enterprise-grade data protection, compliance, and threat intelligence.</p>
        </div>
        <div class="features-grid stagger">
          ${features.map(f=>`
          <div class="feature-card animate-fade">
            <div class="feature-icon">${f.icon}</div>
            <h3>${f.title}</h3>
            <p>${f.desc}</p>
          </div>`).join('')}
        </div>
      </section>

      <!-- CTA -->
      <section style="padding:80px 60px;text-align:center;position:relative">
        <div class="section-label">Get Started Today</div>
        <h2 style="font-family:var(--font-display);font-size:38px;font-weight:700;margin:16px 0 14px;letter-spacing:-1px">Ready to Secure Your Vault?</h2>
        <p style="color:var(--text-secondary);margin-bottom:30px;max-width:480px;margin-left:auto;margin-right:auto">Join 12,000+ enterprises protecting their most sensitive data with NyxVault.</p>
        <div style="display:flex;gap:14px;justify-content:center">
          <button class="btn btn-primary btn-lg" onclick="navigate('register')">🚀 Start Free — No Credit Card</button>
          <button class="btn btn-ghost btn-lg" onclick="navigate('login')">Sign In to Existing Vault</button>
        </div>
      </section>`;

  return renderLandingLayout(content);
}

// =============================================
// PAGE: FEATURES
// =============================================
function renderFeaturesPage() {
  const content = `
    <div class="features-page" style="padding: 120px 20px 80px; max-width: 1200px; margin: 0 auto; position: relative; z-index: 1;">
      <div class="section-heading" style="text-align: center; margin-bottom: 60px;">
        <div class="section-label">Enterprise-Grade Architecture</div>
        <h1 style="font-family: var(--font-display); font-size: 48px; font-weight: 800; margin: 16px 0 20px; line-height: 1.1; letter-spacing: -1px;">
          Next-Generation <span class="gradient-text">Zero-Knowledge</span> Features
        </h1>
        <p style="color: var(--text-secondary); max-width: 600px; margin: 0 auto; font-size: 16px;">
          Uncompromised protection with client-side cryptography, active threat monitoring, and complete regulatory compliance.
        </p>
      </div>

      <!-- Features Details Grid -->
      <div class="features-detail-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; margin-bottom: 80px;">
        <div class="card card-hover" style="padding: 30px; background: var(--glass-2); border: 1px solid var(--border); border-radius: var(--r-md); transition: var(--t);">
          <div style="font-size: 32px; margin-bottom: 20px;">🔐</div>
          <h3 style="font-family: var(--font-display); font-size: 20px; font-weight: 700; margin-bottom: 12px; color: var(--text-primary);">Zero-Knowledge Encryption</h3>
          <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6;">
            Your files are encrypted inside your browser before they leave your device using 256-bit AES-GCM encryption. We do not store, transit, or hold keys.
          </p>
        </div>

        <div class="card card-hover" style="padding: 30px; background: var(--glass-2); border: 1px solid var(--border); border-radius: var(--r-md); transition: var(--t);">
          <div style="font-size: 32px; margin-bottom: 20px;">🛡️</div>
          <h3 style="font-family: var(--font-display); font-size: 20px; font-weight: 700; margin-bottom: 12px; color: var(--text-primary);">Real-Time Integrity Monitoring</h3>
          <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6;">
            A continuous monitoring system verifies the SHA-256 integrity hash of your files at rest. Any unauthorized modification triggers instant admin alerts.
          </p>
        </div>

        <div class="card card-hover" style="padding: 30px; background: var(--glass-2); border: 1px solid var(--border); border-radius: var(--r-md); transition: var(--t);">
          <div style="font-size: 32px; margin-bottom: 20px;">🔗</div>
          <h3 style="font-family: var(--font-display); font-size: 20px; font-weight: 700; margin-bottom: 12px; color: var(--text-primary);">Granular Sharing Controls</h3>
          <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6;">
            Generate time-limited links with custom download counts, optional password protection, IP whitelists, and geographical blocklists.
          </p>
        </div>

        <div class="card card-hover" style="padding: 30px; background: var(--glass-2); border: 1px solid var(--border); border-radius: var(--r-md); transition: var(--t);">
          <div style="font-size: 32px; margin-bottom: 20px;">⚡</div>
          <h3 style="font-family: var(--font-display); font-size: 20px; font-weight: 700; margin-bottom: 12px; color: var(--text-primary);">Threat Intelligence IDS</h3>
          <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6;">
            Our Intrusion Detection System dynamically monitors request rates, blocks malicious user-agents, and auto-quarantines anomalous accounts.
          </p>
        </div>

        <div class="card card-hover" style="padding: 30px; background: var(--glass-2); border: 1px solid var(--border); border-radius: var(--r-md); transition: var(--t);">
          <div style="font-size: 32px; margin-bottom: 20px;">📜</div>
          <h3 style="font-family: var(--font-display); font-size: 20px; font-weight: 700; margin-bottom: 12px; color: var(--text-primary);">GDPR & SOC 2 Compliance</h3>
          <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6;">
            Fully immutable audit trails capture every action, IP address, and payload check, generating comprehensive compliance reports in one click.
          </p>
        </div>

        <div class="card card-hover" style="padding: 30px; background: var(--glass-2); border: 1px solid var(--border); border-radius: var(--r-md); transition: var(--t);">
          <div style="font-size: 32px; margin-bottom: 20px;">🔑</div>
          <h3 style="font-family: var(--font-display); font-size: 20px; font-weight: 700; margin-bottom: 12px; color: var(--text-primary);">REST API Access Keys</h3>
          <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.6;">
            Integrate programmatically using cryptographic API keys. Standard webhooks notify your systems of events in real time.
          </p>
        </div>
      </div>

      <!-- Interactive Cryptography Sandbox -->
      <div class="card" style="padding: 40px; background: var(--glass-1); border: 1px solid rgba(0, 212, 255, 0.25); border-radius: var(--r-lg); box-shadow: var(--shadow-glow-cyan); margin-bottom: 60px;">
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px;">
          <div class="section-label" style="align-self: flex-start;">Interactive Cryptographic Sandbox</div>
          <h2 style="font-family: var(--font-display); font-size: 28px; font-weight: 700; color: var(--text-primary);">Simulate Zero-Knowledge Encryption</h2>
          <p style="color: var(--text-secondary); font-size: 14px; max-width: 650px;">
            See how your browser encrypts data client-side before sending it to the server. Type any plaintext below to watch it instantly encrypt using 256-bit AES-GCM.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-weight: 600;">Plaintext Input (Client-Side)</label>
            <textarea id="sandbox-plaintext" class="form-input" style="height: 120px; resize: none; background: rgba(0,0,0,0.2); font-family: var(--font-mono); font-size: 13px; color: var(--text-primary);" placeholder="Type some sensitive data here to encrypt..." oninput="simulateEncryption()"></textarea>
            <div style="margin-top: 10px; display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted);">
              <span>Web Cryptography API (AES-GCM-256)</span>
              <span>Local Encryption Only</span>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div class="form-group" style="margin-bottom: 0; flex: 1;">
              <label class="form-label" style="font-weight: 600;">Encrypted Ciphertext (Sent to Server)</label>
              <textarea id="sandbox-ciphertext" class="form-input" style="height: 120px; resize: none; background: rgba(0,0,0,0.4); border-color: rgba(0, 212, 255, 0.15); font-family: var(--font-mono); font-size: 11px; color: var(--cyan); cursor: default;" readonly placeholder="Encrypted payload will appear here..."></textarea>
            </div>
          </div>
        </div>

        <div style="margin-top: 20px; padding: 14px; background: rgba(0,212,255,0.03); border: 1px dashed rgba(0,212,255,0.15); border-radius: var(--r-sm); font-size: 12px; line-height: 1.5; color: var(--text-secondary); display: flex; gap: 10px; align-items: center;">
          <span style="font-size: 18px;">💡</span>
          <span>Notice that the server only ever receives this scrambled ciphertext. Because we do not store your master key, there is mathematically no way for us to read your original text.</span>
        </div>
      </div>
      
      <!-- CTA -->
      <div style="text-align: center; padding: 40px 0;">
        <h2 style="font-family: var(--font-display); font-size: 32px; font-weight: 700; margin-bottom: 16px;">Get Enterprise Protection Free</h2>
        <p style="color: var(--text-secondary); margin-bottom: 24px; max-width: 450px; margin-left: auto; margin-right: auto;">Unlock full zero-knowledge file encryption, tracking, and compliance tools without any pricing tiers.</p>
        <button class="btn btn-primary btn-lg" onclick="navigate('register')">Create Your Free Vault Now</button>
      </div>
    </div>`;

  const token = localStorage.getItem('nyxvault_token');
  if (token) {
    return content;
  } else {
    return renderLandingLayout(content);
  }
}

// Global hook for sandbox encryption simulation
window.simulateEncryption = async () => {
  const plaintext = document.getElementById('sandbox-plaintext').value;
  const ciphertextArea = document.getElementById('sandbox-ciphertext');
  if (!plaintext) {
    ciphertextArea.value = '';
    return;
  }

  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(plaintext);

    const cryptoKey = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt']
    );

    const encryptedBuf = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      cryptoKey,
      encodedData
    );

    const ciphertextArray = new Uint8Array(encryptedBuf);
    
    const ivHex = Array.from(iv).map(b => b.toString(16).padStart(2, '0')).join('');
    const cipherHex = Array.from(ciphertextArray).map(b => b.toString(16).padStart(2, '0')).join('');
    
    ciphertextArea.value = JSON.stringify({
      algorithm: "AES-GCM-256",
      iv: ivHex,
      ciphertext: cipherHex,
      length_bytes: ciphertextArray.length,
      note: "Encrypted client-side in-memory"
    }, null, 2);
  } catch (err) {
    ciphertextArea.value = "Encryption simulation error: " + err.message;
  }
};

// =============================================
// PAGE: SECURITY
// =============================================
function renderSecurityPage() {
  const content = `
    <div class="security-page" style="padding: 120px 20px 80px; max-width: 1200px; margin: 0 auto; position: relative; z-index: 1;">
      <div class="section-heading" style="text-align: center; margin-bottom: 60px;">
        <div class="section-label">Cryptographic Integrity</div>
        <h1 style="font-family: var(--font-display); font-size: 48px; font-weight: 800; margin: 16px 0 20px; line-height: 1.1; letter-spacing: -1px;">
          Security <span class="gradient-text">Architecture</span> & Standards
        </h1>
        <p style="color: var(--text-secondary); max-width: 600px; margin: 0 auto; font-size: 16px;">
          Learn about our Zero-Knowledge protocols, compliance controls, and real-time threat prevention mechanisms.
        </p>
      </div>

      <!-- Security Pillars Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; margin-bottom: 60px;">
        <!-- Cryptography Section -->
        <div class="card" style="padding: 30px; background: var(--glass-2); border: 1px solid var(--border); border-radius: var(--r-md);">
          <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
            <span style="font-size: 24px; padding: 10px; background: rgba(0, 212, 255, 0.1); border-radius: 8px;">🔑</span>
            <h2 style="font-family: var(--font-display); font-size: 22px; font-weight: 700;">Client-Side Cryptography</h2>
          </div>
          <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.7; margin-bottom: 16px;">
            NyxVault runs on a Zero-Knowledge paradigm. All calculations are executed in-memory on the client before network transit:
          </p>
          <ul style="color: var(--text-secondary); font-size: 13px; line-height: 1.8; list-style-type: disc; padding-left: 20px; display: flex; flex-direction: column; gap: 8px;">
            <li><strong>Key Derivation:</strong> Client passwords are salted and stretched using <strong>PBKDF2</strong> with 100,000 iterations.</li>
            <li><strong>Symmetric Encryption:</strong> File blocks are encrypted client-side using <strong>AES-256-GCM</strong>, providing confidentiality and integrity verification.</li>
            <li><strong>Key Wrapping:</strong> Sub-keys generated for specific file versions are wrapped using RSA-OAEP keys, enabling decentralized secure sharing.</li>
          </ul>
        </div>

        <!-- Threat Detection Section -->
        <div class="card" style="padding: 30px; background: var(--glass-2); border: 1px solid var(--border); border-radius: var(--r-md);">
          <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
            <span style="font-size: 24px; padding: 10px; background: rgba(123, 47, 255, 0.1); border-radius: 8px;">🛡️</span>
            <h2 style="font-family: var(--font-display); font-size: 22px; font-weight: 700;">Intrusion & Threat Shield</h2>
          </div>
          <p style="color: var(--text-secondary); font-size: 14px; line-height: 1.7; margin-bottom: 16px;">
            Active defense layers analyze traffic patterns at the application boundary to identify and halt attacks:
          </p>
          <ul style="color: var(--text-secondary); font-size: 13px; line-height: 1.8; list-style-type: disc; padding-left: 20px; display: flex; flex-direction: column; gap: 8px;">
            <li><strong>Brute Force Shield:</strong> Multiple failed login attempts trigger an IP lock and generate a high-priority alert.</li>
            <li><strong>Real-time Socket Alerts:</strong> Intrusion triggers are pushed immediately to logged-in administrator terminals via WebSockets.</li>
            <li><strong>Geo-IP Restrictions:</strong> Security managers can restrict API or file retrieval routes to specific countries.</li>
          </ul>
        </div>
      </div>

      <!-- Interactive Compliance Checklists -->
      <div class="card" style="padding: 40px; background: var(--glass-1); border: 1px solid var(--border); border-radius: var(--r-lg); margin-bottom: 60px;">
        <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px;">
          <div class="section-label" style="align-self: flex-start;">Compliance Engine</div>
          <h2 style="font-family: var(--font-display); font-size: 28px; font-weight: 700;">Interactive Standards Compliance Checklist</h2>
          <p style="color: var(--text-secondary); font-size: 14px; max-width: 600px;">
            Toggle the parameters of your deployment below to inspect the corresponding compliance standards that NyxVault satisfies.
          </p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
          <!-- Controls -->
          <div style="display: flex; flex-direction: column; gap: 16px; justify-content: center;">
            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="comp-opt-encryption" checked onchange="updateComplianceMetrics()" style="accent-color: var(--cyan); width: 18px; height: 18px; cursor: pointer;" />
              <div>
                <strong style="font-size: 14px; display: block; color: var(--text-primary);">Enforce Client-Side Encryption</strong>
                <span style="font-size: 11px; color: var(--text-muted);">Encrypts all bytes locally using AES-256.</span>
              </div>
            </label>

            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="comp-opt-mfa" checked onchange="updateComplianceMetrics()" style="accent-color: var(--cyan); width: 18px; height: 18px; cursor: pointer;" />
              <div>
                <strong style="font-size: 14px; display: block; color: var(--text-primary);">Mandatory Multi-Factor Authentication (MFA)</strong>
                <span style="font-size: 11px; color: var(--text-muted);">Requires TOTP verification for all profile logins.</span>
              </div>
            </label>

            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="comp-opt-logs" checked onchange="updateComplianceMetrics()" style="accent-color: var(--cyan); width: 18px; height: 18px; cursor: pointer;" />
              <div>
                <strong style="font-size: 14px; display: block; color: var(--text-primary);">Immutable Audit Trails</strong>
                <span style="font-size: 11px; color: var(--text-muted);">Logs all actions and events into write-once logs.</span>
              </div>
            </label>

            <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
              <input type="checkbox" id="comp-opt-sharing" onchange="updateComplianceMetrics()" style="accent-color: var(--cyan); width: 18px; height: 18px; cursor: pointer;" />
              <div>
                <strong style="font-size: 14px; display: block; color: var(--text-primary);">Enforce Restricted Geo-IP & Whitelisting</strong>
                <span style="font-size: 11px; color: var(--text-muted);">Bypasses and blocks link requests outside allowed regions.</span>
              </div>
            </label>
          </div>

          <!-- Compliance Checklist Indicator -->
          <div style="background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: var(--r-md); padding: 24px; display: flex; flex-direction: column; gap: 16px;">
            <h3 style="font-family: var(--font-display); font-size: 16px; font-weight: 700; border-bottom: 1px solid var(--border); padding-bottom: 10px; color: var(--text-primary);">Active Framework Satisfiability</h3>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div id="badge-soc2" class="badge" style="padding: 10px; text-align: center; border-radius: 6px; font-size: 12px; font-weight: bold; border: 1px solid rgba(0,255,136,0.15); background: rgba(0,255,136,0.05); color: var(--success);">SOC 2 Type II</div>
              <div id="badge-gdpr" class="badge" style="padding: 10px; text-align: center; border-radius: 6px; font-size: 12px; font-weight: bold; border: 1px solid rgba(0,255,136,0.15); background: rgba(0,255,136,0.05); color: var(--success);">GDPR Compliant</div>
              <div id="badge-hipaa" class="badge" style="padding: 10px; text-align: center; border-radius: 6px; font-size: 12px; font-weight: bold; border: 1px solid rgba(0,255,136,0.15); background: rgba(0,255,136,0.05); color: var(--success);">HIPAA Ready</div>
              <div id="badge-iso" class="badge" style="padding: 10px; text-align: center; border-radius: 6px; font-size: 12px; font-weight: bold; border: 1px solid rgba(0,255,136,0.15); background: rgba(0,255,136,0.05); color: var(--success);">ISO/IEC 27001</div>
            </div>
            
            <div style="margin-top: 10px; font-size: 12px; line-height: 1.5; color: var(--text-secondary);" id="compliance-verdict">
              All compliance checklist blocks are active. System meets requirements for SOC 2 (Trust Service Criteria), GDPR Article 32, HIPAA security standards, and ISO 27001 annex controls.
            </div>
          </div>
        </div>
      </div>
    </div>`;

  const token = localStorage.getItem('nyxvault_token');
  if (token) {
    return content;
  } else {
    return renderLandingLayout(content);
  }
}

window.updateComplianceMetrics = () => {
  const enc = document.getElementById('comp-opt-encryption').checked;
  const mfa = document.getElementById('comp-opt-mfa').checked;
  const logs = document.getElementById('comp-opt-logs').checked;
  const ip = document.getElementById('comp-opt-sharing').checked;

  const bSoc2 = document.getElementById('badge-soc2');
  const bGdpr = document.getElementById('badge-gdpr');
  const bHipaa = document.getElementById('badge-hipaa');
  const bIso = document.getElementById('badge-iso');
  const verdict = document.getElementById('compliance-verdict');

  const hasSoc2 = enc && logs;
  const hasGdpr = enc && logs && ip;
  const hasHipaa = enc && logs && mfa;
  const hasIso = enc && mfa && logs;

  const setStatus = (el, active) => {
    if (active) {
      el.style.border = '1px solid rgba(0,255,136,0.15)';
      el.style.background = 'rgba(0,255,136,0.05)';
      el.style.color = 'var(--success)';
      el.style.opacity = '1';
    } else {
      el.style.border = '1px solid rgba(255,51,102,0.15)';
      el.style.background = 'rgba(255,51,102,0.05)';
      el.style.color = 'var(--danger)';
      el.style.opacity = '0.5';
    }
  };

  setStatus(bSoc2, hasSoc2);
  setStatus(bGdpr, hasGdpr);
  setStatus(bHipaa, hasHipaa);
  setStatus(bIso, hasIso);

  let texts = [];
  if (!enc) texts.push("Enabling Client-Side Encryption is mandatory for all compliance frameworks.");
  if (!logs) texts.push("Logs are needed for SOC 2 monitoring and GDPR compliance auditing.");
  if (!mfa) texts.push("MFA is required under HIPAA and ISO 27001 access control protocols.");
  if (!ip) texts.push("Geo-IP location boundaries are recommended to satisfy strict GDPR data transfer rules.");

  if (texts.length === 0) {
    verdict.textContent = "All compliance checklist blocks are active. System meets requirements for SOC 2 (Trust Service Criteria), GDPR Article 32, HIPAA security standards, and ISO 27001 annex controls.";
    verdict.style.color = "var(--text-secondary)";
  } else {
    verdict.textContent = "⚠️ Gaps identified: " + texts.join(" ");
    verdict.style.color = "var(--warning)";
  }
};

// =============================================
// PAGE: DOCUMENTATION HUB
// =============================================
function renderDocsPage() {
  const sections = [
    {
      id: 'docs-intro',
      title: 'Introduction & Overview',
      content: `
        <p style="margin-bottom: 12px;">NyxVault is an enterprise-grade secure cloud file vault designed with zero-knowledge encryption, real-time integrity monitoring, and advanced access controls.</p>
        <p style="margin-bottom: 12px;">This documentation hub outlines how to manage, verify, and programmatically integrate files with NyxVault. Whether you are using our web interface or interacting with our REST APIs, NyxVault handles all cryptography securely.</p>
        <div style="background: rgba(0, 212, 255, 0.05); border: 1px solid rgba(0, 212, 255, 0.12); padding: 12px; border-radius: var(--r-sm); margin-top: 14px;">
          <strong style="color: var(--text-cyan); display: block; margin-bottom: 4px;">Key Architectural Premises:</strong>
          <ul style="padding-left: 18px; list-style-type: disc; display: flex; flex-direction: column; gap: 4px;">
            <li>Zero plaintext transmission: Keys never leave the local user browser session.</li>
            <li>Immutable audit logs: Records all security actions tamper-proof.</li>
            <li>Real-time WebSocket alerts: Immediate notifications of intrusion actions.</li>
          </ul>
        </div>
      `
    },
    {
      id: 'docs-crypto',
      title: 'Zero-Knowledge Cryptography',
      content: `
        <p style="margin-bottom: 12px;">The core of NyxVault's security model is <strong>client-side encryption</strong>. Files are scrambled in the user's browser before being uploaded to the cloud.</p>
        <p style="margin-bottom: 12px;">Symmetric keys are generated on a per-file basis using random cryptographically secure entropy. The sub-keys are encrypted using the user's master key, which is derived from their passphrase via PBKDF2 key stretching:</p>
        <pre style="background: rgba(0,0,0,0.3); border: 1px solid var(--border); padding: 12px; border-radius: 6px; font-family: var(--font-mono); font-size: 11px; overflow-x: auto; color: var(--text-secondary); margin: 12px 0;">
Derived Key = PBKDF2(Password, Salt, iterations=100000, keylen=256 bits)</pre>
        <p>This wrapped key is stored in the database. When downloading a file, the wrapped key is sent to the client browser, which decrypts it using the user's locally held master key and uses it to decrypt the file stream.</p>
      `
    },
    {
      id: 'docs-api',
      title: 'REST API & CLI Integration',
      content: `
        <p style="margin-bottom: 12px;">Interact with your secure vault programmatically using our REST APIs. First, generate an API key in your **Profile Panel**.</p>
        <p style="margin-bottom: 12px;">All requests to the API must include the API key in the authorization header:</p>
        
        <!-- Tabbed Code Block -->
        <div style="background: var(--bg-secondary); border: 1px solid var(--border); border-radius: var(--r-md); overflow: hidden; margin-top: 14px;">
          <div style="display: flex; background: rgba(0,0,0,0.3); border-bottom: 1px solid var(--border); font-size: 12px;">
            <div id="tab-curl" onclick="switchCodeTab('curl')" style="padding: 10px 16px; cursor: pointer; color: var(--cyan); border-bottom: 2px solid var(--cyan); font-family: var(--font-display); font-weight: 600;">curl</div>
            <div id="tab-js" onclick="switchCodeTab('js')" style="padding: 10px 16px; cursor: pointer; color: var(--text-muted); font-family: var(--font-display); font-weight: 600;">Javascript</div>
            <div id="tab-py" onclick="switchCodeTab('py')" style="padding: 10px 16px; cursor: pointer; color: var(--text-muted); font-family: var(--font-display); font-weight: 600;">Python</div>
          </div>
          
          <div style="padding: 16px; position: relative;">
            <button class="btn btn-ghost btn-sm" onclick="copyDocsCode()" style="position: absolute; right: 10px; top: 10px; font-size: 10px; padding: 4px 8px; border-radius: 4px; border: 1px solid var(--border);">Copy</button>
            <pre id="docs-code-pane" style="font-family: var(--font-mono); font-size: 11px; color: var(--text-secondary); line-height: 1.5; margin: 0; overflow-x: auto; white-space: pre-wrap; word-break: break-all;">curl -X GET "http://localhost:3000/api/files" \\
  -H "Authorization: Bearer YOUR_API_KEY"</pre>
          </div>
        </div>
      `
    },
    {
      id: 'docs-sharing',
      title: 'Advanced Access Controls',
      content: `
        <p style="margin-bottom: 12px;">Create secure link shares for external recipients. In addition to password protection, managers can configure policy settings:</p>
        <ul style="padding-left: 18px; list-style-type: disc; display: flex; flex-direction: column; gap: 8px; color: var(--text-secondary); font-size: 13px;">
          <li><strong>IP Address Whitelist:</strong> Restrict link access to target CIDR network ranges.</li>
          <li><strong>Geo-IP Restrictions:</strong> Allow or deny download access to countries or regions (e.g. EU, US).</li>
          <li><strong>Maximum Download Count:</strong> Links automatically expire after a set download ceiling is hit.</li>
          <li><strong>Lifetime Limits:</strong> Force automatic deletion of share references after custom durations.</li>
        </ul>
      `
    }
  ];

  const content = `
    <div class="docs-page" style="padding: 120px 20px 80px; max-width: 1200px; margin: 0 auto; position: relative; z-index: 1;">
      <div style="display: grid; grid-template-columns: 260px 1fr; gap: 30px; align-items: start;">
        
        <!-- Sidebar Navigation Index -->
        <div class="card" style="position: sticky; top: 100px; padding: 18px; background: var(--glass-2); border: 1px solid var(--border); border-radius: var(--r-md); min-width: 240px;">
          <div class="form-group" style="margin-bottom: 16px;">
            <div class="input-with-icon" style="height: 32px;">
              <span class="input-icon" style="top: 8px;">${ICONS.search}</span>
              <input type="text" id="docs-search-input" class="form-input" placeholder="Search docs..." oninput="filterDocs()" style="height: 32px; font-size: 12px; padding-left: 28px; color: var(--text-primary);" />
            </div>
          </div>
          
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--cyan); margin-bottom: 12px; font-family: var(--font-display); letter-spacing: 0.5px;">
            System Documentation
          </div>
          
          <div id="docs-sidebar-links" style="display: flex; flex-direction: column; gap: 6px;">
            ${sections.map(s => `
              <a href="#/${s.id}" class="docs-link" style="color: var(--text-secondary); text-decoration: none; padding: 6px 10px; border-radius: var(--r-xs); transition: var(--t); font-size: 13px; font-family: var(--font-display); display: block;" onmouseover="this.style.color='var(--cyan)'; this.style.background='rgba(0,212,255,0.05)';" onmouseout="if(window.location.hash!=='#/${s.id}'){this.style.color='var(--text-secondary)';this.style.background='none';}">
                ${s.title}
              </a>`).join('')}
          </div>
        </div>

        <!-- Document Content -->
        <div style="display: flex; flex-direction: column; gap: 30px;">
          <div style="border-bottom: 1px solid var(--border); padding-bottom: 16px;">
            <h1 style="font-family: var(--font-display); font-size: 36px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px;">NyxVault Documentation Hub</h1>
            <p style="color: var(--text-secondary); font-size: 14px;">Operational instructions, API reference sheets, and security policies.</p>
          </div>
          
          ${sections.map(s => `
            <div id="${s.id}" class="card docs-card" style="padding: 30px; background: var(--glass-2); border: 1px solid var(--border); border-radius: var(--r-md); scroll-margin-top: 110px;">
              <h2 style="font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text-primary); margin-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 8px;">${s.title}</h2>
              <div style="color: var(--text-secondary); font-size: 14px; line-height: 1.7;">
                ${s.content}
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;

  const token = localStorage.getItem('nyxvault_token');
  if (token) {
    return content;
  } else {
    return renderLandingLayout(content);
  }
}

// Global hooks for Docs page interactivity
window.filterDocs = () => {
  const query = document.getElementById('docs-search-input').value.toLowerCase();
  const cards = document.querySelectorAll('.docs-card');
  const links = document.querySelectorAll('.docs-link');

  cards.forEach((card, idx) => {
    const text = card.textContent.toLowerCase();
    const isMatch = text.includes(query);
    card.style.display = isMatch ? 'block' : 'none';
    links[idx].style.display = isMatch ? 'block' : 'none';
  });
};

const CODE_TEMPLATES = {
  curl: `curl -X GET "http://localhost:3000/api/files" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
  js: `// Fetch files programmatically
fetch('http://localhost:3000/api/files', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
.then(res => res.json())
.then(data => console.log('Vault files:', data))
.catch(err => console.error('API Error:', err));`,
  py: `# Fetch files using request module
import requests

url = "http://localhost:3000/api/files"
headers = {
    "Authorization": "Bearer YOUR_API_KEY"
}

response = requests.get(url, headers=headers)
if response.status_code == 200:
    print("Vault files:", response.json())
else:
    print("API Error:", response.status_code, response.text)`
};

window.switchCodeTab = (tab) => {
  const tCurl = document.getElementById('tab-curl');
  const tJs = document.getElementById('tab-js');
  const tPy = document.getElementById('tab-py');
  const pane = document.getElementById('docs-code-pane');

  const tabs = [tCurl, tJs, tPy];
  tabs.forEach(t => {
    if (t) {
      t.style.color = 'var(--text-muted)';
      t.style.borderBottom = 'none';
    }
  });

  const selectedTab = document.getElementById('tab-' + tab);
  if (selectedTab) {
    selectedTab.style.color = 'var(--cyan)';
    selectedTab.style.borderBottom = '2px solid var(--cyan)';
  }

  if (pane) {
    pane.textContent = CODE_TEMPLATES[tab];
  }
};

window.copyDocsCode = () => {
  const pane = document.getElementById('docs-code-pane');
  if (pane) {
    navigator.clipboard.writeText(pane.textContent);
    showToast('Code copied to clipboard!', 'success');
  }
};

// =============================================
// PAGE: LOGIN
// =============================================
function renderLogin() {
  if (window._loginMfaRequired) {
    return `
      ${renderBackground()}
      <div class="auth-page">
        <div class="auth-card" style="max-width: 400px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 32px; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.5);">
          <div class="auth-logo" style="margin-bottom: 24px;">
            <div class="logo-icon-lg" style="font-size: 40px; margin-bottom: 12px; filter: drop-shadow(0 0 8px rgba(0,212,255,0.3));">🛡️</div>
            <h2 style="font-family: var(--font-display); font-size: 22px; font-weight: 700; color: white;">Security Verification</h2>
            <p style="color: var(--text-secondary); font-size: 13px; margin-top: 6px;">Enter the 6-digit code from your authenticator app for <strong>${window._loginMfaEmail}</strong>.</p>
          </div>
          <div class="form-group" style="margin-bottom: 24px;">
            <input class="form-input" type="text" id="login-mfa-code" style="text-align: center; font-size: 24px; letter-spacing: 12px; font-weight: 700; padding: 12px; background: rgba(255,255,255,0.04); color: white; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px;" placeholder="000000" maxlength="6" autofocus onkeydown="if(event.key==='Enter') handleLoginMfaVerify()" />
          </div>
          <button class="btn btn-primary" style="width:100%; margin-bottom:12px; font-weight: 600;" id="login-mfa-btn" onclick="handleLoginMfaVerify()">
            Verify &amp; Access Vault
          </button>
          <button class="btn btn-ghost" style="width:100%; border: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary);" onclick="window.cancelLoginMfa()">
            ← Back to Sign In
          </button>
        </div>
      </div>
    `;
  }

  return `
    ${renderBackground()}
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="logo-icon-lg">🔒</div>
          <h2>NyxVault</h2>
          <p>Welcome back. Please sign in.</p>
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <div class="input-with-icon">
            <span class="input-icon">${ICONS.profile}</span>
            <input class="form-input" type="email" id="login-email" value="alex.ryder@nyxvault.io" placeholder="your@email.com" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" style="display:flex;justify-content:space-between">
            <span>Password</span>
            <a href="#" style="font-size:12px">Forgot password?</a>
          </label>
          <div class="input-with-icon">
            <span class="input-icon">${ICONS.lock}</span>
            <input class="form-input" type="password" id="login-pass" value="            " placeholder="Enter password" />
          </div>
        </div>
        <div class="form-group" style="display:flex;align-items:center;justify-content:space-between">
          <label style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-secondary);cursor:pointer">
            <input type="checkbox" checked />
            Remember me
          </label>
        </div>
        <button class="btn btn-primary" style="width:100%;margin-bottom:16px" id="login-btn" onclick="handleLogin()">
          Sign In
        </button>
        <div class="auth-divider"><span>OR</span></div>
        <button class="btn-google-premium" id="google-login-btn" onclick="handleGoogleLogin()">
          <svg viewBox="0 0 24 24" width="18" height="18" style="flex-shrink:0; z-index: 2;">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.23-.63-.35-1.3-.35-2.09z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span style="z-index: 2; position: relative;">Sign in with Google</span>
        </button>
        <div class="auth-footer">
          Don't have an account? <a href="#" onclick="navigate('register')">Create an account →</a>
        </div>
      </div>
    </div>`;
}

// =============================================
// PAGE: REGISTER
// =============================================
function renderRegister() {
  return `
    ${renderBackground()}
    <div class="auth-page">
      <div class="auth-card" style="max-width:400px">
        <div class="auth-logo">
          <div class="logo-icon-lg">🔒</div>
          <h2>Create Your Vault</h2>
          <p>Get started with NyxVault</p>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div class="form-group" style="margin-bottom:14px">
            <label class="form-label">First Name</label>
            <input class="form-input" type="text" placeholder="Alex" />
          </div>
          <div class="form-group" style="margin-bottom:14px">
            <label class="form-label">Last Name</label>
            <input class="form-input" type="text" placeholder="Ryder" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Email Address <span>*</span></label>
          <div class="input-with-icon">
            <span class="input-icon">${ICONS.profile}</span>
            <input class="form-input" type="email" placeholder="you@company.com" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Organization</label>
          <input class="form-input" type="text" placeholder="Acme Corp" />
        </div>
        <div class="form-group">
          <label class="form-label">Create Password <span>*</span></label>
          <div class="input-with-icon">
            <span class="input-icon">${ICONS.lock}</span>
            <input class="form-input" type="password" id="reg-pass" placeholder="Strong password" />
          </div>
        </div>
        <button class="btn btn-primary" style="width:100%;margin-top:16px;margin-bottom:16px" onclick="handleRegister()">
          Create Account
        </button>
        <div class="auth-footer">
          Already have a vault? <a href="#" onclick="navigate('login')">Sign In →</a>
        </div>
      </div>
    </div>`;
}

// =============================================
// PAGE: DASHBOARD
// =============================================
function renderDashboard() {
  const stats = MOCK.stats || { totalFiles: 0, storageUsed: 0.0, storageTotal: 64.0, alerts: 0, shares: 0, threats: 0, integrityScore: 100.0 };
  const usedStorageStr = stats.storageUsed === 0 ? '0.00 GB' : formatBytes(stats.storageUsed * 1073741824);
  const storagePct = (stats.storageUsed / 64.0) * 100;
  const storagePctStr = storagePct > 0 && storagePct < 0.1 ? `${storagePct.toFixed(3)}%` : `${storagePct.toFixed(1)}%`;

  const statsData = [
    { label:'Total Files', value: stats.totalFiles.toLocaleString(), change:'live', up:true, icon:'📁', cls:'accent-cyan'   },
    { label:'Storage Used', value: `${usedStorageStr} / 64 GB`, change: storagePctStr, up:true, icon:'💾', cls:'accent-purple' },
    { label:'Active Alerts', value: stats.alerts.toString(), change:'live', up:false, icon:'⚠️', cls:'accent-danger'  },
    { label:'Share Links', value: stats.shares.toString(), change:'live', up:true, icon:'🔗', cls:'accent-success' },
  ];

  const recentAlerts = MOCK.alerts ? MOCK.alerts.slice(0,4) : [];
  const recentFiles = MOCK.recentFiles || [];

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Security Dashboard</div>
        <div class="page-subtitle">Welcome back, ${MOCK.user.name} — System active with zero-knowledge keys</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-ghost btn-sm" onclick="showToast('Report exported','success')">${ICONS.export} Export Report</button>
        <button class="btn btn-primary btn-sm" onclick="navigate('upload')">${ICONS.plus} Upload Files</button>
      </div>
    </div>

    <!-- Stat Cards -->
    <div class="stat-cards stagger">
      ${statsData.map(s=>`
      <div class="stat-card ${s.cls} animate-fade">
        <div class="stat-header">
          <div class="stat-icon">${s.icon}</div>
          <span class="stat-change ${s.up?'up':'down'}">${s.change}</span>
        </div>
        <div class="stat-value">${s.value}</div>
        <div class="stat-label">${s.label}</div>
      </div>`).join('')}
    </div>

    <!-- Main Grid -->
    <div class="dash-grid-main">

      <!-- Activity Chart (span 2) -->
      <div class="card span-2 animate-fade" style="animation-delay:.1s">
        <div class="card-header">
          <div class="card-title"><span class="dot"></span> Activity Overview</div>
          <div style="display:flex;gap:6px">
            <span class="badge badge-cyan">Uploads</span>
            <span class="badge badge-purple">Downloads</span>
            <span class="badge badge-danger">Alerts</span>
          </div>
        </div>
        <div class="card-body">
          <div class="chart-container" style="height:220px">
            <canvas id="chart-activity"></canvas>
          </div>
        </div>
      </div>

      <!-- Security Score -->
      <div class="card animate-fade" style="animation-delay:.15s">
        <div class="card-header"><div class="card-title"><span class="dot"></span> Security Score</div></div>
        <div class="security-score-widget">
          <div class="score-ring-wrapper">
            <canvas id="chart-score" width="140" height="140"></canvas>
            <div class="score-text">
              <div class="score-num">${Math.round(stats.integrityScore)}</div>
              <div class="score-label">/ 100</div>
            </div>
          </div>
          <div style="width:100%;font-size:12px">
            ${[
              ['Encryption','100%','success'],
              ['Integrity',`${stats.integrityScore.toFixed(1)}%`,'success'],
              ['Access Ctrl','94%','warning'],
              ['Compliance','99%','success']
            ].map(([l,v,c])=>`
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
              <span style="color:var(--text-secondary)">${l}</span>
              <div style="display:flex;align-items:center;gap:8px;flex:1;margin:0 10px">
                <div class="progress-bar" style="flex:1">
                  <div class="progress-fill ${c}" style="width:${v}"></div>
                </div>
              </div>
              <span style="color:var(--text-primary);font-weight:600;min-width:38px;text-align:right">${v}</span>
            </div>`).join('')}
          </div>
        </div>
      </div>

      <!-- Storage Chart -->
      <div class="card animate-fade" style="animation-delay:.2s">
        <div class="card-header"><div class="card-title"><span class="dot"></span> Storage Breakdown</div></div>
        <div class="card-body">
          <div class="chart-container" style="height:180px">
            <canvas id="chart-storage"></canvas>
          </div>
          <div style="margin-top:14px;display:flex;flex-wrap:wrap;gap:8px">
            ${[['Documents','#1a6fff'],['Archives','#7b2fff'],['Images','#00d4ff'],['Code','#00ff88'],['Keys','#ff3366'],['Other','#ffaa00']]
              .map(([l,c])=>`<div style="display:flex;align-items:center;gap:5px;font-size:11px;color:var(--text-muted)"><div style="width:8px;height:8px;border-radius:50%;background:${c}"></div>${l}</div>`).join('')}
          </div>
        </div>
      </div>

      <!-- Recent Files -->
      <div class="card span-2 animate-fade" style="animation-delay:.25s">
        <div class="card-header">
          <div class="card-title"><span class="dot"></span> Recent Files</div>
          <button class="btn btn-ghost btn-sm" onclick="navigate('files')">View All →</button>
        </div>
        <div class="card-body" style="padding-top:12px">
          ${recentFiles.length === 0 ? `<div style="padding:20px;text-align:center;color:var(--text-muted)">No files uploaded yet.</div>` : ''}
          ${recentFiles.map(f=>{
            const fType = getFileTypeFromFilename(f.name);
            const icon = fileIcon(fType);
            const iconClass = fileIconClass(fType);
            const sizeStr = formatBytes(f.size);
            const dateStr = f.modified ? f.modified.split('T')[0] : '';
            return `
            <div class="file-item">
              <div class="file-icon ${iconClass}">${icon}</div>
              <div class="file-info">
                <div class="file-name">${f.name}</div>
                <div class="file-meta">${dateStr} ${f.encrypted?'· 🔐 Encrypted':''}</div>
              </div>
              <div class="file-size">${sizeStr}</div>
              <div style="display:flex;gap:4px;margin-left:8px">
                <button class="table-action-btn" title="Download" onclick="handleFileDownload('${f.id}', '${f.name}')">${ICONS.download}</button>
                <button class="table-action-btn" title="Share" onclick="handleFileShareDialog('${f.id}', '${f.name}')">${ICONS.share}</button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <!-- Threat Chart -->
      <div class="card animate-fade" style="animation-delay:.3s">
        <div class="card-header"><div class="card-title"><span class="dot"></span> Threat Activity</div></div>
        <div class="card-body">
          <div class="chart-container" style="height:180px">
            <canvas id="chart-threats"></canvas>
          </div>
        </div>
      </div>

      <!-- Active Alerts Panel -->
      <div class="card span-2 animate-fade" style="animation-delay:.35s">
        <div class="card-header">
          <div class="card-title"><span class="dot" style="background:var(--danger);box-shadow:0 0 8px var(--danger)"></span> Active Alerts</div>
          <button class="btn btn-ghost btn-sm" onclick="navigate('alerts')">View All →</button>
        </div>
        <div class="card-body" style="padding-top:12px">
          ${recentAlerts.map(a=>`
          <div class="alert-item">
            <div class="alert-sev-dot ${a.sev}"></div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:500;color:var(--text-primary);margin-bottom:2px">${a.title}</div>
              <div style="font-size:11px;color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${a.desc}</div>
            </div>
            <div style="display:flex;flex-direction:column;align-items:flex-end;gap:5px;flex-shrink:0;margin-left:12px">
              <span class="badge badge-${severityClass(a.sev)}">${a.sev.toUpperCase()}</span>
              <span style="font-size:11px;color:var(--text-muted)">${a.time}</span>
            </div>
          </div>`).join('')}
        </div>
      </div>

    </div>`;
}

// =============================================
// PAGE: FILE UPLOAD
// =============================================
function renderUpload() {
  const inProgress = window.activeUploads || [];
  const stats = MOCK.stats || { totalFiles: 0, storageUsed: 0.0, storageTotal: 64.0 };
  const usedBytes = stats.storageUsed * 1073741824;
  const totalBytes = 64 * 1073741824; // 64 GB
  const freeBytes = Math.max(0, totalBytes - usedBytes);
  
  const usedStr = stats.storageUsed === 0 ? '0.00 GB' : formatBytes(usedBytes);
  const freeStr = formatBytes(freeBytes);
  const pct = Math.min(100, (stats.storageUsed / 64.0) * 100);

  return `
    <div class="page-header">
      <div>
        <div class="page-title">File Upload</div>
        <div class="page-subtitle">Files are encrypted client-side before upload · AES-256-GCM</div>
      </div>
    </div>

    <div class="section-grid grid-2" style="margin-bottom:24px">
      <!-- Upload Zone -->
      <div class="card" style="grid-column:span 2">
        <div class="card-body">
          <div class="upload-zone" id="upload-zone"
            ondragover="event.preventDefault();this.classList.add('drag-over')"
            ondragleave="this.classList.remove('drag-over')"
            ondrop="handleDrop(event)"
            onclick="document.getElementById('file-input').click()">
            <div class="upload-icon">☁️</div>
            <h3>Drop files here to encrypt &amp; upload</h3>
            <p>or click to browse · Max 5 GB per file · All types accepted</p>
            <div class="upload-types">
              <span>.pdf</span><span>.docx</span><span>.xlsx</span><span>.zip</span><span>.tar.gz</span>
              <span>.key</span><span>.png</span><span>.mp4</span><span>+more</span>
            </div>
            <input type="file" id="file-input" multiple style="display:none" onchange="handleFileSelect(this)" />
          </div>

          <div class="upload-progress-list">
            ${inProgress.map(f=>`
            <div class="upload-progress-item">
              <div class="up-icon file-icon ${fileIconClass(f.type)}">${fileIcon(f.type)}</div>
              <div class="up-info">
                <div class="flex items-center justify-between mb-1">
                  <div class="up-name">${f.name}</div>
                  <span class="badge badge-${f.status==='complete'?'success':f.status==='encrypting'?'warning':'cyan'}">${f.status}</span>
                </div>
                <div class="up-bar">
                  <div class="progress-bar" style="flex:1">
                    <div class="progress-fill ${f.status==='complete'?'success':''}" style="width:${f.pct}%"></div>
                  </div>
                  <span class="up-pct">${f.pct}%</span>
                </div>
                <div class="up-status">${f.size} · ${f.status==='complete'?'Encrypted &amp; stored':'Encrypting with AES-256-GCM…'}</div>
              </div>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Encryption Settings -->
    <div class="section-grid grid-2">
      <div class="card">
        <div class="card-header"><div class="card-title"><span class="dot"></span> Encryption Settings</div></div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Encryption Algorithm</label>
            <select class="form-select">
              <option selected>AES-256-GCM (Recommended)</option>
              <option>ChaCha20-Poly1305</option>
              <option>AES-128-GCM</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Key Derivation</label>
            <select class="form-select">
              <option selected>PBKDF2 (600,000 iterations)</option>
              <option>Argon2id</option>
              <option>scrypt</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Target Folder</label>
            <select class="form-select">
              <option>/ (Root)</option>
              <option selected>📁 /Documents/2026</option>
              <option>📁 /Archives</option>
              <option>📁 /Keys</option>
            </select>
          </div>
          <div style="display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:13px;color:var(--text-secondary)">Zero-Knowledge Encryption (Client-Side)</span>
              <label class="toggle-switch">
                <input type="checkbox" id="upload-zk-toggle" onchange="toggleZkPassphraseField(this.checked)" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <!-- Passphrase field (initially hidden) -->
            <div id="zk-passphrase-container" style="display:none;margin-top:4px;transition:all 0.3s ease;">
              <label class="form-label" style="font-size:11px;color:var(--accent);margin-bottom:4px;display:block">Encryption Passphrase</label>
              <input type="password" id="upload-zk-passphrase" class="form-select" style="background:rgba(255,255,255,0.05);color:white;border:1px solid rgba(255,255,255,0.1);padding:6px;width:100%;box-sizing:border-box" placeholder="Enter private key passphrase..." />
              <p style="font-size:10px;color:var(--cyan);margin-top:4px;line-height:1.3">⚠️ Note: NyxVault does not store your passphrase. If lost, your files cannot be recovered.</p>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:13px;color:var(--text-secondary)">Generate integrity hash (SHA-256)</span>
              <label class="toggle-switch">
                <input type="checkbox" id="upload-integrity-toggle" checked />
                <span class="toggle-slider"></span>
              </label>
            </div>
            
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:13px;color:var(--text-secondary)">Scan for malware (VirusTotal)</span>
              <label class="toggle-switch">
                <input type="checkbox" id="upload-virus-toggle" checked />
                <span class="toggle-slider"></span>
              </label>
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between">
              <span style="font-size:13px;color:var(--text-secondary)">Notify on upload completion</span>
              <label class="toggle-switch">
                <input type="checkbox" id="upload-notify-toggle" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><div class="card-title"><span class="dot"></span> Upload Statistics</div></div>
        <div class="card-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
            ${[['Today\'s Uploads','23','files','success'],['Data Transferred','1.2 GB','today','cyan'],['Threats Blocked','0','files','success'],['Avg Upload Speed','94 MB/s','current','purple']].map(([l,v,u,c])=>`
            <div style="background:var(--glass-3);border:1px solid var(--border);border-radius:var(--r-sm);padding:14px">
               <div style="font-size:20px;font-weight:700;color:var(--${c})">${v}</div>
               <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${u}</div>
               <div style="font-size:12px;color:var(--text-secondary);margin-top:4px">${l}</div>
            </div>`).join('')}
          </div>
          <div class="divider"></div>
          <div style="font-size:13px;color:var(--text-secondary);font-weight:600;margin-bottom:10px">Storage Remaining</div>
          <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:6px">
            <span style="color:var(--text-muted)">${usedStr} of 64 GB used</span>
            <span style="color:var(--cyan)">${freeStr} free</span>
          </div>
          <div class="progress-bar" style="height:10px">
            <div class="progress-fill" style="width:${pct}%"></div>
          </div>
          <div style="margin-top:16px">
            <button class="btn btn-ghost btn-sm" style="width:100%" onclick="showToast('Opening upgrade flow','info')">⚡ Upgrade to 1 TB Storage</button>
          </div>
        </div>
      </div>
    </div>`;
}

// =============================================
// PAGE: FILE MANAGER
// =============================================
function renderFileManager() {
  const files = MOCK.files || [];
  const allFiles = MOCK.allFiles || [];

  const folders = [
    { name:'Documents',   count: allFiles.filter(f => f.folder === 'Documents').length, icon:'📁' },
    { name:'Archives',    count: allFiles.filter(f => f.folder === 'Archives').length,   icon:'📦' },
    { name:'Keys & Certs',count: allFiles.filter(f => f.folder === 'Keys & Certs').length,   icon:'🔑' },
    { name:'Images',      count: allFiles.filter(f => f.folder === 'Images').length,  icon:'🖼️' },
    { name:'Code',        count: allFiles.filter(f => f.folder === 'Code').length,  icon:'💻' },
    { name:'Shared With Me',count: 47, icon:'📨' },
  ];

  // 1. Apply frontend filtering (Encryption Status)
  let displayedFiles = [...files];
  if (window._filterMode === 'encrypted') {
    displayedFiles = displayedFiles.filter(f => f.encrypted);
  } else if (window._filterMode === 'unencrypted') {
    displayedFiles = displayedFiles.filter(f => !f.encrypted);
  }

  // 2. Apply frontend sorting
  const mode = window._sortMode || 'Sort: Date Modified';
  if (mode.includes('Name')) {
    displayedFiles.sort((a, b) => a.name.localeCompare(b.name));
  } else if (mode.includes('Size')) {
    displayedFiles.sort((a, b) => a.size - b.size);
  } else if (mode.includes('Type')) {
    displayedFiles.sort((a, b) => a.type.localeCompare(b.type));
  } else {
    // Date Modified (descending by default)
    displayedFiles.sort((a, b) => new Date(b.modified) - new Date(a.modified));
  }

  // View modes
  const isGrid = window._fileViewMode === 'grid';
  const gridStyle = isGrid ? 'border-color:var(--cyan);color:var(--cyan);background:rgba(0,212,255,0.05);' : '';
  const listStyle = !isGrid ? 'border-color:var(--cyan);color:var(--cyan);background:rgba(0,212,255,0.05);' : '';

  // Filter button styles
  let filterText = 'Filter';
  let filterStyle = '';
  if (window._filterMode === 'encrypted') {
    filterText = '🔒 Encrypted';
    filterStyle = 'border-color:var(--success);color:var(--success);background:rgba(0,255,136,0.05);';
  } else if (window._filterMode === 'unencrypted') {
    filterText = '🔓 Plain';
    filterStyle = 'border-color:var(--warning);color:var(--warning);background:rgba(255,170,0,0.05);';
  }

  // Breadcrumbs
  let breadcrumbHtml = `<span class="active">Home</span>`;
  if (window._selectedFolder) {
    breadcrumbHtml = `
      <span style="cursor:pointer;color:var(--cyan);" onclick="handleFolderSelect(null)">Home</span>
      <span class="sep">/</span>
      <span class="active">${window._selectedFolder}</span>
    `;
  }

  // Grid view rendering
  let filesContentHtml = '';
  if (isGrid) {
    if (displayedFiles.length === 0) {
      filesContentHtml = `<div style="padding:40px;text-align:center;color:var(--text-muted);width:100%;grid-column:span 4;">No files found matching the active filters.</div>`;
    } else {
      filesContentHtml = `
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:20px;padding:20px;width:100%;">
          ${displayedFiles.map(f => `
            <div class="file-grid-item" onclick="handleFilePreview('${f.id}', '${f.name}', '${f.type}')">
              <div class="grid-icon ${fileIconClass(f.type)}" style="background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.15);">${fileIcon(f.type)}</div>
              <div class="grid-name" title="${f.name}">${f.name}</div>
              <div class="grid-meta">
                <span>${formatBytes(f.size)}</span>
                ${f.encrypted 
                  ? `<span style="color:var(--success);display:flex;align-items:center;gap:3px;">${ICONS.lock} Encrypted</span>` 
                  : `<span style="color:var(--warning);display:flex;align-items:center;gap:3px;">⚠ Plain</span>`}
              </div>
              <div class="grid-actions" onclick="event.stopPropagation();">
                ${MOCK.user.role === 'Auditor' 
                  ? `<span style="font-size:11px;color:var(--text-muted);background:rgba(255,255,255,0.05);padding:4px 8px;border-radius:4px">🔒 Read-Only</span>`
                  : `
                    <button class="table-action-btn" title="Download" onclick="handleFileDownload('${f.id}', '${f.name}')">${ICONS.download}</button>
                    <button class="table-action-btn" title="Share" onclick="handleFileShareDialog('${f.id}', '${f.name}')">${ICONS.share}</button>
                    <button class="table-action-btn danger" title="Delete" onclick="handleFileDelete('${f.id}', '${f.name}')">${ICONS.trash}</button>
                  `
                }
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
  } else {
    // List (table) view rendering
    filesContentHtml = `
      <div class="table-wrapper" style="border:none;border-radius:0 0 var(--r-lg) var(--r-lg)">
        <table class="data-table">
          <thead>
            <tr>
              <th><input type="checkbox" style="accent-color:var(--cyan)" /></th>
              <th>Name</th>
              <th>Type</th>
              <th>Size</th>
              <th>Modified</th>
              <th>Security</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${displayedFiles.length === 0 ? `
              <tr>
                <td colspan="7" style="padding:40px;text-align:center;color:var(--text-muted)">No files found matching the active filters.</td>
              </tr>
            ` : displayedFiles.map(f=>`
              <tr>
                <td><input type="checkbox" style="accent-color:var(--cyan)" /></td>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="file-icon ${fileIconClass(f.type)}" style="width:32px;height:32px;font-size:14px">${fileIcon(f.type)}</div>
                    <span style="color:var(--text-primary);font-weight:500">${f.name}</span>
                  </div>
                </td>
                <td><span class="badge badge-muted">${f.type.toUpperCase()}</span></td>
                <td>${formatBytes(f.size)}</td>
                <td style="white-space:nowrap">${new Date(f.modified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                <td>
                  ${f.encrypted
                    ? `<span class="badge badge-success">${ICONS.lock} Encrypted</span>`
                    : `<span class="badge badge-warning">⚠ Unencrypted</span>`}
                </td>
                <td>
                  <div class="table-actions">
                    ${MOCK.user.role === 'Auditor'
                      ? `<span class="badge badge-muted" style="color:var(--text-muted)">🔒 Read-Only</span>`
                      : `
                        <button class="table-action-btn" title="Download" onclick="handleFileDownload('${f.id}', '${f.name}')">${ICONS.download}</button>
                        <button class="table-action-btn" title="Share" onclick="handleFileShareDialog('${f.id}', '${f.name}')">${ICONS.share}</button>
                        <button class="table-action-btn" title="View" onclick="handleFilePreview('${f.id}', '${f.name}', '${f.type}')">${ICONS.eye}</button>
                        <button class="table-action-btn danger" title="Delete" onclick="handleFileDelete('${f.id}', '${f.name}')">${ICONS.trash}</button>
                      `
                    }
                  </div>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  return `
    <div class="page-header">
      <div>
        <div class="page-title">File Manager</div>
        <div class="page-subtitle">${MOCK.stats ? MOCK.stats.totalFiles : 0} files · ${MOCK.stats ? (MOCK.stats.storageUsed === 0 ? '0.00 GB' : formatBytes(MOCK.stats.storageUsed * 1073741824)) : '0.00 GB'} used</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-ghost btn-sm" id="view-grid-btn" style="${gridStyle}" onclick="toggleFileView('grid')">${ICONS.grid} Grid</button>
        <button class="btn btn-ghost btn-sm" id="view-list-btn" style="${listStyle}" onclick="toggleFileView('list')">${ICONS.list} List</button>
        <button class="btn btn-ghost btn-sm" style="${filterStyle}" onclick="handleFileFilter()">${ICONS.filter} ${filterText}</button>
        ${MOCK.user.role === 'Auditor' ? '' : `<button class="btn btn-primary btn-sm" onclick="navigate('upload')">${ICONS.plus} New Upload</button>`}
      </div>
    </div>

    <!-- Toolbar -->
    <div class="fm-toolbar">
      <div class="fm-breadcrumb">
        ${breadcrumbHtml}
      </div>
      <div class="input-with-icon" style="min-width:240px">
        <span class="input-icon">${ICONS.search}</span>
        <input class="form-input" id="fm-search-input" type="text" placeholder="Search files…" value="${window._searchQuery || ''}" oninput="handleFileSearch(this.value)" style="padding-left:36px" />
      </div>
      <select class="form-select" style="width:auto" onchange="handleFileSort(this.value)">
        <option ${mode === 'Sort: Date Modified' ? 'selected' : ''}>Sort: Date Modified</option>
        <option ${mode === 'Sort: Name' ? 'selected' : ''}>Sort: Name</option>
        <option ${mode === 'Sort: Size' ? 'selected' : ''}>Sort: Size</option>
        <option ${mode === 'Sort: Type' ? 'selected' : ''}>Sort: Type</option>
      </select>
    </div>

    <!-- Folders -->
    <div style="margin-bottom:20px">
      <div style="font-size:12px;color:var(--text-muted);letter-spacing:1px;font-weight:600;margin-bottom:12px;text-transform:uppercase">Folders</div>
      <div class="file-grid" style="grid-template-columns:repeat(auto-fill,minmax(140px,1fr))">
        ${folders.map(f=>{
          const isActive = window._selectedFolder === f.name;
          const cardStyle = isActive ? 'border:1px solid var(--cyan);background:rgba(0,212,255,0.05);box-shadow:var(--shadow-glow-sm);' : '';
          const iconStyle = isActive ? 'background:rgba(0,212,255,0.15);border:1px solid var(--cyan);' : 'background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.15);';
          return `
          <div class="file-grid-item" style="${cardStyle} cursor:pointer;" onclick="handleFolderSelect('${f.name}')">
            <div class="grid-icon" style="${iconStyle}">${f.icon}</div>
            <div class="grid-name">${f.name}</div>
            <div class="grid-size">${f.count} items</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- Files List -->
    <div class="card">
      <div class="card-header">
        <div class="card-title"><span class="dot"></span> All Vault Files</div>
        <div style="display:flex;gap:8px">
          <span class="badge badge-muted">${displayedFiles.length} files</span>
          <button class="btn btn-ghost btn-sm" onclick="showToast('Files exported','success')">${ICONS.export} Export</button>
        </div>
      </div>
      <div class="card-body" style="padding:0">
        ${filesContentHtml}
      </div>
    </div>`;
}

// =============================================
// PAGE: SECURE SHARING
// =============================================
function renderSharing() {
  let shares = MOCK.shareLinks || [];
  const files = MOCK.files || [];

  const filterMode = window._shareFilterMode || 'all';
  if (filterMode === 'active') {
    shares = shares.filter(s => s.status === 'active');
  } else if (filterMode === 'expired') {
    shares = shares.filter(s => s.status === 'expired');
  }

  // Calculate dynamic expiry limits according to user details (plan/role and customized policy)
  const userPlan = MOCK.user.plan || 'Enterprise';
  const userRole = MOCK.user.role || 'Developer';

  const maxDays = MOCK.user.policy_max_lifetime !== undefined ? MOCK.user.policy_max_lifetime : (userPlan === 'Enterprise' ? 90 : userPlan === 'Starter' ? 7 : 30);
  const maxLifetime = `${maxDays} days`;
  
  const defaultPermVal = MOCK.user.policy_default_permission || (userPlan === 'Starter' ? 'view' : 'download');
  const defaultPerms = defaultPermVal === 'download' ? 'View + Download' : 'View Only';
  
  const ipWhitelist = MOCK.user.policy_ip_whitelist || (userPlan === 'Enterprise' ? 'Enabled (Corporate Range)' : userPlan === 'Starter' ? 'Not Supported' : 'Disabled');
  const geoRestrict = MOCK.user.policy_geo_restriction || (userPlan === 'Enterprise' ? 'Strict (US, EU, APAC)' : userPlan === 'Starter' ? 'Disabled' : 'US, EU only');
  const mfaReq = MOCK.user.policy_mfa_requirement || (userPlan === 'Enterprise' ? 'Enforced (Mandatory)' : userPlan === 'Starter' ? 'Optional' : 'Enforce for external');

  const today = new Date();
  const defaultExpiryDate = new Date();
  defaultExpiryDate.setDate(today.getDate() + (userPlan === 'Starter' ? 7 : 30));
  const defaultExpiryStr = defaultExpiryDate.toISOString().split('T')[0];
  
  const maxExpiryDate = new Date();
  maxExpiryDate.setDate(today.getDate() + maxDays);
  const maxExpiryStr = maxExpiryDate.toISOString().split('T')[0];

  const activeCount = MOCK.shareLinks ? MOCK.shareLinks.filter(s => s.status === 'active' || s.status === 'expiring').length : 0;
  const viewsCount = MOCK.shareLinks ? MOCK.shareLinks.reduce((acc, s) => acc + s.views, 0) : 0;
  const expiringCount = MOCK.shareLinks ? MOCK.shareLinks.filter(s => s.status === 'expiring').length : 0;
  const expiredCount = MOCK.shareLinks ? MOCK.shareLinks.filter(s => s.status === 'expired').length : 0;

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Secure Sharing</div>
        <div class="page-subtitle">Manage time-limited, encrypted share links with access control</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary btn-sm" onclick="showToast('Use form below to create links','info')">${ICONS.plus} New Share Link</button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stat-cards" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px">
      ${[['Active Links', activeCount, '🔗', 'accent-cyan'], ['Total Views', viewsCount, '👁️', 'accent-purple'], ['Expiring Soon', expiringCount, '⏰', 'accent-danger'], ['Expired Links', expiredCount, '🚫', 'accent-success']].map(([l,v,i,c])=>`
      <div class="stat-card ${c}">
        <div class="stat-header"><div class="stat-icon">${i}</div></div>
        <div class="stat-value">${v}</div>
        <div class="stat-label">${l}</div>
      </div>`).join('')}
    </div>

    <div class="section-grid grid-2">
      <!-- Active Share Links -->
      <div style="grid-column:span 2">
        <div class="card">
          <div class="card-header">
            <div class="card-title"><span class="dot"></span> Share Links</div>
            <div style="display:flex;gap:8px">
              <button class="btn btn-ghost btn-sm" onclick="handleToggleShareFilter()">${ICONS.filter} Filter: ${filterMode.charAt(0).toUpperCase() + filterMode.slice(1)}</button>
              <button class="btn btn-ghost btn-sm" onclick="handleExportShareAudit()">${ICONS.export} Export CSV</button>
            </div>
          </div>
          <div class="card-body">
            ${shares.length === 0 ? `<div style="padding:20px;text-align:center;color:var(--text-muted)">No ${filterMode !== 'all' ? filterMode + ' ' : ''}share links found. Create one on the right.</div>` : ''}
            ${shares.map(sl=>{
              const fType = getFileTypeFromFilename(sl.file);
              const icon = fileIcon(fType);
              const iconClass = fileIconClass(fType);
              
              // Build badges
              const permBadge = sl.permission === 'view' 
                ? `<span class="badge badge-warning">👁️ View Only</span>` 
                : `<span class="badge badge-success">📥 View & Download</span>`;
                
              const securityBadges = [];
              if (sl.hasPassword) {
                securityBadges.push(`<span class="badge badge-purple" title="Password Protected">🔒 Password</span>`);
              }
              if (sl.oneTime) {
                securityBadges.push(`<span class="badge badge-danger" title="Self-destructs after single access">⚡ One-Time</span>`);
              }
              if (sl.maxDownloads) {
                securityBadges.push(`<span class="badge badge-cyan" title="Maximum download limit">Limit: ${sl.maxDownloads} DLs</span>`);
              }
              
              const shareToken = sl.token;
              const publicLink = `${window.location.protocol}//${window.location.host}/s/${shareToken}`;
              
              return `
              <div class="share-link-item">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
                  <div style="display:flex;align-items:center;gap:12px">
                    <div class="file-icon-square ${iconClass}">${icon}</div>
                    <div>
                      <div class="share-link-filename">${sl.file}</div>
                      <div style="display:flex;align-items:center;gap:8px;margin-top:4px;flex-wrap:wrap">
                        ${permBadge}
                        ${securityBadges.join('')}
                        <span class="badge badge-muted">👁️ ${sl.views} views</span>
                        <span class="badge badge-muted">📥 ${sl.dl} DLs</span>
                      </div>
                    </div>
                  </div>
                  <div style="text-align:right">
                    <div class="share-link-status ${sl.status}">${sl.status.toUpperCase()}</div>
                    <div class="share-link-expiry">Expires: ${sl.expiry}</div>
                    <div style="margin-top:6px">
                      <button class="table-action-btn" title="Copy link" onclick="navigator.clipboard.writeText('${publicLink}'); showToast('Secure share link copied to clipboard','success');">${ICONS.copy}</button>
                      <button class="table-action-btn danger" title="Revoke" onclick="handleRevokeShareLink('${sl.id}')">${ICONS.x}</button>
                    </div>
                  </div>
                </div>
                <div class="share-link-url">${publicLink}</div>
              </div>`;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- Create New Share -->
      <div class="card">
        <div class="card-header"><div class="card-title"><span class="dot"></span> Create Share Link</div></div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label">Select File</label>
            <select class="form-select" id="share-file-select">
              ${files.map(f=>`<option value="${f.id}">${f.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Recipients (comma-separated)</label>
            <input class="form-input" type="text" id="share-recipients" placeholder="user@email.com, user2@email.com" />
          </div>
          <div class="form-group">
            <label class="form-label">Expiry Date</label>
            <input class="form-input" type="date" id="share-expiry" value="${defaultExpiryStr}" max="${maxExpiryStr}" />
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Max allowed for ${userPlan} plan: ${maxLifetime}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Permissions</label>
            <select class="form-select" id="share-permission">
              <option value="download" ${userPlan !== 'Starter' ? 'selected' : ''}>View & Download</option>
              <option value="view" ${userPlan === 'Starter' ? 'selected' : ''}>View Only</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Access Password (optional)</label>
            <input class="form-input" type="password" id="share-password" placeholder="Leave empty for no password" />
          </div>
          <div class="form-group">
            <label class="form-label">Max Downloads (optional)</label>
            <input class="form-input" type="number" id="share-max-downloads" 
                   placeholder="${userPlan === 'Starter' ? 'Max 5 for Starter' : userPlan === 'Professional' ? 'Max 50 for Professional' : 'e.g. 100 (Unlimited)'}" 
                   min="1" 
                   max="${userPlan === 'Starter' ? 5 : userPlan === 'Professional' ? 50 : ''}" />
          </div>
          <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:16px">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <div>
                <div style="font-size:13px;color:var(--text-secondary)">One-time access link</div>
                <div style="font-size:11px;color:var(--text-muted)">Link self-destructs after single use</div>
              </div>
              <label class="toggle-switch"><input type="checkbox" id="share-one-time"/><span class="toggle-slider"></span></label>
            </div>
          </div>
          <button class="btn btn-primary" style="width:100%" onclick="handleCreateShareLink()">${ICONS.sharing} Generate Share Link</button>
        </div>
      </div>

      <!-- Access Control -->
      <div class="card">
        <div class="card-header"><div class="card-title"><span class="dot"></span> Access Control Policy</div></div>
        <div class="card-body">
          <div style="display:flex;flex-direction:column;gap:14px">
            ${[
              ['Max Link Lifetime', maxLifetime, '⏱️'],
              ['Default Permissions', defaultPerms, '🔐'],
              ['IP Whitelist', ipWhitelist, '🌐'],
              ['Geo-Restriction', geoRestrict, '📍'],
              ['MFA Requirement', mfaReq, '🛡️'],
            ].map(([l,v,i])=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--glass-3);border:1px solid var(--border);border-radius:var(--r-sm)">
              <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:var(--text-secondary)">${i} ${l}</div>
              <span style="font-size:12px;color:var(--cyan);font-weight:500">${v}</span>
            </div>`).join('')}
          <button class="btn btn-ghost btn-sm" style="width:100%;margin-top:16px" onclick="handleEditPolicy()">${ICONS.edit} Edit Policy</button>
        </div>
      </div>
    </div>`;
}

// =============================================
// PAGE: INTEGRITY MONITORING
// =============================================
function renderIntegrity() {
  const files = MOCK.integrityFiles || [];
  const score = MOCK.stats ? MOCK.stats.integrityScore : 100;
  const tamperedFiles = files.filter(f => f.status === 'tampered');
  const verifiedCount = files.filter(f => f.status === 'verified').length;
  const tamperedCount = files.filter(f => f.status === 'tampered').length;
  const unverifiedCount = files.filter(f => f.status === 'unverified').length;

  // Find the first tampered file, if any, for the alert box
  const tampered = tamperedFiles[0];

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Integrity Monitoring</div>
        <div class="page-subtitle">Continuous SHA-256 hash verification · Real-time scanning</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-ghost btn-sm" onclick="handleRunIntegrityScan()">${ICONS.refresh} Run Full Scan</button>
        <button class="btn btn-ghost btn-sm" onclick="showToast('Report exported','success')">${ICONS.export} Export Report</button>
      </div>
    </div>

    <!-- Score Bar -->
    <div class="integrity-score-bar">
      <div style="font-size:40px;font-weight:800;color:var(--${score > 95 ? 'success' : 'danger'});font-family:var(--font-display)">${score}%</div>
      <div style="flex:1">
        <div style="font-size:14px;font-weight:600;color:var(--text-primary);margin-bottom:4px">Global Integrity Score</div>
        <div style="font-size:12px;color:var(--text-muted)">${tamperedCount} file(s) require attention · ${verifiedCount} verified · Last scan: just now</div>
        <div class="progress-bar" style="margin-top:8px;height:8px">
          <div class="progress-fill ${score > 95 ? 'success' : 'danger'}" style="width:${score}%"></div>
        </div>
      </div>
      <div style="display:flex;gap:16px;flex-shrink:0">
        <div style="text-align:center"><div style="font-size:22px;font-weight:700;color:var(--success)">${verifiedCount}</div><div style="font-size:11px;color:var(--text-muted)">Verified</div></div>
        <div style="text-align:center"><div style="font-size:22px;font-weight:700;color:var(--danger)">${tamperedCount}</div><div style="font-size:11px;color:var(--text-muted)">Tampered</div></div>
        <div style="text-align:center"><div style="font-size:22px;font-weight:700;color:var(--warning)">${unverifiedCount}</div><div style="font-size:11px;color:var(--text-muted)">Unverified</div></div>
      </div>
    </div>

    <div class="section-grid grid-2">
      <!-- File Integrity Table -->
      <div class="card" style="grid-column:span 2">
        <div class="card-header">
          <div class="card-title"><span class="dot"></span> File Integrity Status</div>
          <div style="display:flex;gap:6px">
            <span class="badge badge-success">✓ Verified</span>
            <span class="badge badge-danger">⚠ Tampered</span>
            <span class="badge badge-warning">? Unverified</span>
          </div>
        </div>
        <div class="card-body" style="padding-top:8px">
          ${files.length === 0 ? `<div style="padding:20px;text-align:center;color:var(--text-muted)">No files uploaded yet.</div>` : ''}
          ${files.map(f=>`
          <div class="hash-item">
            <div class="file-icon ${f.status==='tampered'?'pdf':fileIconClass('doc')}" style="width:38px;height:38px;font-size:16px">
              ${f.status==='tampered'?'⚠️':f.status==='unverified'?'❓':'✅'}
            </div>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:3px">
                <span style="font-size:13px;font-weight:500;color:var(--text-primary)">${f.name}</span>
                <span class="badge badge-${statusBadge(f.status)}">${f.status}</span>
              </div>
              <div style="display:flex;gap:16px;font-size:11px">
                <span style="color:var(--text-muted)">SHA-256:</span>
                <span class="hash-val font-mono" style="color:${f.status==='tampered'?'var(--danger)':'var(--text-muted)'}">${f.hash}</span>
              </div>
            </div>
            <div style="text-align:right;flex-shrink:0;margin-left:16px">
              <div style="font-size:12px;color:var(--text-muted)">${f.size}</div>
              <div style="font-size:11px;color:var(--text-dim)">Scanned ${f.lastScan}</div>
            </div>
            <div style="margin-left:12px;display:flex;gap:4px">
              <button class="table-action-btn" onclick="handleRunIntegrityScan()" title="Re-scan">${ICONS.refresh}</button>
              ${f.status==='tampered'?`<button class="table-action-btn danger" title="View details" onclick="showToast('SHA-256 hash mismatch detected. File integrity is compromised!','error')">${ICONS.zap}</button>`:''}
            </div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Scan History Chart -->
      <div class="card">
        <div class="card-header"><div class="card-title"><span class="dot"></span> Integrity Score History</div></div>
        <div class="card-body">
          <div class="chart-container" style="height:200px">
            <canvas id="chart-integrity"></canvas>
          </div>
        </div>
      </div>

      <!-- Tamper Alert -->
      ${tampered ? `
      <div class="card" style="border-color:rgba(255,51,102,0.3)">
        <div class="card-header"><div class="card-title"><span class="dot" style="background:var(--danger);box-shadow:0 0 8px var(--danger)"></span> Tamper Alert — Action Required</div></div>
        <div class="card-body">
          <div style="background:var(--danger-glass);border:1px solid rgba(255,51,102,0.3);border-radius:var(--r-sm);padding:16px;margin-bottom:16px">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
              <span style="font-size:18px">🚨</span>
              <span style="font-size:14px;font-weight:700;color:var(--danger)">${tampered.name} — HASH MISMATCH</span>
            </div>
            <div style="font-size:12px;color:var(--text-secondary);line-height:1.7">
              <b>Database Hash:</b> <span class="font-mono" style="color:var(--text-muted)">expected valid match</span><br>
              <b>Physical Hash:</b>   <span class="font-mono" style="color:var(--danger)">${tampered.hash}</span><br>
              <b>Detected:</b> Just now<br>
              <b>Status:</b> Compromised / Tampered
            </div>
          </div>
          <div style="display:flex;gap:10px">
            <button class="btn btn-danger btn-sm" style="flex:1" onclick="handleQuarantineFile('${tampered.id}')">🔒 Quarantine File</button>
            <button class="btn btn-ghost btn-sm" style="flex:1" onclick="handleRestoreBackup('${tampered.id}')">↩ Restore Backup</button>
          </div>
          <div style="margin-top:10px">
            <button class="btn btn-ghost btn-sm" style="width:100%" onclick="navigate('alerts')">📋 View in Alert Center</button>
          </div>
        </div>
      </div>` : `
      <div class="card" style="border-color:rgba(0,255,136,0.3)">
        <div class="card-header"><div class="card-title"><span class="dot" style="background:var(--success);box-shadow:0 0 8px var(--success)"></span> Integrity Status Clean</div></div>
        <div class="card-body" style="text-align:center;padding:40px 20px">
          <div style="font-size:48px;margin-bottom:16px">🛡️</div>
          <div style="font-size:16px;font-weight:700;color:var(--success);margin-bottom:8px">All Files Fully Verified</div>
          <p style="font-size:13px;color:var(--text-secondary);max-width:320px;margin:0 auto">SHA-256 cryptographic hashes for all vault storage contents match the decentralized audit logs ledger. No anomalies detected.</p>
        </div>
      </div>
      `}
    </div>`;
}

// =============================================
// PAGE: SECURITY ALERTS
// =============================================

// Alert state
let _alertFilter = { sev: '', type: '', status: '' };
let _alertStats  = { critical: 0, high: 0, medium: 0, low: 0, total: 0 };
let _alertBadge  = 0;

async function _fetchAlertStats() {
  try {
    const token = localStorage.getItem('nyxvault_token');
    if (!token) return;
    const r = await fetch(apiCallUrl('/api/alerts/stats'), { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) {
      _alertStats = await r.json();
      _alertBadge = _alertStats.total || 0;
    }
  } catch (_) {}
}

async function _fetchAlerts(sev = '', type = '', status = '') {
  const token = localStorage.getItem('nyxvault_token');
  if (!token) return [];
  const params = new URLSearchParams();
  if (sev)    params.set('sev', sev);
  if (type)   params.set('type', type);
  if (status) params.set('status', status);
  try {
    const r = await fetch(`http://localhost:3000/api/alerts?${params}`, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) return await r.json();
  } catch (_) {}
  return [];
}

function _alertTypeLabel(t) {
  return {
    failed_login:        '🔐 Failed Login',
    unauthorized_access: '🚫 Unauthorized',
    file_tampering:      '⚙️ File Tamper',
    suspicious_download: '📥 Susp. Download',
    system:              '🛡️ System',
  }[t] || t;
}

function renderAlerts() {
  // Skeleton while we load — onMount fills in the real data
  const sev  = _alertFilter.sev;
  const type = _alertFilter.type;
  const stat = _alertFilter.status;

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Security Alert Center</div>
        <div class="page-subtitle" id="alert-subtitle">Real-time threat monitoring · Loading…</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-ghost btn-sm" id="ack-all-btn" onclick="window.handleAcknowledgeAll()">✅ Acknowledge All</button>
        <button class="btn btn-ghost btn-sm" onclick="window.handleAlertExportCSV()">${ICONS.export} Export</button>
      </div>
    </div>

    <!-- Alert Stat Cards -->
    <div class="stat-cards" style="margin-bottom:24px" id="alert-stat-cards">
      ${[['Critical','🔴','accent-danger','critical'],['High','🟠','accent-danger','high'],['Medium','🔵','accent-cyan','medium'],['Low','🟢','accent-success','low']].map(([l,i,c,k])=>`
      <div class="stat-card ${c}" style="cursor:pointer" onclick="window._setAlertSev('${k}')">
        <div class="stat-header"><div class="stat-icon">${i}</div></div>
        <div class="stat-value" id="alert-stat-${k}">—</div>
        <div class="stat-label">${l} Severity</div>
      </div>`).join('')}
    </div>

    <div class="section-grid grid-2">
      <div style="grid-column:span 2">
        <!-- Filter Bar -->
        <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;align-items:center">
          <div class="input-with-icon" style="flex:1;max-width:300px">
            <span class="input-icon">${ICONS.search}</span>
            <input class="form-input" type="text" id="alert-search" placeholder="Search alerts…" style="padding-left:36px"
              oninput="window._filterAlertList()" />
          </div>
          <select class="form-select" style="width:auto" id="alert-sev-filter"
            onchange="window._setAlertSev(this.value)">
            <option value="">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <select class="form-select" style="width:auto" id="alert-type-filter"
            onchange="window._setAlertType(this.value)">
            <option value="">All Types</option>
            <option value="failed_login">Failed Login</option>
            <option value="file_tampering">File Tampering</option>
            <option value="suspicious_download">Susp. Download</option>
            <option value="unauthorized_access">Unauthorized</option>
            <option value="system">System</option>
          </select>
          <select class="form-select" style="width:auto" id="alert-status-filter"
            onchange="window._setAlertStatus(this.value)">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="reviewing">Reviewing</option>
            <option value="blocked">Blocked</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <!-- Alert List -->
        <div id="alert-list">
          <div style="text-align:center;padding:48px;color:var(--text-muted)">
            <div style="font-size:32px;margin-bottom:12px">⏳</div>
            <div>Loading alerts…</div>
          </div>
        </div>
      </div>

      <!-- Alert Volume Chart -->
      <div class="card" style="grid-column:span 2">
        <div class="card-header"><div class="card-title"><span class="dot"></span> Alert Volume (7 Days)</div></div>
        <div class="card-body">
          <div class="chart-container" style="height:180px">
            <canvas id="chart-alert-volume"></canvas>
          </div>
        </div>
      </div>
    </div>`;
}

// Called by router after renderAlerts HTML is inserted into DOM
async function _onAlertsMount() {
  await _fetchAlertStats();
  // Update stat cards
  ['critical','high','medium','low'].forEach(k => {
    const el = document.getElementById(`alert-stat-${k}`);
    if (el) el.textContent = _alertStats[k] ?? 0;
  });
  const sub = document.getElementById('alert-subtitle');
  if (sub) {
    const active = (_alertStats.critical||0) + (_alertStats.high||0) + (_alertStats.medium||0) + (_alertStats.low||0);
    sub.textContent = `Real-time threat monitoring · ${active} active · ${_alertStats.total||0} total`;
  }
  // Restore filter dropdowns
  const sevEl  = document.getElementById('alert-sev-filter');
  const typeEl = document.getElementById('alert-type-filter');
  const statEl = document.getElementById('alert-status-filter');
  if (sevEl)  sevEl.value  = _alertFilter.sev;
  if (typeEl) typeEl.value = _alertFilter.type;
  if (statEl) statEl.value = _alertFilter.status;
  await _renderAlertList();
}

async function _renderAlertList() {
  const listEl = document.getElementById('alert-list');
  if (!listEl) return;
  const data = await _fetchAlerts(_alertFilter.sev, _alertFilter.type, _alertFilter.status);
  // Merge with MOCK data as fallback so UI is never empty
  const combined = data.length > 0 ? data : MOCK.alerts;
  const search = (document.getElementById('alert-search') || {}).value || '';
  const filtered = combined.filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || (a.desc||'').toLowerCase().includes(search.toLowerCase())
  );
  if (!filtered.length) {
    listEl.innerHTML = `<div style="text-align:center;padding:48px;color:var(--text-muted)"><div style="font-size:32px;margin-bottom:12px">🛡️</div><div>No alerts match your filters.</div></div>`;
    return;
  }
  listEl.innerHTML = filtered.map(a => `
    <div class="alert-card-big ${a.sev}" id="alert-row-${a.id}">
      <div style="flex-shrink:0;margin-top:2px">
        <div style="width:36px;height:36px;border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center;font-size:18px;
          background:${a.sev==='critical'?'var(--danger-glass)':a.sev==='high'?'var(--warning-glass)':a.sev==='medium'?'rgba(0,212,255,0.1)':'var(--success-glass)'};
          border:1px solid ${a.sev==='critical'?'rgba(255,51,102,0.3)':a.sev==='high'?'rgba(255,170,0,0.3)':a.sev==='medium'?'rgba(0,212,255,0.3)':'rgba(0,255,136,0.3)'}">
          ${a.sev==='critical'?'🚨':a.sev==='high'?'⚠️':a.sev==='medium'?'🔵':'ℹ️'}
        </div>
      </div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:5px;flex-wrap:wrap">
          <span style="font-size:14px;font-weight:600;color:var(--text-primary)">${a.title}</span>
          <span class="alert-sev-badge sev-${a.sev}">${a.sev.toUpperCase()}</span>
          <span class="badge badge-${statusBadge(a.status)}">${a.status}</span>
          ${a.alertType ? `<span class="badge badge-cyan" style="font-size:10px">${_alertTypeLabel(a.alertType)}</span>` : ''}
        </div>
        <div style="font-size:12px;color:var(--text-secondary);margin-bottom:5px">${a.desc||''}</div>
        <div style="font-size:11px;color:var(--text-muted)">${ICONS.logs} ${a.id} · ${a.time||a.timestamp||''}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
        <button class="btn btn-ghost btn-sm" onclick="window.handleAlertInvestigate('${a.id}')">${ICONS.eye} Investigate</button>
        ${a.status !== 'resolved' ? `<button class="btn btn-ghost btn-sm" onclick="window._resolveAlert('${a.id}')">✅ Resolve</button>` : ''}
      </div>
    </div>`).join('');
}

window._filterAlertList = _renderAlertList;

window._setAlertSev = (v) => {
  _alertFilter.sev = v;
  const el = document.getElementById('alert-sev-filter');
  if (el) el.value = v;
  _renderAlertList();
};
window._setAlertType = (v) => { _alertFilter.type = v; _renderAlertList(); };
window._setAlertStatus = (v) => { _alertFilter.status = v; _renderAlertList(); };

window._resolveAlert = async (alertId) => {
  const token = localStorage.getItem('nyxvault_token');
  if (!token) return;
  try {
    const r = await fetch(`http://localhost:3000/api/alerts/${alertId}/resolve`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }
    });
    if (r.ok) {
      showToast('Alert resolved ✅', 'success');
      const row = document.getElementById(`alert-row-${alertId}`);
      if (row) row.style.opacity = '0.4';
      await _fetchAlertStats();
      ['critical','high','medium','low'].forEach(k => {
        const el = document.getElementById(`alert-stat-${k}`);
        if (el) el.textContent = _alertStats[k] ?? 0;
      });
    }
  } catch (_) {
    showToast('Failed to resolve alert', 'error');
  }
};

window.handleAcknowledgeAll = async () => {
  const token = localStorage.getItem('nyxvault_token');
  if (!token) { showToast('Not authenticated', 'error'); return; }
  const btn = document.getElementById('ack-all-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Acknowledging…'; }
  try {
    const r = await fetch(apiCallUrl('/api/alerts/acknowledge-all'), {
      method: 'POST', headers: { Authorization: `Bearer ${token}` }
    });
    const d = await r.json();
    showToast(d.message || 'All alerts acknowledged', 'success');
    await _fetchAlertStats();
    await _renderAlertList();
    ['critical','high','medium','low'].forEach(k => {
      const el = document.getElementById(`alert-stat-${k}`);
      if (el) el.textContent = _alertStats[k] ?? 0;
    });
  } catch (_) {
    showToast('Failed to acknowledge alerts', 'error');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '✅ Acknowledge All'; }
  }
};

// Deterministic generator helper for realistic threat details
function _getForensicDetails(alert) {
  const id = alert.id || 'system';
  let seed = 0;
  for (let i = 0; i < id.length; i++) {
    seed = (seed * 31 + id.charCodeAt(i)) & 0xFFFFFFFF;
  }
  const absSeed = Math.abs(seed);
  
  // Generate Attacker IP
  const ipParts = [
    185,
    220,
    101,
    (absSeed % 254) + 1
  ];
  const attackerIp = ipParts.join('.');
  
  // Target Resource / Node
  const nodeSuffixes = ['core-auth', 'file-vault-s3', 'db-primary', 'api-gateway', 'user-ingress'];
  const targetNode = nodeSuffixes[absSeed % nodeSuffixes.length];
  
  // Threat Signature Hash (SHA-256 styled)
  const hexChars = '0123456789abcdef';
  let sigHash = '0x';
  for (let i = 0; i < 32; i++) {
    sigHash += hexChars[(absSeed >> (i % 8)) & 0xf];
  }
  
  // Compliance Impact
  let compliance = '';
  const type = alert.alertType || alert.alert_type || 'system';
  switch (type) {
    case 'failed_login':
      compliance = 'PCI-DSS 8.1.6 (Brute force controls), SOC2 CC6.1 (Access Control)';
      break;
    case 'file_tampering':
      compliance = 'ISO 27001 A.12.4.1 (Logging/Integrity), HIPAA 164.312(c)(1) (Integrity)';
      break;
    case 'suspicious_download':
      compliance = 'SOC2 CC6.6 (Boundary Defense), GDPR Article 32 (Data Loss Prevention)';
      break;
    case 'unauthorized_access':
      compliance = 'NIST SP 800-53 AC-2 (Account Management), PCI-DSS 7.1';
      break;
    default:
      compliance = 'NIST SP 800-53 SI-4 (Information System Monitoring)';
  }
  
  return { attackerIp, targetNode, sigHash, compliance };
}

window.handleAlertInvestigate = async (alertId) => {
  // Retrieve alert from MOCK or backend
  let alert = MOCK.alerts.find(a => a.id === alertId);
  if (!alert) {
    const data = await _fetchAlerts();
    alert = data.find(a => a.id === alertId);
  }
  if (!alert) {
    showToast('Alert details not found', 'error');
    return;
  }
  
  const overlay = document.createElement('div');
  overlay.className = 'preview-overlay show';
  
  window.closeForensicModal = () => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
  };
  
  overlay.onclick = (e) => {
    if (e.target === overlay) window.closeForensicModal();
  };
  
  document.body.appendChild(overlay);
  
  // Render scanning loader
  overlay.innerHTML = `
    <div class="preview-modal" style="max-width:550px; height:auto; padding:24px; border-radius:16px;">
      <div id="forensic-scanner" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding:40px 20px; text-align:center; min-height:300px;">
        <div class="cyber-pulse-loader" style="margin-bottom: 24px; position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center;">
          <div class="pulse-ring-1"></div>
          <div class="pulse-ring-2"></div>
          <span style="font-size: 36px; z-index: 2;">🔍</span>
        </div>
        <div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 1px;">
          Scanning Threat Node Pathway...
        </div>
        <div id="forensic-hex-ticker" style="font-family: var(--font-mono); font-size: 12px; color: var(--text-cyan); background: rgba(0, 212, 255, 0.05); padding: 8px 16px; border-radius: 6px; border: 1px solid rgba(0, 212, 255, 0.15); width: 100%; max-width: 320px; min-height: 34px; margin-bottom: 16px; word-break: break-all;">
          0x00000000
        </div>
        <div id="forensic-hop-label" style="font-size: 11px; color: var(--text-muted); margin-bottom: 20px; font-family: var(--font-mono);">
          Initializing deep packet inspection...
        </div>
        <div style="width: 100%; max-width: 320px; height: 4px; background: rgba(255,255,255,0.05); border-radius: 2px; overflow: hidden;">
          <div id="forensic-progress-bar" style="width: 0%; height: 100%; background: linear-gradient(90deg, var(--text-cyan), #00ff88); transition: width 0.1s linear;"></div>
        </div>
      </div>
    </div>
  `;
  
  let progress = 0;
  const hexTicker = overlay.querySelector('#forensic-hex-ticker');
  const hopLabel = overlay.querySelector('#forensic-hop-label');
  const progressBar = overlay.querySelector('#forensic-progress-bar');
  
  const hops = [
    'Establishing connection to source node...',
    'Analyzing packet headers and payload entropy...',
    'Reconstructing TCP flow state...',
    'Parsing threat signature hash...',
    'Evaluating compliance framework impact...',
    'Reconstruction complete. Generating forensic report.'
  ];
  
  const interval = setInterval(() => {
    progress += 5;
    if (progressBar) progressBar.style.width = `${progress}%`;
    
    if (hexTicker) {
      let randHex = '0x';
      for(let i=0; i<8; i++) {
        randHex += Math.floor(Math.random()*16).toString(16).toUpperCase();
      }
      hexTicker.textContent = randHex;
    }
    
    if (hopLabel) {
      const hopIndex = Math.min(Math.floor((progress / 100) * hops.length), hops.length - 1);
      hopLabel.textContent = hops[hopIndex];
    }
    
    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        renderForensicReport();
      }, 150);
    }
  }, 50);
  
  function renderForensicReport() {
    const details = _getForensicDetails(alert);
    const isResolved = alert.status === 'resolved';
    
    const modalContent = `
      <div class="preview-modal" style="max-width:550px; height:auto; padding:24px; animation: modal-fade-in 0.3s ease-out; border-radius:16px;">
        <div class="preview-header" style="border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:12px; margin-bottom:18px; background:none;">
          <div class="preview-title-wrapper">
            <span style="font-size:24px">${alert.sev === 'critical' ? '🚨' : alert.sev === 'high' ? '⚠️' : alert.sev === 'medium' ? '🔵' : 'ℹ️'}</span>
            <div>
              <div class="preview-title" style="font-size:16px; font-weight:700;">Forensic Threat Report</div>
              <div class="preview-subtitle" style="font-size:11px; color:var(--text-muted)">Deep Packet & Integrity Analysis</div>
            </div>
          </div>
          <button class="preview-close" onclick="window.closeForensicModal()" style="font-size:24px; background:none; border:none; color:var(--text-muted); cursor:pointer;">&times;</button>
        </div>
        
        <div class="preview-body" style="padding:0; overflow-y:auto; max-height:450px; padding-right:4px;">
          <div style="background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); padding:14px; border-radius:8px; margin-bottom:18px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
              <span class="alert-sev-badge sev-${alert.sev}" style="font-size:10px;">${alert.sev.toUpperCase()}</span>
              <span id="forensic-status-badge" class="badge badge-${statusBadge(alert.status)}" style="font-size:10px;">${alert.status}</span>
            </div>
            <div style="font-size:14px; font-weight:600; color:var(--text-primary); margin-bottom:4px;">${alert.title}</div>
            <div style="font-size:12px; color:var(--text-secondary); line-height:1.4;">${alert.desc}</div>
          </div>
          
          <div style="display:flex; flex-direction:column; gap:12px; font-size:13px; margin-bottom:20px;">
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:8px;">
              <span style="color:var(--text-secondary);">Alert Identifier</span>
              <span class="font-mono" style="color:var(--text-primary); font-weight:600;">${alert.id}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:8px;">
              <span style="color:var(--text-secondary);">Attacker IP Address</span>
              <span class="font-mono" style="color:var(--text-cyan); font-weight:600;">${details.attackerIp}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:8px;">
              <span style="color:var(--text-secondary);">Target System Node</span>
              <span style="color:var(--text-primary); font-weight:600; font-family:var(--font-mono);">${details.targetNode}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:8px;">
              <span style="color:var(--text-secondary);">Threat Signature Hash</span>
              <span class="font-mono" style="color:var(--text-muted); font-size:11px; max-width:280px; word-break:break-all; text-align:right;">${details.sigHash}</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.04); padding-bottom:8px; align-items:flex-start;">
              <span style="color:var(--text-secondary); flex-shrink:0;">Compliance Impact</span>
              <span style="color:var(--text-primary); font-size:11px; text-align:right; max-width:280px; font-weight:500;">${details.compliance}</span>
            </div>
            <div style="display:flex; justify-content:space-between; padding-bottom:8px;">
              <span style="color:var(--text-secondary);">Detection Timestamp</span>
              <span style="color:var(--text-primary); font-family:var(--font-mono); font-size:12px;">${alert.time || alert.timestamp}</span>
            </div>
          </div>
        </div>
        
        <div style="display:flex; justify-content:flex-end; gap:10px; border-top:1px solid rgba(255,255,255,0.08); padding-top:16px; margin-top:8px;">
          <button class="btn btn-ghost" onclick="window.closeForensicModal()" style="font-size:12px; padding:8px 16px;">Close</button>
          ${!isResolved ? `
            <button id="forensic-resolve-btn" class="btn btn-primary" onclick="window.handleForensicResolve('${alert.id}')" style="font-size:12px; padding:8px 16px; background:linear-gradient(135deg, #00ff88, #00d4ff); border:none; color:#020810; font-weight:700;">
              ✅ Mark as Resolved
            </button>
          ` : ''}
        </div>
      </div>
    `;
    
    overlay.innerHTML = modalContent;
  }
  
  window.handleForensicResolve = async (alertId) => {
    const btn = overlay.querySelector('#forensic-resolve-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = '⏳ Resolving...';
    }
    
    await window._resolveAlert(alertId);
    
    const statusBadgeEl = overlay.querySelector('#forensic-status-badge');
    if (statusBadgeEl) {
      statusBadgeEl.className = 'badge badge-success';
      statusBadgeEl.textContent = 'resolved';
    }
    if (btn) {
      btn.remove();
    }
    alert.status = 'resolved';
  };
};

window.handleAlertExportCSV = async () => {
  const data = await _fetchAlerts(_alertFilter.sev, _alertFilter.type, _alertFilter.status);
  const combined = data.length > 0 ? data : MOCK.alerts;
  const search = (document.getElementById('alert-search') || {}).value || '';
  const filtered = combined.filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || (a.desc||'').toLowerCase().includes(search.toLowerCase())
  );
  
  if (!filtered.length) {
    showToast('No alerts to export', 'warning');
    return;
  }
  
  const headers = ['Alert ID', 'Severity', 'Type', 'Status', 'Title', 'Description', 'Time', 'Timestamp'];
  const escapeCsv = (str) => {
    if (str === undefined || str === null) return '';
    const val = String(str).replace(/"/g, '""');
    return `"${val}"`;
  };
  
  const rows = filtered.map(a => [
    escapeCsv(a.id),
    escapeCsv(a.sev),
    escapeCsv(a.alertType || a.alert_type || 'system'),
    escapeCsv(a.status),
    escapeCsv(a.title),
    escapeCsv(a.desc),
    escapeCsv(a.time),
    escapeCsv(a.timestamp)
  ]);
  
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `nyxvault_security_alerts_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`Exported ${filtered.length} alerts to CSV`, 'success');
};

// =============================================
// PAGE: USER GUIDE
// =============================================
function renderUserGuide() {
  return `
    <div class="page-header">
      <div>
        <div class="page-title">System User Guide</div>
        <div class="page-subtitle">Complete step-by-step instructions for NyxVault secure cloud operations.</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary btn-sm" onclick="window.print()">${ICONS.export} Print Guide</button>
      </div>
    </div>

    <div style="display:grid; grid-template-columns: 240px 1fr; gap: 24px; align-items: start;">
      <!-- Sticky Navigation Index -->
      <div class="card" style="position: sticky; top: 20px; padding: 16px; background: var(--glass-2); backdrop-filter: blur(10px); border: 1px solid var(--border);">
        <div style="font-size: 13px; font-weight: 700; text-transform: uppercase; color: var(--text-cyan); margin-bottom: 12px; font-family: var(--font-display);">
          Documentation
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12px;">
          <a href="#guide-sec-1" style="color: var(--text-secondary); text-decoration: none; padding: 6px 8px; border-radius: 4px; transition: all 0.2s;" onmouseover="this.style.color='var(--text-cyan)'; this.style.background='rgba(0,212,255,0.05)';" onmouseout="this.style.color='var(--text-secondary)'; this.style.background='none';">1. Security Architecture</a>
          <a href="#guide-sec-2" style="color: var(--text-secondary); text-decoration: none; padding: 6px 8px; border-radius: 4px; transition: all 0.2s;" onmouseover="this.style.color='var(--text-cyan)'; this.style.background='rgba(0,212,255,0.05)';" onmouseout="this.style.color='var(--text-secondary)'; this.style.background='none';">2. Access & Login</a>
          <a href="#guide-sec-3" style="color: var(--text-secondary); text-decoration: none; padding: 6px 8px; border-radius: 4px; transition: all 0.2s;" onmouseover="this.style.color='var(--text-cyan)'; this.style.background='rgba(0,212,255,0.05)';" onmouseout="this.style.color='var(--text-secondary)'; this.style.background='none';">3. File Manager</a>
          <a href="#guide-sec-4" style="color: var(--text-secondary); text-decoration: none; padding: 6px 8px; border-radius: 4px; transition: all 0.2s;" onmouseover="this.style.color='var(--text-cyan)'; this.style.background='rgba(0,212,255,0.05)';" onmouseout="this.style.color='var(--text-secondary)'; this.style.background='none';">4. Secure Sharing</a>
          <a href="#guide-sec-5" style="color: var(--text-secondary); text-decoration: none; padding: 6px 8px; border-radius: 4px; transition: all 0.2s;" onmouseover="this.style.color='var(--text-cyan)'; this.style.background='rgba(0,212,255,0.05)';" onmouseout="this.style.color='var(--text-secondary)'; this.style.background='none';">5. Dashboard & Storage</a>
          <a href="#guide-sec-6" style="color: var(--text-secondary); text-decoration: none; padding: 6px 8px; border-radius: 4px; transition: all 0.2s;" onmouseover="this.style.color='var(--text-cyan)'; this.style.background='rgba(0,212,255,0.05)';" onmouseout="this.style.color='var(--text-secondary)'; this.style.background='none';">6. Compliance Audit Logs</a>
          <a href="#guide-sec-7" style="color: var(--text-secondary); text-decoration: none; padding: 6px 8px; border-radius: 4px; transition: all 0.2s;" onmouseover="this.style.color='var(--text-cyan)'; this.style.background='rgba(0,212,255,0.05)';" onmouseout="this.style.color='var(--text-secondary)'; this.style.background='none';">7. Security Alert Center</a>
        </div>
      </div>

      <!-- Main Content Area -->
      <div style="display: flex; flex-direction: column; gap: 24px; min-width: 0;">
        
        <!-- Section 1 -->
        <div class="card" id="guide-sec-1">
          <div class="card-header">
            <div class="card-title">
              <span style="font-size: 18px; margin-right: 8px;">🛡️</span> 1. Zero-Knowledge Cryptographic Concept
            </div>
          </div>
          <div class="card-body" style="font-size: 13px; line-height: 1.6; color: var(--text-secondary);">
            <p style="margin-bottom: 12px;">
              NyxVault is engineered on a strict <strong>zero-knowledge paradigm</strong>. Unlike traditional cloud storage systems that encrypt your files on their servers, NyxVault enforces <strong>client-side encryption</strong>.
            </p>
            <div style="background: rgba(0, 212, 255, 0.05); border: 1px solid rgba(0, 212, 255, 0.15); padding: 12px; border-radius: 6px; margin-bottom: 12px;">
              <strong style="color: var(--text-cyan);">How it works:</strong>
              <ul style="margin-left: 18px; margin-top: 6px; display: flex; flex-direction: column; gap: 4px; list-style-type: disc;">
                <li>When you upload a file, your browser generates a random 256-bit AES cryptographic key locally.</li>
                <li>The file is encrypted in-memory using <strong>AES-256-GCM</strong> before it is sent to the server.</li>
                <li>The server only receives and stores the encrypted byte stream. The decryption keys are never transmitted to or stored on the backend in plaintext.</li>
                <li>When you view or download a file, the encrypted bytes are sent back to your browser, which performs the decryption in-memory.</li>
              </ul>
            </div>
            <p>This design ensures that your files are mathematically unreadable to anyone else, including system administrators and potential intruders who might breach the database.</p>
          </div>
        </div>

        <!-- Section 2 -->
        <div class="card" id="guide-sec-2">
          <div class="card-header">
            <div class="card-title">
              <span style="font-size: 18px; margin-right: 8px;">🔑</span> 2. Authentication & Developer Sandbox
            </div>
          </div>
          <div class="card-body" style="font-size: 13px; line-height: 1.6; color: var(--text-secondary);">
            <p style="margin-bottom: 12px;">
              To begin exploring, you can sign in using either our secure database account or the OAuth JIT simulator.
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px;">
              <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 6px;">
                <strong style="color: var(--text-primary); display: block; margin-bottom: 6px;">Default Administrator Login:</strong>
                <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-muted);">
                  Email: alex.ryder@nyxvault.io<br>
                  Password: Password123!
                </span>
              </div>
              <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 6px;">
                <strong style="color: var(--text-primary); display: block; margin-bottom: 6px;">Google JIT Provisioning Sandbox:</strong>
                <span style="font-size: 11px; color: var(--text-muted);">
                  Click the <strong>Sign in with Google</strong> button. Input any test email to automatically create and provision a secure user profile dynamically.
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3 -->
        <div class="card" id="guide-sec-3">
          <div class="card-header">
            <div class="card-title">
              <span style="font-size: 18px; margin-right: 8px;">📁</span> 3. File Manager & Cryptographic Previews
            </div>
          </div>
          <div class="card-body" style="font-size: 13px; line-height: 1.6; color: var(--text-secondary);">
            <p style="margin-bottom: 12px;">
              The <strong>File Manager</strong> lets you upload, organize, and inspect your secure documents.
            </p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="display: flex; gap: 12px; align-items: flex-start;">
                <div style="background: rgba(0, 212, 255, 0.1); color: var(--text-cyan); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">1</div>
                <div>
                  <strong>Uploading & Limits:</strong> Drag and drop files or click the upload button. The system enforces a strict <strong>64GB free storage tier</strong>. File uploads that would exceed your ceiling are proactively blocked on the client and server side.
                </div>
              </div>
              <div style="display: flex; gap: 12px; align-items: flex-start;">
                <div style="background: rgba(0, 212, 255, 0.1); color: var(--text-cyan); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">2</div>
                <div>
                  <strong>Sorting and Searching:</strong> Filter files instantly by type using folder cards (Documents, Images, Code, etc.), sort by modification parameters, or use the focus-retained real-time search box.
                </div>
              </div>
              <div style="display: flex; gap: 12px; align-items: flex-start;">
                <div style="background: rgba(0, 212, 255, 0.1); color: var(--text-cyan); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0;">3</div>
                <div>
                  <strong>Cryptographic Inline Previews:</strong> Click the <strong>View</strong> (eye icon) button. The encrypted bytes are fetched and decrypted locally in browser memory. High-fidelity rendering displays images, embeds PDFs, and renders plain text/scripts safely in scrollable, XSS-protected views.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 4 -->
        <div class="card" id="guide-sec-4">
          <div class="card-header">
            <div class="card-title">
              <span style="font-size: 18px; margin-right: 8px;">🔗</span> 4. Secure Sharing Link Controls
            </div>
          </div>
          <div class="card-body" style="font-size: 13px; line-height: 1.6; color: var(--text-secondary);">
            <p style="margin-bottom: 12px;">
              Share files securely by generating unique cryptographic links with granular access policies.
            </p>
            <ul style="margin-left: 18px; margin-bottom: 12px; display: flex; flex-direction: column; gap: 6px; list-style-type: disc;">
              <li><strong>Permissions:</strong> Choose between "View Only" (blocks downloading bytes) or "View & Download".</li>
              <li><strong>Password Protection:</strong> Mandate a strong passphrase to authorize the recipient's in-browser decryption.</li>
              <li><strong>Self-Destruction:</strong> Enable "One-Time Link" to automatically expire and delete the link record immediately after the first view.</li>
              <li><strong>Quotas:</strong> Restrict link lifecycle by specifying a maximum download count or limiting access to designated recipient emails.</li>
            </ul>
            <p>Go to the <strong>Secure Sharing</strong> panel to view share logs, inspect configuration badges, revoke links instantly, or export share metrics to a CSV spreadsheet.</p>
          </div>
        </div>

        <!-- Section 5 -->
        <div class="card" id="guide-sec-5">
          <div class="card-header">
            <div class="card-title">
              <span style="font-size: 18px; margin-right: 8px;">📊</span> 5. Dashboard & Storage Metrics
            </div>
          </div>
          <div class="card-body" style="font-size: 13px; line-height: 1.6; color: var(--text-secondary);">
            <p>
              The <strong>Security Dashboard</strong> serves as your high-level overview, displaying a real-time <strong>Storage Used</strong> card showing exact byte-level consumption out of your 64.0 GB limit. The doughnut chart measures your vault integrity score, prompting you with compliance checks (like enabling MFA or rotating keys) to maintain complete data protection.
            </p>
          </div>
        </div>

        <!-- Section 6 -->
        <div class="card" id="guide-sec-6">
          <div class="card-header">
            <div class="card-title">
              <span style="font-size: 18px; margin-right: 8px;">📜</span> 6. Compliance Audit Logs Console
            </div>
          </div>
          <div class="card-body" style="font-size: 13px; line-height: 1.6; color: var(--text-secondary);">
            <p style="margin-bottom: 12px;">
              Every operation within NyxVault triggers a cryptographic, role-scoped log entry. Admins can access all records, while standard accounts are restricted to their own logs and system alerts.
            </p>
            <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255,255,255,0.05); padding: 12px; border-radius: 6px;">
              <strong style="color: var(--text-primary); display: block; margin-bottom: 6px;">Console Tools:</strong>
              <ul style="margin-left: 18px; display: flex; flex-direction: column; gap: 4px; list-style-type: disc;">
                <li><strong>Dynamic Filters:</strong> Instantly search logs by IP, User, Log ID, or Action, filter by calendar date, and navigate pages using pagination.</li>
                <li><strong>CSV Export:</strong> Click <strong>Export CSV</strong> to save currently filtered audits into a double-quote-escaped compliance spreadsheet.</li>
                <li><strong>PDF Reporting:</strong> Click <strong>PDF Report</strong> to invoke a print preview. Customized print media styles hide sidebar headers, search inputs, and page indicators, rendering a publication-ready corporate audit document.</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Section 7 -->
        <div class="card" id="guide-sec-7">
          <div class="card-header">
            <div class="card-title">
              <span style="font-size: 18px; margin-right: 8px;">🚨</span> 7. Security Alert Center & Threat Mitigation
            </div>
          </div>
          <div class="card-body" style="font-size: 13px; line-height: 1.6; color: var(--text-secondary);">
            <p style="margin-bottom: 12px;">
              The <strong>Security Alert Center</strong> monitors infrastructure and account anomalies in real-time.
            </p>
            <div style="display: flex; flex-direction: column; gap: 12px;">
              <div>
                <strong style="color: var(--text-primary);">WebSocket Threat Prepending:</strong>
                If a threat is triggered (such as a failed login attempt or integrity mismatch), the backend pushes it via Socket.IO. If the Alert Center page is open, the threat card slides into the top of the feed instantly with an outline neon glow (<code>.new-alert-glow</code>), and the active severity count metrics increment in real-time.
              </div>
              <div>
                <strong style="color: var(--text-primary);">Interactive Threat Forensics:</strong>
                Click <strong>Investigate</strong> on any active alert. The system launches a 1-second simulated cybernetic scanning loader (pulsing loader, randomized hex byte ticker, TCP pathway hops). Once complete, it displays a detailed Forensic Report detailing the Attacker IP, Target Node, Threat Signature Hash, and affected Regulatory compliance rules.
              </div>
              <div>
                <strong style="color: var(--text-primary);">Mitigation:</strong>
                Click <strong>Mark as Resolved</strong> inside the modal to immediately update the SQLite database status, log the resolution in the audit log, and update dashboard totals. You can also click <strong>Acknowledge All</strong> in the page header to bulk-clear all active/reviewing threats.
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>`;
}

window.renderUserGuide = renderUserGuide;

// =============================================
// PAGE: AUDIT LOGS
// =============================================
// Local helper to filter logs based on window._logFilters state
function getFilteredLogs() {
  const filters = window._logFilters || { search: '', user: 'All Users', action: 'All Actions', status: 'All Statuses', date: '', page: 1, limit: 10 };
  let list = MOCK.auditLogs || [];

  // Apply User Filter
  if (filters.user && filters.user !== 'All Users') {
    list = list.filter(l => l.user === filters.user);
  }
  // Apply Action Filter
  if (filters.action && filters.action !== 'All Actions') {
    list = list.filter(l => l.action === filters.action);
  }
  // Apply Status Filter
  if (filters.status && filters.status !== 'All Statuses') {
    list = list.filter(l => l.status.toLowerCase() === filters.status.toLowerCase());
  }
  // Apply Date Filter
  if (filters.date) {
    list = list.filter(l => l.timestamp && l.timestamp.startsWith(filters.date));
  }
  // Apply Text Search Filter
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(l => 
      (l.id && l.id.toLowerCase().includes(q)) ||
      (l.user && l.user.toLowerCase().includes(q)) ||
      (l.action && l.action.toLowerCase().includes(q)) ||
      (l.resource && l.resource.toLowerCase().includes(q)) ||
      (l.ip && l.ip.toLowerCase().includes(q))
    );
  }

  return list;
}

window.handleLogPageChange = (page) => {
  if (!window._logFilters) return;
  window._logFilters.page = page;
  routeChange();
};

window.handleLogExportCSV = () => {
  const filtered = getFilteredLogs();
  if (filtered.length === 0) {
    showToast('No logs to export', 'warning');
    return;
  }
  
  const headers = ['Log ID', 'User', 'Action', 'Resource', 'IP Address', 'Timestamp', 'Status'];
  const rows = filtered.map(l => [
    l.id,
    l.user,
    l.action,
    `"${l.resource.replace(/"/g, '""')}"`,
    l.ip,
    l.timestamp,
    l.status
  ]);
  
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `nyxvault_audit_logs_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`Exported ${filtered.length} logs to CSV`, 'success');
};

window.handleLogCopy = (id) => {
  const log = MOCK.auditLogs.find(l => l.id === id);
  if (!log) return;
  const logText = `Log ID: ${log.id}\nUser: ${log.user} (${log.userId})\nAction: ${log.action}\nResource: ${log.resource}\nIP: ${log.ip}\nTime: ${log.time}\nStatus: ${log.status}\nTimestamp: ${log.timestamp}`;
  
  navigator.clipboard.writeText(logText).then(() => {
    showToast(`Log ${log.id} details copied to clipboard`, 'success');
  }).catch(err => {
    showToast('Failed to copy: ' + err, 'error');
  });
};

window.handleLogViewDetails = (id) => {
  const log = MOCK.auditLogs.find(l => l.id === id);
  if (!log) return;
  
  const overlay = document.createElement('div');
  overlay.className = 'preview-overlay show';
  
  const closeModal = () => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
  };
  
  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };
  
  overlay.innerHTML = `
    <div class="preview-modal" style="max-width:500px;height:auto;padding:24px">
      <div class="preview-header" style="border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;margin-bottom:18px">
        <div class="preview-title-wrapper">
          <span style="font-size:24px">📜</span>
          <div>
            <div class="preview-title" style="font-size:16px">Audit Log Details</div>
            <div class="preview-subtitle" style="font-size:11px;color:var(--text-muted)">Security and Compliance Record</div>
          </div>
        </div>
        <button class="preview-close" style="font-size:24px;background:none;border:none;color:var(--text-muted);cursor:pointer">&times;</button>
      </div>
      <div class="preview-body" style="padding:0">
        <div style="display:flex;flex-direction:column;gap:12px;font-size:13px">
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.04);padding-bottom:8px">
            <span style="color:var(--text-secondary)">Log ID</span>
            <span class="font-mono" style="color:var(--text-primary);font-weight:600">${log.id}</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.04);padding-bottom:8px">
            <span style="color:var(--text-secondary)">User Account</span>
            <span style="color:var(--text-primary);font-weight:600">${log.user} (${log.userId})</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.04);padding-bottom:8px">
            <span style="color:var(--text-secondary)">Action Triggered</span>
            <span class="badge badge-${actionBadge(log.action)}" style="font-size:10px;font-family:var(--font-mono)">${log.action}</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.04);padding-bottom:8px">
            <span style="color:var(--text-secondary)">Target Resource</span>
            <span style="color:var(--text-primary);font-weight:500;text-align:right;max-width:260px;word-break:break-all">${log.resource}</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.04);padding-bottom:8px">
            <span style="color:var(--text-secondary)">IP Address</span>
            <span class="font-mono" style="color:var(--text-primary)">${log.ip}</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.04);padding-bottom:8px">
            <span style="color:var(--text-secondary)">Logged Time</span>
            <span style="color:var(--text-primary)">${log.time}</span>
          </div>
          <div style="display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.04);padding-bottom:8px">
            <span style="color:var(--text-secondary)">ISO Timestamp</span>
            <span class="font-mono" style="color:var(--text-muted);font-size:11px">${log.timestamp}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding-bottom:8px">
            <span style="color:var(--text-secondary)">Log Status</span>
            <span class="badge badge-${statusBadge(log.status)}">${log.status.toUpperCase()}</span>
          </div>
        </div>
        <div style="margin-top:20px;display:flex;gap:8px">
          <button class="btn btn-ghost btn-sm" style="flex:1" onclick="handleLogCopy('${log.id}');">Copy Plain</button>
          <button class="btn btn-primary btn-sm" style="flex:1" id="log-details-close-btn">Close</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  overlay.querySelector('.preview-close').onclick = closeModal;
  overlay.querySelector('#log-details-close-btn').onclick = closeModal;
};

function renderLogs() {
  window._logFilters = window._logFilters || { search: '', user: 'All Users', action: 'All Actions', status: 'All Statuses', date: '', page: 1, limit: 10 };
  
  const filtered = getFilteredLogs();
  
  // Dynamically extract unique users and actions from all loaded logs
  const uniqueUsers = ['All Users', ...new Set(MOCK.auditLogs.map(l => l.user))].sort();
  const uniqueActions = ['All Actions', ...new Set(MOCK.auditLogs.map(l => l.action))].sort();
  
  const limit = window._logFilters.limit;
  const totalEntries = filtered.length;
  const totalPages = Math.ceil(totalEntries / limit) || 1;
  
  // Adjust current page if it is out of bounds
  if (window._logFilters.page > totalPages) window._logFilters.page = totalPages;
  if (window._logFilters.page < 1) window._logFilters.page = 1;
  
  const currentPage = window._logFilters.page;
  const startIndex = (currentPage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalEntries);
  
  const visibleLogs = filtered.slice(startIndex, endIndex);
  
  // Render page number buttons
  let pageButtons = [];
  pageButtons.push(`<button class="btn btn-ghost btn-sm" style="min-width:36px" ${currentPage === 1 ? 'disabled' : ''} onclick="handleLogPageChange(${currentPage - 1})">←</button>`);
  for (let p = 1; p <= totalPages; p++) {
    pageButtons.push(`<button class="btn btn-ghost btn-sm" style="min-width:36px;${p === currentPage ? 'border-color:var(--cyan);color:var(--cyan)' : ''}" onclick="handleLogPageChange(${p})">${p}</button>`);
  }
  pageButtons.push(`<button class="btn btn-ghost btn-sm" style="min-width:36px" ${currentPage === totalPages ? 'disabled' : ''} onclick="handleLogPageChange(${currentPage + 1})">→</button>`);

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Audit Logs</div>
        <div class="page-subtitle">Immutable, tamper-proof activity log · GDPR · SOC 2 · HIPAA compliant</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-ghost btn-sm" onclick="handleLogExportCSV()">${ICONS.export} Export CSV</button>
        <button class="btn btn-ghost btn-sm" onclick="window.print()">📄 PDF Report</button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card" style="margin-bottom:20px">
      <div class="card-body" style="padding:16px">
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center">
          <div class="input-with-icon" style="flex:1;max-width:280px">
            <span class="input-icon">${ICONS.search}</span>
            <input class="form-input" type="text" id="log-search-input" placeholder="Search user, action, IP, resource..." value="${window._logFilters.search || ''}" style="padding-left:36px" />
          </div>
          <select class="form-select" id="log-user-select" style="width:auto">
            ${uniqueUsers.map(u => `<option ${window._logFilters.user === u ? 'selected' : ''}>${u}</option>`).join('')}
          </select>
          <select class="form-select" id="log-action-select" style="width:auto">
            ${uniqueActions.map(a => `<option ${window._logFilters.action === a ? 'selected' : ''}>${a}</option>`).join('')}
          </select>
          <select class="form-select" id="log-status-select" style="width:auto">
            ${['All Statuses', 'Success', 'Blocked', 'Warning'].map(s => `<option ${window._logFilters.status === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
          <input class="form-input" type="date" id="log-date-input" value="${window._logFilters.date || ''}" style="width:auto" />
          <button class="btn btn-primary btn-sm" id="log-apply-btn">${ICONS.filter} Apply</button>
        </div>
      </div>
    </div>

    <!-- Log Table -->
    <div class="card">
      <div class="card-header">
        <div class="card-title"><span class="dot"></span> Activity Log</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="badge badge-cyan">${totalEntries} entries</span>
          <span style="font-size:12px;color:var(--text-muted)">Showing ${totalEntries === 0 ? 0 : startIndex + 1}–${endIndex}</span>
        </div>
      </div>
      <div class="card-body" style="padding:0">
        <div class="table-wrapper" style="border:none;border-radius:0 0 var(--r-lg) var(--r-lg)">
          <table class="data-table">
            <thead>
              <tr>
                <th>Log ID</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>IP Address</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${visibleLogs.length === 0 ? `
              <tr>
                <td colspan="8" style="text-align:center;padding:24px;color:var(--text-muted)">No matching audit logs found.</td>
              </tr>` : ''}
              ${visibleLogs.map(log => `
              <tr>
                <td class="font-mono" style="color:var(--text-muted);font-size:11px">${log.id}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,var(--cyan),var(--purple));display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:#fff;flex-shrink:0">
                      ${log.user === 'system' ? '⚙' : log.user === 'unknown' ? '?' : log.user[0].toUpperCase()}
                    </div>
                    <span style="color:var(--text-primary);font-weight:500">${log.user}</span>
                  </div>
                </td>
                <td><span class="badge badge-${actionBadge(log.action)}" style="font-size:10px;font-family:var(--font-mono)">${log.action}</span></td>
                <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${log.resource}">${log.resource}</td>
                <td class="font-mono" style="font-size:11px">${log.ip}</td>
                <td style="white-space:nowrap;font-size:11px">${log.time}</td>
                <td><span class="badge badge-${statusBadge(log.status)}">${log.status}</span></td>
                <td>
                  <div class="table-actions">
                    <button class="table-action-btn" title="View details" onclick="handleLogViewDetails('${log.id}')">${ICONS.eye}</button>
                    <button class="table-action-btn" title="Copy" onclick="handleLogCopy('${log.id}')">${ICONS.copy}</button>
                  </div>
                </td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </div>
      <!-- Pagination -->
      <div style="display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-top:1px solid var(--border)">
        <span style="font-size:13px;color:var(--text-muted)">
          Showing ${totalEntries === 0 ? 0 : startIndex + 1}–${endIndex} of ${totalEntries} entries
        </span>
        <div style="display:flex;gap:4px">
          ${pageButtons.join('')}
        </div>
      </div>
    </div>`;
}

// =============================================
// PAGE: USER PROFILE
// =============================================
function renderProfile() {
  const nameParts = (MOCK.user.name || '').split(' ');
  const fName = nameParts[0] || '';
  const lName = nameParts.slice(1).join(' ') || '';

  return `
    <div class="page-header">
      <div>
        <div class="page-title">User Profile</div>
        <div class="page-subtitle">Manage your account, security settings, and API access</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary btn-sm" onclick="window.handleSaveProfile()">${ICONS.check} Save Changes</button>
      </div>
    </div>

    <!-- Profile Header -->
    <div class="profile-header" style="margin-bottom:24px">
      <div class="profile-avatar-lg" style="background: ${MOCK.user.color || 'var(--text-cyan)'}; color: #020810; font-weight: 700; display: flex; align-items: center; justify-content: center; font-size: 24px; border-radius: 50%;">${MOCK.user.avatar || 'AR'}</div>
      <div style="flex:1">
        <div style="font-family:var(--font-display);font-size:22px;font-weight:700;color:var(--text-primary)">${MOCK.user.name}</div>
        <div style="font-size:14px;color:var(--text-secondary)">${MOCK.user.email}</div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <span class="badge badge-cyan">${MOCK.user.role}</span>
          <span class="badge badge-purple">${MOCK.user.plan}</span>
          <span class="badge badge-success"><span class="blink"></span> Active</span>
        </div>
      </div>
      <div style="text-align:right;font-size:12px;color:var(--text-muted)">
        <div>Member since: ${MOCK.user.joined}</div>
        <div style="margin-top:4px">Last login: 2h ago</div>
        <div style="margin-top:4px">Sessions: ${(MOCK.sessions || []).length || 1} active</div>
      </div>
    </div>

    <div class="section-grid grid-2">
      <!-- Personal Info -->
      <div class="card">
        <div class="card-header"><div class="card-title"><span class="dot"></span> Personal Information</div></div>
        <div class="card-body">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">First Name</label>
              <input class="form-input" type="text" id="profile-first-name" value="${fName}" />
            </div>
            <div class="form-group" style="margin-bottom:0">
              <label class="form-label">Last Name</label>
              <input class="form-input" type="text" id="profile-last-name" value="${lName}" />
            </div>
          </div>
          <div class="form-group" style="margin-top:14px">
            <label class="form-label">Email Address</label>
            <input class="form-input" type="email" value="${MOCK.user.email}" />
          </div>
          <div class="form-group">
            <label class="form-label">Organization</label>
            <input class="form-input" type="text" value="NyxVault HQ" />
          </div>
          <div class="form-group">
            <label class="form-label">Time Zone</label>
            <select class="form-select">
              <option selected>UTC+05:30 — Asia/Kolkata</option>
              <option>UTC+00:00 — London</option>
              <option>UTC-05:00 — New York</option>
              <option>UTC-08:00 — Los Angeles</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label class="form-label">Bio</label>
            <textarea class="form-textarea" style="min-height:70px">Security-focused platform administrator with 8+ years in enterprise data protection.</textarea>
          </div>
        </div>
      </div>

      <!-- Security Settings -->
      <div class="card">
        <div class="card-header"><div class="card-title"><span class="dot"></span> Security Settings</div></div>
        <div class="card-body">
          <div style="display:flex;flex-direction:column;gap:16px">
            ${[
              ['Multi-Factor Authentication','TOTP app enabled (Google Authenticator)',MOCK.user.mfa_enabled ?? MOCK.user.mfa ?? false,'success','mfa'],
              ['Login Notifications','Email alert on new device login',true,'cyan','notifications'],
              ['Paranoid Mode','Re-authenticate on every file access',false,'warning','paranoid'],
              ['Session Lock (15 min)','Auto-lock inactive sessions',true,'cyan','sessionLock'],
              ['Download Watermark','Embed ID in all downloaded files',MOCK.user.watermark ?? false,'purple','watermark'],
            ].map(([l,d,c,cl,k])=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;background:var(--glass-3);border:1px solid var(--border);border-radius:var(--r-sm)">
              <div>
                <div style="font-size:13px;color:var(--text-primary);font-weight:500">${l}</div>
                <div style="font-size:11px;color:var(--text-muted)">${d}</div>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="profile-toggle-${k}" ${c?'checked':''} ${k === 'mfa' ? 'onchange="window.handleMfaToggle(this)"' : ''} />
                <span class="toggle-slider"></span>
              </label>
            </div>`).join('')}
          </div>
          <div class="divider"></div>
          <button class="btn btn-ghost btn-sm" style="width:100%;margin-bottom:8px" onclick="showToast('Password change email sent','success')">🔑 Change Password</button>
          <button class="btn btn-ghost btn-sm" style="width:100%;margin-bottom:8px" onclick="showToast('Backup codes downloaded','info')">💾 Download Backup Codes</button>
          <button class="btn btn-danger btn-sm" style="width:100%;background:rgba(255,51,102,0.1);border:1px solid rgba(255,51,102,0.25);color:var(--danger)" onclick="handleLogout()">🚪 Sign Out Securely</button>
        </div>
      </div>

      <!-- API Keys -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="dot"></span> API Keys</div>
          <button class="btn btn-primary btn-sm" onclick="window.handleGenerateApiKey()">${ICONS.plus} Generate Key</button>
        </div>
        <div class="card-body">
          ${(MOCK.apiKeys || []).length === 0 ? `<div style="text-align:center;padding:20px;color:var(--text-muted);font-size:12px">No API Keys active. Click Generate Key to create one.</div>` :
          (MOCK.apiKeys || []).map(k=>`
          <div style="margin-bottom:14px;padding:14px;background:var(--glass-3);border:1px solid var(--border);border-radius:var(--r-sm)">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
              <span style="font-size:13px;font-weight:600;color:var(--text-primary)">${k.name}</span>
              <div style="display:flex;gap:4px">
                <button class="table-action-btn" onclick="navigator.clipboard.writeText('${k.key}'); showToast('Key copied','success')" title="Copy">${ICONS.copy}</button>
                <button class="table-action-btn danger" onclick="window.handleRevokeApiKey('${k.id}')" title="Revoke">${ICONS.x}</button>
              </div>
            </div>
            <div class="api-key-display">
              <span class="api-key-val">${k.key}</span>
            </div>
            <div style="display:flex;gap:16px;margin-top:8px;font-size:11px;color:var(--text-muted)">
              <span>Created: ${k.created}</span>
              <span>Last used: ${k.lastUsed}</span>
            </div>
          </div>`).join('')}
        </div>
      </div>

      <!-- Active Sessions -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><span class="dot"></span> Active Sessions</div>
          <button class="btn btn-danger btn-sm" onclick="window.handleTerminateOtherSessions()">Revoke All Others</button>
        </div>
        <div class="card-body">
          ${(MOCK.sessions || []).map(s=>`
          <div style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--glass-3);border:1px solid var(--border);border-radius:var(--r-sm);margin-bottom:8px">
            <span style="font-size:24px">${s.device.includes('iPhone') || s.device.includes('iOS') ? '📱' : s.device.includes('Desktop') ? '🖥️' : '💻'}</span>
            <div style="flex:1">
              <div style="font-size:13px;font-weight:500;color:var(--text-primary)">${s.device} ${s.current?'<span class="badge badge-success" style="font-size:9px">Current</span>':''}</div>
              <div style="font-size:11px;color:var(--text-muted)">${s.ip} · ${s.loc} · ${s.time}</div>
            </div>
            ${!s.current ? `<button class="table-action-btn danger" onclick="window.handleTerminateSession('${s.id}')" title="Terminate">${ICONS.x}</button>` : ''}
          </div>`).join('')}
        </div>
      </div>
    </div>`;
}

// =============================================
// PAGE: ADMIN DASHBOARD
// =============================================
function renderAdmin() {
  const sysStats = [
    { id:'stat-tot-users',  label:'Total Users',        icon:'👥', cls:'accent-cyan' },
    { id:'stat-act-users',  label:'Active Users',       icon:'🟢', cls:'accent-success' },
    { id:'stat-tot-files',  label:'Total Files',        icon:'💾', cls:'accent-purple' },
    { id:'stat-share-files',label:'Shared Files',       icon:'🔗', cls:'accent-cyan' },
    { id:'stat-tamp-files', label:'Tampered Files',     icon:'⚠️', cls:'accent-danger' },
    { id:'stat-fail-logins',label:'Failed Logins',      icon:'🔐', cls:'accent-warning' },
    { id:'stat-sec-inc',    label:'Security Incidents', icon:'🚨', cls:'accent-danger' },
    { id:'stat-audit-logs', label:'Audit Logs',         icon:'📜', cls:'accent-purple' },
  ];

  return `
    <div class="page-header">
      <div>
        <div class="page-title">Admin Dashboard</div>
        <div class="page-subtitle">Platform management · NyxVault Enterprise · v2.4.1</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-ghost btn-sm" onclick="showToast('System settings opened','info')">${ICONS.settings} System Config</button>
        <button class="btn btn-primary btn-sm" onclick="showToast('Inviting new user…','info')">${ICONS.plus} Invite User</button>
      </div>
    </div>

    <!-- System Stats -->
    <div class="stat-cards stagger" style="margin-bottom:24px; grid-template-columns: repeat(4, 1fr);">
      ${sysStats.map(s=>`
      <div class="stat-card ${s.cls} animate-fade">
        <div class="stat-header"><div class="stat-icon">${s.icon}</div></div>
        <div class="stat-value" id="${s.id}">—</div>
        <div class="stat-label">${s.label}</div>
      </div>`).join('')}
    </div>

    <div class="section-grid grid-2">
      <!-- User Management -->
      <div class="card" style="grid-column:span 2">
        <div class="card-header">
          <div class="card-title"><span class="dot"></span> User Management</div>
          <div style="display:flex;gap:8px">
            <div class="input-with-icon">
              <span class="input-icon">${ICONS.search}</span>
              <input class="form-input" type="text" placeholder="Search users…" style="padding-left:36px;height:34px" />
            </div>
            <button class="btn btn-ghost btn-sm">${ICONS.filter} Filter</button>
          </div>
        </div>
        <div class="card-body" style="padding:0">
          <div class="table-wrapper" style="border:none;border-radius:0 0 var(--r-lg) var(--r-lg)">
            <table class="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Files</th>
                  <th>Last Active</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${MOCK.adminUsers.map(u=>`
                <tr>
                  <td>
                    <div class="user-row">
                      <div class="user-av" style="background:${u.color}22;border:1px solid ${u.color}44;color:${u.color}">${u.name.split(' ').map(n=>n[0]).join('')}</div>
                      <div>
                        <div style="font-size:13px;font-weight:500;color:var(--text-primary)">${u.name}</div>
                        <div style="font-size:11px;color:var(--text-muted)">${u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="badge badge-${u.role==='Admin'?'danger':u.role==='Manager'?'warning':u.role==='Developer'?'cyan':'muted'}">${u.role}</span></td>
                  <td style="color:var(--text-primary);font-weight:500">${u.files.toLocaleString()}</td>
                  <td style="font-size:12px">${u.lastActive}</td>
                  <td><span class="badge badge-${statusBadge(u.status)}">${u.status}</span></td>
                  <td>
                    <div class="table-actions">
                      <button class="table-action-btn" title="Edit" onclick="showToast('Editing ${u.name}','info')">${ICONS.edit}</button>
                      <button class="table-action-btn" title="View logs" onclick="navigate('logs')">${ICONS.logs}</button>
                      ${u.status === 'suspended'
                        ? `<button class="table-action-btn success" title="Activate Account" onclick="handleSuspendUser('${u.id}', '${u.status}')">${ICONS.check}</button>`
                        : `<button class="table-action-btn danger" title="Suspend Account" onclick="handleSuspendUser('${u.id}', '${u.status}')">${ICONS.x}</button>`
                      }
                    </div>
                  </td>
                </tr>`).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- System Health -->
      <div class="card">
        <div class="card-header"><div class="card-title"><span class="dot"></span> System Health</div></div>
        <div class="card-body">
          <div style="display:flex;flex-direction:column;gap:14px">
            ${[
              ['API Gateway',       '99.98%','18ms',  'operational','success'],
              ['File Storage',      '99.99%','4ms',   'operational','success'],
              ['Encryption Service','100%',  '2ms',   'operational','success'],
              ['Auth Service',      '99.95%','12ms',  'operational','success'],
              ['Integrity Scanner', '98.5%', '220ms', 'degraded',   'warning'],
              ['Alert Engine',      '100%',  '8ms',   'operational','success'],
            ].map(([s,up,lat,st,c])=>`
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px;background:var(--glass-3);border:1px solid var(--border);border-radius:var(--r-sm)">
              <div style="display:flex;align-items:center;gap:8px">
                <div style="width:8px;height:8px;border-radius:50%;background:var(--${c==='success'?'success':'warning'});box-shadow:0 0 6px var(--${c==='success'?'success':'warning'})"></div>
                <span style="font-size:13px;color:var(--text-secondary)">${s}</span>
              </div>
              <div style="display:flex;gap:16px;font-size:11px;color:var(--text-muted)">
                <span style="color:var(--${c==='success'?'success':'warning'})">${up}</span>
                <span>Lat: ${lat}</span>
                <span class="badge badge-${c}" style="font-size:9px">${st}</span>
              </div>
            </div>`).join('')}
          </div>
        </div>
      </div>

      <!-- Platform Analytics -->
      <div class="card">
        <div class="card-header"><div class="card-title"><span class="dot"></span> Platform Analytics</div></div>
        <div class="card-body">
          <div class="chart-container" style="height:220px">
            <canvas id="chart-admin-activity"></canvas>
          </div>
        </div>
      </div>

      <!-- License & Config -->
      <div class="card" style="grid-column:span 2">
        <div class="card-header"><div class="card-title"><span class="dot"></span> License &amp; Configuration</div></div>
        <div class="card-body">
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
            ${[
              ['License Type','Enterprise','🏢'],
              ['Seat Limit','Unlimited','👥'],
              ['Storage Quota','10 TB','💾'],
              ['Valid Until','Dec 31, 2026','📅'],
              ['Version','v2.4.1','⚡'],
              ['Encryption','FIPS 140-2','🔐'],
              ['Regions','US-E, EU-W, AP-S','🌐'],
              ['Support Level','24/7 Dedicated','🛠️'],
            ].map(([l,v,i])=>`
            <div style="background:var(--glass-3);border:1px solid var(--border);border-radius:var(--r-sm);padding:14px;text-align:center">
              <div style="font-size:22px;margin-bottom:6px">${i}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px;text-transform:uppercase;letter-spacing:0.5px">${l}</div>
              <div style="font-size:13px;font-weight:600;color:var(--cyan)">${v}</div>
            </div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
}

// =============================================
// CHART INITIALIZERS
// =============================================
function destroyChart(id) {
  const existing = Chart.getChart(id);
  if (existing) existing.destroy();
}

function initDashboardCharts() {
  if (!window.Chart) return;
  setChartDefaults();

  const gridColor = 'rgba(0,212,255,0.06)';
  const tickColor = '#445577';

  // Activity Chart
  setTimeout(() => {
    destroyChart('chart-activity');
    const ctx = document.getElementById('chart-activity');
    if (!ctx) return;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: MOCK.chartActivity.labels,
        datasets: [
          {
            label: 'Uploads',
            data: MOCK.chartActivity.uploads,
            borderColor: '#00d4ff',
            backgroundColor: 'rgba(0,212,255,0.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#00d4ff',
            pointRadius: 4,
            pointHoverRadius: 7,
          },
          {
            label: 'Downloads',
            data: MOCK.chartActivity.downloads,
            borderColor: '#7b2fff',
            backgroundColor: 'rgba(123,47,255,0.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#7b2fff',
            pointRadius: 4,
            pointHoverRadius: 7,
          },
          {
            label: 'Alerts',
            data: MOCK.chartActivity.alerts,
            borderColor: '#ff3366',
            backgroundColor: 'rgba(255,51,102,0.06)',
            fill: false,
            tension: 0.4,
            pointBackgroundColor: '#ff3366',
            pointRadius: 4,
            pointHoverRadius: 7,
            borderDash: [4, 4],
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: tickColor } },
          y: { grid: { color: gridColor }, ticks: { color: tickColor }, beginAtZero: true }
        }
      }
    });
  }, 100);

  // Score Doughnut
  setTimeout(() => {
    destroyChart('chart-score');
    const ctx = document.getElementById('chart-score');
    if (!ctx) return;
    const scoreVal = MOCK.stats ? Math.round(MOCK.stats.integrityScore) : 100;
    const remainder = 100 - scoreVal;
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [scoreVal, remainder],
          backgroundColor: ['rgba(0,212,255,0.8)', 'rgba(255,255,255,0.04)'],
          borderColor: ['#00d4ff', 'rgba(0,212,255,0.1)'],
          borderWidth: 2,
        }]
      },
      options: {
        responsive: false,
        cutout: '80%',
        plugins: { legend: { display: false }, tooltip: { enabled: false } },
        animation: { animateRotate: true, duration: 1200 }
      }
    });
  }, 150);

  // Storage Doughnut
  setTimeout(() => {
    destroyChart('chart-storage');
    const ctx = document.getElementById('chart-storage');
    if (!ctx) return;
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: MOCK.chartStorage.labels,
        datasets: [{
          data: MOCK.chartStorage.data,
          backgroundColor: ['#1a6fff','#7b2fff','#00d4ff','#00ff88','#ff3366','#ffaa00'],
          borderColor: 'transparent',
          hoverOffset: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` } }
        }
      }
    });
  }, 200);

  // Threats Bar
  setTimeout(() => {
    destroyChart('chart-threats');
    const ctx = document.getElementById('chart-threats');
    if (!ctx) return;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: MOCK.chartThreats.labels,
        datasets: [
          { label: 'Malware', data: MOCK.chartThreats.malware, backgroundColor: 'rgba(255,51,102,0.7)', borderRadius: 4 },
          { label: 'Intrusion', data: MOCK.chartThreats.intrusion, backgroundColor: 'rgba(255,170,0,0.7)', borderRadius: 4 },
          { label: 'Anomaly', data: MOCK.chartThreats.anomaly, backgroundColor: 'rgba(0,212,255,0.7)', borderRadius: 4 },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: tickColor }, stacked: false },
          y: { grid: { color: gridColor }, ticks: { color: tickColor }, beginAtZero: true }
        }
      }
    });
  }, 250);
}

function initIntegrityChart() {
  if (!window.Chart) return;
  setTimeout(() => {
    destroyChart('chart-integrity');
    const ctx = document.getElementById('chart-integrity');
    if (!ctx) return;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jun 18','Jun 19','Jun 20','Jun 21','Jun 22','Jun 23','Jun 24'],
        datasets: [{
          label: 'Integrity Score',
          data: [99.8, 99.7, 99.5, 99.9, 99.6, 99.1, 97.2],
          borderColor: '#00ff88',
          backgroundColor: 'rgba(0,255,136,0.08)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: [
            '#00ff88','#00ff88','#00ff88','#00ff88','#00ff88','#00ff88','#ff3366'
          ],
          pointRadius: [4,4,4,4,4,4,7],
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.y}%` } } },
        scales: {
          x: { grid: { color: 'rgba(0,255,136,0.05)' }, ticks: { color: '#445577' } },
          y: { grid: { color: 'rgba(0,255,136,0.05)' }, ticks: { color: '#445577' }, min: 95, max: 101 }
        }
      }
    });
  }, 100);
}

function initAlertChart() {
  if (!window.Chart) return;
  setTimeout(() => {
    destroyChart('chart-alert-volume');
    const ctx = document.getElementById('chart-alert-volume');
    if (!ctx) return;
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: MOCK.chartActivity.labels,
        datasets: [
          { label: 'Critical', data: [0,1,0,2,1,3,2], backgroundColor: 'rgba(255,51,102,0.75)', borderRadius: 3 },
          { label: 'High',     data: [1,2,1,3,2,4,3], backgroundColor: 'rgba(255,170,0,0.75)',  borderRadius: 3 },
          { label: 'Medium',   data: [2,3,2,3,1,5,6], backgroundColor: 'rgba(0,212,255,0.65)',  borderRadius: 3 },
          { label: 'Low',      data: [3,2,3,2,2,2,3], backgroundColor: 'rgba(0,255,136,0.5)',   borderRadius: 3 },
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { color: '#8899bb', boxWidth: 12, padding: 14 } } },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { color: '#445577' } },
          y: { stacked: true, grid: { color: 'rgba(0,212,255,0.06)' }, ticks: { color: '#445577' }, beginAtZero: true }
        }
      }
    });
  }, 100);
}

function initAdminChart() {
  if (!window.Chart) return;
  setTimeout(() => {
    destroyChart('chart-admin-activity');
    const ctx = document.getElementById('chart-admin-activity');
    if (!ctx) return;
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: MOCK.chartActivity.labels,
        datasets: [
          {
            label: 'Daily Active Users',
            data: [4, 5, 3, 6, 5, 4, 6],
            borderColor: '#7b2fff',
            backgroundColor: 'rgba(123,47,255,0.12)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#7b2fff',
            pointRadius: 5,
          },
          {
            label: 'API Calls (×100)',
            data: [18, 24, 16, 31, 27, 22, 35],
            borderColor: '#00d4ff',
            backgroundColor: 'transparent',
            tension: 0.4,
            pointBackgroundColor: '#00d4ff',
            pointRadius: 4,
            borderDash: [4,3],
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { color: '#8899bb', boxWidth: 12, padding: 14 } } },
        scales: {
          x: { grid: { color: 'rgba(0,212,255,0.06)' }, ticks: { color: '#445577' } },
          y: { grid: { color: 'rgba(0,212,255,0.06)' }, ticks: { color: '#445577' }, beginAtZero: true }
        }
      }
    });
  }, 100);
}

// =============================================
// API CLIENT UTILITIES
// =============================================
function apiCallUrl(endpoint) {
  const baseUrl = (window.location.hostname === 'localhost' && window.location.port === '3000') 
    ? 'http://localhost:3000' 
    : window.location.origin;
  return endpoint.startsWith('http') ? endpoint : baseUrl + endpoint;
}

async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('nyxvault_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = apiCallUrl(endpoint);

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('nyxvault_token');
    localStorage.removeItem('nyxvault_user');
    showToast('Session expired. Please sign in again.', 'warning');
    navigate('login');
    throw new Error('Session unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Network request failed');
  }

  return response.json();
}

// =============================================
// ROUTER
// =============================================
const ROUTES = {
  '':          { render: renderLanding,   title: 'NyxVault — Secure Cloud File Vault', auth: false },
  '/':         { render: renderLanding,   title: 'NyxVault — Secure Cloud File Vault', auth: false },
  '/login':    { render: renderLogin,     title: 'Sign In — NyxVault',                 auth: false },
  '/register': { render: renderRegister,  title: 'Create Vault — NyxVault',            auth: false },
  '/features': { render: renderFeaturesPage, title: 'Features — NyxVault',             auth: false, nav: 'Platform Features' },
  '/security': { render: renderSecurityPage, title: 'Security Architecture — NyxVault',auth: false, nav: 'Security Architecture' },
  '/docs':     { render: renderDocsPage,     title: 'Documentation — NyxVault',        auth: false, nav: 'Documentation Hub' },
  '/dashboard':{ render: renderDashboard, title: 'Dashboard',    nav: 'Security Dashboard', auth: true },
  '/upload':   { render: renderUpload,    title: 'File Upload',  nav: 'File Upload',         auth: true },
  '/files':    { render: renderFileManager, title: 'File Manager', nav: 'File Manager',      auth: true },
  '/sharing':  { render: renderSharing,   title: 'Sharing',      nav: 'Secure Sharing',      auth: true },
  '/integrity':{ render: renderIntegrity, title: 'Integrity',    nav: 'Integrity Monitor',   auth: true },
  '/alerts':   { render: renderAlerts,    title: 'Alerts',       nav: 'Security Alert Center',auth: true },
  '/logs':     { render: renderLogs,      title: 'Audit Logs',   nav: 'Audit Logs',          auth: true },
  '/profile':  { render: renderProfile,   title: 'Profile',      nav: 'User Profile',        auth: true },
  '/guide':    { render: renderDocsPage,     title: 'Documentation — NyxVault',        auth: false, nav: 'Documentation Hub' },
  '/admin':    { render: renderAdmin,     title: 'Admin',        nav: 'Admin Dashboard',     auth: true },
};

function navigate(page) {
  window.location.hash = `/${page}`;
}

function getActivePage() {
  const hash = window.location.hash.slice(1) || '/';
  const parts = hash.split('/');
  return parts[1] || 'dashboard';
}

async function routeChange() {
  const hash = window.location.hash.slice(1) || '/';
  const route = ROUTES[hash] || ROUTES['/'];

  document.title = route.title;

  const app = document.getElementById('app');
  const page = hash.replace('/', '');

  const token = localStorage.getItem('nyxvault_token');

  // Authenticated route protection
  if (route.auth && !token) {
    showToast('Authentication required', 'warning');
    navigate('login');
    return;
  }

  // If already authenticated and visiting auth pages, skip to dashboard
  if (!route.auth && token && (hash === '/login' || hash === '/register')) {
    navigate('dashboard');
    return;
  }

  try {
    const isDashboardView = route.auth || (token && ['/docs', '/features', '/security', '/guide'].includes(hash));
    if (isDashboardView) {
      // 1. Show skeleton or loading state for sub-panels
      if (app.innerHTML === '' || !document.querySelector('.app-wrapper')) {
        app.innerHTML = renderAppLayout(page || 'dashboard', route.nav || route.title, `<div style="padding:40px;text-align:center;color:var(--text-muted)">🔒 Initializing Secure Vault Connection...</div>`);
      }

      // 2. Fetch required state depending on current page
      if (page === 'dashboard' || page === '' || page === 'upload') {
        const statsData = await apiCall('/api/stats');
        Object.assign(MOCK, statsData);
      } else if (page === 'files') {
        const statsData = await apiCall('/api/stats');
        Object.assign(MOCK, statsData);
        
        // Fetch all files to calculate folder counts
        const allFiles = await apiCall('/api/files');
        MOCK.allFiles = allFiles;
        
        // Fetch filtered files based on folder and search query
        const params = [];
        if (window._selectedFolder) params.push(`folder=${encodeURIComponent(window._selectedFolder)}`);
        if (window._searchQuery) params.push(`search=${encodeURIComponent(window._searchQuery)}`);
        const queryStr = params.length > 0 ? `?${params.join('&')}` : '';
        
        const files = await apiCall(`/api/files${queryStr}`);
        MOCK.files = files;
      } else if (page === 'sharing') {
        const shares = await apiCall('/api/sharing');
        MOCK.shareLinks = shares;
        const files = await apiCall('/api/files');
        MOCK.files = files;
      } else if (page === 'integrity') {
        const freshStats = await apiCall('/api/stats');
        Object.assign(MOCK, freshStats);
        const integrity = await apiCall('/api/integrity');
        MOCK.integrityFiles = integrity.files;
      } else if (page === 'alerts') {
        // Defer live fetch to _onAlertsMount — keeps initial render fast
      } else if (page === 'logs') {
        const logs = await apiCall('/api/logs');
        MOCK.auditLogs = logs;
      } else if (page === 'profile') {
        const me = await apiCall('/api/auth/me');
        Object.assign(MOCK.user, me);
        try {
          const sessions = await apiCall('/api/auth/sessions');
          MOCK.sessions = sessions;
        } catch (_) {
          MOCK.sessions = [];
        }
        try {
          const keys = await apiCall('/api/keys');
          MOCK.apiKeys = keys;
        } catch (_) {
          MOCK.apiKeys = [];
        }
      } else if (page === 'admin') {
        const users = await apiCall('/api/admin/users');
        MOCK.adminUsers = users;
        const adminStats = await apiCall('/api/admin/stats');
        // Override local system stats variables for admin display
        MOCK.adminStats = adminStats;
      }

      // 3. Render layout with fresh data
      app.innerHTML = renderAppLayout(page || 'dashboard', route.nav || route.title, route.render());
      
      // Post-rendering bindings
      setupAppEvents(page);
      initPageCharts(page);

      // Page-specific async mount hooks
      if (page === 'alerts') {
        _onAlertsMount();
      }

      // Bind admin specific stats if loaded
      if (page === 'admin' && MOCK.adminStats) {
        document.getElementById('stat-tot-users').textContent = MOCK.adminStats.totalUsers || 0;
        document.getElementById('stat-act-users').textContent = MOCK.adminStats.activeUsers || 0;
        document.getElementById('stat-tot-files').textContent = MOCK.adminStats.totalFiles || 0;
        document.getElementById('stat-share-files').textContent = MOCK.adminStats.sharedFiles || 0;
        document.getElementById('stat-tamp-files').textContent = MOCK.adminStats.tamperedFiles || 0;
        document.getElementById('stat-fail-logins').textContent = MOCK.adminStats.failedLogins || 0;
        document.getElementById('stat-sec-inc').textContent = MOCK.adminStats.securityIncidents || 0;
        document.getElementById('stat-audit-logs').textContent = MOCK.adminStats.auditLogs || 0;
      }
    } else {
      // Unauthenticated view (landing/login/register)
      app.innerHTML = route.render();
      setupAuthEvents(hash);
    }
  } catch (err) {
    console.error('Routing load error:', err);
    if (err.message === 'User not found') {
      localStorage.removeItem('nyxvault_token');
      localStorage.removeItem('nyxvault_user');
      showToast('Session invalid. Please sign in again.', 'warning');
      navigate('login');
    } else if (err.message !== 'Session unauthorized') {
      showToast('Error syncing vault metrics: ' + err.message, 'error');
    }
  }

  window.scrollTo(0, 0);
}

function initPageCharts(page) {
  if (page === 'dashboard') initDashboardCharts();
  else if (page === 'integrity') initIntegrityChart();
  else if (page === 'alerts') initAlertChart();
  else if (page === 'admin') initAdminChart();
}

function setupAppEvents(page) {
  // Tabs click binding
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const group = this.closest('.tabs');
      if (group) {
        group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      }
    });
  });

  // Toggle layout selectors
  window.toggleFileView = (mode) => {
    const gridBtn = document.getElementById('view-grid-btn');
    const listBtn = document.getElementById('view-list-btn');
    if (!gridBtn || !listBtn) return;
    if (mode === 'grid') {
      gridBtn.style.borderColor = 'var(--cyan)';
      gridBtn.style.color = 'var(--cyan)';
      listBtn.style.borderColor = '';
      listBtn.style.color = '';
    } else {
      listBtn.style.borderColor = 'var(--cyan)';
      listBtn.style.color = 'var(--cyan)';
      gridBtn.style.borderColor = '';
      gridBtn.style.color = '';
    }
    showToast(`${mode.charAt(0).toUpperCase() + mode.slice(1)} view active`, 'info');
  };

  // Audit Logs Page Event Bindings
  if (page === 'logs') {
    const searchInput = document.getElementById('log-search-input');
    const userSelect = document.getElementById('log-user-select');
    const actionSelect = document.getElementById('log-action-select');
    const statusSelect = document.getElementById('log-status-select');
    const dateInput = document.getElementById('log-date-input');
    const applyBtn = document.getElementById('log-apply-btn');

    const updateFilters = () => {
      if (!window._logFilters) return;
      window._logFilters.search = searchInput ? searchInput.value.trim() : '';
      window._logFilters.user = userSelect ? userSelect.value : 'All Users';
      window._logFilters.action = actionSelect ? actionSelect.value : 'All Actions';
      window._logFilters.status = statusSelect ? statusSelect.value : 'All Statuses';
      window._logFilters.date = dateInput ? dateInput.value : '';
      window._logFilters.page = 1; // Reset to first page
      routeChange();
    };

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        if (!window._logFilters) return;
        window._logFilters.search = searchInput.value.trim();
        window._logFilters.page = 1;
        routeChange();
        
        // Restore focus and cursor position after redraw
        const newSearchInput = document.getElementById('log-search-input');
        if (newSearchInput) {
          newSearchInput.focus();
          newSearchInput.setSelectionRange(newSearchInput.value.length, newSearchInput.value.length);
        }
      });
    }

    if (userSelect) userSelect.addEventListener('change', updateFilters);
    if (actionSelect) actionSelect.addEventListener('change', updateFilters);
    if (statusSelect) statusSelect.addEventListener('change', updateFilters);
    if (dateInput) dateInput.addEventListener('change', updateFilters);
    if (applyBtn) applyBtn.addEventListener('click', updateFilters);
  }
}

function setupAuthEvents(hash) {
  // Recover user login profiles if pre-saved
  const storedUser = localStorage.getItem('nyxvault_user');
  if (storedUser && hash === '/login') {
    try {
      const u = JSON.parse(storedUser);
      const emailInput = document.getElementById('login-email');
      if (emailInput) emailInput.value = u.email;
    } catch(e){}
  }
}

window.toggleSidebar = () => {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('show');
};

window.closeSidebar = () => {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('show');
};

// =============================================
// FILE UPLOAD AND QUEUE MONITOR
// =============================================
window.activeUploads = [];

window.uploadFile = (file) => {
  const fileExt = file.name.split('.').pop().toLowerCase();
  const uploadItem = {
    name: file.name,
    size: formatBytes(file.size),
    type: fileExt,
    pct: 0,
    status: 'encrypting'
  };

  window.activeUploads.unshift(uploadItem);
  routeChange(); // Redraw UI to append item

  // Simulate premium client-side Zero-Knowledge encryption phase
  setTimeout(() => {
    uploadItem.status = 'uploading';
    routeChange();

    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('encrypted', 'true'); // Enforce client-side AES settings

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        uploadItem.pct = Math.round((e.loaded / e.total) * 100);
        routeChange();
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 201) {
        uploadItem.pct = 100;
        uploadItem.status = 'complete';
        showToast(`Secure upload complete: ${file.name}`, 'success');
        
        // Refresh dashboard metrics
        apiCall('/api/stats').then(statsData => {
          Object.assign(MOCK, statsData);
          routeChange();
        }).catch(console.error);
      } else {
        uploadItem.status = 'failed';
        showToast(`Failed to upload ${file.name}`, 'error');
        routeChange();
      }
    };

    xhr.onerror = () => {
      uploadItem.status = 'failed';
      showToast(`Network error uploading ${file.name}`, 'error');
      routeChange();
    };

    const token = localStorage.getItem('nyxvault_token');
    xhr.open('POST', '/api/files/upload', true);
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.send(formData);
  }, 1200);
};

window.handleDrop = (e) => {
  e.preventDefault();
  const zone = document.getElementById('upload-zone');
  if (zone) zone.classList.remove('drag-over');
  
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      window.uploadFile(files[i]);
    }
  }
};

window.handleFileSelect = (input) => {
  if (input.files.length > 0) {
    for (let i = 0; i < input.files.length; i++) {
      window.uploadFile(input[i]);
    }
  }
};

// =============================================
// FOLDER & FILE NAVIGATION ACTIONS
// =============================================
window.handleFolderSelect = async (folderName) => {
  window._selectedFolder = folderName;
  try {
    showToast(folderName ? `Opening folder: ${folderName}...` : 'Navigating home...', 'info');
    const params = [];
    if (folderName) params.push(`folder=${encodeURIComponent(folderName)}`);
    if (window._searchQuery) params.push(`search=${encodeURIComponent(window._searchQuery)}`);
    const queryStr = params.length > 0 ? `?${params.join('&')}` : '';
    
    const files = await apiCall(`/api/files${queryStr}`);
    MOCK.files = files;
    routeChange();
  } catch (err) {
    showToast('Failed to load folder: ' + err.message, 'error');
  }
};

let searchTimeout = null;
window.handleFileSearch = (query) => {
  window._searchQuery = query;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    try {
      const params = [];
      if (window._selectedFolder) params.push(`folder=${encodeURIComponent(window._selectedFolder)}`);
      if (query) params.push(`search=${encodeURIComponent(query)}`);
      const queryStr = params.length > 0 ? `?${params.join('&')}` : '';
      
      const files = await apiCall(`/api/files${queryStr}`);
      MOCK.files = files;
      routeChange();
      
      const searchInput = document.getElementById('fm-search-input');
      if (searchInput) {
        searchInput.focus();
        searchInput.selectionStart = searchInput.selectionEnd = searchInput.value.length;
      }
    } catch (err) {
      showToast('Search failed: ' + err.message, 'error');
    }
  }, 300);
};

window.handleFileSort = (mode) => {
  window._sortMode = mode;
  routeChange();
};

window.handleFileFilter = () => {
  if (!window._filterMode) {
    window._filterMode = 'encrypted';
    showToast('Filtering: Encrypted files only', 'info');
  } else if (window._filterMode === 'encrypted') {
    window._filterMode = 'unencrypted';
    showToast('Filtering: Unencrypted files only', 'info');
  } else {
    window._filterMode = null;
    showToast('Showing all files', 'info');
  }
  routeChange();
};

window.toggleFileView = (mode) => {
  window._fileViewMode = mode;
  showToast(`${mode.charAt(0).toUpperCase() + mode.slice(1)} view active`, 'info');
  routeChange();
};

// =============================================
// FILE MANAGEMENT & OPERATIONS
// =============================================
window.renderPreviewModal = (blob, mimeType, id, name, type) => {
  const objectUrl = window.URL.createObjectURL(blob);

  const overlay = document.createElement('div');
  overlay.className = 'preview-overlay';
  
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  };

  const closeModal = () => {
    overlay.classList.remove('show');
    setTimeout(() => {
      overlay.remove();
      window.URL.revokeObjectURL(objectUrl);
    }, 300);
  };

  let previewHtml = '';
  const cleanType = type ? type.toLowerCase() : '';
  
  const isImage = mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(cleanType);
  const isPdf = mimeType === 'application/pdf' || cleanType === 'pdf';
  const isText = mimeType.startsWith('text/') || 
                 mimeType === 'application/json' || 
                 mimeType === 'application/javascript' ||
                 ['txt', 'csv', 'js', 'py', 'json', 'css', 'html', 'log', 'md', 'xml', 'yaml', 'sh', 'bat'].includes(cleanType);

  if (isImage) {
    previewHtml = `<img src="${objectUrl}" class="preview-content-img" alt="${name}" />`;
  } else if (isPdf) {
    previewHtml = `<iframe src="${objectUrl}" class="preview-content-iframe"></iframe>`;
  } else if (isText) {
    previewHtml = `<pre class="preview-content-text" id="preview-text-content">Loading decrypted text content...</pre>`;
  } else {
    previewHtml = `
      <div class="preview-unsupported">
        <div class="preview-unsupported-icon">📦</div>
        <h3>Preview Unavailable</h3>
        <p>Natively previewing <strong>.${type.toUpperCase()}</strong> files is not supported in the browser. You can securely decrypt and download this file to your local machine.</p>
        <button class="btn btn-primary btn-sm" id="preview-download-btn" style="margin-top: 10px;">
          ${ICONS.download} Decrypt & Download
        </button>
      </div>
    `;
  }

  overlay.innerHTML = `
    <div class="preview-modal">
      <div class="preview-header">
        <div class="preview-title-wrapper">
          <span style="font-size: 20px;">${fileIcon(type)}</span>
          <div>
            <div class="preview-title">${name}</div>
            <div class="preview-subtitle">${formatBytes(blob.size)}</div>
          </div>
        </div>
        <button class="preview-close" title="Close Preview">&times;</button>
      </div>
      <div class="preview-body">
        ${previewHtml}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  if (isText) {
    (async () => {
      try {
        const text = await blob.text();
        const textEl = document.getElementById('preview-text-content');
        if (textEl) {
          textEl.textContent = text;
        }
      } catch (textErr) {
        const textEl = document.getElementById('preview-text-content');
        if (textEl) {
          textEl.textContent = "Error reading decrypted text stream: " + textErr.message;
        }
      }
    })();
  }

  overlay.querySelector('.preview-close').onclick = closeModal;
  const dlBtn = overlay.querySelector('#preview-download-btn');
  if (dlBtn) {
    dlBtn.onclick = () => {
      closeModal();
      handleFileDownload(id, name);
    };
  }

  setTimeout(() => overlay.classList.add('show'), 10);
};

window.handleFilePreview = async (id, name, type) => {
  try {
    const fileObj = (MOCK.allFiles || []).find(f => f.id === id) || (MOCK.files || []).find(f => f.id === id);
    
    if (fileObj && fileObj.isZeroKnowledge) {
      const wrappedKey = fileObj.wrappedKey;
      
      const decryptAndPreview = async (passphrase) => {
        try {
          showToast(`Downloading encrypted payload for ${name}...`, 'info');
          const token = localStorage.getItem('nyxvault_token');
          const response = await fetch(apiCallUrl(`/api/files/preview/${id}`), {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.error || 'Failed to fetch preview from secure nodes');
          }
          
          const arrayBuffer = await response.arrayBuffer();
          showToast(`Decrypting ${name} client-side...`, 'info');
          
          const decryptedBuffer = await decryptFileClientSide(arrayBuffer, wrappedKey, passphrase, MOCK.user.email);
          
          // Save passphrase to session for convenience
          sessionStorage.setItem('zk_passphrase', passphrase);
          
          const decryptedBlob = new Blob([decryptedBuffer]);
          
          renderPreviewModal(decryptedBlob, '', id, name, type);
          showToast('Zero-knowledge client decryption completed. Previewing file...', 'success');
        } catch (err) {
          showToast('Decryption failed: ' + err.message, 'error');
        }
      };
      
      const cachedPass = sessionStorage.getItem('zk_passphrase');
      if (cachedPass) {
        await decryptAndPreview(cachedPass);
      } else {
        promptPassphraseModal(name, decryptAndPreview);
      }
      return;
    }
    
    // Normal preview flow
    showToast(`Decrypting and streaming preview for ${name}...`, 'info');
    const token = localStorage.getItem('nyxvault_token');
    const response = await fetch(apiCallUrl(`/api/files/preview/${id}`), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to fetch preview from secure nodes');
    }

    const blob = await response.blob();
    const mimeType = response.headers.get('Content-Type') || '';
    
    renderPreviewModal(blob, mimeType, id, name, type);
    showToast('Vault decryption completed. Previewing file...', 'success');
  } catch (err) {
    showToast('Preview failure: ' + err.message, 'error');
  }
};

window.handleFileDownload = async (id, name) => {
  try {
    const fileObj = (MOCK.allFiles || []).find(f => f.id === id) || (MOCK.files || []).find(f => f.id === id);
    
    if (fileObj && fileObj.isZeroKnowledge) {
      const wrappedKey = fileObj.wrappedKey;
      
      const decryptAndDownload = async (passphrase) => {
        try {
          showToast(`Downloading encrypted payload for ${name}...`, 'info');
          const token = localStorage.getItem('nyxvault_token');
          const response = await fetch(apiCallUrl(`/api/files/download/${id}`), {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (!response.ok) throw new Error('Failed to download encrypted file');
          
          const arrayBuffer = await response.arrayBuffer();
          showToast(`Decrypting ${name} client-side...`, 'info');
          
          const decryptedBuffer = await decryptFileClientSide(arrayBuffer, wrappedKey, passphrase, MOCK.user.email);
          
          // Save passphrase to session for convenience
          sessionStorage.setItem('zk_passphrase', passphrase);
          
          const blob = new Blob([decryptedBuffer], { type: 'application/octet-stream' });
          const downloadUrl = window.URL.createObjectURL(blob);
          
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = name;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(downloadUrl);
          
          showToast('Decrypted download complete', 'success');
        } catch (err) {
          showToast('Decryption failed: ' + err.message, 'error');
        }
      };
      
      const cachedPass = sessionStorage.getItem('zk_passphrase');
      if (cachedPass) {
        await decryptAndDownload(cachedPass);
      } else {
        promptPassphraseModal(name, decryptAndDownload);
      }
      return;
    }
    
    // Normal download flow
    showToast(`Decrypting AES-256 blocks for ${name}...`, 'info');
    const token = localStorage.getItem('nyxvault_token');
    const response = await fetch(apiCallUrl(`/api/files/download/${id}`), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Decryption file fetch failure');

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
    
    showToast('Secure download complete', 'success');
  } catch (err) {
    showToast('Download failure: ' + err.message, 'error');
  }
};

window.handleFileDelete = async (id, name) => {
  if (!confirm(`Permanently shred and delete "${name}" from secure cloud nodes?`)) return;
  try {
    await apiCall(`/api/files/${id}`, { method: 'DELETE' });
    showToast(`Shredded ${name}`, 'success');
    
    // Refresh files manager list
    const freshStats = await apiCall('/api/stats');
    Object.assign(MOCK, freshStats);
    const allFiles = await apiCall('/api/files');
    MOCK.allFiles = allFiles;
    const params = [];
    if (window._selectedFolder) params.push(`folder=${encodeURIComponent(window._selectedFolder)}`);
    if (window._searchQuery) params.push(`search=${encodeURIComponent(window._searchQuery)}`);
    const queryStr = params.length > 0 ? `?${params.join('&')}` : '';
    const files = await apiCall(`/api/files${queryStr}`);
    MOCK.files = files;
    routeChange();
  } catch (err) {
    showToast('Delete failed: ' + err.message, 'error');
  }
};

// =============================================
// SECURE SHARE LINKS
// =============================================
window.handleFileShareDialog = (id, name) => {
  navigate('sharing');
  setTimeout(() => {
    const fileSel = document.getElementById('share-file-select');
    if (fileSel) {
      fileSel.value = id;
    }
  }, 150);
};

window.handleCreateShareLink = async () => {
  const fileSelect = document.getElementById('share-file-select');
  const recipientsInput = document.getElementById('share-recipients');
  const expiryInput = document.getElementById('share-expiry');

  if (!fileSelect || !fileSelect.value) {
    showToast('No file selected', 'warning');
    return;
  }

  try {
    const permissionSelect = document.getElementById('share-permission');
    const oneTimeCheckbox = document.getElementById('share-one-time');
    const passwordInput = document.getElementById('share-password');
    const maxDownloadsInput = document.getElementById('share-max-downloads');

    await apiCall('/api/sharing', {
      method: 'POST',
      body: JSON.stringify({
        fileId: fileSelect.value,
        recipients: recipientsInput ? recipientsInput.value : '',
        expiry: expiryInput ? expiryInput.value : '',
        permission: permissionSelect ? permissionSelect.value : 'download',
        oneTime: oneTimeCheckbox ? oneTimeCheckbox.checked : false,
        password: passwordInput ? passwordInput.value : '',
        maxDownloads: maxDownloadsInput && maxDownloadsInput.value ? parseInt(maxDownloadsInput.value, 10) : null
      })
    });

    showToast('Share link created successfully!', 'success');
    if (recipientsInput) recipientsInput.value = '';
    if (passwordInput) passwordInput.value = '';
    if (maxDownloadsInput) maxDownloadsInput.value = '';
    if (oneTimeCheckbox) oneTimeCheckbox.checked = false;
    
    // Refresh sharing page list
    const shares = await apiCall('/api/sharing');
    MOCK.shareLinks = shares;
    routeChange();
  } catch (err) {
    showToast('Failed to create link: ' + err.message, 'error');
  }
};

window.handleEditPolicy = () => {
  const role = MOCK.user.role || 'Developer';
  if (role !== 'Admin' && role !== 'Manager') {
    showToast('Forbidden: Administrator or Manager privileges required to edit access control policy.', 'error');
    return;
  }

  const userPlan = MOCK.user.plan || 'Enterprise';
  
  // Current values
  const maxDays = MOCK.user.policy_max_lifetime !== undefined ? MOCK.user.policy_max_lifetime : (userPlan === 'Enterprise' ? 90 : userPlan === 'Starter' ? 7 : 30);
  const defaultPermVal = MOCK.user.policy_default_permission || (userPlan === 'Starter' ? 'view' : 'download');
  const ipWhitelist = MOCK.user.policy_ip_whitelist || (userPlan === 'Enterprise' ? 'Enabled (Corporate Range)' : userPlan === 'Starter' ? 'Not Supported' : 'Disabled');
  const geoRestrict = MOCK.user.policy_geo_restriction || (userPlan === 'Enterprise' ? 'Strict (US, EU, APAC)' : userPlan === 'Starter' ? 'Disabled' : 'US, EU only');
  const mfaReq = MOCK.user.policy_mfa_requirement || (userPlan === 'Enterprise' ? 'Enforced (Mandatory)' : userPlan === 'Starter' ? 'Optional' : 'Enforce for external');

  const overlay = document.createElement('div');
  overlay.className = 'preview-overlay show';
  
  const closeModal = () => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
  };
  
  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };
  
  // Limit values depending on plan
  const maxLtAllowed = userPlan === 'Enterprise' ? 90 : userPlan === 'Starter' ? 7 : 30;

  overlay.innerHTML = `
    <div class="preview-modal" style="max-width:520px;height:auto;padding:24px;border-radius:16px;">
      <div class="preview-header" style="border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:12px;margin-bottom:18px">
        <div class="preview-title-wrapper">
          <span style="font-size:24px">🛡️</span>
          <div>
            <div class="preview-title" style="font-size:16px">Edit Access Control Policy</div>
            <div class="preview-subtitle" style="font-size:11px;color:var(--text-muted)">Configure sharing restrictions & compliance settings</div>
          </div>
        </div>
        <button class="preview-close" style="font-size:24px;background:none;border:none;color:var(--text-muted);cursor:pointer">&times;</button>
      </div>
      <div class="preview-body" style="padding:0">
        <div style="display:flex;flex-direction:column;gap:16px;font-size:13px">
          
          <div class="form-group">
            <label class="form-label" style="display:flex;justify-content:space-between">
              <span>Max Link Lifetime</span>
              <span id="lifetime-val" style="color:var(--cyan);font-weight:600">${maxDays} days</span>
            </label>
            <input type="range" id="policy-edit-lifetime" min="1" max="${maxLtAllowed}" value="${maxDays}" 
                   oninput="document.getElementById('lifetime-val').innerText = this.value + ' days'" 
                   style="width:100%;margin-top:8px;accent-color:var(--cyan);cursor:pointer" />
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px">Max allowed for ${userPlan} plan: ${maxLtAllowed} days</div>
          </div>

          <div class="form-group">
            <label class="form-label">Default Share Permissions</label>
            <select id="policy-edit-permission" class="form-select" style="width:100%;margin-top:6px" ${userPlan === 'Starter' ? 'disabled' : ''}>
              <option value="download" ${defaultPermVal === 'download' ? 'selected' : ''}>View & Download</option>
              <option value="view" ${defaultPermVal === 'view' ? 'selected' : ''}>View Only</option>
            </select>
            ${userPlan === 'Starter' ? '<div style="font-size:11px;color:var(--text-muted);margin-top:4px">Locked to View Only on Starter plan</div>' : ''}
          </div>

          <div class="form-group">
            <label class="form-label">IP Whitelist</label>
            <input type="text" id="policy-edit-ip" class="form-input" style="width:100%;margin-top:6px" 
                   value="${ipWhitelist}" ${userPlan === 'Starter' ? 'disabled' : ''} 
                   placeholder="e.g. 192.168.1.1, 10.0.0.0/24 or Disabled" />
            ${userPlan === 'Starter' ? '<div style="font-size:11px;color:var(--text-muted);margin-top:4px">Not supported on Starter plan</div>' : ''}
          </div>

          <div class="form-group">
            <label class="form-label">Geo-Restriction</label>
            <input type="text" id="policy-edit-geo" class="form-input" style="width:100%;margin-top:6px" 
                   value="${geoRestrict}" ${userPlan === 'Starter' ? 'disabled' : ''} 
                   placeholder="e.g. US, EU or Disabled" />
            ${userPlan === 'Starter' ? '<div style="font-size:11px;color:var(--text-muted);margin-top:4px">Not supported on Starter plan</div>' : ''}
          </div>

          <div class="form-group">
            <label class="form-label">MFA Requirement</label>
            <select id="policy-edit-mfa" class="form-select" style="width:100%;margin-top:6px" ${userPlan === 'Starter' ? 'disabled' : ''}>
              <option value="Optional" ${mfaReq === 'Optional' ? 'selected' : ''}>Optional</option>
              <option value="Enforce for external" ${mfaReq === 'Enforce for external' ? 'selected' : ''}>Enforce for external</option>
              <option value="Mandatory" ${mfaReq === 'Mandatory' ? 'selected' : ''}>Mandatory (All users)</option>
            </select>
            ${userPlan === 'Starter' ? '<div style="font-size:11px;color:var(--text-muted);margin-top:4px">Locked to Optional on Starter plan</div>' : ''}
          </div>

        </div>
        <div style="margin-top:24px;display:flex;gap:12px">
          <button class="btn btn-ghost" style="flex:1" id="policy-edit-cancel-btn">Cancel</button>
          <button class="btn btn-primary" style="flex:1" id="policy-edit-save-btn">Save Policy</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.querySelector('.preview-close').onclick = closeModal;
  overlay.querySelector('#policy-edit-cancel-btn').onclick = closeModal;

  overlay.querySelector('#policy-edit-save-btn').onclick = async () => {
    const saveBtn = overlay.querySelector('#policy-edit-save-btn');
    saveBtn.disabled = true;
    saveBtn.innerText = 'Saving...';

    const lifetimeInput = overlay.querySelector('#policy-edit-lifetime');
    const permissionSelect = overlay.querySelector('#policy-edit-permission');
    const ipInput = overlay.querySelector('#policy-edit-ip');
    const geoInput = overlay.querySelector('#policy-edit-geo');
    const mfaSelect = overlay.querySelector('#policy-edit-mfa');

    try {
      const result = await apiCall('/api/sharing/policy', {
        method: 'PUT',
        body: JSON.stringify({
          maxLifetime: parseInt(lifetimeInput.value, 10),
          defaultPermission: permissionSelect.value,
          ipWhitelist: ipInput.value,
          geoRestriction: geoInput.value,
          mfaRequirement: mfaSelect.value
        })
      });

      // Update MOCK.user
      MOCK.user.policy_max_lifetime = result.policy.maxLifetime;
      MOCK.user.policy_default_permission = result.policy.defaultPermission;
      MOCK.user.policy_ip_whitelist = result.policy.ipWhitelist;
      MOCK.user.policy_geo_restriction = result.policy.geoRestriction;
      MOCK.user.policy_mfa_requirement = result.policy.mfaRequirement;

      // Update local storage user copy
      localStorage.setItem('nyxvault_user', JSON.stringify(MOCK.user));

      showToast('Access Control Policy updated and audited!', 'success');
      closeModal();
      routeChange(); // Refresh page to show updated policy values and form constraints
    } catch (err) {
      showToast('Failed to save policy: ' + err.message, 'error');
      saveBtn.disabled = false;
      saveBtn.innerText = 'Save Policy';
    }
  };
};

window.handleRevokeShareLink = async (id) => {
  if (!confirm('Immediately revoke external sharing access for this token?')) return;
  try {
    await apiCall(`/api/sharing/${id}`, { method: 'DELETE' });
    showToast('Access link revoked', 'warning');
    
    const shares = await apiCall('/api/sharing');
    MOCK.shareLinks = shares;
    routeChange();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.handleToggleShareFilter = () => {
  const modes = ['all', 'active', 'expired'];
  const currentIdx = modes.indexOf(window._shareFilterMode || 'all');
  const nextIdx = (currentIdx + 1) % modes.length;
  window._shareFilterMode = modes[nextIdx];
  showToast(`Sharing filter: ${window._shareFilterMode.toUpperCase()}`, 'info');
  routeChange();
};

window.handleExportShareAudit = () => {
  const shares = MOCK.shareLinks || [];
  if (shares.length === 0) {
    showToast('No share links to export', 'warning');
    return;
  }
  let csv = 'ID,File,Recipients,Permission,One-Time,Expiry,Views,Downloads,Status,Token\n';
  shares.forEach(s => {
    const rec = s.recipients ? s.recipients.join(';') : '';
    csv += `"${s.id}","${s.file}","${rec}","${s.permission}",${s.oneTime},"${s.expiry}",${s.views},${s.dl},"${s.status}","${s.token}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `nyxvault_share_audit_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('Share audit exported successfully', 'success');
};

// =============================================
// FILE INTEGRITY ACTIONS
// =============================================
window.handleRunIntegrityScan = async () => {
  showToast('Initiating server-wide SHA-256 ledger verification...', 'info');
  try {
    const res = await apiCall('/api/integrity/scan', { method: 'POST' });
    
    const freshStats = await apiCall('/api/stats');
    Object.assign(MOCK, freshStats);
    const integrity = await apiCall('/api/integrity');
    MOCK.integrityFiles = integrity.files;
    routeChange();

    if (res.tamperedDetected > 0) {
      showToast(`Warning: Detected ${res.tamperedDetected} compromised files!`, 'error');
    } else {
      showToast('All storage nodes matching database audit signatures.', 'success');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.handleQuarantineFile = async (id) => {
  try {
    await apiCall(`/api/integrity/quarantine/${id}`, { method: 'POST' });
    showToast('File isolated and quarantined.', 'warning');
    
    const freshStats = await apiCall('/api/stats');
    Object.assign(MOCK, freshStats);
    const integrity = await apiCall('/api/integrity');
    MOCK.integrityFiles = integrity.files;
    routeChange();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.handleRestoreBackup = async (id) => {
  try {
    await apiCall(`/api/integrity/restore/${id}`, { method: 'POST' });
    showToast('Decentralized backup replica restored successfully.', 'success');
    
    const freshStats = await apiCall('/api/stats');
    Object.assign(MOCK, freshStats);
    const integrity = await apiCall('/api/integrity');
    MOCK.integrityFiles = integrity.files;
    routeChange();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// =============================================
// ALERTS, PROFILES & ADMIN PANEL
// =============================================
window.handleResolveAlert = async (id) => {
  try {
    await apiCall(`/api/alerts/${id}/resolve`, { method: 'POST' });
    showToast('Alert resolved and archived.', 'success');
    
    const freshStats = await apiCall('/api/stats');
    Object.assign(MOCK, freshStats);
    const alerts = await apiCall('/api/alerts');
    MOCK.alerts = alerts;
    routeChange();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

window.handleSaveProfile = async () => {
  const firstName = document.getElementById('profile-first-name')?.value || '';
  const lastName = document.getElementById('profile-last-name')?.value || '';
  const timezone = document.querySelector('.form-select')?.value || '';
  const bio = document.querySelector('.form-textarea')?.value || '';
  const mfa = document.getElementById('profile-toggle-mfa')?.checked || false;
  const watermark = document.getElementById('profile-toggle-watermark')?.checked || false;

  try {
    const updatedUser = await apiCall('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify({
        name: `${firstName} ${lastName}`.trim(),
        timezone,
        bio,
        mfa,
        watermark
      })
    });
    
    Object.assign(MOCK.user, updatedUser);
    localStorage.setItem('nyxvault_user', JSON.stringify(MOCK.user));
    showToast('Profile configuration updated', 'success');
    routeChange();
  } catch (err) {
    showToast('Save failed: ' + err.message, 'error');
  }
};

window.showMfaSetupWizard = async () => {
  const overlay = document.createElement('div');
  overlay.className = 'preview-overlay show';
  overlay.style.zIndex = '10000';
  
  overlay.innerHTML = `
    <div class="preview-modal" style="max-width: 450px; padding: 28px; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; margin: auto; box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.65);">
      <h3 style="color: white; margin-bottom: 12px; font-size: 20px; display: flex; align-items: center; gap: 10px; font-family: var(--font-display);">
        🛡️ Enable Multi-Factor Authentication
      </h3>
      <p style="color: var(--text-secondary); font-size: 13.5px; margin-bottom: 20px; line-height: 1.5">
        Protect your NyxVault account by requiring a temporary 6-digit verification code from an authenticator app during login.
      </p>
      
      <div id="mfa-wizard-content" style="margin-bottom: 24px;">
        <div style="display:flex; justify-content:center; padding:20px 0">
          <div style="font-size:48px; filter: drop-shadow(0 0 10px rgba(0,212,255,0.3));">📱</div>
        </div>
        <p style="color: var(--text-muted); font-size: 12px; text-align: center; margin: 0">
          Step 1: Click the button below to generate a new secure authenticator key.
        </p>
      </div>

      <div style="display: flex; gap: 12px; justify-content: flex-end;" id="mfa-wizard-buttons">
        <button class="btn btn-secondary btn-sm" id="mfa-cancel-btn" style="background:transparent;border:1px solid rgba(255,255,255,0.15);color:white">Cancel</button>
        <button class="btn btn-primary btn-sm" id="mfa-next-btn" style="background:var(--cyan);color:black;border:none;font-weight:600">⚡ Generate Key</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  const mfaCancelBtn = overlay.querySelector('#mfa-cancel-btn');
  const mfaNextBtn = overlay.querySelector('#mfa-next-btn');
  const contentDiv = overlay.querySelector('#mfa-wizard-content');
  
  mfaCancelBtn.onclick = () => {
    overlay.remove();
    const mfaToggle = document.getElementById('profile-toggle-mfa');
    if (mfaToggle) mfaToggle.checked = false;
  };
  
  mfaNextBtn.onclick = async () => {
    mfaNextBtn.disabled = true;
    mfaNextBtn.innerHTML = '⏳ Generating...';
    try {
      const data = await apiCall('/api/auth/mfa/setup', { method: 'POST' });
      const secret = data.secret;
      const qrCodeUrl = data.qrCodeUrl;
      
      contentDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 16px;">
          <p style="color: var(--text-secondary); font-size: 13px; line-height: 1.5; margin-bottom: 16px;">
            Step 2: Scan this QR code with Google Authenticator or any TOTP app, or enter the secret key manually.
          </p>
          <div style="background: white; padding: 12px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-bottom: 14px;">
            <img src="${qrCodeUrl}" style="width: 150px; height: 150px; display: block;" alt="MFA QR Code" />
          </div>
          <div style="font-family: monospace; font-size: 13px; color: var(--cyan); background: rgba(0,212,255,0.06); padding: 8px 12px; border-radius: 6px; border: 1px solid rgba(0,212,255,0.15); word-break: break-all; margin-top: 6px;">
            Secret Key: ${secret}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" style="font-size: 12px; color: white;">Step 3: Enter the 6-digit code shown in your app</label>
          <input type="text" id="mfa-verify-code" class="form-select" style="text-align: center; font-size: 18px; letter-spacing: 6px; background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); width: 100%; box-sizing: border-box; padding: 10px; border-radius: 8px;" placeholder="000000" maxlength="6" autofocus />
        </div>
      `;
      
      mfaNextBtn.innerHTML = '🔑 Enable MFA';
      mfaNextBtn.disabled = false;
      
      mfaNextBtn.onclick = async () => {
        const codeInput = overlay.querySelector('#mfa-verify-code');
        const code = codeInput ? codeInput.value.trim() : '';
        if (code.length !== 6 || isNaN(code)) {
          showToast('Please enter a valid 6-digit code', 'warning');
          return;
        }
        
        mfaNextBtn.disabled = true;
        mfaNextBtn.innerHTML = '⏳ Verifying...';
        
        try {
          await apiCall('/api/auth/mfa/enable', {
            method: 'POST',
            body: JSON.stringify({ secret, code })
          });
          
          showToast('Multi-Factor Authentication enabled successfully!', 'success');
          overlay.remove();
          
          MOCK.user.mfa = true;
          MOCK.user.mfa_enabled = true;
          localStorage.setItem('nyxvault_user', JSON.stringify(MOCK.user));
          routeChange();
        } catch (err) {
          showToast('MFA Activation failed: ' + err.message, 'error');
          mfaNextBtn.disabled = false;
          mfaNextBtn.innerHTML = '🔑 Enable MFA';
        }
      };
      
    } catch (err) {
      showToast('MFA setup failed: ' + err.message, 'error');
      overlay.remove();
      const mfaToggle = document.getElementById('profile-toggle-mfa');
      if (mfaToggle) mfaToggle.checked = false;
    }
  };
};

window.handleMfaToggle = async (checkbox) => {
  if (checkbox.checked) {
    checkbox.checked = false;
    window.showMfaSetupWizard();
  } else {
    if (confirm('⚠️ WARNING: Disabling Multi-Factor Authentication will reduce your account security. Are you sure you want to disable MFA?')) {
      try {
        await apiCall('/api/auth/mfa/disable', { method: 'POST' });
        showToast('Multi-Factor Authentication deactivated', 'warning');
        MOCK.user.mfa = false;
        MOCK.user.mfa_enabled = false;
        localStorage.setItem('nyxvault_user', JSON.stringify(MOCK.user));
        routeChange();
      } catch (err) {
        showToast('Failed to disable MFA: ' + err.message, 'error');
        checkbox.checked = true;
      }
    } else {
      checkbox.checked = true;
    }
  }
};

window.handleTerminateSession = async (sessionId) => {
  try {
    await apiCall(`/api/auth/sessions/${sessionId}/terminate`, { method: 'POST' });
    showToast('Session terminated', 'warning');
    const sessions = await apiCall('/api/auth/sessions');
    MOCK.sessions = sessions;
    routeChange();
  } catch (err) {
    showToast('Revocation failed: ' + err.message, 'error');
  }
};

window.handleTerminateOtherSessions = async () => {
  try {
    await apiCall('/api/auth/sessions/terminate-others', { method: 'POST' });
    showToast('All other sessions terminated', 'warning');
    const sessions = await apiCall('/api/auth/sessions');
    MOCK.sessions = sessions;
    routeChange();
  } catch (err) {
    showToast('Revocation failed: ' + err.message, 'error');
  }
};

window.handleSuspendUser = async (id, status) => {
  const nextStatus = status === 'suspended' ? 'active' : 'suspended';
  if (!confirm(`Change administrator access state for this identity to ${nextStatus}?`)) return;
  try {
    await apiCall(`/api/admin/users/${id}/status`, {
      method: 'POST',
      body: JSON.stringify({ status: nextStatus })
    });
    
    showToast(`User privileges updated to ${nextStatus}`, 'success');
    const users = await apiCall('/api/admin/users');
    MOCK.adminUsers = users;
    routeChange();
  } catch (err) {
    showToast(err.message, 'error');
  }
};

// =============================================
// AUTH HANDLERS
// =============================================
window._loginMfaRequired = false;
window._loginMfaEmail = '';

window.cancelLoginMfa = () => {
  window._loginMfaRequired = false;
  window._loginMfaEmail = '';
  routeChange();
};

window.handleLoginMfaVerify = async () => {
  const codeInput = document.getElementById('login-mfa-code');
  const btn = document.getElementById('login-mfa-btn');
  if (!codeInput) return;

  const code = codeInput.value.trim();
  if (code.length !== 6 || isNaN(code)) {
    showToast('Please enter a 6-digit verification code', 'warning');
    return;
  }

  if (btn) {
    btn.innerHTML = '⏳ Verifying Code…';
    btn.disabled = true;
  }

  try {
    const data = await apiCall('/api/auth/login/mfa', {
      method: 'POST',
      body: JSON.stringify({ email: window._loginMfaEmail, code })
    });

    localStorage.setItem('nyxvault_token', data.token);
    localStorage.setItem('nyxvault_user', JSON.stringify(data.user));
    Object.assign(MOCK.user, data.user);

    window._loginMfaRequired = false;
    window._loginMfaEmail = '';

    // Connect Socket.IO for real-time alerts
    _initSocketIO(data.token);

    showToast(`Access granted. Welcome back, ${data.user.name}!`, 'success');
    navigate('dashboard');
  } catch (err) {
    showToast('Verification failed: ' + err.message, 'error');
    if (btn) {
      btn.innerHTML = 'Verify &amp; Access Vault';
      btn.disabled = false;
    }
  }
};

window.handleLogin = async () => {
  const emailInput = document.getElementById('login-email');
  const passInput = document.getElementById('login-pass');
  const btn = document.getElementById('login-btn');

  if (!emailInput || !passInput) return;

  const email = emailInput.value;
  const password = passInput.value;

  if (btn) {
    btn.innerHTML = '⏳ Accessing Secure Vault Node…';
    btn.disabled = true;
  }

  try {
    const data = await apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (data.mfaRequired) {
      window._loginMfaRequired = true;
      window._loginMfaEmail = data.email;
      showToast('Two-factor authentication required', 'info');
      routeChange();
      return;
    }

    localStorage.setItem('nyxvault_token', data.token);
    localStorage.setItem('nyxvault_user', JSON.stringify(data.user));
    Object.assign(MOCK.user, data.user);

    // Connect Socket.IO for real-time alerts
    _initSocketIO(data.token);

    showToast(`Access granted. Welcome back, ${data.user.name}!`, 'success');
    navigate('dashboard');
  } catch (err) {
    showToast('Access Denied: ' + err.message, 'error');
    if (btn) {
      btn.innerHTML = '🔒 Sign In Securely';
      btn.disabled = false;
    }
  }
};

window.handleRegister = async () => {
  const emailInput = document.querySelector('input[type="email"]');
  const passInput = document.getElementById('reg-pass');
  const firstNameInput = document.querySelector('input[placeholder="Alex"]');
  const lastNameInput = document.querySelector('input[placeholder="Ryder"]');
  const orgInput = document.querySelector('input[placeholder="Acme Corp"]');

  if (!emailInput || !passInput || !emailInput.value || !passInput.value) {
    showToast('Please fill all required registration blocks.', 'warning');
    return;
  }

  try {
    const data = await apiCall('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: emailInput.value,
        password: passInput.value,
        firstName: firstNameInput ? firstNameInput.value : '',
        lastName: lastNameInput ? lastNameInput.value : '',
        organization: orgInput ? orgInput.value : '',
        plan: 'Enterprise'
      })
    });

    localStorage.setItem('nyxvault_token', data.token);
    localStorage.setItem('nyxvault_user', JSON.stringify(data.user));
    Object.assign(MOCK.user, data.user);

    showToast('Decentralized vault provisioned successfully!', 'success');
    navigate('dashboard');
  } catch (err) {
    showToast('Registration failed: ' + err.message, 'error');
  }
};

window.handleGoogleLogin = async () => {
  const btn = document.getElementById('google-login-btn');
  if (!btn) return;
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `⏳ Connecting to Google...`;
  
  // Safety timeout to prevent getting stuck if Google prompt fails or is blocked by credentials
  const safetyTimeout = setTimeout(() => {
    if (btn.disabled && btn.innerHTML.includes('Connecting')) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
      showToast('Google login timed out. Opening sandbox chooser...', 'warning');
      showGoogleMockModal();
    }
  }, 4000);
  
  try {
    const config = await apiCall('/api/auth/google/config').catch(() => ({ clientId: null }));
    
    if (config.clientId && window.google) {
      window.google.accounts.id.initialize({
        client_id: config.clientId,
        callback: async (response) => {
          clearTimeout(safetyTimeout);
          try {
            btn.innerHTML = `⏳ Authenticating secure session...`;
            const result = await apiCall('/api/auth/google', {
              method: 'POST',
              body: JSON.stringify({ token: response.credential })
            });
            
            showToast('Signed in with Google successfully', 'success');
            localStorage.setItem('nyxvault_token', result.token);
            localStorage.setItem('nyxvault_user', JSON.stringify(result.user));
            Object.assign(MOCK.user, result.user);
            _initSocketIO(result.token);
            navigate('dashboard');
          } catch (err) {
            showToast('Google authentication failed: ' + err.message, 'error');
            btn.disabled = false;
            btn.innerHTML = originalHtml;
          }
        }
      });
      
      window.google.accounts.id.prompt((notification) => {
        // If Google One Tap is dismissed, skipped, or fails to display (e.g. invalid client/origin)
        if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
          clearTimeout(safetyTimeout);
          btn.disabled = false;
          btn.innerHTML = originalHtml;
          
          // Fall back to sandbox chooser on prompt display failures
          if (notification.isNotDisplayed()) {
            showToast('Google OAuth blocked. Opening sandbox chooser...', 'info');
            showGoogleMockModal();
          }
        }
      });
    } else {
      clearTimeout(safetyTimeout);
      btn.innerHTML = originalHtml;
      btn.disabled = false;
      showGoogleMockModal();
    }
  } catch (err) {
    clearTimeout(safetyTimeout);
    showToast('Failed to initialize Google login: ' + err.message, 'error');
    btn.disabled = false;
    btn.innerHTML = originalHtml;
  }
};

function showGoogleMockModal() {
  const overlay = document.createElement('div');
  overlay.className = 'preview-overlay show';
  
  const closeModal = () => {
    overlay.classList.remove('show');
    setTimeout(() => overlay.remove(), 300);
  };

  overlay.onclick = (e) => {
    if (e.target === overlay) closeModal();
  };

  // Google vector logo
  const googleLogo = `
    <svg viewBox="0 0 24 24" width="24" height="24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  `;

  overlay.innerHTML = `
    <div class="google-modal">
      <div class="preview-header" style="border-bottom:none;padding:0;margin-bottom:16px;display:flex;justify-content:center;position:relative">
        <div style="text-align:center">
          <div style="display:inline-flex;padding:8px;background:rgba(255,255,255,0.04);border-radius:50%;margin-bottom:8px">
            ${googleLogo}
          </div>
          <div class="preview-title" style="font-size:18px;font-weight:600;color:var(--text-primary)">Choose an account</div>
          <div class="preview-subtitle" style="font-size:12px;color:var(--text-muted);margin-top:4px">to continue to <span style="color:var(--text-primary);font-weight:600">NyxVault</span></div>
          <div class="google-brand-line"></div>
        </div>
        <button class="preview-close" style="font-size:20px;background:none;border:none;color:var(--text-muted);cursor:pointer;position:absolute;top:0;right:0;padding:0">&times;</button>
      </div>
      <div class="preview-body" style="padding:0;text-align:center">
        <p style="font-size:11px;color:var(--text-secondary);margin-bottom:18px;background:rgba(66,133,244,0.05);border:1px dashed rgba(66,133,244,0.2);padding:8px;border-radius:6px">
          Sandbox Active: Simulating Google Identity Services callback flow.
        </p>

        <div class="google-account-list" style="display:flex;flex-direction:column;gap:10px">
          <!-- Seed Account 1 -->
          <div class="google-account-item" id="google-seed-1">
            <div class="google-avatar" style="background:#00d4ff">AR</div>
            <div class="google-account-details">
              <div class="google-account-name">Alex Ryder</div>
              <div class="google-account-email">alex.ryder@nyxvault.io</div>
            </div>
            <span class="badge badge-cyan" style="font-size:9px">Admin</span>
          </div>

          <!-- Seed Account 2 -->
          <div class="google-account-item" id="google-seed-2">
            <div class="google-avatar" style="background:#00ff88">SP</div>
            <div class="google-account-details">
              <div class="google-account-name">Saanvi Patel</div>
              <div class="google-account-email">s.patel@corp.io</div>
            </div>
            <span class="badge badge-purple" style="font-size:9px">Dev</span>
          </div>

          <!-- Custom Account Trigger -->
          <div class="google-account-item" id="google-use-custom">
            <div class="google-avatar google-avatar-custom">+</div>
            <div class="google-account-details">
              <div class="google-account-name">Use another account</div>
            </div>
          </div>
        </div>

        <!-- Custom Account Form -->
        <div id="google-custom-form" class="google-custom-card" style="display:none">
          <div class="form-group" style="margin-bottom:14px">
            <label class="form-label" style="font-size:11px;color:var(--text-secondary)">Email Address</label>
            <input class="form-input google-input-focus" type="email" id="mock-google-email" placeholder="user@gmail.com" style="width:100%;box-sizing:border-box" />
          </div>
          <button class="btn btn-primary" id="mock-google-submit" style="width:100%;display:flex;align-items:center;justify-content:center;gap:8px;white-space:normal;text-align:center;padding:10px 12px;font-size:13px">
            ${ICONS.profile} Authorize & Sign In
          </button>
        </div>

        <div class="google-footer-text">
          To continue, Google will share your name, email address, language preference, and profile picture with NyxVault.
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  overlay.querySelector('.preview-close').onclick = closeModal;

  // Global handler for selecting a mock account
  window.handleMockGoogleSelect = async (email) => {
    const container = overlay.querySelector('.preview-body');
    if (!container) return;
    
    container.innerHTML = `
      <div style="text-align:center;padding:32px 10px">
        <div style="width:32px;height:32px;border:3px solid rgba(255,255,255,0.1);border-top-color:#4285F4;border-radius:50%;animation:google-spin 0.8s linear infinite;margin:0 auto 16px"></div>
        <div style="font-size:13px;color:var(--text-primary);font-weight:600">Signing in with Google...</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:4px">${email}</div>
      </div>
    `;
    
    try {
      const mockToken = `mock-google-token-${email}`;
      const result = await apiCall('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify({ token: mockToken })
      });
      
      closeModal();
      showToast(`Successfully authenticated as ${email} via Google sandbox`, 'success');
      localStorage.setItem('nyxvault_token', result.token);
      localStorage.setItem('nyxvault_user', JSON.stringify(result.user));
      Object.assign(MOCK.user, result.user);
      _initSocketIO(result.token);
      navigate('dashboard');
    } catch (err) {
      showToast('Sandbox auth failed: ' + err.message, 'error');
      closeModal();
      showGoogleMockModal(); // Re-open on error
    }
  };

  // Click bindings
  overlay.querySelector('#google-seed-1').onclick = () => window.handleMockGoogleSelect('alex.ryder@nyxvault.io');
  overlay.querySelector('#google-seed-2').onclick = () => window.handleMockGoogleSelect('s.patel@corp.io');

  const useCustomBtn = overlay.querySelector('#google-use-custom');
  const customForm = overlay.querySelector('#google-custom-form');
  if (useCustomBtn && customForm) {
    useCustomBtn.onclick = () => {
      useCustomBtn.style.display = 'none';
      customForm.style.display = 'block';
      const emailInput = overlay.querySelector('#mock-google-email');
      if (emailInput) emailInput.focus();
    };
  }

  const submitBtn = overlay.querySelector('#mock-google-submit');
  if (submitBtn) {
    submitBtn.onclick = () => {
      const emailInput = overlay.querySelector('#mock-google-email');
      const email = emailInput ? emailInput.value.trim() : '';
      if (!email || !email.includes('@')) {
        showToast('Please enter a valid email address', 'warning');
        return;
      }
      window.handleMockGoogleSelect(email);
    };
  }
}

window.updatePasswordStrength = (val) => {
  const bars = document.querySelectorAll('.ps-bar');
  const label = document.getElementById('pass-strength-label');
  if (!bars.length) return;
  let score = 0;
  if (val.length >= 8)  score++;
  if (val.length >= 12) score++;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
  if (/[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val)) score++;

  const colors = ['var(--danger)', 'var(--warning)', '#ffcc44', 'var(--success)'];
  const labels = ['Weak Credentials', 'Fair protection', 'Good safety', 'Strong Cryptographic Key 🛡️'];
  bars.forEach((b, i) => {
    b.style.background = i < score ? colors[Math.min(score-1, 3)] : 'rgba(255,255,255,0.08)';
    b.style.boxShadow = i < score ? `0 0 6px ${colors[Math.min(score-1, 3)]}` : '';
  });
  if (label) {
    label.textContent = score > 0 ? `Password strength: ${labels[Math.min(score-1, 3)]}` : 'Enter a strong password';
    label.style.color = score > 0 ? colors[Math.min(score-1, 3)] : 'var(--text-muted)';
  }
};

// =============================================
// FILE UPLOAD HANDLERS
// =============================================
window.activeUploads = window.activeUploads || [];

window.handleFileSelect = (input) => {
  if (input.files && input.files.length > 0) {
    _processUploads(input.files);
    input.value = ''; // Reset input
  }
};

window.handleDrop = (e) => {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
    _processUploads(e.dataTransfer.files);
  }
};

// =============================================
// ZERO-KNOWLEDGE CRYPTOGRAPHY (WEB CRYPTO API)
// =============================================
window.toggleZkPassphraseField = (checked) => {
  const container = document.getElementById('zk-passphrase-container');
  if (container) {
    container.style.display = checked ? 'block' : 'none';
  }
};

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

async function deriveKEK(passphrase, salt) {
  const enc = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  return await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

async function encryptFileClientSide(file, passphrase, userEmail) {
  const fileBytes = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });

  const fileKey = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );

  const rawFileKey = await window.crypto.subtle.exportKey('raw', fileKey);
  const kek = await deriveKEK(passphrase, userEmail);

  const wrapIv = window.crypto.getRandomValues(new Uint8Array(12));
  const wrappedBuffer = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: wrapIv },
    kek,
    rawFileKey
  );

  const wrappedKeyString = arrayBufferToBase64(wrapIv) + ':' + arrayBufferToBase64(wrappedBuffer);

  const fileIv = window.crypto.getRandomValues(new Uint8Array(12));
  const fileCiphertext = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: fileIv },
    fileKey,
    fileBytes
  );

  const combinedBuffer = new Uint8Array(12 + fileCiphertext.byteLength);
  combinedBuffer.set(fileIv, 0);
  combinedBuffer.set(new Uint8Array(fileCiphertext), 12);

  const encryptedBlob = new Blob([combinedBuffer], { type: 'application/octet-stream' });
  return { encryptedBlob, wrappedKey: wrappedKeyString };
}

async function decryptFileClientSide(encryptedArrayBuffer, wrappedKeyString, passphrase, userEmail) {
  const parts = wrappedKeyString.split(':');
  if (parts.length !== 2) throw new Error('Invalid wrapped key format');
  
  const wrapIv = new Uint8Array(base64ToArrayBuffer(parts[0]));
  const wrappedCiphertext = new Uint8Array(base64ToArrayBuffer(parts[1]));

  const kek = await deriveKEK(passphrase, userEmail);

  let rawFileKey;
  try {
    rawFileKey = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: wrapIv },
      kek,
      wrappedCiphertext
    );
  } catch (e) {
    throw new Error('Failed to unwrap file key. Check if your passphrase is correct.');
  }

  const fileKey = await window.crypto.subtle.importKey(
    'raw',
    rawFileKey,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const fullBytes = new Uint8Array(encryptedArrayBuffer);
  if (fullBytes.byteLength < 12) throw new Error('Encrypted file payload is too short');
  
  const fileIv = fullBytes.slice(0, 12);
  const ciphertext = fullBytes.slice(12);

  return await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: fileIv },
    fileKey,
    ciphertext
  );
}

function promptPassphraseModal(filename, callback) {
  const overlay = document.createElement('div');
  overlay.className = 'preview-overlay show';
  overlay.style.zIndex = '10000';
  overlay.innerHTML = `
    <div class="preview-modal" style="max-width: 400px; padding: 24px; background: rgba(15, 23, 42, 0.95); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; margin: auto; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5);">
      <h3 style="color: white; margin-bottom: 12px; font-size: 18px; display: flex; align-items: center; gap: 8px;">
        🔐 Zero-Knowledge Decryption
      </h3>
      <p style="color: var(--text-secondary); font-size: 13px; margin-bottom: 16px;">
        Enter the private passphrase for <strong>${filename}</strong> to decrypt it client-side.
      </p>
      <div class="form-group" style="margin-bottom: 20px;">
        <input type="password" id="decrypt-passphrase-input" class="form-select" style="background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); width: 100%; box-sizing: border-box; padding: 8px; border-radius: 6px;" placeholder="Enter passphrase..." autofocus />
      </div>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button class="btn btn-secondary btn-sm" id="decrypt-cancel-btn" style="background:transparent;border:1px solid rgba(255,255,255,0.15);color:white">Cancel</button>
        <button class="btn btn-primary btn-sm" id="decrypt-submit-btn" style="background:var(--accent);color:black;border:none">🔑 Decrypt File</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  
  const input = overlay.querySelector('#decrypt-passphrase-input');
  input.focus();
  
  const close = () => {
    overlay.remove();
  };
  
  overlay.querySelector('#decrypt-cancel-btn').onclick = close;
  
  const submit = () => {
    const val = input.value;
    if (!val) {
      showToast('Passphrase cannot be empty', 'warning');
      return;
    }
    close();
    callback(val);
  };
  
  overlay.querySelector('#decrypt-submit-btn').onclick = submit;
  input.onkeydown = (e) => {
    if (e.key === 'Enter') submit();
  };
}

window._processUploads = async (fileList) => {
  const zkEnabled = document.getElementById('upload-zk-toggle')?.checked || false;
  const zkPassphrase = document.getElementById('upload-zk-passphrase')?.value || '';
  
  if (zkEnabled && !zkPassphrase) {
    showToast('Please enter an encryption passphrase for Zero-Knowledge security.', 'warning');
    return;
  }

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i];
    
    // Proactive frontend 64GB storage limit check
    const currentBytes = (MOCK.stats ? MOCK.stats.storageUsed : 0) * 1073741824;
    const LIMIT_BYTES = 64 * 1073741824;
    
    if (currentBytes + file.size > LIMIT_BYTES) {
      showToast(`Storage limit exceeded! Uploading "${file.name}" would exceed your 64GB free storage tier.`, 'error');
      continue;
    }
    
    const uploadState = {
      id: Date.now() + i,
      name: file.name,
      type: file.name.split('.').pop().toLowerCase() || 'doc',
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      pct: 0,
      status: zkEnabled ? 'encrypting' : 'uploading'
    };
    
    window.activeUploads.unshift(uploadState);
    if (window.location.hash === '#/upload') routeChange();
    
    try {
      const formData = new FormData();
      
      if (zkEnabled) {
        uploadState.status = 'encrypting';
        if (window.location.hash === '#/upload') routeChange();
        
        // Encrypt file client-side
        const { encryptedBlob, wrappedKey } = await encryptFileClientSide(file, zkPassphrase, MOCK.user.email);
        
        // Save passphrase to session for convenience
        sessionStorage.setItem('zk_passphrase', zkPassphrase);
        
        formData.append('file', encryptedBlob, file.name);
        formData.append('encrypted', 'true');
        formData.append('is_zero_knowledge', 'true');
        formData.append('wrapped_key', wrappedKey);
      } else {
        formData.append('file', file);
        formData.append('encrypted', 'true');
      }
      
      const progressInterval = setInterval(() => {
        if (uploadState.pct < 90) {
          uploadState.pct += Math.floor(Math.random() * 15) + 5;
          if (uploadState.pct > 90) uploadState.pct = 90;
          if (window.location.hash === '#/upload') routeChange();
        }
      }, 300);

      const res = await apiCall('/api/files/upload', {
        method: 'POST',
        body: formData
      });
      
      clearInterval(progressInterval);
      
      uploadState.pct = 100;
      uploadState.status = 'complete';
      showToast(`Uploaded ${file.name} successfully`, 'success');
      
      // Background refresh of file list
      apiCall('/api/files').then(data => {
        MOCK.allFiles = data;
        const params = [];
        if (window._selectedFolder) params.push(`folder=${encodeURIComponent(window._selectedFolder)}`);
        if (window._searchQuery) params.push(`search=${encodeURIComponent(window._searchQuery)}`);
        const queryStr = params.length > 0 ? `?${params.join('&')}` : '';
        apiCall(`/api/files${queryStr}`).then(filteredData => {
          MOCK.files = filteredData;
          if (window.location.hash === '#/files') routeChange();
        });
      });
      
    } catch (err) {
      uploadState.status = 'failed';
      showToast(`Failed to upload ${file.name}: ${err.message}`, 'error');
    }
    if (window.location.hash === '#/upload') routeChange();
  }
};

window.handleLogout = () => {
  localStorage.removeItem('nyxvault_token');
  localStorage.removeItem('nyxvault_user');
  showToast('Logged out securely. Keys wiped from memory.', 'success');
  navigate('login');
};

// =============================================
// SOCKET.IO CLIENT  (real-time alert push)
// =============================================

let _socket = null;

function _initSocketIO(token) {
  // Guard: only if Socket.IO library loaded
  if (typeof io === 'undefined') return;
  if (_socket && _socket.connected) return;

  _socket = io('/', { transports: ['websocket', 'polling'] });

  _socket.on('connect', () => {
    // Authenticate WebSocket session with JWT
    _socket.emit('join_room', { token });
  });

  _socket.on('room_joined', (d) => {
    console.log('[NyxVault] Socket joined room:', d.room);
  });

  _socket.on('new_alert', (alert) => {
    // Push the alert into local MOCK data
    MOCK.alerts.unshift(alert);
    _alertBadge++;

    // Severity-coloured toast
    const sevEmoji = alert.sev === 'critical' ? '🚨' : alert.sev === 'high' ? '⚠️' : alert.sev === 'medium' ? '🔵' : 'ℹ️';
    const toastType = alert.sev === 'critical' ? 'error' : alert.sev === 'high' ? 'warning' : 'info';
    showToast(`${sevEmoji} ${alert.title}`, toastType);

    // If the alerts page is open, refresh the list live
    if (window.location.hash === '#/alerts') {
      _fetchAlertStats().then(() => {
        // Update stats counters
        ['critical','high','medium','low'].forEach(k => {
          const el = document.getElementById(`alert-stat-${k}`);
          if (el) el.textContent = _alertStats[k] ?? 0;
        });
        
        // Update subtitle count
        const sub = document.getElementById('alert-subtitle');
        if (sub) {
          const active = (_alertStats.critical||0) + (_alertStats.high||0) + (_alertStats.medium||0) + (_alertStats.low||0);
          sub.textContent = `Real-time threat monitoring · ${active} active · ${_alertStats.total||0} total`;
        }
        
        // Check active filters
        const matchesSev = !_alertFilter.sev || alert.sev === _alertFilter.sev;
        const matchesType = !_alertFilter.type || alert.alertType === _alertFilter.type || alert.alert_type === _alertFilter.type;
        const matchesStatus = !_alertFilter.status || alert.status === _alertFilter.status;
        const searchInput = document.getElementById('alert-search');
        const search = searchInput ? searchInput.value.toLowerCase() : '';
        const matchesSearch = !search || alert.title.toLowerCase().includes(search) || (alert.desc||'').toLowerCase().includes(search);
        
        if (matchesSev && matchesType && matchesStatus && matchesSearch) {
          const listEl = document.getElementById('alert-list');
          if (listEl) {
            // Remove empty placeholder
            if (listEl.innerHTML.includes('No alerts match') || listEl.innerHTML.includes('Loading alerts')) {
              listEl.innerHTML = '';
            }
            
            const a = alert;
            const cardHtml = `
              <div class="alert-card-big ${a.sev} new-alert-glow" id="alert-row-${a.id}">
                <div style="flex-shrink:0;margin-top:2px">
                  <div style="width:36px;height:36px;border-radius:var(--r-sm);display:flex;align-items:center;justify-content:center;font-size:18px;
                    background:${a.sev==='critical'?'var(--danger-glass)':a.sev==='high'?'var(--warning-glass)':a.sev==='medium'?'rgba(0,212,255,0.1)':'var(--success-glass)'};
                    border:1px solid ${a.sev==='critical'?'rgba(255,51,102,0.3)':a.sev==='high'?'rgba(255,170,0,0.3)':a.sev==='medium'?'rgba(0,212,255,0.3)':'rgba(0,255,136,0.3)'}">
                    ${a.sev==='critical'?'🚨':a.sev==='high'?'⚠️':a.sev==='medium'?'🔵':'ℹ️'}
                  </div>
                </div>
                <div style="flex:1;min-width:0">
                  <div style="display:flex;align-items:center;gap:10px;margin-bottom:5px;flex-wrap:wrap">
                    <span style="font-size:14px;font-weight:600;color:var(--text-primary)">${a.title}</span>
                    <span class="alert-sev-badge sev-${a.sev}">${a.sev.toUpperCase()}</span>
                    <span class="badge badge-${statusBadge(a.status)}">${a.status}</span>
                    ${(a.alertType || a.alert_type) ? `<span class="badge badge-cyan" style="font-size:10px">${_alertTypeLabel(a.alertType || a.alert_type)}</span>` : ''}
                  </div>
                  <div style="font-size:12px;color:var(--text-secondary);margin-bottom:5px">${a.desc||''}</div>
                  <div style="font-size:11px;color:var(--text-muted)">${ICONS.logs} ${a.id} · ${a.time||a.timestamp||''}</div>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
                  <button class="btn btn-ghost btn-sm" onclick="window.handleAlertInvestigate('${a.id}')">${ICONS.eye} Investigate</button>
                  ${a.status !== 'resolved' ? `<button class="btn btn-ghost btn-sm" onclick="window._resolveAlert('${a.id}')">✅ Resolve</button>` : ''}
                </div>
              </div>`;
              
            listEl.insertAdjacentHTML('afterbegin', cardHtml);
          }
        }
      });
    }
  });

  _socket.on('disconnect', () => {
    console.log('[NyxVault] Socket disconnected');
  });
}

// Auto-reconnect if token exists (page refresh while logged in)
(function _autoConnect() {
  const token = localStorage.getItem('nyxvault_token');
  if (token) _initSocketIO(token);
})();

// =============================================
// EVENT BINDINGS AND LIFECYCLE
// =============================================
window.handleGenerateApiKey = async () => {
  const name = prompt("Enter a name for the new API Key:", "Production API Key");
  if (name === null) return;
  const prefix = confirm("Create as a Production API Key?\n\nOK = Production (nvk_prod_)\nCancel = Development (nvk_dev_)") ? "nvk_prod_" : "nvk_dev_";
  
  try {
    showToast("Generating API Key...", "info");
    const token = localStorage.getItem('nyxvault_token');
    const response = await fetch(apiCallUrl('/api/keys'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, prefix })
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Failed to generate key");
    }
    
    const newKey = await response.json();
    alert(`API Key Generated Successfully!\n\nName: ${newKey.name}\nKey: ${newKey.key}\n\nIMPORTANT: Copy this key now. For security reasons, you will not be able to see it again!`);
    routeChange();
  } catch (err) {
    showToast("Error: " + err.message, "error");
  }
};

window.handleRevokeApiKey = async (id) => {
  if (!confirm("Are you sure you want to revoke this API Key?\n\nAny applications using this key will immediately lose access to NyxVault.")) return;
  
  try {
    showToast("Revoking API Key...", "info");
    const token = localStorage.getItem('nyxvault_token');
    const response = await fetch(apiCallUrl(`/api/keys/${id}`), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || "Failed to revoke key");
    }
    
    showToast("API key revoked", "warning");
    routeChange();
  } catch (err) {
    showToast("Error: " + err.message, "error");
  }
};

window.navigate = navigate;

window.addEventListener('hashchange', routeChange);

document.addEventListener('DOMContentLoaded', () => {
  if (!window.location.hash) {
    window.location.hash = '/';
  }
  routeChange();
});

routeChange();
