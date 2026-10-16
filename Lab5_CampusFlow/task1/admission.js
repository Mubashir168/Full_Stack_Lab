// =====================================================================
// TASK 1 - Admission Decision and Data Sanitization Engine
// Run:  node task1/admission.js
// =====================================================================
//
// The idea in 3 steps:
//   Step 1: VALIDATE  -> clean the raw (string) data and collect errors
//   Step 2: MERIT     -> only for valid applicants
//   Step 3: DECIDE    -> SELECTED / WAITING / REJECTED / INVALID DATA
//
// Status rules (my own "sensible conditions"):
//   INVALID DATA -> any value is missing, not a number, out of range,
//                   or the program is not supported
//   REJECTED     -> data is valid, but NOT eligible
//                   (eligible = merit >= 70 AND entry test >= 60 AND intermediate >= 60)
//   SELECTED     -> eligible AND fee is paid
//   WAITING      -> eligible BUT fee is not paid yet
// =====================================================================

// ---------- Constants (const = value never re-assigned) ----------
const MIN_AGE = 17;
const MAX_AGE = 30;
const MIN_MARKS = 0;
const MAX_MARKS = 100;

const MIN_MERIT = 70;
const MIN_ENTRY_TEST = 60;
const MIN_INTERMEDIATE = 60;

const MATRIC_WEIGHT = 0.2;
const INTERMEDIATE_WEIGHT = 0.3;
const ENTRY_TEST_WEIGHT = 0.5;

// ---------- Small helper functions ----------

