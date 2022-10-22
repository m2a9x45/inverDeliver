const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const { stringify } = require("csv-stringify");

// https://groceries.morrisons.com/webshop/api/v1/products/215456011/details

// First we need to get the catogory list so we can get all products

// ttps://morrisons.queue-it.net/?c=morrisons&e=morrisonsshop&ver=v3-javascript-3.6.0&cver=33&man=Known%20User%20Main%20Shop%20Action&t=https%3A%2F%2Fgroceries.morrisons.com%2Fbrowse%

//215456011
async function getProductDetails(morrisonsSku) {
    const response = await axios.get(`https://groceries.morrisons.com/webshop/api/v1/products/${morrisonsSku}/details`);
    console.log(response.data);
    return response.data;
}

async function getProductCategories() {
    const response = await axios.get('https://groceries.morrisons.com/browse/meat-poultry-179549/chicken-184534');
    console.log(response);
}

function parseImgUrl(rawImgUrls) {
    return rawImgUrls.split(',')[1].split(' ')[1];
}

function main() {
    // getProductDetails('215456011');
    // getProductCategories();

    fs.readFile('./products.html', (err, data) => {
        if (err) throw err;

        const $ = cheerio.load(data.toString());

        const writableStream = fs.createWriteStream('./products.csv');
        const columns = [
            "id",
            "upc",
            "name",
            "price",
            "brand",
            "catogory",
            "img",
            "page",
          ];
        const stringifier = stringify({ header: true, columns: columns });

        $('div .fop-item').each(async (i, elm) => {
            if ($(elm).attr('data-sku') === undefined) {
                return;
            }

            const rawImgUrls = $('img', elm).attr('srcset');
            if (rawImgUrls === undefined) {
                return;
            }
            const imgUrl = parseImgUrl(rawImgUrls);

            // Image url starts with - https://groceries.morrisons.com
            const product = {
                id: $(elm).attr('data-sku'),
                // name: $('.fop-title', elm).attr('title'),
                // price: $('div .price-group-wrapper > .fop-price', elm).text(),
                img: `${imgUrl}`,
                page: $('div .fop-contentWrapper > a', elm).attr('href'),
            }

            //console.log(product.id, product.name);

            // Create csv file of products
            const productFromAPI = await getProductDetails(product.id);
            product['name'] = productFromAPI.product.name;
            product['upc'] = productFromAPI.product.gtin;
            product['brand'] = productFromAPI.product.brand.name;
            product['price'] = productFromAPI.product.price.current;
            product['catogory'] = productFromAPI.backOfPack.tags.categories[0].tags[0].name;

            stringifier.write(product);
            
        });

        stringifier.pipe(writableStream);

    });

}

main();