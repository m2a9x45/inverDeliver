const API_URL = "https://api.inverdeliver.com";
const errorMessage = document.querySelector('#errorMessage');
const token = localStorage.getItem('token');

const loginForm = document.querySelector('#loginForm');

const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');
const loginButton = document.querySelector('#loginButton');

const loader = document.querySelector('.loader');

const urlString = window.location.href;
const url = new URL(urlString);
const loginToken = url.searchParams.get("token");
const socialLoginError = url.searchParams.get("error");

if (loginToken) {
    localStorage.setItem("token", loginToken);
    window.location = "../";
}

if (token) {
    window.location.replace("../");
}

if (socialLoginError) {
    if (socialLoginError === 'email_in_use') {
        showErrorMessage("Sorry your email address is already in use");
    } else {
        showErrorMessage("Sorry something went wrong, contact us if this continues");
    }
}

async function login(loginInfo) {
    try {
        const response = await fetch(`${API_URL}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginInfo)
        });

        if (!response.ok) {
            loader.style.display = 'none';
            createAccountButton.style.display = 'block';
            if (response.status = 400) {
                showErrorMessage("Some of the information you've entered doesn't look to be right");
            } else {
                showErrorMessage("Something when wrong, let us know if it continues");
            } 
        }

        const data = await response.json();
        return data;
    } catch (error) {
        showErrorMessage("Something when wrong, let us know if it continues");
        console.error(error);
    }
}


loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    resetErrorMessage();
    loginButton.style.display = 'none';
    loader.style.display = 'block';

    const loginInfo = {
        email: emailInput.value,
        password: passwordInput.value,
    }

    const loginAccount = await login(loginInfo);

    loader.style.display = 'none';
    loginButton.style.display = 'block';

    console.log(loginAccount);

    if (loginAccount.message) {
        showErrorMessage(loginAccount.message);
    }  else if (loginAccount.accountFound === false) {
        showErrorMessage('Sorry we couldn\'t find an account with that email address');
    } else if (loginAccount.token) {
        localStorage.setItem('token', loginAccount.token);
        window.location = './';
    }
});

function statusChangeCallback(res) {
    console.log(res);

    if (res.status === "connected") {
        const data = {
            accessToken: res.authResponse.accessToken,
            userID: res.authResponse.userID
        }

        console.log("HERE", data);

        fetch(`${API_URL}/user/fbSignIn`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.error === true) {
                if (data.errorMessage === 'email_in_use') {
                    showErrorMessage("Sorry your email address is already in use");
                } else {
                    showErrorMessage("Something when wrong, let us know if it continues");
                }                
            }

            if (data.token) {
                localStorage.setItem('token', data.token);
                window.location.replace('../');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            errorMessage.innerText = "Something when wrong, let us know if it continues";
        });  
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

function showErrorMessage(text) {
    errorMessage.style.display = 'block';
    errorMessage.innerText = text;
}

function resetErrorMessage() {
    errorMessage.style.display = 'none';
    errorMessage.innerText = '';
}