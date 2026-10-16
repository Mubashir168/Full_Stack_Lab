// =====================================================================
// TASK 7 - Promise-Based Multi-Service Registration Engine
// Run:  node task7/promises.js
// =====================================================================
//
// A Promise = an object that represents a value that will arrive LATER.
// It has 3 states:   pending  ->  fulfilled (resolve)  OR  rejected (reject)
// Once settled it can NEVER change again (fixes "callback called twice").
//
//   .then(fn)    -> runs when fulfilled. Whatever fn RETURNS goes to the next .then
//   .catch(fn)   -> runs when ANY earlier step rejected
//   .finally(fn) -> runs ALWAYS (success or failure)
// =====================================================================

// Helper: make a delay so services behave like real network calls
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ---------- Fake data ----------
const studentsDB = {
  101: { id: 101, name: 'Ali', email: 'ali@uni.edu', phone: null, completedCourses: ['CS301'] },
  102: { id: 102, name: 'Sara', email: 'sara@uni.edu', phone: '03001112233', completedCourses: [] },
  103: { id: 103, name: 'Hina', email: 'hina@uni.edu', phone: '03004445566', completedCourses: ['CS301'] }
};

const coursesDB = {
  CS401: { code: 'CS401', title: 'Web Engineering', prerequisite: 'CS301', capacity: 30, registered: [] },
  CS402: { code: 'CS402', title: 'Cloud Computing', prerequisite: 'CS301', capacity: 0, registered: [] }
};

// =====================================================================
// SERVICES - each one returns a Promise
// Each stage returns an object { student, course } so the NEXT stage
// gets all the data it needs (data propagation through the chain).
// =====================================================================

function getStudent(studentId) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const student = studentsDB[studentId];
      if (student === undefined) {
        reject(new Error(`Student ${studentId} not found`));
      } else {
        resolve(student);
      }
    }, 200);
  });
}

function getCourse(student, courseCode) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const course = coursesDB[courseCode];
      if (course === undefined) {
        reject(new Error(`Course ${courseCode} not found`));
      } else {
        resolve({ student, course });
      }
    }, 200);
  });
}

function checkPrerequisites(data) {
  return new Promise((resolve, reject) => {
    // Guard: catches the "missing return" bug (data would be undefined)
    if (!data || !data.student || !data.course) {
      reject(new TypeError('checkPrerequisites received no data - did a .then() forget to return?'));
      return;
    }
    setTimeout(() => {
      const { student, course } = data;
      if (!student.completedCourses.includes(course.prerequisite)) {
        reject(new Error(`${student.name} has not completed ${course.prerequisite}`));
      } else {
        resolve(data);
      }
    }, 200);
  });
}

function checkSeats(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const { course } = data;
      if (course.registered.length >= course.capacity) {
        reject(new Error(`Course ${course.code} is full`));
      } else {
        resolve(data);
      }
    }, 200);
  });
}

function registerStudent(data) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const { student, course } = data;
      if (course.registered.includes(student.id)) {
        reject(new Error(`${student.name} is already registered in ${course.code}`));
        return;
      }
      course.registered.push(student.id);
      resolve({ studentId: student.id, studentName: student.name, course: course.code, status: 'REGISTERED' });
    }, 200);
  });
}

// ---------- Post-registration services ----------
function sendEmail(confirmation) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const student = studentsDB[confirmation.studentId];
      if (!student.email) {
        reject(new Error('No email address'));
      } else {
        resolve(`Email sent to ${student.email}`);
      }
    }, 300);
  });
}

function sendSMS(confirmation) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const student = studentsDB[confirmation.studentId];
      if (!student.phone) {
        reject(new Error('No phone number on record'));
      } else {
        resolve(`SMS sent to ${student.phone}`);
      }
    }, 100);
  });
}

function writeAuditLog(confirmation) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`Audit: student ${confirmation.studentId} registered in ${confirmation.course}`);
    }, 200);
  });
}

// =====================================================================
// PART A - Registration chain
// =====================================================================
function registrationChain(studentId, courseCode) {
  return getStudent(studentId)
    .then(student => getCourse(student, courseCode)) // arrow with no { } returns automatically
    .then(data => checkPrerequisites(data))
    .then(data => checkSeats(data))
    .then(data => registerStudent(data));
  // If ANY step rejects, all following .then() are skipped
  // and the error jumps straight to the .catch() of the caller.
}

