// Data Paket Robux
const PACKAGES = {
    beforeTax: [
        { name: "Starter", robux: 100, price: 8500, isAfterTax: false },
        { name: "Basic", robux: 300, price: 25500, isAfterTax: false },
        { name: "Medium", robux: 500, price: 42500, isAfterTax: false },
        { name: "Large", robux: 1000, price: 85000, isAfterTax: false },
        { name: "XL", robux: 2000, price: 170000, isAfterTax: false },
        { name: "XXL", robux: 3000, price: 255000, isAfterTax: false },
        { name: "Mega", robux: 4000, price: 340000, isAfterTax: false },
        { name: "Ultra", robux: 5000, price: 425000, isAfterTax: false },
        { name: "Super", robux: 6000, price: 510000, isAfterTax: false },
        { name: "Extreme", robux: 7000, price: 595000, isAfterTax: false },
        { name: "Premium", robux: 8000, price: 680000, isAfterTax: false },
        { name: "Diamond", robux: 9000, price: 765000, isAfterTax: false },
        { name: "Legend", robux: 10000, price: 850000, isAfterTax: false }
    ],
    afterTax: [
        { name: "Starter", robux: 100, price: 12143, isAfterTax: true },
        { name: "Basic", robux: 300, price: 36429, isAfterTax: true },
        { name: "Medium", robux: 500, price: 60714, isAfterTax: true },
        { name: "Large", robux: 1000, price: 121429, isAfterTax: true },
        { name: "XL", robux: 2000, price: 242857, isAfterTax: true },
        { name: "XXL", robux: 3000, price: 364286, isAfterTax: true },
        { name: "Mega", robux: 4000, price: 485714, isAfterTax: true },
        { name: "Ultra", robux: 5000, price: 607143, isAfterTax: true },
        { name: "Super", robux: 6000, price: 728571, isAfterTax: true },
        { name: "Extreme", robux: 7000, price: 850000, isAfterTax: true },
        { name: "Premium", robux: 8000, price: 971429, isAfterTax: true },
        { name: "Diamond", robux: 9000, price: 1092857, isAfterTax: true },
        { name: "Legend", robux: 10000, price: 1214286, isAfterTax: true }
    ]
};

// Banner Data
const BANNERS = [
    { icon: 'flash_on', color: '#FF9800', title: 'Proses Cepat', subtitle: '5-10 menit' },
    { icon: 'verified_user', color: '#4CAF50', title: '100% Aman', subtitle: 'Terpercaya' },
    { icon: 'support_agent', color: '#2196F3', title: 'CS 24/7', subtitle: 'Siap Membantu' },
    { icon: 'local_offer', color: '#F44336', title: 'Harga Terbaik', subtitle: 'Termurah' },
    { icon: 'stars', color: '#9C27B0', title: 'Rating 4.9', subtitle: '1000+ Order' }
];

// State Management
let currentUser = {
    username: '',
    userId: null,
    avatarUrl: ''
};

let selectedGame = 'escape-braintrot'; // Default game
let selectedPackage = null;
let orderData = {
    username: '',
    gamepassLink: '',
    uniqueCode: 0,
    totalPayment: 0
};

let selectedPaymentMethod = '';
let paymentTimer = null;
let remainingSeconds = 180;

// API Service
const API_BASE_URL = 'https://uas-farisv1.vercel.app';

async function verifyUsername(username) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/verify?username=${encodeURIComponent(username)}`);
        const data = await response.json();
        
        if (response.ok && data.valid) {
            return {
                valid: true,
                username: data.username,
                userId: data.userId,
                displayName: data.displayName,
                verified: data.verified || false
            };
        }
        
        return {
            valid: false,
            message: data.message || 'Username tidak ditemukan'
        };
    } catch (error) {
        console.error('API Error:', error);
        return {
            valid: false,
            message: 'Gagal terhubung ke server. Cek koneksi internet kamu.'
        };
    }
}

async function fetchAvatar(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/avatar?userId=${userId}`);
        const data = await response.json();
        
        if (response.ok && data.success && data.avatarUrl) {
            return data.avatarUrl;
        }
        return null;
    } catch (error) {
        console.error('Avatar fetch error:', error);
        return null;
    }
}

// Local Storage Helper
function saveUserData(userData) {
    localStorage.setItem('roblox_username', userData.username);
    localStorage.setItem('roblox_user_id', userData.userId);
    if (userData.avatarUrl) {
        localStorage.setItem('roblox_avatar_url', userData.avatarUrl);
    }
}

