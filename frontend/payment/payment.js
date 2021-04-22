const API_URL = "http://localhost:3001";
const stripe = Stripe("pk_test_51H7AsMK7XxBFOf2KD3wGhUSnQRncvlSgpaez5NPRCilzrFxxJPsKgUNU0li9EHwtSigGZV1Y1Y6gtYu7kmbjs9KC00LtASdb7Q");
const cartContent = document.querySelector(".cartContent");
const url_string = window.location.href;
const url = new URL(url_string);
const orderID = url.searchParams.get("orderID");
const token = localStorage.getItem('token');

let clientSecret = "";

// check user is signed in
if (!token) {
  window.location.replace("../signin");
}

document.querySelector("button").disabled = true;

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
    if (data.status === 0) {
      getOrderContent();
      displayDeliveryInfo(data);
      getOrCreatePaymentIntent();
      
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
  addressPostCode.innerText = addressInfo.post_code;

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

const elements = stripe.elements();

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
// Stripe injects an iframe into the DOM
card.mount("#card-element");

card.on("change", function (event) {
  // Disable the Pay button if there are no card details in the Element
  document.querySelector("button").disabled = event.empty;
  document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
});

const form = document.getElementById("payment-form");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  payWithCard(stripe, card, clientSecret);
});

// Calls stripe.confirmCardPayment
// If the card requires authentication Stripe shows a pop-up modal to
// prompt the user to enter authentication details without leaving your page.
const payWithCard = (stripe, card, clientSecret) => {
  loading(true);

  stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: card
        // pass in payment_method to pay with an existing card 
        // https://stripe.com/docs/js/payment_intents/confirm_card_payment
      }
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