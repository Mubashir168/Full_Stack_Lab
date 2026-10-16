# Lab 5 – Viva Preparation Notes

For each task: **what the code does → key concepts → likely viva questions with short answers.**
Tip: run each file once before the viva so you have seen the output yourself.

---

## Task 1 – Admission Engine (`task1/admission.js`)

**What it does:** Every applicant goes through 3 steps: **validate → calculate merit → decide status**.

**Key concepts**

- **Explicit conversion:** `Number('91')` → `91`, `Number('twenty')` → `NaN`. We check with `Number.isNaN()`.
- **Trap:** `Number('')` gives `0`, not `NaN`. That is why we check "missing" **before** converting.
- **Truthy/falsy:** falsy values are `false, 0, '', null, undefined, NaN`. Everything else is truthy.
  We don't use `if (!marks)` because a mark of `0` is falsy but still a real value.
- **Boolean trap:** `Boolean('false')` is `true` (a non-empty string is truthy), so we compare the text with `'true'` / `'false'` instead.
- **Guard clause:** an early `return` at the top of a function that stops bad data before the main logic runs.
- **switch:** used in `isSupportedProgram()`. **Ternary:** `feePaid ? 'SELECTED' : 'WAITING'`.
- **Scope:** `let`/`const` live only inside their `{ }` block. Constants at the top are global to the file.

**Likely questions**

| Question | Answer |
|---|---|
| Why `===` and not `==`? | `===` checks value **and** type with no hidden conversion. `'0' == 0` is true, `'0' === 0` is false. |
| Why `const` vs `let`? | `const` is for values that are never re-assigned. `let` is for values that change, like counters. |
| Why not `var`? | `var` ignores block scope and is hoisted, which leads to bugs. |
| Merit formula? | `matric×0.2 + inter×0.3 + entry×0.5` |
| What's the difference between SELECTED and WAITING? | Both are eligible. Selected = fee paid, Waiting = fee not paid. |

---

## Task 2 – Performance Engine (`task2/performance.js`)

**Key concepts – memorise this table**

| Method | Returns | Changes the original? |
|---|---|---|
| `forEach` | nothing | No |
| `map` | new array, same length | No |
| `filter` | new array with the matching items | No |
| `find` | first match or `undefined` | No |
| `findIndex` | index of first match or `-1` | No |
| `reduce` | one single value | No |
| `some` | `true` if **any** item matches | No |
| `every` | `true` if **all** items match | No |
| `slice` | a copy | No |
| `sort` | the same array, sorted | **YES – mutates!** |

- **That's why** we write `list.slice().sort(...)`: copy first, then sort the copy.
- **Sort compare function:** return a negative number → `a` goes first, a positive number → `b` goes first. `b.marks - a.marks` gives descending order.
- **Tie-break:** `a.name.localeCompare(b.name)` sorts names alphabetically.
- **Department stats:** `reduce` builds an object. A new key is created the first time a department is seen, so a new department like `"DS"` works automatically (nothing is hard-coded).

**Likely questions**

| Question | Answer |
|---|---|
| `map` vs `forEach`? | `map` returns a new array. `forEach` returns nothing and is used only for side-effects like printing. |
| `find` vs `filter`? | `find` gives the first match. `filter` gives all matches as an array. |
| What does `reduce`'s 2nd argument do? | It's the starting value of the accumulator (`0` for a sum, `{}` for an object). |
| What if you forget `return acc` in reduce? | The accumulator becomes `undefined` on the next step, and the code crashes. |
| `every` on an empty array? | Returns `true` (nothing failed the test). |

---

## Task 3 – Profile Update (`task3/profileUpdate.js`)

**Core idea:** `{ ...obj }` makes a **shallow copy**, which copies only the top level. Nested objects like `address` would still be **shared**, so we spread them separately.

