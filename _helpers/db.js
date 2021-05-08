const config = require("config.json");
const mongoose = require("mongoose");
const connectionOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};
mongoose
  .connect(
    process.env.MONGODB_URI || config.connectionString,
    connectionOptions
  )
  .then(() => {
    console.log("Connected to the database!");
  })
  .catch((err) => {
    console.log("Cannot connect to the database!", err);
    process.exit;
  });

mongoose.Promise = global.Promise;

module.exports = {
  User: require("../users/user.model"),
  StoreItems: require("../store-items/store-item.model"),
  RefreshToken: require("../users/refresh-token.model"),
};
