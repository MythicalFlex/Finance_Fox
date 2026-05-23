const mongoose = require("mongoose");

const emiSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    lender: {
      type: String,
      required: true,
      trim: true
    },
    amount: {
      type: Number,
      required: true
    },
    dueDate: {
      type: Number,
      required: true
    },
    totalTenure: {
      type: Number,
      required: true
    },
    paidTenure: {
      type: Number,
      required: true,
      default: 0
    },
    lastPaidDate: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    collection: "emis"
  }
);

// Compound index to ensure uniqueness of emi id per user
emiSchema.index({ userId: 1, id: 1 }, { unique: true });

module.exports = mongoose.model("EMI", emiSchema);
