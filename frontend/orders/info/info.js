const API_URL = "http://localhost:3000";
const orderContentDiv = document.querySelector(".orderContent"); 
const priceTotal = document.querySelector('#priceTotal');

const url_string = window.location.href;
const url = new URL(url_string);
const orderID = url.searchParams.get("orderID");

const token = localStorage.getItem('token');

let total =  0;

if (!token) {
  window.location.replace("../signin");
}

fetch(`${API_URL}/order/status?orderID=${orderID}`, {
    headers: {
      'authorization': `bearer ${token}`,
    }
  })
  .then(response => {
    if (response.status == 404) {
      console.log("No order with that ID that you've started has been found");
      // window.location.replace(`../`); 
    }
    if (response.ok) {
      return response.json()
    }
  })
  .then(data => {
    console.log(data);
  });

fetch(`${API_URL}/order/content/${orderID}`, {
    headers: {
      'authorization': `bearer ${token}`,
    }
  })
  .then(response => {
    if (response.status == 404) {
      console.log("No order with that ID that you've started has been found");
      // window.location.replace(`../`); 
    }
    if (response.ok) {
      return response.json()
    }
  })
  .then(data => {
    console.log(data);
    data.forEach(item => {
      displayOrderContent(item);
      total = total + (item.price * item.quantity);
      console.log(total);
    });
    
    const totalFormat = new Intl.NumberFormat('en-UK', { style: 'currency', currency: 'GBP' }).format(total / 100);
    priceTotal.innerText = `Your total: ${totalFormat}`;
  });



function displayOrderContent(item) {

  const orderItem = document.createElement("div");
  orderItem.setAttribute("class", "orderItem");

  const orderItemImgAndName = document.createElement("div");
  orderItemImgAndName.setAttribute("class", "orderItemImgAndName");

  const img = document.createElement("img");
  img.setAttribute("src", item.image_url);

  const name = document.createElement("p");
  name.innerText = item.name;

  orderItemImgAndName.appendChild(img);
  orderItemImgAndName.appendChild(name);

  const orderItemPriceAndAmount = document.createElement("div");
  orderItemPriceAndAmount.setAttribute("class", "orderItemPriceAndAmount");

  const quantity = document.createElement("p");
  quantity.innerText = `Quantity: ${item.quantity}`;

  const price = document.createElement("p");
  const formatedPrice = new Intl.NumberFormat('en-UK', { style: 'currency', currency: 'GBP' }).format((item.price * item.quantity) / 100);
  price.innerText = formatedPrice;

  orderItemPriceAndAmount.appendChild(quantity);
  orderItemPriceAndAmount.appendChild(price);

  orderItem.appendChild(orderItemImgAndName);
  orderItem.appendChild(orderItemPriceAndAmount);

  orderContentDiv.appendChild(orderItem);


}