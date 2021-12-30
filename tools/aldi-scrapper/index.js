const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

const aldiUrls = [
    {category:'fresh', url: 'https://groceries.aldi.co.uk/en-GB/chilled-food'},
    {category: 'fruit', url:'https://groceries.aldi.co.uk/en-GB/fresh-food/fruit-vegetables'},
    {category: 'meat', url:'https://groceries.aldi.co.uk/en-GB/fresh-food/meat-poultry'},
    {category: 'cupboard', url:'https://groceries.aldi.co.uk/en-GB/food-cupboard'},
    {category: 'bakery', url:'https://groceries.aldi.co.uk/en-GB/bakery'},
    {category: 'fish', url:'https://groceries.aldi.co.uk/en-GB/fresh-food/fresh-fish'},
    {category: 'frozen', url:'https://groceries.aldi.co.uk/en-GB/frozen'},
    {category: 'drink', url:'https://groceries.aldi.co.uk/en-GB/drinks/coffee'},
    {category: 'drink', url:'https://groceries.aldi.co.uk/en-GB/drinks/tea'},
    {category: 'drink', url:'https://groceries.aldi.co.uk/en-GB/drinks/soft-drinks-juices'},
    {category: 'alcohol', url:'https://groceries.aldi.co.uk/en-GB/drinks/beers-ciders'},
    {category: 'alcohol', url:'https://groceries.aldi.co.uk/en-GB/drinks/wine'},
    {category: 'alcohol', url:'https://groceries.aldi.co.uk/en-GB/drinks/spirits-liqueurs'},
]

async function main() {
    const htmlPages = await scrape(aldiUrls[0].url);
    console.log(htmlPages.length);
    htmlPages.forEach((htmlpage, i) => {
        console.log(htmlpage.url);
        fs.writeFile(`./aldi-html/fresh-${i}.html`, htmlpage.html, function (err) {
            if (err) throw err;
            console.log('Results Received');
        }); 
    });
};

// main();

async function scrape(url) {
    const browser = await puppeteer.launch({ headless: false });
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
}

function proceesFileContents(html) {
    const $ = cheerio.load(html);
    const products = [];

    $('div[data-qa="search-results"]').each(function (i, elm) {
        const product = {
            id: $('a[data-qa="search-product-title"]', elm).attr('data-productid'),
            name: $('a[data-qa="search-product-title"]', elm).attr('title'),
            img: $('img', elm).attr('src'),
            size: $('div .d-flex > div .text-gray-small', elm).html(),
            price: $('div .product-tile-price > div > span > span', elm).text(),
            des: $('a[data-qa="search-product-title"]', elm).attr('href'),
        }

        products.push(product);

        // console.log($('a[data-qa="search-product-title"]', elm).attr('title'))
        // console.log($('a[data-qa="search-product-title"]', elm).attr('data-productid'));
        // console.log($('a[data-qa="search-product-title"]', elm).attr('href'));
        // console.log($('img', elm).attr('src'));
        // console.log($('div .product-tile-price > div > span > span', elm).text());
        // console.log($('div .d-flex > div .text-gray-small', elm).html());
    });

    console.log(products);
}

fs.readFile('./aldi-html/fresh-17.html', function(err, data) {
    proceesFileContents(data.toString());
});