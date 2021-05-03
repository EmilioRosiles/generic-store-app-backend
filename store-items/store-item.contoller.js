const express = require("express");
const router = express.Router();
const storeItemsService = require("./store-item.service");

router.get("/", getAllItems);
router.post("/create", create);
router.get("/:id", getById);
router.put("/:id", update);
router.delete("/delete", _delete);

module.exports = router;

function create(req, res, next) {
  storeItemsService
    .addItem(req.body)
    .then(() => res.json({}))
    .catch((err) => next(err));
}
function getAllItems(req, res, next) {
  storeItemsService
    .getAllItems()
    .then((StoreItems) => res.json(StoreItems))
    .catch((err) => next(err));
}

function getById(req, res, next) {
  storeItemsService
    .getById(req.params.id)
    .then((user) => (user ? res.json(user) : res.sendStatus(404)))
    .catch((err) => next(err));
}

function update(req, res, next) {
  storeItemsService
    .update(req.params.id, req.body)
    .then(() => res.json({}))
    .catch((err) => next(err));
}

function _delete(req, res, next) {
  storeItemsService
    .removeItem(req.params.id)
    .then(() => res.json({}))
    .catch((err) => next(err));
}
