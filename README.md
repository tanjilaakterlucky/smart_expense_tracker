# 💎 FINORA — Smart Personal Finance Management System

> **Professional • Multi-Currency • Web + Mobile Ready**

FINORA is a next-generation personal finance platform designed to manage income, expenses, multi-currency wallets, category budgets, savings goals, recurring subscriptions, and comprehensive financial reports.

---

## 🚀 Key Highlights & Implemented Features

1. **Dashboard & Analytics**:
   - Total Net Worth (dynamically converted to primary currency using `Decimal.js`)
   - Monthly Income, Monthly Expense, and Net Savings with velocity rate
   - Monthly Cash Flow Bar Chart & Top Spending Categories Donut Chart (via Recharts)
   - Quick Add Transaction (+ Expense, + Income, ⇄ Transfer)
   - Real-time Wallet Summary & Active Category Budgets

2. **Income & Expense Management**:
   - Record Income, Expenses, and Wallet-to-Wallet Transfers
   - Instant search and multi-filtering (by Type, Category, Wallet, Date Range)
   - One-click **CSV Statement Export** (PapaParse)
   - One-click **PDF Statement Export** (jsPDF + autoTable)

3. **Multi-Currency System**:
   - Native support for **10 major currencies**:
     - **BDT (৳)** — Bangladeshi Taka (Default)
     - **USD ($)** — US Dollar
     - **EUR (€)** — Euro
     - **GBP (£)** — British Pound
     - **INR (₹)** — Indian Rupee
     - **AED (د.إ)** — UAE Dirham
     - **SAR (﷼)** — Saudi Riyal
     - **JPY (¥)** — Japanese Yen
     - **CAD (C$)** — Canadian Dollar
     - **AUD (A$)** — Australian Dollar
   - Instant live conversion and manual exchange rate overrides in Settings
   - High-precision monetary math avoiding JavaScript floating-point errors (`Decimal.js`)

4. **Wallet Management**:
   - **Cash, Bank Accounts, bKash, Nagad, Rocket, PayPal, and Custom Wallets**
   - Color accents, account number masking, and balance tracking
   - Wallet-to-Wallet Transfer with automatic cross-currency conversion

5. **Budget Planner**:
   - Category limits (e.g. Food: ৳15,000, Shopping: ৳10,000, Transport: ৳6,000)
   - Visual progress bars with warning threshold (80%) and budget exceeded alerts

6. **Savings Goals & Targets**:
   - Create goals with target dates (e.g. Emergency Fund, MacBook Pro, Vacation Tour)
   - Direct deposit into savings goals from any active wallet
   - Progress bar and completion celebration

7. **Reports & Analytics**:
   - Trend area charts comparing income vs expenses over time
   - Top expenditure category rankings

8. **Recurring Payments & Reminders**:
   - Scheduled bills, internet fees, flat rent, and subscription retainers
   - Active/Pause toggle and next due date tracking

9. **Security & Supabase Cloud Integration**:
   - Works immediately out-of-the-box in **Offline / Local Demo Mode**
   - Ready-to-deploy PostgreSQL schema in `src/supabase/schema.sql` with **Row Level Security (RLS)**
   - Enter your Supabase URL & Anon Key in the **Settings** page for instant cloud synchronization

---

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (Color palette: Primary `#7657E8`, Income `#16A36A`, Expense `#E45465`)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Router**: React Router DOM v7
- **Precise Money Math**: Decimal.js
- **Export Engines**: PapaParse (CSV) & jsPDF + AutoTable (PDF)
- **Database & Auth**: Supabase PostgreSQL with RLS (plus local storage fallback)

---

## 💻 How to Run Locally

### 1. Start the Development Server:
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 2. Build for Production:
```bash
npm run build
```

---

## 📱 Mobile App (Capacitor) Setup

To package FINORA as an Android or iOS application:

```bash
# Install Capacitor core & CLI
npm install @capacitor/core @capacitor/cli @capacitor/android

# Initialize Capacitor
npx cap init FINORA com.finora.app --web-dir dist

# Build the web bundle
npm run build

# Add Android platform
npx cap add android

# Open Android Studio
npx cap open android
```

---

## 🗄️ Database Setup (Supabase)

1. Open your [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor**.
3. Open `src/supabase/schema.sql` from this repository and run the entire script.
4. Go to **Project Settings > API** and copy:
   - `Project URL`
   - `anon public key`
5. In FINORA, navigate to **Settings > Supabase Cloud Database** and paste your credentials, or put them in `.env`.
