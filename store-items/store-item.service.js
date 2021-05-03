const config = require("config.json");
const db = require("_helpers/db");
const StoreItems = db.StoreItems;

module.exports = {
  getAllItems,
  getItem,
  queryItems,
  addItem,
  removeItem,
  editItem,
};

async function getAllItems() {
  return await StoreItems.find();
}

async function getItem(_id) {
  var item = StoreItems.findOne({ _id });
  return item;
}
//for search bar ... do latter
async function queryItems() {}

async function addItem(newItem) {
  console.log(newItem.item);
  var item = new StoreItems(newItem.item);
  await item.save();
}

async function removeItem(item) {
  StoreItems.findByIdAndRemove(item);
}

async function editItem(_id, newItem) {
  const item = await StoreItems.findById(_id);

  // validate
  if (!item) throw "Item not found";
  if (
    item.name !== newItem.itemName &&
    (await StoreItems.findOne({ name: newItem.itemName }))
  ) {
    throw 'Item "' + newItem.itemName + '" already exist.';
  }

  // copy newItem properties to item
  Object.assign(item, newItem);

  await item.save();
}
