const Product = require("../models/Product");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const path = require("path");

const createProduct = async (req, res) => {
  req.body.user = req.user.id;
  const createdProduct = await Product.create(req.body);
  res.status(StatusCodes.CREATED).json({ product: createdProduct });
};

const getAllProducts = async (req, res) => {
  const products = await Product.find({});
  res.status(StatusCodes.OK).json({ count: products.length, products });
};

const getSingleProduct = async (req, res) => {
  const idProduct = await Product.findOne({
    _id: req.params.productId,
  }).populate("reviews");
  if (!idProduct) {
    throw new CustomError.NotFoundError(
      `No product with id: ${req.params.productId}`
    );
  }
  res.status(StatusCodes.OK).json({ product: idProduct });
};

const updateProduct = async (req, res) => {
  const idProduct = await Product.findOneAndUpdate(
    { _id: req.params.productId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!idProduct) {
    throw new CustomError.NotFoundError(
      `No product with id: ${req.params.productId}`
    );
  }
  res.status(StatusCodes.OK).json({ product: idProduct });
};

const deleteProduct = async (req, res) => {
  const idProduct = await Product.findOne({ _id: req.params.productId });
  if (!idProduct) {
    throw new CustomError.NotFoundError(
      `No product with id: ${req.params.productId}`
    );
  }
  await idProduct.remove();
  res.status(StatusCodes.OK).json({ msg: "Product deleted" });
};

const uploadImage = async (req, res) => {
  if (!req.files) {
    throw new CustomError.BadRequestError("No file uploaded");
  }
  const productImage = req.files.image;
  if (!productImage.mimetype.startsWith("image")) {
    throw new CustomError.BadRequestError("Upload not image");
  }
  const maxSize = 1024 * 1024;
  if (productImage.size > maxSize) {
    throw new CustomError.BadRequestError("Image larger than 1MB");
  }
  const imagePath = path.join(
    __dirname,
    "../public/uploads/" + productImage.name
  );
  await productImage.mv(imagePath);
  res.status(StatusCodes.OK).json({ image: `/uploads/${productImage.name}` });
};

module.exports = {
  createProduct,
  getAllProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
};
