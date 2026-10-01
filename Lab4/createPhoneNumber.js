// Task 1: Create Phone Number
// Formats an array of 10 integers (0-9) into a phone number string: (XXX) XXX-XXXX
// Student: Mubashir | Roll No: 241845

function createPhoneNumber(numbers) {
  let areaCode = numbers.slice(0, 3).join('');
  let middleThree = numbers.slice(3, 6).join('');
  let lastFour = numbers.slice(6, 10).join('');
  
  return `(${areaCode}) ${middleThree}-${lastFour}`;
}

// Test Example
console.log(createPhoneNumber([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));
// Expected Output: (123) 456-7890
