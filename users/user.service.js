const config = require("config.json");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("_helpers/db");
const User = db.User;
const refreshTokenService = require("./refresh-token.service");

module.exports = {
  authenticate,
  getAll,
  getById,
  create,
  update,
  delete: _delete,
  refreshToken,
  revokeToken,
};
//
async function authenticate({ username, password, ipAddress }) {
  const user = await User.findOne({ username });
  if (!user && !bcrypt.compareSync(password, user.hash)) {
    throw "Username or Password is incorrect";
  }
  const token = refreshTokenService.generateJwtToken(user);
  const refreshToken = refreshTokenService.generateRefreshToken(
    user,
    ipAddress
  );

  await refreshToken.save();
  return {
    ...refreshTokenService.basicDetails(user),
    token,
    refreshToken: refreshToken.token,
  };
}

async function getAll() {
  return await User.find();
}

async function getById(id) {
  return await User.findById(id);
}

async function create(userParam) {
  // validate
  if (
    (await User.findOne({ username: userParam.username })) &&
    (await User.findOne({ email: userParam.email }))
  ) {
    throw (
      'Username "' +
      userParam.username +
      '" or Email "' +
      userParam.email +
      '" is already taken'
    );
  }

  const user = new User(userParam);

  // hash password
  if (userParam.password) {
    user.hash = bcrypt.hashSync(userParam.password, 10);
  }

  // save user
  await user.save();
}

async function update(id, userParam) {
  const user = await User.findById(id);

  // validate
  if (!user) throw "User not found";
  if (
    user.username !== userParam.username &&
    (await User.findOne({ username: userParam.username }))
  ) {
    throw 'Username "' + userParam.username + '" is already taken';
  }

  // hash password if it was entered
  if (userParam.password) {
    userParam.hash = bcrypt.hashSync(userParam.password, 10);
  }

  // copy userParam properties to user
  Object.assign(user, userParam);

  await user.save();
}

async function _delete(id) {
  await User.findByIdAndRemove(id);
}

async function refreshToken({ token, ipAddress }) {
  const refreshToken = await refreshTokenService.getRefreshToken(token);
  const { user } = refreshToken;

  //replace old refresh token with a new one
  const newRefreshToken = refreshTokenService.generateRefreshToken(
    user,
    ipAddress
  );
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.replacedByToken = newRefreshToken.token;
  await refreshToken.save();
  await newRefreshToken.save();

  //generate new jwt
  const JwtToken = refreshTokenService.generateJwtToken(user);
  //return details and tokens
  return {
    ...refreshTokenService.basicDetails(user),
    token: JwtToken,
    refreshToken: newRefreshToken.token,
  };
}

async function revokeToken({ token, ipAddress }) {
  const refreshToken = await refreshTokenService.getRefreshToken(token);

  //remove token and save
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  await refreshToken.save();
}
