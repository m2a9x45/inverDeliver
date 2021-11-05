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

    const link = document.createElement("a");
    link.setAttribute("href", "javascript:;");
    link.setAttribute("class", "order");
    link.addEventListener("click", () => {
        console.log("click");
        window.location.href = `../order/?orderID=${order.order_id}`
    })

    const div = document.createElement("div");
    div.setAttribute("class", "orderText");

    const orderID = document.createElement("p");
    orderID.innerHTML = order.order_id;

    const userID = document.createElement("p");
    userID.innerHTML = `userID: ${order.user_id}`;

    const deliveryDate = new Date(order.time);
    const displaydate = deliveryDate.toLocaleDateString("en-GB", {
        year: '2-digit',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: 'numeric',
        hour12: true,
    });

    const time = document.createElement("p");
    time.innerHTML = displaydate;

    div.appendChild(orderID);
    div.appendChild(userID);
    div.appendChild(time);

    link.appendChild(div);

    ordersList.appendChild(link);


}