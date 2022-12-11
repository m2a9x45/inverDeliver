const API_URL = 'http://localhost:3001';

const continueButton = document.querySelector('#continueButton');


continueButton.addEventListener('click', async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('rtoken');
    if (token === null) {
        // Error no token, direct rider to login
        console.log('No token');
        return
    }

    console.log(token);

    const stripeData = await createStripeAccount(token)
    if (stripeData.url) {
        window.location.replace(stripeData.url);
    }
    
    // log an error
});


async function createStripeAccount(token) {
    try {
        const response = await fetch(`${API_URL}/shopper/signup/stripe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    
        const stripeData = await response.json();
        return stripeData;
    } catch (error) {
        console.error(error);
    }
}