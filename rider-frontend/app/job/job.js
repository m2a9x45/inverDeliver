const API_URL = 'http://localhost:3001';
const productHolder = document.querySelector('.productHolder');
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

    chooseBatchButton.addEventListener('click', async () => {
        console.log(batchID);
        try {
            const result = await assignBatch(batchID);    
            console.log(result);
            if (result.error) {
                showError(result.error);    
            }
            
        } catch (error) {
            console.log(error);
            // showError(error);   
        }
        
    })

    try {
        const products = await getBatchContent(batchID);
        console.log(products);
        products.forEach(product => {
            displayProduct(product);
        });
    } catch (error) {
        console.log(error);
    }

}

async function assignBatch(batchID) {
    const body = {
        batch_id: batchID
    }
    try {
        const response = await fetch(`${API_URL}/shopper/order/choose`, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log(response);

        if (response.status === 204) {
            return 
        }

        const data = await response.json();
        return data;            
    } catch (error) {
        console.error(error);
    }
}

async function getBatchContent(batchID) {
    try {
        const response = await fetch(`${API_URL}/shopper/order/batch/${batchID}`, {
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

function displayProduct(product) {
    const productDiv = createDivWithClass('product');

    const productInfo = createDivWithClass('productInfo');

    const productImgAndName = createDivWithClass('productImgAndName');

    const productImg = document.createElement('img');
    productImg.setAttribute('src', `${API_URL}/productImage/${product.image_url}`);

    const nameAndSizeDiv = createDivWithClass();

    const productName = document.createElement('p');
    productName.innerText = product.name;

    const productSize = document.createElement('p');
    productSize.innerText = product.size;

    nameAndSizeDiv.appendChild(productName);
    nameAndSizeDiv.appendChild(productSize);

    productImgAndName.appendChild(productImg);
    productImgAndName.appendChild(nameAndSizeDiv);

    productInfo.appendChild(productImgAndName);

    const quantityHolder = createDivWithClass();
    const quantityDiv = createDivWithClass('quantity');

    const quantity = document.createElement('p');
    quantity.innerText = product.quantity;

    const quantityIcon = createIcon('fas fa-shopping-basket');

    quantityDiv.appendChild(quantity);
    quantityDiv.appendChild(quantityIcon);

    quantityHolder.appendChild(quantityDiv);

    productInfo.appendChild(quantityHolder);

    const productMetaData = createDivWithClass('productMetaData');

    const barcodeAndSKU = createDivWithClass('barcodeAndSKU');
    const barcodeDiv = createDivWithClass('barcode');

    const barcodeIcon = createIcon('fas fa-barcode');
    const barcode = document.createElement('p');
    barcode.innerText = product.upc

    barcodeDiv.appendChild(barcodeIcon);
    barcodeDiv.appendChild(barcode);

    const barcodeDiv1 = createDivWithClass('barcode');

    const alertIcon = createIcon('fas fa-exclamation-circle');
    const sku = document.createElement('p');
    sku.innerText = product.sku

    barcodeDiv1.appendChild(alertIcon);
    barcodeDiv1.appendChild(sku);

    barcodeAndSKU.appendChild(barcodeDiv);
    barcodeAndSKU.appendChild(barcodeDiv1);

    const categoryDiv = createDivWithClass('category');
    const category = document.createElement('p');
    category.innerText = displayProductCategory(product.category);

    categoryDiv.appendChild(category);

    productMetaData.appendChild(barcodeAndSKU);
    productMetaData.appendChild(categoryDiv);

    productDiv.appendChild(productInfo);
    productDiv.appendChild(productMetaData);

    productHolder.appendChild(productDiv);
}

function createDivWithClass(className) {
    const div = document.createElement('div');
    if (!className) {
        return div    
    }
    div.setAttribute('class', className);
    return div
}

function createIcon(iconName) {
    const div = document.createElement('i');
    div.setAttribute('class', iconName);
    return div
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














