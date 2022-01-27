const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const http = require('https');

const { v4: uuidv4 } = require('uuid');
const dao = require('./dao/dataAldiProducts');

const args = process.argv.slice(2);
console.log(args);

const catogory = 'meat';

const aldiUrls = [
    // {category:'fresh', url: 'https://groceries.aldi.co.uk/en-GB/chilled-food'},
    // {category: 'fruit', url:'https://groceries.aldi.co.uk/en-GB/fresh-food/fruit-vegetables'},
    {category: 'meat', url:'https://groceries.aldi.co.uk/en-GB/fresh-food/meat-poultry'},
    // {category: 'cupboard', url:'https://groceries.aldi.co.uk/en-GB/food-cupboard'},
    // {category: 'bakery', url:'https://groceries.aldi.co.uk/en-GB/bakery'},
    // {category: 'fish', url:'https://groceries.aldi.co.uk/en-GB/fresh-food/fresh-fish'},
    // {category: 'frozen', url:'https://groceries.aldi.co.uk/en-GB/frozen'},
    // {category: 'drink', url:'https://groceries.aldi.co.uk/en-GB/drinks'},
    // // {category: 'alcohol', url:'https://groceries.aldi.co.uk/en-GB/drinks/beers-ciders'},
    // // {category: 'alcohol_2', url:'https://groceries.aldi.co.uk/en-GB/drinks/wine'},
    // // {category: 'alcohol_3', url:'https://groceries.aldi.co.uk/en-GB/drinks/spirits-liqueurs'},
]

switch(args[0]) {
    case '--scrape':
        main();
        break;
    case '--toJSON':
        HTMLtoJSON();
        break;
    case '--addDB':
        addToDatabase();
        break;
    case '--image':
        downloadImages();
        break;
    case '--lookupTable':
        generateLookupTable();
        break;
    case '--count':
        checkProductCount();
        break;
    default:
  }

function main() {

    aldiUrls.forEach(async url => {
        const htmlPages = await scrape(url.url);
        console.log(htmlPages.length);
    
        htmlPages.forEach((htmlpage, i) => {
            console.log(htmlpage.url);
            fs.writeFile(`./aldi-html/${url.category}-${i}.html`, htmlpage.html, function (err) {
                if (err) throw err;
                console.log('Results Received');
            }); 
        });
    });



//     fs.readdir('./aldi-html/', function (err, files) {
//     //handling error
//     if (err) {
//         return console.log('Unable to scan directory: ' + err);
//     } 
//     //listing all files using forEach
//     files.forEach((file) => {
//         fs.readFile(`./aldi-html/${file}`, function(err, data) {
//             console.log(file); 
//             proceesFileContents(data.toString(), file);
//         });
//     });
// });
};

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
            await page.waitForTimeout(3000);
        }
    }

    await browser.close();
    return htmlArray;
};

function proceesFileContents(html, filename) {
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
    });
    
    products.forEach(product => {
        const price = product.price;
        const removePoundSymbol = price.replace('£', '');
        const removeDecimalPoint = removePoundSymbol.replace('.', '');
        product.price = Math.floor(removeDecimalPoint);
    });

    fs.writeFile(`./json/${catogory}/${filename}.json`, JSON.stringify(products), function (err) {
        if (err) throw err;
        console.log(`${filename} converted to JSON ✅`);
    }); 
};

function HTMLtoJSON() {
    fs.readdir(`./aldi-html/${catogory}`, function (err, files) {
        if (err) return console.log('Unable to scan directory: ' + err);
        
        files.forEach((file) => {
            fs.readFile(`./aldi-html/${catogory}/${file}`, (err, data) => {
                if (err) throw err;
                console.log(file); 
                proceesFileContents(data.toString(), file);
            });
        });
    });
};

async function addToDatabase() {
    fs.readdir(`./json/${catogory}`, (err, files) => {
        if (err) return console.log('Unable to scan directory: ' + err);
        
        files.forEach((file) => {
            fs.readFile(`./json/${catogory}/${file}`, function(err, data) {
                if (err) throw err;
                const products = JSON.parse(data);
                products.forEach(async (product) => {
                    const productID = uuidv4();
                    console.log(productID, product.id, 'store_fdfdc63d-f865-4e06-815a-8164820358d8', product.id, product.name, catogory, `aldi/${product.id}.jpg`, product.size, product.price);
                    try {
                        const added = await dao.addProduct(productID, product.id, 'store_fdfdc63d-f865-4e06-815a-8164820358d8', product.id, product.name, catogory, `aldi/${product.id}.jpg`, product.size, product.price);
                    } catch (error) {
                        if (error.code === 'ER_DUP_ENTRY') {
                            console.log('❌', productID, product.id, 'store_fdfdc63d-f865-4e06-815a-8164820358d8', product.id, product.name, catogory, `aldi/${product.id}.jpg`, product.size, product.price);
                        } else {
                            console.log(error);
                        }
                    }
                });
            });
        });
    });
};

function downloadImages() {

    let productcount = 0;

    fs.readdir(`./json/${catogory}`, (err, files) => {
        if (err) return console.log('Unable to scan directory: ' + err);
        
        files.forEach((file) => {
            fs.readFile(`./json/${catogory}/${file}`, function(err, data) {
                if (err) throw err;
                // console.log(file); 
                const products = JSON.parse(data);

                products.forEach(product => {
                    // console.log(product.img);

                    const file = fs.createWriteStream(`./images/${product.id}.jpg`);
                    const request = http.get(product.img, (response) => {
                        response.pipe(file);
                    });

                    productcount++;
                });

                console.log(productcount);
                // console.log(products.length);
            });
        });
    }); 
}

function checkProductCount() {
    let productcount = 0;
    fs.readdir(`./json/${catogory}`, (err, files) => {
        if (err) return console.log('Unable to scan directory: ' + err);
        
        files.forEach((file) => {
            fs.readFile(`./json/${catogory}/${file}`, function(err, data) {
                if (err) throw err;
                const products = JSON.parse(data);

                products.forEach(product => {
                    productcount++;
                });

                console.log(productcount);
            });
        });
    }); 
}


function generateLookupTable() {
    fs.readdir('./json', (err, files) => {
        if (err) return console.log('Unable to scan directory: ' + err);
        
        files.forEach((file) => {
            fs.readFile(`./json/${file}`, async (err, data) => {
                if (err) throw err;
                const products = JSON.parse(data);
                const dataToAddArray = [];

                for (let i = 0; i < products.length; i++) {
                    try {
                        const productInfo = await dao.getproductBySKU(products[i].id)   

                        const dataToAdd = {
                            productID: productInfo.product_id,
                            sku: products[i].id,
                            url: products[i].des
                        };

                        dataToAddArray.push(dataToAdd);
                    } catch (error) {
                        console.log(error);
                    }
                }

                console.log(dataToAddArray);

                fs.writeFile(`./lookup/${file}`, JSON.stringify(dataToAddArray), function (err) {
                    if (err) throw err;
                    console.log(`Added to lookUpTable ✅`);
                }); 
            });
        });
    });

    // Create a file where we link our productIDs to Aldi product urls 

    // The JSON contains the SKU and URL 
    // Find productID from SKU and then link the URL




}

// fs.readFile(`./aldi-html/fresh-fresh-0.html.json`, function(err, data) {
//     const products = JSON.parse(data);

//     products.forEach(product => {
//         const price = product.price;
//         const removePoundSymbol = price.replace('£', '');
//         const removeDecimalPoint = removePoundSymbol.replace('.', '');
    
//         console.log(price, Math.floor(removeDecimalPoint));
//     });
// });

