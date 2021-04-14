const API_URL = "http://localhost:3001";

const token = localStorage.getItem('token');

if (!token) {
  window.location.replace("../signin");
}

fetch(`${API_URL}/user/account`, {
    headers: {
      'Content-Type': 'application/json',
      'authorization': `bearer ${token}`,
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch((error) => {
    console.error('Error:', error);
  });