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
  return await StoreItems.find().toArray();
}

async function getItem(id) {
  var item = StoreItems.findOne({ id });
  return item;
}
//for search bar ... do latter
async function queryItems() {}

async function addItem(newItem) {
  var item = new StoreItems(newItem);
  await item.save();
}

async function removeItem(name) {
  var query = { name: name };
  await StoreItems.remove(query);
}

async function editItem(id, newItem) {
  const item = await StoreItems.findById(id);

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
