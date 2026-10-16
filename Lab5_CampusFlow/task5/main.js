// =====================================================================
// main.js  ->  the CALLER. Uses all modules.
// Run:  node task5/main.js
// (package.json has "type": "module", so Node understands import/export)
// =====================================================================

import Student from './Student.js';                                  // DEFAULT import
import { processTranscript, reportToJSON } from './transcriptService.js'; // NAMED imports
import { calculateGrade as gradeFor, calculateGPA } from './gradeUtils.js'; // ALIAS: calculateGrade -> gradeFor

// ---------- Test inputs ----------
const rawData = `
[
  {
    "id": 101,
    "name": "Ali",
    "courses": [
      { "code": "CS301", "marks": 81 },
      { "code": "CS302", "marks": 74 }
    ]
  },
  {
    "id": 102,
    "name": "Sara",
    "courses": [
      { "code": "CS301", "marks": 100 },
      { "code": "CS302", "marks": 0 }
    ]
  }
]
`;

const testCases = [
  { title: 'Valid JSON (normal + boundary 0 and 100)', input: rawData },
  { title: 'Malformed JSON', input: '[{ "id": 101, "name": "Ali", ' },
  { title: 'Missing student id', input: '[{ "name": "Ali", "courses": [] }]' },
  { title: 'Duplicate ids', input: '[{ "id": 1, "name": "A", "courses": [] }, { "id": 1, "name": "B", "courses": [] }]' },
  { title: 'Marks above 100', input: '[{ "id": 5, "name": "Hina", "courses": [{ "code": "CS301", "marks": 105 }] }]' },
  { title: 'Marks below 0', input: '[{ "id": 6, "name": "Usman", "courses": [{ "code": "CS301", "marks": -3 }] }]' },
  { title: 'Missing course code', input: '[{ "id": 7, "name": "Zoya", "courses": [{ "marks": 70 }] }]' },
  { title: 'Not an array', input: '{ "id": 8 }' },
  { title: 'Not a string at all', input: 12345 }
];

// ---------- try / catch / finally ----------
for (const test of testCases) {
  console.log(`\n========== ${test.title} ==========`);
  try {
    const report = processTranscript(test.input);
    console.log('Report is a JS object:', typeof report === 'object', '| total students:', report.totalStudents);
    console.log('Report as JSON:\n' + reportToJSON(report));
  } catch (error) {
    // error.name tells us WHICH type of error it was
    console.log(`REJECTED -> ${error.name}: ${error.message}`);
  } finally {
    // finally runs ALWAYS - success or error
    console.log('(finished processing this transcript)');
  }
}

// ---------- Using the default import + alias directly ----------
console.log('\n========== Using imports directly ==========');
const hina = new Student(201, 'Hina', [{ code: 'CS303', marks: 88 }, { code: 'CS304', marks: 62 }]);
console.log('hina instanceof Student ->', hina instanceof Student);
console.log('Grade for 88 (alias gradeFor) ->', gradeFor(88));
console.log("Hina's GPA ->", calculateGPA(hina.getMarksList()));
