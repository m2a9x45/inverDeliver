const API_URL = "http://localhost:3002";
const orderTable = document.querySelector('#orderTable');

getOrders();

async function getOrders() {
    try {
        const response = await fetch(`${API_URL}/order/latest`);
        const orders = await response.json();
        console.log(orders);
        orders.forEach(order => {
            addOrderToTable(order);
        });
    } catch (error) {
        console.error(error);
    } 
}

function addOrderToTable(order) {

    const tr = document.createElement('tr');

    const orderID = document.createElement('td');
    orderID.innerHTML = order.order_id;

    const name = document.createElement('td');
    name.innerHTML = `${order.first_name} ${order.last_name}`;

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