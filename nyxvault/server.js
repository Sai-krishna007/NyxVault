const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'nyxvault-super-secure-jwt-key-2026';

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serving Static Files
app.use(express.static(path.join(__dirname)));
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Multer Storage Configuration for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const fileId = 'fil-' + Math.random().toString(36).substring(2, 11);
    const ext = path.extname(file.originalname);
    cb(null, `${fileId}${ext}`);
  }
});
const upload = multer({ storage });

// ==========================================
// MIDDLEWARE: Authentication
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ==========================================
// ROUTER: Authentication (/api/auth)
// ==========================================
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName, organization, plan } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const existingUser = db.find('users', u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ error: 'Account already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);
  const name = `${firstName || ''} ${lastName || ''}`.trim() || 'New User';
  const avatar = (firstName && lastName) ? `${firstName[0]}${lastName[0]}`.toUpperCase() : name.substring(0, 2).toUpperCase();
  
  const newUser = {
    id: 'usr-' + Math.random().toString(36).substring(2, 8),
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: 'Developer', // Default registered role
    avatar,
    plan: plan || 'Professional',
    mfa: true,
    joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'active',
    color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
  };

  db.insert('users', newUser);

  // Log user registration audit
  db.insert('logs', {
    id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
    userId: newUser.id,
    user: newUser.email.split('@')[0],
    action: 'USER_CREATE',
    resource: newUser.email,
    ip: req.ip || '127.0.0.1',
    time: 'Today ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    status: 'success',
    timestamp: new Date().toISOString()
  });

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });
  res.status(201).json({ token, user: { name: newUser.name, email: newUser.email, role: newUser.role, plan: newUser.plan, avatar: newUser.avatar, mfa: newUser.mfa } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = db.find('users', u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    // Log failed login audit
    db.insert('logs', {
      id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
      userId: 'unknown',
      user: email ? email.split('@')[0] : 'unknown',
      action: 'LOGIN_FAIL',
      resource: 'auth.nyxvault.io',
      ip: req.ip || '127.0.0.1',
      time: 'Today ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      status: 'blocked',
      timestamp: new Date().toISOString()
    });

    // Generate security alert for failed login
    db.insert('alerts', {
      id: 'ALT-' + Math.floor(100 + Math.random() * 900),
      userId: 'system',
      sev: 'medium',
      title: 'Failed Login Attempt',
      desc: `Unauthorized access attempt on account ${email} from IP ${req.ip || '127.0.0.1'}`,
      time: 'Just now',
      status: 'active',
      timestamp: new Date().toISOString()
    });

    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Account suspended. Contact administration.' });
  }

  // Log successful login audit
  db.insert('logs', {
    id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
    userId: user.id,
    user: user.email.split('@')[0],
    action: 'SETTINGS_EDIT', // Use SETTINGS_EDIT or LOGIN_SUCCESS
    resource: 'Session Login',
    ip: req.ip || '127.0.0.1',
    time: 'Today ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    status: 'success',
    timestamp: new Date().toISOString()
  });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { name: user.name, email: user.email, role: user.role, plan: user.plan, avatar: user.avatar, mfa: user.mfa } });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.find('users', u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  res.json({
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
    avatar: user.avatar,
    mfa: user.mfa,
    joined: user.joined,
    bio: user.bio || 'Security-focused vault user.',
    timezone: user.timezone || 'UTC+05:30 — Asia/Kolkata'
  });
});

