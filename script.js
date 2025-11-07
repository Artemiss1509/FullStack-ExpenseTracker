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
        })
        .catch(error => {
            console.error('post request error', error);
        });
    } catch (error) {
        console.error('Form submit request error', error);
    }

}

