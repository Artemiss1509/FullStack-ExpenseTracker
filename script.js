document.addEventListener('DOMContentLoaded', async () => {
    const signUpForm = document.getElementById('signupForm');
    const signInForm = document.getElementById('loginForm');
    const expenseForm = document.getElementById('expenseForm');

    if (signUpForm) {
        signUpForm.addEventListener('submit', handleFormSubmit);
    }

    if (signInForm) {
        signInForm.addEventListener('submit', loginFormSubmit);
    }

    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please sign in to view your expenses.');
        }

        await axios.get('http://localhost:3000/expense/all', { headers: { "Authorization": `Bearer ${token}` } })
            .then(response => {
                console.log(response.data);
                response.data.expenses.forEach(expense => {
                    displayExpense(expense);
                });
            })
            .catch((error) => {
                console.log('Get expenses error', error);
                return;
            });

        await axios.get('http://localhost:3000/payment/premium-status', { headers: { "Authorization": `Bearer ${token}` } }).then(response => {
            if (response.data.paymentStatus === 'Success') {
                displayPremiumFeatures();
            }
        }).catch(err => {
            console.error('Error fetching premium status', err);
        });
    }


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
                console.error('Sign-up error', error);
                displayError(error.response.data.message);
                return;
            });
    } catch (error) {
        console.error('Form submit request error', error);
    }


}
async function loginFormSubmit(event) {
    event.preventDefault();

    const data = {
        email: event.target.email.value,
        password: event.target.password.value
    }

    try {
        await axios.post('http://localhost:3000/user/sign-in', data)
            .then(response => {
                const token = response.data.token;
                localStorage.setItem('token', token);
                console.log(response.data);
                expensePage();
            })
            .catch(error => {
                console.error('Sign-in error', error);
                displayError(error.response.data.message);
                return;
            });
    } catch (error) {
        console.error('Login form submit request error', error);
    }
}

async function handleExpenseSubmit(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    const data = {
        amount: event.target.amount.value,
        description: event.target.description.value,
        category: event.target.category.value,
    }

    try {
        await axios.post('http://localhost:3000/expense/add', data, { headers: { "Authorization": `Bearer ${token}` } })
            .then(response => {
                console.log(response.data);
                clearError();
                displayExpense(response.data.expense);
                document.getElementById('expenseForm').reset();
            })
            .catch(error => {
                console.error('Add expense error', error);
                displayError(error.response.data.message);
                return;
            });
    } catch (error) {
        console.error('Expense form submit request error', error);
    }
}

function displayExpense(data) {
    const expenseList = document.getElementById('expenseList');
    const delButton = document.createElement('button');
    const expenseItem = document.createElement('li');

    expenseItem.innerText = `Amount: ${data.amount}, Description: ${data.description}, Category: ${data.category}`;
    delButton.innerText = 'Delete';

    delButton.addEventListener('click', () => {
        expenseList.removeChild(expenseItem);
        deleteExpense(data.id);
    });

    expenseItem.appendChild(delButton);
    expenseList.appendChild(expenseItem);
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
function expensePage() {
    location.replace("expensePage.html");
}

async function deleteExpense(expenseId) {
    await axios.delete(`http://localhost:3000/expense/delete/${expenseId}`)
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error('Delete expense error', error);
        });
}

function displayPremiumFeatures() {
    const rentBut = document.getElementById('row');
    const mainDiv = document.getElementById('message');

    if (rentBut) {
        rentBut.innerHTML = '';
    }

    const premiumMsg = document.createElement('h2');
    const showScoreBtn = document.createElement('button');

    premiumMsg.innerText = 'You are a Premium User!';
    showScoreBtn.innerText = 'Show Leaderboard';

    showScoreBtn.addEventListener('click', () => {
        rentBut.innerHTML = '';
        leaderBoard();
    });

    mainDiv.appendChild(premiumMsg);
    mainDiv.appendChild(showScoreBtn);
}

async function leaderBoard() {
    const row1 = document.getElementById('row');
    const list = document.createElement('ul');
    const token = localStorage.getItem('token');

    try {
        const resp = await axios.get('http://localhost:3000/expense/leaderboard', {
            // uncomment if you add auth on the route:
            // headers: { Authorization: `Bearer ${token}` }
        });
        list.innerHTML = ''; // clear
        resp.data.leaderboard.forEach((user) => {
            const li = document.createElement('li');
            const total = Number(user.totalExpense || 0).toFixed(2);
            li.innerText = `Name: ${user.name}, Total Expense: ${total}`;
            list.appendChild(li);
        });
        row1.innerHTML = ''; // optional: clear previous content
        row1.appendChild(list);
    } catch (error) {
        console.error('Error fetching leaderboard', error);
    }
}

