document.addEventListener('DOMContentLoaded', async () => {
    const signUpForm = document.getElementById('signupForm');
    const signInForm = document.getElementById('loginForm');
    const expenseForm = document.getElementById('expenseForm');
    const logoutBtn = document.getElementById('logoutBtn');
    const resetForm = document.getElementById('resetEmail')
    const tabItems = document.querySelectorAll('.tab-item');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const currentSize1 = document.getElementById('pageSizeSelect');
    let currentSize;

    if (signUpForm) {
        signUpForm.addEventListener('submit', handleFormSubmit);
    }

    if (signInForm) {
        signInForm.addEventListener('submit', loginFormSubmit);
    }
    let paginationState = { pageSize: 3, page: 1 };

    if (currentSize1) {
        paginationState.pageSize = parseInt(currentSize1.value, 10) || 3;
        currentSize1.addEventListener('change', () => {
            paginationState.pageSize = parseInt(currentSize1.value, 10) || 3;
            paginationState.page = 1;

            const activeTabItem = document.querySelector('.tab-item.active') || document.querySelector('.tab-item');
            if (!activeTabItem) return;
            const targetTab = activeTabItem.dataset.tab;
            const targetPane = document.getElementById(targetTab);

            const isPremium = localStorage.getItem('isPremium') === '1';
            if (isPremium) {
                const tabEndpoints = { daily: 'daily', weekly: 'weekly', monthly: 'monthly' };
                const endpoint = tabEndpoints[targetTab];
                if (endpoint) {
                    getExpenses(endpoint, targetTab, targetPane, paginationState.page, paginationState.pageSize);
                }
            }
        });
    }

    tabItems.forEach(item => {
        item.addEventListener('click', () => {
            tabItems.forEach(i => i.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            item.classList.add('active');

            const targetTab = item.dataset.tab;
            const targetPane = document.getElementById(targetTab);

            if (targetPane) targetPane.classList.add('active');
            const isPremium = localStorage.getItem('isPremium') === '1';
            if (!isPremium) return;

            const tabEndpoints = { daily: 'daily', weekly: 'weekly', monthly: 'monthly' };
            const endpoint = tabEndpoints[targetTab];
            const pageSize = paginationState.pageSize || 3;
            paginationState.page = 1;
            getExpenses(endpoint, targetTab, targetPane, 1, pageSize);
        });
    });


    if (expenseForm) {
        expenseForm.addEventListener('submit', handleExpenseSubmit);

        const token = localStorage.getItem('token');
        if (!token) {
            alert('Please sign in to view your expenses.');
        } else {
            try {
                const statusResp = await axios.get('http://localhost:3000/payment/premium-status', {
                    headers: { "Authorization": `Bearer ${token}` }
                });

                const isPremium = statusResp?.data?.paymentStatus === 'Success';
                localStorage.setItem('isPremium', isPremium ? '1' : '0');

                const viewExpensesDiv = document.querySelector('.view-expenses'); // non-premium area

                if (isPremium) {
                    if (viewExpensesDiv) viewExpensesDiv.style.display = 'none';

                    displayPremiumFeatures();
                    removeGreyOut();

                    const activeTabItem = document.querySelector('.tab-item.active') || document.querySelector('.tab-item');
                    if (activeTabItem) activeTabItem.click();
                } else {
                    if (viewExpensesDiv) viewExpensesDiv.style.display = '';

                    const expensesResp = await axios.get('http://localhost:3000/expense/all', {
                        headers: { "Authorization": `Bearer ${token}` }
                    });

                    const expenseList = document.getElementById('expenseList');
                    if (expenseList) expenseList.innerHTML = '';

                    expensesResp.data.expenses.forEach(expense => {
                        displayExpense(expense);
                    });
                }
            } catch (err) {
                console.error('Error determining premium status or loading expenses:', err);
                try {
                    const fallbackResp = await axios.get('http://localhost:3000/expense/all', {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    const expenseList = document.getElementById('expenseList');
                    if (expenseList) expenseList.innerHTML = '';
                    fallbackResp.data.expenses.forEach(expense => displayExpense(expense));
                } catch (fallbackErr) {
                    console.error('Fallback load failed:', fallbackErr);
                }
            }
        }
    }



    if (logoutBtn) {
        logoutBtn.addEventListener('click', signout)
    }
    if (resetForm) {
        resetForm.addEventListener('submit', resetPass)
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


    const isPremium = localStorage.getItem('isPremium') === '1';


    const pageSizeSelect = document.getElementById('pageSizeSelect');
    const pageSize = (window.paginationState && window.paginationState.pageSize)
        || (pageSizeSelect ? parseInt(pageSizeSelect.value, 10) : 3);

    const activeTabItem = document.querySelector('.tab-item.active');
    const activeTab = activeTabItem ? activeTabItem.dataset.tab : 'daily';
    const targetPane = document.getElementById(activeTab);

    const data = {
        amount: event.target.amount.value,
        description: event.target.description.value,
        Notes: event.target.description.value
    };

    try {
        const response = await axios.post('http://localhost:3000/expense/add', data, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        console.log(response.data);
        clearError();

        if (isPremium) {
            const tabEndpoints = { daily: 'daily', weekly: 'weekly', monthly: 'monthly', all: 'all' };
            const endpoint = tabEndpoints[activeTab] || activeTab;

            if (!window.paginationState) window.paginationState = { page: 1, pageSize };
            window.paginationState.page = 1;
            window.paginationState.pageSize = pageSize;

            await getExpenses(endpoint, activeTab, targetPane, window.paginationState.page, window.paginationState.pageSize);

        } else {
            displayExpense(response.data.expense);
        }

        document.getElementById('expenseForm').reset();
    } catch (error) {
        console.error('Add expense error', error);
        displayError(error?.response?.data?.message || error.message);
        return;
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
    await axios.delete(`http://localhost:3000/expense/delete/${expenseId}`, { headers: { "Authorization": `Bearer ${token}` } })
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.error('Delete expense error', error);
        });
}

function displayPremiumFeatures() {
    const mainDiv = document.querySelector('.expense-container');
    if (!mainDiv) return;

    if (document.getElementById('premium-header')) return;

    const rentBut = document.getElementById('row');
    if (rentBut) rentBut.innerHTML = '';

    const header = document.createElement('div');
    header.id = 'premium-header';

    const premiumMsg = document.createElement('h2');
    premiumMsg.innerText = 'You are a Premium User!';

    const showScoreBtn = document.createElement('button');
    showScoreBtn.innerText = 'Show Leaderboard';
    showScoreBtn.addEventListener('click', () => {
        rentBut.innerHTML = '';
        leaderBoard();
    });

    header.appendChild(premiumMsg);
    header.appendChild(showScoreBtn);
    mainDiv.prepend(header);
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

function signout() {
    localStorage.clear();
    location.replace("loginPage.html")
}

async function resetPass(event) {
    event.preventDefault();

    const data = { email: event.target.email.value }
    const div = document.getElementById('reset')
    const para = document.createElement('p');

    try {
        const checkEmail = await axios.post('http://localhost:3000/user/reset', data);
        if (checkEmail.data.message) {
            para.innerText = `Reset link has been sent to the email: ${data.email}`
        }
        div.appendChild(para)
    } catch (error) {
        para.innerText = `${data.email} does not exist. Please if email entered is correct`
        div.appendChild(para)
    }
}
function removeGreyOut() {
    const premiumClass = document.querySelector('.premium-feature.premium-locked');
    premiumClass.classList.remove('premium-locked')
}

async function deleteExpensePremium(expenseId) {
    const token = localStorage.getItem('token');
    try {
        const resp = await axios.delete(`http://localhost:3000/expense/delete/${expenseId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        return resp.data;
    } catch (err) {
        console.error('Delete expense error', err);
    }
}


async function getExpenses(endpoint, targetTab, targetPane, page = 1, pageSize = 3) {
    const token = localStorage.getItem('token');
    if (!endpoint) return console.warn(`No endpoint for ${targetTab}`);

    try {
        const url = `http://localhost:3000/expense/${endpoint}?page=${page}&pageSize=${pageSize}`;
        const res = await axios.get(url, { headers: { "Authorization": `Bearer ${token}` } });

        const { expenses = [], total = 0, totalPages = 1 } = res.data;
        localStorage.setItem('totalPages', totalPages);

        targetPane.innerHTML = '';

        const h3 = document.createElement('h3');
        h3.textContent = targetTab.toUpperCase();
        targetPane.appendChild(h3);

        const ul = document.createElement('ul');
        ul.className = 'expense-list';
        targetPane.appendChild(ul);

        if (expenses.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No expenses found.';
            ul.appendChild(li);
        } else {
            for (const e of expenses) {
                const li = document.createElement('li');
                li.className = 'expense-row';
                li.dataset.id = e.id;

                const amountDiv = document.createElement('div');
                amountDiv.className = 'expense-amount';
                amountDiv.textContent = `₹${e.amount}`;
                li.appendChild(amountDiv);

                const descDiv = document.createElement('div');
                descDiv.className = 'expense-desc';
                descDiv.textContent = e.description;
                li.appendChild(descDiv);

                const catDiv = document.createElement('div');
                catDiv.className = 'expense-cat';
                catDiv.textContent = e.category;
                li.appendChild(catDiv);

                const btns = document.createElement('div');
                btns.className = 'expense-actions';

                const delBtn = document.createElement('button');
                delBtn.className = 'expense-delete-btn';
                delBtn.type = 'button';
                delBtn.textContent = 'Delete';

                delBtn.addEventListener('click', async () => {
                    if (!confirm('Delete this expense?')) return;

                    try {
                        await deleteExpensePremium(e.id);
                        const result = await getExpenses(endpoint, targetTab, targetPane, page, pageSize);
                        const currentExpenses = result.expenses || [];

                        if (currentExpenses.length === 0 && page > 1) {
                            await getExpenses(endpoint, targetTab, targetPane, page - 1, pageSize);
                        } else {
                            if (page > result.totalPages && result.totalPages >= 1) {
                                await getExpenses(endpoint, targetTab, targetPane, result.totalPages, pageSize);
                            }
                        }
                    } catch (err) {
                        console.error('Failed to delete expense', err);
                        alert('Could not delete expense. Try again.');
                    }
                });

                btns.appendChild(delBtn);

                li.appendChild(btns);
                ul.appendChild(li);
            }
        }
        const paginationDiv = document.createElement('div');
        paginationDiv.className = 'pagination';
        paginationDiv.id = `pagination-${endpoint}`;
        targetPane.appendChild(paginationDiv);

        renderPagination(endpoint, targetTab, targetPane, page, totalPages, pageSize);
        return { expenses, total, totalPages, page, pageSize };
    } catch (error) {
        console.error(`Error fetching ${targetTab}:`, error);
        targetPane.innerHTML = `<p style="color:red;">Error loading ${targetTab} data.</p>`;
        return { expenses: [], total: 0, totalPages: 1, page, pageSize };
    }
}



function renderPagination(endpoint, targetTab, targetPane, currentPage, totalPages, pageSize) {
    const container = document.getElementById(`pagination-${endpoint}`);
    if (!container) return;

    container.innerHTML = '';

    const prev = document.createElement('button');
    prev.innerText = 'Prev';
    prev.disabled = currentPage <= 1;
    prev.addEventListener('click', () => getExpenses(endpoint, targetTab, targetPane, currentPage - 1, pageSize));
    container.appendChild(prev);

    const windowSize = 5;
    let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
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

    const next = document.createElement('button');
    next.innerText = 'Next';
    next.disabled = currentPage >= totalPages;
    next.addEventListener('click', () => getExpenses(endpoint, targetTab, targetPane, currentPage + 1, pageSize));
    container.appendChild(next);
}