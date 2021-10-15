const navBarToggle = document.querySelector('.navbarToggle');
const navtoggle = document.querySelector('.mainNav');
const token = localStorage.getItem('token');

const url_string = window.location.href;
const url = new URL(url_string);

const orderID = url.searchParams.get("orderID");
const paymentID = url.searchParams.get("id");

const orderTrackingLink = document.querySelector('#orderTrackingLink');
orderTrackingLink.setAttribute("href", `../../orders/info/?orderID=${orderID}`);

if (!token) {
  window.location.replace("../signin");
} else {
    const jwtExp = JSON.parse(atob(token.split('.')[1]));
  
    if (Date.now() < jwtExp.exp * 1000) {
      // we think token is vaild
      const logout = document.querySelector('#logout');
      logout.innerText = "Logout";
      logout.setAttribute("href", "../logout");
    } else {
      localStorage.removeItem("token");
      window.location.replace('../signin');
    }
}

// Navbar toggle code
const x = window.matchMedia("(max-width: 680px)");

x.addEventListener("change", () => {
  if (x.matches) { 
    navtoggle.style.display = "none";
  } else {
    navtoggle.style.display = "flex";
  }
})

navBarToggle.addEventListener("click", () => {
  if (navtoggle.style.display === "none" || navtoggle.style.display === "") {
    navtoggle.style.display = "flex";
  } else {
    navtoggle.style.display = "none";
  }
});

