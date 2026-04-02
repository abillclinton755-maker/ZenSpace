# ZenSpace Project Guide 🧘✨
*A beginner-friendly guide to help you understand and explain your final year project.*

## 1. Project Overview
**What is ZenSpace?**
ZenSpace is a **Single Page Application (SPA)** built to help users manage their mental wellness. It provides tools for meditation, focus (Pomodoro), journaling, and habit tracking.

**Key Technology Stack:**
*   **HTML5**: For the structure (the skeleton).
*   **CSS3**: For styling, layout, and animations (the look).
*   **JavaScript (ES6)**: For logic, timers, and data management (the brain).
*   **LocalStorage**: For saving user data on the device without a database.

---

## 2. File Structure
*   `index.html`: Contains all the sections (Home, Journal, Stats, Profile). Only one file is used to make the app feel fast (SPA).
*   `style.css`: Contains all the "design rules" like colors, fonts, and the "Glassmorphism" look (the frosted glass effect).
*   `script.js`: The most important part. It handles button clicks, the timer countdown, saving your journal, and drawing the progress charts.
*   `music.mp3.mp3`: The background audio file used for meditation.

---

## 3. How the Code Works (Interview Questions)

### Q1: How does the "Single Page" work?
In `index.html`, we have different `<section>` tags for each screen (Home, Journal, etc.). In `script.js`, we use a function called `navigateTo(viewName)`. It hides all sections and only shows the one you clicked. This makes the app feel like a mobile app.

### Q2: How do you save data without a database?
We use **Web Storage (LocalStorage)**. It's a built-in feature of modern browsers. In `script.js`, look for `Store.get()` and `Store.set()`. This allows the app to remember your meditation minutes and journal entries even if you refresh the page.

### Q3: How does the Meditation Timer work?
We use a JavaScript function called `setInterval`. Every 1000 milliseconds (1 second), the code:
1. Subtracts -1 from the `timeLeft`.
2. Updates the text on the screen.
3. Shrinks the **Progress Ring** (the blue circle) using CSS math (`strokeDashoffset`).

### Q4: What is the "Breathing Orb"?
In `style.css`, we created an animation that scales the "orb" up and down. In `script.js`, we use `setTimeout` to switch between "Inhale", "Hold", and "Exhale" states based on the technique you selected (like 4-7-8).

### Q5: How is the Stats Chart made?
We use the **HTML5 Canvas API**. Instead of using a library, we manually draw rectangles (bars) on a `<canvas>` element. We calculate the height of each bar based on the last 7 days of data from your session history.

### Q6: How do you handle "Light" and "Dark" mode?
We use **CSS Variables** (look at `:root` in the CSS). When you click the moon icon, JavaScript adds a class called `.light-theme` to the `<body>`. This tells the CSS to instantly swap all dark colors for light ones.

---

## 4. Professional Features to Mention
*   **Glassmorphism**: The premium UI look using `backdrop-filter: blur()`.
*   **Responsive Design**: The app works on both Phones and Laptops because we used `@media` queries in CSS.
*   **CSV Export**: Users can download their history as a spreadsheet. We use the `Blob` API to convert text into a downloadable file.
*   **Gamification**: The "Achievement" system encourages users to build a daily habit through badges and streaks.

---

**Tip for your Exam:**
If the invigilator asks "Where is the data stored?", say: *"It is stored in the browser's LocalStorage as JSON strings, making it a server-less, offline-capable application."* (This sounds very professional!)
