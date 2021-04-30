const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  id: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  image: { type: String, required: false },
  price: { type: String, required: true },
  stars: { type: Number, required: false },
  reviewNumber: { type: Number, required: false },
});

schema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.hash;
  },
});

module.exports = mongoose.model("StoreItems", schema);
