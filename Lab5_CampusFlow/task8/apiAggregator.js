// =====================================================================
// TASK 8 - Concurrent Academic API Aggregator with async/await
// Run:  node task8/apiAggregator.js
// =====================================================================
//
// async function -> ALWAYS returns a Promise
// await          -> pauses THIS function until the Promise settles
//                   (the rest of the program keeps running)
// try/catch      -> with await, rejected Promises become normal errors
//                   that we can catch like synchronous code
// =====================================================================

// ---------------------------------------------------------------------
// Custom error types - so we can tell WHAT went wrong
// ---------------------------------------------------------------------
class HttpError extends Error {
  constructor(status, url) {
    super(`HTTP ${status} while requesting ${url}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

class InvalidJSONError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidJSONError';
  }
}

class TimeoutError extends Error {
  constructor(ms) {
    super(`Request timed out after ${ms} ms`);
    this.name = 'TimeoutError';
  }
}

// ---------------------------------------------------------------------
// Fake server data
// ---------------------------------------------------------------------
const fakeDatabase = {
  '/users': [
    { id: 1, name: 'Ali', department: 'CS' },
    { id: 2, name: 'Sara', department: 'CS' },
    { id: 3, name: 'Usman', department: 'SE' },
    { id: 4, name: 'Hina', department: 'AI' },
    { id: 5, name: 'Ahmed', department: 'SE' }
  ],
  '/courses': [
    { code: 'CS301', title: 'Full Stack Web Development' },
    { code: 'CS302', title: 'Design and Analysis of Algorithms' }
  ],
  '/results': [
    { studentId: 1, courseCode: 'CS301', marks: 82 },
    { studentId: 1, courseCode: 'CS302', marks: 76 },
    { studentId: 2, courseCode: 'CS301', marks: 91 },
    { studentId: 2, courseCode: 'CS302', marks: 88 },
    { studentId: 3, courseCode: 'CS301', marks: 45 },
    { studentId: 3, courseCode: 'CS302', marks: 40 },
    { studentId: 4, courseCode: 'CS301', marks: 73 },
    { studentId: 4, courseCode: 'CS302', marks: 69 },
    { studentId: 5, courseCode: 'CS301', marks: 58 },
    { studentId: 5, courseCode: 'CS302', marks: 49 }
  ]
};

// ---------------------------------------------------------------------
// fakeFetch - behaves like the real fetch()
//   - resolves with a "response-shaped" object { ok, status, json() }
//   - REJECTS only for network failure or abort (just like real fetch)
//   - a 404 / 500 is NOT a rejection -> response.ok is false
// ---------------------------------------------------------------------
function fakeFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const signal = options.signal;

    // Simulated delay per URL
    const delay = url === '/slow' ? 3000 : 300;

    const timer = setTimeout(() => {
      switch (url) {
        case '/users':
        case '/courses':
        case '/results':
          resolve(makeResponse(200, JSON.stringify(fakeDatabase[url])));
          break;
        case '/slow':
          resolve(makeResponse(200, JSON.stringify({ message: 'finally arrived' })));
          break;
        case '/invalid-json':
          resolve(makeResponse(200, '{ this is not valid json '));
          break;
        case '/server-error':
          resolve(makeResponse(500, JSON.stringify({ error: 'Internal Server Error' })));
          break;
        case '/network-fail':
          reject(new TypeError('Failed to fetch')); // real fetch rejects with TypeError
          break;
        default:
          resolve(makeResponse(404, JSON.stringify({ error: 'Not Found' })));
      }
    }, delay);

    // If someone aborts the request (AbortController), stop and reject
    if (signal) {
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        const abortError = new Error('The request was aborted');
        abortError.name = 'AbortError'; // same name real fetch uses
        reject(abortError);
      });
    }
  });
}

// Builds an object that looks like a real fetch Response
function makeResponse(status, bodyText) {
  return {
    ok: status >= 200 && status <= 299,
    status: status,
    json: async () => JSON.parse(bodyText) // throws SyntaxError if bodyText is bad
  };
}

// ---------------------------------------------------------------------
// getJSON(url, fetchImplementation)
// ---------------------------------------------------------------------
// The 3rd parameter (options) is optional - used only for the timeout signal.
async function getJSON(url, fetchImplementation, options = {}) {
  let response;

  // 1. call fetch  (network failure = rejection)
  try {
    response = await fetchImplementation(url, options);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error; // let fetchWithTimeout decide what it means
    }
    throw new NetworkError(`Network failure for ${url}: ${error.message}`);
  }

  // 2 & 3. check response.ok and throw for bad HTTP status
  if (!response.ok) {
    throw new HttpError(response.status, url);
  }

  // 4. parse and return JSON  (bad JSON = SyntaxError)
  try {
    return await response.json();
  } catch (error) {
    throw new InvalidJSONError(`Invalid JSON from ${url}: ${error.message}`);
  }
}

// ---------------------------------------------------------------------
// fetchWithTimeout(url, milliseconds)
// ---------------------------------------------------------------------
async function fetchWithTimeout(url, milliseconds) {
  const controller = new AbortController();

  // After "milliseconds", cancel the request
  const timer = setTimeout(() => controller.abort(), milliseconds);

  try {
    return await getJSON(url, fakeFetch, { signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new TimeoutError(milliseconds);
    }
    throw error; // HttpError, NetworkError, InvalidJSONError pass through
  } finally {
    // ALWAYS runs - success or failure - so no timer is left running
    clearTimeout(timer);
    console.log(`   [finally] timer cleared for ${url}`);
  }
}

// Turns any error into a simple category name
function describeError(error) {
  if (error instanceof TimeoutError) return 'TIMEOUT';
  if (error instanceof HttpError) return `HTTP FAILURE (status ${error.status})`;
  if (error instanceof NetworkError) return 'NETWORK FAILURE';
  if (error instanceof InvalidJSONError) return 'INVALID JSON';
  return 'UNKNOWN ERROR';
}

// ---------------------------------------------------------------------
// Dashboard statistics (plain synchronous function)
// ---------------------------------------------------------------------
function buildDashboard(users, courses, results) {
  // Average marks for each student
  const studentAverages = users.map(user => {
    const marks = results.filter(r => r.studentId === user.id).map(r => r.marks);
    const average = marks.length > 0 ? marks.reduce((sum, m) => sum + m, 0) / marks.length : 0;
    return { name: user.name, department: user.department, average: Math.round(average * 100) / 100 };
  });

  const totalMarks = results.reduce((sum, r) => sum + r.marks, 0);
  const overallAverage = results.length > 0 ? Math.round((totalMarks / results.length) * 100) / 100 : 0;

  // Highest performer = highest average
  const topStudent = studentAverages.reduce(
    (best, current) => (best === null || current.average > best.average ? current : best),
    null
  );

  // A student "fails" if their average is below 50
  const failedStudents = studentAverages.filter(s => s.average < 50).length;

  // Department-wise statistics (same idea as Task 2)
  const totals = studentAverages.reduce((acc, s) => {
    if (acc[s.department] === undefined) {
      acc[s.department] = { students: 0, totalAverage: 0, highest: s.average, failed: 0 };
    }
    acc[s.department].students++;
    acc[s.department].totalAverage += s.average;
    if (s.average > acc[s.department].highest) {
      acc[s.department].highest = s.average;
    }
    if (s.average < 50) {
      acc[s.department].failed++;
    }
    return acc;
  }, {});

  const departmentStats = {};
  Object.keys(totals).forEach(dept => {
    const t = totals[dept];
    departmentStats[dept] = {
      students: t.students,
      average: Math.round((t.totalAverage / t.students) * 100) / 100,
      highest: t.highest,
      failed: t.failed
    };
  });

  return {
    totalStudents: users.length,
    totalCourses: courses.length,
    overallAverageMarks: overallAverage,
    highestPerformingStudent: topStudent ? `${topStudent.name} (${topStudent.average})` : 'None',
    failedStudents,
    departmentStats
  };
}

// ---------------------------------------------------------------------
// CONCURRENT dashboard loading
// ---------------------------------------------------------------------
async function loadDashboard(fetchImplementation, urls) {
  // ❌ SEQUENTIAL (slow, ~900ms) - each await waits before starting the next:
  //    const users   = await getJSON('/users', ...);
  //    const courses = await getJSON('/courses', ...);
  //    const results = await getJSON('/results', ...);
  //
  // ✅ CONCURRENT (~300ms) - all three START now, then we wait for all:
  const [users, courses, results] = await Promise.all([
    getJSON(urls.users, fetchImplementation),
    getJSON(urls.courses, fetchImplementation),
    getJSON(urls.results, fetchImplementation)
  ]);
  // Promise.all is right here: the dashboard needs ALL THREE.
  // If any one fails, the whole dashboard fails (fail fast).

  return buildDashboard(users, courses, results);
}

// =====================================================================
// DEMO
// =====================================================================
async function main() {
  const normalUrls = { users: '/users', courses: '/courses', results: '/results' };

  console.log('================ Dashboard (concurrent) ================');
  try {
    const start = Date.now();
    const dashboard = await loadDashboard(fakeFetch, normalUrls);
    console.log(dashboard);
    console.log(`Loaded in about ${Date.now() - start} ms (3 calls x 300ms each, run at the same time)`);
  } catch (error) {
    console.log('Dashboard failed:', describeError(error), '-', error.message);
  }

  console.log('\n================ Dashboard when one service fails ================');
  try {
    await loadDashboard(fakeFetch, { ...normalUrls, results: '/server-error' });
  } catch (error) {
    console.log('Dashboard failed:', describeError(error), '-', error.message);
  }

  console.log('\n================ getJSON test cases ================');
  const tests = ['/users', '/missing-page', '/server-error', '/network-fail', '/invalid-json'];
  for (const url of tests) {
    try {
      const data = await getJSON(url, fakeFetch);
      console.log(`${url} -> 200 OK, received ${data.length} records`);
    } catch (error) {
      console.log(`${url} -> ${describeError(error)}: ${error.message}`);
    }
  }

  console.log('\n================ fetchWithTimeout ================');
  const timeoutTests = [
    { url: '/courses', ms: 1000 },  // fast enough -> success
    { url: '/slow', ms: 1000 },     // takes 3000ms -> timeout
    { url: '/server-error', ms: 1000 }
  ];
  for (const test of timeoutTests) {
    try {
      const data = await fetchWithTimeout(test.url, test.ms);
      console.log(`${test.url} -> success:`, data);
    } catch (error) {
      console.log(`${test.url} -> ${describeError(error)}: ${error.message}`);
    }
  }
}

main();