| Feature | Example in the code |
|---|---|
| Object destructuring | `const { name, marks } = person` |
| Renaming | `address: oldAddress` |
| Default value | `address: oldAddress = {}` (used **only** when the value is `undefined`) |
| Nested destructuring | `address: { city: livesIn, sector }` |
| Object rest | `...otherFields` → "all remaining properties" |
| Array destructuring | `const [firstName, ...otherNames] = name.split(' ')` |
| Rest parameters | `function applyManyUpdates(original, ...updates)` |
| Spread | `{ ...oldAddress, ...addressChanges }` – later values overwrite earlier ones |
| Optional chaining | `person.guardian?.name` → `undefined` instead of a crash |
| Nullish coalescing | `x ?? 'default'` → uses the default only for `null`/`undefined` |
| Property shorthand | `{ address, contact }` = `{ address: address, contact: contact }` |

**`||` vs `??` (very likely question):** `0 || 'N/A'` gives `'N/A'` (wrong), while `0 ?? 'N/A'` gives `0` (correct). `||` treats every falsy value as missing; `??` only treats `null`/`undefined` as missing.

**Reference challenge:** `===` on objects compares **references** (which object in memory), not contents.
- original vs updated → **different** (a new object was created)
- original.address vs updated.address → **different** (a new address object was created by spreading)
- original.contact vs updated.contact → **different** (same reason)
- With a plain `{ ...student }`, the address would be **the same** reference, so changing the copy would change the original.

**Rest vs spread?** Same `...` syntax. **Rest** *collects* items into one (left side or parameters). **Spread** *expands* one into many (right side or arguments).

---

## Task 4 – Classes & `this` (`task4/users.js`)

| Term | Simple meaning |
|---|---|
| `class` | A blueprint for objects |
| `constructor` | Runs automatically when you write `new` |
| `new` | Creates a new empty object, sets `this` to it, and runs the constructor |
| `extends` | The child class inherits the parent's properties and methods |
| `super(...)` | Calls the parent constructor. **Must** come before you use `this` in a child |
| `super.introduce()` | Calls the parent's version of a method (reuse) |
| Overriding | The child defines a method with the same name as the parent's |
| Runtime polymorphism | The same call `user.introduce()` runs a different version depending on the actual object |
| `instanceof` | Checks whether an object was made from a class (or its parent) |

**`this` rule:** `this` = **the object before the dot at the moment of calling.**
- `student.introduce()` → `this` is `student`
- `fn()` (detached) → nothing before the dot → `this` is `undefined` (classes always use strict mode) → **TypeError**
- `Person.prototype.introduce.call(guest)` → runs the method **now** with `this = guest`
- `student.introduce.bind(student)` → returns a **new function** with `this` fixed forever

**`call` vs `bind`:** `call` runs the function immediately. `bind` doesn't run it; it returns a new function you can call later.

**Why is `ali instanceof Person` true?** Because `Student extends Person`, so every student is also a person.

---

## Task 5 – Modules & JSON (`task5/`)

- **Default export:** `export default class Student` – only one per file. Import it with any name: `import Student from './Student.js'`
- **Named exports:** `export function calculateGrade` – many per file. Import with the exact name in `{ }`.
- **Alias:** `import { calculateGrade as gradeFor }` – renames the import inside this file.
- **`"type": "module"`** in package.json lets Node use `import`/`export`.
- **`JSON.parse(text)`** turns text into a JS value and **throws a SyntaxError** if the text is broken.
- **`JSON.stringify(obj, null, 2)`** turns a JS value into text (`2` means pretty-print with 2 spaces).
- **Error types:** `SyntaxError` (broken JSON), `TypeError` (wrong type), `RangeError` (number out of range), `Error` (general rule like a duplicate id).
- **try / catch / finally:** `try` runs the risky code, `catch` handles the error, and `finally` **always** runs.
- **Duplicates:** checked with a `Set`, because a `Set` stores unique values and `.has()` is fast.

