const puppeteer = require('puppeteer-extra');
const cheerio = require('cheerio');
const cron = require('node-cron');
const axios = require('axios');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

require('dotenv').config();

const API_URL = 'http://localhost:3002';

puppeteer.use(StealthPlugin());

const products = [];

const aldiUrls = [
    'https://groceries.aldi.co.uk/en-GB/chilled-food',
    'https://groceries.aldi.co.uk/en-GB/fresh-food/fruit-vegetables',
    'https://groceries.aldi.co.uk/en-GB/fresh-food/meat-poultry',
    'https://groceries.aldi.co.uk/en-GB/food-cupboard',
    'https://groceries.aldi.co.uk/en-GB/bakery',
    'https://groceries.aldi.co.uk/en-GB/fresh-food/fresh-fish',
    'https://groceries.aldi.co.uk/en-GB/frozen',
    'https://groceries.aldi.co.uk/en-GB/drinks',
];

async function scrape(url) {
    const browser = await puppeteer.launch({
        headless: true,
        // executablePath: '/usr/bin/chromium-browser'
    });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(50 * 1000);
    await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 1,
    });
    await page.goto(url, {
        waitUntil: 'domcontentloaded'
    });
    await page.waitForTimeout(2000);

    const htmlArray = [];
    let end = false;

    while (end === false) {
        if (await page.$('body > div.container-md > div.searchgrid > div > div > div > div.col-12.col-lg-9.mt-3.pl-1 > div > div > div:nth-child(1) > div.col-6.d-none.d-lg-block > div > ul > li.page-item.next.ml-2.disabled') !== null) {
            console.log('End of page thing');
            const html = await page.content();
            htmlArray.push({
                url: page.url(),
                html
            });
            end = true;
        } else {
            console.log('Not the end');
            const html = await page.content();
            htmlArray.push({
                url: page.url(),
                html
            });
            await page.click('body > div.container-md > div.searchgrid > div > div > div > div.col-12.col-lg-9.mt-3.pl-1 > div > div > div:nth-child(1) > div.col-6.d-none.d-lg-block > div > ul > li.page-item.next.ml-2 > a', {
                waitUntil: 'domcontentloaded'
            });
            await page.waitForTimeout(2000);
        }
    }

    await browser.close();
    return htmlArray;
};

function proceesFileContents(html) {
    const $ = cheerio.load(html);

    $('div[data-qa="search-results"]').each((i, elm) => {
        const product = {
            id: $('a[data-qa="search-product-title"]', elm).attr('data-productid'),
            name: $('a[data-qa="search-product-title"]', elm).attr('title'),
            img: $('img', elm).attr('src'),
            size: $('div .d-flex > div .text-gray-small', elm).html(),
            price: $('div .product-tile-price > div > span > span', elm).text(),
            des: $('a[data-qa="search-product-title"]', elm).attr('href'),
        }

        const price = product.price;
        const removePoundSymbol = price.replace('£', '');
        const removeDecimalPoint = removePoundSymbol.replace('.', '');
        product.price = Math.floor(removeDecimalPoint);

        products.push(product);
    });
};

async function checkProductPrice(products) {
    // console.log(products);
    for (const product of products) {
        try {
            const response = await axios.get(`${API_URL}/product/bySku?storeID=store_fdfdc63d-f865-4e06-815a-8164820358d8&sku=${product.id}`, {
                headers: {
                    'api_key': '69d21fec-49f1-4ed6-a094-5be8bfd647c8-539065a9-eadd-4936-8263-d83b2cf7013d-7f8fca23-c37a-4fbf-9074-072a18c3e1a6'
                }
            });

            if (response.data.error === true) {
                console.log(`${product.id} not found 🚨`);
                return;
            }

            console.log(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }



    // try {


    // console.log(result.data.data);

    // if (result.length <= 0) {
    //     console.log(`${sku} not found 🚨`);
    //     return;
    // }

    // const existingProduct = result[0];

    // if (newPrice !== existingProduct.price) {
    //     console.log(`⚠ ${existingProduct.product_id} price has changed from ${existingProduct.price} to ${newPrice}`);

    //     const inserted = await dao.addHistoricalProductPrice(existingProduct.product_id, 'store_fdfdc63d-f865-4e06-815a-8164820358d8', existingProduct.price);
    //     if (inserted.insertId > 0) {
    //         console.log(`✅ ${existingProduct.product_id} historical price added sucessfully`);
    //     }

    //     const updated = await dao.updateProductPrice(existingProduct.product_id, newPrice);
    //     if (updated.changedRows > 0) {
    //         console.log(`✅ ${existingProduct.product_id} price updated sucessfully`);
    //     }
    //     // console.log(inserted);
    //     // console.log(updated);
    // }
    // } catch (error) {
    //     console.log(error);
    // }
}

async function main() {
    for (let i = 0; i < aldiUrls.length; i++) {
        const htmlPages = await scrape(aldiUrls[i]);
        console.log(htmlPages.length);

        for (let j = 0; j < htmlPages.length; j++) {
            console.log(htmlPages[j].url);
            proceesFileContents(htmlPages[j].html);
        }
    }

    // console.log(products);
    console.log(products.length);
    let test = 0;

    for (const product of products) {
        // test++;
        // console.log(test);
        try {
            const response = await axios.get(`${API_URL}/product/bySku?storeID=store_fdfdc63d-f865-4e06-815a-8164820358d8&sku=${product.id}`, {
                headers: {
                    'api_key': process.env.API_KEY
                }
            });

            if (response.data.error === true) {
                console.log(`${product.id} not found`);
                continue;
            }

            // console.log(response.data.data);

            const newPrice = product.price; // Scraped
            const existingProduct = response.data.data; // From DB

            // console.log(newPrice, existingProduct.price);

            if (newPrice !== existingProduct.price) {
                console.log(`⚠ ${existingProduct.product_id} price has changed from ${existingProduct.price} to ${newPrice}`);

                const historicalData = {
                    productID: existingProduct.product_id,
                    storeID: 'store_fdfdc63d-f865-4e06-815a-8164820358d8',
                    price: existingProduct.price
                }

                const resHistotical = await axios.post(`${API_URL}/product/addHistoricalPrice`, historicalData, {
                    headers: {
                        'api_key': process.env.API_KEY
                    }
                });

                if (resHistotical.data.error === true) {
                    console.log(`❌ ${existingProduct.product_id} historical price not sucessfully added`);
                    continue;
                }

                console.log(`✅ ${existingProduct.product_id} historical price added sucessfully`);

                const newData = {
                    productID: existingProduct.product_id,
                    storeID: 'store_fdfdc63d-f865-4e06-815a-8164820358d8',
                    price: newPrice
                }

                const resNewPrice = await axios.patch(`${API_URL}/product/updatePrice`, newData, {
                    headers: {
                        'api_key': process.env.API_KEY
                    }
                });

                if (resNewPrice.data.error === true) {
                    console.log(`❌ ${existingProduct.product_id} price not updated sucessfully`);
                    continue;
                }

                console.log(`✅ ${existingProduct.product_id} price updated sucessfully`);
            }

        } catch (error) {
            console.log(error);
        }
    }

    process.exit();
};

// Runs everyday at 2:30 AM
// cron.schedule('30 2 * * *', () => {
//     console.log('Running Task at 2:30AM Everyday');
//     // Send Slack message to say the scrape has started 
//     main();
// });

main();