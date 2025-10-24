// State Management
let currentUser = null;
let events = [];
let tasks = [];
let expenses = [];
let vendors = [];
let activities = [];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    initializeForms();
    initializeDemoAccount();
    initializeAdminAccount();
    checkAuth();
});

// Add Demo Account Function
function initializeDemoAccount() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if demo account exists
    if (!users.find(u => u.email === 'demo@planitall.com')) {
        const demoUser = {
            id: 1,
            name: 'Demo User',
            email: 'demo@planitall.com',
            password: 'demo123',
            role: 'user'
        };
        users.push(demoUser);
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Initialize Admin Account
function initializeAdminAccount() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if admin account exists
    if (!users.find(u => u.email === 'admin@planitall.com')) {
        const adminUser = {
            id: 999,
            name: 'Administrator',
            email: 'admin@planitall.com',
            password: 'admin123',
            role: 'admin'
        };
        users.push(adminUser);
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// Local Storage Functions
function loadFromLocalStorage() {
    currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    events = JSON.parse(localStorage.getItem('events')) || [];
    tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    vendors = JSON.parse(localStorage.getItem('vendors')) || [];
    activities = JSON.parse(localStorage.getItem('activities')) || [];
}

function saveToLocalStorage() {
    localStorage.setItem('events', JSON.stringify(events));
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('vendors', JSON.stringify(vendors));
    localStorage.setItem('activities', JSON.stringify(activities));
}

// Authentication Functions
function checkAuth() {
    if (currentUser) {
        showDashboard();
    } else {
        showLanding();
    }
}

function initializeForms() {
    // Login Form
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            addActivity(`${user.name} logged in successfully`);
            showDashboard();
            // Clear form
            document.getElementById('loginForm').reset();
        } else {
            alert('Invalid email or password!\n\nDemo Account:\nEmail: demo@planitall.com\nPassword: demo123\n\nAdmin Account:\nEmail: admin@planitall.com\nPassword: admin123');
        }
    });

    // Register Form
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        // Get existing users
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        // Check if user already exists
        if (users.find(u => u.email === email)) {
            alert('User already exists!');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            role: 'user'
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Auto login
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        addActivity(`${name} created an account`);
        alert('Account created successfully! You are now logged in.');
        showDashboard();
        // Clear form
        document.getElementById('registerForm').reset();
    });

    // Event Form
    document.getElementById('eventForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createEvent();
    });

    // Task Form
    document.getElementById('taskForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createTask();
    });

    // Expense Form
    document.getElementById('expenseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createExpense();
    });

    // Vendor Form
    document.getElementById('vendorForm').addEventListener('submit', function(e) {
        e.preventDefault();
        createVendor();
    });

    // Search functionality
    document.getElementById('vendorSearch').addEventListener('input', function(e) {
        searchVendors(e.target.value);
    });

    // Filter functionality
    document.getElementById('taskEventFilter').addEventListener('change', function(e) {
        filterTasks(e.target.value);
    });

    document.getElementById('budgetEventFilter').addEventListener('change', function(e) {
        filterBudget(e.target.value);
    });
}

// Page Navigation Functions
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

function showLanding() {
    showPage('landingPage');
}

function showLogin() {
    showPage('loginPage');
}

function showRegister() {
    showPage('registerPage');
}

function showDashboard() {
    showPage('dashboard');
    document.getElementById('userName').textContent = currentUser.name;
    
    // Show admin menu item if user is admin
    if (currentUser.role === 'admin') {
        document.getElementById('adminMenuItem').style.display = 'flex';
    } else {
        document.getElementById('adminMenuItem').style.display = 'none';
    }
    
    updateDashboard();
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        addActivity(`${currentUser.name} logged out`);
        currentUser = null;
        localStorage.removeItem('currentUser');
        showLanding();
    }
}

// Dashboard Section Navigation
function showSection(sectionName) {
    // Check if admin section and user is not admin
    if (sectionName === 'admin' && currentUser.role !== 'admin') {
        alert('Access Denied! You do not have permission to access the Admin Panel.');
        return;
    }
    
    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        // Check if this is the clicked item
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(sectionName)) {
            item.classList.add('active');
        }
    });

    // Show selected section
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    const sectionElement = document.getElementById(sectionName + 'Section');
    if (sectionElement) {
        sectionElement.classList.add('active');
    }

    // Update section title
    const titles = {
        'overview': 'Dashboard Overview',
        'events': 'My Events',
        'tasks': 'Task Management',
        'budget': 'Budget Tracker',
        'vendors': 'Vendor Directory',
        'admin': 'Admin Panel'
    };
    document.getElementById('sectionTitle').textContent = titles[sectionName] || 'Dashboard';

    // Load section data
    switch(sectionName) {
        case 'overview':
            updateDashboard();
            break;
        case 'events':
            loadEvents();
            updateEventSelects();
            break;
        case 'tasks':
            loadTasks();
            updateEventSelects();
            break;
        case 'budget':
            loadBudget();
            updateEventSelects();
            break;
        case 'vendors':
            loadVendors();
            break;
        case 'admin':
            loadAdminDashboard();
            break;
    }
}