**Why split into modules?** Each file has one job (separation of concerns), so the code is easier to read, test, and reuse.

---

## Task 6 – Callbacks (`task6/callbacks.js`)

- **Callback** = a function passed to another function, to be called later.
- **Error-first:** `callback(error, value)`. On success, `error` is `null`.
- **`return` after an error** makes sure the callback runs **exactly once**.
- **Even errors are sent inside `setTimeout`**, so the function is always async and behaves consistently.
- The program does **not wait** for `setTimeout`; that's why the "prints FIRST" line appears early.

**Why it's hard to maintain (the explanation they asked for):**
1. **Nesting / "callback hell":** every dependent step goes one level deeper, forming a pyramid that's hard to read and change.
2. **Repeated error handling:** `if (error) return finalCallback(error)` has to appear at every level. Forget one and the error is lost.
3. **try/catch can't catch async errors:** the `try` block has already finished by the time the timer fires.
4. **Nothing enforces "only once":** a bug can call a callback twice. Promises fix this.

---

## Task 7 – Promises (`task7/promises.js`)

- `new Promise((resolve, reject) => { ... })` – call `resolve(value)` for success and `reject(error)` for failure.
- A Promise settles **only once**, so it can't be resolved twice.
- **Chaining:** whatever a `.then()` **returns** is passed to the next `.then()`. If you return a Promise, the chain waits for it.
- **Missing return bug:** `.then(x => { doSomething(x); })` with `{ }` and no `return` passes `undefined` along. The demo shows this breaking.
- **An arrow function without `{ }`** returns automatically: `.then(x => doSomething(x))`.
- One `.catch()` at the end catches an error from **any** step, and the remaining `.then()`s are skipped.

**Choosing combinators (they WILL ask "why this one?")**

| Combinator | Resolves when | Rejects when | Used for |
|---|---|---|---|
| `Promise.all` | **all** succeed | **first** failure | Task 8 dashboard (we need all 3) |
| `Promise.allSettled` | **all** finish (never rejects) | – | **Part B** – we want every service's status, even if SMS fails |
| `Promise.race` | first to **settle** | first to settle, if it's an error | Not suitable for Part C: a fast failure would win |
| `Promise.any` | first to **succeed** | only if **all** fail (`AggregateError`) | **Part C** – first *successful* server |

---

## Task 8 – async/await (`task8/apiAggregator.js`)

- An **`async` function** always returns a Promise.
- **`await`** pauses that function until the Promise settles. Other code keeps running.
- **A real `fetch` only rejects on network failure.** A 404 or 500 still *resolves*, but with `response.ok === false`. That's why we check `response.ok` ourselves and throw an `HttpError`.
- **`response.json()`** also returns a Promise and rejects if the body isn't valid JSON.
- **Concurrency:** `await Promise.all([a(), b(), c()])` **starts all three at once**, so the total time is about 300 ms instead of 900 ms. Writing three `await`s one after another would be sequential and slow.
- **Timeout:** `AbortController` + `setTimeout(() => controller.abort(), ms)`. When aborted, fetch rejects with an `AbortError`, which we convert into a `TimeoutError`.
- **`finally { clearTimeout(timer) }`** makes sure the timer is always cleaned up, whether the request succeeded or failed.
- **Telling errors apart:** custom error classes (`HttpError`, `NetworkError`, `InvalidJSONError`, `TimeoutError`) plus `instanceof` in `describeError()`.

**Likely questions**

| Question | Answer |
|---|---|
| Why `Promise.all` here and not `allSettled`? | The dashboard needs **all** the data. If one call fails, we can't build it, so failing fast is right. |
| What if we forget `clearTimeout`? | The timer still fires later and calls `abort()` for no reason, and it keeps the program alive longer. |
| Why `fetchImplementation` as a parameter? | We can pass `fakeFetch` for testing or the real `fetch` in production without changing the code. |
| Is `await` blocking? | Only inside that async function. The rest of the program continues. |
