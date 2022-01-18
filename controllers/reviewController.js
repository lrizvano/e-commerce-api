const { StatusCodes } = require("http-status-codes");
const Review = require("../models/Review");
const Product = require("../models/Product");
const CustomError = require("../errors");
const { checkOwnership } = require("../utils");

const createReview = async (req, res) => {
  const { product } = req.body;
  const { id: user } = req.user;
  const isProductValid = await Product.findOne({ _id: product });
  if (!isProductValid) {
    throw new CustomError.NotFoundError(`No product with id: ${product}`);
  }
  const isAlreadyReviewed = await Review.findOne({ product, user });
  if (isAlreadyReviewed) {
    throw new CustomError.BadRequestError("User already reviewed product");
  }
  req.body.user = user;
  console.log(req.body);
  const createdReview = await Review.create(req.body);
  res.status(StatusCodes.CREATED).json({ review: createdReview });
};

const getAllReviews = async (req, res) => {
  const allReviews = await Review.find({});
  res
    .status(StatusCodes.OK)
    .json({ count: allReviews.length, reviews: allReviews });
};

const getSingleReview = async (req, res) => {
  const { reviewId } = req.params;
  const singleReview = await Review.findOne({ _id: reviewId });
  if (!singleReview) {
    throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
  }
  res.status(StatusCodes.OK).json({ reviews: singleReview });
};

const updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { rating, title, comment } = req.body;
  const updatedReview = await Review.findOne({ _id: reviewId });
  if (!updatedReview) {
    throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
  }
  checkOwnership(req.user, updatedReview.user);
  updatedReview.rating = rating;
  updatedReview.title = title;
  updatedReview.comment = comment;
  await updatedReview.save();
  res.status(StatusCodes.OK).json({ review: updatedReview });
};

const deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const deletedReview = await Review.findOne({ _id: reviewId });
  if (!deletedReview) {
    throw new CustomError.NotFoundError(`No review with id: ${reviewId}`);
  }
  checkOwnership(req.user, deletedReview.user);
  await deletedReview.remove();
  res.status(StatusCodes.OK).json({ msg: "Review deleted" });
};

const getSingleProductReviews = async (req, res) => {
  const { productId } = req.params;
  const productReviews = await Review.find({ productId });
  res
    .status(StatusCodes.OK)
    .json({ count: productReviews.length, reviews: productReviews });
};

module.exports = {
  createReview,
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  getSingleProductReviews,
};
