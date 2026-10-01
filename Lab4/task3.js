function createPhoneNumber(numbers) {
  let areaCode = numbers.slice(0, 3).join('');
  let middleThree = numbers.slice(3, 6).join('');
  let lastFour = numbers.slice(6, 10).join('');
  
  return `(${areaCode}) ${middleThree}-${lastFour}`;
}

console.log(createPhoneNumber([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));