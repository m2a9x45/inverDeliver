const db = require('./conn');

async function getproduct(id) {
  try {
    const selectedRows = await db.knex.select('product_id', 'sku', 'retailer_id', 'upc', 'product.name', 'price', 'price_variable', 'size',
      'category', 'upc', 'image_url').from('product')
      .join('store', 'store.store_id', '=', 'product.retailer_id')
      .join('bussiness', 'bussiness.bussiness_id', '=', 'store.bussiness_id')
      .where('product_id', id);
    return selectedRows;
  } catch (error) {
    return error;
  }
}

async function getproductBySKU(storeID, sku) {
  try {
    const selectedRows = await db.knex('product').where({ retailer_id: storeID, sku }).select('product_id', 'price');
    return selectedRows[0];
  } catch (error) {
    return error;
  }
}

async function getProductsByStore(storeID) {
  try {
    const selectedRows = await db.knex('product').where({ retailer_id: storeID }).select('product_id', 'sku', 'price');
    return selectedRows;
  } catch (error) {
    return error;
  }
}

async function getProductByName(productName) {
  try {
    const selectedRows = await db.knex('product').where('name', 'like', `%${productName}%`).select();
    return selectedRows;
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

async function updateProduct(productID, storeID, product) {
  try {
    const selectedRows = await db.knex('product').where({ product_id: productID, retailer_id: storeID }).update(product);
    return selectedRows;
  } catch (error) {
    console.log(error);
    return error;
  }
}

module.exports = {
  getproduct,
  getproductBySKU,
  addHistoricalProductPrice,
  updateProductPrice,
  getProductsByStore,
  updateProduct,
  getProductByName,
};
