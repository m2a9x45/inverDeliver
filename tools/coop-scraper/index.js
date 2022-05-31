const axios = require('axios');
const {
    v4: uuidv4
} = require('uuid');
const fs = require('fs');
const http = require('https');
const dao = require('./dao/dataAldiProducts');

const links = [{
        name: 'bakery',
        url: 'https://api.shop.coop.co.uk/cms/category-page/0600?store_id=1cdccd3b-ccaf-4865-837d-95bda944a9ee'
    },
    {
        name: 'fruit',
        url: 'https://api.shop.coop.co.uk/cms/category-page/0700?store_id=1cdccd3b-ccaf-4865-837d-95bda944a9ee'
    },
    {
        name: 'meat',
        url: 'https://api.shop.coop.co.uk/cms/category-page/0800?store_id=1cdccd3b-ccaf-4865-837d-95bda944a9ee'
    },
    {
        name: 'fresh',
        url: 'https://api.shop.coop.co.uk/cms/category-page/0850?store_id=1cdccd3b-ccaf-4865-837d-95bda944a9ee'
    },
    {
        name: 'fresh',
        url: 'https://api.shop.coop.co.uk/cms/category-page/0900?store_id=1cdccd3b-ccaf-4865-837d-95bda944a9ee'
    },
    {
        name: 'frozen',
        url: 'https://api.shop.coop.co.uk/cms/category-page/317?store_id=1cdccd3b-ccaf-4865-837d-95bda944a9ee'
    },
    {
        name: 'frozen',
        url: 'https://api.shop.coop.co.uk/cms/category-page/01100?store_id=1cdccd3b-ccaf-4865-837d-95bda944a9ee'
    },
    {
        name: 'cupboard',
        url: 'https://api.shop.coop.co.uk/cms/category-page/01000?store_id=1cdccd3b-ccaf-4865-837d-95bda944a9ee'
    },
    {
        name: 'drink',
        url: 'https://api.shop.coop.co.uk/cms/category-page/01200?store_id=1cdccd3b-ccaf-4865-837d-95bda944a9ee'
    },
    {
        name: 'alcohol',
        url: 'https://api.shop.coop.co.uk/cms/category-page/01300?store_id=1cdccd3b-ccaf-4865-837d-95bda944a9ee'
    },
];

function convertSize(item) {
    if (item.size === undefined) {
        console.log(item.id);
        return null;
    } else {
        switch (item.sizeUnit) {
            case 'Gram':
                return `${item.size}g`
            case 'Millilitre':
                return `${item.size}mL`
            case 'Litre':
                return `${item.size}L`
            case 'Kilogram':
                return `${item.size}kg`
            default:
                console.log(`${item.id} unknown size info`);
                return null;
        }
    }
}

let parsedProducts = [];

async function getData(link, pageNumber, pageSize) {
    try {
        const response = await axios.get(`${link.url}&page_number=${pageNumber}&page_size=${pageSize}`);
        // console.log(response);

        console.log(response.config.url);

        if (response.status !== 200) {
            console.error('Failed to get date');
            return;
        }

        const products = response.data.products;

        products.forEach(async item => {
            // console.log(item.images[1].mediaStorageKey);
            // console.log(Math.floor(item.price * 100));

            // const file = fs.createWriteStream(`./images/${item.id}.jpg`);
            //     const request = http.get(item.images[1].mediaStorageKey, (response) => {
            //     response.pipe(file);
            // });

            const insertProduct = {
                product_id: uuidv4(),
                sku: item.id,
                retailer_id: 'store_c57b9f4f-0b69-496c-8036-d801c6041a72',
                upc: item.gtin,
                name: item.name,
                brand: item.brand,
                category: link.name,
                image_url: `coop/${item.id}.jpg`,
                size: convertSize(item),
                price: Math.floor(item.price * 100)
            }

            // Check if sku already exists in DB
            try {
                const DBproduct = await dao.getproductBySKU(insertProduct.sku);
                // console.log(DBproduct);

                if (DBproduct) {
                    console.log('❌', DBproduct.product_id, 'Dupe Product');
                    return;
                } else {
                    const added = await dao.addProduct(
                        insertProduct.product_id,
                        insertProduct.sku,
                        'store_c57b9f4f-0b69-496c-8036-d801c6041a72',
                        insertProduct.upc,
                        insertProduct.name,
                        insertProduct.brand,
                        insertProduct.category,
                        insertProduct.image_url,
                        insertProduct.size,
                        insertProduct.price);
                }
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    console.log('❌', insertProduct.product_id, insertProduct.sku, insertProduct.name);
                } else {
                    console.log(error);
                }
            }

            // console.log(insertProduct);
            // parsedProducts.push(insertProduct);
        });

        if (response.data.pagination) {
            if (response.data.pagination.nextPageNumber > 0) {
                console.log(response.data.pagination.nextPageNumber);
                getData(link, response.data.pagination.nextPageNumber, response.data.pagination.pageSize);
            } else {
                // let date = new Date().toISOString().replace(/\:/g, '-');

                // fs.writeFile(`./data/${link.name}-${date}.json`, JSON.stringify(parsedProducts), (err) => {
                //     if (err) throw err;
                //     console.log(`${link.url} converted to JSON ✅`);
                // });
                console.log('No more pages');
                // parsedProducts = [];
            }
        };
    } catch (error) {
        console.error(error);
    }
}


links.forEach(link => {
    getData(link, 1, 16);
});