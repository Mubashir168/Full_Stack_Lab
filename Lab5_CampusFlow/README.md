# Lab 5 – Advanced JavaScript (CampusFlow)

Pure Node.js. No HTML, DOM, Express, databases or npm packages.
Tested on Node.js v22 (any version 18+ works).

## How to run

Open a terminal **inside the `Lab5_CampusFlow` folder** and run:

| Task | Command |
|---|---|
| 1 – Admission engine | `node task1/admission.js` |
| 2 – Performance engine | `node task2/performance.js` |
| 3 – Profile update | `node task3/profileUpdate.js` |
| 4 – User hierarchy & `this` | `node task4/users.js` |
| 5 – Modules & JSON | `node task5/main.js` |
| 6 – Callbacks | `node task6/callbacks.js` |
| 7 – Promises | `node task7/promises.js` |
| 8 – async/await | `node task8/apiAggregator.js` |

`package.json` contains `"type": "module"` – this tells Node to allow `import` / `export` (ES modules).

## Folder structure

```
Lab5_CampusFlow/
├── package.json
├── README.md
├── VIVA_NOTES.md
├── task1/admission.js
├── task2/performance.js
├── task3/profileUpdate.js
├── task4/users.js
├── task5/main.js
│   ├── Student.js            (default export)
│   ├── gradeUtils.js         (named exports)
│   └── transcriptService.js  (JSON processing)
├── task6/callbacks.js
├── task7/promises.js
└── task8/apiAggregator.js
```

## Assumptions I made (say these confidently if asked)

1. **Task 1 – statuses**
   - `INVALID DATA` = something missing, not a number, marks outside 0–100, age outside 17–30, unsupported program, or bad `feePaid`. Merit is **not** calculated.
   - `REJECTED` = data is valid but not eligible (merit < 70, or entry test < 60, or intermediate < 60).
   - `SELECTED` = eligible **and** fee paid.  `WAITING` = eligible but fee **not** paid.
2. **Task 2 – grading table.** The sheet shows "80-84 A" and "65-69 B", which looks like the minus signs got lost. I used **A-** (3.67) and **B-** (2.67). Pass mark = 50.
3. **Task 5 – GPA** = average of grade points (every course has equal credit hours). A transcript with **any** problem is rejected as a whole.
4. **Task 8 – failed student** = a student whose average is below 50.
