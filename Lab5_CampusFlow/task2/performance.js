// =====================================================================
// TASK 2 - Academic Performance Intelligence Engine
// Run:  node task2/performance.js
// =====================================================================
//
// Array methods used here (and what each one returns):
//   forEach   -> nothing (just loops)            | does NOT change the array
//   map       -> NEW array, same length           | does NOT change the array
//   filter    -> NEW array, only matching items   | does NOT change the array
//   find      -> FIRST matching item / undefined  | does NOT change the array
//   findIndex -> index of first match / -1        | does NOT change the array
//   reduce    -> ONE value built from all items   | does NOT change the array
//   some      -> true if AT LEAST ONE matches      | does NOT change the array
//   every     -> true if ALL match                | does NOT change the array
//   slice     -> NEW copy (part or whole)         | does NOT change the array
//   sort      -> sorts IN PLACE                   | ⚠ CHANGES (mutates) the array!
//
// Because sort() mutates, we always do  list.slice().sort(...)
// =====================================================================

const PASS_MARKS = 50;

// ---------- A. Result Processing ----------

// NOTE: In the lab sheet "80-84" and "65-69" both appear as plain "A" and "B".
// The minus signs look lost in the document, so I used A- and B-
// (the standard university scale). Change here if the teacher says otherwise.
function getGradeInfo(marks) {
  if (marks >= 85) return { grade: 'A', gradePoints: 4.0 };
  if (marks >= 80) return { grade: 'A-', gradePoints: 3.67 };
  if (marks >= 75) return { grade: 'B+', gradePoints: 3.33 };
  if (marks >= 70) return { grade: 'B', gradePoints: 3.0 };
  if (marks >= 65) return { grade: 'B-', gradePoints: 2.67 };
  if (marks >= 60) return { grade: 'C+', gradePoints: 2.33 };
  if (marks >= 50) return { grade: 'C', gradePoints: 2.0 };
  return { grade: 'F', gradePoints: 0.0 };
}

function isValidMarks(marks) {
  return typeof marks === 'number' && !Number.isNaN(marks) && marks >= 0 && marks <= 100;
}

// map() -> builds a NEW array of NEW objects. Original stays the same.
function processResults(list) {
  return list.map(student => {
    if (!isValidMarks(student.marks)) {
      return { ...student, grade: 'N/A', gradePoints: 0, status: 'INVALID MARKS' };
    }

    const gradeInfo = getGradeInfo(student.marks);
    return {
      ...student, // copy id, name, department, course, marks
      grade: gradeInfo.grade,
      gradePoints: gradeInfo.gradePoints,
      status: student.marks >= PASS_MARKS ? 'PASS' : 'FAIL'
    };
  });
}

// ---------- B. Ranked Merit List ----------
function getRankedList(list) {
  // slice() first -> sort the COPY, not the original
  return list.slice().sort((a, b) => {
    if (b.marks !== a.marks) {
      return b.marks - a.marks; // higher marks first
    }
    return a.name.localeCompare(b.name); // same marks -> alphabetical
  });
}

// ---------- C. Department Statistics ----------
// Works for ANY department name, because we create the key when we first see it.
function getDepartmentStats(list) {
  // Step 1: reduce -> collect totals per department
  const totals = list.reduce((acc, student) => {
    const dept = student.department;

    if (acc[dept] === undefined) {
      acc[dept] = { students: 0, totalMarks: 0, highest: student.marks, passed: 0 };
    }

    acc[dept].students++;
    acc[dept].totalMarks += student.marks;
    if (student.marks > acc[dept].highest) {
      acc[dept].highest = student.marks;
    }
    if (student.marks >= PASS_MARKS) {
      acc[dept].passed++;
    }
    return acc; // reduce ALWAYS needs the accumulator returned
  }, {});

  // Step 2: turn totals into averages
  const stats = {};
  Object.keys(totals).forEach(dept => {
    const t = totals[dept];
    stats[dept] = {
      students: t.students,
      average: Math.round((t.totalMarks / t.students) * 100) / 100,
      highest: t.highest,
      passed: t.passed
    };
  });
  return stats;
}

