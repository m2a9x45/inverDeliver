const API_URL = "http://localhost:3002";

const orderList = document.querySelector(".orderList");
const completeButton = document.querySelector("#completeButton");
const shoppingNowButton = document.querySelector('#shoppingNowButton');
const nameText = document.querySelector('#name');
const fileInput = document.querySelector('#receiptImage');
const checkoutPrice = document.querySelector('#checkoutPrice');
const uploadCheckoutDataForm = document.querySelector('.uploadCheckoutDataForm');


const token = localStorage.getItem('stoken');

const url_string = window.location.href;
const url = new URL(url_string);
const orderID = url.searchParams.get("orderID");

let receiptImageBase64 = '';

console.log(orderID);

document.addEventListener("DOMContentLoaded", async () => {

    try {
        getOrderContent();
        const { status, first_name: name } = await getOrderStatus();
        nameText.innerHTML = `Order for ${name}`;
        console.log(status);

        switch (status) {
            case 'order_received':
                completeButton.innerHTML = 'Start Shopping';
                completeButton.addEventListener('click', () => updateStatus(orderID, 'shopping'));
                break;
            case 'shopping':
                completeButton.innerHTML = 'Finish Shopping';
                completeButton.addEventListener('click', () => updateStatus(orderID, 'pending_delivery'));
                break;
            default:
                completeButton.innerHTML = status;
                completeButton.disabled = true;
        }
    } catch (error) {
        
    }

})

async function updateStatus(orderID, status) {
    try {
        const response = await fetch(`${API_URL}/order/status/${orderID}/${status}`, {method: "PATCH", headers: { 'authorization' : `Bearer ${token}` }});
        console.log(response);
        location.reload();
    } catch (error) {
        console.error(error);
    }
}

async function getOrderContent() {
    try {
        const response = await fetch(`${API_URL}/order/${orderID}`, { headers: { 'authorization' : `Bearer ${token}` }});
        const orderItems = await response.json();
        console.log(orderItems);
        orderItems.forEach(orderItem => {
            displayOrder(orderItem);
        });
    } catch (error) {
        console.error(error);
    } 
}

async function getOrderStatus() {
    try {
        const response = await fetch(`${API_URL}/order/getStatus/${orderID}`, { headers: { 'authorization' : `Bearer ${token}` }});
        const status = await response.json();
        console.log(status);
        return status;
    } catch (error) {
        console.error(error);
    } 
}

function displayOrder(product) {
    const orderDiv = document.createElement("div");
    orderDiv.setAttribute("class", "orderItem");

    const imageAndNameDiv = document.createElement("div");
    imageAndNameDiv.setAttribute("class", "orderImageAndName");

    const img = document.createElement("img");
    img.setAttribute("src", `http://localhost:3001/productImage/${product.image_url}`);
    img.setAttribute("width", "75px");;

    const productName = document.createElement("p");
    productName.innerHTML = `(${product.quantity}x) ${product.name} - ${product.size}`;

    imageAndNameDiv.appendChild(img);
    imageAndNameDiv.appendChild(productName);

    const buttonGroupDiv = document.createElement("div");
    buttonGroupDiv.setAttribute("class", "buttonGroup");

    const noButton = document.createElement("button");
    noButton.setAttribute("id", "noItemButton");
    noButton.innerHTML = "Can't find";
    noButton.addEventListener("click", () => {
        console.log(product.product_id);
    })

    const yesButton = document.createElement("button");
    yesButton.setAttribute("id", "yesnoItemButton");
    yesButton.innerHTML = "Found";
    yesButton.addEventListener("click", () => {
        console.log(product.product_id);
        console.log(typeof(orderDiv.style.opacity));
        if (orderDiv.style.opacity === "0.4") {
            orderDiv.setAttribute("style","opacity:1.0; -moz-opacity:1.0");
            yesButton.innerHTML = "Found";
        } else {
            orderDiv.setAttribute("style","opacity:0.4; -moz-opacity:0.4");
            yesButton.innerHTML = "Unfound";
        }
        
    })


    buttonGroupDiv.appendChild(noButton);
    buttonGroupDiv.appendChild(yesButton);

    orderDiv.appendChild(imageAndNameDiv);
    orderDiv.appendChild(buttonGroupDiv);

    orderList.appendChild(orderDiv);
}

fileInput.addEventListener('change', (e) => {
    console.log(e.target.files[0]);

    const reader = new FileReader();
    reader.onloadend = () => {
        // console.log(reader.result)
        receiptImageBase64 = reader.result;
    }

    reader.readAsDataURL(e.target.files[0]);
});

uploadCheckoutDataForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        orderID: orderID,
        price: checkoutPrice.value,
        receiptImage: receiptImageBase64,
    }

    console.log(data);

    try {
        const response = await fetch(`${API_URL}/order/finalCheckoutInfo`, { 
            method: "POST", 
            headers: { 'authorization' : `Bearer ${token}` }, 
            body: JSON.stringify(data)
        });

        if (response.status === 201) {
            
        }

        console.log(response);
    } catch (error) {
        console.log(error);
    }
})