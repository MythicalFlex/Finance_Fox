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
        stockSymbol: expenseData.stockSymbol,
        date: expenseData.date ? new Date(expenseData.date) : new Date()
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
        stockSymbol: stock.stockSymbol,
        date: stock.date ? new Date(stock.date) : new Date()
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

// POST AI Chatbot endpoint (user-specific with financial reasoning)
app.post("/api/ai/chat", authenticateToken, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // 1. Fetch User Data
    const activeTemplate = await Template.findOne({ userId: req.user.id }).sort({ updatedAt: -1 });
    const income = activeTemplate ? activeTemplate.income : 60000;
    
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const expenses = await Expense.find({
      userId: req.user.id,
      date: { $gte: startOfMonth }
    });
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const emis = await EMI.find({ userId: req.user.id });
    const activeEMIs = emis.filter(e => Number(e.paidTenure) < Number(e.totalTenure));
    const totalEMIs = activeEMIs.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalOutstandingDebt = activeEMIs.reduce((sum, e) => sum + (Number(e.amount) * (Number(e.totalTenure) - Number(e.paidTenure))), 0);

    const netSavings = income - totalExpenses - totalEMIs;

    // 2. Intent Classification
    let intent = "general";
    let targetAmount = null;

    const lowerMessage = message.toLowerCase();
    
    // Check for affordability
    const affordRegex = /(?:buy|afford|spend|purchase|cost|price)\s+.*?(\d[\d,]*\s*k?)/i;
    const affordMatch = lowerMessage.match(affordRegex);
    if (affordMatch) {
      intent = "affordability";
      let amountStr = affordMatch[1].replace(/,/g, "").trim();
      if (amountStr.endsWith("k")) {
        targetAmount = parseFloat(amountStr) * 1000;
      } else {
        targetAmount = parseFloat(amountStr);
      }
    } else if (lowerMessage.includes("saving") || lowerMessage.includes("save") || lowerMessage.includes("savings rate")) {
      intent = "savings_rate";
    } else if (lowerMessage.includes("budget") || lowerMessage.includes("over budget") || lowerMessage.includes("category")) {
      intent = "budget_status";
    } else if (lowerMessage.includes("debt") || lowerMessage.includes("emi") || lowerMessage.includes("owe") || lowerMessage.includes("loan")) {
      intent = "debt_load";
    }

    // 3. Deterministic Calculations
    const calculations = {
      income,
      totalExpenses,
      totalEMIs,
      netSavings
    };
    
    let structuredAdvice = [];

    if (intent === "affordability") {
      calculations.targetAmount = targetAmount;
      if (netSavings <= 0) {
        calculations.affordable = false;
        calculations.monthsNeeded = Infinity;
        structuredAdvice.push({
          type: "danger",
          text: `Critical: Your current monthly expenses & EMIs exceed your income (Net Savings: -₹${Math.abs(netSavings)}). You cannot afford this purchase.`
        });
      } else {
        calculations.monthsNeeded = Number((targetAmount / netSavings).toFixed(2));
        calculations.affordable = targetAmount <= netSavings;
        
        if (calculations.affordable) {
          structuredAdvice.push({
            type: "success",
            text: `Yes! You can afford this item immediately (₹${targetAmount.toLocaleString()}) using this month's surplus savings of ₹${netSavings.toLocaleString()}.`
          });
        } else if (calculations.monthsNeeded <= 3) {
          structuredAdvice.push({
            type: "warning",
            text: `Moderate: Safe if you save your monthly surplus of ₹${netSavings.toLocaleString()} for ${calculations.monthsNeeded} months.`
          });
        } else {
          structuredAdvice.push({
            type: "danger",
            text: `Leveraged: This purchase requires saving for ${calculations.monthsNeeded} months. We recommend holding off on this purchase.`
          });
        }
      }
    } else if (intent === "savings_rate") {
      const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;
      calculations.savingsRate = Number(savingsRate.toFixed(2));
      
      if (savingsRate >= 20) {
        calculations.rating = "Excellent";
        structuredAdvice.push({
          type: "success",
          text: `Superb! Your savings rate of ${calculations.savingsRate}% exceeds the recommended 20% savings rule of thumb.`
        });
      } else if (savingsRate >= 10) {
        calculations.rating = "Healthy";
        structuredAdvice.push({
          type: "warning",
          text: `Healthy: Your savings rate is ${calculations.savingsRate}%. Try to cut down discretionary spending to reach 20%.`
        });
      } else if (savingsRate > 0) {
        calculations.rating = "Low";
        structuredAdvice.push({
          type: "danger",
          text: `Low savings rate: You are only saving ${calculations.savingsRate}% of your income. Evaluate your expense logs to find leaks.`
        });
      } else {
        calculations.rating = "Critical";
        structuredAdvice.push({
          type: "danger",
          text: `Critical: You are overspending (Surplus: -₹${Math.abs(netSavings)}). You have a negative savings rate.`
        });
      }
    } else if (intent === "budget_status") {
      const categoriesBreakdown = [];
      let overBudgetCategories = 0;
      
      if (activeTemplate && activeTemplate.categories) {
        activeTemplate.categories.forEach(cat => {
          const catBudget = (income * cat.percentage) / 100;
          const catSpent = expenses.filter(e => e.categoryId === cat.id).reduce((sum, e) => sum + e.amount, 0);
          const percentUsed = catBudget > 0 ? (catSpent / catBudget) * 100 : 0;
          const status = {
            name: cat.name,
            budget: catBudget,
            spent: catSpent,
            percentUsed: Number(percentUsed.toFixed(1)),
            overBudget: catSpent > catBudget
          };
          categoriesBreakdown.push(status);
          
          if (status.overBudget) {
            overBudgetCategories++;
            structuredAdvice.push({
              type: "danger",
              text: `Over Limit: "${cat.name}" has consumed ${status.percentUsed}% of its ₹${catBudget.toLocaleString()} limit (Over by ₹${(catSpent - catBudget).toLocaleString()}).`
            });
          } else if (percentUsed >= 90) {
            structuredAdvice.push({
              type: "warning",
              text: `Near Limit: "${cat.name}" has consumed ${status.percentUsed}% of its ₹${catBudget.toLocaleString()} limit.`
            });
          }
        });
      }

      calculations.categories = categoriesBreakdown;
      calculations.overBudgetCategories = overBudgetCategories;

      if (overBudgetCategories === 0) {
        structuredAdvice.push({
          type: "success",
          text: "Excellent: All spending categories are currently within their budget limits!"
        });
      }
    } else if (intent === "debt_load") {
      const emiRatio = income > 0 ? (totalEMIs / income) * 100 : 0;
      calculations.emiRatio = Number(emiRatio.toFixed(2));
      calculations.totalOutstandingDebt = totalOutstandingDebt;
      calculations.activeEMIsCount = activeEMIs.length;

      if (emiRatio > 35) {
        structuredAdvice.push({
          type: "danger",
          text: `High Leverage: Your monthly EMI commitments consume ${calculations.emiRatio}% of your income. Keep it below 35%.`
        });
      } else if (emiRatio > 15) {
        structuredAdvice.push({
          type: "warning",
          text: `Moderate Leverage: Your EMI-to-income ratio is ${calculations.emiRatio}%. Avoid taking on new debt.`
        });
      } else if (emiRatio > 0) {
        structuredAdvice.push({
          type: "success",
          text: `Low Debt: Your EMI load is healthy at ${calculations.emiRatio}% of your monthly income.`
        });
      } else {
        structuredAdvice.push({
          type: "success",
          text: "Zero Debt Load: You currently have no outstanding active EMIs!"
        });
      }
    }

    // 4. Explanation Generation (LLM or mock fallback)
    let explanation = "";
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      // Gemini API real call using built-in fetch
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        
        let contextPrompt = `You are Finance Fox AI, a financial assistant. The user asked: "${message}".
Here is their verified financial data from their profile:
- Monthly Income: ₹${income}
- Total Monthly Expenses: ₹${totalExpenses}
- Total Monthly EMIs: ₹${totalEMIs}
- Net Monthly Savings: ₹${netSavings}
- Active Template: ${activeTemplate ? activeTemplate.name : 'Default'}
`;

        if (intent === "affordability") {
          contextPrompt += `
Deterministic affordability calculations:
- Target Item Price: ₹${targetAmount}
- Can afford immediately: ${calculations.affordable}
- Months of saving needed: ${calculations.monthsNeeded}
`;
        } else if (intent === "savings_rate") {
          contextPrompt += `
Deterministic savings calculations:
- Savings Rate: ${calculations.savingsRate}%
- Rating: ${calculations.rating}
`;
        } else if (intent === "budget_status") {
          contextPrompt += `
Deterministic budget calculations:
- Categories: ${JSON.stringify(calculations.categories)}
- Number of categories over budget: ${calculations.overBudgetCategories}
`;
        } else if (intent === "debt_load") {
          contextPrompt += `
Deterministic debt calculations:
- EMI to Income Ratio: ${calculations.emiRatio}%
- Total Outstanding Debt: ₹${calculations.totalOutstandingDebt}
- Active Loans: ${calculations.activeEMIsCount}
`;
        }

        contextPrompt += `
Write a concise, professional explanation (maximum 2-3 short paragraphs) answering the user's question directly using these exact numbers. Explain the math and data fetched. Provide short actionable tips. Be encouraging but honest. Do not use markdown headers (like # or ##), just return normal text or bullet lists.`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: contextPrompt }] }]
          })
        });

        if (response.ok) {
          const resData = await response.json();
          if (resData.candidates && resData.candidates[0] && resData.candidates[0].content && resData.candidates[0].content.parts && resData.candidates[0].content.parts[0]) {
            explanation = resData.candidates[0].content.parts[0].text;
          }
        }
      } catch (err) {
        console.error("Gemini API call error, falling back to deterministic explanation:", err);
      }
    }

    // Fallback explanation if no API key or API fails
    if (!explanation) {
      if (intent === "affordability") {
        if (netSavings <= 0) {
          explanation = `Based on your real financial logs, you cannot currently afford to buy this item for ₹${targetAmount.toLocaleString()} because your net monthly savings are negative (₹${netSavings}). You are spending ₹${totalExpenses.toLocaleString()} on expenses and paying ₹${totalEMIs.toLocaleString()} in EMIs against an income of ₹${income.toLocaleString()}. 

I highly recommend reviewing your discretionary expense categories (like dining out or shopping) or restructuring your EMIs before making any new purchases.`;
        } else {
          const affordabilityText = calculations.affordable 
            ? `Yes, you can afford to buy this item for ₹${targetAmount.toLocaleString()} immediately! Your net monthly savings are ₹${netSavings.toLocaleString()} (Income ₹${income.toLocaleString()} - Expenses ₹${totalExpenses.toLocaleString()} - EMIs ₹${totalEMIs.toLocaleString()}), which is greater than the cost of the item. This purchase will leave you with a surplus of ₹${netSavings - targetAmount} in savings this month.`
            : `You cannot afford this item immediately using this month's savings, but you can afford it by saving for **${calculations.monthsNeeded} months**. Your current net monthly savings are ₹${netSavings.toLocaleString()}. If you allocate your entire surplus, you will reach the target of ₹${targetAmount.toLocaleString()} in approximately ${Math.ceil(calculations.monthsNeeded)} months.`;

          explanation = `${affordabilityText}

This analysis assumes your monthly income, expenses, and EMI structures remain stable. If you decide to proceed, try to automate a transfer of ₹${netSavings} into a dedicated savings bucket.`;
        }
      } else if (intent === "savings_rate") {
        explanation = `Your current savings rate is **${calculations.savingsRate}%**. 

This is calculated by taking your net monthly surplus of **₹${netSavings.toLocaleString()}** (Income of ₹${income.toLocaleString()} minus Expenses of ₹${totalExpenses.toLocaleString()} and EMIs of ₹${totalEMIs.toLocaleString()}) and dividing it by your income. 

Here is the rating: **${calculations.rating}**. Financial planners generally recommend a savings rate of at least 20% to build wealth and fund retirement. ${calculations.savingsRate < 20 ? "To increase this rate, look into reducing expenses or paying down high-interest EMIs." : "Excellent job maintaining a disciplined saving structure!"}`;
      } else if (intent === "budget_status") {
        const overList = calculations.categories.filter(c => c.overBudget);
        const nearList = calculations.categories.filter(c => !c.overBudget && c.percentUsed >= 90);
        
        let budgetDetails = `Against your monthly income of ₹${income.toLocaleString()}, you have spent a total of **₹${totalExpenses.toLocaleString()}** this month. 

`;
        if (overList.length > 0) {
          budgetDetails += `You have exceeded your budget limits in **${overList.length}** category/categories:
` + overList.map(c => `- **${c.name}**: Spent ₹${c.spent.toLocaleString()} / Budget ₹${c.budget.toLocaleString()} (${c.percentUsed}% used)`).join("\n") + "\n\n";
        }
        if (nearList.length > 0) {
          budgetDetails += `You are close to the limit in **${nearList.length}** category/categories:
` + nearList.map(c => `- **${c.name}**: Spent ₹${c.spent.toLocaleString()} / Budget ₹${c.budget.toLocaleString()} (${c.percentUsed}% used)`).join("\n") + "\n\n";
        }
        if (overList.length === 0 && nearList.length === 0) {
          budgetDetails += `Fantastic! All your spending categories are currently within their allocated limits. Your budget is in perfect health.`;
        } else {
          budgetDetails += `Please adjust your spending in the over-limit categories to prevent eroding your monthly savings goals.`;
        }
        explanation = budgetDetails;
      } else if (intent === "debt_load") {
        explanation = `Your monthly EMI debt load is **₹${totalEMIs.toLocaleString()}**, representing **${calculations.emiRatio}%** of your monthly income of ₹${income.toLocaleString()}. 

Your total outstanding debt principal is **₹${totalOutstandingDebt.toLocaleString()}** across **${calculations.activeEMIsCount}** active loan(s). 

An EMI-to-income ratio of **${calculations.emiRatio}%** is considered **${calculations.emiRatio > 35 ? "High (Critical)" : "Healthy"}**. Keeping your total fixed debt obligations under 35% of your gross income ensures you maintain enough flexibility to save and pay for daily living expenses.`;
      } else {
        explanation = `Hello! I am your Finance Fox AI Assistant. I can help you analyze your budget templates, expense records, and debt loads. 

Here is a summary of your current financial health:
- **Monthly Income**: ₹${income.toLocaleString()}
- **Month Expenses**: ₹${totalExpenses.toLocaleString()}
- **Active EMIs**: ₹${totalEMIs.toLocaleString()}
- **Current Surplus (Net Savings)**: ₹${netSavings.toLocaleString()}

Ask me something specific, like:
- *"Can I afford a laptop for ₹45,000?"*
- *"What is my savings rate?"*
- *"Am I over budget?"*
- *"Show my debt load"*`;
      }
    }

    // 5. Return structured response
    res.json({
      explanation,
      intent,
      calculations,
      structuredAdvice
    });

  } catch (error) {
    console.error("AI Chat error:", error);
    res.status(500).json({ error: "AI Chat server error." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});