// Dashboard Functions
function updateDashboard() {
    document.getElementById('totalEvents').textContent = events.filter(e => e.userId === currentUser?.id).length;
    document.getElementById('totalTasks').textContent = tasks.filter(t => t.userId === currentUser?.id && !t.completed).length;
    
    const userEvents = events.filter(e => e.userId === currentUser?.id);
    const totalBudget = userEvents.reduce((sum, event) => sum + parseFloat(event.budget || 0), 0);
    document.getElementById('totalBudget').textContent = `$${totalBudget.toLocaleString()}`;
    
    document.getElementById('totalVendors').textContent = vendors.filter(v => v.userId === currentUser?.id).length;
    
    loadRecentActivities();
}

function loadRecentActivities() {
    const container = document.getElementById('recentActivities');
    if (!container) return;
    
    if (activities.length === 0) {
        container.innerHTML = '<p class="no-data">No recent activities</p>';
        return;
    }
    
    container.innerHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-bell"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text">${activity.text}</div>
                <div class="activity-time">${formatDate(activity.timestamp)}</div>
            </div>
        </div>
    `).join('');
}

// Event Management Functions
function showEventModal() {
    document.getElementById('eventModal').classList.add('active');
}

function createEvent() {
    const event = {
        id: Date.now(),
        name: document.getElementById('eventName').value,
        type: document.getElementById('eventType').value,
        date: document.getElementById('eventDate').value,
        budget: parseFloat(document.getElementById('eventBudget').value),
        description: document.getElementById('eventDescription').value,
        userId: currentUser.id
    };
    
    events.push(event);
    saveToLocalStorage();
    addActivity(`${currentUser.name} created event: ${event.name}`);
    closeModal('eventModal');
    loadEvents();
    updateEventSelects();
    updateDashboard();
}

function loadEvents() {
    const container = document.getElementById('eventsList');
    if (!container) return;
    
    const userEvents = events.filter(e => e.userId === currentUser?.id);
    
    if (userEvents.length === 0) {
        container.innerHTML = '<p class="no-data">No events created yet. Click "Create Event" to get started!</p>';
        return;
    }
    
    container.innerHTML = userEvents.map(event => `
        <div class="event-card">
            <div class="event-header">
                <h3 class="event-title">${event.name}</h3>
                <span class="event-type">${event.type}</span>
            </div>
            <div class="event-details">
                <p><i class="fas fa-calendar"></i> ${formatDate(event.date)}</p>
                <p><i class="fas fa-dollar-sign"></i> Budget: $${event.budget.toLocaleString()}</p>
                <p>${event.description || 'No description'}</p>
            </div>
            <div class="event-actions">
                <button class="btn-danger btn-small" onclick="deleteEvent(${event.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        const eventName = events.find(e => e.id === id)?.name;
        events = events.filter(e => e.id !== id);
        // Also delete related tasks and expenses
        tasks = tasks.filter(t => t.eventId !== id);
        expenses = expenses.filter(e => e.eventId !== id);
        saveToLocalStorage();
        addActivity(`${currentUser.name} deleted event: ${eventName}`);
        loadEvents();
        updateDashboard();
    }
}

function updateEventSelects() {
    const userEvents = events.filter(e => e.userId === currentUser?.id);
    const taskSelect = document.getElementById('taskEvent');
    const expenseSelect = document.getElementById('expenseEvent');
    const taskFilter = document.getElementById('taskEventFilter');
    const budgetFilter = document.getElementById('budgetEventFilter');
    
    const options = '<option value="">Select Event</option>' + 
        userEvents.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
    
    const filterOptions = '<option value="">All Events</option>' + 
        userEvents.map(e => `<option value="${e.id}">${e.name}</option>`).join('');
    
    if (taskSelect) taskSelect.innerHTML = options;
    if (expenseSelect) expenseSelect.innerHTML = options;
    if (taskFilter) taskFilter.innerHTML = filterOptions;
    if (budgetFilter) budgetFilter.innerHTML = filterOptions;
}

