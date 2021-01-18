const gridCcontainer = document.querySelector('.grid-container');

const API_URL = "http://localhost:3000"

let cart = {};

if (localStorage.getItem("cart")) {
  cart = JSON.parse(localStorage.getItem("cart"));
}

fetch(`${API_URL}/product/standard`)
  .then(response => response.json())
  .then(resObject => addProducts(resObject.data));


function addProducts(productArray) {
    productArray.forEach(product => {

        const gridDiv = document.createElement("div");
        gridDiv.setAttribute("class", "grid-item");

        const img = document.createElement("img");
        img.setAttribute("src", product.image_url);
        img.setAttribute("width", "150px");
        img.setAttribute("height", "150px");

        const title = document.createElement("p");
        title.innerText = `${product.name} - ${product.des}`;

        const productLinksDiv = document.createElement("div");
        productLinksDiv.setAttribute("class", "productLinks");

        const formatedPrice = new Intl.NumberFormat('en-UK', { style: 'currency', currency: 'GBP' }).format(product.price / 100);

        const price = document.createElement("p");
        price.innerText = formatedPrice // more logic needed to handle zero

        const button = document.createElement("button");
        button.innerText = "Add to Cart";
        button.setAttribute("class", "addCartButton");
        button.addEventListener("click", () => {
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
      "name" : product.name,
      "number" : 1,
      "price" : product.price
    };
  }
  console.log(cart);
  toggleToast();
  localStorage.setItem("cart", JSON.stringify(cart));

}

function toggleToast() {
  // Get the snackbar DIV
  var x = document.getElementById("snackbar");

  // Add the "show" class to DIV
  x.className = "show";

  // After 3 seconds, remove the show class from DIV
  setTimeout(function(){ x.className = x.className.replace("show", ""); }, 1000);
}