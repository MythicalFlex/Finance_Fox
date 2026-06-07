const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    templateId: {
      type: Number,
      required: true
    },
    symbol: {
      type: String,
      required: true,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    sector: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true,
    collection: "stocks"
  }
);

// Compound index to ensure uniqueness of symbol per templateId
stockSchema.index({ templateId: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model("Stock", stockSchema);