function loadUserData() {
    return {
        username: localStorage.getItem('roblox_username') || '',
        userId: localStorage.getItem('roblox_user_id') || null,
        avatarUrl: localStorage.getItem('roblox_avatar_url') || ''
    };
}

function clearUserData() {
    localStorage.clear();
}

// Format Helper
function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Page Navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
}

// Login Functionality
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const usernameInput = document.getElementById('usernameInput');
    const username = usernameInput.value.trim();
    const loginBtn = document.getElementById('loginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const loginSpinner = document.getElementById('loginSpinner');
    
    if (!username) {
        showAlert('Username tidak boleh kosong', 'error');
        return;
    }
    
    // Disable button and show spinner
    loginBtn.disabled = true;
    loginBtnText.style.display = 'none';
    loginSpinner.style.display = 'block';
    
    try {
        const result = await verifyUsername(username);
        
        if (result.valid) {
            currentUser.username = result.username;
            currentUser.userId = result.userId;
            
            // Fetch avatar
            if (result.userId) {
                const avatarUrl = await fetchAvatar(result.userId);
                if (avatarUrl) {
                    currentUser.avatarUrl = avatarUrl;
                }
            }
            
            // Save to localStorage
            saveUserData(currentUser);
            
            // Show home page
            showAlert('Login berhasil! Selamat datang ' + result.username, 'success');
            setTimeout(() => {
                initHomePage();
                showPage('homePage');
            }, 500);
        } else {
            showAlert(result.message, 'error');
        }
    } catch (error) {
        showAlert('Terjadi kesalahan. Silakan coba lagi.', 'error');
    } finally {
        loginBtn.disabled = false;
        loginBtnText.style.display = 'block';
        loginSpinner.style.display = 'none';
    }
});

// Home Page Initialization
function initHomePage() {
    currentUser = loadUserData();
    
    // Set user info
    document.getElementById('welcomeUsername').textContent = currentUser.username;
    document.getElementById('dropdownUsername').textContent = currentUser.username;
    
    // Set avatars
    const avatarElements = [
        document.getElementById('userAvatar'),
        document.getElementById('welcomeAvatar'),
        document.getElementById('dropdownAvatar')
    ];
    
    avatarElements.forEach(el => {
        if (currentUser.avatarUrl) {
            el.src = currentUser.avatarUrl;
            el.style.display = 'block';
        } else {
            el.src = '';
            el.alt = currentUser.username[0].toUpperCase();
        }
    });
    
    // Render banners
    renderBanners();
    
    // Render packages
    renderPackages('beforeTax', 'beforeTaxGrid');
    renderPackages('afterTax', 'afterTaxGrid');
    
    // Setup tabs
    setupTabs();
    
    // Setup game selection
    setupGameSelection();
    
    // Setup user menu
    setupUserMenu();
}

// Render Banners
function renderBanners() {
    const carousel = document.getElementById('bannerCarousel');
    carousel.innerHTML = BANNERS.map(banner => `
        <div class="banner-card">
            <div class="banner-icon" style="background: ${banner.color};">
                <span class="material-symbols-outlined">${banner.icon}</span>
            </div>
            <div>
                <div class="banner-title">${banner.title}</div>
                <div class="banner-subtitle">${banner.subtitle}</div>
            </div>
        </div>
    `).join('');
    
    // Auto scroll
    let index = 0;
    setInterval(() => {
        index = (index + 1) % BANNERS.length;
        carousel.scrollTo({
            left: index * (carousel.offsetWidth * 0.92),
            behavior: 'smooth'
        });
    }, 3000);
}

// Render Packages
function renderPackages(type, containerId) {
    const container = document.getElementById(containerId);
    const packages = PACKAGES[type];
    
    container.innerHTML = packages.map(pkg => `
        <div class="package-card" onclick='selectPackage(${JSON.stringify(pkg)})'>
            <div class="package-icon">
                <span class="material-symbols-outlined">monetization_on</span>
            </div>
            <div class="package-robux">${pkg.robux} Robux</div>
            <div class="package-price">Rp ${formatPrice(pkg.price)}</div>
            <span class="badge ${pkg.isAfterTax ? 'after-tax' : 'before-tax'}">
                ${pkg.isAfterTax ? 'After Tax' : 'Before Tax'}
            </span>
        </div>
    `).join('');
}

