const API_URL = "http://localhost:3001";

const navBarToggle = document.querySelector('.navbarToggle');
const navtoggle = document.querySelector('.mainNav');
const cartContent = document.querySelector(".cartContent");
const priceTotal = document.querySelector("#priceTotal");
const deliveryForm = document.querySelector('#deliveryForm');
const addphoneNumberForm = document.querySelector('#addphoneNumberForm');
const phoneNumberInput = document.querySelector('#phone');
const errorMessage = document.querySelector('#errorMessage');

const verfiyphoneNumberForm = document.querySelector('#verfiyphoneNumberForm');
const verificationCodeInput = document.querySelector('#verificationCode'); 

const street_name = document.querySelector('#street_name');
const city = document.querySelector('#city');
const post_code = document.querySelector('#post_code');

const savedAddressSelector = document.querySelector('.savedAddressSelector');
const addNewAddress = document.querySelector('.addNewAddress');
const addNewAddressLink = document.querySelector('#addNewAddressLink');

const token = localStorage.getItem('token');

if (!token) {
  window.location.replace("../signin");
} else {
    const jwtExp = JSON.parse(atob(token.split('.')[1]));
  
    if (Date.now() < jwtExp.exp * 1000) {
      // we think token is vaild
      const logout = document.querySelector('#logout');
      logout.innerText = "Logout";
      logout.setAttribute("href", "../logout");
    } else {
      localStorage.removeItem("token");
      window.location.replace('../signin');
    }
}

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

let total =  350;
let cart;
let selectedAddress = null;

showCart();

function showCart() {
  cart = JSON.parse(localStorage.getItem("cart"));
  if (cart === null || Object.keys(cart).length === 0 && cart.constructor === Object) {
    window.location = '../';
  }
  console.log(cart);

  for (const [key, value] of Object.entries(cart)) {
    console.log(`${key}: ${value.name} ${value.number} £ ${value.price} £${value.price * value.number}`);
    total = total + (value.price * value.number);
    displayCart(value, key);
  }

  displayCart({name: "Delivery Fee", price: 350, number:1});

  const totalFormat = new Intl.NumberFormat('en-UK', { style: 'currency', currency: 'GBP' }).format(total / 100);

  priceTotal.innerText = `Your total: ${totalFormat}`;
};

function displayCart(item, id) {
  const div = document.createElement("div");
  div.setAttribute("class", "cartItem");

  const divItems = document.createElement("div");

  const itemName = document.createElement("p");
  itemName.innerText = item.name;

  divItems.appendChild(itemName);

  let quantityLabel
  let quantityInput;

  if (item.name != "Delivery Fee") {
    quantityLabel = document.createElement("label");
    quantityLabel.setAttribute("for", "quantity");
    quantityLabel.innerText = "quantity: ";
  
    quantityInput = document.createElement("Input");
    quantityInput.setAttribute("type", "number");
    quantityInput.setAttribute("id", "quantity");
    quantityInput.setAttribute("value", item.number);
    quantityInput.addEventListener("change", (e) => {
      console.log(quantityInput.value, id);

      cart[id].number = Number(quantityInput.value);

      if (quantityInput.value <= 0) {
        // remove item
        delete cart[id];
      }

      console.log(cart);
      localStorage.setItem("cart", JSON.stringify(cart));
      console.log("here",Object.keys(cart).length);

      if (cart === null || Object.keys(cart).length === 0 && cart.constructor === Object) {
        window.location = '../';
      }

      cartContent.innerHTML = "";
      total = 350;
      showCart();

    })

    divItems.appendChild(quantityLabel);
    divItems.appendChild(quantityInput);
  } 

  const divPrice = document.createElement("div");

  const itemPrice = document.createElement("p");

  const formatedPrice = new Intl.NumberFormat('en-UK', { style: 'currency', currency: 'GBP' }).format((item.price * item.number) / 100);

  itemPrice.innerText = formatedPrice;

  divPrice.appendChild(itemPrice);

  div.appendChild(divItems);
  div.appendChild(divPrice);

  cartContent.appendChild(div);

};

function showAddNewAddress() {
  selectedAddress = null;

  const savedAddressSelector = document.querySelector('.savedAddressSelector');
  savedAddressSelector.style.display = "none";

  const addressHolder = document.querySelectorAll('.address');
  addressHolder.forEach(address => {
    address.style.backgroundColor = "rgb(248, 248, 248)";
  });

  street_name.disabled = !street_name.disabled;
  city.disabled = !city.disabled;
  post_code.disabled = !post_code.disabled;

  console.log(addNewAddress.style.display);

  if (addNewAddress.style.display === "none" || addNewAddress.style.display === "") {
    addNewAddress.style.display = "block";
    addNewAddressLink.innerText = "Select a saved address";
    // selectedPaymentMethod = null;
  } else {
    addNewAddress.style.display = "none";
    savedAddressSelector.style.display = "flex";
    addNewAddressLink.innerText = "Add a new address";
  }
};

