const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const User = require("./models/Users");
const Template = require("./models/Templates");
const Expense = require("./models/Expenses");
const EMI = require("./models/EMIs");
const jwt = require("jsonwebtoken");
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
mongoose.connect(process.env.con_string);
mongoose.connection.on("connected", () => {
  console.log("Successfully connected to MongoDB 'users' database.");
});
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});
app.get("/", (req, res) => {
  res.send(
    "Finance Fox Backend is running! Use /api/dashboard to see the data.",
  );
});
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "API is running" });
});
// Mock Dashboard endpoint to fulfill the live UI requirement
app.get("/api/dashboard", (req, res) => {
  res.json({
    balance: 24562.0,
    spending: 3210.5,
    saved: 8450.0,
    chartData: [
      { name: "Jan", value: 4000 },
      { name: "Feb", value: 3000 },
      { name: "Mar", value: 5000 },
      { name: "Apr", value: 4500 },
      { name: "May", value: 6000 },
      { name: "Jun", value: 5500 },
      { name: "Jul", value: 7000 },
    ],
    recentTransactions: [
      {
        id: 1,
        name: "Apple Store",
        category: "Shopping",
        amount: -999.0,
        date: "Today, 2:45 PM",
        status: "Completed",
      },
      {
        id: 2,
        name: "Salary",
        category: "Income",
        amount: 5400.0,
        date: "Yesterday, 9:00 AM",
        status: "Completed",
      },
      {
        id: 3,
        name: "Uber Eats",
        category: "Food",
        amount: -24.5,
        date: "May 12, 8:30 PM",
        status: "Pending",
      },
      {
        id: 4,
        name: "Netflix",
        category: "Subscription",
        amount: -15.99,
        date: "May 10, 10:00 AM",
        status: "Completed",
      },
    ],
  });
});
// Templates physical persistence setup
const TEMPLATES_DIR = path.join(__dirname, "templates");
// Ensure templates folder exists
if (!fs.existsSync(TEMPLATES_DIR)) {
  fs.mkdirSync(TEMPLATES_DIR, { recursive: true });
}
// Auth middleware to authenticate user token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET || "fallbacksecret", (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }
    req.user = user;
    next();
  });
};

// GET all templates (user-specific)
app.get("/api/templates", authenticateToken, async (req, res) => {
  try {
    const templates = await Template.find({ userId: req.user.id });
    res.json(templates);
  } catch (error) {
    console.error("Error reading templates:", error);
    res.status(500).json({ error: "Failed to read templates" });
  }
});

// POST save a template (user-specific)
app.post("/api/templates", authenticateToken, async (req, res) => {
  try {
    const templateData = req.body;
    if (!templateData || !templateData.id) {
      return res.status(400).json({ error: "Invalid template data" });
    }

    // Upsert template in database belonging to user
    const template = await Template.findOneAndUpdate(
      { userId: req.user.id, id: templateData.id },
      {
        userId: req.user.id,
        id: templateData.id,
        name: templateData.name,
        income: templateData.income,
        categories: templateData.categories
      },
      { new: true, upsert: true }
    );

    res.status(201).json({ message: "Template saved successfully", template });
  } catch (error) {
    console.error("Error saving template:", error);
    res.status(500).json({ error: "Failed to save template" });
  }
});

// DELETE a template (user-specific)
app.delete("/api/templates/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Template.findOneAndDelete({ userId: req.user.id, id: Number(id) });
    if (result) {
      res.json({ message: "Template deleted successfully" });
    } else {
      res.status(404).json({ error: "Template not found" });
    }
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({ error: "Failed to delete template" });
  }
});

// GET all EMIs (user-specific)
app.get("/api/emis", authenticateToken, async (req, res) => {
  try {
    const emis = await EMI.find({ userId: req.user.id });
    res.json(emis);
  } catch (error) {
    console.error("Error reading EMIs:", error);
    res.status(500).json({ error: "Failed to read EMIs" });
  }
});