// Setup Tabs
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabName = tab.dataset.tab;
            document.getElementById('beforeTaxContent').style.display = 
                tabName === 'beforeTax' ? 'block' : 'none';
            document.getElementById('afterTaxContent').style.display = 
                tabName === 'afterTax' ? 'block' : 'none';
        });
    });
}

// Setup Game Selection
function setupGameSelection() {
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove active from all cards
            gameCards.forEach(c => c.classList.remove('active'));
            
            // Add active to clicked card
            card.classList.add('active');
            
            // Update selected game
            selectedGame = card.dataset.game;
            
            console.log('Selected game:', selectedGame);
        });
    });
}

// Setup User Menu
function setupUserMenu() {
    const userMenu = document.getElementById('userMenu');
    const dropdown = document.getElementById('dropdownMenu');
    
    userMenu.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    
    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
    });
}

// Select Package
function selectPackage(pkg) {
    selectedPackage = pkg;
    showDetailPage();
}

// Detail Page
function showDetailPage() {
    const gamepassPrice = selectedPackage.isAfterTax 
        ? Math.round(selectedPackage.robux / 0.7)
        : selectedPackage.robux;
    
    // Display game name
    const gameName = selectedGame === 'escape-braintrot' ? 'Escape Braintrot' : 'Steal a Braintrot';
    
    document.getElementById('detailRobux').textContent = `${selectedPackage.robux} Robux`;
    document.getElementById('detailPrice').textContent = `Rp ${formatPrice(selectedPackage.price)}`;
    document.getElementById('detailPriceValue').textContent = `Rp ${formatPrice(selectedPackage.price)}`;
    
    const badge = document.getElementById('detailBadge');
    badge.textContent = selectedPackage.isAfterTax ? 'After Tax' : 'Before Tax';
    badge.className = `badge ${selectedPackage.isAfterTax ? 'after-tax' : 'before-tax'}`;
    
    // Rules
    const rules = [
        `Game: ${gameName}`,
        'Pastikan username Roblox kamu benar',
        'Siapkan link gamepass yang sudah dibuat'
    ];
    
    if (selectedPackage.isAfterTax) {
        rules.push({
            text: `Set harga gamepass sebesar ${gamepassPrice} Robux (akan dapat ${selectedPackage.robux} Robux setelah pajak)`,
            highlight: true
        });
    } else {
        rules.push({
            text: `Set harga gamepass sebesar ${selectedPackage.robux} Robux`,
            highlight: true
        });
    }
    
    rules.push('Robux akan masuk setelah pembayaran dikonfirmasi');
    
    if (selectedPackage.isAfterTax) {
        rules.push(`Kamu akan menerima ${selectedPackage.robux} Robux (sudah dipotong pajak)`);
    } else {
        rules.push(`Robux akan dipotong pajak 30% oleh Roblox, kamu akan dapat ${Math.round(selectedPackage.robux * 0.7)} Robux`);
    }
    
    const rulesList = document.getElementById('detailRules');
    rulesList.innerHTML = rules.map(rule => {
        if (typeof rule === 'object') {
            return `<li class="highlight">${rule.text}</li>`;
        }
        return `<li>${rule}</li>`;
    }).join('');
    
    showPage('detailPage');
}

// Show Order Page
function showOrderPage() {
    const gameName = selectedGame === 'escape-braintrot' ? 'Escape Braintrot' : 'Steal a Braintrot';
    
    document.getElementById('orderGame').textContent = gameName;
    document.getElementById('orderRobux').textContent = `${selectedPackage.robux} Robux`;
    document.getElementById('orderPrice').textContent = `Rp ${formatPrice(selectedPackage.price)}`;
    
    const orderBadge = document.getElementById('orderBadge');
    orderBadge.textContent = selectedPackage.isAfterTax ? 'After Tax' : 'Before Tax';
    orderBadge.className = `badge ${selectedPackage.isAfterTax ? 'after-tax' : 'before-tax'}`;
    
    document.getElementById('orderUsername').value = currentUser.username;
    document.getElementById('gamepassInput').value = '';
    
    showPage('orderPage');
}

// Submit Order
function submitOrder() {
    const gamepassLink = document.getElementById('gamepassInput').value.trim();
    
    if (!gamepassLink) {
        showAlert('Link gamepass wajib diisi', 'error');
        return;
    }
    
    if (!gamepassLink.includes('roblox.com')) {
        showAlert('Link harus dari roblox.com', 'error');
        return;
    }
    
    orderData.username = currentUser.username;
    orderData.gamepassLink = gamepassLink;
    orderData.uniqueCode = 10 + (Date.now() % 90);
    orderData.totalPayment = selectedPackage.price + orderData.uniqueCode;
    
    showPaymentPage();
}