function showSavedAddresses(addresses) {
  addresses.forEach(address => {
    console.log(address);

    const div = document.createElement("div");
    div.setAttribute("class", "addressHolder");

    const street = document.createElement("p");
    street.innerText = address.street;
    const city = document.createElement("p");
    city.innerText = address.city;
    const postCode = document.createElement("p");
    postCode.innerText = address.post_code.replace(/^(.*)(\d)/, "$1 $2");

    const clickableAddress = document.createElement("a");
    clickableAddress.setAttribute("href", "javascript:;");
    clickableAddress.setAttribute("class", "address");

    clickableAddress.addEventListener("click", (e) => {
      const addressHolder = document.querySelectorAll('.address');
      addressHolder.forEach(address => {
        address.style.backgroundColor = "rgb(248, 248, 248)";
      });
      console.log(address.address_id);
      selectedAddress = address.address_id;

      clickableAddress.style.backgroundColor = "rgba(66, 176, 255, 0.3)";

    })

    div.appendChild(street);
    div.appendChild(city);
    div.appendChild(postCode);

    clickableAddress.appendChild(div);

    savedAddressSelector.appendChild(clickableAddress);
  });
};

addphoneNumberForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (phoneNumberInput.value !== '') {
    console.log(phoneNumberInput.value);

    fetch(`${API_URL}/user/generateSMScode`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'authorization': `bearer ${token}`,
      },
      body: JSON.stringify({
        "phoneNumber": phoneNumberInput.value,
      })
    })
    .then(response => {
      console.log(response);
      if (response.ok) {
        verfiyphoneNumberForm.style.display = 'block';
        addphoneNumberForm.style.display = "none";
      } else {
        return response.json();
      }
    })
    .then((data) => {console.log(data);})
    .catch((error) => { console.error('Error:', error) });
  }
});

verfiyphoneNumberForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (verificationCodeInput.value !== '') {
    console.log(verificationCodeInput.value);

    fetch(`${API_URL}/user/updatePhoneNumber`, {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
        'authorization': `bearer ${token}`,
      },
      body: JSON.stringify({
        "SMScode": verificationCodeInput.value,
      })
    })
    .then(response => {
      console.log(response);
      if (response.ok) {
        verfiyphoneNumberForm.style.display = 'none';
        deliveryForm.style.display = 'block';
      }
    })
    .catch((error) => { console.error('Error:', error) });
  }
})

fetch(`${API_URL}/user/phoneNumber`, {
  headers: {
    'authorization': `bearer ${token}`,
  },
})
.then(response => response.json())
.then(data => {
  console.log(data);
  const phoneNumberInput = document.querySelector('#phone');
  // check to see if phone number is added but not verfied
  if (data.phone_verified === 0 && data.phone_number !== null) {
    verfiyphoneNumberForm.style.display = 'block';
    addphoneNumberForm.style.display = 'none';
  }
  // check to see if phone number is added and verfied 
  if (data.phone_verified === 1 && data.phone_number !== null) {
    verfiyphoneNumberForm.style.display = 'none';
    addphoneNumberForm.style.display = 'none';
    deliveryForm.style.display = 'block';
  }
})
.catch((error) => {
  console.error('Error:', error);
});

fetch(`${API_URL}/user/addresses`, {
  headers: {
    'authorization': `bearer ${token}`,
  },
})
.then(response => response.json())
.then(data => {
  console.log(data);
  showSavedAddresses(data);
})
.catch((error) => {
  console.error('Error:', error);
});

deliveryForm.addEventListener("submit", (e) => {
  errorMessage.style.display = 'none';
  e.preventDefault();

  const orderData = {
    products: []
  };

  for (const [key, value] of Object.entries(cart)) {
    console.log(`${key}: ${value.name} ${value.number} £ ${value.price / 100}`);
    orderData.products.push([key, value.number]);
  }


  const data = new FormData(deliveryForm);
  for (const [name,value] of data) {
    console.log(name,value);
    orderData[name] = value;
  };

  if (selectedAddress !== null) {
    orderData["address"] = selectedAddress;
  }

  console.log(orderData);

  // convert delivery time into epoch time
  const deliverTime = new Date(orderData.delivery_time)
  deliverTimeEp = deliverTime.getTime();
  console.log(deliverTimeEp);

  // convert current time into epoch time
  const curret = new Date();
  const currentTimeNumber = curret.getTime();
  console.log(currentTimeNumber);

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
      console.log(data);
      if (data.order_id) {
        window.location.replace(`../payment/index.html?orderID=${data.order_id}`);
      } else {
        console.log('something went wrong');
        errorMessage.style.display = 'block';
        errorMessage.innerHTML = data.message;
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
  } else {
    console.log("Delivery time is not at least 2 hours from the current time");
  }
});