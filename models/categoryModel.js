var mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    createdBy: {
      _id: false,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      name: String,
      email: String,
      role: String,
    },
    category: {
      type: String,
      unique: true,
      required: [true, "Please add a Category"],
    },
  },
  { timestamps: true }
);

const CategoryData = mongoose.model("Category", CategorySchema, "Categories");

module.exports = CategoryData;
