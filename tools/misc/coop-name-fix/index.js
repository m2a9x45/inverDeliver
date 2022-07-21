const axios = require('axios');
const fs = require("fs");
const { parse } = require("csv-parse");
require('dotenv').config();

// Get all the products with no product name
// fetch the product name
// update the name

// sizeUnit

async function getProductName(sku) {
    try {
        const response = await axios.get(`https://api.shop.coop.co.uk/products/details/${sku}?store_id=1cdccd3b-ccaf-4865-837d-95bda944a9ee`);

        if (response.data === undefined || !response.data.name) {
            console.log(response);
            return {failed: true};
        }

        return response.data.name;
    } catch (error) {
        if (error.response.status === 429) {
            return {failed: true, reason: {code: 429, retryIn: error.response.headers["retry-after"]}}
        }
        return {failed: true};
    }
}

function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

async function test(productID, sku){
    await sleep(1000);
    const data = await getProductName(sku);
    if (data.failed === true) {
        if (data.reason && data.reason.code === 429) {
            //console.log(sku, "rate limit", data.reason.retryIn);
            await sleep((data.reason.retryIn) * 1000) // seconds 
            await test(sku);
        }
    } else {
        console.log(sku, data);

        const newData = {
            storeID: 'store_c57b9f4f-0b69-496c-8036-d801c6041a72',
            productID,
            product: {
                "name": data
            }
        };

        // update name 
        const resNewName = await axios.patch(`${process.env.API_URL}/product/updateProduct`, newData, {
            headers: {
                'apikey': process.env.API_KEY
            }
        });

        if (resNewName.data.error === true) {
            console.log('❌', productID, sku);
        } else {
            console.log('✅', productID, sku);
        }
    }
}

fs.createReadStream("./coop_missing_names.csv")
  .pipe(parse({ delimiter: ",", from_line: 2 }))
  .on("data", function (row) {
    // productID, sku
    console.log(row[1]);
    // test(row[1], row[2]);
  })

//test('02ab95c0-639a-43c8-862a-745de713a214', '6b905403-abc0-4555-babd-ed4dffeca0a8');