// Task Management Functions
function showTaskModal() {
    updateEventSelects();
    const userEvents = events.filter(e => e.userId === currentUser?.id);
    if (userEvents.length === 0) {
        alert('Please create an event first!');
        return;
    }
    document.getElementById('taskModal').classList.add('active');
}

function createTask() {
    const task = {
        id: Date.now(),
        title: document.getElementById('taskTitle').value,
        eventId: parseInt(document.getElementById('taskEvent').value),
        priority: document.getElementById('taskPriority').value,
        dueDate: document.getElementById('taskDueDate').value,
        completed: false,
        userId: currentUser.id
    };
    
    tasks.push(task);
    saveToLocalStorage();
    addActivity(`${currentUser.name} created task: ${task.title}`);
    closeModal('taskModal');
    loadTasks();
    updateDashboard();
}

function loadTasks(eventId = null) {
    const container = document.getElementById('tasksList');
    if (!container) return;
    
    let userTasks = tasks.filter(t => t.userId === currentUser?.id);
    
    if (eventId) {
        userTasks = userTasks.filter(t => t.eventId === parseInt(eventId));
    }
    
    if (userTasks.length === 0) {
        container.innerHTML = '<p class="no-data">No tasks created yet. Click "Add Task" to get started!</p>';
        return;
    }
    
    container.innerHTML = userTasks.map(task => {
        const event = events.find(e => e.id === task.eventId);
        return `
            <div class="task-item ${task.completed ? 'task-completed' : ''}">
                <input type="checkbox" class="task-checkbox" 
                    ${task.completed ? 'checked' : ''} 
                    onchange="toggleTask(${task.id})">
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        <span>${event ? event.name : 'No Event'}</span>
                        <span>Due: ${formatDate(task.dueDate)}</span>
                        <span class="task-priority priority-${task.priority.toLowerCase()}">${task.priority}</span>
                    </div>
                </div>
                <button class="btn-danger btn-small" onclick="deleteTask(${task.id})">Delete</button>
            </div>
        `;
    }).join('');
}

function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveToLocalStorage();
        addActivity(`${currentUser.name} ${task.completed ? 'completed' : 'reopened'} task: ${task.title}`);
        loadTasks();
        updateDashboard();
    }
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        const taskName = tasks.find(t => t.id === id)?.title;
        tasks = tasks.filter(t => t.id !== id);
        saveToLocalStorage();
        addActivity(`${currentUser.name} deleted task: ${taskName}`);
        loadTasks();
        updateDashboard();
    }
}

function filterTasks(eventId) {
    loadTasks(eventId);
}

// Budget Management Functions
function showExpenseModal() {
    updateEventSelects();
    const userEvents = events.filter(e => e.userId === currentUser?.id);
    if (userEvents.length === 0) {
        alert('Please create an event first!');
        return;
    }
    document.getElementById('expenseModal').classList.add('active');
}

function createExpense() {
    const expense = {
        id: Date.now(),
        name: document.getElementById('expenseName').value,
        eventId: parseInt(document.getElementById('expenseEvent').value),
        category: document.getElementById('expenseCategory').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        userId: currentUser.id
    };
    
    expenses.push(expense);
    saveToLocalStorage();
    addActivity(`${currentUser.name} added expense: ${expense.name} - $${expense.amount}`);
    closeModal('expenseModal');
    loadBudget();
}

function loadBudget(eventId = null) {
    let userExpenses = expenses.filter(e => e.userId === currentUser?.id);
    let userEvents = events.filter(e => e.userId === currentUser?.id);
    
    if (eventId) {
        userExpenses = userExpenses.filter(e => e.eventId === parseInt(eventId));
        userEvents = userEvents.filter(e => e.id === parseInt(eventId));
    }
    
    const totalBudget = userEvents.reduce((sum, event) => sum + event.budget, 0);
    const totalSpent = userExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remaining = totalBudget - totalSpent;
    
    document.getElementById('totalBudgetAmount').textContent = `$${totalBudget.toLocaleString()}`;
    document.getElementById('totalSpent').textContent = `$${totalSpent.toLocaleString()}`;
    document.getElementById('remaining').textContent = `$${remaining.toLocaleString()}`;
    
    const container = document.getElementById('expensesList');
    if (!container) return;
    
    if (userExpenses.length === 0) {
        container.innerHTML = '<h3>Expenses</h3><p class="no-data">No expenses recorded. Click "Add Expense" to track your spending!</p>';
        return;
    }
    
    container.innerHTML = '<h3>Expenses</h3>' + userExpenses.map(expense => {
        const event = events.find(e => e.id === expense.eventId);
        return `
            <div class="expense-item">
                <div class="expense-info">
                    <div class="expense-name">${expense.name}</div>
                    <div class="expense-category">${expense.category} • ${event ? event.name : 'No Event'}</div>
                </div>
                <div class="expense-amount">$${expense.amount.toLocaleString()}</div>
            </div>
        `;
    }).join('');
}

