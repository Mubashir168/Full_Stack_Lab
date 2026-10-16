// =====================================================================
// TASK 4 - University User Hierarchy and Dynamic "this"
// Run:  node task4/users.js
// =====================================================================
//
//            Person
//              |
//      +-------+--------+
//      |                |
//   Student       FacultyMember
//
// Key words:
//   class       -> blueprint for creating objects
//   constructor -> runs automatically when we use "new"
//   new         -> creates a new object and sets "this" to it
//   extends     -> child class inherits from parent class
//   super(...)  -> calls the PARENT constructor
//   super.x()   -> calls the PARENT version of a method
//   this        -> "the object that is calling the method right now"
// =====================================================================

class Person {
  constructor(name, email) {
    // Validate input
    if (typeof name !== 'string' || name.trim() === '') {
      throw new TypeError('name must be a non-empty string');
    }
    if (typeof email !== 'string' || !email.includes('@')) {
      throw new TypeError('email must be a valid email address');
    }

    this.name = name;
    this.email = email;
  }

  introduce() {
    return `Hello, I am ${this.name} (${this.email}).`;
  }
}

class Student extends Person {
  constructor(name, email, rollNo, marks) {
    super(name, email); // MUST be called before using "this" in a child class

    if (typeof marks !== 'number' || marks < 0 || marks > 100) {
      throw new RangeError('marks must be a number between 0 and 100');
    }

    this.rollNo = rollNo;
    this.marks = marks;
  }

  // METHOD OVERRIDING: same name as parent, new behaviour.
  // super.introduce() REUSES the parent's sentence.
  introduce() {
    return `${super.introduce()} I am a student, roll no ${this.rollNo}.`;
  }

  getResult() {
    return this.marks >= 50 ? `${this.name}: PASS (${this.marks})` : `${this.name}: FAIL (${this.marks})`;
  }
}

class FacultyMember extends Person {
  constructor(name, email, employeeId, department) {
    super(name, email);
    this.employeeId = employeeId;
    this.department = department;
  }

  introduce() {
    return `${super.introduce()} I teach in the ${this.department} department (ID: ${this.employeeId}).`;
  }
}

// =====================================================================
// RUNTIME POLYMORPHISM
// Different objects in ONE array. Same call user.introduce(),
// but JavaScript picks the correct version for EACH object at run time.
// =====================================================================
const users = [
  new Student('Ali', 'ali@uni.edu', 'BSCS-101', 82),
  new FacultyMember('Dr. Sara', 'sara@uni.edu', 'EMP-11', 'Computer Science'),
  new Student('Hina', 'hina@uni.edu', 'BSAI-205', 45),
  new FacultyMember('Mr. Usman', 'usman@uni.edu', 'EMP-27', 'Software Engineering'),
  new Person('Visitor', 'visitor@uni.edu')
];

console.log('========== users.forEach(user => user.introduce()) ==========');
users.forEach(user => console.log(user.introduce()));

console.log('\n========== getResult() only for students ==========');
users.forEach(user => {
  if (user instanceof Student) {
    console.log(user.getResult());
  }
});

console.log('\n========== instanceof ==========');
const ali = users[0];
const drSara = users[1];
console.log('ali instanceof Student       ->', ali instanceof Student);       // true
console.log('ali instanceof Person        ->', ali instanceof Person);        // true (parent)
console.log('ali instanceof FacultyMember ->', ali instanceof FacultyMember); // false
console.log('drSara instanceof Person     ->', drSara instanceof Person);     // true

// =====================================================================
// this, call() and bind()
// =====================================================================
const guest = {
  name: 'Dr. Ahmed',
  email: 'ahmed@example.com'
};

console.log('\n========== call() ==========');
// guest is a plain object, it has NO introduce() method.
// call() runs Person's introduce and sets "this" = guest for that one call.
console.log(Person.prototype.introduce.call(guest));

console.log('\n========== Detached method ==========');
const student = new Student('Zoya', 'zoya@uni.edu', 'BSSE-310', 91);
const fn = student.introduce; // we copied ONLY the function, not the object

try {
  fn(); // called alone -> no object before the dot -> "this" is undefined
} catch (error) {
  console.log(`${error.name}: ${error.message}`);
  console.log('Reason: "this" is undefined because fn() was called without an object.');
  console.log('(Class code always runs in strict mode, so "this" is undefined, not the global object.)');
}

console.log('\n========== bind() ==========');
// bind() returns a NEW function where "this" is permanently fixed to student
const boundIntroduce = student.introduce.bind(student);
console.log(boundIntroduce());

const boundResult = student.getResult.bind(student);
console.log(boundResult());

// =====================================================================
// Invalid cases
// =====================================================================
console.log('\n========== Invalid cases ==========');
try {
  new Student('', 'x@uni.edu', 'R-1', 50);
} catch (error) {
  console.log(`${error.name}: ${error.message}`);
}
try {
  new Student('Bilal', 'bilal@uni.edu', 'R-2', 150);
} catch (error) {
  console.log(`${error.name}: ${error.message}`);
}
try {
  Student('Bilal', 'bilal@uni.edu', 'R-2', 50); // forgot "new"
} catch (error) {
  console.log(`${error.name}: ${error.message}`);
}