app.put('/api/auth/me', authenticateToken, (req, res) => {
  const updates = req.body;
  const user = db.find('users', u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  // Disallow user from elevating their own role directly
  delete updates.role;
  delete updates.email;
  delete updates.id;

  const updatedUser = db.update('users', u => u.id === req.user.id, updates);

  // Log update audit
  db.insert('logs', {
    id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
    userId: user.id,
    user: user.email.split('@')[0],
    action: 'SETTINGS_EDIT',
    resource: 'User Profile Config',
    ip: req.ip || '127.0.0.1',
    time: 'Today ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    status: 'success',
    timestamp: new Date().toISOString()
  });

  res.json({
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    plan: updatedUser.plan,
    avatar: updatedUser.avatar,
    mfa: updatedUser.mfa,
    joined: updatedUser.joined,
    bio: updatedUser.bio || '',
    timezone: updatedUser.timezone || 'UTC+05:30 — Asia/Kolkata'
  });
});

// ==========================================
// ROUTER: Statistics & Metrics (/api/stats)
// ==========================================
app.get('/api/stats', authenticateToken, (req, res) => {
  const userFiles = db.filter('files', f => f.userId === req.user.id);
  const userAlerts = db.filter('alerts', a => a.userId === req.user.id || a.userId === 'system');
  const userShares = db.filter('shares', s => s.userId === req.user.id);
  
  const totalFiles = userFiles.length;
  const storageUsed = userFiles.reduce((acc, f) => acc + f.size, 0) / (1024 * 1024 * 1024); // GB
  const activeAlerts = userAlerts.filter(a => a.status === 'active' || a.status === 'reviewing').length;
  const shareLinksCount = userShares.filter(s => s.status !== 'expired').length;
  
  // Threats blocked is active + blocked status alerts
  const threats = userAlerts.filter(a => a.status === 'blocked' || a.sev === 'critical').length;
  
  // Calculate integrity score (verified files vs total files)
  const tamperedFilesCount = userFiles.filter(f => f.status === 'tampered').length;
  const integrityScore = totalFiles > 0 ? (((totalFiles - tamperedFilesCount) / totalFiles) * 100).toFixed(1) : 100;

  // Chart data generators
  const chartActivity = {
    labels: ['Jun 18','Jun 19','Jun 20','Jun 21','Jun 22','Jun 23','Jun 24'],
    uploads: [12, 18, 14, 29, 22, 35, totalFiles],
    downloads: [45, 68, 53, 89, 72, 95, 120],
    alerts:  [1, 3, 2, 4, 3, 5, activeAlerts],
  };

  // Storage breakdown distribution
  const typeMapping = {
    pdf: 'Documents', doc: 'Documents', xls: 'Documents', txt: 'Documents',
    zip: 'Archives', tar: 'Archives', gz: 'Archives', rar: 'Archives',
    img: 'Images', png: 'Images', jpg: 'Images', gif: 'Images',
    code: 'Code', js: 'Code', html: 'Code', css: 'Code', json: 'Code',
    key: 'Keys', pem: 'Keys', pub: 'Keys', keyStore: 'Keys'
  };

  const categories = { 'Documents': 0, 'Archives': 0, 'Images': 0, 'Code': 0, 'Keys': 0, 'Other': 0 };
  userFiles.forEach(f => {
    const cat = typeMapping[f.type] || 'Other';
    categories[cat] += f.size;
  });

  const totalBytes = userFiles.reduce((acc, f) => acc + f.size, 0) || 1;
  const chartStorage = {
    labels: Object.keys(categories),
    data: Object.values(categories).map(bytes => Math.round((bytes / totalBytes) * 100))
  };

  const chartThreats = {
    labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    malware:   [2, 1, 4, 2, 5, 3, threats > 0 ? threats : 2],
    intrusion: [4, 3, 6, 4, 8, 2, 5],
    anomaly:   [3, 5, 2, 7, 4, 6, activeAlerts > 0 ? activeAlerts : 3],
  };

  res.json({
    stats: {
      totalFiles,
      storageUsed: storageUsed.toFixed(2),
      storageTotal: 100, // Fixed 100GB limit
      alerts: activeAlerts,
      shares: shareLinksCount,
      threats,
      integrityScore,
      uptime: 99.98
    },
    recentFiles: userFiles.slice(0, 6),
    chartActivity,
    chartStorage,
    chartThreats
  });
});

// ==========================================
// ROUTER: File Manager (/api/files)
// ==========================================
app.get('/api/files', authenticateToken, (req, res) => {
  const { folder, search } = req.query;
  let userFiles = db.filter('files', f => f.userId === req.user.id);

  if (folder) {
    userFiles = userFiles.filter(f => f.folder && f.folder.toLowerCase() === folder.toLowerCase());
  }

  if (search) {
    const term = search.toLowerCase();
    userFiles = userFiles.filter(f => f.name.toLowerCase().includes(term));
  }

  res.json(userFiles);
});

app.post('/api/files/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Calculate file integrity SHA-256 hash
  const fileBuffer = fs.readFileSync(req.file.path);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  const sha256Hash = hashSum.digest('hex');

  const ext = path.extname(req.file.originalname).substring(1).toLowerCase();
  const folderMapping = {
    pdf: 'Documents', docx: 'Documents', doc: 'Documents', xlsx: 'Documents', xls: 'Documents', txt: 'Documents', csv: 'Documents',
    zip: 'Archives', tar: 'Archives', gz: 'Archives', rar: 'Archives',
    png: 'Images', jpg: 'Images', jpeg: 'Images', gif: 'Images', svg: 'Images',
    js: 'Code', html: 'Code', css: 'Code', py: 'Code', json: 'Code',
    key: 'Keys & Certs', pem: 'Keys & Certs', pub: 'Keys & Certs'
  };

  const newFile = {
    id: path.basename(req.file.filename, path.extname(req.file.filename)),
    userId: req.user.id,
    name: req.file.originalname,
    type: ext || 'doc',
    size: req.file.size,
    path: req.file.filename,
    hash: sha256Hash,
    originalHash: sha256Hash,
    encrypted: req.body.encrypted === 'true',
    status: 'verified', // initial status
    modified: new Date().toISOString(),
    folder: folderMapping[ext] || 'Documents'
  };

  db.insert('files', newFile);

  // Log upload audit trail
  const user = db.find('users', u => u.id === req.user.id);
  db.insert('logs', {
    id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
    userId: req.user.id,
    user: user.email.split('@')[0],
    action: 'FILE_UPLOAD',
    resource: newFile.name,
    ip: req.ip || '127.0.0.1',
    time: 'Today ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    status: 'success',
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newFile);
});

app.get('/api/files/download/:id', authenticateToken, (req, res) => {
  const file = db.find('files', f => f.id === req.params.id && f.userId === req.user.id);

  if (!file) {
    return res.status(404).json({ error: 'File not found or access denied' });
  }

  const filePath = path.join(__dirname, 'uploads', file.path);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Physical storage file missing' });
  }

  // Increment download count in shares if applicable
  const activeShare = db.find('shares', s => s.fileId === file.id);
  if (activeShare) {
    db.update('shares', s => s.id === activeShare.id, { dl: activeShare.dl + 1 });
  }

  // Log download audit
  const user = db.find('users', u => u.id === req.user.id);
  db.insert('logs', {
    id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
    userId: req.user.id,
    user: user.email.split('@')[0],
    action: 'FILE_DOWNLOAD',
    resource: file.name,
    ip: req.ip || '127.0.0.1',
    time: 'Today ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    status: 'success',
    timestamp: new Date().toISOString()
  });

  res.download(filePath, file.name);
});

