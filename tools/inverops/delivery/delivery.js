const API_URL = 'http://localhost:3002';

mapboxgl.accessToken = 'pk.eyJ1IjoibTJhOXg0NSIsImEiOiJjazgwZ3A5eG8wZmdkM2xvN3ZxemprZXg4In0.kvmKjrIYwhEng1ut3AZe-Q';
const token = localStorage.getItem('stoken');


const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-3.194890, 55.948842],
    zoom: 14
});

map.addControl(new mapboxgl.NavigationControl());

const url_string = window.location.href;
const url = new URL(url_string);
const deliveryID = url.searchParams.get("deliveryID");
console.log(deliveryID);


async function getDeliveryies() {
    try {
        const response = await fetch(`${API_URL}/delivery/upcoming/${deliveryID}`, { headers: { 'authorization' : `Bearer ${token}` }});
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
            headers: { 'authorization' : `Bearer ${token}` }
        });
        console.log(response);
    } catch (error) {
        console.error(error);
    }
}

async function outForDelivery(deliveryID) {
    try {
        const response = await fetch(`${API_URL}/delivery/outForDelivery/${deliveryID}`, {
            method: 'PATCH',
            headers: { 'authorization' : `Bearer ${token}` }
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
    const outForDeliveryButton = document.querySelector('#outForDeliveryButton');

    const deliveryDate = new Date(delivery.time);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    };
    const displaydate = deliveryDate.toLocaleDateString("en-GB", options)
  
    deliveryTime.innerHTML = displaydate;
    orderID.innerHTML = delivery.order_id;
    addressLine.innerHTML = delivery.street;
    addressCity.innerHTML = delivery.city;
    addressPostcode.innerHTML = delivery.post_code;
    latLong.innerHTML = `${delivery.lat} ${delivery.long}`;
    latLong.href = `https://www.google.com/maps/search/?api=1&query=${delivery.lat},${delivery.long}`;
    note.innerHTML = delivery.note;
    customerName.innerHTML = `Customer Name: ${delivery.first_name}`;
    customerNumber.href = `tel:${delivery.phone_number}`;
    customerNumber.innerHTML = delivery.phone_number;

    const marker1 = new mapboxgl.Marker()
        .setLngLat([delivery.long, delivery.lat])
        .addTo(map);
    map.flyTo({
        center: [delivery.long, delivery.lat]
    })

    outForDeliveryButton.addEventListener('click', (e) => {
        outForDelivery(delivery.delivery_id);
    })

    completeButton.addEventListener('click', (e) => {
        completeOrder(delivery.delivery_id);
    })

}