// Payment Page
function showPaymentPage() {
    const gameName = selectedGame === 'escape-braintrot' ? 'Escape Braintrot' : 'Steal a Braintrot';
    
    document.getElementById('paymentGame').textContent = gameName;
    document.getElementById('paymentUsername').textContent = orderData.username;
    document.getElementById('paymentRobux').textContent = `${selectedPackage.robux} Robux`;
    document.getElementById('paymentPrice').textContent = `Rp ${formatPrice(selectedPackage.price)}`;
    document.getElementById('paymentCode').textContent = `Rp ${orderData.uniqueCode}`;
    document.getElementById('paymentTotal').textContent = `Rp ${formatPrice(orderData.totalPayment)}`;
    
    renderPaymentMethods();
    showPage('paymentPage');
}

// Render Payment Methods
function renderPaymentMethods() {
    const paymentMethods = {
        'E-Wallet': [
            { name: 'DANA', icon: 'account_balance_wallet', color: '#2196F3' }
        ],
        'Transfer Bank': [
            { name: 'BCA', icon: 'account_balance', color: '#2196F3' },
            { name: 'SEABANK', icon: 'account_balance', color: '#FF9800' }
        ],
        'QRIS': [
            { name: 'QRIS', icon: 'qr_code', color: '#F44336' }
        ]
    };
    
    const container = document.getElementById('paymentMethods');
    container.innerHTML = Object.entries(paymentMethods).map(([category, methods]) => `
        <div class="payment-category" id="category-${category.replace(/\s+/g, '-')}">
            <div class="category-header" onclick="toggleCategory('${category}')">
                <div class="category-icon" style="background: ${getCategoryColor(category)}20;">
                    <span class="material-symbols-outlined" style="color: ${getCategoryColor(category)};">
                        ${getCategoryIcon(category)}
                    </span>
                </div>
                <div class="category-title">${category}</div>
                <span class="material-symbols-outlined">keyboard_arrow_down</span>
            </div>
            <div class="payment-methods" id="methods-${category.replace(/\s+/g, '-')}" style="display: none;">
                ${methods.map(method => `
                    <div class="payment-method" onclick="selectPaymentMethod('${method.name}', '${category}')">
                        <span class="material-symbols-outlined" style="color: ${method.color};">
                            ${method.icon}
                        </span>
                        <span>${method.name}</span>
                        <span style="flex: 1;"></span>
                        <span class="material-symbols-outlined check-icon" style="display: none;">check_circle</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function getCategoryIcon(category) {
    const icons = {
        'E-Wallet': 'account_balance_wallet',
        'Transfer Bank': 'account_balance',
        'QRIS': 'qr_code'
    };
    return icons[category] || 'payment';
}

function getCategoryColor(category) {
    const colors = {
        'E-Wallet': '#2196F3',
        'Transfer Bank': '#FF9800',
        'QRIS': '#F44336'
    };
    return colors[category] || '#757575';
}

function toggleCategory(category) {
    const methodsId = `methods-${category.replace(/\s+/g, '-')}`;
    const methods = document.getElementById(methodsId);
    const isVisible = methods.style.display !== 'none';
    
    // Close all categories
    document.querySelectorAll('.payment-methods').forEach(el => {
        el.style.display = 'none';
    });
    
    // Toggle current category
    methods.style.display = isVisible ? 'none' : 'block';
}

function selectPaymentMethod(methodName, category) {
    selectedPaymentMethod = methodName;
    
    // Update UI
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
        el.querySelector('.check-icon').style.display = 'none';
    });
    
    event.currentTarget.classList.add('selected');
    event.currentTarget.querySelector('.check-icon').style.display = 'block';
    
    // Show payment details
    showPaymentDetails(methodName);
    
    // Enable confirm button
    const confirmBtn = document.getElementById('confirmPaymentBtn');
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Konfirmasi & Kirim Bukti';
}

