// Order Tracker Application
class OrderTracker {
    constructor() {
        this.checkAuthentication();
        this.orders = this.loadOrders();
        this.init();
    }

    checkAuthentication() {
        const isLoggedIn = localStorage.getItem('sorynLoggedIn');
        const loginTime = localStorage.getItem('sorynLoginTime');
        const username = localStorage.getItem('sorynUsername');
        
        console.log('Auth Check:', { isLoggedIn, loginTime, username });
        
        if (!isLoggedIn || !loginTime) {
            console.log('No login data found, redirecting to login');
            window.location.href = 'login.html';
            return;
        }
        
        const currentTime = Date.now();
        const loginTimestamp = parseInt(loginTime);
        const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
        
        console.log('Session check:', { currentTime, loginTimestamp, sessionDuration, timeDiff: currentTime - loginTimestamp });
        
        if (currentTime - loginTimestamp >= sessionDuration) {
            // Session expired
            console.log('Session expired, clearing data and redirecting');
            localStorage.removeItem('sorynLoggedIn');
            localStorage.removeItem('sorynUsername');
            localStorage.removeItem('sorynLoginTime');
            window.location.href = 'login.html';
            return;
        }
        
        console.log('Authentication successful');
    }

    init() {
        this.setupEventListeners();
        this.updateDashboard();
        this.renderOrders();
        this.setupServiceTypeHandling();
    }