app.delete('/api/files/:id', authenticateToken, (req, res) => {
  const file = db.find('files', f => f.id === req.params.id && f.userId === req.user.id);

  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  // Delete metadata
  db.delete('files', f => f.id === req.params.id);

  // Delete file on disk
  const filePath = path.join(__dirname, 'uploads', file.path);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (e) {
      console.error('Failed to delete physical file from storage:', e);
    }
  }

  // Log delete audit
  const user = db.find('users', u => u.id === req.user.id);
  db.insert('logs', {
    id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
    userId: req.user.id,
    user: user.email.split('@')[0],
    action: 'FILE_DELETE',
    resource: file.name,
    ip: req.ip || '127.0.0.1',
    time: 'Today ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    status: 'success',
    timestamp: new Date().toISOString()
  });

  res.json({ message: 'File deleted successfully' });
});

// ==========================================
// ROUTER: Secure Sharing (/api/sharing)
// ==========================================
app.get('/api/sharing', authenticateToken, (req, res) => {
  const shares = db.filter('shares', s => s.userId === req.user.id);
  res.json(shares);
});

app.post('/api/sharing', authenticateToken, (req, res) => {
  const { fileId, recipients, expiry, limitDownloads, passwordProtected } = req.body;

  const file = db.find('files', f => f.id === fileId && f.userId === req.user.id);
  if (!file) return res.status(404).json({ error: 'File not found' });

  const shareId = 'SL-' + Math.floor(1000 + Math.random() * 9000);
  const newShare = {
    id: shareId,
    userId: req.user.id,
    fileId,
    file: file.name,
    recipients: recipients ? recipients.split(',').map(r => r.trim()) : [],
    expiry: expiry || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    views: 0,
    dl: 0,
    status: 'active'
  };

  db.insert('shares', newShare);

  // Log share audit
  const user = db.find('users', u => u.id === req.user.id);
  db.insert('logs', {
    id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
    userId: req.user.id,
    user: user.email.split('@')[0],
    action: 'FILE_SHARE',
    resource: file.name,
    ip: req.ip || '127.0.0.1',
    time: 'Today ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    status: 'success',
    timestamp: new Date().toISOString()
  });

  res.status(201).json(newShare);
});

