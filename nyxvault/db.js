const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_FILE = path.join(__dirname, 'db.json');
const UPLOADS_DIR = path.join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Initial seed data
const getInitialData = () => {
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('Password123!', salt);

  const users = [
    { id: 'usr-001', name: 'Alex Ryder', email: 'alex.ryder@nyxvault.io', passwordHash, role: 'Admin', avatar: 'AR', plan: 'Enterprise', mfa: true, joined: 'Jan 12, 2024', status: 'active', color: '#00d4ff' },
    { id: 'usr-002', name: 'Jordan Torres', email: 'j.torres@corp.io', passwordHash, role: 'Manager', avatar: 'JT', plan: 'Professional', mfa: true, joined: 'Feb 15, 2024', status: 'active', color: '#7b2fff' },
    { id: 'usr-003', name: 'Ming Chen', email: 'm.chen@corp.io', passwordHash, role: 'Analyst', avatar: 'MC', plan: 'Professional', mfa: false, joined: 'Mar 1, 2024', status: 'flagged', color: '#ff3366' },
    { id: 'usr-004', name: 'Saanvi Patel', email: 's.patel@corp.io', passwordHash, role: 'Developer', avatar: 'SP', plan: 'Professional', mfa: true, joined: 'Mar 18, 2024', status: 'active', color: '#00ff88' },
    { id: 'usr-005', name: 'Kim Morgan', email: 'k.morgan@corp.io', passwordHash, role: 'Viewer', avatar: 'KM', plan: 'Starter', mfa: false, joined: 'Apr 20, 2024', status: 'inactive', color: '#ffaa00' },
    { id: 'usr-006', name: 'Reza Ahmadi', email: 'r.ahmadi@corp.io', passwordHash, role: 'Developer', avatar: 'RA', plan: 'Professional', mfa: true, joined: 'May 5, 2024', status: 'active', color: '#1a6fff' }
  ];

  const files = [
    { id: 'fil-001', userId: 'usr-001', name: 'Q4_Financial_Report_2025.pdf', type: 'pdf', size: 2516582, path: 'fil-001.pdf', hash: 'a3f8e221a8b3d68ef21d3f96bb7cf528de7ca1f97a5b3a1d91c045b8fb9d3004', originalHash: 'a3f8e221a8b3d68ef21d3f96bb7cf528de7ca1f97a5b3a1d91c045b8fb9d3004', encrypted: true, modified: '2026-06-24T12:04:00.000Z', folder: 'Documents' },
    { id: 'fil-002', userId: 'usr-001', name: 'project_blueprint_v3.docx', type: 'doc', size: 1153433, path: 'fil-002.docx', hash: '9d3710bbf8a5d629ea18fc8364cc918debc8f2a1b5c2a1d9bb97f3b8fc9d4002', originalHash: '9d3710bbf8a5d629ea18fc8364cc918debc8f2a1b5c2a1d9bb97f3b8fc9d4002', encrypted: true, modified: '2026-06-24T11:46:00.000Z', folder: 'Documents' },
    { id: 'fil-003', userId: 'usr-001', name: 'server_backups.tar.gz', type: 'zip', size: 933257216, path: 'fil-003.zip', hash: 'e501dab1c8b3d68ef21d3f96bb7cf528de7ca1f97a5b3a1d91c045b8fb9d3004', originalHash: 'e501dab1c8b3d68ef21d3f96bb7cf528de7ca1f97a5b3a1d91c045b8fb9d3004', encrypted: true, modified: '2026-06-24T10:23:00.000Z', folder: 'Archives' },
    { id: 'fil-004', userId: 'usr-001', name: 'infra_diagram_v2.png', type: 'img', size: 4404019, path: 'fil-004.png', hash: '2c89fb21a8b3d68ef21d3f96bb7cf528de7ca1f97a5b3a1d881102b8fb9d3004', originalHash: '2c89fb21a8b3d68ef21d3f96bb7cf528de7ca1f97a5b3a1d881102b8fb9d3004', encrypted: false, modified: '2026-06-23T18:34:00.000Z', folder: 'Images' },
    { id: 'fil-005', userId: 'usr-001', name: 'vault_keys_2025.key', type: 'key', size: 12288, path: 'fil-005.key', hash: '7bc432a1f9deb83f96bb7cf528de7ca1f97a5b3a1d1234567881c22b8fb9d3004', originalHash: '7bc432a1f9deb83f96bb7cf528de7ca1f97a5b3a1d1234567881c22b8fb9d3004', encrypted: true, modified: '2026-06-23T09:15:00.000Z', folder: 'Keys & Certs' },
    { id: 'fil-006', userId: 'usr-001', name: 'api_codebase.zip', type: 'code', size: 35651584, path: 'fil-006.zip', hash: 'f04c7a21a8b3d68ef21d3f96bb7cf528de7ca1f97a5b3a1de220ddb8fb9d3004', originalHash: 'f04c7a21a8b3d68ef21d3f96bb7cf528de7ca1f97a5b3a1de220ddb8fb9d3004', encrypted: true, modified: '2026-06-22T14:50:00.000Z', folder: 'Code' },
    { id: 'fil-007', userId: 'usr-001', name: 'employee_roster_2026.xlsx', type: 'doc', size: 573440, path: 'fil-007.xlsx', hash: 'd57344a1a8b3d68ef21d3f96bb7cf528de7ca1f97a5b3a1de220ddb8fb9d3004', originalHash: 'd57344a1a8b3d68ef21d3f96bb7cf528de7ca1f97a5b3a1de220ddb8fb9d3004', encrypted: true, modified: '2026-06-21T11:30:00.000Z', folder: 'Documents' },
    { id: 'fil-008', userId: 'usr-001', name: 'compliance_report.pdf', type: 'pdf', size: 3250585, path: 'fil-008.pdf', hash: 'c32505a1a8b3d68ef21d3f96bb7cf528de7ca1f97a5b3a1de220ddb8fb9d3004', originalHash: 'c32505a1a8b3d68ef21d3f96bb7cf528de7ca1f97a5b3a1de220ddb8fb9d3004', encrypted: true, modified: '2026-06-20T09:00:00.000Z', folder: 'Documents' }
  ];

  // Write dummy physical files so downloads work
  files.forEach(f => {
    const dummyPath = path.join(UPLOADS_DIR, f.path);
    if (!fs.existsSync(dummyPath)) {
      fs.writeFileSync(dummyPath, `Secure physical storage for ${f.name}. File encrypted with AES-256-GCM. Size: ${f.size} bytes.`, 'utf-8');
    }
  });

  const shares = [
    { id: 'SL-0052', userId: 'usr-001', fileId: 'fil-001', file: 'Q4_Financial_Report_2025.pdf', recipients: ['sarah@partner.io', 'board@corp.io'], expiry: '2026-07-10', views: 12, dl: 3, status: 'active' },
    { id: 'SL-0051', userId: 'usr-001', fileId: 'fil-002', file: 'project_blueprint_v3.docx', recipients: ['dev-team@acme.com'], expiry: '2026-06-28', views: 47, dl: 11, status: 'active' },
    { id: 'SL-0050', userId: 'usr-001', fileId: 'fil-004', file: 'infra_diagram_v2.png', recipients: ['ops@nyxvault.io'], expiry: '2026-06-24', views: 8, dl: 2, status: 'expiring' },
    { id: 'SL-0049', userId: 'usr-001', fileId: 'fil-006', file: 'api_codebase.zip', recipients: ['external@vendor.io'], expiry: '2026-06-15', views: 33, dl: 7, status: 'expired' },
    { id: 'SL-0048', userId: 'usr-001', fileId: 'fil-003', file: 'server_backups.tar.gz', recipients: ['backup@sre.io'], expiry: '2026-07-30', views: 1, dl: 1, status: 'active' }
  ];

  const alerts = [
    { id: 'ALT-001', userId: 'usr-001', sev: 'critical', title: 'Unauthorized Access Attempt', desc: 'Multiple failed login attempts from IP 185.220.101.34 (TOR exit node)', time: '4 min ago', status: 'active', timestamp: new Date(Date.now() - 4 * 60000).toISOString() },
    { id: 'ALT-002', userId: 'usr-001', sev: 'high', title: 'File Integrity Violation Detected', desc: 'SHA-256 hash mismatch on vault_keys_2025.key — possible tampering', time: '31 min ago', status: 'active', timestamp: new Date(Date.now() - 31 * 60000).toISOString() },
    { id: 'ALT-003', userId: 'usr-001', sev: 'high', title: 'Anomalous Download Pattern', desc: 'User jdoe@acme.com downloaded 847 files in under 10 minutes', time: '1h ago', status: 'reviewing', timestamp: new Date(Date.now() - 60 * 60000).toISOString() },
    { id: 'ALT-004', userId: 'usr-001', sev: 'medium', title: 'Expired Share Link Still Accessed', desc: 'Share link SL-0042 was accessed 6 hours after expiry from two IPs', time: '2h ago', status: 'resolved', timestamp: new Date(Date.now() - 120 * 60000).toISOString() },
    { id: 'ALT-005', userId: 'usr-001', sev: 'medium', title: 'Geolocation Anomaly', desc: 'User account accessed from Russia — usual location is United States', time: '4h ago', status: 'active', timestamp: new Date(Date.now() - 240 * 60000).toISOString() },
    { id: 'ALT-006', userId: 'usr-001', sev: 'low', title: 'New Device Login', desc: 'Account alex.ryder@nyxvault.io logged in from macOS 15 / Safari', time: '6h ago', status: 'resolved', timestamp: new Date(Date.now() - 360 * 60000).toISOString() },
    { id: 'ALT-007', userId: 'usr-001', sev: 'critical', title: 'Malware Signature Detected', desc: 'Uploaded file "update_patch.exe" matched known ransomware signature', time: '8h ago', status: 'blocked', timestamp: new Date(Date.now() - 480 * 60000).toISOString() },
    { id: 'ALT-008', userId: 'usr-001', sev: 'high', title: 'Admin Privilege Escalation', desc: 'User m.chen@corp.io attempted to escalate to admin role without approval', time: '12h ago', status: 'blocked', timestamp: new Date(Date.now() - 720 * 60000).toISOString() }
  ];

  const logs = [
    { id: 'LOG-5291', userId: 'usr-001', user: 'alex.ryder', action: 'FILE_DOWNLOAD', resource: 'Q4_Financial_Report_2025.pdf', ip: '203.0.113.42', time: 'Today 12:04', status: 'success', timestamp: new Date().toISOString() },
    { id: 'LOG-5290', userId: 'usr-001', user: 'j.torres', action: 'FILE_SHARE', resource: 'project_blueprint_v3.docx', ip: '198.51.100.7', time: 'Today 11:58', status: 'success', timestamp: new Date().toISOString() },
    { id: 'LOG-5289', userId: 'usr-001', user: 'm.chen', action: 'PRIVILEGE_ESC', resource: 'Admin Panel', ip: '192.168.1.52', time: 'Today 11:32', status: 'blocked', timestamp: new Date().toISOString() },
    { id: 'LOG-5288', userId: 'usr-001', user: 's.patel', action: 'FILE_DELETE', resource: 'legacy_keys_2022.key', ip: '10.0.0.24', time: 'Today 11:15', status: 'success', timestamp: new Date().toISOString() },
    { id: 'LOG-5287', userId: 'usr-001', user: 'alex.ryder', action: 'USER_CREATE', resource: 'k.morgan@corp.io', ip: '203.0.113.42', time: 'Today 10:50', status: 'success', timestamp: new Date().toISOString() },
    { id: 'LOG-5286', userId: 'usr-001', user: 'system', action: 'INTEGRITY_SCAN', resource: 'Vault Root', ip: 'internal', time: 'Today 10:00', status: 'success', timestamp: new Date().toISOString() },
    { id: 'LOG-5285', userId: 'usr-001', user: 'j.torres', action: 'FILE_UPLOAD', resource: 'server_backups.tar.gz', ip: '198.51.100.7', time: 'Yesterday 23:41', status: 'success', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 'LOG-5284', userId: 'usr-001', user: 'unknown', action: 'LOGIN_FAIL', resource: 'auth.nyxvault.io', ip: '185.220.101.34', time: 'Yesterday 22:55', status: 'blocked', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 'LOG-5283', userId: 'usr-001', user: 's.patel', action: 'SHARE_REVOKE', resource: 'SL-0038', ip: '10.0.0.24', time: 'Yesterday 21:10', status: 'success', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 'LOG-5282', userId: 'usr-001', user: 'm.chen', action: 'FILE_UPLOAD', resource: 'infra_diagram.png', ip: '192.168.1.52', time: 'Yesterday 18:34', status: 'success', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 'LOG-5281', userId: 'usr-001', user: 'alex.ryder', action: 'SETTINGS_EDIT', resource: 'Vault Security Config', ip: '203.0.113.42', time: 'Yesterday 16:22', status: 'success', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 'LOG-5280', userId: 'usr-001', user: 'system', action: 'ALERT_TRIGGER', resource: 'ALT-007', ip: 'internal', time: 'Yesterday 14:05', status: 'warning', timestamp: new Date(Date.now() - 86400000).toISOString() }
  ];

  return { users, files, shares, alerts, logs };
};