// POST save / update a single EMI (user-specific)
app.post("/api/emis", authenticateToken, async (req, res) => {
  try {
    const emiData = req.body;
    if (!emiData || !emiData.id) {
      return res.status(400).json({ error: "Invalid EMI data" });
    }

    const emi = await EMI.findOneAndUpdate(
      { userId: req.user.id, id: emiData.id },
      {
        userId: req.user.id,
        id: emiData.id,
        name: emiData.name,
        lender: emiData.lender,
        amount: Number(emiData.amount),
        dueDate: Number(emiData.dueDate),
        totalTenure: Number(emiData.totalTenure),
        paidTenure: Number(emiData.paidTenure),
        lastPaidDate: emiData.lastPaidDate
      },
      { new: true, upsert: true }
    );

    res.status(201).json({ message: "EMI saved successfully", emi });
  } catch (error) {
    console.error("Error saving EMI:", error);
    res.status(500).json({ error: "Failed to save EMI" });
  }
});

// DELETE an EMI (user-specific)
app.delete("/api/emis/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await EMI.findOneAndDelete({ userId: req.user.id, id: Number(id) });
    if (result) {
      res.json({ message: "EMI deleted successfully" });
    } else {
      res.status(404).json({ error: "EMI not found" });
    }
  } catch (error) {
    console.error("Error deleting EMI:", error);
    res.status(500).json({ error: "Failed to delete EMI" });
  }
});

// GET all expenses (user-specific)
app.get("/api/expenses", authenticateToken, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id });
    res.json(expenses);
  } catch (error) {
    console.error("Error reading expenses:", error);
    res.status(500).json({ error: "Failed to read expenses" });
  }
});

// POST save / update a single expense (user-specific)
app.post("/api/expenses", authenticateToken, async (req, res) => {
  try {
    const expenseData = req.body;
    if (!expenseData || !expenseData.id) {
      return res.status(400).json({ error: "Invalid expense data" });
    }

    const expense = await Expense.findOneAndUpdate(
      { userId: req.user.id, id: String(expenseData.id) },
      {
        userId: req.user.id,
        id: String(expenseData.id),
        name: expenseData.name,
        amount: Number(expenseData.amount),
        categoryId: Number(expenseData.categoryId),
        templateId: Number(expenseData.templateId),
        isStock: expenseData.isStock || false,
        stockSymbol: expenseData.stockSymbol
      },
      { new: true, upsert: true }
    );

    res.status(201).json({ message: "Expense saved successfully", expense });
  } catch (error) {
    console.error("Error saving expense:", error);
    res.status(500).json({ error: "Failed to save expense" });
  }
});

// POST bulk sync stock expenses (user-specific)
app.post("/api/expenses/sync-stocks", authenticateToken, async (req, res) => {
  try {
    const { templateId, categoryId, stocks } = req.body;
    if (!templateId || !categoryId || !Array.isArray(stocks)) {
      return res.status(400).json({ error: "Invalid sync data" });
    }

    // Delete existing stock expenses for this template & category
    await Expense.deleteMany({
      userId: req.user.id,
      templateId: Number(templateId),
      categoryId: Number(categoryId),
      isStock: true
    });

    // Insert new stock expenses if any
    if (stocks.length > 0) {
      const newExpenses = stocks.map(stock => ({
        userId: req.user.id,
        id: String(stock.id),
        name: stock.name,
        amount: Number(stock.amount),
        categoryId: Number(categoryId),
        templateId: Number(templateId),
        isStock: true,
        stockSymbol: stock.stockSymbol
      }));
      await Expense.insertMany(newExpenses);
    }

    res.json({ message: "Stock expenses synced successfully" });
  } catch (error) {
    console.error("Error syncing stock expenses:", error);
    res.status(500).json({ error: "Failed to sync stock expenses" });
  }
});

