const API_URL = "https://api.inverdeliver.com";
const errorMessage = document.querySelector('#errorMessage');
const token = localStorage.getItem('token');

const emailInput = document.querySelector('#email');
const nameInput = document.querySelector('#name');
const passwordInput = document.querySelector('#password');
const continueButton = document.querySelector('#continueButton');
const createAccountButton = document.querySelector('#createAccountButton');
const loginButton = document.querySelector('#loginButton');

const urlString = window.location.href;
const url = new URL(urlString);
const loginToken = url.searchParams.get("token");

if (loginToken) {
    localStorage.setItem("token", loginToken);
    window.location = "../";
}

if (token) {
    window.location.replace("../");
}

emailInput.addEventListener('change', () => {
    nameInput.style.display = 'none';
    passwordInput.style.display = 'none';
    createAccountButton.style.display = 'none';
    loginButton.style.display = 'none';
    continueButton.style.display = 'block';
    errorMessage.style.display = 'none';
})

continueButton.addEventListener('click', (e) => {
    console.log(emailInput.value);
    // check to see if email is linked to an account
    fetch(`${API_URL}/user/hasAccount/${emailInput.value}`)
    .then(response => response.json())
    .then((data) => {
        console.log(data);
        // new user
        if (data.newAccount === true) {
            
            nameInput.style.display = 'block';
            passwordInput.style.display = 'block';
            createAccountButton.style.display = 'block';
            continueButton.style.display = 'none';
        } 

        // email password login
        if (data.newAccount === false && data.isSocial === false) {
            passwordInput.style.display = 'block';
            continueButton.style.display = 'none';
            loginButton.style.display = 'block';
        }
        // social login
        if (data.newAccount === false && data.isSocial === true) {
            // Tell user to use social login
            errorMessage.innerHTML = 'It looks like your email is linked to a social login';
            errorMessage.style.display = 'block';
        }
    })
});

createAccountButton.addEventListener('click', (e) => {
    const data = {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
    }

    fetch(`${API_URL}/user/createAccount`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then((data) => {
        console.log(data);
        if (data.token) {
            localStorage.setItem('token', data.token);
            window.location = './';
        }
    })
    .catch((error) => console.error(error))

})

loginButton.addEventListener('click', (e) => {
    const data = {
        email: emailInput.value,
        password: passwordInput.value,
    }
    console.log(data);

    fetch(`${API_URL}/user/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then((data) => {
        console.log(data);
        if (data.token) {
            localStorage.setItem('token', data.token);
            window.location = './';
        }
        if (data.message) {
            errorMessage.innerHTML = data.message;
            errorMessage.style.display = 'block';
        }
    })
    .catch((error) => console.error(error))

})

function statusChangeCallback(res) {
    console.log(res);

    if (res.status === "connected") {
        const data = {
            accessToken: res.authResponse.accessToken,
            userID: res.authResponse.userID
        }

        console.log("HERE", data);

        // fetch(`${API_URL}/user/fbSignIn`, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify(data)
        // })
        // .then(response => response.json())
        // .then(data => {
        //     console.log(data);
        //     if (data.token) {
        //         localStorage.setItem('token', data.token);
        //         window.location.replace('../');
        //     }
        // })
        // .catch((error) => {
        //     console.error('Error:', error);
        //     errorMessage.innerText = "Something when wrong, let us know if it continues";
        // });  
    }
}

window.fbAsyncInit = function () {
    FB.init({
        appId: '521249838906358',
        cookie: true,
        xfbml: true,
        version: 'v10.0'
    });

    FB.AppEvents.logPageView();

    checkLoginState();
};

function checkLoginState() {         
    FB.getLoginStatus(function(response) {   
      statusChangeCallback(response);
    });
  }

(function (d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) {
        return;
    }
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));