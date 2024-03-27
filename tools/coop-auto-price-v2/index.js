const axios = require('axios');
const puppeteer = require('puppeteer-extra')
const {
    executablePath
} = require('puppeteer')
const fs = require('fs').promises;

require('dotenv').config();

// async function getProducts() {
//     const response = await axios.get(`${process.env.API_URL}/product/byStore?storeID=store_c57b9f4f-0b69-496c-8036-d801c6041a72`, {
//         headers: {
//             'apikey': process.env.API_KEY
//         }
//     });

//     return response.data.data;
// }

// try {
//     const data = getProducts();
//     console.log(data);
// } catch (error) {
//     console.log(error);
// }

// comment the following two lines if you don't want to include Stealth plugin 
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

puppeteer.launch({
    headless: false,
    executablePath: executablePath(),
}).then(async browser => {
    const page = await browser.newPage();

    // const cookiesString = await fs.readFile('./cookies.json');
    // const cookies = JSON.parse(cookiesString);
    // await page.setCookie(...cookies);


    await page.goto('https://shop.coop.co.uk/product/cca264ec-2fa0-4723-98d0-d6aa86ba2ca2', {
        waitUntil: 'load'
    });

    // Check if we've got a security check

    // await page.waitForSelector('.product-view--price')

    await page.waitForTimeout(2000)

    // If there's a capcha
    // console.log('captcha');
    
    // const cookies = await page.cookies();
    // await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));

    console.log('not captcha');
    await page.click('.form-input');
    await page.type('.form-input', 'POSTCODE', {
        delay: 20
    })
    await page.click('.postcode-search-button')

    await page.waitForSelector('.product-view--price')

    // const html = await page.content()
    // console.log(html);
    // await fs.writeFile('./content.html', html);

    // postcode-search-button

    const cookies = await page.cookies();
    await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
})