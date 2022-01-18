const { StatusCodes } = require("http-status-codes");
const Order = require("../models/Order");
const Product = require("../models/Product");
const CustomError = require("../errors");
const { checkOwnership } = require("../utils");

const fakeStripeAPI = async ({ total, currency }) => {
  const client_secret = "sl;kja23rawliugx";
  return { client_secret, total };
};

const getAllOrders = async (req, res) => {
  const allOrders = await Order.find({});
  res
    .status(StatusCodes.OK)
    .json({ count: allOrders.length, orders: allOrders });
};

const getSingleOrder = async (req, res) => {
  const { orderId } = req.params;
  const singleOrder = await Order.findOne({ _id: orderId });
  if (!singleOrder) {
    throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
  }
  checkOwnership(req.user, singleOrder.user);
  res.status(StatusCodes.OK).json({ order: singleOrder });
};

const getCurrentUserOrders = async (req, res) => {
  const { id: user } = req.user;
  const userOrders = await Order.find({ user });
  res
    .status(StatusCodes.OK)
    .json({ count: userOrders.length, orders: userOrders });
};

const createOrder = async (req, res) => {
  const { items, tax, shippingFee } = req.body;
  if (!items || items.length < 1) {
    throw new CustomError.BadRequestError("No order items");
  }
  if (!tax || !shippingFee) {
    throw new CustomError.BadRequestError("Tax or shipping fee missing");
  }

  let subtotal = 0;
  for (let item of items) {
    const itemProduct = await Product.findOne({ _id: item.product });
    if (!itemProduct) {
      throw new CustomError.NotFoundError(
        `No product with id: ${item.product}`
      );
    }
    const { name, price, image } = itemProduct;
    item.name = name;
    item.price = price;
    item.image = image;
    subtotal += item.amount * item.price;
  }

  const total = subtotal + shippingFee + tax;
  const paymentIntent = await fakeStripeAPI({
    total,
    currentcy: "usd",
  });
  const order = await Order.create({
    items,
    total,
    subtotal,
    tax,
    shippingFee,
    clientSecret: paymentIntent.client_secret,
    user: req.user.id,
  });
  res
    .status(StatusCodes.CREATED)
    .json({ order, clientSecret: order.clientSecret });
};

const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const { paymentIntent } = req.body;
  const orderUpdate = await Order.findOne({ _id: orderId });
  if (!orderUpdate) {
    throw new CustomError.NotFoundError(`No order with id: ${orderId}`);
  }
  checkOwnership(req.user, orderUpdate.user);

  orderUpdate.paymentIntent = paymentIntent;
  orderUpdate.status = "paid";
  await orderUpdate.save();
  res.status(StatusCodes.OK).json({ order: orderUpdate });
};

module.exports = {
  getAllOrders,
  getSingleOrder,
  getCurrentUserOrders,
  createOrder,
  updateOrder,
};
