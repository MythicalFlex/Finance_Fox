const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  percentage: { type: Number, required: true },
  color: { type: String, required: true },
  icon: { type: String, required: true }
});

const templateSchema = new mongoose.Schema(
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
    income: {
      type: Number,
      required: true
    },
    categories: [categorySchema]
  },
  {
    timestamps: true,
    collection: "templates"
  }
);

// Compound index to ensure uniqueness of template id per user
templateSchema.index({ userId: 1, id: 1 }, { unique: true });

module.exports = mongoose.model("Template", templateSchema);
