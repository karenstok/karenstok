
const API_BASE_URL = 'https://uas-farisv1.vercel.app';

// Format price helper
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Alert function
function showAlert(message, type = 'info') {
    const colors = {
        success: '#4CAF50',
        error: '#F44336',
        info: '#2196F3'
    };
    
    const alert = document.createElement('div');
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type]};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 90%;
        text-align: center;
        animation: slideDown 0.3s ease;
    `;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { opacity: 0; transform: translate(-50%, -20px); }
        to { opacity: 1; transform: translate(-50%, 0); }
    }
    @keyframes slideUp {
        from { opacity: 1; transform: translate(-50%, 0); }
        to { opacity: 0; transform: translate(-50%, -20px); }
    }
`;
document.head.appendChild(style);

// Check authentication
function checkAuth() {
    const username = localStorage.getItem('roblox_username');
    if (!username) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}
