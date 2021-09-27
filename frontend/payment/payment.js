const API_URL = "http://localhost:3001";

const navBarToggle = document.querySelector('.navbarToggle');
const navtoggle = document.querySelector('.mainNav');

const stripe = Stripe("pk_test_51H7AsMK7XxBFOf2KD3wGhUSnQRncvlSgpaez5NPRCilzrFxxJPsKgUNU0li9EHwtSigGZV1Y1Y6gtYu7kmbjs9KC00LtASdb7Q");
const cartContent = document.querySelector(".cartContent");
const url_string = window.location.href;
const url = new URL(url_string);
const orderID = url.searchParams.get("orderID");
const token = localStorage.getItem('token');
const form = document.getElementById("payment-form");
const cardDetails = document.querySelector('.cardDetails');
const paymentButton = document.querySelector("button");
const payWithNewCardLink = document.querySelector('#payWithNewCardLink');
const cardElement = document.querySelector('#card-element');

const cvcCheckText = document.querySelector('#cvcCheckText');
const cardCvcElementHolder = document.querySelector('#cardCvcElement');

let clientSecret = "";
let selectedPaymentMethod = null;

paymentButton.disabled = true;

cardElement.style.display = "block";
cardDetails.style.display = "none";
payWithNewCardLink.style.display = "none";

// check user is signed in
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


// check that the order is in a payable state
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
    if (data.status === 'payment_required') {
      getOrderContent();
      displayDeliveryInfo(data);
      getOrCreatePaymentIntent();
      getCustomerPaymentMethods();
    } else {
      console.error("Order is not in the correct status for payment");
    }
  });

function getOrderContent() {
// get order content from DB not localstorage
fetch(`${API_URL}/order/content?orderID=${orderID}`, {
  headers: {
    'authorization': `bearer ${token}`,
  }
})
.then(response => response.json())
.then(data => {
  console.log(data);

  data.forEach(item => {
    displayCart(item);
  });
});
}

function getOrCreatePaymentIntent() {
  // get the payment intent for this order if one exists
  fetch(`${API_URL}/payment/intent?orderID=${orderID}`, {
    headers: {
      'authorization': `bearer ${token}`,
    }
  })
  .then((response) => {
    if (response.ok) {
      return response.json();
    } else if (response.status = 404) {
      createPaymentIntent();
      return null;
    } else {
      console.error(response);
    }
  })
  .then((data) => {
    if (data !== null) {
      console.log(data);
      clientSecret = data.clientSecret;
      getOrderPrice(orderID);
    } else {
      // show error
    }
  })
  .catch((error) => {
    console.error(error);
  });
}

function getOrderPrice(orderID) {
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

    displayCart({name: "Delivery Fee", price: data.fee, quantity: 1});
  });
}

function displayCart(item) {
  const div = document.createElement("div");
  div.setAttribute("class", "cartItem");

  const divItems = document.createElement("div");

  const itemName = document.createElement("p");
  itemName.innerText = (item.name === "Delivery Fee" ? `${item.name}` : `${item.name} (x${item.quantity})`);

  const divPrice = document.createElement("div");

  const itemPrice = document.createElement("p");

  const formatedPrice = new Intl.NumberFormat('en-UK', {
    style: 'currency',
    currency: 'GBP'
  }).format((item.price * item.quantity) / 100);

  itemPrice.innerText = formatedPrice;

  divItems.appendChild(itemName);

  divPrice.appendChild(itemPrice);

  div.appendChild(divItems);
  div.appendChild(divPrice);

  cartContent.appendChild(div);

}

function displayDeliveryInfo(addressInfo) {
  const addressLine = document.querySelector('#addressLine');
  const addressCity = document.querySelector('#addressCity');
  const addressPostCode = document.querySelector('#addressPostCode');
  const deliveryTime = document.querySelector('#deliveryTime');
  const ContactNumber = document.querySelector('#ContactNumber');

  addressLine.innerText = addressInfo.street;
  addressCity.innerText = addressInfo.city;
  addressPostCode.innerText = addressInfo.post_code.replace(/^(.*)(\d)/, "$1 $2");

  const deliveryDate = new Date(addressInfo.time);
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  };
  const displaydate = deliveryDate.toLocaleDateString("en-GB", options)


  deliveryTime.innerText = displaydate;
  ContactNumber.innerText = addressInfo.phone_number;
}

