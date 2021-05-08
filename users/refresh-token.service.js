const config = require("config.json");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("_helpers/db");

module.exports = {
  getRefreshToken,
  generateJwtToken,
  generateRefreshToken,
  basicDetails,
};

async function getRefreshToken(token) {
  const refreshToken = await db.RefreshToken.findOne({ token }).populate(
    "user"
  );
  if (!refreshToken || !refreshToken.isActive) throw "Invalid token";
  return refreshToken;
}
function generateJwtToken(user) {
  //create a jwt token containing the user id that expires in 15 m
  return jwt.sign({ sub: user.id, id: user.id }, config.secret, {
    expiresIn: "15m",
  });
}
function generateRefreshToken(user, ipAddress) {
  //create a refresh token containing the user id that expires in 7 days
  return new db.RefreshToken({
    user: user.id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: ipAddress,
  });
}
function randomTokenString() {
  return crypto.randomBytes(40).toString("hex");
}
function basicDetails(user) {
  const { id, username, email } = user;
  return { id, username, email };
}
