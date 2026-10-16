// =====================================================================
// gradeUtils.js  ->  NAMED exports (a file can have MANY named exports)
// Import them with the SAME name inside { }:
//   import { calculateGrade, calculateGPA } from './gradeUtils.js';
// =====================================================================

// Same grading scale as Task 2
export function calculateGrade(marks) {
  if (marks >= 85) return 'A';
  if (marks >= 80) return 'A-';
  if (marks >= 75) return 'B+';
  if (marks >= 70) return 'B';
  if (marks >= 65) return 'B-';
  if (marks >= 60) return 'C+';
  if (marks >= 50) return 'C';
  return 'F';
}

export function getGradePoints(marks) {
  if (marks >= 85) return 4.0;
  if (marks >= 80) return 3.67;
  if (marks >= 75) return 3.33;
  if (marks >= 70) return 3.0;
  if (marks >= 65) return 2.67;
  if (marks >= 60) return 2.33;
  if (marks >= 50) return 2.0;
  return 0.0;
}

export function calculateAverage(marksList) {
  if (marksList.length === 0) return 0;
  const total = marksList.reduce((sum, marks) => sum + marks, 0);
  return Math.round((total / marksList.length) * 100) / 100;
}

// GPA = average of the grade points of each course
// (assumption: every course has the same credit hours)
export function calculateGPA(marksList) {
  if (marksList.length === 0) return 0;
  const totalPoints = marksList.reduce((sum, marks) => sum + getGradePoints(marks), 0);
  return Math.round((totalPoints / marksList.length) * 100) / 100;
}
