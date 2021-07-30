const reader = new FileReader();
const fileInput = document.getElementById("file");
const img = document.getElementById("img");

reader.onload = e => {
  img.src = e.target.result;
  console.log(e.target.result);
}

fileInput.addEventListener('change', e => {
  const f = e.target.files[0];
  reader.readAsDataURL(f);
})