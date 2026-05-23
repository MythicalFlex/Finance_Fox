const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    id: {
      type: String, // String to handle both number-based timestamps and stock-based custom strings
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true
    },
    categoryId: {
      type: Number,
      required: true
    },
    templateId: {
      type: Number,
      required: true
    },
    isStock: {
      type: Boolean,
      default: false
    },
    stockSymbol: {
      type: String
    }
  },
  {
    timestamps: true,
    collection: "expenses"
  }
);

// Compound index to ensure uniqueness of expense id per user
expenseSchema.index({ userId: 1, id: 1 }, { unique: true });

module.exports = mongoose.model("Expense", expenseSchema);