function createPaymentIntent() {
  fetch(`${API_URL}/payment/create-payment-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'authorization': `bearer ${token}`,
      },
      body: JSON.stringify({
        "orderID": orderID
      })
    })
    .then(function (result) {
      return result.json();
    })
    .then(function (data) {
      console.log(data);
      // localStorage.setItem("stripeToken", data.clientSecret);
      clientSecret = data.clientSecret;
      getOrderPrice(orderID);
    });
}

function getCustomerPaymentMethods() {
  fetch(`${API_URL}/user/card`, {
    headers: {
      'authorization': `bearer ${token}`,
    }
  })
  .then(response =>  response.json())
  .then(data => {
    console.log(data);
    if (data.data.length > 0) {
      displayCards(data.data);
      cardElement.style.display = "none";
      cardDetails.style.display = "block";
      payWithNewCardLink.innerText = "Pay with a new card";
      payWithNewCardLink.style.display = "block";
    } else {
      console.log("Customer has no saved cards");

    }
  });
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

    const clickableCard = document.createElement("a");
    clickableCard.setAttribute("href", "javascript:;");
    clickableCard.addEventListener("click", (e) => {
      const cards = document.querySelectorAll('.card');
      cards.forEach(card => {
        card.style.backgroundColor = "#e6e6e628";
      });
      console.log(cardID);
      selectedPaymentMethod = cardID;
      cardDiv.style.backgroundColor = "#cfcfcf";

      cvcCheckText.style.display = "block";
      cardCvcElementHolder.style.display = "block";
    })

    cardDiv.appendChild(cardImg);
    cardDiv.appendChild(cardLast4Text);
    cardDiv.appendChild(cardExpiryText);

    clickableCard.appendChild(cardDiv);

    cardDetails.appendChild(clickableCard);

  });
}

payWithNewCardLink.addEventListener("click", (e) => {

  cvcCheckText.style.display = "none";
  cardCvcElementHolder.style.display = "none";

  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.style.backgroundColor = "#e6e6e628";
  });


  if (cardElement.style.display === "none" || cardElement.style.display === "") {
    cardElement.style.display = "block";
    cardDetails.style.display = "none"
    payWithNewCardLink.innerText = "Pay with saved card";
    selectedPaymentMethod = null;
  } else {
    cardElement.style.display = "none";
    cardDetails.style.display = "block"
    payWithNewCardLink.innerText = "Pay with a new card";
  }


  // payWithNewCardLink

})

const elements = stripe.elements();

const elements2 = stripe.elements();

const style = {
  base: {
    color: "#32325d",
    fontFamily: 'Arial, sans-serif',
    fontSmoothing: "antialiased",
    fontSize: "16px",
    "::placeholder": {
      color: "#32325d"
    }
  },
  invalid: {
    fontFamily: 'Arial, sans-serif',
    color: "#fa755a",
    iconColor: "#fa755a"
  }
};

const card = elements.create("card", {
  style: style
});

const cardCvcElement = elements2.create("cardCvc", {
  style: style
});

cardCvcElement.mount('#cardCvcElement');

// Stripe injects an iframe into the DOM
card.mount("#card-element");

card.on("change", function (event) {
  // Disable the Pay button if there are no card details in the Element
  document.querySelector("button").disabled = event.empty;
  document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
});

cardCvcElement.on("change", function (event) {
  // Disable the Pay button if there are no card details in the Element
  document.querySelector("button").disabled = event.empty;
  document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (selectedPaymentMethod !== null) {
    stripe
      .confirmCardPayment(clientSecret, {
        payment_method: selectedPaymentMethod,
        payment_method_options: {
          card: {
            cvc: cardCvcElement
          }
        },
      })
      .then((result) => {
        if (result.error) {
          showError(result.error.message);
        } else {
          localStorage.removeItem("cart");
          orderComplete(result.paymentIntent.id);
        }
      });
      return;
  }
  payWithCard(stripe, card, clientSecret);
});

// Calls stripe.confirmCardPayment
// If the card requires authentication Stripe shows a pop-up modal to
// prompt the user to enter authentication details without leaving your page.
function payWithCard(stripe, card, clientSecret) {
  loading(true);

  stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card
      },
      setup_future_usage: 'off_session'
    })
    .then((result) => {
      if (result.error) {
        showError(result.error.message);
      } else {
        localStorage.removeItem("cart");
        orderComplete(result.paymentIntent.id);
      }
    });
};

/* ------- UI helpers ------- */
// Shows a success message when the payment is complete
var orderComplete = function (paymentIntentId) {
  loading(false);
  document
    .querySelector(".result-message a")
    .setAttribute(
      "href",
      "https://dashboard.stripe.com/test/payments/" + paymentIntentId
    );
  document.querySelector(".result-message").classList.remove("hidden");
  document.querySelector("button").disabled = true;

  window.location.replace(`./success/?id=${paymentIntentId}&orderID=${orderID}`);

};
// Show the customer the error from Stripe if their card fails to charge
var showError = function (errorMsgText) {
  loading(false);
  var errorMsg = document.querySelector("#card-error");
  errorMsg.textContent = errorMsgText;
  setTimeout(function () {
    errorMsg.textContent = "";
  }, 4000);
};
// Show a spinner on payment submission
var loading = function (isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("button").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("button").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
};