💸 SpendWise - Student Financial Survival Tracker

«Helping students manage their money smarter, one expense at a time.»

🚀 **[Live Demo](https://spendwisebyhg.netlify.app)** • 📂 **[Source Code](https://github.com/hassancodeshub/SpendWise)**

SpendWise is a smart expense management web application built specifically for college students...

SpendWise is a smart expense management web application built specifically for college students. Instead of simply recording expenses, it helps students understand their spending habits, stay within budget, and make smarter financial decisions — entirely client-side, with no signup or server required.

🚀 Problem

Most students receive a fixed monthly allowance but often:

- Spend too much during the first week
- Lose track of daily expenses
- Don't know if they can afford a purchase
- Run out of money before the month ends

Traditional expense trackers show where money was spent, but they don't help students make spending decisions.

💡 Solution

SpendWise acts as a personal financial assistant by:

- Calculating a safe daily/weekly spending limit from what's left
- Tracking how many days this month had zero spending
- Letting users check if a purchase is affordable before buying it
- Flagging overspending and junk-food spending patterns
- Letting users set and track savings goals

---

✨ Features

📊 Smart Dashboard

View:

- Monthly Budget (base budget + funds added this month)
- Total Spent (this month)
- Remaining Balance
- Safe Daily Budget / Safe Weekly Budget
- No-Spend Days (days this month with zero expenses logged)
- Budget utilization progress bar

---

💰 Safe Daily Budget

Automatically calculates the amount that can be safely spent each day for the rest of the month.

Formula

Safe Daily Budget = Remaining Balance / Days Left in Month

Example

Remaining Balance: ₹4000
Days Left: 20

Safe Daily Budget: ₹200/day

---

🛒 Can I Afford This?

A purchase decision assistant. Enter an item's name and price to see:

- Whether you currently have enough balance to cover it
- How it would shift your daily spending limit for the rest of the month
- A "Risky Purchase" warning if it would cut your daily limit by more than half

Example

Current Daily Limit: ₹250/day
Item Price: ₹1200

New Daily Limit: ₹130/day

Status: ⚠️ Risky Purchase

---

🚨 Smart Insights

The Insights tab analyzes this month's transactions and surfaces:

- Over Budget — when total spending exceeds total income for the month
- Careful — when spending has crossed 80% of the monthly budget
- Junk Food Alert — when spending on "Food" category (or titles containing "zomato"/"swiggy") exceeds 20% of monthly income
- Looking Good — shown when none of the above triggers and spending has occurred

---

🎯 Savings Goals

Create savings goals with a target amount, current saved amount, and a deadline. Each goal shows:

- Progress bar toward the target
- Amount saved vs. target
- Days remaining until deadline (or "Past deadline" / "Due today")

---

📈 Spending Analytics

The Analytics tab renders a simple bar chart (drawn directly on "<canvas>", no external charting library) showing this month's spending broken down by category, plus:

- Daily Burn — average spend per day so far this month
- Top Category — the category with the highest spend this month

---

📂 Expense Categories

Track spending across categories:

- 🍔 Food
- 🚌 Transport
- 📚 Education
- 🎮 Entertainment
- 🛍️ Shopping
- 🩺 Health
- 💡 Bills
- 🚨 Emergency
- 📦 Other

---

🔐 Local PIN Lock

On first use, set your name, starting budget, and a 4-digit PIN. On future visits, the dashboard stays hidden until the correct PIN is entered. This is a local privacy lock, not encryption — all data lives in your browser's "localStorage" and is never sent anywhere.

---

💾 Backup & Restore

From Settings, you can:

- Export Backup — download all your data as a JSON file
- Import Backup — restore from a previously exported JSON file
- Reset Application — wipe all local data and start fresh

---

🛠️ Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (no frameworks, no build step)
- "localStorage" for all data persistence
- Hand-drawn "<canvas>" bar chart (no charting library)

---

📱 User Flow

1. Set your name, starting monthly budget, and a PIN.
2. Add expenses and income ("funds") as they happen.
3. Check your dashboard for safe daily/weekly spending limits.
4. Use "Can I Afford This?" before making a purchase.
5. Check Insights and Analytics for spending patterns.
6. Set savings goals and track progress.
7. Export backups periodically to prevent data loss.

---

🎯 Target Audience

- College Students
- Hostel Residents
- Freshers Managing Their First Budget
- Scholarship Students
- Anyone Living on a Fixed Monthly Allowance

---

🔮 Future Enhancements

- End-of-month balance prediction based on spending pace
- Budget streaks (consecutive days under daily limit)
- AI-powered spending recommendations
- Receipt scanning with OCR
- Shared roommate expense tracking
- Progressive Web App (PWA) support
- Cloud sync and multi-device authentication

---

⚠️ Known Limitations

- All data is stored locally in the browser — clearing browser storage or switching devices/browsers loses your data unless you've exported a backup.
- The PIN lock is a local convenience lock, not real security — anyone with access to the device's browser storage can bypass it.
- Budgets reset on a monthly basis; unspent balance does not automatically roll over into the next month's pool.

---

🏆 Hackathon Pitch

«Most expense trackers tell students where their money went.

SpendWise helps them decide where their money should go.»

---

Made with ❤️ for students who want to spend wisely and save more.
