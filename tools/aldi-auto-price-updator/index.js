const puppeteer = require('puppeteer-extra');
const cheerio = require('cheerio');
const cron = require('node-cron');

const dao = require('./dao/dataAldiProducts');

const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

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
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      });
    await page.goto(url, {waitUntil: 'networkidle2'});  
    await page.waitForTimeout(2000);

    const htmlArray = [];
    let end = false;

    while (end === false) {
        if (await page.$('body > div.container-md > div.searchgrid > div > div > div > div.col-12.col-lg-9.mt-3.pl-1 > div > div > div:nth-child(1) > div.col-6.d-none.d-lg-block > div > ul > li.page-item.next.ml-2.disabled') !== null) {
            console.log('End of page thing');
            const html = await page.content();
            htmlArray.push({url: page.url(), html});
            end = true;
        } else {
            console.log('Not the end');
            const html = await page.content();
            htmlArray.push({url: page.url(), html});
            await page.click('body > div.container-md > div.searchgrid > div > div > div > div.col-12.col-lg-9.mt-3.pl-1 > div > div > div:nth-child(1) > div.col-6.d-none.d-lg-block > div > ul > li.page-item.next.ml-2 > a', {waitUntil: 'domcontentloaded'});
            await page.waitForTimeout(2000);
        }
    }

    await browser.close();
    return htmlArray;
};

function proceesFileContents(html) {
    const $ = cheerio.load(html);
    const products = [];

    $('div[data-qa="search-results"]').each((i, elm) => {
        const product = {
            id: $('a[data-qa="search-product-title"]', elm).attr('data-productid'),
            name: $('a[data-qa="search-product-title"]', elm).attr('title'),
            img: $('img', elm).attr('src'),
            size: $('div .d-flex > div .text-gray-small', elm).html(),
            price: $('div .product-tile-price > div > span > span', elm).text(),
            des: $('a[data-qa="search-product-title"]', elm).attr('href'),
        }

        products.push(product);
    });
    
    products.forEach(async product => {
        const price = product.price;
        const removePoundSymbol = price.replace('£', '');
        const removeDecimalPoint = removePoundSymbol.replace('.', '');
        product.price = Math.floor(removeDecimalPoint);
        checkProductPrice(product.id, product.price, product);
    });

    // console.log(products);
};

async function checkProductPrice(sku, newPrice, wholeProduct) {
    try {
        const result = await dao.getproductBySKU(sku);

        if (result.length <= 0) {
            // sku not found, send a slack message or something
            // console.log(`${sku} not found 🚨`, wholeProduct);
            return;
        }

        const existingProduct = result[0];

        if (newPrice !== existingProduct.price) {
            console.log(`⚠ ${existingProduct.product_id} price has changed from ${existingProduct.price} to ${newPrice}`);

            const inserted = await dao.addHistoricalProductPrice(existingProduct.product_id, 'store_fdfdc63d-f865-4e06-815a-8164820358d8', existingProduct.price);
            if (inserted.insertId > 0) {
                console.log(`✅ ${existingProduct.product_id} historical price added sucessfully`);
            }
            
            const updated = await dao.updateProductPrice(existingProduct.product_id, newPrice);
            if (updated.changedRows > 0) {
                console.log(`✅ ${existingProduct.product_id} price updated sucessfully`);
            }


            console.log(inserted);
            console.log(updated);
        }
    } catch (error) {
        console.log(error);
    }
}


async function main() {
    for (let i = 0; i < aldiUrls.length; i++) {
        const htmlPages = await scrape(aldiUrls[i]);
        console.log(htmlPages.length);
    
        htmlPages.forEach((htmlpage, i) => {
            console.log(htmlpage.url);
            proceesFileContents(htmlpage.html);
        });
    }

    // Send Slack message to say the scrape has finished 
    process.exit();

    // aldiUrls.forEach(async url => {
    //     const htmlPages = await scrape(url);
    //     console.log(htmlPages.length);
    
    //     htmlPages.forEach((htmlpage, i) => {
    //         console.log(htmlpage.url);
    //         proceesFileContents(htmlpage.html);
    //     });
    // });
};

// Runs everyday at 2:30 AM
cron.schedule('30 2 * * *', () => {
    console.log('Running Task at 2:30AM Everyday');
    // Send Slack message to say the scrape has started 
    main();
});




