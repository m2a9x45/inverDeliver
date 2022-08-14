const API_URL = "http://localhost:3001"

// Checking to see if the jwt is vaild client side, we could just check if it exist in local storage to update the UI and the deal with a 401 when it happens.
if (localStorage.getItem("token")) {
  const jwtExp = JSON.parse(atob(localStorage.getItem("token").split('.')[1]));
  if (Date.now() < jwtExp.exp * 1000) {
    // const logout = document.querySelector('#logout');
    // logout.innerText = "Logout";
    // logout.setAttribute("href", "./logout");
  } else {
    localStorage.removeItem('token');
  }
}

async function getProduct(productID) {
    try {
        const response = await fetch(`${API_URL}/product/productById?id=${productID}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

document.addEventListener('DOMContentLoaded', async () => { 
    if (localStorage.getItem("cart")) cart = JSON.parse(localStorage.getItem("cart"));

    const urlParams = new URLSearchParams(window.location.search);
    productID = urlParams.get('productID');
    // localStorage.setItem('productID', storeID);
    console.log(productID);

    // Get product data product/productById
    const productData = await getProduct(productID);
    console.log(productData.data);

    // Dispay product


})