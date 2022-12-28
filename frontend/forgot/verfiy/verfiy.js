const API_URL = "https://api.inverdeliver.com";

const resetPasswordRequestForm = document.querySelector('#updatePasswordRequestForm');
const passwordInput = document.querySelector('#passwordInput');
const updateButton = document.querySelector('#updateButton');

const errorMessage = document.querySelector('#errorMessage');
const loader = document.querySelector('.loader');

let resetToken = "";

document.addEventListener('DOMContentLoaded', (event) => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('token')) {
        resetToken = urlParams.get('token')
        console.log(resetToken);
    } else {
        window.location = '../../';
    }
});


async function sendPasswordResetRequest(dataInput) {
    try {
        const response = await fetch(`${API_URL}/user/updateForgotPassword`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataInput)
        });

        if (!response.ok) {
            loader.style.display = 'none';
            updateButton.style.display = 'block';
            if (response.status = 400) {
                showErrorMessage("Some of the information you've entered doesn't look to be right");
                return false;
            } else {
                showErrorMessage("Something when wrong, let us know if it continues");
                return false;
            } 
        }

        const data = response.json();
        return data;
    } catch (error) {
        showErrorMessage("Something when wrong, let us know if it continues");
        updateButton.style.display = 'block';
        console.error(error);
        return false;
    }
}

updatePasswordRequestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    updateButton.style.display = 'none';
    loader.style.display = 'block';

    const data = {
        token: resetToken,
        password: passwordInput.value,
    }

    const response = await sendPasswordResetRequest(data);

    if (response.error) {
        showErrorMessage(response.error);
    }

    loader.style.display = 'none';    
    if (response.passwordUpdated === true) {
        window.location = '../../signin';
    }
});

function showErrorMessage(text) {
    errorMessage.style.display = 'block';
    errorMessage.innerText = text;
}

function resetErrorMessage() {
    errorMessage.style.display = 'none';
    errorMessage.innerText = '';
}