const API_URL = 'http://localhost:3001';

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
        const signupStatusRes = await getSignupStatus(token);
        console.log(signupStatusRes);
        handleSignupStatus(signupStatusRes.signup_status)
    } catch (error) {
        console.log(error);
    }

    try {
        const batches = await getBatches(token);
        console.log(batches);
    } catch (error) {
        console.log(error);
    }

}

async function getSignupStatus(token) {
    try {
        const response = await fetch(`${API_URL}/shopper/signup/status`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

async function getBatches(token) {
    try {
        const response = await fetch(`${API_URL}/shopper/order/batches`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

function handleSignupStatus(status) {
    switch (status) {
        case "stripe":
            return window.location.replace('../signup/stripe/intro');
        case "stripe_awaiting":
            return window.location.replace('../signup/stripe/reauth');
        case "stripe_completed":
            return
    }
}