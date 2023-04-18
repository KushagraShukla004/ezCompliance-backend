const asyncHandler = require('express-async-handler');
const FormData = require('../models/formModel');
const UserData = require('../models/userModel');
const ResourceData = require('../models/resourceModel');
const mongoose = require('mongoose');

//Create Resource Information
const addResource = asyncHandler(async (req, res) => {
  const { employee, name, IP, category, makeModel, amount } = req.body;

  //   Validation
  // || !questionText || !optionText
  if (!employee || !name || !IP || !category || !makeModel || !amount) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }

  // Create Resource
  const Resource = await ResourceData.create({
    employee,
    name,
    IP,
    category,
    makeModel,
    amount,
  });

  //   console.log('Resource: ', Resource);

  await UserData.updateOne(
    { emp_Id: Resource.employee.emp_Id },
    {
      $push: {
        resources: {
          name: Resource.name,
          IP: Resource.IP,
          category: Resource.category,
          amount: Resource.amount,
        },
      },
    }
  );

  res.status(201).json(Resource);
  //   res.send('add a Resource here ');
});

//get user Resources
const getResource = asyncHandler(async (req, res) => {
  const { res_id } = req.params;

  const Resource = await ResourceData.findById(res_id);

  if (!Resource) {
    res.status(404);
    throw new Error('Resource not found');
  }
  res.status(201).json(Resource);
});

// Get all Resources of user
const getAllUserResources = asyncHandler(async (req, res) => {
  const emp_Id = req.user.emp_Id;

  const allResourcesofUser = await ResourceData.find({
    'employee.emp_Id': emp_Id,
  }).sort('-createdAt');

  // console.log('allResourcesofUser: ', allResourcesofUser);

  res.status(200).json(allResourcesofUser);
});
// Get all the Forms
const getAllResources = asyncHandler(async (req, res) => {
  const AllResources = await ResourceData.find().sort('-createdAt');
  res.status(200).json(AllResources);
});
module.exports = {
  addResource,
  getResource,
  getAllUserResources,
  getAllResources,
};
