const API_URL = "https://api.inverdeliver.com";

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
const selectNewAddress = document.querySelector('.selectNewAddress');
const postcodeLookupButton = document.querySelector('#postcodeLookupButton');
const addNewAddressButton = document.querySelector('#addNewAddressButton');

const ContinuePaymentButton = document.querySelector('#ContinuePaymentButton');


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

  doesCartConatinAlcohol(cart);

  for (const [key, value] of Object.entries(cart)) {
    console.log(`${key}: ${value.name} ${value.number} £ ${value.price} £${value.price * value.number}`);
    total = total + (value.price * value.number);
    displayCart(value, key);
  }

  displayCart({name: "Delivery Fee", price: 350, number:1});

  const totalFormat = new Intl.NumberFormat('en-UK', { style: 'currency', currency: 'GBP' }).format(total / 100);

  priceTotal.innerText = `Your total: ${totalFormat}`;
};

function doesCartConatinAlcohol(cart) {
  let orderHasAlcohol = false;

  for (const [productID, item] of Object.entries(cart)) {
    if (item.category === 'alcohol') {
      orderHasAlcohol = true;
    }
  }

  if (orderHasAlcohol === true) {
    document.querySelector('#alcoholOrderInfo').style.display = 'block';
  } else {
    document.querySelector('#alcoholOrderInfo').style.display = 'none';
  }

}

function displayCart(item, id) {
  const div = document.createElement("div");
  div.setAttribute("class", "cartItem");

  const divPicAndItems = document.createElement('div');
  divPicAndItems.setAttribute('class', 'itemPictureDiv');

  const divItems = document.createElement("div");
  divItems.setAttribute('class', 'divItems');

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
    quantityInput.setAttribute("inputmode", "numeric");
    quantityInput.setAttribute("pattern", "[0-9]*");
    quantityInput.setAttribute("id", "quantity");
    quantityInput.setAttribute("value", item.number);
    quantityInput.setAttribute("max", 20);
    quantityInput.setAttribute("min", 0);
    quantityInput.addEventListener("change", (e) => {
      console.log(quantityInput.value, id);

      cart[id].number = Number(quantityInput.value);

      if (quantityInput.value <= 0) {
        delete cart[id];
      }

      if (quantityInput.value > 20) {
        cart[id].number = 20;
        quantityInput.value = 20;
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

    let itemPictureDiv = document.createElement('div');

    const itemPicture = document.createElement('img')
    itemPicture.setAttribute("src", `${API_URL}/productImage/${item.img}`);
    itemPicture.setAttribute("loading", "lazy");
    itemPicture.setAttribute("width", "75px");
    itemPicture.setAttribute("height", "75px");

    itemPictureDiv.appendChild(itemPicture);

    divItems.appendChild(quantityLabel);
    divItems.appendChild(quantityInput);

    divPicAndItems.appendChild(itemPictureDiv);
    divPicAndItems.appendChild(divItems);
  } 

  const divPrice = document.createElement("div");

  const itemPrice = document.createElement("p");

  const formatedPrice = new Intl.NumberFormat('en-UK', { style: 'currency', currency: 'GBP' }).format((item.price * item.number) / 100);

  itemPrice.innerText = formatedPrice;

  divPrice.appendChild(itemPrice);

  if (item.name != "Delivery Fee") {
    div.appendChild(divPicAndItems);
  } else {
    div.appendChild(divItems);
  }


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

  post_code.disabled = !post_code.disabled;

  // console.log(addNewAddress.style.display);
  // console.log(selectNewAddress.style.display);

  if (addNewAddress.style.display === "none" && selectNewAddress.style.display === "block" || addNewAddress.style.display === "" && selectNewAddress.style.display === "block") {
    addNewAddress.style.display = "none";
    selectNewAddress.style.display = 'none';
    savedAddressSelector.style.display = "flex";
    addNewAddressLink.innerText = "Add a new address";
  } else if (addNewAddress.style.display === "none" || addNewAddress.style.display === "") {
    addNewAddress.style.display = "block";
    addNewAddressLink.innerText = "Select a saved address";
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
  const SMSerrorMessage = document.querySelector('#SMSerrorMessage');
  if (verificationCodeInput.value !== '') {

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
      } else {
        SMSerrorMessage.innerHTML = "Sorry we couldn't verfiy your phone number";
        SMSerrorMessage.style.color = '#eb3434';
        setTimeout(() => SMSerrorMessage.style.color = 'black', 2000);
      }
    })
    .catch((error) => { console.error('Error:', error) });
  }
})

