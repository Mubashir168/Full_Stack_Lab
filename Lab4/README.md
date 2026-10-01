# Full Stack Web Development — Laboratory Tasks #4

**Student Name:** Mubashir  
**Roll Number:** 241845  
**Course:** Full Stack Web Development  
**Session:** Fall 2026  

---

## 📌 Lab 4 Tasks Overview

This directory contains JavaScript problem-solving functions developed for Lab 4:

### 1. [createPhoneNumber.js](./createPhoneNumber.js)
A JavaScript function that accepts an array of 10 integers (between 0 and 9) and returns a formatted phone number string in the standard US/international format: `(XXX) XXX-XXXX`.

```javascript
createPhoneNumber([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
// Output: "(123) 456-7890"
```

### 2. [roundMe.js](./roundMe.js)
A versatile JavaScript rounding utility that handles variable argument counts using rest parameters (`...args`):
- When called with **0 arguments**, returns `0`.
- When called with **1 argument**, returns the rounded value (`Math.round(val)`).
- When called with **multiple arguments**, returns an array of each value rounded to the nearest integer.

```javascript
roundMe();          // Output: 0
roundMe(4.7);       // Output: 5
roundMe(4.7, 4.4);  // Output: [5, 4]
```
