const API_URL = "http://localhost:3000";
var stripe = Stripe("pk_test_51H7AsMK7XxBFOf2KD3wGhUSnQRncvlSgpaez5NPRCilzrFxxJPsKgUNU0li9EHwtSigGZV1Y1Y6gtYu7kmbjs9KC00LtASdb7Q");

var url_string = window.location.href;
var url = new URL(url_string);
var orderID = url.searchParams.get("orderID");
console.log(orderID);
let cart = JSON.parse(localStorage.getItem("cart"));
const cartContent = document.querySelector(".cartContent");

let total =  0;

const token = localStorage.getItem('token');

if (!token) {
  window.location.replace("../signin");
}

document.querySelector("button").disabled = true;

let clientSecret = "";

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
  itemName.innerText = `${item.name} (x${item.number})`;

  // const quantityLabel = document.createElement("label");
  // quantityLabel.setAttribute("for", "quantity");
  // quantityLabel.innerText = "quantity: ";

  // const quantityInput = document.createElement("Input");
  // quantityInput.setAttribute("type", "number");
  // quantityInput.setAttribute("id", "quantity");
  // quantityInput.setAttribute("value", item.number);


  const divPrice = document.createElement("div");

  const itemPrice = document.createElement("p");

  // console.log(new Intl.NumberFormat('en-UK', { style: 'currency', currency: 'GBP' }).format(number));

  const formatedPrice = new Intl.NumberFormat('en-UK', { style: 'currency', currency: 'GBP' }).format((item.price * item.number) / 100);

  itemPrice.innerText = formatedPrice;

  divItems.appendChild(itemName);
  // divItems.appendChild(quantityLabel);
  // divItems.appendChild(quantityInput);

  divPrice.appendChild(itemPrice);

  div.appendChild(divItems);
  div.appendChild(divPrice);

  cartContent.appendChild(div);

}





// check orderID is in a payable state.

fetch(`${API_URL}/order/status?orderID=${orderID}`,{
  headers: {
    'authorization': `bearer ${token}`,
  }
})
  .then(response => response.json())
  .then(data => {
    console.log(data);
    if (data.status == 0) {
      displayDeliveryInfo(data);
    } else {
      console.log("Order ID invalid");
      // order isn't in correct status, diaply error and redirect
    }
  });

function displayDeliveryInfo(addressInfo) {
  const addressLine = document.querySelector('#addressLine');
  const addressCity = document.querySelector('#addressCity');
  const addressPostCode = document.querySelector('#addressPostCode');
  const deliveryTime = document.querySelector('#deliveryTime');
  const ContactNumber = document.querySelector('#ContactNumber');

  addressLine.innerText = addressInfo.street_name;
  addressCity.innerText = addressInfo.city;
  addressPostCode.innerText = addressInfo.post_code;

  var deliveryDate  = new Date(addressInfo.delivery_time);
  var options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric'  };
  const displaydate = deliveryDate.toLocaleDateString("en-UK", options)


  deliveryTime.innerText = displaydate;
  ContactNumber.innerText = addressInfo.phone;
} 


if (localStorage.getItem("stripeToken")) {
  console.log(localStorage.getItem("stripeToken"));
  clientSecret = localStorage.getItem("stripeToken");
} else {
  fetch(`${API_URL}/payment/create-payment-intent`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
	"orderID" : orderID
})
})
  .then(function(result) {
    return result.json();
  })
  .then(function(data) {
    console.log(data);
    localStorage.setItem("stripeToken", data.clientSecret);
    clientSecret = data.clientSecret;
  });
}

var elements = stripe.elements();
var style = {
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
var card = elements.create("card", { style: style });
// Stripe injects an iframe into the DOM
card.mount("#card-element");
card.on("change", function (event) {
  // Disable the Pay button if there are no card details in the Element
  document.querySelector("button").disabled = event.empty;
  document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
});
var form = document.getElementById("payment-form");
form.addEventListener("submit", function(event) {
  event.preventDefault();
  // Complete payment when the submit button is clicked
  payWithCard(stripe, card, clientSecret);
});
// Calls stripe.confirmCardPayment
// If the card requires authentication Stripe shows a pop-up modal to
// prompt the user to enter authentication details without leaving your page.
var payWithCard = function(stripe, card, clientSecret) {
  loading(true);
  stripe
    .confirmCardPayment(clientSecret, {
      payment_method: {
        card: card
      }
    })
    .then(function(result) {
      if (result.error) {
        // Show error to your customer
        showError(result.error.message);
      } else {
        // The payment succeeded!
        localStorage.removeItem("token");
        localStorage.removeItem("cart");
        orderComplete(result.paymentIntent.id);
      }
    });
};
/* ------- UI helpers ------- */
// Shows a success message when the payment is complete
var orderComplete = function(paymentIntentId) {
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
var showError = function(errorMsgText) {
  loading(false);
  var errorMsg = document.querySelector("#card-error");
  errorMsg.textContent = errorMsgText;
  setTimeout(function() {
    errorMsg.textContent = "";
  }, 4000);
};
// Show a spinner on payment submission
var loading = function(isLoading) {
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