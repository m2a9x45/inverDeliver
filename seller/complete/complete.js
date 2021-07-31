const API_URL = 'https://inverdeliver.com';

console.log(localStorage.getItem("sellerToken")); 

fetch(`${API_URL}/seller/status`, {
  "method": "GET",
  "headers": {
    "Authorization": `Bearer ${localStorage.getItem("sellerToken")}`
  }
})
.then(response => {
  console.log(response);
})
.catch(err => {
  console.error(err);
});