const API_URL = "http://localhost:3002";
const token = localStorage.getItem('stoken');

const ordersList = document.querySelector(".ordersList");

let userLocation;

document.addEventListener('DOMContentLoaded', async () => {
    navigator.geolocation.getCurrentPosition((position) => {
        userLocation = position;
        getOrders();
    });
});

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
    shopAddress.innerText = order.address;

    const distanceToShop = document.createElement('span');
    
    const {latitude, longitude} = userLocation.coords;

    let dist = Math.sqrt((order.lat - latitude) ** 2 + (order.long - longitude) ** 2) * 100;
    if (dist >= 100) {
        dist = Math.floor(dist);
    } else {
        dist = dist.toFixed(2)
    }

    distanceToShop.innerText = `${dist} km`;

    const orderRunningLate = document.createElement('span');
    orderRunningLate.setAttribute('class', 'late')
    orderRunningLate.innerText = 'Running Late';

    const deliveryTimeUnix = new Date(order.delivery_time).getTime();
    const currentTimeUnix = new Date().getTime();

    console.log(deliveryTimeUnix - currentTimeUnix);

    let now = new Date().getTime();
    let created = new Date(order.delivery_time).getTime();

    console.log(now, created);

    let diff = now - created;
    let secs = diff / 1000;
    let mins = secs / 60;
    let hours = mins / 60;
    let days = hours / 24;
    let months = days / 30;

    let value;

    if (Math.abs(secs) <= 60) {
        console.log("seconds :", Math.round(secs));
        value = `${Math.abs(Math.round(secs))} Seconds`;
    } else if (Math.abs(mins) <= 60) {
        console.log("minitues :", Math.round(mins));      
        value = `${Math.abs(Math.round(mins))} Minutes`;
    } else if (Math.abs(hours) <= 24) {
        console.log("hours :",  Math.abs(Math.round(hours)));     
        value = `${Math.abs(Math.round(hours))} Hours`;
    } else if (Math.abs(days) <= 30) {
        console.log("days :", Math.round(days));
        value = (Math.abs(Math.round(days)) === 1) ? `${Math.abs(Math.round(days))} Day` : `${Math.abs(Math.round(days))} Days`;
    } else {
        console.log("Months :", Math.round(months));
        value = `${Math.abs(Math.round(months))} Months`;
    }

    if (currentTimeUnix > deliveryTimeUnix) {
        orderRunningLate.innerText = `Late By ${value}`;
    } else {
        orderRunningLate.innerText = `Due in ${value}`;
        orderRunningLate.style.backgroundColor = '#39c239';
    }

    
    const navAndStatus = document.createElement('div');
    navAndStatus.setAttribute('class', 'navAndStatus')

    const navAndStatusDiv = document.createElement('div');

    const orderStatus = document.createElement('p');
    orderStatus.innerText = order.status;

    navAndStatusDiv.appendChild(orderStatus);

    const navAndStatusDiv2 = document.createElement('div');
    const navigate = document.createElement('a');
    navigate.innerText = 'navigate 🚲';
    navigate.setAttribute('href', `https://www.google.com/maps/search/?api=1&query=${order.lat},${order.long}`);
    navigate.setAttribute('target', '_blank');
    navigate.setAttribute('rel', 'noopener noreferrer');

    navAndStatusDiv2.appendChild(navigate);

    navAndStatus.appendChild(navAndStatusDiv);
    navAndStatus.appendChild(navAndStatusDiv2);

    const itemCount = document.createElement('p');
    itemCount.setAttribute('class', 'itemCount');
    itemCount.innerText = '🛒 16';

    const deliveryTimeDivHolder = document.createElement('div');
    deliveryTimeDivHolder.setAttribute('class', 'deliveryTime');

    const deliveryDate = new Date(order.delivery_time);
    const displaydate = deliveryDate.toLocaleDateString("en-GB", {
        month: 'short',
        day: 'numeric',
        weekday: 'short',
    });

    const displayTime = deliveryDate.toLocaleTimeString("en-GB", {
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: "h12"
    });

    // Shows Deliver Titles
    const deliveryDayDiv = document.createElement('div');

    const deliveryDayTitle = document.createElement('p');
    deliveryDayTitle.innerText = 'Delivery Day';

    const deliveryTimeTitle = document.createElement('p');
    deliveryTimeTitle.innerText = 'Time';

    deliveryDayDiv.appendChild(deliveryDayTitle);
    deliveryDayDiv.appendChild(deliveryTimeTitle);

    deliveryTimeDivHolder.appendChild(deliveryDayDiv);

    //Shows Deliver Day & Time
    const deliveryTimeDiv = document.createElement('div');

    const deliveryDay = document.createElement('p');
    deliveryDay.innerText = displaydate;

    const deliveryTime = document.createElement('p');
    deliveryTime.innerText = displayTime;

    deliveryTimeDiv.appendChild(deliveryDay);
    deliveryTimeDiv.appendChild(deliveryTime);

    deliveryTimeDivHolder.appendChild(deliveryTimeDiv);

    const button = document.createElement('button');
    button.setAttribute('class', 'pickNowButton');
    button.innerText = 'Pick Order Now';
    button.addEventListener('click', () => window.location.href = `../order/?orderID=${order.order_id}`);

    orderDiv.appendChild(shopName);
    orderDiv.appendChild(shopAddress);
    orderDiv.appendChild(distanceToShop);
    orderDiv.appendChild(orderRunningLate);
    orderDiv.appendChild(navAndStatus);
    orderDiv.appendChild(itemCount);
    orderDiv.appendChild(deliveryTimeDivHolder);
    orderDiv.appendChild(button);

    ordersList.appendChild(orderDiv);
};