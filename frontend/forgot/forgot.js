const API_URL = "http://localhost:3001";

const resetPasswordRequestForm = document.querySelector('#resetPasswordRequestForm');
const emailInput = document.querySelector('#emailInput');
const resetButton = document.querySelector('#resetButton');

const emailSentMessage = document.querySelector('#emailSentMessage');
const errorMessage = document.querySelector('#errorMessage');
const loader = document.querySelector('.loader');

async function sendPasswordResetRequest(email) {
    try {
        const response = await fetch(`${API_URL}/user/sendPasswordResetLink`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({email})
        });

        if (!response.ok) {
            loader.style.display = 'none';
            resetButton.style.display = 'block';
            if (response.status = 400) {
                showErrorMessage("Some of the information you've entered doesn't look to be right");
                return false;
            } else {
                showErrorMessage("Something when wrong, let us know if it continues");
                return false;
            } 
        }

        return true;
    } catch (error) {
        showErrorMessage("Something when wrong, let us know if it continues");
        resetButton.style.display = 'block';
        console.error(error);
        return false;
    }
}

resetPasswordRequestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    resetButton.style.display = 'none';
    loader.style.display = 'block';

    const email = emailInput.value; 

    const success = await sendPasswordResetRequest(email);

    loader.style.display = 'none';

    if (success) {
        emailSentMessage.style.display = 'block';
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