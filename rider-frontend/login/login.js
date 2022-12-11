const API_URL = 'http://localhost:3001';

const loginForm = document.querySelector('#loginForm');

const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const requestData = {
        email: emailInput.value,
        password: passwordInput.value
    }

    console.log(requestData);

    const rider = await loginRider(requestData)
    
    console.log(rider);
    
    if (rider.token) {
        localStorage.setItem('rtoken', rider.token);
        return window.location.replace('../app')
    }
    
    console.log('Creating rider account failed');

});


async function loginRider(requestData) {
    try {
        const response = await fetch(`${API_URL}/shopper/login`, {
            method: 'POST',
            body: JSON.stringify(requestData),
            headers: {
                'Content-Type': 'application/json'
            }
        });
    
        const rider = await response.json();
        return rider;
    } catch (error) {
        console.error(error);
    }
}