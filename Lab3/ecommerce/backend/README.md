# AFIYA Store – Backend API (Lab 3, Part 2)

**Student:** Mubashir | **Roll No:** 241845

> Part 2: Write end-points of the e-commerce store (assigned in Lab 3) by using persistent APIs.

This folder adds a REST API to the AFIYA store. The frontend files (`index.html`, `cart.html`, `checkout.html`, `login.html`, `signup.html`, `js/cart.js`) are **unchanged**.

**Persistent** means every change is saved to a JSON file in the `data` folder. Stop the server, start it again, and all products, users, the cart and orders are still there.

## How to run

You need Node.js installed. Open a terminal in this `backend` folder:

```bash
npm install     # only the first time (downloads Express)
npm start       # starts the server
```

The server runs at **http://localhost:3000**. Open that link in a browser to see the list of all endpoints.

To test the POST, PUT and DELETE requests, use **Postman** or the **Thunder Client** extension in VS Code. Set the body to **raw → JSON**.

## Files

```
backend/
├── server.js          all endpoints
├── package.json       project info + Express dependency
├── .gitignore         keeps node_modules out of GitHub
└── data/              ← the persistent storage
    ├── products.json  the 6 AFIYA products
    ├── users.json     registered users (passwords hashed)
    ├── cart.json      current cart
    └── orders.json    placed orders
```

## Endpoints

### Products

| Method | URL | Body (JSON) | What it does |
|---|---|---|---|
| GET | `/api/products` | – | All products |
| GET | `/api/products?category=Organic Food` | – | Products in one category |
| GET | `/api/products/1` | – | One product |
| POST | `/api/products` | `{ "name": "Rose Water", "category": "Natural Skincare", "price": 9.5 }` | Add a product |
| PUT | `/api/products/1` | `{ "price": 20 }` | Update a product |
| DELETE | `/api/products/1` | – | Delete a product |

### Users (signup / login pages)

| Method | URL | Body (JSON) | What it does |
|---|---|---|---|
| POST | `/api/users/signup` | `{ "name": "Mubashir", "rollNo": "241845", "email": "mubashir.241845@example.com", "password": "password123", "confirmPassword": "password123" }` | Register |
| POST | `/api/users/login` | `{ "email": "mubashir.241845@example.com", "password": "password123" }` | Log in |
| GET | `/api/users` | – | All users (without passwords) |

### Cart (cart page)

| Method | URL | Body (JSON) | What it does |
|---|---|---|---|
| GET | `/api/cart` | – | Cart items + subtotal, shipping, total |
| POST | `/api/cart` | `{ "productId": 1, "quantity": 2 }` | Add to cart (quantity is optional, default 1) |
| PUT | `/api/cart/1` | `{ "quantity": 3 }` | Change quantity (0 removes the item) |
| DELETE | `/api/cart/1` | – | Remove one item |
| DELETE | `/api/cart` | – | Clear the cart |

### Orders (checkout page)

| Method | URL | Body (JSON) | What it does |
|---|---|---|---|
| POST | `/api/orders` | `{ "firstName": "Mubashir", "lastName": "Khan", "email": "mubashir.241845@example.com", "address": "House 12, Street 4, Sector G-10", "country": "Pakistan", "city": "Islamabad", "zip": "44000", "paymentMethod": "cash" }` | Place an order from the cart, then empty the cart |
| GET | `/api/orders` | – | All orders |
| GET | `/api/orders/1` | – | One order |

`paymentMethod` is `"card"` or `"cash"`. Card numbers are never saved.

## A good demo order

1. `POST /api/users/signup`, then `POST /api/users/login`
2. `POST /api/cart` with `{ "productId": 1 }` and again with `{ "productId": 2, "quantity": 2 }`
3. `GET /api/cart` to see the totals (shipping is free above $50, same rule as `cart.js`)
4. `POST /api/orders` to place the order, then `GET /api/cart` to show it's now empty
5. **Stop the server (Ctrl + C), start it again, and call `GET /api/orders`. The order is still there. That's persistence.**

## Status codes used

| Code | Meaning | Example |
|---|---|---|
| 200 | OK | Getting products |
| 201 | Created | New product, new user, new order |
| 400 | Bad Request | Missing fields, negative price, empty cart |
| 401 | Unauthorized | Wrong email or password |
| 404 | Not Found | Product or order id doesn't exist |
| 409 | Conflict | Signing up with an email that's already registered |
| 500 | Server Error | Anything unexpected |

## Viva notes

- **What makes it persistent?** `saveData()` writes to a JSON file with `fs.writeFileSync`, and `readData()` reads it back with `fs.readFileSync`. Data kept in a normal variable would be lost when the server stops.
- **REST methods:** GET = read, POST = create, PUT = update, DELETE = remove.
- **`express.json()`** lets Express read the JSON body of a request into `req.body`.
- **`req.params`** holds values from the URL path (`/api/products/:id` → `req.params.id`). **`req.query`** holds values after `?` (`?category=...`).
- **`res.status(404).json({...})`** sends a status code and a JSON reply.
- **Why hash passwords?** If someone opens `users.json`, they see only the hash, not the real password. We use Node's built-in `crypto`, so no extra package is needed.
- **Why JSON files and not a database?** They're simple, need no installation, and are easy to open and show. A real store would use a database such as MongoDB or MySQL, but the endpoints would look almost the same.
