var mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

var ResourceSchema = new mongoose.Schema(
  {
    employee: {
      _id: false,
      emp_Id: {
        type: String,
        ref: 'User',
      },
      name: String,
      email: String,
      designation: String,
    },
    name: {
      type: String,
      required: [true, 'Please add a Name'],
    },
    IP: {
      type: String,
    },
    category: {
      type: String,
      required: [true, 'Please add a Category'],
    },
    makeModel: {
      type: String,
      required: [true, 'Please add a Make Model'],
    },
    amount: {
      type: Number,
      required: [true, 'Please add an Amount'],
    },
  },
  { timestamps: true }
);

ResourceSchema.plugin(mongoosePaginate);
const Resource = mongoose.model('ResourceData', ResourceSchema, 'Resources');

module.exports = Resource;
