const API_URL = "https://api.inverdeliver.com"

const navBarToggle = document.querySelector('.navbarToggle');
const navtoggle = document.querySelector('.mainNav');
const catogoryItems = document.querySelectorAll('.categoryItem');
const gridCcontainer = document.querySelector('.grid-container');
const productSearch = document.querySelector('#productSearch');

const loader = document.querySelector('.loader');
const errorMessage = document.querySelector('#errorMessage');

let selectedCategory; 
let initProducts;
let cart = {};
let storeID;

// Need to chnage where we redirect google login to with the token, as this will no longer work as part of the cart page

const loginToken = new URL(window.location.href).searchParams.get("token");

if (loginToken) {
  localStorage.setItem('token', loginToken);
  window.location = 'https://inverdeliver.com';
}

// Navbar toggle code
const x = window.matchMedia("(max-width: 680px)");
x.addEventListener("change", () => x.matches ? navtoggle.style.display = "none" : navtoggle.style.display = "flex");
navBarToggle.addEventListener("click", () => (navtoggle.style.display === "none" || navtoggle.style.display === "") ? navtoggle.style.display = "flex" : navtoggle.style.display = "none");

// Checking to see if the jwt is vaild client side, we could just check if it exist in local storage to update the UI and the deal with a 401 when it happens.
if (localStorage.getItem("token")) {
  const jwtExp = JSON.parse(atob(localStorage.getItem("token").split('.')[1]));
  if (Date.now() < jwtExp.exp * 1000) {
    const logout = document.querySelector('#logout');
    logout.innerText = "Logout";
    logout.setAttribute("href", "./logout");
  } else {
    localStorage.removeItem('token');
  }
}

document.addEventListener('DOMContentLoaded', async () => {  
  if (localStorage.getItem("cart")) cart = JSON.parse(localStorage.getItem("cart"));

  const urlParams = new URLSearchParams(window.location.search);
  storeID = urlParams.get('storeID');
  localStorage.setItem('storeID', storeID);
  console.log(storeID);

  try {
    const products = await getProducts(storeID);
    if (products.data.length === 0) gridCcontainer.innerHTML = 'Sorry we cannot find any products';

    const store = await getStoreInfo(storeID);

    const storeDisplayName = document.querySelector('#storeDisplayName');    
    const subStoreDisplayName = document.querySelector('#subStoreDisplayName');  

    storeDisplayName.innerHTML = `You're shopping at ${store[0].name}`;
    subStoreDisplayName.innerHTML = store[0].store_name;
    

    initProducts = products.data;
    addProducts(products.data);
  } catch (error) {
    console.error(error);
  }
});

async function getProducts(storeID){
  try {
    clearError();
    const response = await fetch(`${API_URL}/product/standard?storeID=${storeID}`);
    const data = await response.json();
    hideSpinner();
    return data;
  } catch (error) {
    hideSpinner();
    showError("Something went wrong, if this continues please get in touch");
    console.error(error);
  }
}

async function getStoreInfo(storeID) {
  try {
    const response = await fetch(`${API_URL}/store/${storeID}`); 
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error(error);
  }
}