// A value is "missing" if it is undefined, null or an empty/blank string.
// NOTE: we do NOT use `if (!value)` here, because 0 is falsy,
// and 0 can be a real value (e.g. 0 marks). That would be a bug.
function isMissing(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

// Explicit type conversion: string -> number.
// Number('91') -> 91,  Number('twenty') -> NaN
// We check missing FIRST because Number('') gives 0 (a hidden trap!).
function convertToNumber(value) {
  if (isMissing(value)) {
    return NaN;
  }
  return Number(value);
}

// Explicit conversion: 'true' / 'false' strings -> real booleans.
// Returns null when the value is neither (invalid).
// NOTE: Boolean('false') is TRUE (any non-empty string is truthy),
// so we cannot simply use Boolean() here.
function convertToBoolean(value) {
  const text = String(value).trim().toLowerCase();
  if (text === 'true') {
    return true;
  }
  if (text === 'false') {
    return false;
  }
  return null;
}

// switch statement to check supported programs
function isSupportedProgram(program) {
  switch (program) {
    case 'BSCS':
    case 'BSSE':
    case 'BSAI':
      return true;
    default:
      return false;
  }
}

function isInRange(number, min, max) {
  return number >= min && number <= max;
}

// ---------- Step 1: Validate and clean one applicant ----------
// Returns an object: { errors: [...], cleanData: {...} }
function validateApplicant(applicant) {
  const errors = [];

  // Guard clause: stop early if the record itself is not an object
  if (typeof applicant !== 'object' || applicant === null) {
    errors.push('Applicant record is not an object');
    return { errors, cleanData: null };
  }

  // Text fields
  if (isMissing(applicant.id)) {
    errors.push('id is missing');
  }
  if (isMissing(applicant.name)) {
    errors.push('name is missing');
  }

  // Numeric fields - convert each one explicitly
  const age = convertToNumber(applicant.age);
  const matricMarks = convertToNumber(applicant.matricMarks);
  const intermediateMarks = convertToNumber(applicant.intermediateMarks);
  const entryTest = convertToNumber(applicant.entryTest);

  // Check age
  if (isMissing(applicant.age)) {
    errors.push('age is missing');
  } else if (Number.isNaN(age)) {
    errors.push(`age "${applicant.age}" is not a valid number`);
  } else if (!isInRange(age, MIN_AGE, MAX_AGE)) {
    errors.push(`age ${age} must be between ${MIN_AGE} and ${MAX_AGE}`);
  }

  // Check all marks using a loop (same rule for every marks field)
  const marksFields = [
    { label: 'matricMarks', raw: applicant.matricMarks, value: matricMarks },
    { label: 'intermediateMarks', raw: applicant.intermediateMarks, value: intermediateMarks },
    { label: 'entryTest', raw: applicant.entryTest, value: entryTest }
  ];

  for (let i = 0; i < marksFields.length; i++) {
    const field = marksFields[i];
    if (isMissing(field.raw)) {
      errors.push(`${field.label} is missing`);
    } else if (Number.isNaN(field.value)) {
      errors.push(`${field.label} "${field.raw}" is not a valid number`);
    } else if (!isInRange(field.value, MIN_MARKS, MAX_MARKS)) {
      errors.push(`${field.label} ${field.value} must be between ${MIN_MARKS} and ${MAX_MARKS}`);
    }
  }

  // Check program (clean it: remove spaces, make uppercase)
  const program = isMissing(applicant.program) ? '' : String(applicant.program).trim().toUpperCase();
  if (program === '') {
    errors.push('program is missing');
  } else if (!isSupportedProgram(program)) {
    errors.push(`program "${program}" is not supported`);
  }

  // Check feePaid
  const feePaid = convertToBoolean(applicant.feePaid);
  if (feePaid === null) {
    errors.push(`feePaid "${applicant.feePaid}" must be "true" or "false"`);
  }

  const cleanData = {
    id: applicant.id,
    name: applicant.name,
    age: age,
    matricMarks: matricMarks,
    intermediateMarks: intermediateMarks,
    entryTest: entryTest,
    program: program,
    feePaid: feePaid
  };

  return { errors, cleanData };
}

// ---------- Step 2: Merit ----------
function calculateMerit(matricMarks, intermediateMarks, entryTest) {
  const merit =
    matricMarks * MATRIC_WEIGHT +
    intermediateMarks * INTERMEDIATE_WEIGHT +
    entryTest * ENTRY_TEST_WEIGHT;

  // Round to 2 decimal places (e.g. 83.3000001 -> 83.3)
  return Math.round(merit * 100) / 100;
}

// ---------- Step 3: Decide status ----------
function decideStatus(merit, entryTest, intermediateMarks, feePaid) {
  // Logical AND (&&): ALL three conditions must be true
  const isEligible =
    merit >= MIN_MERIT &&
    entryTest >= MIN_ENTRY_TEST &&
    intermediateMarks >= MIN_INTERMEDIATE;

  // Guard clause
  if (!isEligible) {
    return 'REJECTED';
  }

  // Ternary expression: condition ? valueIfTrue : valueIfFalse
  return feePaid ? 'SELECTED' : 'WAITING';
}

// ---------- Process ONE applicant (uses steps 1, 2, 3) ----------
function processApplicant(applicant) {
  const { errors, cleanData } = validateApplicant(applicant);

  // Guard clause: invalid application -> do NOT calculate merit
  if (errors.length > 0) {
    return {
      id: cleanData ? cleanData.id : 'UNKNOWN',
      name: cleanData ? cleanData.name : 'UNKNOWN',
      program: cleanData && cleanData.program !== '' ? cleanData.program : 'UNKNOWN',
      merit: null,
      status: 'INVALID DATA',
      reasons: errors
    };
  }

  const merit = calculateMerit(cleanData.matricMarks, cleanData.intermediateMarks, cleanData.entryTest);
  const status = decideStatus(merit, cleanData.entryTest, cleanData.intermediateMarks, cleanData.feePaid);

  return {
    id: cleanData.id,
    name: cleanData.name,
    program: cleanData.program,
    merit: merit,
    status: status,
    reasons: []
  };
}

// ---------- Process ALL applicants ----------
// Returns a NEW array. The original applicants array is not changed.
function processAllApplicants(applicants) {
  if (!Array.isArray(applicants)) {
    return [];
  }

  const decisions = [];
  for (const applicant of applicants) {
    decisions.push(processApplicant(applicant));
  }
  return decisions;
}

// ---------- Additional Challenge: summary ----------
function buildSummary(decisions) {
  let validCount = 0;
  let invalidCount = 0;
  let totalMerit = 0;
  let highestApplicant = null;
  let lowestMerit = null;
  const programCount = {};

  for (const decision of decisions) {
    // Count every applicant per program (even invalid ones)
    const program = decision.program;
    if (programCount[program] === undefined) {
      programCount[program] = 0;
    }
    programCount[program]++;

    if (decision.status === 'INVALID DATA') {
      invalidCount++;
      continue; // skip merit calculations for invalid applicants
    }

    validCount++;
    totalMerit += decision.merit;

    if (highestApplicant === null || decision.merit > highestApplicant.merit) {
      highestApplicant = decision;
    }
    if (lowestMerit === null || decision.merit < lowestMerit) {
      lowestMerit = decision.merit;
    }
  }

  // Avoid dividing by zero when there are no valid applicants
  const averageMerit = validCount > 0 ? Math.round((totalMerit / validCount) * 100) / 100 : 0;

  return {
    validApplicants: validCount,
    invalidApplicants: invalidCount,
    highestMeritApplicant: highestApplicant
      ? `${highestApplicant.name} (${highestApplicant.id}) - ${highestApplicant.merit}`
      : 'None',
    lowestMerit: lowestMerit === null ? 'None' : lowestMerit,
    averageMerit: averageMerit,
    applicantsPerProgram: programCount
  };
}

// =====================================================================
// TEST CASES
// =====================================================================

// 1) NORMAL - data given in the lab
const applicants = [
  { id: 'A101', name: 'Sara Khan', age: '19', matricMarks: '91', intermediateMarks: '87', entryTest: '78', program: 'BSCS', feePaid: 'true' },
  { id: 'A102', name: 'Ahmed Ali', age: 'twenty', matricMarks: '88', intermediateMarks: '', entryTest: '72', program: 'BSSE', feePaid: 'false' },
  { id: 'A103', name: 'Hassan', age: '18', matricMarks: '76', intermediateMarks: '83', entryTest: '91', program: 'BSAI', feePaid: 'true' }
];

// 2) BOUNDARY - values exactly on the limits
const boundaryApplicants = [
  // Merit exactly 70, age exactly 17 -> SELECTED
  { id: 'B201', name: 'Edge Seventy', age: '17', matricMarks: '70', intermediateMarks: '70', entryTest: '70', program: 'BSCS', feePaid: 'true' },
  // Age exactly 30, merit 68 (just below 70) -> REJECTED
  { id: 'B202', name: 'Just Below', age: '30', matricMarks: '100', intermediateMarks: '60', entryTest: '60', program: 'BSSE', feePaid: 'true' },
  // Matric = 0 is a VALID value (not missing). Fee not paid -> WAITING
  { id: 'B203', name: 'Zero Matric', age: ' 20 ', matricMarks: '0', intermediateMarks: '100', entryTest: '100', program: 'bsai', feePaid: 'false' }
];

// 3) INVALID - bad and unexpected data
const invalidApplicants = [
  { id: 'I301', name: 'Too Young', age: '16', matricMarks: '80', intermediateMarks: '80', entryTest: '80', program: 'BSCS', feePaid: 'true' },
  { id: 'I302', name: 'Over Hundred', age: '20', matricMarks: '105', intermediateMarks: '80', entryTest: '-5', program: 'BSCS', feePaid: 'true' },
  { id: 'I303', name: 'Wrong Program', age: '21', matricMarks: '80', intermediateMarks: '80', entryTest: '80', program: 'BBA', feePaid: 'true' },
  { id: 'I304', name: '', age: '22', matricMarks: '80', intermediateMarks: '80', entryTest: '80', program: 'BSCS', feePaid: 'yes' },
  null
];

function runTest(title, list) {
  console.log(`\n========== ${title} ==========`);
  const decisions = processAllApplicants(list);

  for (const d of decisions) {
    const meritText = d.merit === null ? '-' : d.merit;
    console.log(`${d.id} | ${d.name} | ${d.program} | merit: ${meritText} | ${d.status}`);
    if (d.reasons.length > 0) {
      console.log(`     reasons: ${d.reasons.join('; ')}`);
    }
  }

  console.log('Summary:', buildSummary(decisions));
}

runTest('NORMAL CASES (lab data)', applicants);
runTest('BOUNDARY CASES', boundaryApplicants);
runTest('INVALID CASES', invalidApplicants);
runTest('ALL APPLICANTS TOGETHER', [...applicants, ...boundaryApplicants, ...invalidApplicants]);

// Not an array at all
console.log('\nInput is not an array ->', processAllApplicants('hello'));

// Proof that source data was not mutated (still strings)
console.log('\nOriginal first applicant is unchanged:', applicants[0]);
