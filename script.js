document.addEventListener('DOMContentLoaded', async () => {
    const signUpForm = document.getElementById('signupForm');
    const signInForm = document.getElementById('loginForm');
    const expenseForm = document.getElementById('expenseForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const resetForm = document.getElementById('resetEmail')
    const tabItems = document.querySelectorAll('.tab-item');
    const tabPanes = document.querySelectorAll('.tab-pane');

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
                removeGreyOut();
            }
        }).catch(err => {
            console.error('Error fetching premium status', err);
        });
    }

    if(logoutBtn){
        logoutBtn.addEventListener('click', signout)
    }
    if(resetForm){
        resetForm.addEventListener('submit',resetPass)
    }

    tabItems.forEach(item => {
        item.addEventListener('click', () => {
        tabItems.forEach(i => i.classList.remove('active'));
        tabPanes.forEach(p => p.classList.remove('active'));

        item.classList.add('active');

        const targetTab = item.dataset.tab;
        const targetPane = document.getElementById(targetTab);

        if (targetPane) {
            targetPane.classList.add('active');
        }
        const tabEndpoints = {
            daily: 'daily',
            weekly: 'weekly',
            monthly: 'monthly'
            };
        const endpoint = tabEndpoints[targetTab];
        getExpenses(endpoint, targetTab, targetPane,1,3)
        });
    });

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
    const token = localStorage.getItem('token')
    await axios.delete(`http://localhost:3000/expense/delete/${expenseId}`,{ headers: { "Authorization": `Bearer ${token}` } })
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error('Delete expense error', error);
        });
}

function displayPremiumFeatures() {
    const rentBut = document.getElementById('row');
    const mainDiv = document.querySelector('.expense-container');

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
    const head = document.createElement('h2')

    head.innerText = 'Leaderboard'

    try {
        const resp = await axios.get('http://localhost:3000/expense/leaderboard');
        list.innerHTML = '';
        resp.data.leaderboard.forEach((user) => {
            const li = document.createElement('li');
            const total = Number(user.totalExpense || 0).toFixed(2);
            li.innerText = `Name: ${user.name}, Total Expense: ${total}`;
            list.appendChild(li);
        });
        row1.innerHTML = '';
        row1.appendChild(head);
        row1.appendChild(list);
    } catch (error) {
        console.error('Error fetching leaderboard', error);
    }
}

function signout(){
    localStorage.clear();
    location.replace("loginPage.html")
}

async function resetPass(event){
    event.preventDefault();

    const data = {email : event.target.email.value}
    const div = document.getElementById('reset')
    const para = document.createElement('p');   

    try {
        const checkEmail = await axios.post('http://localhost:3000/user/reset',data);
        if(checkEmail.data.message){
            para.innerText = `Reset link has been sent to the email: ${data.email}`
        }
        div.appendChild(para)
    } catch (error) {
        para.innerText = `${data.email} does not exist. Please if email entered is correct`
        div.appendChild(para)
    }
}
function removeGreyOut(){
    const premiumClass = document.querySelector('.premium-feature.premium-locked');
    premiumClass.classList.remove('premium-locked')
}

async function getExpenses(endpoint, targetTab, targetPane, page = 1, pageSize = 3) {
  const token = localStorage.getItem('token');
  if (!endpoint) return console.warn(`No endpoint for ${targetTab}`);

  try {
    const url = `http://localhost:3000/expense/${endpoint}?page=${page}&pageSize=${pageSize}`;
    const res = await axios.get(url, { headers: { "Authorization": `Bearer ${token}` } });

    const { expenses = [], total = 0, totalPages = 1 } = res.data;

    // Render expenses list
    targetPane.innerHTML = `
      <h3>${targetTab.toUpperCase()}</h3>
      <ul class="expense-list">
        ${expenses.map(e => `
          <li class="expense-row">
            <div class="expense-amount">₹${e.amount}</div>
            <div class="expense-desc">${e.description}</div>
            <div class="expense-cat">${e.category}</div>
          </li>
        `).join('') || `<li>No expenses found.</li>`}
      </ul>
      <div class="pagination" id="pagination-${endpoint}"></div>
    `;

    // render pagination controls into the div with id pagination-${endpoint}
    renderPagination(endpoint, targetTab, targetPane, page, totalPages, pageSize);
  } catch (error) {
    console.error(`Error fetching ${targetTab}:`, error);
    targetPane.innerHTML = `<p style="color:red;">Error loading ${targetTab} data.</p>`;
  }
}

// render pagination controls and bind events
function renderPagination(endpoint, targetTab, targetPane, currentPage, totalPages, pageSize) {
  const container = document.getElementById(`pagination-${endpoint}`);
  if (!container) return;

  container.innerHTML = ''; // clear

  // prev button
  const prev = document.createElement('button');
  prev.innerText = 'Prev';
  prev.disabled = currentPage <= 1;
  prev.addEventListener('click', () => getExpenses(endpoint, targetTab, targetPane, currentPage - 1, pageSize));
  container.appendChild(prev);

  // page numbers (show window of pages)
  const windowSize = 5;
  let start = Math.max(1, currentPage - Math.floor(windowSize/2));
  let end = Math.min(totalPages, start + windowSize - 1);
  if (end - start + 1 < windowSize) start = Math.max(1, end - windowSize + 1);

  for (let p = start; p <= end; p++) {
    const btn = document.createElement('button');
    btn.innerText = p;
    if (p === currentPage) {
      btn.disabled = true;
      btn.classList.add('active-page');
    }
    btn.addEventListener('click', () => getExpenses(endpoint, targetTab, targetPane, p, pageSize));
    container.appendChild(btn);
  }

  // next button
  const next = document.createElement('button');
  next.innerText = 'Next';
  next.disabled = currentPage >= totalPages;
  next.addEventListener('click', () => getExpenses(endpoint, targetTab, targetPane, currentPage + 1, pageSize));
  container.appendChild(next);
}
