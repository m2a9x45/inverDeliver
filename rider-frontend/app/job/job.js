const API_URL = 'http://localhost:3001';

const wazeButton = document.querySelector('#wazeButton');
const appleButton = document.querySelector('#appleButton');
const googleButton = document.querySelector('#googleButton');

const chooseBatchButton = document.querySelector('#chooseBatch');
const myModal = document.querySelector('#myModal');

mapboxgl.accessToken = 'pk.eyJ1IjoibTJhOXg0NSIsImEiOiJjazgwZ3A5eG8wZmdkM2xvN3ZxemprZXg4In0.kvmKjrIYwhEng1ut3AZe-Q';
const token = localStorage.getItem('rtoken');

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-2.3826743, 57.284587],
    zoom: 13
});

map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.FullscreenControl());

window.onload = async function() {
    const url_string = window.location.href;
    const url = new URL(url_string);
    const batchID = url.searchParams.get("batchID");
    console.log(batchID);

    try {
        const result = await getStoreInfo(batchID);
        console.log(result);
        if (result.error) {
            return showError(result.error);
        }

        addNavLinks(result.lat, result.long);

        const marker1 = new mapboxgl.Marker()
            .setLngLat([result.long, result.lat])
            .addTo(map);
            map.flyTo({
                center: [result.long, result.lat]
            })
    
    } catch (error) {
        console.log(error);
    }

}

async function getStoreInfo(orderID) {
    try {
        const response = await fetch(`${API_URL}/shopper/order/store/${orderID}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
    
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(error);
    }
}

function addNavLinks(lat, long) {

    // target="_blank" rel="noopener noreferrer"

    // https://developers.google.com/waze/deeplinks/
    // https://www.waze.com/ul?ll=40.75889500%2C-73.98513100&navigate=yes&zoom=17
    wazeButton.addEventListener('click', () => {
        window.open(`https://www.waze.com/ul?ll=${lat},${long}&navigate=yes&zoom=17`, '_blank', 'noopener,noreferrer,resizable')
    });

    // https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html
    appleButton.addEventListener('click', () => {
        window.open(`https://maps.apple.com/?daddr=${lat},${long}`, '_blank', 'noopener,noreferrer,resizable')
    });

    googleButton.addEventListener('click', () => {
        window.open(`http://maps.google.com/?daddr=${lat},${long}`, '_blank', 'noopener,noreferrer,resizable')
        
    });
}


function showError(error) {
    const errorTitle = document.querySelector('#errorTitle');
    const errorMessage = document.querySelector('#errorMessage');

    // Check if there's a dynamic error
    if (error.dynamicError) {
        errorTitle.innerText = error.dynamicError.errTitle;
        errorMessage.innerText = error.dynamicError.errMessage;
        myModal.style.display = 'block';
        return;
    }

    errorTitle.innerText = error.message;
    myModal.style.display = 'block';
}

function hideError() {
    myModal.style.display = 'none';
}