// BROKEN version on purpose: { } without "return"
function brokenRegistrationChain(studentId, courseCode) {
  return getStudent(studentId)
    .then(student => {
      getCourse(student, courseCode); // ❌ NO return -> next .then receives undefined
    })
    .then(data => checkPrerequisites(data)) // data is undefined here
    .then(data => checkSeats(data))
    .then(data => registerStudent(data));
}

// =====================================================================
// PART B - Post-registration services with Promise.allSettled
// =====================================================================
// Why allSettled?  The 3 services are independent. We want the result
// of ALL of them, even if one fails.
//   Promise.all        -> stops at the FIRST rejection (we'd lose the others' results) ❌
//   Promise.allSettled -> waits for ALL, tells us fulfilled / rejected for each      ✅
function runPostRegistration(confirmation) {
  const serviceNames = ['Email', 'SMS', 'Audit'];

  return Promise.allSettled([
    sendEmail(confirmation),
    sendSMS(confirmation),
    writeAuditLog(confirmation)
  ]).then(outcomes =>
    outcomes.map((outcome, index) => ({
      service: serviceNames[index],
      status: outcome.status,
      detail: outcome.status === 'fulfilled' ? outcome.value : outcome.reason.message
    }))
  );
}

// =====================================================================
// PART C - Two course servers, use Promise.any
// =====================================================================
// Why Promise.any?  We want the FIRST SUCCESSFUL answer.
//   Promise.race -> first to SETTLE (even if it is an error!)        ❌
//   Promise.any  -> first to FULFILL; ignores failures until all fail ✅
//                   if ALL fail -> rejects with an AggregateError
function fetchCourseFromServer(serverName, courseCode, delay, shouldFail) {
  return wait(delay).then(() => {
    if (shouldFail) {
      throw new Error(`${serverName} is down`); // throw inside .then = reject
    }
    return { server: serverName, course: coursesDB[courseCode] };
  });
}

// =====================================================================
// DEMO - each part runs after the previous one finishes
// =====================================================================
function partA() {
  console.log('================ PART A: Registration chain ================');

  return registrationChain(101, 'CS401')
    .then(confirmation => {
      console.log('SUCCESS ->', confirmation);
      return runPostRegistration(confirmation); // Part B starts after success
    })
    .then(report => {
      console.log('\n================ PART B: Post-registration report ================');
      console.log(report);
    })
    .catch(error => console.log(`FAILED -> ${error.message}`))
    .finally(() => console.log('(registration attempt 1 finished)\n'));
}

// Runs one registration and prints the outcome
function tryRegistration(title, studentId, courseCode) {
  return registrationChain(studentId, courseCode)
    .then(confirmation => console.log(`${title}: SUCCESS`, confirmation))
    .catch(error => console.log(`${title}: FAILED -> ${error.message}`));
}

// Failure cases, one after another
function partAFailures() {
  return tryRegistration('Student not found', 999, 'CS401')
    .then(() => tryRegistration('Prerequisite missing', 102, 'CS401'))
    .then(() => tryRegistration('Course full', 103, 'CS402'))
    .then(() => tryRegistration('Already registered', 101, 'CS401'));
}

function partABroken() {
  console.log('\n---- Broken chain (missing return) ----');
  return brokenRegistrationChain(103, 'CS401')
    .then(confirmation => console.log('SUCCESS ->', confirmation))
    .catch(error => console.log(`FAILED -> ${error.name}: ${error.message}`))
    .finally(() => console.log('(broken chain finished)'));
}

function partC() {
  console.log('\n================ PART C: Server selection ================');

  // Server B answers FIRST but FAILS. Server A is slower but works.
  const serverA = () => fetchCourseFromServer('Server A', 'CS401', 500, false);
  const serverB = () => fetchCourseFromServer('Server B', 'CS401', 100, true);

  return Promise.any([serverA(), serverB()])
    .then(result => console.log(`Promise.any  -> got course "${result.course.title}" from ${result.server}`))
    .then(() => Promise.race([serverA(), serverB()]))
    .then(result => console.log('Promise.race ->', result.server))
    .catch(error => console.log(`Promise.race -> rejected: ${error.message}  (that is why race is the wrong choice)`))
    .then(() => Promise.any([
      fetchCourseFromServer('Server A', 'CS401', 100, true),
      fetchCourseFromServer('Server B', 'CS401', 200, true)
    ]))
    .catch(error => {
      console.log(`Both servers down -> ${error.name}:`, error.errors.map(e => e.message));
    });
}

partA()
  .then(() => {
    console.log('---- Failure cases ----');
    return partAFailures();
  })
  .then(() => partABroken())
  .then(() => partC());