function showPaymentDetails(methodName) {
    const details = {
        'BCA': { type: 'bank', number: '8001088751', name: 'M.FARIS KOTO' },
        'SEABANK': { type: 'bank', number: '901997504760', name: 'M.FARIS KOTO' },
        'DANA': { type: 'ewallet', number: '081264238311', name: 'John Doe' },
        'QRIS': { type: 'qris' }
    };
    
    const detail = details[methodName];
    const container = document.getElementById('paymentDetails');
    
    if (detail.type === 'bank' || detail.type === 'ewallet') {
        container.innerHTML = `
            <div class="timer-bar">
                <span class="material-symbols-outlined">schedule</span>
                <span id="paymentTimer">03:00</span>
            </div>
            <div class="detail-item">
                <div class="detail-label">${detail.type === 'bank' ? 'Nomor Rekening' : 'Nomor E-Wallet'}</div>
                <div class="detail-value">
                    <span>${detail.number}</span>
                    <button class="copy-btn" onclick="copyToClipboard('${detail.number}')">Salin</button>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Nama Penerima</div>
                <div class="detail-value">
                    <span>${detail.name}</span>
                </div>
            </div>
            <div class="detail-item">
                <div class="detail-label">Total Transfer</div>
                <div class="detail-value">
                    <span style="color: var(--success); font-size: 18px; font-weight: 700;">Rp ${formatPrice(orderData.totalPayment)}</span>
                    <button class="copy-btn" onclick="copyToClipboard('${orderData.totalPayment}')">Salin</button>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="timer-bar">
                <span class="material-symbols-outlined">schedule</span>
                <span id="paymentTimer">03:00</span>
            </div>
            <div class="detail-item">
                <div class="detail-label">Scan QRIS</div>
                <div style="text-align: center; padding: 20px;">
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 12px; display: inline-block;">
                        <span class="material-symbols-outlined" style="font-size: 120px; color: var(--text-secondary);">qr_code_scanner</span>
                        <p style="margin-top: 12px; color: var(--text-secondary);">Hubungi admin untuk QRIS</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    container.style.display = 'block';
    startPaymentTimer();
}

function startPaymentTimer() {
    if (paymentTimer) clearInterval(paymentTimer);
    
    remainingSeconds = 180;
    paymentTimer = setInterval(() => {
        remainingSeconds--;
        
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        const timerEl = document.getElementById('paymentTimer');
        
        if (timerEl) {
            timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (remainingSeconds <= 0) {
            clearInterval(paymentTimer);
            showAlert('Waktu pembayaran habis. Silakan pilih ulang metode pembayaran.', 'error');
            document.getElementById('paymentDetails').style.display = 'none';
            selectedPaymentMethod = '';
            document.getElementById('confirmPaymentBtn').disabled = true;
            document.getElementById('confirmPaymentBtn').textContent = 'Pilih Metode Pembayaran';
        }
    }, 1000);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showAlert('Berhasil disalin!', 'success');
    });
}

function confirmPayment() {
    const adminNumber = '6289527435865';
    const now = new Date();
    const tanggal = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    const waktu = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} WIB`;
    
    const gameName = selectedGame === 'escape-braintrot' ? 'Escape Braintrot' : 'Steal a Braintrot';
    
    const message = `🎮 ORDER TOP UP ROBUX 🎮
━━━━━━━━━━━━━━━━━━━━
📅 Tanggal: ${tanggal}
🕐 Waktu: ${waktu}
🎯 Game: ${gameName}
👤 Username: ${orderData.username}
💎 Paket: ${selectedPackage.robux} Robux
📦 Tipe: ${selectedPackage.isAfterTax ? 'After Tax' : 'Before Tax'}
💰 Harga: Rp ${formatPrice(selectedPackage.price)}
🔢 Kode Unik: Rp ${orderData.uniqueCode}
💳 Total Bayar: Rp ${formatPrice(orderData.totalPayment)}
🎯 Gamepass: ${orderData.gamepassLink}
💳 Pembayaran: ${selectedPaymentMethod}
━━━━━━━━━━━━━━━━━━━━
✅ Saya sudah melakukan transfer
Mohon diproses kak 🙏

*Silakan kirim bukti transfer*`;
    
    const url = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    
    setTimeout(() => {
        showPage('successPage');
    }, 500);
}

function backToHome() {
    showPage('homePage');
    selectedPackage = null;
    orderData = {
        username: '',
        gamepassLink: '',
        uniqueCode: 0,
        totalPayment: 0
    };
}

// Profile Page
function showProfile() {
    document.getElementById('profileUsername').textContent = currentUser.username;
    document.getElementById('profileId').textContent = `ID: ${currentUser.userId || 'N/A'}`;
    
    const profileAvatar = document.getElementById('profileAvatar');
    if (currentUser.avatarUrl) {
        profileAvatar.src = currentUser.avatarUrl;
    } else {
        profileAvatar.alt = currentUser.username[0].toUpperCase();
    }
    
    showPage('profilePage');
}

function refreshAvatar() {
    if (currentUser.userId) {
        fetchAvatar(currentUser.userId).then(avatarUrl => {
            if (avatarUrl) {
                currentUser.avatarUrl = avatarUrl;
                saveUserData(currentUser);
                showAlert('Avatar berhasil diperbarui!', 'success');
                
                // Update all avatars
                document.querySelectorAll('[id$="Avatar"]').forEach(el => {
                    el.src = avatarUrl;
                });
            }
        });
    }
}

function showAbout() {
    showModal('Tentang Aplikasi', `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 48px; margin-bottom: 16px;">💎</div>
            <h3>Top Up Robux</h3>
            <p style="color: var(--text-secondary); margin: 8px 0;">Versi 1.0.0</p>
            <p style="margin-top: 16px;">Aplikasi top up Robux yang cepat, aman, dan terpercaya.</p>
        </div>
    `, `<button class="btn-primary" onclick="closeModal()">Tutup</button>`);
}

function handleLogout() {
    showModal('Konfirmasi Logout', `
        <p>Apakah kamu yakin ingin keluar?</p>
    `, `
        <button class="btn-outline" onclick="closeModal()" style="margin-right: 8px;">Batal</button>
        <button class="btn-logout" onclick="confirmLogout()">Logout</button>
    `);
}

function confirmLogout() {
    clearUserData();
    closeModal();
    showAlert('Logout berhasil', 'success');
    setTimeout(() => {
        showPage('loginPage');
        document.getElementById('usernameInput').value = '';
    }, 500);
}

// Gamepass Guide
function showGamepassGuide() {
    const gamepassPrice = selectedPackage.isAfterTax 
        ? Math.round(selectedPackage.robux / 0.7)
        : selectedPackage.robux;
    
    const steps = [
        { icon: 'language', color: '#2196F3', title: '1. Buka Website Roblox', desc: 'Buka www.roblox.com dan login ke akun kamu' },
        { icon: 'create', color: '#4CAF50', title: '2. Menu Create', desc: 'Klik \'Create\' di bagian atas atau kunjungi roblox.com/create' },
        { icon: 'gamepad', color: '#FF9800', title: '3. Pilih Game', desc: 'Pilih game yang ingin kamu buat gamepass, lalu klik tab \'Store\' atau \'Associated Items\'' },
        { icon: 'add_circle', color: '#9C27B0', title: '4. Create Pass', desc: 'Klik \'Create Pass\', upload gambar (512x512px), beri nama' },
        { icon: 'monetization_on', color: '#F44336', title: '5. Set Harga', desc: `Aktifkan 'for sale', set harga gamepass sebesar ${gamepassPrice} Robux` },
        { icon: 'link', color: '#00BCD4', title: '6. Salin Link', desc: 'Klik gamepass, salin URL dari browser (format: roblox.com/game-pass/...)' }
    ];
    
    const stepsHtml = steps.map(step => `
        <div class="guide-step">
            <div class="guide-step-icon" style="background: ${step.color}20;">
                <span class="material-symbols-outlined" style="color: ${step.color}; font-size: 20px;">${step.icon}</span>
            </div>
            <div class="guide-step-text">
                <h4 style="color: ${step.color};">${step.title}</h4>
                <p>${step.desc}</p>
            </div>
        </div>
    `).join('');
    
    showModal('Cara Membuat Gamepass', `
        ${stepsHtml}
        <div class="info-box" style="margin-top: 16px; background: #FFF3E0; border-color: #FFB74D;">
            <span class="material-symbols-outlined" style="color: #F57C00;">warning</span>
            <span style="color: #E65100;">Pastikan harga gamepass sudah benar dan status 'for sale' aktif!</span>
        </div>
    `, `<button class="btn-primary" onclick="closeModal()">Mengerti</button>`);
}

// Modal
function showModal(title, body, footer) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = body;
    document.getElementById('modalFooter').innerHTML = footer;
    document.getElementById('modal').classList.add('show');
}

function closeModal() {
    document.getElementById('modal').classList.remove('show');
}

// Alert
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
        animation: slideDown 0.3s ease;
    `;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
        alert.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// Add animations to CSS
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

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
    const userData = loadUserData();
    if (userData.username) {
        currentUser = userData;
        initHomePage();
        showPage('homePage');
    } else {
        showPage('loginPage');
    }
});