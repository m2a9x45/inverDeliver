const API_URL = "http://localhost:3002";


const userSearchForm = document.querySelector('#userSearch');
const searchInput = document.querySelector('#searchUser');

userSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log(searchInput.value);
    
    // chcek if it's a phone number
    // check if it's an email
    // check if it's a user ID


})

async function findUser() {
    try {
        const response = await fetch(`${API_URL}/`);
        const orders = await response.json();
        console.log(orders);
        orders.forEach(order => {
            displayOrder(order);
        });
    } catch (error) {
        console.error(error);
    } 
}