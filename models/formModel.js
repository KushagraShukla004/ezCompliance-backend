const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const FormSchema = new mongoose.Schema(
  {
    createdBy: {
      _id: false,
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      emp_Id: {
        type: String,
        ref: "User",
      },
      name: String,
      email: String,
      role: String,
    },
    category: {
      type: mongoose.Schema.Types.String,
      ref: "Category",
    },
    questions: [
      {
        questionText: String,
        options: [
          {
            optionText: String,
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

FormSchema.plugin(mongoosePaginate);
const FormData = mongoose.model("Form", FormSchema, "Form");

module.exports = FormData;
