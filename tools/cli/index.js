const program = require('commander');
const axios = require('axios');

require('dotenv').config();

async function getProducts(productID) {
  const response = await axios.get(`${process.env.API_URL}/product/byId?id=${productID}`, {
      headers: {
          'apikey': process.env.API_KEY
      }
  });
  return response.data;
}

program
  .command('find <id>')
  .action(async (id) => {
    // get sku
    // Create both api & page urls
    const data = await getProducts(id);
    if (!data.id) {
      return console.log("❌ Can't find product: ", id);
    }

    switch (data.bussiness_id) {
      case "biz_e701f583-bd2b-43be-89b1-a4b41be716ff": // Co-op
        data["ex_store_url"] = `https://shop.coop.co.uk/product/${data.sku}`;
        data["ex_api_url"] = `https://api.shop.coop.co.uk/products/details/${data.sku}`;
        break;
      case "biz_fd67ab0c-8b0b-4f76-ad0d-bec53aa3f298": // ALDI
        break;
      default:
        break;
    }

    console.log(data);
});


program.parse(process.argv);