const API_URL = "http://localhost:3000";

const url_string = window.location.href;
const url = new URL(url_string);
const orderID = url.searchParams.get("orderID");

const token = localStorage.getItem('token');

if (!token) {
    window.location.replace("../signin");
}

fetch(`${API_URL}/order/status?orderID=${orderID}`, {
    headers: {
      'authorization': `bearer ${token}`,
    }
  })
  .then(response => {
    if (response.status = 404) {
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
