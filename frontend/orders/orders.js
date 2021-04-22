const API_URL = "http://localhost:3001";
const loader = document.querySelector('.loader');
const ordersHolder = document.querySelector('.orders');
const errorMessage = document.querySelector('#errorMessage');

const token = localStorage.getItem('token');

if (!token) {
    window.location.replace("../signin");
}

fetch(`${API_URL}/order/all`, {
        headers: {
            'authorization': `bearer ${token}`,
        }
    })
    .then(response => {
        switch (response.status) {
            case 200:
                loader.style.display = "none";
                return response.json()
            case 401:
                window.location.replace('../signin');
                break;
            default:
                console.log("🚨 Something went wrong");
        }
    })
    .then(data => {
        console.log(data);
        data.forEach(order => {
            displayOrders(order);
        });
    })
    .catch(error => {
        loader.style.display = "none";
        errorMessage.style.display = "block"
        errorMessage.innerText = "🚨🚨🚨 Sorry somthing went wrong, if this continues please get in touch 🚨🚨🚨";
        console.error(`🚨🚨🚨${error}🚨🚨🚨`);
    })

function displayOrders(order) {
    const orderDiv = document.createElement("div");
    orderDiv.setAttribute("class", "order");

    // Creating the orderInfo top part of the displayed order
    // Includes the orderID, Cost and Ordered date
    const orderInfo = document.createElement("div");
    orderInfo.setAttribute("class", "orderInfo");

    // Order ID section
    const orderIDDiv = document.createElement("div");
    orderIDDiv.setAttribute("id", "orderIDDiv");
    const orderIDLabel = document.createElement("p");
    orderIDLabel.innerText = "Order ID";
    orderIDDiv.appendChild(orderIDLabel);

    let OrderID;

    switch (order.status) {
        case 0:
            orderID = document.createElement("a");
            orderID.innerText = order.order_id;
            orderID.setAttribute("href", `../payment/?orderID=${order.order_id}`);
            break;
        default:
            orderID = document.createElement("a");
            orderID.innerText = order.order_id;
            orderID.setAttribute("href", `./info/?orderID=${order.order_id}`);
    }

    orderIDDiv.appendChild(orderID);

    orderInfo.appendChild(orderIDDiv);

    // Order cost section
    const orderCostDiv = document.createElement("div");
    const orderCostLabel = document.createElement("p");
    orderCostLabel.innerText = "Cost";
    orderCostDiv.appendChild(orderCostLabel);

    const orderCost = document.createElement("p");
    const formatedPrice = new Intl.NumberFormat('en-UK', {
        style: 'currency',
        currency: 'GBP'
    }).format((order.price + order.fee )/ 100);
    orderCost.innerText = formatedPrice;
    orderCostDiv.appendChild(orderCost);

    orderInfo.appendChild(orderCostDiv);

    // Order created at section
    const orderOnDiv = document.createElement("div");
    const orderOnLabel = document.createElement("p");
    orderOnLabel.innerText = "Ordered On";
    orderOnDiv.appendChild(orderOnLabel);

    const orderOn = document.createElement("p");
    const deliveryDate = new Date(order.created_at);
    const displaydate = deliveryDate.toLocaleDateString("en-GB", {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
    orderOn.innerText = displaydate;
    orderOnDiv.appendChild(orderOn);

    orderInfo.appendChild(orderOnDiv);

    orderDiv.appendChild(orderInfo); // Added the orderInfo div to the order div

    // order body
    const orderbody = document.createElement("div");
    orderbody.setAttribute("class", "orderbody");

    // Delivery section, label, streetname, city and postcode
    const deliveryInfo = document.createElement("div");

    const deliveryInfoLabel = document.createElement("p");
    deliveryInfoLabel.innerText = "Delivery Address";
    deliveryInfo.appendChild(deliveryInfoLabel);

    const deliveryStreet = document.createElement("p");
    deliveryStreet.innerText = order.street;
    deliveryInfo.appendChild(deliveryStreet);

    const deliveryCity = document.createElement("p");
    deliveryCity.innerText = order.city;
    deliveryInfo.appendChild(deliveryCity);

    const deliveryPostCode = document.createElement("p");
    deliveryPostCode.innerText = order.post_code;
    deliveryInfo.appendChild(deliveryPostCode);

    orderbody.appendChild(deliveryInfo); // Adding delivery info to the orderbody

    // Context section, includes help and status of order
    const contextInfo = document.createElement("div");
    contextInfo.setAttribute("class", "statusAndHelp");

    const deliveryStatus = document.createElement("p");
    deliveryStatus.setAttribute("id", "deliveryStatus");

    switch (order.status) {
        case 0:
            deliveryStatus.innerText = "Awaiting Payment";
            deliveryStatus.style.backgroundColor = "#8f6eff"; // purple
            break;
        case 1:
            deliveryStatus.innerText = "Order recived";
            deliveryStatus.style.backgroundColor = "#ff80fb"; // pink
            break;
        case 2:
            deliveryStatus.innerText = "Awaiting shopping";
            deliveryStatus.style.backgroundColor = "#9efffc"; // blue
            break;
        case 3:
            deliveryStatus.innerText = "shopping";
            deliveryStatus.style.backgroundColor = "#ff7c4d"; // orange
            break;
        case 4:
            deliveryStatus.innerText = "shopping complete";
            deliveryStatus.style.backgroundColor = "#32a852"; // green
            break;
        case 5:
            deliveryStatus.innerText = "Out for Delivery";
            deliveryStatus.style.backgroundColor = "#32a852"; // green
            break;
        case 6:
            deliveryStatus.innerText = "Delivered";
            deliveryStatus.style.backgroundColor = "#32a852"; // green
            break;
        default:
            deliveryStatus.innerText = "Please get In touch";
    }

    contextInfo.appendChild(deliveryStatus);

    const helpButton = document.createElement("a");
    helpButton.setAttribute("id", "helpButton");
    helpButton.setAttribute("href", `../help/order?id=${order.order_id}`);
    helpButton.innerText = "Order help";
    contextInfo.appendChild(helpButton);

    orderbody.appendChild(contextInfo); // Adding contextInfo to the orderbody

    orderDiv.appendChild(orderbody); // Adding order body to the order div

    ordersHolder.appendChild(orderDiv); // Adding the order div to the orders div

}