function addProducts(productArray) {
  productArray.forEach(product => {

    const gridDiv = document.createElement("div");
    gridDiv.setAttribute("class", "grid-item");

    const img = document.createElement("img");
    img.setAttribute("src", product.image_url ? `${API_URL}/productImage/${product.image_url}` : "");
    img.setAttribute("loading", "lazy");
    img.setAttribute("width", "150px");
    img.setAttribute("height", "150px");
    img.setAttribute("alt", product.name)

    const size = document.createElement("p");
    size.setAttribute("class", "size");
    size.innerHTML = product.size === null ? size.style.visibility = 'hidden' : product.size = product.size;


    const title = document.createElement("p");
    title.setAttribute("class", "title");
    title.innerText = product.name;

    const productLinksDiv = document.createElement("div");
    productLinksDiv.setAttribute("class", "productLinks");

    const formatedPrice = new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP'
    }).format(product.price / 100);

    const price = document.createElement("p");

    product.price_variable === 1 ? price.innerText = `${formatedPrice} (typically)` : price.innerText = formatedPrice;

    const button = document.createElement("button");
    button.innerText = "Add to Cart";
    button.setAttribute("class", "addCartButton");
    button.addEventListener("click", (e) => {
      e.target.innerText = "Added to cart";
      // e.target.disabled = true;
      // e.target.style.display = 'none';
      // Show the quantiy selector
      // console.log(e);
      // console.log(e.target.parentElement.parentElement.children[1].children[1].innerText);

      console.log(product.product_id);
      e.target.parentElement.parentElement.children[1].children[1].innerText++;

      button.style.display = 'none';
      quantityChangerDiv.style.display = 'flex';
      


      // setTimeout(() => {
      //   e.target.innerText = "Add to cart";
      //   e.target.disabled = false;
      // }, 550);

      addProductToCart(product);
    })

    const div = document.createElement("div");
    div.setAttribute("class", "productLinks");

    div.appendChild(price);
    div.appendChild(button);

    const quantityChangerDiv = document.createElement("div");
    quantityChangerDiv.setAttribute('class', 'quantitySelector');

    const addButton = document.createElement('button');
    addButton.setAttribute('class', 'quantityButton');
    addButton.innerText = '+';
    addButton.addEventListener("click", (e) => {
      // console.log(e);
      // console.log(e.target.parentElement.children[1].innerText);
      e.target.parentElement.children[1].innerText++;
      cart[product.product_id].number++;

      if (cart[product.product_id].number > 9) {
        cart[product.product_id].number = 9;
        e.target.parentElement.children[1].innerText = 9;
      }


      localStorage.setItem("cart", JSON.stringify(cart));
    });

    const quantityChanger = document.createElement("p");
    quantityChanger.setAttribute('class', 'quantityNumber');

    const minusButton = document.createElement('button');
    minusButton.setAttribute('class', 'quantityButton');
    minusButton.innerText = '-';
    minusButton.addEventListener("click", (e) => {
      // console.log(e);
      // console.log(e.target.parentElement.children[1].innerText);

      e.target.parentElement.children[1].innerText--;
      cart[product.product_id].number--;

      if (cart[product.product_id].number < 1) {
        delete cart[product.product_id];
        e.target.parentElement.children[1].innerText = 0;
        quantityChangerDiv.style.display = 'none';
        button.style.display = 'inline';
      }

      
      localStorage.setItem("cart", JSON.stringify(cart));
    });

    // Check the cart for the current quantity
    if (cart[product.product_id] &&  cart[product.product_id].number > 0) {
      button.style.display = 'none';
      quantityChanger.innerText = cart[product.product_id].number
    } else {
      quantityChangerDiv.style.display = 'none';
      quantityChanger.innerText = 0;
    }

    quantityChangerDiv.appendChild(minusButton);
    quantityChangerDiv.appendChild(quantityChanger);
    quantityChangerDiv.appendChild(addButton);
    

    productLinksDiv.appendChild(div);
    productLinksDiv.appendChild(quantityChangerDiv);

    gridDiv.appendChild(img);
    gridDiv.appendChild(size);
    gridDiv.appendChild(title);
    gridDiv.appendChild(productLinksDiv);

    gridCcontainer.appendChild(gridDiv);
  });
}

function addProductToCart(product) {
  console.log(product);

  if (cart[product.product_id]) cart[product.product_id].number++; 
  else {
    cart[product.product_id] = {
      "name": product.name,
      "number": 1,
      "price": product.price,
      "img": product.image_url,
      "category": product.category,
      "storeID": storeID,
    };
  }
  console.log(cart);
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Called form the category buttons
function category(e, category) {
  if (e.className.includes('selected')) {
    catogoryItems.forEach(item => {
      e.classList.remove("selected");
    });
    selectedCategory = null;
    getproducts(null, productSearch.value);
  } else {
    catogoryItems.forEach(item => {
      item.classList.remove("selected");
    });
    e.classList.add("selected");
    selectedCategory = category; 
    gridCcontainer.innerHTML = '';
    getproducts(category, productSearch.value)
  }
}

productSearch.addEventListener("keypress", (e) => {
  clearError();
  console.log(selectedCategory);;

  if (e.key === 'Enter' && productSearch.value !== "") {
    console.log(productSearch.value);
    getproducts(selectedCategory, productSearch.value);
  }

  if (e.key === 'Enter' && productSearch.value === "" && (selectedCategory === null || selectedCategory === undefined)) {
    gridCcontainer.innerHTML = "";
    addProducts(initProducts);
  }
})

async function getproducts(category, search) {
  gridCcontainer.innerHTML = "";
  document.activeElement.blur(); // hides iOS keyboard 
  let url;
  
  if (search && category) url = `category=${category}&search=${search}`;
  else if (category) url = `category=${category}`;
  else if (search) url = `search=${search}`;

  const products = await searchProducts(url);
  if (products.data.length === 0) return gridCcontainer.innerHTML = 'Sorry we cannot find any products with that name';
  addProducts(products.data);
}

async function searchProducts(url) {
  try {
    showSpinner();
    const response = await fetch(`${API_URL}/product/standard?storeID=${storeID}&${url}`)
    const products = await response.json();
    hideSpinner();
    return products;
  } catch (error) {
    console.error(error);
  }
}

function showSpinner() { loader.style.display = 'block' };
function hideSpinner() { loader.style.display = 'none' };

function showError(message) {
  errorMessage.innerHTML = message;
  errorMessage.style.display = 'block';
}

function clearError(){
  errorMessage.style.display = 'none';
}