// ---------- D. Academic Queries ----------
function getOverallAverage(list) {
  if (list.length === 0) return 0; // avoid divide by zero
  const total = list.reduce((sum, student) => sum + student.marks, 0);
  return Math.round((total / list.length) * 100) / 100;
}

function runQueries(allStudents) {
  // Statistics only use VALID records (a string like '75' would break the sum)
  const list = allStudents.filter(s => isValidMarks(s.marks));
  const average = getOverallAverage(list);
  const firstAbove85 = list.find(s => s.marks > 85);
  const firstFailedIndex = list.findIndex(s => s.marks < PASS_MARKS);

  return {
    firstStudentAbove85: firstAbove85 ? firstAbove85.name : 'None',
    indexOfFirstFailed: firstFailedIndex, // -1 means nobody failed
    anyoneFailed: list.some(s => s.marks < PASS_MARKS),
    allMarksValid: allStudents.every(s => isValidMarks(s.marks)), // checks EVERY record
    overallAverage: average,
    aboveAverage: list.filter(s => s.marks > average).map(s => s.name),
    topThree: getRankedList(list).slice(0, 3).map(s => s.name)
  };
}

// ---------- Run everything for one data set ----------
function analyse(title, list) {
  console.log(`\n================ ${title} ================`);

  // Guard: only valid records go into the statistics
  const validList = list.filter(s => isValidMarks(s.marks));

  console.log('\nA. Processed results:');
  processResults(list).forEach(r => {
    console.log(`  ${r.name.padEnd(6)} ${r.department}  marks: ${r.marks}  grade: ${r.grade}  GP: ${r.gradePoints}  ${r.status}`);
  });

  console.log('\nB. Ranked merit list:');
  getRankedList(validList).forEach((s, index) => {
    console.log(`  ${index + 1}. ${s.name} - ${s.marks}`);
  });

  console.log('\nC. Department statistics:');
  console.log(getDepartmentStats(validList));

  console.log('\nD. Queries:');
  console.log(runQueries(list));
}

// =====================================================================
// TEST CASES
// =====================================================================
const results = [
  { id: 1, name: 'Ali', department: 'CS', course: 'FSWD', marks: 82 },
  { id: 2, name: 'Sara', department: 'CS', course: 'FSWD', marks: 91 },
  { id: 3, name: 'Usman', department: 'SE', course: 'FSWD', marks: 47 },
  { id: 4, name: 'Hina', department: 'AI', course: 'FSWD', marks: 73 },
  { id: 5, name: 'Ahmed', department: 'SE', course: 'FSWD', marks: 64 },
  { id: 6, name: 'Zoya', department: 'AI', course: 'FSWD', marks: 91 }
];

// Keep a copy of the original order to PROVE it was not changed
const originalOrder = results.map(s => s.id).join(',');

analyse('NORMAL DATA', results);

// New department "DS" + boundary marks (0, 50, 100, 84/85)
const withNewDepartment = [
  ...results,
  { id: 7, name: 'Bilal', department: 'DS', course: 'FSWD', marks: 100 },
  { id: 8, name: 'Amna', department: 'DS', course: 'FSWD', marks: 50 },
  { id: 9, name: 'Faisal', department: 'DS', course: 'FSWD', marks: 0 },
  { id: 10, name: 'Nida', department: 'CS', course: 'FSWD', marks: 84 }
];
analyse('NEW DEPARTMENT + BOUNDARY MARKS', withNewDepartment);

// Invalid marks
const withInvalid = [
  ...results,
  { id: 11, name: 'Ghost', department: 'CS', course: 'FSWD', marks: 120 },
  { id: 12, name: 'Blank', department: 'SE', course: 'FSWD', marks: '75' }
];
analyse('INVALID MARKS', withInvalid);

// Empty array (nobody passes the find / every / some checks)
analyse('EMPTY LIST', []);

const orderAfter = results.map(s => s.id).join(',');
console.log('\nOriginal array unchanged after sorting?', originalOrder === orderAfter);
