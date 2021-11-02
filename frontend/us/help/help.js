const API_URL = 'https://api.inverdeliver.com'
const callbackForm = document.querySelector('.callbackForm');
const navBarToggle = document.querySelector('.navbarToggle');
const navtoggle = document.querySelector('.mainNav');

if (localStorage.getItem("token")) {
    const token = localStorage.getItem("token");
    const jwtExp = JSON.parse(atob(token.split('.')[1]));
  
    if (Date.now() < jwtExp.exp * 1000) {
      // we think token is vaild
      const logout = document.querySelector('#logout');
      logout.innerText = "Logout";
      logout.setAttribute("href", "./logout");
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

callbackForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.querySelector('#email').value;
    const issue = document.querySelector('#issue').value;
    const phoneNumber = document.querySelector('#phoneNumber').value;

    console.log(email, issue, phoneNumber);

    const data = {
        'email': email,
        'issue': issue,
        'phoneNumber': phoneNumber,
    }

    fetch(`${API_URL}/support/callback`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
      const callbackFormMessage = document.querySelector('#callbackFormMessage');
      callbackFormMessage.style.display = 'block';
      toggleCallForm();
      if (response.ok) {
        callbackFormMessage.innerHTML = "<p>Thanks for submitting a callback request, we'll reply to you as soon as possible</p>";
      } else {
        callbackFormMessage.innerHTML = "<p>Sorry there was a problem, if this continues. Please let us know</p>";
      }
    })
    .catch((error) => console.error(error))

})

function toggleCallForm() {
    const callForm = document.querySelector('.callbackForm');

    if (callForm.style.display === 'block') {
        callForm.style.display = 'none';
    } else {
        callForm.style.display = 'block';
    }
}

