// =====================================================================
// Lab 6 - Q1
// Implement an async/await function that returns a valid user object
// on successful fetching from an API, and returns an error on
// unsuccessful fetching.
//
// Run:  node q1.js     (needs Node.js 18+ for built-in fetch)
// =====================================================================

async function getUser(userId) {
    try {
        // await -> wait here until the API replies
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);

        // fetch does NOT fail for 404/500, so we check response.ok ourselves
        if (!response.ok) {
            throw new Error(`Failed to fetch user (status ${response.status})`);
        }

        const user = await response.json(); // convert the reply into a JS object
        return user;                        // success -> return the user object
    } catch (error) {
        return error;                       // failure -> return the error
    }
}

// Success case: user 1 exists
getUser(1).then(result => {
    if (result instanceof Error) {
        console.log("Error:", result.message);
    } else {
        console.log("User found:", result.name, "-", result.email);
    }
});

// Failure case: user 9999 does not exist (API replies 404)
getUser(9999).then(result => {
    if (result instanceof Error) {
        console.log("Error:", result.message);
    } else {
        console.log("User found:", result.name, "-", result.email);
    }
});
