const express = require("express");
const router = express.Router();
const userService = require("./user.service");
const Joi = require("joi");
const validateRequest = require("../_helpers/validate-request");
// routes
router.post("/authenticate", authenticateSchema, authenticate);
router.post("/register", register);
router.get("/", getAll);
router.get("/current", getCurrent);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/:id", _delete);
router.post("/refresh-token", refreshToken);
router.post("/revoke-token", revokeTokenSchema, revokeToken);

module.exports = router;

function authenticate(req, res, next) {
  const { username, password } = req.body;
  const ipAddress = req.ip;
  userService
    .authenticate({ username, password, ipAddress })
    .then(({ refreshToken, ...user }) => {
      setTokenCookie(res, refreshToken);
      res.json(user);
    })
    .catch(next);
}

function register(req, res, next) {
  userService
    .create(req.body)
    .then(() => res.json({}))
    .catch((err) => next(err));
}

function getAll(req, res, next) {
  userService
    .getAll()
    .then((users) => res.json(users))
    .catch((err) => next(err));
}

function getCurrent(req, res, next) {
  userService
    .getById(req.user.sub)
    .then((user) => (user ? res.json(user) : res.sendStatus(404)))
    .catch((err) => next(err));
}

function getById(req, res, next) {
  userService
    .getById(req.params.id)
    .then((user) => (user ? res.json(user) : res.sendStatus(404)))
    .catch((err) => next(err));
}

function update(req, res, next) {
  userService
    .update(req.params.id, req.body)
    .then(() => res.json({}))
    .catch((err) => next(err));
}

function _delete(req, res, next) {
  userService
    .delete(req.params.id)
    .then(() => res.json({}))
    .catch((err) => next(err));
}

function refreshToken(req, res, next) {
  const token = req.cookies.refreshToken;
  const ipAddress = req.ip;
  userService
    .refreshToken({ token, ipAddress })
    .then(({ refreshToken, ...user }) => {
      setTokenCookie(res, refreshToken);
      res.json(user);
    })
    .catch(next);
}
function setTokenCookie(res, token) {
  const coockieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
  res.cookie("refreshToken", token, coockieOptions);
}

function revokeToken(req, res, next) {
  const token = req.body.token || req.cookies.refreshToken;
  const ipAddress = req.ip;
  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  userService
    .revokeToken({ token, ipAddress })
    .then(() => res.json({ message: "Token Revoked" }))
    .catch(next);
}
function revokeTokenSchema(req, res, next) {
  const schema = Joi.object({
    token: Joi.string().empty(""),
  });
  validateRequest(req, next, schema);
}
function authenticateSchema(req, res, next) {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}
