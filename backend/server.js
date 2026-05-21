const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Finance Fox Backend is running! Use /api/dashboard to see the data.');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

// Mock Dashboard endpoint to fulfill the live UI requirement
app.get('/api/dashboard', (req, res) => {
  res.json({
    balance: 24562.00,
    spending: 3210.50,
    saved: 8450.00,
    chartData: [
      { name: 'Jan', value: 4000 },
      { name: 'Feb', value: 3000 },
      { name: 'Mar', value: 5000 },
      { name: 'Apr', value: 4500 },
      { name: 'May', value: 6000 },
      { name: 'Jun', value: 5500 },
      { name: 'Jul', value: 7000 },
    ],
    recentTransactions: [
      { id: 1, name: 'Apple Store', category: 'Shopping', amount: -999.00, date: 'Today, 2:45 PM', status: 'Completed' },
      { id: 2, name: 'Salary', category: 'Income', amount: 5400.00, date: 'Yesterday, 9:00 AM', status: 'Completed' },
      { id: 3, name: 'Uber Eats', category: 'Food', amount: -24.50, date: 'May 12, 8:30 PM', status: 'Pending' },
      { id: 4, name: 'Netflix', category: 'Subscription', amount: -15.99, date: 'May 10, 10:00 AM', status: 'Completed' },
    ]
  });
});

// Templates physical persistence setup
const TEMPLATES_DIR = path.join(__dirname, 'templates');

// Ensure templates folder exists
if (!fs.existsSync(TEMPLATES_DIR)) {
  fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
}

// GET all templates
app.get('/api/templates', (req, res) => {
  try {
    const files = fs.readdirSync(TEMPLATES_DIR);
    const templates = files
      .filter(file => file.endsWith('.json') && file !== 'emis.json')
      .map(file => {
        const filePath = path.join(TEMPLATES_DIR, file);
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      });
    res.json(templates);
  } catch (error) {
    console.error('Error reading templates:', error);
    res.status(500).json({ error: 'Failed to read templates' });
  }
});

// POST save a template
app.post('/api/templates', (req, res) => {
  try {
    const template = req.body;
    if (!template || !template.id) {
      return res.status(400).json({ error: 'Invalid template data' });
    }
    const fileName = `${template.id}.json`;
    const filePath = path.join(TEMPLATES_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(template, null, 2), 'utf8');
    res.status(201).json({ message: 'Template saved successfully', template });
  } catch (error) {
    console.error('Error saving template:', error);
    res.status(500).json({ error: 'Failed to save template' });
  }
});

// DELETE a template
app.delete('/api/templates/:id', (req, res) => {
  try {
    const { id } = req.params;
    const fileName = `${id}.json`;
    const filePath = path.join(TEMPLATES_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'Template deleted successfully' });
    } else {
      res.status(404).json({ error: 'Template not found' });
    }
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// EMIs subfolder setup
const EMIS_DIR = path.join(TEMPLATES_DIR, 'emis');

// Ensure EMIs folder exists
if (!fs.existsSync(EMIS_DIR)) {
  fs.mkdirSync(EMIS_DIR, { recursive: true });
}

// Automated Migration from old emis.json
const oldEmisPath = path.join(TEMPLATES_DIR, 'emis.json');
if (fs.existsSync(oldEmisPath)) {
  try {
    const data = fs.readFileSync(oldEmisPath, 'utf8');
    const oldEmis = JSON.parse(data);
    if (Array.isArray(oldEmis)) {
      oldEmis.forEach(emi => {
        if (emi && emi.id) {
          const filePath = path.join(EMIS_DIR, `emi-${emi.id}.json`);
          if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(emi, null, 2), 'utf8');
          }
        }
      });
    }
    fs.unlinkSync(oldEmisPath);
    console.log('Successfully migrated old emis.json to templates/emis/ folder');
  } catch (err) {
    console.error('Error migrating old emis.json:', err);
  }
}

// GET all EMIs
app.get('/api/emis', (req, res) => {
  try {
    if (!fs.existsSync(EMIS_DIR)) {
      return res.json([]);
    }
    const files = fs.readdirSync(EMIS_DIR);
    const emis = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(EMIS_DIR, file);
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
      });
    res.json(emis);
  } catch (error) {
    console.error('Error reading EMIs:', error);
    res.status(500).json({ error: 'Failed to read EMIs' });
  }
});

// POST save / update a single EMI in its own file
app.post('/api/emis', (req, res) => {
  try {
    const emi = req.body;
    if (!emi || !emi.id) {
      return res.status(400).json({ error: 'Invalid EMI data' });
    }
    const fileName = `emi-${emi.id}.json`;
    const filePath = path.join(EMIS_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(emi, null, 2), 'utf8');
    res.json({ message: 'EMI saved successfully', emi });
  } catch (error) {
    console.error('Error saving EMI:', error);
    res.status(500).json({ error: 'Failed to save EMI' });
  }
});

// DELETE a specific EMI file
app.delete('/api/emis/:id', (req, res) => {
  try {
    const { id } = req.params;
    const fileName = `emi-${id}.json`;
    const filePath = path.join(EMIS_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'EMI deleted successfully' });
    } else {
      res.status(404).json({ error: 'EMI file not found' });
    }
  } catch (error) {
    console.error('Error deleting EMI:', error);
    res.status(500).json({ error: 'Failed to delete EMI' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
