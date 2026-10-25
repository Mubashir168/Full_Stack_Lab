// AFIYA Natural & Organic Products - Backend API
// Student: Mubashir | Roll No: 241845
// Lab 3 - Part 2: End-points of the e-commerce store using PERSISTENT APIs
//
// "Persistent" means the data is saved in JSON files inside the "data" folder.
// If the server stops or restarts, nothing is lost, because every change
// is written to a file (not just kept in a variable in memory).
//
// Run:  npm install   (only the first time)
//       npm start     -> server runs at http://localhost:3000

const express = require('express'); // framework for building APIs
const fs = require('fs');           // built-in: read and write files
const path = require('path');       // built-in: build file paths safely
const crypto = require('crypto');   // built-in: hash passwords

const app = express();
const PORT = 3000;

// Lets Express read JSON sent in the request body (req.body)
app.use(express.json());

// =====================================================================
// FILE HELPERS (this is what makes the API "persistent")
// =====================================================================
const DATA_FOLDER = path.join(__dirname, 'data');

// Read a JSON file and return its data (an array)
function readData(fileName) {
    const filePath = path.join(DATA_FOLDER, fileName);
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const text = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(text);
}

// Save data (an array) into a JSON file
function saveData(fileName, data) {
    const filePath = path.join(DATA_FOLDER, fileName);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Next id = biggest existing id + 1
function getNextId(list) {
    if (list.length === 0) {
        return 1;
    }
    const ids = list.map(item => item.id);
    return Math.max(...ids) + 1;
}

// Same totals rule as the frontend (cart.js): free shipping above $50
// (an empty cart has no shipping charge)
function calculateTotals(items) {
    let subtotal = 0;
    items.forEach(item => {
        subtotal += item.price * item.quantity;
    });
    const shipping = subtotal === 0 || subtotal > 50 ? 0 : 5.00;
    return {
        subtotal: Math.round(subtotal * 100) / 100,
        shipping: shipping,
        total: Math.round((subtotal + shipping) * 100) / 100
    };
}

// Turn a password into a hash, so the real password is never saved
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Make sure the data folder exists
if (!fs.existsSync(DATA_FOLDER)) {
    fs.mkdirSync(DATA_FOLDER);
}

// =====================================================================
// HOME - list of all end-points
// =====================================================================
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the AFIYA Store API',
        endpoints: [
            'GET    /api/products',
            'GET    /api/products/:id',
            'POST   /api/products',
            'PUT    /api/products/:id',
            'DELETE /api/products/:id',
            'POST   /api/users/signup',
            'POST   /api/users/login',
            'GET    /api/users',
            'GET    /api/cart',
            'POST   /api/cart',
            'PUT    /api/cart/:productId',
            'DELETE /api/cart/:productId',
            'DELETE /api/cart',
            'POST   /api/orders',
            'GET    /api/orders',
            'GET    /api/orders/:id'
        ]
    });
});

// =====================================================================
// PRODUCTS
// =====================================================================

// GET all products  (optional filter: /api/products?category=Organic Food)
app.get('/api/products', (req, res) => {
    const products = readData('products.json');
    const category = req.query.category;

    if (category) {
        const filtered = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
        return res.json(filtered);
    }
    res.json(products);
});

// GET one product by id
app.get('/api/products/:id', (req, res) => {
    const products = readData('products.json');
    const id = Number(req.params.id);
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ error: `Product ${req.params.id} not found` });
    }
    res.json(product);
});

// POST - add a new product
app.post('/api/products', (req, res) => {
    const { name, category, price, image } = req.body;

    if (!name || !category || price === undefined) {
        return res.status(400).json({ error: 'name, category and price are required' });
    }
    if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ error: 'price must be a number greater than 0' });
    }

    const products = readData('products.json');
    const newProduct = {
        id: getNextId(products),
        name: name,
        category: category,
        price: price,
        image: image || ''
    };

    products.push(newProduct);
    saveData('products.json', products);
    res.status(201).json(newProduct); // 201 = Created
});

// PUT - update an existing product
app.put('/api/products/:id', (req, res) => {
    const products = readData('products.json');
    const id = Number(req.params.id);
    const index = products.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: `Product ${req.params.id} not found` });
    }

    const { name, category, price, image } = req.body;
    if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
        return res.status(400).json({ error: 'price must be a number greater than 0' });
    }

    // Only change the fields that were sent
    if (name !== undefined) products[index].name = name;
    if (category !== undefined) products[index].category = category;
    if (price !== undefined) products[index].price = price;
    if (image !== undefined) products[index].image = image;

    saveData('products.json', products);
    res.json(products[index]);
});

// DELETE - remove a product
app.delete('/api/products/:id', (req, res) => {
    const products = readData('products.json');
    const id = Number(req.params.id);
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ error: `Product ${req.params.id} not found` });
    }

    const remaining = products.filter(p => p.id !== id);
    saveData('products.json', remaining);
    res.json({ message: `${product.name} deleted` });
});

// =====================================================================
// USERS (signup.html and login.html)
// =====================================================================

// POST - register a new user
app.post('/api/users/signup', (req, res) => {
    const { name, rollNo, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'name, email and password are required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'password must be at least 6 characters' });
    }
    if (confirmPassword !== undefined && confirmPassword !== password) {
        return res.status(400).json({ error: 'passwords do not match' });
    }

    const users = readData('users.json');
    const alreadyExists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (alreadyExists) {
        return res.status(409).json({ error: 'An account with this email already exists' }); // 409 = Conflict
    }

    const newUser = {
        id: getNextId(users),
        name: name,
        rollNo: rollNo || '',
        email: email,
        password: hashPassword(password) // never save the real password
    };

    users.push(newUser);
    saveData('users.json', users);

    res.status(201).json({
        message: 'Registration successful',
        user: { id: newUser.id, name: newUser.name, rollNo: newUser.rollNo, email: newUser.email }
    });
});

