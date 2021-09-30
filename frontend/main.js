const API_URL = "http://localhost:3001"

const gridCcontainer = document.querySelector('.grid-container');
const productSearch = document.querySelector('#productSearch');
const navBarToggle = document.querySelector('.navbarToggle');
const navtoggle = document.querySelector('.mainNav');
const catogoryItems = document.querySelectorAll('.categoryItem');
const loader = document.querySelector('.loader');
const errorMessage = document.querySelector('#errorMessage');

let selectedCategory; 

// Navbar toggle code
const x = window.matchMedia("(max-width: 680px)");

x.addEventListener("change", () => {
  if (x.matches) { 
    navtoggle.style.display = "none";
  } else {
    navtoggle.style.display = "flex";
  }
})

navBarToggle.addEventListener("click", () => {
  if (navtoggle.style.display === "none" || navtoggle.style.display === "") {
    navtoggle.style.display = "flex";
  } else {
    navtoggle.style.display = "none";
  }
});


let initProducts;

let cart = {};

if (localStorage.getItem("cart")) {
  cart = JSON.parse(localStorage.getItem("cart"));
}

if (localStorage.getItem("token")) {
  const token = localStorage.getItem("token");
  const jwtExp = JSON.parse(atob(token.split('.')[1]));

  if (Date.now() < jwtExp.exp * 1000) {
    // we think token is vaild
    const logout = document.querySelector('#logout');
    logout.innerText = "Logout";
    logout.setAttribute("href", "./logout");
  } else {
    localStorage.removeItem('token');
  }
}

fetch(`${API_URL}/product/standard`)
  .then(response => {
    loader.style.display = "none";
    return response.json()
  })
  .then(data => {
    console.log(data);
    initProducts = data.data;
    addProducts(data.data)
  })
  .catch((error) => {
    loader.style.display = "none";
    errorMessage.innerText = "Something went wrong, if this continues please get in touch"
    console.error(error);
  });

function addProducts(productArray) {
  productArray.forEach(product => {

    const gridDiv = document.createElement("div");
    gridDiv.setAttribute("class", "grid-item");

    const img = document.createElement("img");
    img.setAttribute("src", product.image_url ? `http://localhost:3001/productImage/${product.image_url}` : "");
    img.setAttribute("loading", "lazy");
    img.setAttribute("width", "150px");
    img.setAttribute("height", "150px");
    img.setAttribute("alt", product.name)

    const title = document.createElement("p");
    title.innerText = `${product.name} - ${product.size}`;

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
      e.target.disabled = true;

      setTimeout(function () {
        e.target.innerText = "Add to cart";
        e.target.disabled = false;
      }, 550);

      onProductadd(product);
    })

    const div = document.createElement("div");
    div.setAttribute("class", "productLinks");

    div.appendChild(price);
    div.appendChild(button);

    productLinksDiv.appendChild(div);

    gridDiv.appendChild(img);
    gridDiv.appendChild(title);
    gridDiv.appendChild(productLinksDiv);

    gridCcontainer.appendChild(gridDiv);
  });
}

function onProductadd(product) {
  console.log(product.product_id);

  if (cart[product.product_id]) {
    let currentQuantity = cart[product.product_id].number;
    cart[product.product_id].number = currentQuantity + 1;
  } else {
    cart[product.product_id] = {
      "name": product.name,
      "number": 1,
      "price": product.price
    };
  }
  console.log(cart);
  toggleToast(product.name);
  localStorage.setItem("cart", JSON.stringify(cart));

}

function toggleToast(name) {

  // Get the snackbar DIV
  var x = document.getElementById("snackbar");
  x.innerText = `${name} added to 🛒`

  // Add the "show" class to DIV
  x.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function () {
    x.className = x.className.replace("show", "");
  }, 500);
}

function showError(show) {
  show ? errorMessage.style.display = 'block' : errorMessage.style.display = 'none';
}

function category(e, category) {
  showError(false);
  productSearch.value = '';

  if (e.className.includes('selected')) {
    catogoryItems.forEach(item => {
      e.classList.remove("selected");
    });
    selectedCategory = null;
    getproducts(null);

  } else {
    catogoryItems.forEach(item => {
      item.classList.remove("selected");
    });
    e.classList.add("selected");
    selectedCategory = category; 
    gridCcontainer.innerHTML = '';
    showError(false);
    loader.style.display = "block";
  
    getproducts(category, null)
  }
}

productSearch.addEventListener("keypress", (e) => {
  showError(false)
  if (e.key === 'Enter' && productSearch.value !== "") {
    loader.style.display = "block";
    console.log(productSearch.value);
    getproducts(selectedCategory, productSearch.value);
  }

  if (e.key === 'Enter' && productSearch.value === "") {
    gridCcontainer.innerHTML = "";
    if (initProducts) {
      addProducts(initProducts);
    }
  }
})

function getproducts(category, search) {
  console.log(category, search);
  gridCcontainer.innerHTML = "";
  let url;
  
  if (search && category) {
    url = `category=${category}&search=${search}`;
  } else {
    if (category) {
      url = `category=${category}`;
    }
  
    if (search) {
      url = `search=${search}`;
    }
  
  }

  fetch(`${API_URL}/product/standard?${url}`)
  .then(response => {
    loader.style.display = "none";
    return response.json()
  })
  .then(data => {
    console.log(data);
    if (data.data.length === 0) {
      errorMessage.innerHTML = 'Sorry we cannot find any products with that name'
      showError(true);
    }
    addProducts(data.data)
  })
  .catch((error) => {
    loader.style.display = "none";
    showError(true);
    errorMessage.innerText = "Something went wrong, if this continues please get in touch"
    console.error(error);
  });
}


