// Login System for Soryn Solutions Order Tracker
class LoginSystem {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        const loginForm = document.getElementById('loginForm');
        const togglePassword = document.getElementById('togglePassword');
        const passwordInput = document.getElementById('password');

        // Login form submission
        loginForm.addEventListener('submit', (e) => this.handleLogin(e));

        // Password visibility toggle
        togglePassword.addEventListener('click', () => this.togglePasswordVisibility(passwordInput, togglePassword));

        // Enter key support
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginForm.dispatchEvent(new Event('submit'));
            }
        });
    }

    checkAuthStatus() {
        // Check if user is already logged in
        const isLoggedIn = localStorage.getItem('sorynLoggedIn');
        const loginTime = localStorage.getItem('sorynLoginTime');
        
        if (isLoggedIn && loginTime) {
            const currentTime = Date.now();
            const loginTimestamp = parseInt(loginTime);
            const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            
            // Check if session is still valid (24 hours)
            if (currentTime - loginTimestamp < sessionDuration) {
                this.redirectToMain();
                return;
            } else {
                // Session expired, clear storage
                this.logout();
            }
        }
    }

    handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const username = formData.get('username').trim();
        const password = formData.get('password');

        // Clear previous error
        this.showError('');

        // Validate credentials
        if (this.validateCredentials(username, password)) {
            this.login(username);
        } else {
            this.showError('Invalid username or password. Please try again.');
        }
    }

    validateCredentials(username, password) {
        // Default credentials - CHANGE THESE!
        const validCredentials = {
            'Hayze': 'Recolab41783?!$&@#*',
            'Addzify': 'Daddy6283!'
        };

        return validCredentials[username] === password;
    }

    login(username) {
        // Store login status
        localStorage.setItem('sorynLoggedIn', 'true');
        localStorage.setItem('sorynUsername', username);
        localStorage.setItem('sorynLoginTime', Date.now().toString());

        // Show success message briefly
        this.showSuccess('Login successful! Redirecting...');

        // Redirect to main application
        setTimeout(() => {
            this.redirectToMain();
        }, 1000);
    }

    logout() {
        localStorage.removeItem('sorynLoggedIn');
        localStorage.removeItem('sorynUsername');
        localStorage.removeItem('sorynLoginTime');
        
        // Redirect to login page
        window.location.href = 'login.html';
    }

    redirectToMain() {
        window.location.href = 'index.html';
    }

    togglePasswordVisibility(passwordInput, toggleButton) {
        const type = passwordInput.type === 'password' ? 'text' : 'password';
        passwordInput.type = type;
        
        const icon = toggleButton.querySelector('i');
        icon.className = type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.className = message ? 'error-message show' : 'error-message';
    }

    showSuccess(message) {
        const errorElement = document.getElementById('errorMessage');
        errorElement.textContent = message;
        errorElement.style.color = '#4caf50';
        errorElement.style.borderColor = '#4caf50';
        errorElement.style.background = 'rgba(76, 175, 80, 0.1)';
        errorElement.className = 'error-message show';
    }
}

// Initialize login system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new LoginSystem();
});

// Add logout function to global scope for use in main app
window.logout = function() {
    localStorage.removeItem('sorynLoggedIn');
    localStorage.removeItem('sorynUsername');
    localStorage.removeItem('sorynLoginTime');
    window.location.href = 'login.html';
}; 