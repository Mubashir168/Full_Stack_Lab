// =====================================================================
// transcriptService.js  ->  JSON processing for transcripts
// =====================================================================
//
// Flow:  JSON text  --parse-->  JS array  --validate-->  Student objects
//        --build report-->  JS report object  --stringify-->  JSON text
//
// Error types used:
//   SyntaxError -> the JSON text is broken (malformed)
//   TypeError   -> a value has the wrong TYPE (e.g. courses is not an array)
//   RangeError  -> a number is outside the allowed range (marks < 0 or > 100)
//   Error       -> general rule broken (missing id, duplicate id, missing code)
// =====================================================================

import Student from './Student.js';                                         // default import
import { calculateGrade, calculateAverage, calculateGPA } from './gradeUtils.js'; // named imports

// ---------- 1. Parse JSON safely ----------
export function parseTranscriptJSON(rawText) {
  if (typeof rawText !== 'string') {
    throw new TypeError('Transcript data must be a JSON string');
  }

  let data;
  try {
    data = JSON.parse(rawText);
  } catch (error) {
    // Re-throw with a clearer message
    throw new SyntaxError(`Malformed JSON: ${error.message}`);
  }

  if (!Array.isArray(data)) {
    throw new TypeError('Transcript JSON must be an array of students');
  }
  return data;
}

// ---------- 2. Validate one course ----------
function validateCourse(course, studentId) {
  if (typeof course !== 'object' || course === null) {
    throw new TypeError(`Student ${studentId}: each course must be an object`);
  }
  if (typeof course.code !== 'string' || course.code.trim() === '') {
    throw new Error(`Student ${studentId}: course code is missing`);
  }
  if (typeof course.marks !== 'number' || Number.isNaN(course.marks)) {
    throw new TypeError(`Student ${studentId}, ${course.code}: marks must be a number`);
  }
  if (course.marks < 0 || course.marks > 100) {
    throw new RangeError(`Student ${studentId}, ${course.code}: marks ${course.marks} must be between 0 and 100`);
  }
}

// ---------- 3. Validate all students ----------
export function validateStudents(studentList) {
  const seenIds = new Set(); // a Set stores unique values only

  for (const item of studentList) {
    if (typeof item !== 'object' || item === null) {
      throw new TypeError('Each student must be an object');
    }
    if (item.id === undefined || item.id === null) {
      throw new Error(`Student "${item.name ?? 'unknown'}" has no id`);
    }
    if (seenIds.has(item.id)) {
      throw new Error(`Duplicate student id: ${item.id}`);
    }
    seenIds.add(item.id);

    if (!Array.isArray(item.courses)) {
      throw new TypeError(`Student ${item.id}: courses must be an array`);
    }
    for (const course of item.courses) {
      validateCourse(course, item.id);
    }
  }
  return true;
}

// ---------- 4. Build the report object ----------
export function generateReport(studentList) {
  const students = studentList.map(item => new Student(item.id, item.name, item.courses));

  const studentReports = students.map(student => {
    const marksList = student.getMarksList();
    return {
      id: student.id,
      name: student.name,
      courses: student.courses.map(c => ({ code: c.code, marks: c.marks, grade: calculateGrade(c.marks) })),
      average: calculateAverage(marksList),
      gpa: calculateGPA(marksList)
    };
  });

  return {
    totalStudents: studentReports.length,
    students: studentReports
  };
}

// ---------- 5. Convert report back to JSON ----------
export function reportToJSON(report) {
  return JSON.stringify(report, null, 2); // null, 2 -> pretty print with 2 spaces
}

// ---------- One function that does everything ----------
export function processTranscript(rawText) {
  const data = parseTranscriptJSON(rawText);
  validateStudents(data);
  return generateReport(data);
}