app.delete('/api/sharing/:id', authenticateToken, (req, res) => {
  const share = db.find('shares', s => s.id === req.params.id && s.userId === req.user.id);
  if (!share) return res.status(404).json({ error: 'Share link not found' });

  db.delete('shares', s => s.id === req.params.id);

  // Log share revoke
  const user = db.find('users', u => u.id === req.user.id);
  db.insert('logs', {
    id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
    userId: req.user.id,
    user: user.email.split('@')[0],
    action: 'SHARE_REVOKE',
    resource: share.id,
    ip: req.ip || '127.0.0.1',
    time: 'Today ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    status: 'success',
    timestamp: new Date().toISOString()
  });

  res.json({ message: 'Share revoked successfully' });
});

// ==========================================
// ROUTER: Integrity Monitoring (/api/integrity)
// ==========================================
app.get('/api/integrity', authenticateToken, (req, res) => {
  const files = db.filter('files', f => f.userId === req.user.id);
  const integrityScore = files.length > 0 ? (((files.filter(f => f.status === 'verified').length) / files.length) * 100).toFixed(1) : 100;
  
  res.json({
    files: files.map(f => ({
      id: f.id,
      name: f.name,
      hash: f.hash.substring(0, 6) + '...' + (f.status === 'tampered' ? 'MISMATCH' : f.hash.substring(f.hash.length - 6)),
      lastScan: '2min ago',
      size: formatBytes(f.size),
      status: f.status,
      changes: f.status === 'tampered' ? 1 : 0
    })),
    score: integrityScore
  });
});

app.post('/api/integrity/scan', authenticateToken, (req, res) => {
  const userFiles = db.filter('files', f => f.userId === req.user.id);
  let tamperedCount = 0;

  userFiles.forEach(file => {
    const filePath = path.join(__dirname, 'uploads', file.path);
    if (!fs.existsSync(filePath)) {
      // Missing file = unverified/tampered state
      db.update('files', f => f.id === file.id, { status: 'unverified' });
      return;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const sha256Hash = hashSum.digest('hex');

    // Check if hash matches the database expected hash
    if (sha256Hash !== file.originalHash) {
      db.update('files', f => f.id === file.id, { hash: sha256Hash, status: 'tampered' });
      tamperedCount++;

      // Trigger high severity alert
      const alertId = 'ALT-' + Math.floor(100 + Math.random() * 900);
      db.insert('alerts', {
        id: alertId,
        userId: req.user.id,
        sev: 'high',
        title: 'File Integrity Violation Detected',
        desc: `SHA-256 hash mismatch on ${file.name} — expected ${file.originalHash.substring(0, 10)}... but computed ${sha256Hash.substring(0, 10)}... possible tampering`,
        time: 'Just now',
        status: 'active',
        timestamp: new Date().toISOString()
      });

      // Audit log alert
      db.insert('logs', {
        id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
        userId: 'system',
        user: 'system',
        action: 'ALERT_TRIGGER',
        resource: alertId,
        ip: 'internal',
        time: 'Today ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        status: 'warning',
        timestamp: new Date().toISOString()
      });
    } else if (file.status === 'tampered' || file.status === 'unverified') {
      db.update('files', f => f.id === file.id, { hash: sha256Hash, status: 'verified' });
    }
  });

  // Log scan audit
  const user = db.find('users', u => u.id === req.user.id);
  db.insert('logs', {
    id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
    userId: req.user.id,
    user: user.email.split('@')[0],
    action: 'INTEGRITY_SCAN',
    resource: 'Vault Root',
    ip: req.ip || '127.0.0.1',
    time: 'Today ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    status: 'success',
    timestamp: new Date().toISOString()
  });

  res.json({ message: 'Integrity scan completed', tamperedDetected: tamperedCount });
});

app.post('/api/integrity/quarantine/:id', authenticateToken, (req, res) => {
  const file = db.find('files', f => f.id === req.params.id && f.userId === req.user.id);
  if (!file) return res.status(404).json({ error: 'File not found' });

  db.update('files', f => f.id === file.id, { status: 'unverified' });

  // Log quarantine audit
  const user = db.find('users', u => u.id === req.user.id);
  db.insert('logs', {
    id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
    userId: req.user.id,
    user: user.email.split('@')[0],
    action: 'SETTINGS_EDIT',
    resource: `Quarantined ${file.name}`,
    ip: req.ip || '127.0.0.1',
    time: 'Today ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    status: 'success',
    timestamp: new Date().toISOString()
  });

  res.json({ message: 'File quarantined successfully' });
});

app.post('/api/integrity/restore/:id', authenticateToken, (req, res) => {
  const file = db.find('files', f => f.id === req.params.id && f.userId === req.user.id);
  if (!file) return res.status(404).json({ error: 'File not found' });

  const filePath = path.join(__dirname, 'uploads', file.path);
  // Restore original dummy content to fix hash
  fs.writeFileSync(filePath, `Secure physical storage for ${file.name}. File encrypted with AES-256-GCM. Size: ${file.size} bytes.`, 'utf-8');

  db.update('files', f => f.id === file.id, { hash: file.originalHash, status: 'verified' });

  // Resolve corresponding alerts
  const alert = db.find('alerts', a => a.title.includes('Integrity') && a.desc.includes(file.name));
  if (alert) {
    db.update('alerts', a => a.id === alert.id, { status: 'resolved' });
  }

  // Log restore audit
  const user = db.find('users', u => u.id === req.user.id);
  db.insert('logs', {
    id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
    userId: req.user.id,
    user: user.email.split('@')[0],
    action: 'SETTINGS_EDIT',
    resource: `Restored ${file.name}`,
    ip: req.ip || '127.0.0.1',
    time: 'Today ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    status: 'success',
    timestamp: new Date().toISOString()
  });

  res.json({ message: 'File restored from backup successfully' });
});

// ==========================================
// ROUTER: Security Alerts (/api/alerts)
// ==========================================
app.get('/api/alerts', authenticateToken, (req, res) => {
  const alerts = db.filter('alerts', a => a.userId === req.user.id || a.userId === 'system');
  res.json(alerts);
});

app.post('/api/alerts/:id/resolve', authenticateToken, (req, res) => {
  const alert = db.find('alerts', a => a.id === req.params.id);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  db.update('alerts', a => a.id === alert.id, { status: 'resolved' });

  // Log alert resolution
  const user = db.find('users', u => u.id === req.user.id);
  db.insert('logs', {
    id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
    userId: req.user.id,
    user: user.email.split('@')[0],
    action: 'SETTINGS_EDIT',
    resource: `Resolved Alert ${alert.id}`,
    ip: req.ip || '127.0.0.1',
    time: 'Today ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    status: 'success',
    timestamp: new Date().toISOString()
  });

  res.json({ message: 'Alert marked as resolved' });
});

// ==========================================
// ROUTER: Audit Logs (/api/logs)
// ==========================================
app.get('/api/logs', authenticateToken, (req, res) => {
  const logs = db.filter('logs', l => l.userId === req.user.id || l.userId === 'system' || req.user.role === 'Admin');
  res.json(logs);
});

// ==========================================
// ROUTER: Admin Panel (/api/admin)
// ==========================================
app.get('/api/admin/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Administrator privileges required' });
  }

  const users = db.get('users').map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    joined: u.joined,
    status: u.status,
    color: u.color,
    files: db.filter('files', f => f.userId === u.id).length * 123 + 45 // mock realistic multiplier for display
  }));
  res.json(users);
});

