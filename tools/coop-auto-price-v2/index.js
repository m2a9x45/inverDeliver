const axios = require('axios');

require('dotenv').config();

// const response = await axios.get(`https://api.shop.coop.co.uk/products/details/${sku}?store_id=1cdccd3b-ccaf-4865-837d-95bda944a9ee`);


async function getProducts() {
    const response = await axios.get(`${process.env.API_URL}/product/byStore?storeID=store_c57b9f4f-0b69-496c-8036-d801c6041a72`, {
        headers: {
            'apikey': process.env.API_KEY
        }
    });

    return response.data.data;
}


try {
    const data = getProducts();
    console.log(data);
} catch (error) {
    console.log(error);
}