function filterBudget(eventId) {
    loadBudget(eventId);
}

// Vendor Management Functions
function showVendorModal() {
    document.getElementById('vendorModal').classList.add('active');
}

function createVendor() {
    const vendor = {
        id: Date.now(),
        name: document.getElementById('vendorName').value,
        type: document.getElementById('vendorType').value,
        phone: document.getElementById('vendorPhone').value,
        email: document.getElementById('vendorEmail').value,
        location: document.getElementById('vendorLocation').value,
        userId: currentUser.id
    };
    
    vendors.push(vendor);
    saveToLocalStorage();
    addActivity(`${currentUser.name} added vendor: ${vendor.name}`);
    closeModal('vendorModal');
    loadVendors();
    updateDashboard();
}

function loadVendors(searchTerm = '') {
    const container = document.getElementById('vendorsList');
    if (!container) return;
    
    let userVendors = vendors.filter(v => v.userId === currentUser?.id);
    
    if (searchTerm) {
        userVendors = userVendors.filter(v => 
            v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (v.location && v.location.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }
    
    if (userVendors.length === 0) {
        container.innerHTML = '<p class="no-data">No vendors found. Click "Add Vendor" to add your contacts!</p>';
        return;
    }
    
    container.innerHTML = userVendors.map(vendor => `
        <div class="vendor-card">
            <div class="vendor-type-badge">${vendor.type}</div>
            <h3 class="vendor-name">${vendor.name}</h3>
            <div class="vendor-details">
                <p><i class="fas fa-phone"></i> ${vendor.phone}</p>
                <p><i class="fas fa-envelope"></i> ${vendor.email || 'N/A'}</p>
                <p><i class="fas fa-map-marker-alt"></i> ${vendor.location || 'N/A'}</p>
            </div>
        </div>
    `).join('');
}

function searchVendors(term) {
    loadVendors(term);
}

// ADMIN FUNCTIONS
function loadAdminDashboard() {
    if (currentUser.role !== 'admin') {
        alert('Access Denied!');
        return;
    }
    
    const allUsers = JSON.parse(localStorage.getItem('users')) || [];
    const currentLoggedIn = JSON.parse(localStorage.getItem('currentUser'));
    
    // Update admin stats
    document.getElementById('adminTotalUsers').textContent = allUsers.length;
    document.getElementById('adminActiveUsers').textContent = currentLoggedIn ? 1 : 0;
    document.getElementById('adminTotalEvents').textContent = events.length;
    document.getElementById('adminTodayLogins').textContent = Math.floor(Math.random() * 10) + 1;
    
    // Load online users
    loadAdminOnlineUsers();
    
    // Load all users table
    loadAdminUsersTable();
    
    // Load activity logs
    loadAdminActivityLogs();
}

function loadAdminOnlineUsers() {
    const container = document.getElementById('adminOnlineUsers');
    const currentLoggedIn = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentLoggedIn) {
        container.innerHTML = '<p class="no-data">No users currently online</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="online-user-card">
            <div class="user-avatar-online">
                ${currentLoggedIn.name.charAt(0).toUpperCase()}
                <span class="online-dot"></span>
            </div>
            <div class="user-info-online">
                <h4>${currentLoggedIn.name}</h4>
                <p>Active Now • ${currentLoggedIn.email}</p>
            </div>
        </div>
    `;
}

function loadAdminUsersTable() {
    const allUsers = JSON.parse(localStorage.getItem('users')) || [];
    const tbody = document.getElementById('adminUsersTableBody');
    const currentLoggedIn = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!tbody) return;
    
    if (allUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No users registered</td></tr>';
        return;
    }
    
    tbody.innerHTML = allUsers.map(user => {
        const userEvents = events.filter(e => e.userId === user.id).length;
        const userTasks = tasks.filter(t => t.userId === user.id).length;
        const isOnline = currentLoggedIn && currentLoggedIn.id === user.id;
        
        return `
            <tr>
                <td>#${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <span class="status-badge ${isOnline ? 'active' : 'inactive'}">
                        ${isOnline ? '🟢 Online' : '⚫ Offline'}
                    </span>
                </td>
                <td>${userEvents}</td>
                <td>${userTasks}</td>
                <td>
                    <button class="action-btn btn-view-admin" onclick="viewUserDetails(${user.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    ${user.role !== 'admin' ? `
                        <button class="action-btn btn-delete-admin" onclick="deleteUserByAdmin(${user.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

function loadAdminActivityLogs() {
    const container = document.getElementById('adminActivityLogs');
    
    if (activities.length === 0) {
        container.innerHTML = '<p class="no-data">No activity logs available</p>';
        return;
    }
    
    container.innerHTML = activities.slice(0, 20).map(activity => `
        <div class="log-item">
            <strong>Activity:</strong> ${activity.text}
            <br>
            <small style="color: #6b7280;">${formatDateTime(activity.timestamp)}</small>
        </div>
    `).join('');
}

function refreshAdminData() {
    const btn = event.target.closest('.btn-refresh');
    btn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Refreshing...';
    
    setTimeout(() => {
        loadAdminDashboard();
        btn.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh';
    }, 1000);
}

function searchAdminUsers() {
    const searchTerm = document.getElementById('adminUserSearch').value.toLowerCase();
    const allUsers = JSON.parse(localStorage.getItem('users')) || [];
    const tbody = document.getElementById('adminUsersTableBody');
    const currentLoggedIn = JSON.parse(localStorage.getItem('currentUser'));
    
    const filteredUsers = allUsers.filter(user => 
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    );
    
    if (filteredUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-data">No users found</td></tr>';
        return;
    }
    
    tbody.innerHTML = filteredUsers.map(user => {
        const userEvents = events.filter(e => e.userId === user.id).length;
        const userTasks = tasks.filter(t => t.userId === user.id).length;
        const isOnline = currentLoggedIn && currentLoggedIn.id === user.id;
        
        return `
            <tr>
                <td>#${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>
                    <span class="status-badge ${isOnline ? 'active' : 'inactive'}">
                        ${isOnline ? '🟢 Online' : '⚫ Offline'}
                    </span>
                </td>
                <td>${userEvents}</td>
                <td>${userTasks}</td>
                <td>
                    <button class="action-btn btn-view-admin" onclick="viewUserDetails(${user.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    ${user.role !== 'admin' ? `
                        <button class="action-btn btn-delete-admin" onclick="deleteUserByAdmin(${user.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    ` : ''}
                </td>
            </tr>
        `;
    }).join('');
}

function viewUserDetails(userId) {
    const allUsers = JSON.parse(localStorage.getItem('users')) || [];
    const user = allUsers.find(u => u.id === userId);
    
    if (!user) return;
    
    const userEvents = events.filter(e => e.userId === userId);
    const userTasks = tasks.filter(t => t.userId === userId);
    const userExpenses = expenses.filter(e => e.userId === userId);
    const userVendors = vendors.filter(v => v.userId === userId);
    
    const totalSpent = userExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    alert(`📊 User Details\n\n` +
          `👤 Name: ${user.name}\n` +
          `📧 Email: ${user.email}\n` +
          `🆔 User ID: ${user.id}\n` +
          `👑 Role: ${user.role}\n\n` +
          `📅 Events Created: ${userEvents.length}\n` +
          `✅ Tasks: ${userTasks.length}\n` +
          `💰 Total Expenses: $${totalSpent.toLocaleString()}\n` +
          `📞 Vendors: ${userVendors.length}`);
}

function deleteUserByAdmin(userId) {
    if (!confirm('⚠️ Are you sure you want to delete this user?\n\nThis will delete:\n• User account\n• All their events\n• All their tasks\n• All their expenses\n• All their vendors\n\nThis action cannot be undone!')) {
        return;
    }
    
    let allUsers = JSON.parse(localStorage.getItem('users')) || [];
    const user = allUsers.find(u => u.id === userId);
    
    if (!user) return;
    
    // Delete user
    allUsers = allUsers.filter(u => u.id !== userId);
    localStorage.setItem('users', JSON.stringify(allUsers));
    
    // Delete all user data
    events = events.filter(e => e.userId !== userId);
    tasks = tasks.filter(t => t.userId !== userId);
    expenses = expenses.filter(e => e.userId !== userId);
    vendors = vendors.filter(v => v.userId !== userId);
    
    saveToLocalStorage();
    
    addActivity(`Admin deleted user: ${user.name}`);
    
    alert('✅ User deleted successfully!');
    
    loadAdminDashboard();
}

// Utility Functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
    // Reset form
    const form = document.querySelector(`#${modalId} form`);
    if (form) form.reset();
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // seconds
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function addActivity(text) {
    activities.unshift({
        text,
        timestamp: new Date().toISOString()
    });
    // Keep only last 50 activities
    activities = activities.slice(0, 50);
    localStorage.setItem('activities', JSON.stringify(activities));
}

// Close modals when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}