function resendSMS() {
  fetch(`${API_URL}/user/resendSMS`, {
    method: 'PATCH',
    headers: {
      "Content-Type": "application/json",
      'authorization': `bearer ${token}`,
    }
  })
  .then(response => {
    const SMSmessage = document.querySelector('#SMSmessage');
    SMSmessage.innerHTML = '';
    if (response.status === 204) {
      SMSmessage.innerHTML = "We've gone ahead and sent out a new SMS message with your verfication code.";
      SMSmessage.style.color = '#4bd66b';
      setTimeout(() => SMSmessage.style.color = 'black', 2000);
    } else {
      SMSmessage.innerHTML = "Something went wrong when we tried to send out your verfication code. Please try again and if this continues get touch."
      SMSmessage.style.color = '#eb3434';
      setTimeout(() => SMSmessage.style.color = 'black', 2000);
    }
  })
  .catch((error) => {
    console.error('Error:', error);
    SMSmessage.innerHTML = error.message;
    SMSmessage.style.color = '#eb3434';
    setTimeout(() => SMSmessage.style.color = 'black', 2000);
  });
}

postcodeLookupButton.addEventListener('click', (e) => {
  e.preventDefault();

  errorMessage.style.display = 'none';
  errorMessage.innerHTML = '';

  const data = {
    postCode: post_code.value
  }

  fetch(`${API_URL}/user/postcodeLookup`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      'authorization': `bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    if (data.withInOpArea === false || data.lookupSuccess === false) {
      errorMessage.style.display = 'block';
      errorMessage.innerHTML = data.message;
      return;
    }

    const addressSelector = document.querySelector('.addressSelector');
    data.forEach(address => {
      console.log(address);
      const option = document.createElement('option');
      option.setAttribute('value', JSON.stringify(address));
      option.innerHTML = address.summaryline;
      addressSelector.appendChild(option)
    });

    addNewAddress.style.display = 'none';
    selectNewAddress.style.display = 'block';
  })
  .catch((error) => {
    console.error('Error:', error);
  });
});

addNewAddressButton.addEventListener('click', (e) => {
  e.preventDefault();
  const addressSelector = document.querySelector('.addressSelector');
  console.log(addressSelector.options[addressSelector.selectedIndex].value);

  const data = JSON.parse(addressSelector.options[addressSelector.selectedIndex].value)
  

  // send data to backend
  fetch(`${API_URL}/user/addAddress`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      'authorization': `bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
  .then(response => {
    if (response.status === 201) {
      selectNewAddress.style.display = 'none';
      savedAddressSelector.style.display = 'flex';
      getAddresses();
      return;
    }
  })
  .then(data => {
    console.log(data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
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

getAddresses();

function getAddresses() {
  fetch(`${API_URL}/user/addresses`, {
    headers: {
      'authorization': `bearer ${token}`,
    },
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    if (data.length <= 0 ) {
      showAddNewAddress();
    } else {
      showSavedAddresses(data);
    }
    
  })
  .catch((error) => {
    console.error('Error:', error);
  });
  
}

ContinuePaymentButton.addEventListener("click", (e) => {
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
    orderData["address_id"] = selectedAddress;
  }

  console.log(orderData);

  // convert delivery time into epoch time
  const deliverTimeWeekendCheck = new Date(orderData.delivery_time)

  // 6 = Saturday, 0 = Sunday
  if (deliverTimeWeekendCheck.getDay() === 6 || deliverTimeWeekendCheck.getDay() === 0) {
    console.log("Can't deliver as it's a weekend");
    errorMessage.style.display = 'block';
    errorMessage.innerHTML = "sorry we don't offer deliver on weekends";
    return;
  }

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

