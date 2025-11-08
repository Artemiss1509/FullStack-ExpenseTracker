document.addEventListener('DOMContentLoaded', () => {
    const signUpForm = document.getElementById('signupForm');

    signUpForm.addEventListener('submit', handleFormSubmit);
})

async function handleFormSubmit(event) {
    event.preventDefault();

    const data = {
        name: event.target.username.value,
        email: event.target.email.value,
        password: event.target.password.value
    }

    try {
        await axios.post('http://localhost:3000/user/sign-up', data)
        .then(response => {
            console.log(response.data);
            alert('User signed up successfully!');
            clearError();
            document.getElementById('signupForm').reset();
        })
        .catch(error => {
            console.error('Sign-up error',error);
            displayError(error.response.data.message);
            return;
        });
    } catch (error) {
        console.error('Form submit request error', error);
    }


}

function displayError(message) {
    const errorDiv = document.getElementById('message');
    errorDiv.innerText = message;
    errorDiv.style.display = 'block';
}

function clearError() {
    const errorDiv = document.getElementById('message');
    errorDiv.innerText = '';
    errorDiv.style.display = 'none';
}

