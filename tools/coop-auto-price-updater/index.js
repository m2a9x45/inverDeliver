const axios = require('axios');
const cronitor = require('cronitor')('f6c9253b3d4d43c38d1723cccbc343f6')
cronitor.wraps(require('node-cron'));

const monitor = new cronitor.Monitor('coop-price-updater');

require('dotenv').config();

async function checkThirdPartyPrice(sku) {
    try {
        const response = await axios.get(`https://api.shop.coop.co.uk/products/details/${sku}?store_id=1cdccd3b-ccaf-4865-837d-95bda944a9ee`);

        if (response.status !== 200) {
            console.log(response);
            return null;
        }

        if (response.data === undefined || !response.data.price) {
            console.log(response);
            return null;
        }

        return response.data.price;
    } catch (error) {
        console.log(error);
    }
}

async function getProducts() {
    const response = await axios.get(`${process.env.API_URL}/product/byStore?storeID=store_c57b9f4f-0b69-496c-8036-d801c6041a72`, {
        headers: {
            'apikey': process.env.API_KEY
        }
    });

    return response.data.data;
}

async function main() {
    const productsArray = await getProducts();

    const startTime = new Date();
    console.log(startTime);

    for (let i = 0; i < productsArray.length; i++) {
        const progress = (i + 1) / productsArray.length * 100;
        console.log(`${i + 1}/${productsArray.length} : ${progress}`);

        await new Promise(r => setTimeout(r, 300));
        const thirdPartyPrice = await checkThirdPartyPrice(productsArray[i].sku);
        console.log(productsArray[i]);
        if (thirdPartyPrice === null) {
            continue;
        }

        const existingProduct = productsArray[i];
        const newPrice = Math.floor(thirdPartyPrice * 100);

        console.log(`🔎 OurID ${productsArray[i].product_id}, Third Party ID${productsArray[i].sku} Our Price ${existingProduct.product_id} Their Price ${newPrice}`);

        if (productsArray[i].price !== newPrice && typeof newPrice === "number"  && typeof existingProduct === "number") {

            console.log(`⚠ ${existingProduct.product_id} price has changed from ${existingProduct.price} to ${newPrice}`);

            const newData = {
                productID: existingProduct.product_id,
                storeID: 'store_c57b9f4f-0b69-496c-8036-d801c6041a72',
                price: newPrice,
            }

            const resNewPrice = await axios.patch(`${process.env.API_URL}/product/updatePrice`, newData, {
                headers: {
                    'apikey': process.env.API_KEY
                }
            });

            if (resNewPrice.data.error === true) {
                console.log(`❌ ${existingProduct.product_id} price not updated sucessfully`);
                continue;
            }

            console.log(`✅ ${existingProduct.product_id} price updated sucessfully`);

            const historicalData = {
                productID: existingProduct.product_id,
                storeID: 'store_c57b9f4f-0b69-496c-8036-d801c6041a72',
                price: existingProduct.price,
            }

            const resHistotical = await axios.post(`${process.env.API_URL}/product/addHistoricalPrice`, historicalData, {
                headers: {
                    'apikey': process.env.API_KEY
                }
            });

            if (resHistotical.data.error === true) {
                console.log(`❌ ${existingProduct.product_id} historical price not sucessfully added`);
                continue;
            }

            console.log(`✅ ${existingProduct.product_id} historical price added sucessfully`);
        }
    }

    const endTime = new Date();
    console.log(startTime, endTime);
    monitor.ping({state: 'complete'});
    process.exit();
}


cronitor.schedule('coop-price-updater', '2 2 * * *', () => {
    monitor.ping({state: 'run'});
    console.log('Sending welcome email to new sign ups every five minutes.');
    main();
});

// monitor.ping({state: 'run'});
// main();