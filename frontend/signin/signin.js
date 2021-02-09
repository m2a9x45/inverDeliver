const API_URL = "http://localhost:3000";

function onSignIn(googleUser) {
    var id_token = googleUser.getAuthResponse().id_token;
    console.log(id_token);

    fetch(`${API_URL}/user/googleSignIn`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({token: id_token}),
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
    });
}
