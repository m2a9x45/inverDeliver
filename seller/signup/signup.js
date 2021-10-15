const API_URL = 'https://inverdeliver.com'
const signupForm = document.querySelector('#signupForm');

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const shopName = document.querySelector('#shopName').value;
    const firstName = document.querySelector('#firstName').value;
    const lastName = document.querySelector('#lastName').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;

    const data = {
        shopName,
        firstName,
        lastName,
        email,
        password,
    }

    console.log(data);
    
    fetch(`${API_URL}/seller/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then((res) => {
        if (res.error) {
            console.error(res);
        } else {
            console.log(res);
            localStorage.setItem("sellerToken", res.data.token);
            window.location.replace(res.data.stripeURL);
        }

    })
    .catch(error => console.error(error))

})