// =====================================================================
// Lab 6 - Q2
// Use Promise.all to catch the promises returned by two asynchronous
// operations, then reject or accept the main promise based on whether
// the details fetched by both async functions are valid or not.
//
// Run:  node q2.js     (needs Node.js 18+ for built-in fetch)
// =====================================================================

// Async operation 1
async function getUser() {
    const response = await fetch("https://jsonplaceholder.typicode.com/users/1");

    if (!response.ok) {
        throw new Error("User not found");
    }

    return await response.json();
}

// Async operation 2
async function getPost() {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts/1");

    if (!response.ok) {
        throw new Error("Post not found");
    }

    return await response.json();
}

// The main promise
// In an async function:  return = ACCEPT (resolve)   throw = REJECT
async function checkData() {
    // Promise.all starts BOTH requests at the same time and waits for both.
    // If either one fails, Promise.all rejects straight away.
    const results = await Promise.all([getUser(), getPost()]);

    const user = results[0];
    const post = results[1];

    // Are the details from BOTH functions valid?
    if (user.id && user.name && post.id && post.title) {
        return "Both user and post data are valid";   // accept
    } else {
        throw new Error("Invalid data");             // reject
    }
}

checkData()
    .then(result => console.log(result))          // runs if accepted
    .catch(error => console.log(error.message));  // runs if rejected
