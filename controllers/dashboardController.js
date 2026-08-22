const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinary = require('../middlewares/cloudinary');
const https = require('https');

const DATA_DIR = path.join(__dirname, '..', 'data');
const AUTH_FILE = path.join(DATA_DIR, 'auth.json');
const SITE_DATA_FILE = path.join(DATA_DIR, 'siteData.json');

const readJson = (file, fallback = {}) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return fallback;
  }
};

const writeJson = (file, data) => {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const admin = readJson(AUTH_FILE, null);

    if (!admin || email.toLowerCase() !== admin.email.toLowerCase()) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = bcrypt.compareSync(password, admin.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ email: admin.email }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    return res.status(200).json({
      data: { email: admin.email },
      token,
      message: 'Authentication successful',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const verifyToken = (req, res) => {
  return res.status(200).json({ data: req.admin, message: 'Valid token' });
};

const getSiteData = (req, res) => {
  const data = readJson(SITE_DATA_FILE, {});
  return res.status(200).json({ data, message: 'Success' });
};

const saveSiteData = (req, res) => {
  try {
    const current = readJson(SITE_DATA_FILE, {});
    const patch = req.body || {};

    const updated = {
      ...current,
      ...patch,
      hero: { ...current.hero, ...(patch.hero || {}) },
      about: { ...current.about, ...(patch.about || {}) },
      cv: { ...current.cv, ...(patch.cv || {}) },
      projects: patch.projects !== undefined ? patch.projects : current.projects || [],
    };

    writeJson(SITE_DATA_FILE, updated);
    return res.status(200).json({ data: updated, message: 'Site data updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const uploadFile = async (req, res) => {
  try {
    const { file, folder = 'my_portfolio_imgs' } = req.body;

    if (!file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const isPdf = file.startsWith('data:application/pdf') || file.includes('.pdf');
    
    const result = await cloudinary.uploader.upload(file, {
      folder,
      resource_type: isPdf ? 'raw' : 'auto',
    });

    return res.status(200).json({
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
      message: 'Upload successful',
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addProject = (req, res) => {
  try {
    const { title, projectCategory, technologies, projectDesc, projectLink, projStatus } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const current = readJson(SITE_DATA_FILE, {});
    const projects = Array.isArray(current.projects) ? current.projects : [];

    const newProject = {
      title,
      projectCategory: Array.isArray(projectCategory) ? projectCategory : [projectCategory].filter(Boolean),
      technologies: Array.isArray(technologies) ? technologies : [],
      projectDesc: projectDesc || '',
      projectLink: projectLink || '',
      projStatus: projStatus === undefined ? true : Boolean(projStatus),
    };

    projects.push(newProject);
    current.projects = projects;
    writeJson(SITE_DATA_FILE, current);

    return res.status(201).json({ data: newProject, message: 'Project added successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const deleteProject = (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);

    if (isNaN(index)) {
      return res.status(400).json({ message: 'Invalid project index' });
    }

    const current = readJson(SITE_DATA_FILE, {});
    const projects = Array.isArray(current.projects) ? current.projects : [];

    if (index < 0 || index >= projects.length) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const removed = projects.splice(index, 1);
    current.projects = projects;
    writeJson(SITE_DATA_FILE, current);

    return res.status(200).json({ data: removed[0], message: 'Project deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateProject = (req, res) => {
  try {
    const index = parseInt(req.params.index, 10);

    if (isNaN(index)) {
      return res.status(400).json({ message: 'Invalid project index' });
    }

    const current = readJson(SITE_DATA_FILE, {});
    const projects = Array.isArray(current.projects) ? current.projects : [];

    if (index < 0 || index >= projects.length) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { title, projectCategory, technologies, projectDesc, projectLink, projStatus } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    projects[index] = {
      title,
      projectCategory: Array.isArray(projectCategory) ? projectCategory : [projectCategory].filter(Boolean),
      technologies: Array.isArray(technologies) ? technologies : [],
      projectDesc: projectDesc || '',
      projectLink: projectLink || '',
      projStatus: projStatus === undefined ? true : Boolean(projStatus),
    };

    current.projects = projects;
    writeJson(SITE_DATA_FILE, current);

    return res.status(200).json({ data: projects[index], message: 'Project updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const proxyPdf = (req, res) => {
  try {
    const { url } = req.query;
    if (!url || !url.includes('cloudinary.com')) {
      return res.status(400).json({ message: 'Invalid URL' });
    }

    const followRedirects = (targetUrl, depth = 0) => {
      if (depth > 5) {
        return res.status(500).json({ message: 'Too many redirects' });
      }

      https.get(targetUrl, (proxyRes) => {
        if (proxyRes.statusCode === 301 || proxyRes.statusCode === 302) {
          return followRedirects(proxyRes.headers.location, depth + 1);
        }
        if (proxyRes.statusCode !== 200) {
          return res.status(proxyRes.statusCode).json({ message: `Upstream returned ${proxyRes.statusCode}` });
        }
        res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
        proxyRes.pipe(res);
      }).on('error', (err) => {
        if (!res.headersSent) {
          res.status(500).json({ message: 'Failed to fetch PDF' });
        }
      });
    };

    followRedirects(url);
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = {
  login,
  verifyToken,
  getSiteData,
  saveSiteData,
  uploadFile,
  addProject,
  updateProject,
  deleteProject,
  proxyPdf,
};
