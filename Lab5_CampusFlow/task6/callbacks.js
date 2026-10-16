// =====================================================================
// TASK 6 - Legacy Course Registration Service Using Callbacks
// Run:  node task6/callbacks.js
// =====================================================================
//
// ERROR-FIRST CALLBACK convention:   callback(error, value)
//   - failure -> callback(new Error('...'))      (value is left out)
//   - success -> callback(null, value)           (error is null)
//
// Rules we follow in EVERY async function:
//   1. The callback is called EXACTLY ONCE  -> we "return" right after an error
//   2. Errors go THROUGH the callback        -> we never "throw" inside setTimeout
//   3. The callback is ALWAYS called later   -> even errors are inside setTimeout
//      (so the function behaves the same way every time - always async)
//
// No Promises. No async/await.
// =====================================================================

const DELAY = 300; // milliseconds - pretends to be a slow old server

// ---------- Fake "database" of the old system ----------
const studentsDB = {
  101: { id: 101, name: 'Ali', completedCourses: ['CS301', 'CS302'] },
  102: { id: 102, name: 'Sara', completedCourses: [] },
  103: { id: 103, name: 'Usman', completedCourses: ['CS301'] }
};

// NOTE: registerCourse() changes "registered" - registration is
// supposed to change the system's data, so mutation is expected here.
const coursesDB = {
  CS401: { code: 'CS401', title: 'Web Engineering', prerequisite: 'CS301', capacity: 3, registered: [103] },
  CS402: { code: 'CS402', title: 'Cloud Computing', prerequisite: 'CS301', capacity: 1, registered: [103] }
};

// ---------------------------------------------------------------------
// STAGE 1: Load Student
// ---------------------------------------------------------------------
function loadStudent(studentId, callback) {
  setTimeout(() => {
    if (typeof studentId !== 'number') {
      callback(new TypeError(`Invalid student id: "${studentId}"`));
      return; // stop here -> callback is NOT called twice
    }

    const student = studentsDB[studentId];
    if (student === undefined) {
      callback(new Error(`Student ${studentId} does not exist`));
      return;
    }

    callback(null, student);
  }, DELAY);
}

// ---------------------------------------------------------------------
// STAGE 2: Check Prerequisites
// ---------------------------------------------------------------------
function checkPrerequisites(student, courseCode, callback) {
  setTimeout(() => {
    const course = coursesDB[courseCode];
    if (course === undefined) {
      callback(new Error(`Course ${courseCode} does not exist`));
      return;
    }

    if (!student.completedCourses.includes(course.prerequisite)) {
      callback(new Error(`${student.name} has not completed prerequisite ${course.prerequisite}`));
      return;
    }

    callback(null, course);
  }, DELAY);
}

// ---------------------------------------------------------------------
// STAGE 3: Check Available Seats
// ---------------------------------------------------------------------
function checkSeats(course, callback) {
  setTimeout(() => {
    const seatsLeft = course.capacity - course.registered.length;
    if (seatsLeft <= 0) {
      callback(new Error(`Course ${course.code} is full`));
      return;
    }

    callback(null, course);
  }, DELAY);
}

// ---------------------------------------------------------------------
// STAGE 4: Register Course
// ---------------------------------------------------------------------
function registerCourse(student, course, callback) {
  setTimeout(() => {
    if (course.registered.includes(student.id)) {
      callback(new Error(`${student.name} is already registered in ${course.code}`));
      return;
    }

    course.registered.push(student.id);
    callback(null, {
      studentId: student.id,
      course: course.code,
      status: 'REGISTERED'
    });
  }, DELAY);
}

// ---------------------------------------------------------------------
// The full workflow - notice the "pyramid" shape (callback nesting)
// Each stage NEEDS the result of the previous stage, so it must be
// written INSIDE the previous callback.
// ---------------------------------------------------------------------
function registerStudentForCourse(studentId, courseCode, finalCallback) {
  loadStudent(studentId, (error, student) => {
    if (error) return finalCallback(error); // stop immediately

    checkPrerequisites(student, courseCode, (error, course) => {
      if (error) return finalCallback(error);

      checkSeats(course, (error, availableCourse) => {
        if (error) return finalCallback(error);

        registerCourse(student, availableCourse, (error, confirmation) => {
          if (error) return finalCallback(error);

          finalCallback(null, confirmation); // success
        });
      });
    });
  });
}

// =====================================================================
// TEST CASES
// We run them ONE AFTER ANOTHER (also using callbacks):
// when one test finishes, its callback starts the next test.
// =====================================================================
const testCases = [
  { title: 'Success', studentId: 101, course: 'CS401' },
  { title: 'Student does not exist', studentId: 999, course: 'CS401' },
  { title: 'Prerequisite not completed', studentId: 102, course: 'CS401' },
  { title: 'Course is full', studentId: 101, course: 'CS402' },
  { title: 'Already registered', studentId: 101, course: 'CS401' },
  { title: 'Course does not exist', studentId: 101, course: 'CS999' },
  { title: 'Invalid student id', studentId: 'abc', course: 'CS401' }
];

function runTest(index) {
  if (index >= testCases.length) {
    console.log('\nAll tests finished.');
    return;
  }

  const test = testCases[index];
  console.log(`\n--- Test ${index + 1}: ${test.title} ---`);

  registerStudentForCourse(test.studentId, test.course, (error, confirmation) => {
    if (error) {
      console.log(`FAILED -> ${error.name}: ${error.message}`);
    } else {
      console.log('SUCCESS ->', confirmation);
    }
    runTest(index + 1); // start the next test
  });
}

console.log('Starting registrations...');
runTest(0);
console.log('(This line prints FIRST, because setTimeout does not block the program.)');

// =====================================================================
// WHY THIS BECOMES HARD TO MAINTAIN (explanation for the viva)
// =====================================================================
// 1. Callback nesting ("callback hell" / "pyramid of doom"):
//    every dependent step goes one level deeper. With 4 steps it is
//    already 4 levels; with 10 steps the code drifts far to the right
//    and is hard to read, reorder, or change.
//
// 2. Repeated error handling:
//    we must write  if (error) return finalCallback(error);  at EVERY
//    level. Forget it once and the program either continues with bad
//    data or never reports the error.
//
// 3. try/catch does not help:
//    a try/catch around loadStudent(...) cannot catch errors that
//    happen later inside setTimeout - by then the try block is gone.
//    That is why errors are passed as the FIRST callback argument.
//
// 4. "Exactly once" is our responsibility:
//    nothing stops a buggy function from calling the callback twice
//    (e.g. missing "return" after an error). Promises solve this
//    because a Promise can only settle once.
