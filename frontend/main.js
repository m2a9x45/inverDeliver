const API_URL = "http://localhost:3001"

const navBarToggle = document.querySelector('.navbarToggle');
const navtoggle = document.querySelector('.mainNav');

const postCodeSearchForm = document.querySelector('#postCodeSearchForm');
const storeHolder = document.querySelector('#storeHolder');
const storeHolderForSavedAddresses = document.querySelector('#storeHolderForSavedAddresses');

// Navbar toggle code
const x = window.matchMedia("(max-width: 680px)");
x.addEventListener("change", () => x.matches ? navtoggle.style.display = "none" : navtoggle.style.display = "flex");
navBarToggle.addEventListener("click", () => (navtoggle.style.display === "none" || navtoggle.style.display === "") ? navtoggle.style.display = "flex" : navtoggle.style.display = "none");

// Checking to see if the jwt is vaild client side, we could just check if it exist in local storage to update the UI and the deal with a 401 when it happens.
if (localStorage.getItem("token")) {
  const jwtExp = JSON.parse(atob(localStorage.getItem("token").split('.')[1]));
  if (Date.now() < jwtExp.exp * 1000) {
    const logout = document.querySelector('#logout');
    logout.innerText = "Logout";
    logout.setAttribute("href", "./logout");
  } else {
    localStorage.removeItem('token');
  }
}

async function searchForStores(postCode){
  storeHolder.innerHTML = '';
  const stores = await getStoresByPostCode(postCode);

  stores.forEach( async (store) => {
    const storeInfo = await getStoreInfo(store.store_id);
    if (storeInfo.length > 0) {
      const htmlToDisplay = showStore(store.store_id, storeInfo[0]);
      storeHolder.appendChild(htmlToDisplay);
      storeHolder.style.display = 'flex';
    }
  });
}

async function storesNearSavedCustomerAddress(token) {
  const response = await fetch(`${API_URL}/store/near/saved-customer-address`, { headers: {
    'authorization': `bearer ${token}`,
  }})
  const json = await response.json();
  console.log(json);
  return json;
}

document.addEventListener('DOMContentLoaded', async () => {  
  const urlParams = new URLSearchParams(window.location.search);
  const postCodeFromURL = urlParams.get('search');
  console.log(postCodeFromURL);

  if (postCodeFromURL) {
    searchForStores(postCodeFromURL);
  }

  if (localStorage.getItem("token")) {
    const foundStores = await storesNearSavedCustomerAddress(localStorage.getItem("token"));
    if (foundStores.post_code) {

      const titleForSavedAddresses = document.querySelector('#titleForSavedAddresses');
      titleForSavedAddresses.innerHTML = `Shops near your postcode of ${foundStores.post_code}`;
      titleForSavedAddresses.style.display = 'block';
      
      foundStores.stores.forEach( async (store) => {
        const storeInfo = await getStoreInfo(store.store_id);
        if (storeInfo.length > 0) {
          const htmlToDisplay = showStore(store.store_id, storeInfo[0]);
          storeHolderForSavedAddresses.appendChild(htmlToDisplay);
        }
      });
    }
  }
});

async function getStoresByPostCode(postcode) {
    const response = await fetch(`${API_URL}/store/find/${postcode}`)
    const json = await response.json();
    console.log(json);
    return json;
}

async function getStoreInfo(storeID) {
  try {
    const response = await fetch(`${API_URL}/store/${storeID}`)
    const json = await response.json();
    return json;
  } catch (error) {
   console.error(error); 
  }
}

function showStore(storeID, storeInfo) {
  console.log(storeID, storeInfo);
  const storeDiv = document.createElement('div');
  storeDiv.setAttribute('class', 'store');

  const img = document.createElement('img');
  img.setAttribute('src', `${API_URL}/storeLogo/${storeInfo.logo}`);
  img.setAttribute('alt', `${storeInfo.name} logo`);

  const storeBrand = document.createElement('h2');
  storeBrand.innerHTML = storeInfo.name;

  const storeName = document.createElement('h4');
  storeName.innerHTML = storeInfo.store_name;

  const storeLink = document.createElement('a');
  storeLink.setAttribute('class', 'storeSelectButton');
  storeLink.setAttribute('href', 'javascript:;');
  storeLink.addEventListener('click', () => selectStore(storeID));
  storeLink.innerHTML = 'Shop';

  storeDiv.appendChild(img);
  storeDiv.appendChild(storeBrand);
  storeDiv.appendChild(storeName);
  storeDiv.appendChild(storeLink);

  return storeDiv;
};

function selectStore(storeID) {
  console.log(storeID);
  localStorage.setItem('storeID', storeID);
  window.location.href = `./store/?storeID=${storeID}`;

}

postCodeSearchForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const postCode = document.querySelector('#postCodeSearch').value;

  var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?search=${postCode}`;
  window.history.pushState({path:newurl},'',newurl);

  console.log(postCode); 
  searchForStores(postCode);
});