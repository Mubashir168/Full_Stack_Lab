// =====================================================================
// TASK 3 - Safe Student Profile Update Service
// Run:  node task3/profileUpdate.js
// =====================================================================
//
// Goal: return a NEW student object with the changes applied.
//       The ORIGINAL student must stay exactly the same.
//
// Main trick: the spread operator { ...obj } copies only ONE level
// (a "shallow copy"). Nested objects (address, contact) must be
// spread separately, otherwise the new object would SHARE them
// with the original.
// =====================================================================

const student = {
  id: 101,
  name: 'Ali',
  marks: 0,
  scholarship: false,
  address: {
    city: 'Islamabad',
    sector: 'F-10'
  },
  contact: {
    email: 'ali@university.edu'
  }
};

const update = {
  name: 'Ali Khan',
  address: {
    city: 'Rawalpindi'
  },
  contact: {
    phone: '03001234567'
  }
};

// ---------------------------------------------------------------------
// The main service
// ---------------------------------------------------------------------
// Default parameter: if no update is passed, use {}
function updateProfile(original, changes = {}) {
  // Guard clause: handle invalid input
  if (typeof original !== 'object' || original === null) {
    throw new TypeError('original student must be an object');
  }
  if (typeof changes !== 'object' || changes === null) {
    throw new TypeError('update must be an object');
  }

  // OBJECT DESTRUCTURING + RENAMING + DEFAULT VALUES + OBJECT REST
  //   address: oldAddress   -> take "address" but call it "oldAddress"
  //   = {}                  -> default used ONLY if the value is undefined
  //   ...otherFields        -> "everything else" (id, name, marks, scholarship)
  const { address: oldAddress = {}, contact: oldContact = {}, ...otherFields } = original;

  const { address: addressChanges = {}, contact: contactChanges = {}, ...otherChanges } = changes;

  // SPREAD OPERATOR: later properties overwrite earlier ones
  const address = { ...oldAddress, ...addressChanges }; // city changes, sector stays
  const contact = { ...oldContact, ...contactChanges }; // email stays, phone added

  // PROPERTY SHORTHAND: { address } is the same as { address: address }
  return { ...otherFields, ...otherChanges, address, contact };
}

// REST PARAMETERS: accept ANY number of updates  -> updates is a real array
function applyManyUpdates(original, ...updates) {
  let current = original;
  for (const singleUpdate of updates) {
    current = updateProfile(current, singleUpdate);
  }
  return current;
}

// NESTED DESTRUCTURING + RENAMING + DEFAULTS + OPTIONAL CHAINING + ??
function describeStudent(person) {
  const {
    name,
    marks,
    address: { city: livesIn = 'Unknown city', sector = 'Unknown sector' } = {},
    contact: { email, phone = 'No phone added' } = {}
  } = person;

  // OPTIONAL CHAINING (?.) -> no crash if "guardian" does not exist
  // NULLISH COALESCING (??) -> use the fallback ONLY for null/undefined
  const guardianName = person.guardian?.name ?? 'No guardian on record';

  // ARRAY DESTRUCTURING: first item, then the rest
  const [firstName, ...otherNames] = name.split(' ');

  return {
    firstName,
    lastName: otherNames.length > 0 ? otherNames.join(' ') : '(none)',
    marks,
    livesIn,
    sector,
    email,
    phone,
    guardianName
  };
}

// =====================================================================
// DEMO
// =====================================================================
const snapshotBefore = JSON.stringify(student);

const updatedStudent = updateProfile(student, update);

console.log('================ ORIGINAL ================');
console.log(student);
console.log('\n================ UPDATED ================');
console.log(updatedStudent);

console.log('\nOriginal unchanged?', JSON.stringify(student) === snapshotBefore);

console.log('\n================ Destructuring demo ================');
console.log(describeStudent(updatedStudent));

// ---------------------------------------------------------------------
// 0, false and '' must NOT be replaced with defaults
// ---------------------------------------------------------------------
console.log('\n================ 0 / false / "" are kept ================');

// Default values in destructuring only apply to "undefined"
const { marks = 50, scholarship = true } = student;
console.log('marks with default 50 ->', marks);              // 0  (kept)
console.log('scholarship with default true ->', scholarship); // false (kept)

// || vs ??  (common viva question)
console.log('student.marks || "N/A" ->', student.marks || 'N/A'); // "N/A"  (WRONG: 0 is falsy)
console.log('student.marks ?? "N/A" ->', student.marks ?? 'N/A'); // 0      (CORRECT)

const zeroUpdate = updateProfile(updatedStudent, { marks: 0, scholarship: false, contact: { phone: '' } });
console.log('After update with 0 / false / "":', {
  marks: zeroUpdate.marks,
  scholarship: zeroUpdate.scholarship,
  phone: zeroUpdate.contact.phone
});

// ---------------------------------------------------------------------
// Rest parameters demo
// ---------------------------------------------------------------------
console.log('\n================ Many updates (rest parameters) ================');
const afterMany = applyManyUpdates(
  student,
  { marks: 88 },
  { scholarship: true },
  { address: { sector: 'G-9' } }
);
console.log(afterMany);

// ---------------------------------------------------------------------
// Edge / invalid cases
// ---------------------------------------------------------------------
console.log('\n================ Edge and invalid cases ================');
console.log('Empty update (nothing changes):', updateProfile(student, {}));
console.log('No update passed (default {}):', updateProfile(student).name);
console.log('Student with no address/contact:', updateProfile({ id: 5, name: 'Sana' }, { address: { city: 'Lahore' } }));

try {
  updateProfile(null, update);
} catch (error) {
  console.log(`${error.name}: ${error.message}`);
}
try {
  updateProfile(student, 'not an object');
} catch (error) {
  console.log(`${error.name}: ${error.message}`);
}

// =====================================================================
// REFERENCE CHALLENGE
// =====================================================================
// === on objects compares REFERENCES (memory address), not contents.
console.log('\n================ Reference challenge ================');

console.log('original === updated ->', student === updatedStudent);
// false: updateProfile builds a brand new object with { ... }

console.log('original.address === updated.address ->', student.address === updatedStudent.address);
// false: we built a NEW address object with { ...oldAddress, ...addressChanges }

console.log('original.contact === updated.contact ->', student.contact === updatedStudent.contact);
// false: we built a NEW contact object with { ...oldContact, ...contactChanges }

// Why we had to spread nested objects separately:
const shallowCopy = { ...student };
console.log('\nShallow copy: original.address === copy.address ->', student.address === shallowCopy.address);
// true -> they SHARE the same address object.
// So shallowCopy.address.city = 'X' would ALSO change student.address.city (dangerous!)
