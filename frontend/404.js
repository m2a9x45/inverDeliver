const navBarToggle = document.querySelector('.navbarToggle');
const navtoggle = document.querySelector('.mainNav');

// Navbar toggle code
const x = window.matchMedia("(max-width: 680px)");
x.addEventListener("change", () => x.matches ? navtoggle.style.display = "none" : navtoggle.style.display = "flex");
navBarToggle.addEventListener("click", () => (navtoggle.style.display === "none" || navtoggle.style.display === "") ? navtoggle.style.display = "flex" : navtoggle.style.display = "none");

// Checking to see if the jwt is vaild client side, we could just check if it exist in local storage to update the UI and the deal with a 401 when it happens.
if (localStorage.getItem("token")) {
  const jwtExp = JSON.parse(atob(localStorage.getItem("token").split('.')[1]));
  if (Date.now() < jwtExp.exp * 1000) {
    const logout = document.querySelector('#logout');
    logout.innerText = "Logout";
    logout.setAttribute("href", "./logout");
  } else {
    localStorage.removeItem('token');
  }
}