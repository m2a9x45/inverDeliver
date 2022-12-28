const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const { execSync } = require('child_process');

const targets = [
//   { url: 'https://www.tesco.com/groceries/en-GB/shop/fresh-food/all', cat: 'fresh' },
  { url: 'https://www.tesco.com/groceries/en-GB/shop/bakery/all', cat: 'bakery' },
//   { url: 'https://www.tesco.com/groceries/en-GB/shop/frozen-food/all', cat: 'frozen' },
//   { url: 'https://www.tesco.com/groceries/en-GB/shop/food-cupboard/all', cat: 'food_cub' },
//   { url: 'https://www.tesco.com/groceries/en-GB/shop/drinks/all', cat: 'drink' },
];

async function getHTML(url) {
  try {
    const response = await axios.get(url);
    console.log(response.status);
    return response.data;
  } catch (error) {
    console.log(error.response.status);
    if (error.response.status !== 200) {
      return { end: true };
    }
    return error;
  }
}

targets.forEach(async (target) => {
  let end = false;
  let pageNumber = 1;

  while (!end) {
    console.log(`${target.url}?page=${pageNumber}`);
    execSync('sleep 1');
    // eslint-disable-next-line no-await-in-loop
    const response = await getHTML(`${target.url}?page=${pageNumber}`);
    if (response.end) {
      end = true;
      break;
    }

    fs.writeFileSync(`./html/bakery/page_${pageNumber}.html`, response);
    pageNumber += 1;
  }

  // Write html to folder
});

function parseHTML(html) {
  let $ = cheerio.load(html);
  const productList = $('div .product-list-container ');

  // console.log(productList.html());

  $ = cheerio.load(productList.html());

  const products = [];

  $('li').each((i, elm) => {
    const productName = $('div .product-details--wrapper > h3 > a > span', elm).text().replace(/(\r\n|\n|\r)/gm, '').replace(/\s+/g, ' ')
      .trim();

    const price = $('form > div > div > div > p', elm).first().text().replace(/(\r\n|\n|\r)/gm, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (productName === '') {
      return;
    }

    let inStock = true;

    if (price === '') {
      inStock = false;
    }

    // Tesco image urls can use ?h=225&w=225 to specify width / height we'd like
    // https://digitalcontent.api.tesco.com/v2/media/ghs/aadcdb15-21dc-46ec-ba83-937998e9ef4d/338f138c-ae58-43da-ab8c-58a25a1a2c09.jpeg?h=225&w=225
    const product = {
      name: productName,
      link: $('div .product-details--wrapper > h3 > a', elm).attr('href'),
      img: $('img', elm).attr('srcset').split(' ')[0].split('?')[0],
      price,
      inStock,
    };

    products.push(product);
  });
  return products;
}

// const html = fs.readFileSync('./html/fresh/page_142.html', { encoding: 'utf8' });
// const products = parseHTML(html);
// console.log(products);
