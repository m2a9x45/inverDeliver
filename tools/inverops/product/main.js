const API_URL = "http://localhost:3002";
const token = localStorage.getItem('stoken');

const search = document.querySelector('#product-search');
const stores = document.querySelector('#stores');
const productList = document.querySelector('.product-list');
const selectedProduct = document.querySelector('.selected-product');

let storeFilter = 'All';

document.addEventListener('DOMContentLoaded', async () => {
    // check if url contains a product ID
    const url_string = window.location.href;
    const url = new URL(url_string);
    const productID = url.searchParams.get("product_id");
    console.log(productID);

    if (productID != null) {
        const product = await getProductByID(productID);
        selectProduct(product)
    }
})

stores.addEventListener('change', (e) => {
    console.log(stores.options[stores.selectedIndex].value);
    storeFilter = stores.options[stores.selectedIndex].value;
})

search.addEventListener('keyup', async (e) => {
    productList.innerHTML = "";

    if (search.value.split("_")[0] === "prod") {
        window.location = `.?product_id=${search.value}`
    }

    if (search.value.length >= 3) {
        console.log(search.value);
        const products  = await getProducts(search.value);
        products.forEach(product => {
            displayProduct(product)
        });
    }
})

async function getProducts(search) {
    try {
        const response = await fetch(`${API_URL}/product/search?name=${search}`, { headers: { 'authorization' : `Bearer ${token}`} });
        if (!response.ok) {
            throw `❌ ${response.status} - ${response.statusText}`;
        }
        const products = await response.json();
        return products;
    } catch (error) {
        console.error(error);
    } 
}

async function getProductByID(productID) {
    try {
        const response = await fetch(`${API_URL}/product/byid?id=${productID}`, { headers: { 'authorization' : `Bearer ${token}`} });
        if (!response.ok) {
            throw `❌ ${response.status} - ${response.statusText}`;
        }
        const product = await response.json();
        return product;
    } catch (error) {
        console.error(error);
    } 
}

function displayProduct(product) {
    if (product.retailer_id !== storeFilter && storeFilter !== 'All') {
        return
    }

    const keywordSearchFoundProduct = document.createElement('div');
    keywordSearchFoundProduct.setAttribute('class', 'keywordSearchFoundProduct');

    keywordSearchFoundProduct.addEventListener('click', (e) => {
        console.log(product.product_id);
        selectProduct(product);
    })

    const img = document.createElement('img')
    img.setAttribute('src', `${API_URL}/productImage/${product.image_url}`);
    img.setAttribute('width', '75px');
    img.setAttribute('height', '75px');

    const productName = document.createElement('p')
    productName.innerText = product.name;

    keywordSearchFoundProduct.appendChild(img);
    keywordSearchFoundProduct.appendChild(productName);

    productList.appendChild(keywordSearchFoundProduct);
}

function selectProduct(product) {
    productList.innerHTML = "";
    selectedProduct.innerHTML = "";
    // Add product ID to the url bar
    window.history.replaceState(null, null, `?product_id=${product.product_id}`);



    const img = document.createElement('img')
    img.setAttribute('src', `${API_URL}/productImage/${product.image_url}`);
    img.setAttribute('width', '175px');
    img.setAttribute('height', '175px');


    const table = document.createElement('table');

    const nameRow = document.createElement('tr');
    const nameTitle = document.createElement('td');
    nameTitle.innerText = 'Name';
    const nameValue = document.createElement('td');
    nameValue.innerText = product.name;

    nameRow.appendChild(nameTitle);
    nameRow.appendChild(nameValue);

    const priceRow = document.createElement('tr');
    const priceTitle = document.createElement('td');
    priceTitle.innerText = 'Price';
    const priceValue = document.createElement('td');
    priceValue.innerText = product.price;

    priceRow.appendChild(priceTitle);
    priceRow.appendChild(priceValue);

    const sizeRow = document.createElement('tr');
    const sizeTitle = document.createElement('td');
    sizeTitle.innerText = 'Size';
    const sizeValue = document.createElement('td');
    sizeValue.innerText = product.size;

    sizeRow.appendChild(sizeTitle);
    sizeRow.appendChild(sizeValue);

    const categoryRow = document.createElement('tr');
    const categoryTitle = document.createElement('td');
    categoryTitle.innerText = 'Category';
    const categoryValue = document.createElement('td');
    categoryValue.innerText = product.category;

    categoryRow.appendChild(categoryTitle);
    categoryRow.appendChild(categoryValue);

    const brandRow = document.createElement('tr');
    const barndTitle = document.createElement('td');
    barndTitle.innerText = 'Brand';
    const brandValue = document.createElement('td');
    brandValue.innerText = product.brand || "null";

    brandRow.appendChild(barndTitle);
    brandRow.appendChild(brandValue);

    const skuRow = document.createElement('tr');
    const skuTitle = document.createElement('td');
    skuTitle.innerText = 'sku';
    const skuValue = document.createElement('td');
    const skuValueP = document.createElement('p');
    skuValueP.innerText = product.sku;
    skuValueP.setAttribute('class', 'code');

    skuRow.appendChild(skuTitle);
    skuRow.appendChild(skuValue);
    skuValue.appendChild(skuValueP);

    const upcRow = document.createElement('tr');
    const upcTitle = document.createElement('td');
    upcTitle.innerText = 'upc';
    const upcValue = document.createElement('td');
    const upcValueP = document.createElement('p');
    upcValueP.innerText = product.upc || "null";
    upcValueP.setAttribute('class', 'code');

    upcRow.appendChild(upcTitle);
    upcRow.appendChild(upcValue);
    upcValue.appendChild(upcValueP);

    const productIDRow = document.createElement('tr');
    const productIDTitle = document.createElement('td');
    productIDTitle.innerText = 'Product ID';
    const productIDValue = document.createElement('td');
    const productIDValueP = document.createElement('p');
    productIDValueP.innerText = product.product_id;
    productIDValueP.setAttribute('class', 'code');

    productIDRow.appendChild(productIDTitle);
    productIDRow.appendChild(productIDValue);
    productIDValue.appendChild(productIDValueP);

    const retailerIDRow = document.createElement('tr');
    const retailerIDitle = document.createElement('td');
    retailerIDitle.innerText = 'retailer ID';
    const retailerIDValue = document.createElement('td');
    const retailerIDValueP = document.createElement('p');
    retailerIDValueP.innerText = product.retailer_id;
    retailerIDValueP.setAttribute('class', 'code');

    retailerIDRow.appendChild(retailerIDitle);
    retailerIDRow.appendChild(retailerIDValue);
    retailerIDValue.appendChild(retailerIDValueP);


    selectedProduct.appendChild(img);

    table.appendChild(nameRow);
    table.appendChild(priceRow);
    table.appendChild(sizeRow);
    table.appendChild(categoryRow);
    table.appendChild(brandRow);
    table.appendChild(skuRow);
    table.appendChild(upcRow);
    table.appendChild(productIDRow);
    table.appendChild(retailerIDRow);

    selectedProduct.appendChild(table);
}