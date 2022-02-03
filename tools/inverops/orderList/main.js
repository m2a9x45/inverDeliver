const API_URL = "http://localhost:3002";
const token = localStorage.getItem('stoken');

const ordersList = document.querySelector(".ordersList");

getOrders();

async function getOrders() {
    try {
        const response = await fetch(`${API_URL}/order/recived-shopping`, { headers: { 'authorization' : `Bearer ${token}` }});
        const orders = await response.json();
        console.log(orders);
        orders.forEach(order => {
            displayOrder(order);
        });
    } catch (error) {
        console.error(error);
    } 
}

function displayOrder(order) {

    const orderDiv = document.createElement('div');
    orderDiv.setAttribute('class', 'order');

    const shopName = document.createElement('h2');
    shopName.innerText = order.store_name;

    const shopAddress = document.createElement('address');

    // continue working on this tommorow






   
    const deliveryDate = new Date(order.time);
    const displaydate = deliveryDate.toLocaleDateString("en-GB", {
        year: '2-digit',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: 'numeric',
        hour12: true,
    });
};