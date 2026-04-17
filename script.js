// ==========================================
// EduMart - Main JavaScript File
// ==========================================

// Mock Data for Initial Products
const initialProducts = [
    {
        id: 'p1',
        title: 'Calculus Early Transcendentals, 8th Edition',
        category: 'Textbooks',
        semester: '1',
        price: 650,
        desc: 'Good condition, slightly highlighted. Perfect for Sem 1 Math.',
        image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'p2',
        title: 'Data Structures and Algorithms in Java',
        category: 'Textbooks',
        semester: '3',
        price: 450,
        desc: 'Clear concepts, no missing pages.',
        image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'p3',
        title: 'Mini Drafter for Engineering Drawing',
        category: 'Lab Equipment',
        semester: '1',
        price: 250,
        desc: 'Used for one semester. Excellent working condition with cover.',
        image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'p4',
        title: 'Arduino Uno R3 with USB Cable',
        category: 'Project Materials',
        semester: '4',
        price: 800,
        desc: 'Original Arduino board, perfect for IoT projects.',
        image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'p5',
        title: 'Casio fx-991EX Scientific Calculator',
        category: 'Stationery',
        semester: '1',
        price: 1100,
        desc: 'Must have for all engineering students. Works flawlessly.',
        image: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'p6',
        title: 'Breadboard + 65 Jumper Wires',
        category: 'Project Materials',
        semester: '4',
        price: 150,
        desc: 'Combo pack for basic electronics labs.',
        image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    }
];

// App State
const state = {
    currentUser: null,
    cart: [],
    customProducts: [],
    purchases: [],
    budgetLimit: 2000,
    filters: {
        category: 'all',
        semester: 'all',
        search: ''
    }
};

