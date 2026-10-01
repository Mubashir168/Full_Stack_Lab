// Task 2: Round Me Function
// Rounds numbers passed as arguments:
// - 0 arguments  => returns 0
// - 1 argument   => returns single rounded number
// - 2+ arguments => returns an array of rounded numbers
// Student: Mubashir | Roll No: 241845

function roundMe(...args) {
  if (args.length === 0) return 0;
  if (args.length === 1) return Math.round(args[0]);

  return args.map(num => Math.round(num));
}

// Test Examples
console.log(roundMe());            // Expected Output: 0
console.log(roundMe(4.7));         // Expected Output: 5
console.log(roundMe(4.7, 4.4));    // Expected Output: [5, 4]
