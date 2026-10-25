// AFIYA Natural & Organic Products - Simple Cart System
// Student: Mubashir | Roll No: 241845

// Natural Products Catalog for AFIYA
const productsCatalog = [
    {
        id: 1,
        name: "Pure Wildflower Raw Honey (500g)",
        category: "Organic Food",
        price: 18.50,
        image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 2,
        name: "Cold-Pressed Moroccan Argan Oil (100ml)",
        category: "Natural Skincare",
        price: 24.00,
        image: "https://images.unsplash.com/photo-1608248597359-25f02bcbbce9?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 3,
        name: "Handcrafted Shea Butter & Oat Soap",
        category: "Body Care",
        price: 8.50,
        image: "https://images.unsplash.com/photo-1607006311028-1b29a2c3a502?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 4,
        name: "Organic Pure Aloe Vera Soothing Gel",
        category: "Natural Skincare",
        price: 14.00,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 5,
        name: "French Lavender Pure Essential Oil (30ml)",
        category: "Aromatherapy",
        price: 16.00,
        image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=400&q=80"
    },
    {
        id: 6,
        name: "Herbal Chamomile & Mint Wellness Tea",
        category: "Organic Food",
        price: 12.00,
        image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80"
    }
];

// Helper: Get cart from localStorage
function getCart() {
    const cart = localStorage.getItem('afiya_cart');
    return cart ? JSON.parse(cart) : [];
}

// Helper: Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('afiya_cart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart counter badge in navbar
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        badge.textContent = totalItems;
    });
}

// Add item to cart
function addToCart(productId) {
    const product = productsCatalog.find(p => p.id === productId);
    if (!product) return;

    let cart = getCart();
    const existingIndex = cart.findIndex(item => item.id === productId);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: 1
        });
    }

    saveCart(cart);
    showToastNotification(`${product.name} added to your basket!`);
}

// Toast notification helper
function showToastNotification(message) {
    const toastElem = document.getElementById('cartToast');
    const toastBody = document.getElementById('toastMessage');
    if (toastElem && toastBody && window.bootstrap) {
        toastBody.textContent = message;
        const toast = new bootstrap.Toast(toastElem);
        toast.show();
    } else {
        alert(message);
    }
}

// Render Cart Table on cart.html
function renderCartTable() {
    const cart = getCart();
    const cartTableBody = document.getElementById('cartTableBody');
    const emptyNotice = document.getElementById('emptyCartNotice');
    const cartContent = document.getElementById('cartContentArea');
    const subtotalElem = document.getElementById('cartSubtotal');
    const shippingElem = document.getElementById('cartShipping');
    const grandTotalElem = document.getElementById('cartGrandTotal');

    if (!cartTableBody) return;

    if (cart.length === 0) {
        if (cartContent) cartContent.classList.add('d-none');
        if (emptyNotice) emptyNotice.classList.remove('d-none');
        return;
    }

    if (cartContent) cartContent.classList.remove('d-none');
    if (emptyNotice) emptyNotice.classList.add('d-none');

    cartTableBody.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="text-start">
                <div class="d-flex align-items-center gap-3">
                    <img src="${item.image}" alt="${item.name}" width="50" height="50" class="rounded border object-fit-cover">
                    <div>
                        <h6 class="mb-0 fw-bold fs-6">${item.name}</h6>
                        <small class="text-muted">${item.category}</small>
                    </div>
                </div>
            </td>
            <td class="align-middle fw-semibold">$${item.price.toFixed(2)}</td>
            <td class="align-middle">
                <div class="input-group input-group-sm justify-content-center" style="width: 110px; margin: 0 auto;">
                    <button class="btn btn-outline-secondary" type="button" onclick="changeQuantity(${item.id}, -1)">-</button>
                    <input type="text" class="form-control text-center bg-white" value="${item.quantity}" readonly>
                    <button class="btn btn-outline-secondary" type="button" onclick="changeQuantity(${item.id}, 1)">+</button>
                </div>
            </td>
            <td class="align-middle fw-bold text-success">$${itemTotal.toFixed(2)}</td>
            <td class="align-middle">
                <button class="btn btn-sm btn-outline-danger" onclick="removeFromCart(${item.id})" title="Remove item">
                    <i class="fas fa-trash-can"></i>
                </button>
            </td>
        `;
        cartTableBody.appendChild(row);
    });

    const shipping = subtotal > 50 ? 0 : 5.00;
    const grandTotal = subtotal + shipping;

    if (subtotalElem) subtotalElem.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingElem) shippingElem.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    if (grandTotalElem) grandTotalElem.textContent = `$${grandTotal.toFixed(2)}`;
}

// Quantity change (+1 or -1)
function changeQuantity(productId, delta) {
    let cart = getCart();
    const index = cart.findIndex(item => item.id === productId);

    if (index > -1) {
        cart[index].quantity += delta;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart(cart);
        renderCartTable();
    }
}

// Remove single product
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    renderCartTable();
}

// Clear cart completely
function clearCart() {
    localStorage.removeItem('afiya_cart');
    updateCartCount();
    renderCartTable();
}

// Render summary on checkout.html
function renderCheckoutSummary() {
    const cart = getCart();
    const checkoutList = document.getElementById('checkoutItemsList');
    const subtotalElem = document.getElementById('checkoutSubtotal');
    const shippingElem = document.getElementById('checkoutShipping');
    const totalElem = document.getElementById('checkoutTotal');

    if (!checkoutList) return;

    checkoutList.innerHTML = '';
    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;

        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between lh-sm';
        li.innerHTML = `
            <div>
                <h6 class="my-0 small fw-bold">${item.name}</h6>
                <small class="text-muted">Qty: ${item.quantity} × $${item.price.toFixed(2)}</small>
            </div>
            <span class="text-muted small fw-semibold">$${itemTotal.toFixed(2)}</span>
        `;
        checkoutList.appendChild(li);
    });

    const shipping = subtotal > 50 ? 0 : 5.00;
    const total = subtotal + shipping;

    if (subtotalElem) subtotalElem.textContent = `$${subtotal.toFixed(2)}`;
    if (shippingElem) shippingElem.textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    if (totalElem) totalElem.textContent = `$${total.toFixed(2)}`;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Seed sample item if freshly opened
    if (!localStorage.getItem('afiya_cart_seeded')) {
        const sampleCart = [
            {
                id: 1,
                name: "Pure Wildflower Raw Honey (500g)",
                category: "Organic Food",
                price: 18.50,
                image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80",
                quantity: 1
            }
        ];
        localStorage.setItem('afiya_cart', JSON.stringify(sampleCart));
        localStorage.setItem('afiya_cart_seeded', 'true');
    }

    updateCartCount();
    renderCartTable();
    renderCheckoutSummary();
});
