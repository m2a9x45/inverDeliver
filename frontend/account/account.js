const API_URL = "http://localhost:3001";

const userDetailsNameHeading = document.querySelector('#userDetailsNameHeading');
const userJoinNum = document.querySelector('#userJoinNum');
const userJoinDate = document.querySelector('#userJoinDate');
const userName = document.querySelector('#userName');
const userEmail = document.querySelector('#userEmail');
const userPhone = document.querySelector('#userPhone');

const cardDetails = document.querySelector('.cardDetails');

const token = localStorage.getItem('token');

if (!token) {
  window.location.replace("../signin");
}

fetch(`${API_URL}/user/account`, {
    headers: {
      'authorization': `bearer ${token}`,
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    displayUserInfo(data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

fetch(`${API_URL}/user/card`, {
    headers: {
      'authorization': `bearer ${token}`,
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
    displayCards(data.data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });

function displayUserInfo(customerInfo) {

  const customerJoinDate = new Date(customerInfo.created_at);
  const displayDate = customerJoinDate.toLocaleDateString("en-GB", {
    year: 'numeric',
    month: 'long',
  });

  userDetailsNameHeading.innerHTML = `Hey ${customerInfo.first_name} 👋`;
  userJoinNum.innerText = `InverDeliver customer #${customerInfo.id}`;
  userJoinDate.innerText = `Since ${displayDate}`;
  userName.innerText = `${customerInfo.first_name} ${customerInfo.last_name}`;
  userEmail.innerText = customerInfo.email;
  userPhone.innerText = customerInfo.phone_number; 
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

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}