    setupEventListeners() {
        const form = document.getElementById('orderForm');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Service type checkboxes - only allow one selection at a time
        const serviceTypeCheckboxes = document.querySelectorAll('input[name="serviceType"]');
        serviceTypeCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                // If this checkbox was checked, uncheck all others
                if (e.target.checked) {
                    serviceTypeCheckboxes.forEach(otherCheckbox => {
                        if (otherCheckbox !== e.target) {
                            otherCheckbox.checked = false;
                        }
                    });
                }
                this.handleServiceTypeChange();
            });
        });
    }

    setupServiceTypeHandling() {
        // Initial setup
        this.handleServiceTypeChange();
    }

    handleServiceTypeChange() {
        const serviceTypes = this.getSelectedServiceTypes();
        const activisionIdField = document.getElementById('activisionId');
        const quantityLabel = document.getElementById('quantityLabel');
        const quantityField = document.getElementById('quantity');

        // Check if Lobby Tool is selected
        const hasLobbyTool = serviceTypes.includes('lobbyTool');
        
        if (hasLobbyTool) {
            // Hide Activision ID field when Lobby Tool is selected
            activisionIdField.parentElement.style.display = 'none';
            activisionIdField.removeAttribute('required');
            activisionIdField.value = '';
            
            // Change label to "Number of Accounts"
            quantityLabel.textContent = 'Number of Accounts';
        } else {
            // Show Activision ID field for other service types
            activisionIdField.parentElement.style.display = 'block';
            activisionIdField.setAttribute('required', 'required');
            activisionIdField.value = '';
            
            // Change label back to "Number of Bot Lobbies"
            quantityLabel.textContent = 'Number of Bot Lobbies';
        }

        // Update quantity field placeholder and validation
        if (serviceTypes.length === 0) {
            quantityField.value = '';
        } else if (serviceTypes.includes('botLobbies')) {
            quantityField.value = '';
        } else if (serviceTypes.includes('lobbyTool')) {
            quantityField.value = '';
        } else {
            quantityField.value = '';
        }
    }

    getSelectedServiceTypes() {
        const checkboxes = document.querySelectorAll('input[name="serviceType"]:checked');
        return Array.from(checkboxes).map(cb => cb.value);
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const order = {
            id: Date.now(),
            discordUsername: formData.get('discordUsername'),
            activisionId: formData.get('activisionId'),
            serviceTypes: this.getSelectedServiceTypes(),
            quantity: parseInt(formData.get('quantity')) || 0,
            moneySpent: parseFloat(formData.get('moneySpent')) || 0,
            profit: parseFloat(formData.get('profit')) || 0,
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        };

        // Validate that at least one service type is selected
        if (order.serviceTypes.length === 0) {
            alert('Please select at least one service type.');
            return;
        }

        // Validate Activision ID is required for non-Lobby Tool services
        if (!order.serviceTypes.includes('lobbyTool') && !order.activisionId.trim()) {
            alert('Activision ID is required for this service type.');
            return;
        }

        this.addOrder(order);
        this.resetForm();
    }

    addOrder(order) {
        this.orders.unshift(order); // Add to beginning of array
        this.saveOrders();
        this.updateDashboard();
        this.renderOrders();
        
        // Show success message
        this.showNotification('Order added successfully!', 'success');
    }

    resetForm() {
        const form = document.getElementById('orderForm');
        form.reset();
        
        // Clear all input fields (placeholders will show)
        document.getElementById('discordUsername').value = '';
        document.getElementById('activisionId').value = '';
        document.getElementById('quantity').value = '';
        document.getElementById('moneySpent').value = '';
        document.getElementById('profit').value = '';
        
        // Check Bot Lobbies by default
        const botLobbiesCheckbox = document.querySelector('input[value="botLobbies"]');
        botLobbiesCheckbox.checked = true;
        
        // Uncheck others
        document.querySelectorAll('input[name="serviceType"]:not([value="botLobbies"])').forEach(cb => {
            cb.checked = false;
        });
        
        this.handleServiceTypeChange();
    }

    updateDashboard() {
        const totalProfit = this.orders.reduce((sum, order) => sum + order.profit, 0);
        const totalLobbies = this.orders.reduce((sum, order) => sum + order.quantity, 0);
        const uniqueCustomers = new Set(this.orders.map(order => order.discordUsername)).size;

        document.getElementById('totalProfit').textContent = `$${totalProfit.toFixed(2)}`;
        document.getElementById('totalLobbies').textContent = totalLobbies;
        document.getElementById('totalCustomers').textContent = uniqueCustomers;
    }

    renderOrders() {
        const ordersList = document.getElementById('ordersList');
        ordersList.innerHTML = '';

        if (this.orders.length === 0) {
            ordersList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No orders yet. Add your first order above!</p>';
            return;
        }

        this.orders.forEach(order => {
            const orderElement = this.createOrderElement(order);
            ordersList.appendChild(orderElement);
        });
    }

    createOrderElement(order) {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item';
        
        const serviceTypeLabels = {
            'botLobbies': 'Bot Lobbies',
            'lobbyTool': 'Lobby Tool',
            'other': 'Other'
        };

        const serviceBadges = order.serviceTypes.map(type => 
            `<span class="service-badge">${serviceTypeLabels[type]}</span>`
        ).join('');

        orderDiv.innerHTML = `
            <div class="order-header">
                <div class="order-customer">${order.discordUsername}</div>
                <div class="order-date">${order.date}</div>
            </div>
            <div class="order-details">
                ${order.activisionId ? `
                    <div class="order-detail">
                        <div class="order-detail-label">Activision ID</div>
                        <div class="order-detail-value">${order.activisionId}</div>
                    </div>
                ` : ''}
                <div class="order-detail">
                    <div class="order-detail-label">${order.serviceTypes.includes('lobbyTool') ? 'Accounts' : 'Lobbies'}</div>
                    <div class="order-detail-value">${order.quantity}</div>
                </div>
                <div class="order-detail">
                    <div class="order-detail-label">Money Spent</div>
                    <div class="order-detail-value">$${order.moneySpent.toFixed(2)}</div>
                </div>
                <div class="order-detail">
                    <div class="order-detail-label">Profit</div>
                    <div class="order-detail-value">$${order.profit.toFixed(2)}</div>
                </div>
            </div>
            <div class="order-service-types">
                ${serviceBadges}
            </div>
            <button onclick="orderTracker.deleteOrder(${order.id})" style="
                background: #f44336;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                margin-top: 10px;
            ">Delete</button>
        `;

        return orderDiv;
    }

    deleteOrder(orderId) {
        if (confirm('Are you sure you want to delete this order?')) {
            this.orders = this.orders.filter(order => order.id !== orderId);
            this.saveOrders();
            this.updateDashboard();
            this.renderOrders();
            this.showNotification('Order deleted successfully!', 'success');
        }
    }

    saveOrders() {
        localStorage.setItem('sorynOrders', JSON.stringify(this.orders));
    }

    loadOrders() {
        const saved = localStorage.getItem('sorynOrders');
        return saved ? JSON.parse(saved) : [];
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : '#2196f3'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.orderTracker = new OrderTracker();
});

// Add logout function to global scope
window.logout = function() {
    // Clear all authentication data
    localStorage.removeItem('sorynLoggedIn');
    localStorage.removeItem('sorynUsername');
    localStorage.removeItem('sorynLoginTime');
    
    // Show logout message
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff0000;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(255, 0, 0, 0.5);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = 'Logging out...';
    document.body.appendChild(notification);
    
    // Redirect to login page after brief delay
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
};

// Add slideOut animation
const slideOutStyle = document.createElement('style');
slideOutStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(slideOutStyle); 