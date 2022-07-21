const program = require('commander');
const axios = require('axios');

require('dotenv').config();

async function getProducts(productID, storeID) {
  const response = await axios.get(`${process.env.API_URL}/product/byId?id=${productID}&storeID=${storeID}`, {
      headers: {
          'apikey': process.env.API_KEY
      }
  });

  return response.data.data;
}

program
  .command('find <id>')
  .action(async (id) => {
    // get sku
    // Create both api & page urls
    const data = await getProducts(id, "store_c57b9f4f-0b69-496c-8036-d801c6041a72");

    // https://shop.coop.co.uk/product/e43494b2-3eab-4615-a71a-154618c05383
    // https://api.shop.coop.co.uk/products/details/e43494b2-3eab-4615-a71a-154618c05383

    data["ex_store_url"] = `https://shop.coop.co.uk/product/${data.sku}`;
    data["ex_api_url"] = `https://api.shop.coop.co.uk/products/details/${data.sku}`;

    console.log(data);
});


program.parse(process.argv);