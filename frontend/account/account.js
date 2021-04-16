const API_URL = "http://localhost:3001";

const userDetailsNameHeading = document.querySelector('#userDetailsNameHeading');
const userJoinNum = document.querySelector('#userJoinNum');
const userJoinDate = document.querySelector('#userJoinDate');
const userName = document.querySelector('#userName');
const userEmail = document.querySelector('#userEmail');
const userPhone = document.querySelector('#userPhone');

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