// ==========================================
// Initialization
// ==========================================
const app = {
    init() {
        this.loadState();
        this.setupEventListeners();
        this.updateNav();
        this.renderProducts();
        this.renderFeaturedProducts();
        this.updateCartUI();
        
        // Handle URL Hash for simple routing if needed
        const hash = window.location.hash.replace('#', '') || 'home';
        this.navigate(hash);
    },

    loadState() {
        // Load user from local storage
        const savedUser = localStorage.getItem('eduMart_user');
        if (savedUser) state.currentUser = JSON.parse(savedUser);

        // Load cart specific to user
        if (state.currentUser) {
            const savedCart = localStorage.getItem(`eduMart_cart_${state.currentUser.username}`);
            if (savedCart) state.cart = JSON.parse(savedCart);

            const savedPurchases = localStorage.getItem(`eduMart_purchases_${state.currentUser.username}`);
            if (savedPurchases) state.purchases = JSON.parse(savedPurchases);
        } else {
            state.cart = [];
            state.purchases = [];
        }

        // Load custom products
        const savedProducts = localStorage.getItem('eduMart_customProducts');
        if (savedProducts) {
            state.customProducts = JSON.parse(savedProducts);
        }
    },

    saveState() {
        if (state.currentUser) {
            localStorage.setItem(`eduMart_cart_${state.currentUser.username}`, JSON.stringify(state.cart));
            localStorage.setItem(`eduMart_purchases_${state.currentUser.username}`, JSON.stringify(state.purchases));
        }
        localStorage.setItem('eduMart_customProducts', JSON.stringify(state.customProducts));
    },

    // ==========================================
    // Navigation
    // ==========================================
    navigate(sectionId) {
        // Update URL hash without jumping
        history.pushState(null, null, `#${sectionId}`);

        // Hide all sections
        document.querySelectorAll('.page-section').forEach(sec => {
            sec.classList.add('hidden');
            sec.classList.remove('active');
        });

        // Show target section
        const target = document.getElementById(sectionId);
        if (target) {
            target.classList.remove('hidden');
            // Trigger reflow for animation
            void target.offsetWidth;
            target.classList.add('active');
        }

        // Update nav links
        document.querySelectorAll('.nav-links a').forEach(link => {
            if (link.dataset.target === sectionId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Close mobile menu if open
        const navLinks = document.querySelector('.nav-links');
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }

        // Specific actions per route
        if (sectionId === 'dashboard') {
            this.renderDashboard();
        }
        if (sectionId === 'home') {
            this.animateCounters();
            this.renderFeaturedProducts();
        }
    },

    toggleMobileMenu() {
        document.querySelector('.nav-links').classList.toggle('active');
    },

    // ==========================================
    // Home Page Helpers
    // ==========================================
    animateCounters() {
        const counters = document.querySelectorAll('.counter-value');
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.target);
            const duration = 2000;
            const step = target / (duration / 16);
            let current = 0;
            counter.innerText = '0';
            const timer = setInterval(() => {
                current += step;
                if (current >= target) {
                    counter.innerText = target.toLocaleString();
                    clearInterval(timer);
                } else {
                    counter.innerText = Math.floor(current).toLocaleString();
                }
            }, 16);
        });
    },

    renderFeaturedProducts() {
        const container = document.getElementById('home-featured-grid');
        if (!container) return;
        const featured = this.getAllProducts().slice(0, 3);
        container.innerHTML = '';
        featured.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-img-wrapper">
                    <span class="product-category-badge">${product.category}</span>
                    <img src="${product.image}" alt="${product.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-desc">${product.desc}</p>
                    <div class="product-meta">
                        <span class="product-semester">Sem ${product.semester}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                        <span class="product-price">₹${product.price}</span>
                        <button class="btn btn-primary" onclick="app.addToCart('${product.id}')">
                            <i class="ph ph-shopping-cart"></i> Add
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    },

    goToCategory(categoryName) {
        // Set the filter and navigate to products
        state.filters.category = categoryName;
        state.filters.semester = 'all';
        state.filters.search = '';
        
        // Update radio buttons to reflect filter
        const catRadio = document.querySelector(`input[name="category"][value="${categoryName}"]`);
        if (catRadio) catRadio.checked = true;
        const semRadio = document.querySelector('input[name="semester"][value="all"]');
        if (semRadio) semRadio.checked = true;
        
        this.renderProducts();
        this.navigate('products');
    },

    // ==========================================
    // Authentication
    // ==========================================
    openAuthModal() {
        document.getElementById('auth-modal-overlay').classList.add('active');
    },

    closeAuthModal() {
        document.getElementById('auth-modal-overlay').classList.remove('active');
        document.getElementById('auth-form').reset();
    },

    toggleAuthMode() {
        const title = document.getElementById('auth-title');
        const subtitle = document.getElementById('auth-subtitle');
        const submitBtn = document.getElementById('auth-submit-btn');
        const switchText = document.getElementById('auth-switch-text');
        const formMode = submitBtn.innerText === 'Login' ? 'signup' : 'login';

        if (formMode === 'signup') {
            title.innerText = 'Create Account';
            subtitle.innerText = 'Join EduMart to start trading.';
            submitBtn.innerText = 'Sign Up';
            switchText.innerText = 'Already have an account?';
        } else {
            title.innerText = 'Welcome Back';
            subtitle.innerText = 'Login to access your dashboard and save cart.';
            submitBtn.innerText = 'Login';
            switchText.innerText = "Don't have an account?";
        }
    },

    handleAuth(e) {
        e.preventDefault();
        const username = document.getElementById('auth-username').value.trim();
        if (!username) return;

        // Simple auth simulation using just username for demo
        state.currentUser = { username };
        localStorage.setItem('eduMart_user', JSON.stringify(state.currentUser));
        
        // Reload state for this user
        this.loadState();
        this.updateNav();
        this.updateCartUI();
        this.closeAuthModal();
        this.showToast(`Welcome, ${username}!`, 'success');
        
        if (document.getElementById('dashboard').classList.contains('active')) {
            this.renderDashboard();
        }
    },

    logout() {
        state.currentUser = null;
        localStorage.removeItem('eduMart_user');
        state.cart = [];
        state.purchases = [];
        
        this.updateNav();
        this.updateCartUI();
        this.showToast('Logged out successfully', 'success');
        this.navigate('home');
    },

    updateNav() {
        const authBtn = document.getElementById('auth-btn');
        const userProfile = document.getElementById('user-profile');
        const navUsername = document.getElementById('nav-username');

        if (state.currentUser) {
            authBtn.classList.add('hidden');
            userProfile.classList.remove('hidden');
            navUsername.innerText = state.currentUser.username;
        } else {
            authBtn.classList.remove('hidden');
            userProfile.classList.add('hidden');
        }
    },

    // ==========================================
    // Products & Rendering
    // ==========================================
    getAllProducts() {
        return [...initialProducts, ...state.customProducts];
    },

    renderProducts() {
        const container = document.getElementById('products-container');
        let products = this.getAllProducts();

        // Apply filters
        if (state.filters.category !== 'all') {
            products = products.filter(p => p.category === state.filters.category);
        }
        if (state.filters.semester !== 'all') {
            products = products.filter(p => p.semester === state.filters.semester);
        }
        if (state.filters.search) {
            const query = state.filters.search.toLowerCase();
            products = products.filter(p => 
                p.title.toLowerCase().includes(query) || 
                p.desc.toLowerCase().includes(query)
            );
        }

        container.innerHTML = '';

        if (products.length === 0) {
            container.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">
                <i class="ph ph-package" style="font-size: 3rem; color: var(--text-muted)"></i>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search query.</p>
            </div>`;
            return;
        }

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <div class="product-img-wrapper">
                    <span class="product-category-badge">${product.category}</span>
                    <img src="${product.image}" alt="${product.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                </div>
                <div class="product-info">
                    <h3 class="product-title">${product.title}</h3>
                    <p class="product-desc">${product.desc}</p>
                    <div class="product-meta">
                        <span class="product-semester">Sem ${product.semester}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                        <span class="product-price">₹${product.price}</span>
                        <button class="btn btn-primary" onclick="app.addToCart('${product.id}')">
                            <i class="ph ph-shopping-cart"></i> Add
                        </button>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    },

    handleSearch(e) {
        state.filters.search = e.target.value;
        this.renderProducts();
    },

    handleFilterChange() {
        const categoryRadios = document.querySelectorAll('input[name="category"]');
        const semesterRadios = document.querySelectorAll('input[name="semester"]');
        
        let selectedCategory = 'all';
        categoryRadios.forEach(r => { if(r.checked) selectedCategory = r.value; });
        
        let selectedSemester = 'all';
        semesterRadios.forEach(r => { if(r.checked) selectedSemester = r.value; });

        state.filters.category = selectedCategory;
        state.filters.semester = selectedSemester;
        this.renderProducts();
    },

    // ==========================================
    // Sell Form
    // ==========================================
    handleSellSubmit(e) {
        e.preventDefault();
        
        if (!state.currentUser) {
            this.showToast('Please login to sell an item', 'error');
            this.openAuthModal();
            return;
        }

        const title = document.getElementById('sell-title').value;
        const category = document.getElementById('sell-category').value;
        const semester = document.getElementById('sell-semester').value;
        const price = parseFloat(document.getElementById('sell-price').value);
        const desc = document.getElementById('sell-desc').value;
        const image = document.getElementById('sell-image').value;

        const newProduct = {
            id: 'custom_' + Date.now(),
            title,
            category,
            semester,
            price,
            desc,
            image,
            seller: state.currentUser.username
        };

        state.customProducts.push(newProduct);
        this.saveState();
        
        document.getElementById('sell-form').reset();
        this.showToast('Item listed successfully!', 'success');
        
        // Navigate to products to see the new item
        state.filters.category = 'all';
        state.filters.semester = 'all';
        document.querySelector('input[name="category"][value="all"]').checked = true;
        document.querySelector('input[name="semester"][value="all"]').checked = true;
        
        this.renderProducts();
        this.navigate('products');
    },

    // ==========================================
    // Cart & Budget
    // ==========================================
    toggleCart(forceState) {
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('cart-overlay');
        
        if (typeof forceState === 'boolean') {
            if (forceState) {
                sidebar.classList.add('active');
                overlay.classList.add('active');
            } else {
                sidebar.classList.remove('active');
                overlay.classList.remove('active');
            }
        } else {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    },

    addToCart(productId) {
        if (!state.currentUser) {
            this.showToast('Please login to add items to cart', 'warning');
            this.openAuthModal();
            return;
        }

        const product = this.getAllProducts().find(p => p.id === productId);
        if (!product) return;

        // Check if already in cart (assuming unique items for simplicity)
        if (state.cart.find(item => item.id === productId)) {
            this.showToast('Item already in cart', 'warning');
            return;
        }

        state.cart.push(product);
        this.saveState();
        this.updateCartUI();
        this.showToast('Added to cart!', 'success');
        
        // Small animation on cart icon
        const cartIcon = document.querySelector('.cart-btn i');
        cartIcon.style.transform = 'scale(1.2)';
        setTimeout(() => cartIcon.style.transform = 'scale(1)', 200);
    },

    removeFromCart(productId) {
        state.cart = state.cart.filter(item => item.id !== productId);
        this.saveState();
        this.updateCartUI();
    },

    getCartTotal() {
        return state.cart.reduce((total, item) => total + item.price, 0);
    },

    getPastSpending() {
        return state.purchases.reduce((total, item) => total + item.price, 0);
    },

    updateCartUI() {
        const badge = document.getElementById('cart-badge');
        const container = document.getElementById('cart-items');
        const totalPriceEl = document.getElementById('cart-total-price');
        const budgetAlert = document.getElementById('budget-alert');
        const checkoutBtn = document.getElementById('checkout-btn');

        // Update badge
        badge.innerText = state.cart.length;

        // Update items list
        container.innerHTML = '';
        if (state.cart.length === 0) {
            container.innerHTML = '<div class="empty-cart" style="text-align:center; padding: 2rem; color: var(--text-muted)">Your cart is empty</div>';
            checkoutBtn.disabled = true;
        } else {
            checkoutBtn.disabled = false;
            state.cart.forEach(item => {
                const div = document.createElement('div');
                div.className = 'cart-item';
                div.innerHTML = `
                    <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/60'">
                    <div class="cart-item-info">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">₹${item.price}</div>
                        <button class="remove-item" onclick="app.removeFromCart('${item.id}')">Remove</button>
                    </div>
                `;
                container.appendChild(div);
            });
        }

        // Update total
        const cartTotal = this.getCartTotal();
        totalPriceEl.innerText = `₹${cartTotal}`;

        // Budget Logic (Past spending + Cart Total vs Budget Limit)
        const pastSpending = this.getPastSpending();
        const potentialTotalSpending = pastSpending + cartTotal;

        if (state.currentUser && cartTotal > 0 && potentialTotalSpending > state.budgetLimit) {
            budgetAlert.classList.remove('hidden');
        } else {
            budgetAlert.classList.add('hidden');
        }
    },

    checkout() {
        if (state.cart.length === 0) return;

        // Add items to purchases
        state.purchases = [...state.purchases, ...state.cart.map(item => ({...item, purchaseDate: new Date().toISOString()}))];
        
        // Clear cart
        state.cart = [];
        this.saveState();
        
        this.updateCartUI();
        this.toggleCart(false);
        this.showToast('Checkout successful! Items added to your dashboard.', 'success');
        
        // Optional: remove purchased items from main products array if they are custom
        // For demo, we leave them to keep the store populated.

        if (document.getElementById('dashboard').classList.contains('active')) {
            this.renderDashboard();
        }
    },

    // ==========================================
    // Dashboard
    // ==========================================
    renderDashboard() {
        const authWall = document.getElementById('dashboard-auth-wall');
        const content = document.getElementById('dashboard-content');

        if (!state.currentUser) {
            authWall.classList.remove('hidden');
            content.classList.add('hidden');
            return;
        }

        authWall.classList.add('hidden');
        content.classList.remove('hidden');

        // Stats
        const totalItems = state.purchases.length;
        const totalSpent = this.getPastSpending();
        
        document.getElementById('stat-items').innerText = totalItems;
        document.getElementById('stat-spent').innerText = `₹${totalSpent}`;

        // Budget Bar
        const budgetBar = document.getElementById('budget-bar');
        const budgetText = document.getElementById('budget-text');
        
        let percentage = (totalSpent / state.budgetLimit) * 100;
        if (percentage > 100) percentage = 100;
        
        budgetBar.style.width = `${percentage}%`;
        
        budgetBar.className = 'budget-bar'; // reset
        if (percentage > 90) {
            budgetBar.classList.add('danger');
        } else if (percentage > 70) {
            budgetBar.classList.add('warning');
        }
        
        budgetText.innerText = `₹${totalSpent} / ₹${state.budgetLimit} Budget limit`;

        // Chart Data (Spending by Category)
        const categoryTotals = {};
        state.purchases.forEach(item => {
            categoryTotals[item.category] = (categoryTotals[item.category] || 0) + item.price;
        });

        const chartContainer = document.getElementById('spending-chart');
        chartContainer.innerHTML = '';
        
        const categories = ['Textbooks', 'Lab Equipment', 'Stationery', 'Project Materials'];
        let maxCategoryTotal = Math.max(...Object.values(categoryTotals), 1); // Avoid div by 0

        let hasData = false;
        categories.forEach(cat => {
            const amount = categoryTotals[cat] || 0;
            if (amount > 0) hasData = true;
            
            const heightPercent = (amount / maxCategoryTotal) * 100;
            
            const barHTML = `
                <div class="chart-bar-container">
                    <div class="chart-bar" style="height: ${heightPercent}%" data-val="₹${amount}"></div>
                    <div class="chart-label">${cat.split(' ')[0]}</div>
                </div>
            `;
            chartContainer.innerHTML += barHTML;
        });

        if (!hasData) {
            chartContainer.innerHTML = '<div class="empty-state">No purchases yet.</div>';
        }

        // Recent Purchases List
        const listContainer = document.getElementById('purchases-list');
        listContainer.innerHTML = '';
        
        if (state.purchases.length === 0) {
            listContainer.innerHTML = '<p class="empty-state">You haven\'t bought anything yet.</p>';
        } else {
            // Sort by date (newest first theoretically, though we just append)
            const reversedPurchases = [...state.purchases].reverse().slice(0, 5); // top 5
            reversedPurchases.forEach(item => {
                listContainer.innerHTML += `
                    <div class="purchase-item">
                        <div class="purchase-info">
                            <img src="${item.image}" alt="${item.title}" onerror="this.src='https://via.placeholder.com/40'">
                            <div>
                                <div style="font-weight: 500; font-size: 0.95rem;">${item.title}</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">${item.category}</div>
                            </div>
                        </div>
                        <div style="font-weight: 700; color: var(--secondary-green);">₹${item.price}</div>
                    </div>
                `;
            });
        }
    },

    // ==========================================
    // Utilities
    // ==========================================
    handleComingSoon(e) {
        e.preventDefault();
        this.showToast('This feature is coming soon!', 'info');
    },

    showToast(message, type = 'success') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'ph-check-circle' : (type === 'error' ? 'ph-warning-circle' : 'ph-info');
        toast.innerHTML = `<i class="ph-fill ${icon}" style="font-size: 1.25rem;"></i><span>${message}</span>`;
        
        container.appendChild(toast);
        
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
            }
        }, 3000);
    },

    setupEventListeners() {
        // Search Input
        document.getElementById('search-input').addEventListener('input', (e) => this.handleSearch(e));

        // Filter Radios
        document.querySelectorAll('input[name="category"], input[name="semester"]').forEach(radio => {
            radio.addEventListener('change', () => this.handleFilterChange());
        });

        // Sell Form
        document.getElementById('sell-form').addEventListener('submit', (e) => this.handleSellSubmit(e));

        // Auth Form
        document.getElementById('auth-form').addEventListener('submit', (e) => this.handleAuth(e));
    }
};

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
