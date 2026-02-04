// MyApple Store - JavaScript

// Cart Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Auth - users stored in localStorage (key: myapple_users), current user (key: myapple_user)
function getUsers() {
    return JSON.parse(localStorage.getItem('myapple_users')) || [];
}
function saveUsers(users) {
    localStorage.setItem('myapple_users', JSON.stringify(users));
}
function getLoggedInUser() {
    const u = localStorage.getItem('myapple_user');
    return u ? JSON.parse(u) : null;
}
function setLoggedInUser(user) {
    if (user) localStorage.setItem('myapple_user', JSON.stringify(user));
    else localStorage.removeItem('myapple_user');
    if (typeof updateNavAuth === 'function') updateNavAuth();
}
function isLoggedIn() {
    return !!getLoggedInUser();
}
function logout() {
    setLoggedInUser(null);
    if (typeof updateCartCount === 'function') updateCartCount();
}

function updateNavAuth() {
    const navAuth = document.getElementById('navAuth');
    const navAuthSignup = document.getElementById('navAuthSignup');
    const navProfile = document.getElementById('navProfile');
    const profileNameSpan = document.getElementById('profileNameSpan');
    const user = getLoggedInUser();
    const showAuth = !user;
    if (navAuth) navAuth.style.display = showAuth ? '' : 'none';
    if (navAuthSignup) navAuthSignup.style.display = showAuth ? '' : 'none';
    if (navProfile) navProfile.style.display = user ? '' : 'none';
    if (profileNameSpan && user) profileNameSpan.textContent = user.firstName || user.email || 'Profile';
}

// Initialize cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cartCount, #cartCountNav');
    cartCountElements.forEach(el => {
        if (el) el.textContent = count;
    });
}

// Get product image based on product name
function getProductImage(productName) {
    const imageMap = {
        'iPhone 15': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
        'iPhone 15 Pro': 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=300&h=300&fit=crop',
        'Apple Watch Series 9': 'https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=300&h=300&fit=crop',
        'Apple Watch Ultra': 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=300&h=300&fit=crop',
        'iPad Air': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=300&h=300&fit=crop',
        'iPad Pro': 'https://images.unsplash.com/photo-1561154464-82e9adf327c4?w=300&h=300&fit=crop',
        'MacBook Air': 'https://images.unsplash.com/photo-1517336714731-48968933a07f?w=300&h=300&fit=crop',
        'MacBook Pro': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop',
        'AirPods Pro': 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&h=300&fit=crop'
    };
    return imageMap[productName] || 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop';
}

// Add to cart - requires login
function addToCart(productName, price, image = null) {
    if (!isLoggedIn()) {
        showNotification('Please login or sign up to add items to cart');
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        return;
    }
    const existingItem = cart.find(item => item.name === productName);
    
    // Use provided image or get from product name
    const productImage = image || getProductImage(productName);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            price: price,
            quantity: 1,
            image: productImage
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showNotification(`${productName} added to cart!`);
}

// Remove from cart
function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    if (document.getElementById('cartItems')) {
        displayCartItems();
    }
}

// Update quantity
function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        if (document.getElementById('cartItems')) {
            displayCartItems();
        }
    }
}

