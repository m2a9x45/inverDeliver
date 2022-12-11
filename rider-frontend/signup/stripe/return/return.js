const API_URL = 'http://localhost:3001';
const backToStripeButton = document.querySelector('#backToStripeButton');

window.onload = async function() {
    // Check if the rider is has a token
    const token = localStorage.getItem('rtoken');
    if (token === null) {
        // Error no token, direct rider to login
        console.log('No token');
        return
    }

    console.log(token);

    try {
        const stripeData = await getStripeStatus(token);
        console.log(stripeData);
        // backToStripeButton.addEventListener('click', () => {
        //     window.location.replace(stripeData.url);
        // })

    } catch (error) {
        console.log(error);
    }

}

async function getStripeStatus(token) {
    try {
        const response = await fetch(`${API_URL}/shopper/signup/stripe/return`, {
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
