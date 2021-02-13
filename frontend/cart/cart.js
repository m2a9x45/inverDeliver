const API_URL = "http://localhost:3000";

let cart = JSON.parse(localStorage.getItem("cart"));

const cartContent = document.querySelector(".cartContent");
const priceTotal = document.querySelector("#priceTotal");
const deliveryForm = document.querySelector('#deliveryForm');

const token = localStorage.getItem('token');

if (!token) {
  window.location.replace("../signin");
}

console.log(cart);
let total =  0;

for (const [key, value] of Object.entries(cart)) {
    console.log(`${key}: ${value.name} ${value.number} £ ${value.price} £${value.price * value.number}`);
    total = total + (value.price * value.number);
    displayCart(key, value);
}

const totalFormat = new Intl.NumberFormat('en-UK', { style: 'currency', currency: 'GBP' }).format(total / 100);

priceTotal.innerText = `Your total: ${totalFormat}`;

function displayCart(id, item) {
  const div = document.createElement("div");
  div.setAttribute("class", "cartItem");

  const divItems = document.createElement("div");

  const itemName = document.createElement("p");
  itemName.innerText = item.name;

  const quantityLabel = document.createElement("label");
  quantityLabel.setAttribute("for", "quantity");
  quantityLabel.innerText = "quantity: ";

  const quantityInput = document.createElement("Input");
  quantityInput.setAttribute("type", "number");
  quantityInput.setAttribute("id", "quantity");
  quantityInput.setAttribute("value", item.number);


  const divPrice = document.createElement("div");

  const itemPrice = document.createElement("p");

  // console.log(new Intl.NumberFormat('en-UK', { style: 'currency', currency: 'GBP' }).format(number));

  const formatedPrice = new Intl.NumberFormat('en-UK', { style: 'currency', currency: 'GBP' }).format((item.price * item.number) / 100);

  itemPrice.innerText = formatedPrice;

  divItems.appendChild(itemName);
  divItems.appendChild(quantityLabel);
  divItems.appendChild(quantityInput);

  divPrice.appendChild(itemPrice);

  div.appendChild(divItems);
  div.appendChild(divPrice);

  cartContent.appendChild(div);

}

deliveryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const orderData = {
    products: []
  };

  for (const [key, value] of Object.entries(cart)) {
    console.log(`${key}: ${value.name} ${value.number} £ ${value.price / 100}`);
    orderData.products.push([key, value.number]);
  }


  let data = new FormData(deliveryForm);
  for (const [name,value] of data) {
    console.log(name,value);
    orderData[name] = value;
  };

  console.log(orderData);

  // convert delivery time into epoch time
  const deliverTime = new Date(orderData.delivery_time)
  deliverTimeEp = deliverTime.getTime();
  // console.log(deliverTimeEp);

  // convert current time into epoch time
  const curret = new Date();
  const currentTimeNumber = curret.getTime();
  // console.log(currentTimeNumber);

  // check that the deliver time is greater than the current time + 2 hours
  if (deliverTime > currentTimeNumber + 7200000) {
    console.log("Delivery time is at least 2 hours from the current time");
    fetch(`${API_URL}/order/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authorization': `bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      window.location.replace(`../payment/index.html?orderID=${data.order_id}`);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  } else {
    console.log("Delivery time is not at least 2 hours from the current time");
  }
})
