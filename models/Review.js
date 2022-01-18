const mongoose = require("mongoose");

const ReviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, "Please provide rating"],
    },
    title: {
      type: String,
      trim: true,
      required: [true, "Please provide title"],
      maxlength: 100,
    },
    comment: {
      type: String,
      required: [true, "Please provide comment"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

ReviewSchema.statics.calculateReviewStats = async function (product) {
  const result = await this.aggregate([
    { $match: { product } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        reviewsCount: { $sum: 1 },
      },
    },
  ]);
  try {
    await this.model("Product").findOneAndUpdate(
      { _id: product },
      {
        averageRating: Math.ceil(result[0]?.averageRating) || 0,
        reviewsCount: result[0]?.reviewsCount || 0,
      }
    );
  } catch (error) {
    console.log(error);
  }
};

ReviewSchema.post("save", async function () {
  await this.constructor.calculateReviewStats(this.product);
});

ReviewSchema.post("remove", async function () {
  await this.constructor.calculateReviewStats(this.product);
});

module.exports = mongoose.model("Review", ReviewSchema);
