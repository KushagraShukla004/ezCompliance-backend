const asyncHandler = require('express-async-handler');
const CategoryData = require('../models/categoryModel');
const mongoose = require('mongoose');

//Create a Category
const addCategory = asyncHandler(async (req, res) => {
  const { createdBy, category } = req.body;

  if (!createdBy || !category) {
    res.status(400);
    throw new Error('Please fill in all fields');
  }
  const existingCategory = await CategoryData.find({ category: category });

  if (category === existingCategory?.category) {
    res.status(400);
    throw new Error('Category Already Exists');
  }

  // Create Category
  const Category = await CategoryData.create({
    createdBy,
    category,
  });
  res.status(201).json(Category);
});

//Get all Categories
const getAllCategories = asyncHandler(async (req, res) => {
  const allCategories = await CategoryData.find().sort('-createdAt');
  res.status(200).json(allCategories);
});

//Edit a Category
const editCategory = asyncHandler(async (req, res) => {
  const { cat_id, category } = req.body;
  console.log('id: ', cat_id);
  console.log('category: ', category);

  const Category = await CategoryData.findById(cat_id);

  if (!Category) {
    res.status(404);
    throw new Error('Category not found');
  }
  const editCategory = await CategoryData.findByIdAndUpdate(
    { _id: cat_id },
    { category },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).json(editCategory);
});

//Delete a Category
const deleteCategory = asyncHandler(async (req, res) => {
  const { cat_id } = req.params;

  console.log(`cat_Id :`, cat_id);
  // console.log(`req.body category :`, category);
  const DelCategory = await CategoryData.findById(cat_id);
  // console.log(`DelCategory :`, DelCategory);
  console.log(`DelCategory.category :`, DelCategory?.category);

  if (!DelCategory) {
    res.status(404);
    throw new Error('Category not found');
  }
  // if (DelCategory?.category !== category) {
  //     res.status(404);
  //     throw new Error('The id does not belong to this Category or vice versa');
  // }
  await DelCategory.remove();

  res.status(200).json({
    message: `Category : ${DelCategory.category} is successfully deleted`,
  });
});
module.exports = {
  addCategory,
  getAllCategories,
  editCategory,
  deleteCategory,
};
