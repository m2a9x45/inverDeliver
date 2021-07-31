const API_URL = 'http://localhost:3001'
const callbackForm = document.querySelector('.callbackForm');

callbackForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('hi');
    const email = document.querySelector('#email').value;
    const issue = document.querySelector('#issue').value;
    const phoneNumber = document.querySelector('#phoneNumber').value;

    console.log(email, issue, phoneNumber);

    const data = {
        'email': email,
        'issue': issue,
        'phoneNumber': phoneNumber,
    }

    fetch(`${API_URL}/support/callback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then((data) => {
        console.log(data);
        if (data.data === 'success') {
            toggleCallForm();
            const callbackFormMessage = document.querySelector('#callbackFormMessage');
            callbackFormMessage.style.display = 'block';
        }
    })
    .catch((error) => console.error(error))

})

function toggleCallForm() {
    const callForm = document.querySelector('.callbackForm');

    if (callForm.style.display === 'block') {
        callForm.style.display = 'none';
    } else {
        callForm.style.display = 'block';
    }
}

