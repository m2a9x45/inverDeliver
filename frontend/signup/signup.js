const API_URL = "https://api.inverdeliver.com";
const errorMessage = document.querySelector('#errorMessage');
const token = localStorage.getItem('token');

const createAccountForm = document.querySelector('#createAccountForm');

const emailInput = document.querySelector('#email');
const nameInput = document.querySelector('#name');
const passwordInput = document.querySelector('#password');
const createAccountButton = document.querySelector('#createAccountButton');

const loader = document.querySelector('.loader');

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

async function createAccount(createAccountInfo) {
    try {
        const response = await fetch(`${API_URL}/user/createAccount`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createAccountInfo)
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


createAccountForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    resetErrorMessage();
    createAccountButton.style.display = 'none';
    loader.style.display = 'block';


    const createAccountInfo = {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
    }

    console.log(createAccountInfo);

    const createdAccount = await createAccount(createAccountInfo);

    loader.style.display = 'none';
    createAccountButton.style.display = 'block';

    if (createdAccount.emailInUse === true) {
        showErrorMessage("Can't create account, your email address is already in use");
    } else if (createdAccount.token) {
        localStorage.setItem('token', createdAccount.token);
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