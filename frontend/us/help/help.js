function toggleCallForm() {
    const callForm = document.querySelector('.callbackForm');

    if (callForm.style.display === 'block') {
        callForm.style.display = 'none';
    } else {
        callForm.style.display = 'block';
    }
}