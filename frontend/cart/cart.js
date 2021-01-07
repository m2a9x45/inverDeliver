
let cart = JSON.parse(localStorage.getItem("cart"))

console.log(cart);

for (const [key, value] of Object.entries(cart)) {
    console.log(`${key}: ${value.name} ${value.number} £ ${value.price / 100}`);
  }