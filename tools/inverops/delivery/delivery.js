const API_URL = 'http://localhost:3002';

mapboxgl.accessToken = 'pk.eyJ1IjoibTJhOXg0NSIsImEiOiJjazgwZ3A5eG8wZmdkM2xvN3ZxemprZXg4In0.kvmKjrIYwhEng1ut3AZe-Q';


const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-3.194890, 55.948842],
    zoom: 11
});

map.addControl(new mapboxgl.NavigationControl());

const url_string = window.location.href;
const url = new URL(url_string);
const deliveryID = url.searchParams.get("deliveryID");
console.log(deliveryID);


async function getDeliveryies() {
    try {
        const response = await fetch(`${API_URL}/delivery/upcoming/${deliveryID}`);
        const json = await response.json();
        console.log(json);
        showDelivery(json)
    } catch (error) {
        console.error(error);
    }
}

async function completeOrder(deliveryID) {
    try {
        const response = await fetch(`${API_URL}/delivery/complete/${deliveryID}`, {
            method: 'PATCH',
        });
        console.log(response);
    } catch (error) {
        console.error(error);
    }
}

getDeliveryies()


function showDelivery(delivery) {
    const deliveryTime = document.querySelector('#deliveryTime');
    const orderID = document.querySelector('#orderID');
    const addressLine = document.querySelector('#addressLine');
    const addressCity = document.querySelector('#addressCity');
    const addressPostcode = document.querySelector('#addressPostcode');
    const latLong = document.querySelector('#latLong');
    const note = document.querySelector('#note');
    const customerName = document.querySelector('#customerName');
    const customerNumber = document.querySelector('#customerNumber');
    const completeButton = document.querySelector('#completeButton');

    deliveryTime.innerHTML = delivery.time;
    orderID.innerHTML = delivery.order_id;
    addressLine.innerHTML = delivery.street;
    addressCity.innerHTML = delivery.city;
    addressPostcode.innerHTML = delivery.post_code;
    latLong.innerHTML = `${delivery.lat} ${delivery.long}`;
    note.innerHTML = delivery.note;
    customerName.innerHTML = delivery.first_name;
    customerNumber.href = `tel:${delivery.phone_number}`;
    customerNumber.innerHTML = delivery.phone_number;

    completeButton.addEventListener('click', (e) => {
        completeOrder(delivery.delivery_id);
    })

}