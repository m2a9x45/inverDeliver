const API_URL = "http://localhost:3001";
const orderContentDiv = document.querySelector(".orderContent");
const priceTotal = document.querySelector('#priceTotal');

const url_string = window.location.href;
const url = new URL(url_string);
const orderID = url.searchParams.get("orderID");

const token = localStorage.getItem('token');

if (!token) {
  window.location.replace("../signin");
} else {
    const jwtExp = JSON.parse(atob(token.split('.')[1]));
  
    if (Date.now() < jwtExp.exp * 1000) {
      // we think token is vaild
      const logout = document.querySelector('#logout');
      logout.innerText = "Logout";
      logout.setAttribute("href", "../../logout");
    } else {
      localStorage.removeItem("token");
      window.location.replace('../../signin');
    }
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
    displayDeliveryInfo(data);
    showOrderStatus(data.status);
  });

fetch(`${API_URL}/order/content?orderID=${orderID}`, {
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
    });
  });

fetch(`${API_URL}/order/price?orderID=${orderID}`, {
    headers: {
      'authorization': `bearer ${token}`,
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);

    const totalFormat = new Intl.NumberFormat('en-UK', {
      style: 'currency',
      currency: 'GBP'
    }).format((data.price + data.fee) / 100);

    priceTotal.innerText = `Your total: ${totalFormat}`;

    displayOrderContent({
      name: "Delivery Fee",
      price: data.fee,
      quantity: 1
    });
  });

function displayOrderContent(item) {

  const orderItem = document.createElement("div");
  orderItem.setAttribute("class", "orderItem");

  const orderItemImgAndName = document.createElement("div");
  orderItemImgAndName.setAttribute("class", "orderItemImgAndName");

  const orderItemPriceAndAmount = document.createElement("div");
  orderItemPriceAndAmount.setAttribute("class", "orderItemPriceAndAmount");

  let img;
  let quantity;

  if (item.name === "Delivery Fee") {
    
  } else {
    img = document.createElement("img");
    img.setAttribute("src", item.image_url);

    quantity = document.createElement("p");
    quantity.innerText = `Quantity: ${item.quantity}`;

    orderItemImgAndName.appendChild(img);
    orderItemPriceAndAmount.appendChild(quantity);
  }

  const name = document.createElement("p");
  name.innerText = item.name;

  
  orderItemImgAndName.appendChild(name);

  const price = document.createElement("p");
  const formatedPrice = new Intl.NumberFormat('en-UK', {
    style: 'currency',
    currency: 'GBP'
  }).format((item.price * item.quantity) / 100);
  price.innerText = formatedPrice;

  
  orderItemPriceAndAmount.appendChild(price);

  orderItem.appendChild(orderItemImgAndName);
  orderItem.appendChild(orderItemPriceAndAmount);

  orderContentDiv.appendChild(orderItem);


};

function displayDeliveryInfo(data) {
  const streetName = document.querySelector('#streetName');
  const city = document.querySelector('#city');
  const postCode = document.querySelector('#postCode');

  const deliveryTime = document.querySelector('#deliveryTime');
  const contactNumber = document.querySelector('#contactNumber');
  const contactEmail = document.querySelector('#contactEmail');

  streetName.innerText = data.street;
  city.innerText = data.city;
  postCode.innerText = data.post_code;

  const deliveryDate = new Date(data.time);
  const displaydate = deliveryDate.toLocaleDateString("en-GB", {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  deliveryTime.innerText = `Delivery Time: ${displaydate}`;
  contactNumber.innerText = data.phone_number;
  contactEmail.innerText = data.email;

}

function showOrderStatus(status) {

  const status1 = document.querySelector("#status1");
  const status2 = document.querySelector("#status2");
  const status3 = document.querySelector("#status3");
  const status4 = document.querySelector("#status4");
  const status5 = document.querySelector("#status5");
  const status6 = document.querySelector("#status6");

  switch (status) {
    case 1:
      
      status1.style.opacity = 1;
      status1.style.backgroundColor = "rgb(66, 176, 255)";
      break;
    case 2:
      
      status1.style.opacity = 1;
      status2.style.opacity = 1;
      status2.style.backgroundColor = "rgb(66, 176, 255)";
      break;
    case 3:
      
      status1.style.opacity = 1;
      status2.style.opacity = 1;
      status3.style.opacity = 1;
      status3.style.backgroundColor = "rgb(66, 176, 255)";
      break;
    case 4:
      
      status1.style.opacity = 1;
      status2.style.opacity = 1;
      status3.style.opacity = 1;
      status4.style.opacity = 1;
      status4.style.backgroundColor = "rgb(66, 176, 255)";
      break;
    case 5:
      
      status1.style.opacity = 1;
      status2.style.opacity = 1;
      status3.style.opacity = 1;
      status4.style.opacity = 1;
      status5.style.opacity = 1;
      status5.style.backgroundColor = "rgb(66, 176, 255)";
      break;
    case 6:
      
      status1.style.opacity = 1;
      status2.style.opacity = 1;
      status3.style.opacity = 1;
      status4.style.opacity = 1;
      status5.style.opacity = 1;
      status6.style.opacity = 1;
      status6.style.backgroundColor = "rgb(66, 176, 255)";
      break;
    default:
      break;
  }
}