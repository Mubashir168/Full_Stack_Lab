var givenPrime = 11;
var currentNumber = givenPrime + 1;

while (true) {
  let isPrime = true;

  for (let i = 2; i < currentNumber; i++) {
    if (currentNumber % i === 0) {
      isPrime = false;
      break;
    }
  }

  if (isPrime) {
    console.log("The prime number after " + givenPrime + " is " + currentNumber);
    break;
  }

  currentNumber++;
}