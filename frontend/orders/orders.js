const API_URL = "http://localhost:3000";

const token = localStorage.getItem('token');

if (!token) {
    window.location.replace("../signin");
}

fetch(`${API_URL}/order/all`, {
        headers: {
            'authorization': `bearer ${token}`,
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);

    });