# Lab 6 – async/await and Promise.all

Plain Node.js, no packages. Needs **Node.js 18 or newer** (for the built-in `fetch`) and an internet connection.

Test API: [JSONPlaceholder](https://jsonplaceholder.typicode.com), a free fake API for practice.

## Q1 – async/await user fetch

> Implement an async/await function that returns a valid user object on successful fetching from an API and returns an error on unsuccessful fetching.

```bash
node q1.js
```

Expected output (the order of the two lines can change, because both requests run at the same time):

```
User found: Leanne Graham - Sincere@april.biz
Error: Failed to fetch user (status 404)
```

## Q2 – Promise.all

> Use Promise.all to catch multiple promises returned by two asynchronous operations, and then reject or accept the main promise based on whether the details fetched by both async functions are valid or not.

```bash
node q2.js
```

Expected output:

```
Both user and post data are valid
```

## Key points

- **`async`** functions always return a Promise. **`return`** resolves it and **`throw`** rejects it.
- **`await`** waits for a Promise to finish before moving to the next line.
- **`fetch` does not fail on 404 or 500.** It only fails if there's no network. That's why we check `response.ok` ourselves.
- **`Promise.all([a, b])`** runs both at the same time. It resolves when **both** succeed, and rejects as soon as **either** fails.
