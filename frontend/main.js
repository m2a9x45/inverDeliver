const API_URL = "http://localhost:3001"

const gridCcontainer = document.querySelector('.grid-container');
const productSearch = document.querySelector('#productSearch');
const navBarToggle = document.querySelector('.navbarToggle');
const navtoggle = document.querySelector('.mainNav');
const loader = document.querySelector('.loader');
const errorMessage = document.querySelector('#errorMessage');

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

productSearch.addEventListener("keypress", (e) => {
  if (e.key === 'Enter' && productSearch.value !== "") {
    loader.style.display = "block";
    console.log(productSearch.value);
    fetch(`${API_URL}/product/search?productName=${productSearch.value}`)
      .then(response => {
        loader.style.display = "none";
        switch (response.status) {
          case 200:
            return response.json()
          default:
            console.log("🚨 Something went wrong");
        }
      })
      .then(data => {
        console.log(data);
        if (data.length != 0) {
          console.log("found product");
          gridCcontainer.innerHTML = "";
          addProducts(data);
        } else {
          console.log("didn't product");
        }
      })
      .catch(error => {
        loader.style.display = "none";
        errorMessage.innerText = "Something went wrong, if this continues please get in touch"
        console.error(error);
      })
  }

  if (e.key === 'Enter' && productSearch.value === "") {
    gridCcontainer.innerHTML = "";
    if (initProducts) {
      addProducts(initProducts);
    }
  }
})

function addProducts(productArray) {
  productArray.forEach(product => {

    const gridDiv = document.createElement("div");
    gridDiv.setAttribute("class", "grid-item");

    const img = document.createElement("img");
    img.setAttribute("src", product.image_url ? product.image_url : "");
    img.setAttribute("width", "150px");
    img.setAttribute("height", "150px");

    const title = document.createElement("p");
    title.innerText = `${product.name} - ${product.des}`;

    const productLinksDiv = document.createElement("div");
    productLinksDiv.setAttribute("class", "productLinks");

    const formatedPrice = new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP'
    }).format(product.price / 100);

    const price = document.createElement("p");
    price.innerText = formatedPrice // more logic needed to handle zero

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





