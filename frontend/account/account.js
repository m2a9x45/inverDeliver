const API_URL = "http://localhost:3001";

const userDetailsNameHeading = document.querySelector('#userDetailsNameHeading');
const userJoinNum = document.querySelector('#userJoinNum');
const userJoinDate = document.querySelector('#userJoinDate');
const userName = document.querySelector('#userName');
const userEmail = document.querySelector('#userEmail');
const userPhone = document.querySelector('#userPhone');

const cardDetails = document.querySelector('.cardDetails');
const submitButton = document.querySelector('#submitButton');

const message = document.querySelector('#messageText');

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

  switch (customerInfo.phone_number != null) {
    case true:
      userPhone.innerText = customerInfo.phone_number;
      break;
    
    default:
      // create a tag to add phone number
      const addPhoneNumber = document.createElement("a");
      addPhoneNumber.innerText = "Add Number"
      addPhoneNumber.setAttribute("href", "javascript:;");
      addPhoneNumber.setAttribute("onClick", "showUpdatePhoneNumber()");

      userPhone.appendChild(addPhoneNumber);
    
      break;
  }
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

submitButton.addEventListener("click", () => {
  const newPhoneNumber = document.querySelector('#newPhoneNumber');
  const phoneNumber = newPhoneNumber.value;

  let re = /^(?:(?:\(?(?:0(?:0|11)\)?[\s-]?\(?|\+)44\)?[\s-]?(?:\(?0\)?[\s-]?)?)|(?:\(?0))(?:(?:\d{5}\)?[\s-]?\d{4,5})|(?:\d{4}\)?[\s-]?(?:\d{5}|\d{3}[\s-]?\d{3}))|(?:\d{3}\)?[\s-]?\d{3}[\s-]?\d{3,4})|(?:\d{2}\)?[\s-]?\d{4}[\s-]?\d{4}))(?:[\s-]?(?:x|ext\.?|\#)\d{3,4})?$/;

  console.log(re.test(phoneNumber));

  if (re.test(phoneNumber) === false) {
    modal.style.display = "none";
    showMessage("❌ Please enter a vaild UK number, if you are please contact customer support");
    return;
  }

  fetch(`${API_URL}/user/updatePhoneNumber`, {
    method: "PATCH",
    headers: {
      'Content-Type': 'application/json',
      'authorization': `bearer ${token}`,
    },
    body: JSON.stringify({
      "phoneNumber": phoneNumber,
    })
  })
  .then(response => {
    modal.style.display = "none";
    message.style.display = "block";
    if (response.ok) {
      showMessage("Phone Number Updated 📞");
    } else {
      showMessage("❌ Sorry we couldn't update your phone number if this continues, please let us know");
    }

    

  })
  .catch((error) => {
    console.error('Error:', error);
  });

});

// Get the modal
var modal = document.getElementById("myModal");

// When the user clicks on the button, open the modal

function showUpdatePhoneNumber() {
  modal.style.display = "block";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

function showMessage(text) {
  message.style.display = "block";
  message.innerText = text;
  setTimeout(() => { message.style.display = "none"; }, 3000);
}