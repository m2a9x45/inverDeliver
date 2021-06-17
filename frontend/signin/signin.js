const API_URL = "http://localhost:3001";
const errorMessage = document.querySelector('#errorMessage');
const token = localStorage.getItem('token');

const emailInput = document.querySelector('#email');
const nameInput = document.querySelector('#name');
const passwordInput = document.querySelector('#password');
const loginButton = document.querySelector('#loginButton');
const createAccountButton = document.querySelector('#createAccountButton');

if (token) {
    window.location.replace("../");
}

loginButton.addEventListener('click', (e) => {
    console.log(emailInput.value);
    // check to see if email is linked to an account

    fetch(`${API_URL}/user/hasAccount/${emailInput.value}`)
    .then(response => response.json())
    .then((data) => {
        console.log(data);
        if (data.newAccount === true) {
            // new user
            nameInput.style.display = 'block';
            passwordInput.style.display = 'block';
            createAccountButton.style.display = 'block';
            loginButton.style.display = 'none';
        }
    })

});

createAccountButton.addEventListener('click', (e) => {
    const data = {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
    }
    console.log(data);

    // send post request to create user

})

function onSignIn(googleUser) {
    var id_token = googleUser.getAuthResponse().id_token;
    console.log(id_token);

    fetch(`${API_URL}/user/googleSignIn`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: id_token
            }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.token) {
                localStorage.setItem('token', data.token);
                // window.location.replace('../');
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            errorMessage.innerText = "Something when wrong, let us know if it continues";
        });
}

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
                // window.location.replace('../');
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