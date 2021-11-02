const API_URL = "https://api.inverdeliver.com";

const navBarToggle = document.querySelector('.navbarToggle');
const navtoggle = document.querySelector('.mainNav');
const userDetailsNameHeading = document.querySelector('#userDetailsNameHeading');
const userJoinNum = document.querySelector('#userJoinNum');
const userJoinDate = document.querySelector('#userJoinDate');
const userName = document.querySelector('#userName');
const userEmail = document.querySelector('#userEmail');
const userPhone = document.querySelector('#userPhone');

const cardDetails = document.querySelector('.cardDetails');
const submitButton = document.querySelector('#submitButton');

const addressDetails = document.querySelector('.addressDetails');

const message = document.querySelector('#messageText');

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



getCustomerAccount();
getCustomersAddresses();

function getCustomerAccount() {
  fetch(`${API_URL}/user/account`, {
    headers: {
      'authorization': `bearer ${token}`,
    }
  })
  .then(response => {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.replace("../signin");
    }

    return response.json();
  })
  .then(data => {
    console.log(data);
    displayUserInfo(data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

fetch(`${API_URL}/user/card`, {
    headers: {
      'authorization': `bearer ${token}`,
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    if (data.error) {
      return;
    }
    displayCards(data.data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

function getCustomersAddresses() {
  fetch(`${API_URL}/user/addresses`, {
    headers: {
      'authorization': `bearer ${token}`,
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    displayAddresses(data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

function displayUserInfo(customerInfo) {

  const customerJoinDate = new Date(customerInfo.created_at);
  const displayDate = customerJoinDate.toLocaleDateString("en-GB", {
    year: 'numeric',
    month: 'long',
  });

  userDetailsNameHeading.innerHTML = `Hey ${customerInfo.first_name} 👋`;
  userJoinNum.innerText = `InverDeliver customer #${customerInfo.id}`;
  userJoinDate.innerText = `Since ${displayDate}`;
  userName.innerText = customerInfo.last_name ? `${customerInfo.first_name} ${customerInfo.last_name}` : `${customerInfo.first_name}`; 
  userEmail.innerText = customerInfo.email;
  userPhone.innerText = customerInfo.phone_number ? customerInfo.phone_number : 'N/A';
}

function displayCards(cardData) {
  cardData.forEach(paymentMethod => {

    console.log(paymentMethod.id);
    console.log(paymentMethod.card.brand);
    console.log(paymentMethod.card.exp_month, paymentMethod.card.exp_year);
    console.log(paymentMethod.card.last4);

    const cardID = paymentMethod.id;
    const cardBrand = paymentMethod.card.brand;

    paymentMethod.card.exp_month = ( paymentMethod.card.exp_month < 10) ? `0${paymentMethod.card.exp_month}`: paymentMethod.card.exp_month;

    const cardExpiryDate = `${paymentMethod.card.exp_month}/${paymentMethod.card.exp_year}`;
    const cardLast4 = paymentMethod.card.last4;

    const cardDiv = document.createElement("div");
    cardDiv.setAttribute("class", "card");
    cardDiv.setAttribute("id", cardID);

    const cardImg = document.createElement("i");

    switch (cardBrand) {
      case "visa":
        cardImg.setAttribute("id", "visa");
        cardImg.setAttribute("class", "fa fa-cc-visa");
        break;
      case "mastercard":
        cardImg.setAttribute("id", "mastercard");
        cardImg.setAttribute("class", "fa fa-cc-mastercard");
        break;
      case "amex":
        cardImg.setAttribute("id", "amex");
        cardImg.setAttribute("class", "fa fa-cc-amex");
        break;
      default:
        cardImg.setAttribute("id", "visa");
        cardImg.setAttribute("class", "fa fa-credit-card");
        break;
    }
    

    const cardLast4Text = document.createElement("p");
    // cardLast4 is returned from stripe but we should check it doesn't contain malisious html
    cardLast4Text.innerHTML = `&bull; &bull; &bull; &bull; ${cardLast4}`;

    const cardExpiryText = document.createElement("p");
    cardExpiryText.setAttribute("class", "expDate");
    cardExpiryText.innerHTML = cardExpiryDate;

    cardDiv.appendChild(cardImg);
    cardDiv.appendChild(cardLast4Text);
    cardDiv.appendChild(cardExpiryText);

    cardDetails.appendChild(cardDiv);
  });
}

function displayAddresses(addresses) {
  addressDetails.innerHTML = "";
  addresses.forEach(address => {
    const addressDiv = document.createElement("div");
    addressDiv.setAttribute("class", "address");
    
    const street = document.createElement("p");
    street.innerText = address.street;
    const city = document.createElement("p");
    city.innerText = address.city;
    const postCode = document.createElement("p");
    postCode.innerText = address.post_code.replace(/^(.*)(\d)/, "$1 $2");

    const buttonDiv = document.createElement("div");
    buttonDiv.setAttribute("id", "buttonDiv");

    const deleteButton = document.createElement("a");
    deleteButton.setAttribute("href", "javascript:;");
    deleteButton.addEventListener("click", () => deleteAdress(address.address_id));
    deleteButton.setAttribute("id", "deleteButton");
    deleteButton.innerText = "Delete";

    addressDiv.appendChild(street);
    addressDiv.appendChild(city);
    addressDiv.appendChild(postCode);

    buttonDiv.appendChild(deleteButton);

    addressDiv.appendChild(buttonDiv);

    addressDetails.appendChild(addressDiv);
    
  });
};

function deleteAdress(addressID) {
  fetch(`${API_URL}/user/address?addressID=${addressID}`, {
    method: "DELETE",
    headers: {
      'authorization': `bearer ${token}`,
    }
  })
  .then(response => {
    if (response.ok) {
      showMessage("Address deleted");
      getCustomersAddresses();
    } else {
      showMessage("We had problems deleting your address");
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}

function showMessage(text) {
  message.style.display = "block";
  message.innerText = text;
  setTimeout(() => { message.style.display = "none"; }, 3000);
}