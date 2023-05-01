var mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

var ResponseSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    employee: {
      _id: false,
      empId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      name: String,
      email: String,
      role: String,
    },

    response: [
      {
        questionId: String,
        questionText: String,
        optionId: String,
        optionText: String,
      },
    ],
  },
  { timestamps: true }
);

ResponseSchema.plugin(mongoosePaginate);
const Response = mongoose.model('ResponseData', ResponseSchema, 'Response');

module.exports = Response;
