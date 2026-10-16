// =====================================================================
// Student.js  ->  DEFAULT export (only ONE default export per file)
// Import it with ANY name:  import Student from './Student.js';
// =====================================================================

export default class Student {
  constructor(id, name, courses) {
    this.id = id;
    this.name = name;
    this.courses = courses; // array like [{ code: 'CS301', marks: 81 }]
  }

  // Returns just the marks, e.g. [81, 74]
  getMarksList() {
    return this.courses.map(course => course.marks);
  }
}
