const API_URL = "http://localhost:3002";

const loginForm = document.querySelector('#loginForm');
const usernameInput = document.querySelector('#username');
const passwordInput = document.querySelector('#password');


document.addEventListener('DOMContentLoaded', () => {

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        console.log(usernameInput.value, passwordInput.value);

        try {
            const { token } = await login(usernameInput.value, passwordInput.value);
            localStorage.setItem('stoken', token);
            window.location = '../'
        } catch (error) {
            console.error(error);
        }
    });
});

async function login(username, password) {
    const formData = {
        username: username,
        password: password,
    }

    const response = await fetch(`${API_URL}/staff/login`, { method: 'POST', headers: { "Content-Type": "application/json" } ,body: JSON.stringify(formData) });
    const data = await response.json();
    return data;
}