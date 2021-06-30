const API_URL = "http://localhost:3002";

const orderList = document.querySelector(".orderList");
const completeButton = document.querySelector("#completeButton");
const shoppingNowButton = document.querySelector('#shoppingNowButton');

const url_string = window.location.href;
const url = new URL(url_string);
const orderID = url.searchParams.get("orderID");
console.log(orderID);

completeButton.addEventListener("click", () => {
    updateStatus(orderID, 3);
})

shoppingNowButton.addEventListener("click", () => {
    updateStatus(orderID, 2);
})

async function updateStatus(orderID, status) {
    try {
        const response = await fetch(`${API_URL}/order/status/${orderID}/${status}`, {"method": "PATCH"});
        console.log(response);
    } catch (error) {
        console.error(error);
    }
}

getOrderContent();

async function getOrderContent() {
    try {
        const response = await fetch(`${API_URL}/order/${orderID}`);
        const orderItems = await response.json();
        console.log(orderItems);
        orderItems.forEach(orderItem => {
            displayOrder(orderItem);
        });
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