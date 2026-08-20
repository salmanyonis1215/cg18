# Green Ledger

Build a full-stack web application called:

Vegetable Brokerage Management System (VBMS)

🛠️ Tech Stack:

Frontend: React + TypeScript (Vite)

Styling: Tailwind CSS

Backend & Database: Supabase

Auth: Supabase Auth (Email/Password)

🎯 Goal:

The system manages a vegetable brokerage business where:

Farmers supply vegetables via drivers

A Broker (Admin) manages the business

Salesmen sell products to customers

Customers mostly buy on credit (debt system)

The current system is manual (paper-based), and this app should digitize all operations.

👥 User Roles:

1. Admin (Broker)

Full system access

Main dashboard (global view)

Manages users, reports, and finances

2. Salesman

Limited access

Has personal dashboard

Can only manage their own sales, customers, and collections

🔐 Authentication & Authorization:

Use Supabase Auth

Role-based access control:

Admin → full access

Salesman → restricted access (only own data)

🧩 Core Features (MVP)

1. 🚛 Deliveries Module

Used to record vegetables coming from farmers via drivers.

Fields:

driver_name

farmer_name

product_name

quantity

transport_cost_per_unit (optional)

total_transport_cost (auto-calculated OR default 0)

date

Logic:

If transport_cost_per_unit is provided:
total_transport_cost = quantity × transport_cost_per_unit

If NOT provided:
total_transport_cost = 0

2. 🧺 Sales Module

Salesmen record product sales.

Fields:

customer_name

product_name

quantity

price_per_unit

total_price

date

salesman_id

Rules:

All sales are treated as credit (debt) by default

3. 💳 Debt Management System

Requirements:

Each customer has a running balance

Customers can:

Have existing debt

Take more products while still in debt

Logic:

New sale → increases customer balance

Payment → decreases customer balance

Example:

Old debt = $100

New purchase = $50
👉 New total = $150

Payment = $70
👉 Remaining = $80

4. 💰 Payments (Collections)

Salesmen collect money from customers.

Fields:

customer_id

amount_paid

date

salesman_id

Logic:

Reduce customer balance automatically

Allow partial payments

Balance should never break (no negative issues)

5. 🌾 Farmer Settlement System

Automatically calculate what each farmer earns.

Formula:

farmer_earning =
(total_sales)

(10% commission)

(transport_cost OR 0 if not provided)

Example:

Sales = $1000

Commission (10%) = $100

Transport = $200
👉 Farmer gets = $700

6. 📊 Dashboard System

🧑‍💼 Admin Dashboard (Main Dashboard)

Show:

Total Sales

Total Outstanding Debt

Total Collections

Total Commission (Profit)

Farmer Payables

All deliveries

All sales (all salesmen)

👨‍🌾 Salesman Dashboard (Sub Dashboard)

Show only their data:

Their sales

Their customers

Their collections

Customer debts

🗃️ Database Schema (Supabase)

Create tables:

users

id (uuid)

name

role (admin | salesman)

customers

id

name

phone (optional)

balance (default 0)

farmers

id

name

drivers

id

name

products

id

name

deliveries

id

driver_id

farmer_id

product_id

quantity

transport_cost_per_unit (nullable)

total_transport_cost (default 0)

date

sales

id

customer_id

product_id

quantity

price_per_unit

total_price

date

salesman_id

payments

id

customer_id

amount

date

salesman_id

⚙️ Core Business Logic

On SALE insert:
→ increase customer.balance

On PAYMENT insert:
→ decrease customer.balance

Commission:
→ 10% of total sales

Transport cost:
→ optional (default 0)

Farmer payout:
→ auto-calculated

🎨 UI/UX Requirements

Clean modern dashboard

Sidebar navigation

Responsive layout

Tables:

sales

customers

deliveries

Forms:

Add sale

Add delivery

Record payment

🔐 Permissions

Admin:

Full CRUD access

View all data

Manage users

Salesman:

Only:

Their sales

Their customers

Their payments

📈 MVP Scope

Focus on:

Working CRUD

Accurate calculations

Simple dashboards

Avoid over-engineering.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://cg18.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b786706f-d330-421f-9352-bc644332950b).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
