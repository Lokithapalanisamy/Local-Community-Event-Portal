// Welcome message
console.log("Welcome to the Community Portal");

// Theme Toggle
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Update icon
    const icon = document.querySelector('.theme-toggle i');
    icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// Load saved theme
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        const icon = document.querySelector('.theme-toggle i');
        icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }

    // Show welcome message only once
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
        showNotification('Welcome to the Community Portal! The page has finished loading.');
        sessionStorage.setItem('hasSeenWelcome', 'true');
    }
});

// Notification System
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
} 