// DELETE a specific expense (user-specific)
app.delete("/api/expenses/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Expense.findOneAndDelete({ userId: req.user.id, id });
    if (result) {
      res.json({ message: "Expense deleted successfully" });
    } else {
      res.status(404).json({ error: "Expense not found" });
    }
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

// DELETE all expenses under a template (user-specific)
app.delete("/api/expenses/template/:templateId", authenticateToken, async (req, res) => {
  try {
    const { templateId } = req.params;
    await Expense.deleteMany({ userId: req.user.id, templateId: Number(templateId) });
    res.json({ message: "Expenses deleted for template" });
  } catch (error) {
    console.error("Error deleting template expenses:", error);
    res.status(500).json({ error: "Failed to delete expenses" });
  }
});

// Stocks subfolder setup
const STOCKS_DIR = path.join(TEMPLATES_DIR, "stocks");
// Ensure Stocks folder exists
if (!fs.existsSync(STOCKS_DIR)) {
  fs.mkdirSync(STOCKS_DIR, { recursive: true });
}
// GET stocks for a template
app.get("/api/stocks/:templateId", (req, res) => {
  try {
    const { templateId } = req.params;
    const fileName = `stocks-${templateId}.json`;
    const filePath = path.join(STOCKS_DIR, fileName);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      res.json(JSON.parse(data));
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Error reading stocks for template:", error);
    res.status(500).json({ error: "Failed to read stocks" });
  }
});
// POST save stocks for a template
app.post("/api/stocks/:templateId", (req, res) => {
  try {
    const { templateId } = req.params;
    const stocksList = req.body;
    if (!Array.isArray(stocksList)) {
      return res.status(400).json({ error: "Invalid stocks data" });
    }
    const fileName = `stocks-${templateId}.json`;
    const filePath = path.join(STOCKS_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(stocksList, null, 2), "utf8");
    res.json({ message: "Stocks saved successfully", stocksList });
  } catch (error) {
    console.error("Error saving stocks for template:", error);
    res.status(500).json({ error: "Failed to save stocks" });
  }
});
// EMIs subfolder setup
const EMIS_DIR = path.join(TEMPLATES_DIR, "emis");
// Ensure EMIs folder exists
if (!fs.existsSync(EMIS_DIR)) {
  fs.mkdirSync(EMIS_DIR, { recursive: true });
}
// Automated Migration from old emis.json
const oldEmisPath = path.join(TEMPLATES_DIR, "emis.json");
if (fs.existsSync(oldEmisPath)) {
  try {
    const data = fs.readFileSync(oldEmisPath, "utf8");
    const oldEmis = JSON.parse(data);
    if (Array.isArray(oldEmis)) {
      oldEmis.forEach((emi) => {
        if (emi && emi.id) {
          const filePath = path.join(EMIS_DIR, `emi-${emi.id}.json`);
          if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, JSON.stringify(emi, null, 2), "utf8");
          }
        }
      });
    }
    fs.unlinkSync(oldEmisPath);
    console.log(
      "Successfully migrated old emis.json to templates/emis/ folder",
    );
  } catch (err) {
    console.error("Error migrating old emis.json:", err);
  }
}
// GET all EMIs
app.get("/api/emis", (req, res) => {
  try {
    if (!fs.existsSync(EMIS_DIR)) {
      return res.json([]);
    }
    const files = fs.readdirSync(EMIS_DIR);
    const emis = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const filePath = path.join(EMIS_DIR, file);
        const data = fs.readFileSync(filePath, "utf8");
        return JSON.parse(data);
      });
    res.json(emis);
  } catch (error) {
    console.error("Error reading EMIs:", error);
    res.status(500).json({ error: "Failed to read EMIs" });
  }
});
// POST save / update a single EMI in its own file
app.post("/api/emis", (req, res) => {
  try {
    const emi = req.body;
    if (!emi || !emi.id) {
      return res.status(400).json({ error: "Invalid EMI data" });
    }
    const fileName = `emi-${emi.id}.json`;
    const filePath = path.join(EMIS_DIR, fileName);
    fs.writeFileSync(filePath, JSON.stringify(emi, null, 2), "utf8");
    res.json({ message: "EMI saved successfully", emi });
  } catch (error) {
    console.error("Error saving EMI:", error);
    res.status(500).json({ error: "Failed to save EMI" });
  }
});
// DELETE a specific EMI file
app.delete("/api/emis/:id", (req, res) => {
  try {
    const { id } = req.params;
    const fileName = `emi-${id}.json`;
    const filePath = path.join(EMIS_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: "EMI deleted successfully" });
    } else {
      res.status(404).json({ error: "EMI file not found" });
    }
  } catch (error) {
    console.error("Error deleting EMI:", error);
    res.status(500).json({ error: "Failed to delete EMI" });
  }
});
// POST signup - register a new user
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields (name, email, password) are required." });
    }
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "A user with this email already exists." });
    }
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // Create and save new user
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || "fallbacksecret", { expiresIn: "30d" });

    res.status(201).json({
      message: "Registration successful!",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Failed to register user. Server error." });
  }
});

// POST login - authenticate user and return token
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "fallbacksecret", { expiresIn: "30d" });

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Failed to log in. Server error." });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});