// POST - login
app.post('/api/users/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
    }

    const users = readData('users.json');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || user.password !== hashPassword(password)) {
        return res.status(401).json({ error: 'Invalid email or password' }); // 401 = Unauthorized
    }

    res.json({
        message: `Sign in successful! Welcome back, ${user.name}`,
        user: { id: user.id, name: user.name, rollNo: user.rollNo, email: user.email }
    });
});

// GET all users (passwords are NOT sent back)
app.get('/api/users', (req, res) => {
    const users = readData('users.json');
    const safeUsers = users.map(u => ({ id: u.id, name: u.name, rollNo: u.rollNo, email: u.email }));
    res.json(safeUsers);
});

// =====================================================================
// CART (cart.html)
// =====================================================================

// GET the cart with totals
app.get('/api/cart', (req, res) => {
    const cart = readData('cart.json');
    res.json({ items: cart, ...calculateTotals(cart) });
});

// POST - add a product to the cart  body: { "productId": 1, "quantity": 2 }
app.post('/api/cart', (req, res) => {
    const productId = Number(req.body.productId);
    const quantity = req.body.quantity === undefined ? 1 : Number(req.body.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ error: 'quantity must be a whole number greater than 0' });
    }

    const products = readData('products.json');
    const product = products.find(p => p.id === productId);
    if (!product) {
        return res.status(404).json({ error: `Product ${req.body.productId} not found` });
    }

    const cart = readData('cart.json');
    const existing = cart.find(item => item.id === productId);

    if (existing) {
        existing.quantity += quantity; // already in cart -> increase quantity
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            quantity: quantity
        });
    }

    saveData('cart.json', cart);
    res.status(201).json({ message: `${product.name} added to your basket!`, items: cart, ...calculateTotals(cart) });
});

// PUT - change the quantity of a cart item  body: { "quantity": 3 }
app.put('/api/cart/:productId', (req, res) => {
    const productId = Number(req.params.productId);
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(quantity)) {
        return res.status(400).json({ error: 'quantity must be a whole number' });
    }

    let cart = readData('cart.json');
    const item = cart.find(i => i.id === productId);
    if (!item) {
        return res.status(404).json({ error: `Product ${req.params.productId} is not in the cart` });
    }

    if (quantity <= 0) {
        cart = cart.filter(i => i.id !== productId); // 0 or less -> remove item
    } else {
        item.quantity = quantity;
    }

    saveData('cart.json', cart);
    res.json({ items: cart, ...calculateTotals(cart) });
});

// DELETE - remove one product from the cart
app.delete('/api/cart/:productId', (req, res) => {
    const productId = Number(req.params.productId);
    const cart = readData('cart.json');
    const item = cart.find(i => i.id === productId);

    if (!item) {
        return res.status(404).json({ error: `Product ${req.params.productId} is not in the cart` });
    }

    const remaining = cart.filter(i => i.id !== productId);
    saveData('cart.json', remaining);
    res.json({ message: `${item.name} removed`, items: remaining, ...calculateTotals(remaining) });
});

// DELETE - clear the whole cart
app.delete('/api/cart', (req, res) => {
    saveData('cart.json', []);
    res.json({ message: 'Cart cleared', items: [], ...calculateTotals([]) });
});

// =====================================================================
// ORDERS (checkout.html)
// =====================================================================

// POST - place an order from the current cart
app.post('/api/orders', (req, res) => {
    const { firstName, lastName, email, address, country, city, zip, paymentMethod } = req.body;

    if (!firstName || !lastName || !email || !address || !country || !city || !zip) {
        return res.status(400).json({
            error: 'firstName, lastName, email, address, country, city and zip are required'
        });
    }
    if (paymentMethod !== 'card' && paymentMethod !== 'cash') {
        return res.status(400).json({ error: 'paymentMethod must be "card" or "cash"' });
    }

    const cart = readData('cart.json');
    if (cart.length === 0) {
        return res.status(400).json({ error: 'Your cart is empty' });
    }

    const orders = readData('orders.json');
    const newOrder = {
        id: getNextId(orders),
        customer: { firstName, lastName, email, address, country, city, zip },
        items: cart,
        ...calculateTotals(cart),
        paymentMethod: paymentMethod, // card numbers are NOT saved
        status: 'CONFIRMED',
        createdAt: new Date().toISOString()
    };

    orders.push(newOrder);
    saveData('orders.json', orders);
    saveData('cart.json', []); // empty the cart after the order

    res.status(201).json({ message: `Order confirmed! Thank you, ${firstName}.`, order: newOrder });
});

// GET all orders
app.get('/api/orders', (req, res) => {
    res.json(readData('orders.json'));
});

// GET one order by id
app.get('/api/orders/:id', (req, res) => {
    const orders = readData('orders.json');
    const order = orders.find(o => o.id === Number(req.params.id));

    if (!order) {
        return res.status(404).json({ error: `Order ${req.params.id} not found` });
    }
    res.json(order);
});

// =====================================================================
// ERROR HANDLING
// =====================================================================

// Any route that does not exist
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Any other error (for example, broken JSON in the request body)
app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = status === 400 ? 'Invalid JSON in request body' : 'Something went wrong on the server';
    res.status(status).json({ error: message });
});

// =====================================================================
// START THE SERVER
// =====================================================================
app.listen(PORT, () => {
    console.log(`AFIYA Store API running at http://localhost:${PORT}`);
});
