const API_URL = "http://localhost:3002";
const orderTable = document.querySelector('#orderTable');
const token = localStorage.getItem('stoken');

document.addEventListener('DOMContentLoaded', async () => {

    try {
        const orders = await getOrders();
        orders.forEach(order => {
            addOrderToTable(order);
        });
    } catch (error) {
        console.error(error);
    }

})

async function getOrders() {
    try {
        const response = await fetch(`${API_URL}/order/latest`, { headers: { 'authorization' : `Bearer ${token}`} });
        if (!response.ok) {
            throw `❌ ${response.status} - ${response.statusText}`;
        }
        const orders = await response.json();
        return orders;
    } catch (error) {
        console.error(error);
    } 
}

function addOrderToTable(order) {

    const tr = document.createElement('tr');

    const orderID = document.createElement('td');
    const orderIDLink = document.createElement('a');
    orderIDLink.innerHTML = order.order_id;

    let url;

    switch (order.status) {
        case 'order_received':
            url = `./order/?orderID=${order.order_id}`;
            break;
        case 'shopping':
            url = `./order/?orderID=${order.order_id}`;
            break;
        case 'pending_delivery':
            url = `./delivery/?deliveryID=${order.delivery_id}`;
            break;
        case 'out_for_delivery':
            url = `./delivery/?deliveryID=${order.delivery_id}`;
            break;
        default:
            url = `./order/?orderID=${order.order_id}`;
    }

    orderIDLink.setAttribute('href', url)

    orderID.appendChild(orderIDLink);

    const name = document.createElement('td');
    name.innerHTML = order.last_name ? `${order.first_name} ${order.last_name}` : `${order.first_name}`;

    const email = document.createElement('td');
    email.innerHTML = order.email;

    const phone = document.createElement('td');
    phone.innerHTML = order.phone_number;

    const status = document.createElement('td');
    status.innerHTML = order.status;

    const delivery = document.createElement('td');
    delivery.innerHTML = `${order.post_code} ${order.lat} ${order.long}`;

    const deliverTime = document.createElement('td');
    const deliveryDate = new Date(order.time);
    const displaydate = deliveryDate.toLocaleDateString("en-GB", {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: 'numeric',
        hour12: true,
    });
    deliverTime.innerHTML = displaydate;

    const orderTime = document.createElement('td');

    const orderDate = new Date(order.created_at);
    const displayordertime = orderDate.toLocaleDateString("en-GB", {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: 'numeric',
        hour12: true,
    });

    orderTime.innerHTML = displayordertime;

    tr.appendChild(orderID);
    tr.appendChild(name);
    tr.appendChild(email);
    tr.appendChild(phone);
    tr.appendChild(status);
    tr.appendChild(delivery);
    tr.appendChild(deliverTime);
    tr.appendChild(orderTime);

    orderTable.appendChild(tr);

}