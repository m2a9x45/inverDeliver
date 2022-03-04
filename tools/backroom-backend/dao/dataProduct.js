const db = require('./conn');

async function getproductBySKU(storeID, sku) {
  try {
    const selectedRows = await db.knex('product').where({ retailer_id: storeID, sku }).select('product_id', 'price');
    return selectedRows[0];
  } catch (error) {
    return error;
  }
}

async function addHistoricalProductPrice(productID, storeID, price) {
  try {
    const selectedRows = await db.knex('product_historical_pricing').insert({ product_id: productID, retailer_id: storeID, price });
    return selectedRows[0];
  } catch (error) {
    return error;
  }
}

async function updateProductPrice(productID, price, storeID) {
  try {
    const selectedRows = await db.knex('product').where({ product_id: productID, retailer_id: storeID }).update({ price });
    return selectedRows;
  } catch (error) {
    return error;
  }
}

module.exports = {
  getproductBySKU,
  addHistoricalProductPrice,
  updateProductPrice,
};