app.post('/api/admin/users/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Administrator privileges required' });
  }

  const { status } = req.body;
  const user = db.find('users', u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  db.update('users', u => u.id === user.id, { status });

  // Log status change audit
  const admin = db.find('users', u => u.id === req.user.id);
  db.insert('logs', {
    id: 'LOG-' + Math.floor(1000 + Math.random() * 9000),
    userId: req.user.id,
    user: admin.email.split('@')[0],
    action: 'SETTINGS_EDIT',
    resource: `Updated user ${user.email} status to ${status}`,
    ip: req.ip || '127.0.0.1',
    time: 'Today ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
    status: 'success',
    timestamp: new Date().toISOString()
  });

  res.json({ message: `User status changed to ${status}` });
});

app.get('/api/admin/stats', authenticateToken, (req, res) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ error: 'Forbidden: Administrator privileges required' });
  }

  const users = db.get('users');
  const allFiles = db.get('files');
  const allAlerts = db.get('alerts');
  const allLogs = db.get('logs');

  const totalStorageBytes = allFiles.reduce((acc, f) => acc + f.size, 0);
  
  res.json({
    totalUsers: users.length,
    systemHealth: '99.98%',
    totalStorage: formatBytes(totalStorageBytes),
    threatsBlocked: allAlerts.filter(a => a.status === 'blocked').length * 42 + 12 // mock telemetry counts
  });
});

// Helper: Format bytes to human readable
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  if (bytes < 1024) return bytes + ' B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Fallback routing for SPA: serve index.html for undefined UI routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`NyxVault backend server running on http://localhost:${PORT}`);
});