// Database utility object
const db = {
  data: null,

  load() {
    if (this.data) return this.data;
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(fileContent);
      } else {
        this.data = getInitialData();
        this.save();
      }
    } catch (e) {
      console.error('Error loading database, resetting to default seed data:', e);
      this.data = getInitialData();
      this.save();
    }
    return this.data;
  },

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to save database:', e);
    }
  },

  // Helpers
  get(collectionName) {
    this.load();
    return this.data[collectionName] || [];
  },

  find(collectionName, queryFn) {
    return this.get(collectionName).find(queryFn);
  },

  filter(collectionName, queryFn) {
    return this.get(collectionName).filter(queryFn);
  },

  insert(collectionName, item) {
    this.load();
    if (!this.data[collectionName]) this.data[collectionName] = [];
    this.data[collectionName].unshift(item); // insert at beginning for chronological items
    this.save();
    return item;
  },

  update(collectionName, queryFn, updates) {
    this.load();
    const item = this.data[collectionName].find(queryFn);
    if (item) {
      Object.assign(item, updates);
      this.save();
    }
    return item;
  },

  delete(collectionName, queryFn) {
    this.load();
    const index = this.data[collectionName].findIndex(queryFn);
    if (index !== -1) {
      const deletedItem = this.data[collectionName].splice(index, 1)[0];
      this.save();
      return deletedItem;
    }
    return null;
  }
};

module.exports = db;
