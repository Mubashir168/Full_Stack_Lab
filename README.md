# Full Stack Web Development — Laboratory Submissions

**Student Name:** Mubashir  
**Roll Number:** 241845  
**Discipline:** BS Computer Science  
**Session:** Fall 2026  

---

## 📌 Repository Structure

```
Full_Stack_Lab/
├── Lab4/                                # Lab 4: JavaScript Lab Tasks
│   ├── task1.js                         # Variables & Biography Object
│   ├── task2.js                         # Next Prime Number Finder
│   ├── task3.js                         # Phone Number Formatter
│   ├── task4.js                         # Round Me Function
│   ├── task5.js                         # Math Functions (abs, ceil, floor)
│   └── task6.js                         # Sum of Multiples
├── Lab3/                                # Lab 3: Bootstrap 5 & E-Commerce
│   ├── ecommerce/                       # AFIYA Natural Products E-Commerce Store
│   │   ├── index.html                   # Navbar, Hero Banner, 6 Products, Reviews, Footer
│   │   ├── cart.html                    # Display & Edit Basket (Qty +/-, Total Calculation)
│   │   ├── checkout.html                # Delivery Form, Payment Options (Card/COD), Summary
│   │   ├── login.html                   # Customer Login Form
│   │   ├── signup.html                  # Customer Registration Form
│   │   ├── js/cart.js                   # Beginner-friendly Cart state logic (localStorage)
│   │   └── style.css                    # Clean natural green styling
│   ├── IEEETemplate/index.html          # Academic Paper Template (Bootstrap 2-column grid & tables)
│   ├── Portfolio/index.html             # Developer Portfolio (Bootstrap components & badges)
│   ├── facebookhomepage/index.html      # Social Media Feed (Bootstrap 3-column layout & cards)
│   ├── interestingUI/index.html         # AuraStudio Workspace (Bootstrap Nav-Pills, progress & accordion)
│   ├── timetable/index.html             # Class Timetable (Bootstrap table-responsive & badges)
│   └── README.md                        # Lab 3 specific documentation
├── Lab2/                                # Lab 2: Custom HTML5 & CSS3 Tasks
│   ├── IEEETemplate/                    # IEEE Camera-Ready Layout
│   ├── Portfolio/                       # Bento Grid Developer Portfolio
│   ├── facebookhomepage/                # Dark Social Network Feed
│   ├── interestingUI/                   # AuraStudio Creative Workspace
│   └── timetable/                       # Academic Class Timetable
└── labtask1-calculator/                 # Lab 1: Web Calculator
    ├── index.html
    └── style.css
```

---

## 🌿 Lab 3: Bootstrap 5 & AFIYA E-Commerce Store

### Task 1: Bootstrap 5 Migration
All tasks from Lab 2 were re-engineered using standard **Bootstrap 5.3** utility classes and components:
- **[IEEE Research Paper Template](./Lab3/IEEETemplate/index.html):** Multi-column layout using `.row` and `.col-md-6`, `.table.table-bordered`, and alert components.
- **[Developer Portfolio](./Lab3/Portfolio/index.html):** Standard Bootstrap navbar, responsive card grid, and badge competencies cloud.
- **[Social Media Feed](./Lab3/facebookhomepage/index.html):** 3-column Bootstrap responsive feed with scrolling stories row and card posts.
- **[AuraStudio Workspace](./Lab3/interestingUI/index.html):** Interactive workspace with Bootstrap Nav-Pills, progress bar, and collapsible notes accordion.
- **[Class Timetable](./Lab3/timetable/index.html):** Table wrapped in `.table-responsive` with contextual subject alert colors.

### Task 2: AFIYA Natural Products E-Commerce Store ([`Lab3/ecommerce/`](./Lab3/ecommerce/))
- **Brand:** **AFIYA** (Pure, Natural & Organic Essentials)
- **Niche:** 100% Pure, Organic & Chemical-Free Natural Products (Raw Mountain Honey, Cold-Pressed Argan Oil, Shea Butter Soap, Aloe Vera Gel, Lavender Essential Oil, Chamomile Tea).
- **UI Design:** Simple, clean, nature-inspired green and light aesthetic with standard Bootstrap 5 elements.

#### All 10 Required Features:
1. **Navbar:** [`index.html`](./Lab3/ecommerce/index.html) — Logo with leaf icon, search box, links, login/signup buttons, and **live basket counter badge**.
2. **Hero Section:** [`index.html`](./Lab3/ecommerce/index.html) — Natural purity banner with 4 value-prop benefit cards.
3. **Product Listing:** [`index.html`](./Lab3/ecommerce/index.html) — 6 organic products with star ratings, prices, and Add to Basket buttons.
4. **Reviews:** [`index.html`](./Lab3/ecommerce/index.html) — 3 verified customer feedback cards with 5-star ratings.
5. **Add to Cart:** Handled via [`js/cart.js`](./Lab3/ecommerce/js/cart.js) using `localStorage` and Bootstrap toast alerts.
6. **Display Cart:** [`cart.html`](./Lab3/ecommerce/cart.html) — Clean table listing all items in the basket with thumbnail, unit price, quantity, and line total.
7. **Edit Cart:** [`cart.html`](./Lab3/ecommerce/cart.html) — Plus (`+`) and minus (`-`) quantity buttons and trash icon to remove products with live recalculations.
8. **Checkout:** [`checkout.html`](./Lab3/ecommerce/checkout.html) — Delivery address form, payment options (Card / COD), order summary, and confirmation modal.
9. **Login:** [`login.html`](./Lab3/ecommerce/login.html) — Simple customer sign-in card.
10. **Signup:** [`signup.html`](./Lab3/ecommerce/signup.html) — Customer registration card with student ID (`241845`).

---

## ⚡ Lab 4: JavaScript Lab Tasks

- **[`Lab4/task1.js`](./Lab4/task1.js):** Variables & Biography Object (Student details, nested address, degree program).
- **[`Lab4/task2.js`](./Lab4/task2.js):** Prime Number Finder (Finds the immediate next prime number after a given number).
- **[`Lab4/task3.js`](./Lab4/task3.js):** Phone Number Formatter (Converts an array of 10 digits into `(XXX) XXX-XXXX`).
- **[`Lab4/task4.js`](./Lab4/task4.js):** Round Me Function (Custom variable-argument rounding using `...args`).
- **[`Lab4/task5.js`](./Lab4/task5.js):** Math Utilities (`absMe`, `ceilMe`, `floorMe` with variable arguments).
- **[`Lab4/task6.js`](./Lab4/task6.js):** Sum of Multiples (Calculates sum of multiples of `x` or `y` below limit `z`).

---

## 💻 Tech Stack
- **Framework:** Bootstrap 5.3 (via CDN)
- **Markup:** HTML5 (Semantic Structure)
- **Styling:** CSS3 & Bootstrap Utilities
- **Scripting:** Vanilla JavaScript (ES6)
- **Icons:** Font Awesome 6
