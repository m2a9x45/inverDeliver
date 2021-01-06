const gridCcontainer = document.querySelector('.grid-container');


const API_URL = "http://localhost:3000"

fetch(`${API_URL}/product/standard`)
  .then(response => response.json())
  .then(resObject => addProducts(resObject.data));


function addProducts(productArray) {
    productArray.forEach(product => {

        const gridDiv = document.createElement("div");
        gridDiv.setAttribute("class", "grid-item");

        const img = document.createElement("img");
        img.setAttribute("src", product.image_url);
        img.setAttribute("width", "150px");
        img.setAttribute("height", "150px");

        const title = document.createElement("p");
        title.innerText = `${product.name} - ${product.des}`;

        const productLinksDiv = document.createElement("div");
        productLinksDiv.setAttribute("class", "productLinks");

        const price = document.createElement("p");
        price.innerText = `£ ${product.price / 100}` // more logic needed to handle zero

        const button = document.createElement("button");
        button.innerText = "Add to Cart";
        button.setAttribute("class", "addCartButton");

        const div = document.createElement("div");
        div.setAttribute("class", "productLinks");
        
        div.appendChild(price);
        div.appendChild(button);

        productLinksDiv.appendChild(div);

        gridDiv.appendChild(img);
        gridDiv.appendChild(title);
        gridDiv.appendChild(productLinksDiv);

        gridCcontainer.appendChild(gridDiv);



    });
}