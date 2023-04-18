const asyncHandler = require('express-async-handler');
const FormData = require('../models/formModel');
const UserData = require('../models/userModel');
const ResponseData = require('../models/responseModel');
// const ResourceData = require('../models/resourceModel');
const mongoose = require('mongoose');

// Create Form
const createForm = asyncHandler(async (req, res) => {
  const { createdBy, category, questions } = req.body;

  //   Validation
  // || !questionText || !optionText
  if (!category || !questions) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  // Create Form
  const Form = await FormData.create({
    createdBy,
    category,
    questions,
  });
  // console.log('Form: ', Form);

  await UserData.updateOne(
    { _id: Form.createdBy.userId },
    {
      $push: {
        createdForms: {
          formId: Form._id,
          categories: Form.category,
        },
      },
    }
  );

  res.status(201).json(Form);
});

// Get all Forms of user
const getAllFormsofUser = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const allFormsofUser = await FormData.find({
    'createdBy.userId': userId,
  }).sort('-createdAt');
  // console.log('allFormsofUser: ', allFormsofUser);
  res.status(200).json(allFormsofUser);
});
// Get all the Forms
const getAllForms = asyncHandler(async (req, res) => {
  const allForms = await FormData.find().sort('-createdAt');
  res.status(200).json(allForms);
});

// Get single Form
const getFormById = asyncHandler(async (req, res) => {
  const { formId } = req.params;
  const Form = await FormData.findById(formId);
  // if product doesnt exist
  if (!Form) {
    res.status(404);
    throw new Error('Form not found');
  }
  res.status(200).json(Form);
});

// Delete Product
const deleteForm = asyncHandler(async (req, res) => {
  const formId = req.params.formId;
  // console.log('formId: ', formId);
  const form = await FormData.findById(formId);
  console.log('form: ', form);
  // if product doesnt exist
  if (!form) {
    res.status(404);
    throw new Error('Form not found');
  }
  // Match product to its user
  if (form.createdBy.toString() !== req.user.id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }
  await form.remove();
  await UserData.updateOne(
    { _id: form.createdBy },
    {
      $pull: {
        createdForms: {
          formId: form._id,
          category: form.category,
        },
      },
    }
  );

  res
    .status(200)
    .json({ message: `Form : ${form.title} is successfully deleted` });
});

// Update Form
const editForm = asyncHandler(async (req, res) => {
  const { category, questions } = req.body;
  const { formId } = req.params;

  console.log('id: ', formId);
  console.log('category: ', category);
  // console.log('description: ', description);
  console.log('questions: ', questions);

  const form = await FormData.findById(formId);

  // if Form doesnt exist
  if (!form) {
    res.status(404);
    throw new Error('Form not found');
  }
  // Match Form to its user
  if (form.createdBy.toString() !== req.user.id) {
    res.status(401);
    throw new Error('User not authorized');
  }

  // edited Form
  const editedForm = await FormData.findByIdAndUpdate(
    { _id: formId },
    {
      category,
      questions,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  console.log('Edited Form: ', editedForm);

  res.status(200).json(editedForm);
});

//Submit Response
const submitResponse = asyncHandler(async (req, res) => {
  const { formId, user, response } = req.body;
  // console.log('formId: ', typeof formId);
  // console.log('formId: ', formId);
  // console.log('user: ', user);
  // console.log('response: ', response);

  if (!response) {
    throw new Error('Please fill in a response');
  }

  const createdResponse = await ResponseData.create({
    formId,
    user,
    response,
  });

  return res.status(200).json(createdResponse);
});

// Get all Response of user
const getAllResponseForms = asyncHandler(async (req, res) => {
  const allResponseForms = await ResponseData.aggregate([
    {
      $match: { user: new mongoose.Types.ObjectId(req.user.id) },
    },
    {
      $lookup: {
        from: 'Form',
        localField: 'formId',
        foreignField: '_id',
        pipeline: [{ $project: { createdBy: 1, category: 1 } }],
        as: 'resForm',
      },
    },
    {
      $project: {
        resForm: { $first: '$resForm' },
        response: 1,
        formId: 1,
        user: 1,
        createdAt: 1,
      },
    },
  ]);
  res.status(200).json(allResponseForms);
});

// get a Response
const getResponse = asyncHandler(async (req, res) => {
  const { formId } = req.params;

  const Response = await ResponseData.aggregate([
    {
      $match: { formId: new mongoose.Types.ObjectId(formId) },
    },
    {
      $lookup: {
        from: 'users',
        foreignField: '_id',
        localField: 'user',
        as: 'user',
        pipeline: [{ $project: { name: 1, email: 1, role: 1 } }],
      },
    },
    {
      $project: {
        formId: 1,
        user: { $first: '$user' },
        response: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);
  // console.log('Response(in getResponse formController): ', Response);
  // if response doesnt exist
  if (!Response) {
    res.status(404);
    throw new Error('Response not found');
  }

  res.status(200).json(Response);
});

module.exports = {
  createForm,
  getAllForms,
  getAllFormsofUser,
  getFormById,
  deleteForm,
  editForm,
  submitResponse,
  getAllResponseForms,
  getResponse,
};