// Display cart items
function displayCartItems() {
    const cartItemsDiv = document.getElementById('cartItems');
    if (!cartItemsDiv) return;
    
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="text-muted">Your cart is empty</p>';
        document.getElementById('subtotal').textContent = '₹0';
        document.getElementById('tax').textContent = '₹0';
        document.getElementById('total').textContent = '₹0';
        return;
    }
    
    let html = '';
    let subtotal = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        html += `
            <div class="cart-item">
                <div class="d-flex align-items-center">
                    <img src="${item.image}" alt="${item.name}" class="img-thumbnail me-3" style="width: 60px; height: 60px; object-fit: cover;">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${item.name}</h6>
                        <p class="text-muted small mb-0">₹${item.price.toLocaleString('en-IN')} x ${item.quantity}</p>
                    </div>
                    <div class="text-end">
                        <p class="fw-bold mb-2">₹${itemTotal.toLocaleString('en-IN')}</p>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary" onclick="updateQuantity(${index}, -1)">-</button>
                            <span class="btn btn-outline-secondary">${item.quantity}</span>
                            <button class="btn btn-outline-secondary" onclick="updateQuantity(${index}, 1)">+</button>
                        </div>
                        <button class="btn btn-link text-danger btn-sm p-0 mt-1" onclick="removeFromCart(${index})">
                            <i class="bi bi-trash"></i> Remove
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartItemsDiv.innerHTML = html;
    
    const tax = subtotal * 0.18;
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    document.getElementById('tax').textContent = `₹${tax.toLocaleString('en-IN')}`;
    document.getElementById('total').textContent = `₹${total.toLocaleString('en-IN')}`;
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'alert alert-success position-fixed top-0 end-0 m-3';
    notification.style.zIndex = '9999';
    notification.style.minWidth = '300px';
    notification.innerHTML = `
        <i class="bi bi-check-circle"></i> ${message}
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Login Form Handler
document.addEventListener('DOMContentLoaded', function() {
    updateNavAuth();
    const navLogout = document.getElementById('navLogout');
    if (navLogout) {
        navLogout.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
            updateNavAuth();
            showNotification('You have been logged out.');
            window.location.href = 'index.html';
        });
    }
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = (document.getElementById('email') && document.getElementById('email').value.trim().toLowerCase()) || '';
            const password = document.getElementById('password') && document.getElementById('password').value;
            if (!email || !password) return;
            const users = getUsers();
            const user = users.find(u => u.email && u.email.toLowerCase() === email);
            if (!user) {
                showNotification('No account found. Please sign up first.');
                setTimeout(() => { window.location.href = 'signup.html'; }, 1500);
                return;
            }
            if (user.password !== password) {
                showNotification('Incorrect password. Please try again.');
                return;
            }
            setLoggedInUser(user);
            showNotification('Login successful! Redirecting...');
            const params = new URLSearchParams(window.location.search);
            const redirect = params.get('redirect') || 'index.html';
            setTimeout(() => { window.location.href = redirect.startsWith('http') ? redirect : (redirect || 'index.html'); }, 1000);
        });
    }
    
    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const eyeIcon = document.getElementById('eyeIcon');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.className = 'bi bi-eye-slash';
            } else {
                passwordInput.type = 'password';
                eyeIcon.className = 'bi bi-eye';
            }
        });
    }
    
    // Signup Form Handler
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const email = document.getElementById('signupEmail').value.trim().toLowerCase();
            const phone = (document.getElementById('phone') && document.getElementById('phone').value) || '';
            const firstName = (document.getElementById('firstName') && document.getElementById('firstName').value.trim()) || '';
            const lastName = (document.getElementById('lastName') && document.getElementById('lastName').value.trim()) || '';

            // Email validation (e.g. abc123@gmail.com)
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!emailRegex.test(email)) {
                document.getElementById('signupEmail').classList.add('is-invalid');
                if (document.getElementById('emailFeedback')) document.getElementById('emailFeedback').textContent = 'Please enter a valid email (e.g. abc123@gmail.com)';
                return;
            }
            document.getElementById('signupEmail').classList.remove('is-invalid');

            // Phone: first digit 6–9, exactly 10 digits
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
                const phoneEl = document.getElementById('phone');
                const phoneFeedback = document.getElementById('phoneFeedback');
                if (phoneEl) phoneEl.classList.add('is-invalid');
                if (phoneFeedback) phoneFeedback.textContent = 'Phone must be 10 digits and start with 6, 7, 8 or 9';
                return;
            }
            if (document.getElementById('phone')) document.getElementById('phone').classList.remove('is-invalid');

            // Password validation
            if (password.length < 8) {
                document.getElementById('signupPassword').classList.add('is-invalid');
                return;
            }
            if (password !== confirmPassword) {
                document.getElementById('confirmPassword').classList.add('is-invalid');
                if (document.getElementById('passwordFeedback')) document.getElementById('passwordFeedback').textContent = 'Passwords do not match';
                return;
            }
            document.getElementById('confirmPassword').classList.remove('is-invalid');

            const users = getUsers();
            if (users.some(u => u.email && u.email.toLowerCase() === email)) {
                document.getElementById('signupEmail').classList.add('is-invalid');
                if (document.getElementById('emailFeedback')) document.getElementById('emailFeedback').textContent = 'This email is already registered. Please sign in.';
                return;
            }
            users.push({
                email,
                password,
                firstName,
                lastName,
                phone: phone.replace(/\s/g, ''),
                gender: '',
                address: ''
            });
            saveUsers(users);
            showNotification('Account created! Please sign in.');
            setTimeout(() => { window.location.href = 'login.html'; }, 1000);
        });
    }
    
    // Toggle signup password visibility
    const toggleSignupPassword = document.getElementById('toggleSignupPassword');
    if (toggleSignupPassword) {
        toggleSignupPassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('signupPassword');
            const eyeIcon = document.getElementById('signupEyeIcon');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                eyeIcon.className = 'bi bi-eye-slash';
            } else {
                passwordInput.type = 'password';
                eyeIcon.className = 'bi bi-eye';
            }
        });
    }
    
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const productName = this.getAttribute('data-product');
            const price = parseInt(this.getAttribute('data-price'));
            // Get the image source directly from the product card's img element
            const productCard = this.closest('.product-item');
            const productImageElement = productCard ? productCard.querySelector('.product-image img') : null;
            const productImage = productImageElement ? productImageElement.src : null;
            addToCart(productName, price, productImage);
        });
    });
    
    // Category filter
    const categoryButtons = document.querySelectorAll('[data-category]');
    
    // Function to filter products by category
    function filterByCategory(category) {
        // Update active button
        categoryButtons.forEach(btn => btn.classList.remove('active'));
        const activeButton = Array.from(categoryButtons).find(btn => btn.getAttribute('data-category') === category);
        if (activeButton) {
            activeButton.classList.add('active');
        }
        
        // Mark products as matching or not matching the category filter
        const products = document.querySelectorAll('.product-item');
        products.forEach(product => {
            const productCategory = product.getAttribute('data-category');
            if (category === 'all' || productCategory === category) {
                product.style.display = 'block'; // Show matching products
            } else {
                product.style.display = 'none'; // Hide non-matching products
            }
        });
    }
    
    // Check for category parameter in URL on page load
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
        // Filter to the specified category on page load
        filterByCategory(categoryParam);
    }
    
    // Add click event listeners to category buttons
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterByCategory(category);
        });
    });
    
    // Sort products
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            const sortValue = this.value;
            const productsContainer = document.getElementById('productsGrid');
            const products = Array.from(productsContainer.querySelectorAll('.product-item'));
            
            products.sort((a, b) => {
                if (sortValue === 'price-low') {
                    return parseInt(a.getAttribute('data-price')) - parseInt(b.getAttribute('data-price'));
                } else if (sortValue === 'price-high') {
                    return parseInt(b.getAttribute('data-price')) - parseInt(a.getAttribute('data-price'));
                } else if (sortValue === 'name') {
                    return a.getAttribute('data-name').localeCompare(b.getAttribute('data-name'));
                }
                return 0;
            });
            
            products.forEach(product => productsContainer.appendChild(product));
        });
    }
    
    // Quick view modal - click anywhere on product card (except Add to Cart) to open
    function openQuickViewModal(productItem) {
        const productName = productItem.getAttribute('data-name');
        const price = productItem.getAttribute('data-price');
        const productImageElement = productItem.querySelector('.product-image img');
        const productImage = productImageElement ? productImageElement.src : getProductImage(productName);

        document.getElementById('productModalTitle').textContent = productName;
        document.getElementById('productModalName').textContent = productName;
        document.getElementById('productModalPrice').textContent = `₹${parseInt(price).toLocaleString('en-IN')}`;
        document.getElementById('productModalDesc').textContent = 'Premium quality product with latest features and technology.';
        document.getElementById('productModalImage').src = productImage;
        document.getElementById('productModalImage').alt = productName;
        document.getElementById('productModalFeatures').innerHTML = `
            <li>Latest technology</li>
            <li>Premium quality</li>
            <li>1 year warranty</li>
            <li>Free shipping</li>
        `;
        document.getElementById('modalAddToCart').setAttribute('data-product', productName);
        document.getElementById('modalAddToCart').setAttribute('data-price', price);
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    }

    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        productsGrid.addEventListener('click', function(e) {
            const productCard = e.target.closest('.product-card');
            if (!productCard) return;
            if (e.target.closest('.add-to-cart')) return;
            const productItem = productCard.closest('.product-item');
            if (productItem) openQuickViewModal(productItem);
        });
    }
    
    // Modal add to cart
    const modalAddToCart = document.getElementById('modalAddToCart');
    if (modalAddToCart) {
        modalAddToCart.addEventListener('click', function() {
            const productName = this.getAttribute('data-product');
            const price = parseInt(this.getAttribute('data-price'));
            // Get the image source from the modal's image element
            const modalImageElement = document.getElementById('productModalImage');
            const productImage = modalImageElement ? modalImageElement.src : null;
            addToCart(productName, price, productImage);
            const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
            modal.hide();
        });
    }
    
    // Payment method toggle
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            const cardDetails = document.getElementById('cardDetails');
            const upiDetails = document.getElementById('upiDetails');
            
            if (this.value === 'credit') {
                cardDetails.style.display = 'block';
                if (upiDetails) upiDetails.style.display = 'none';
            } else if (this.value === 'upi') {
                if (cardDetails) cardDetails.style.display = 'none';
                if (upiDetails) upiDetails.style.display = 'block';
            } else {
                if (cardDetails) cardDetails.style.display = 'none';
                if (upiDetails) upiDetails.style.display = 'none';
            }
        });
    });
    
    // Card number formatting
    const cardNumber = document.getElementById('cardNumber');
    if (cardNumber) {
        cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    // Expiry date formatting
    const expiryDate = document.getElementById('expiryDate');
    if (expiryDate) {
        expiryDate.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // CVV formatting
    const cvv = document.getElementById('cvv');
    if (cvv) {
        cvv.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    // Place order
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                showNotification('Your cart is empty!');
                return;
            }
            
            const checkoutEmail = document.getElementById('checkoutEmail') && document.getElementById('checkoutEmail').value.trim();
            const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
            if (!checkoutEmail || !emailRegex.test(checkoutEmail)) {
                showNotification('Please enter a valid email (e.g. abc123@gmail.com)');
                const el = document.getElementById('checkoutEmail');
                if (el) { el.focus(); el.classList.add('is-invalid'); }
                return;
            }
            if (document.getElementById('checkoutEmail')) document.getElementById('checkoutEmail').classList.remove('is-invalid');

            const checkoutPhone = document.getElementById('checkoutPhone') && document.getElementById('checkoutPhone').value.replace(/\D/g, '');
            if (!checkoutPhone || !/^[6-9]\d{9}$/.test(checkoutPhone)) {
                showNotification('Phone must be 10 digits; first digit must be 6 or above.');
                const el = document.getElementById('checkoutPhone');
                if (el) { el.focus(); el.classList.add('is-invalid'); }
                return;
            }
            if (document.getElementById('checkoutPhone')) document.getElementById('checkoutPhone').classList.remove('is-invalid');

            const checkoutZip = document.getElementById('checkoutZip') && document.getElementById('checkoutZip').value.replace(/\D/g, '');
            if (!checkoutZip || !/^\d{6}$/.test(checkoutZip)) {
                showNotification('PIN code must be exactly 6 digits.');
                const el = document.getElementById('checkoutZip');
                if (el) { el.focus(); el.classList.add('is-invalid'); }
                return;
            }
            if (document.getElementById('checkoutZip')) document.getElementById('checkoutZip').classList.remove('is-invalid');

            const checkoutForm = document.getElementById('checkoutForm');
            if (!checkoutForm.checkValidity()) {
                checkoutForm.reportValidity();
                return;
            }
            
            const selectedPayment = document.querySelector('input[name="paymentMethod"]:checked').value;
            
            if (selectedPayment === 'credit') {
                const cardNumber = document.getElementById('cardNumber').value;
                const expiryDate = document.getElementById('expiryDate').value;
                const cvv = document.getElementById('cvv').value;
                const cardName = document.getElementById('cardName').value;
                
                if (!cardNumber || !expiryDate || !cvv || !cardName) {
                    showNotification('Please fill all card details');
                    return;
                }
            } else if (selectedPayment === 'upi') {
                const upiId = (document.getElementById('upiId') && document.getElementById('upiId').value.trim()) || '';
                const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;
                if (!upiId || !upiRegex.test(upiId)) {
                    showNotification('Please enter a valid UPI ID (e.g. sbi@oksbi)');
                    const el = document.getElementById('upiId');
                    if (el) { el.focus(); el.classList.add('is-invalid'); }
                    return;
                }
                if (document.getElementById('upiId')) document.getElementById('upiId').classList.remove('is-invalid');
            }
            
            // Clear cart
            cart = [];
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCount();
            
            // Show success modal
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
        });
    }
    
    // Initialize cart display on payment page
    if (document.getElementById('cartItems')) {
        displayCartItems();
    }
    
    // Initialize cart count
    updateCartCount();
});

