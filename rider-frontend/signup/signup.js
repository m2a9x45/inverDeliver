const API_URL = 'http://localhost:3001';

const signupForm = document.querySelector('#signupForm');

const firstNameInput = document.querySelector('#firstName');
const lastameInput = document.querySelector('#lastName');
const emailInput = document.querySelector('#email');
const phoneInput = document.querySelector('#phone');
const passwordInput = document.querySelector('#password');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const requestData = {
        first_name: firstNameInput.value,
        last_name: lastameInput.value,
        email: emailInput.value,
        phone_number: phoneInput.value,
        password: passwordInput.value
    }

    console.log(requestData);

    const rider = await createRider(requestData)
    
    console.log(rider);
    
    if (rider.token) {
        localStorage.setItem('rtoken', rider.token);
        return window.location.replace('../signup/stripe/intro')
    }
    
    console.log('Creating rider account failed');

});


async function createRider(requestData) {
    try {
        const response = await fetch(`${API_URL}/shopper/create`, {
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