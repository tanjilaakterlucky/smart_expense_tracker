-- =======================================================
-- FINORA - Smart Personal Finance Management System
-- Supabase PostgreSQL Schema with Row Level Security (RLS)
-- =======================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (extends supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  primary_currency text not null default 'BDT',
  theme text default 'light',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. WALLETS (Cash, Bank, bKash, Nagad, etc.)
create table if not exists public.wallets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null check (type in ('cash', 'bank', 'bkash', 'nagad', 'rocket', 'paypal', 'other')),
  balance numeric(18, 4) not null default 0.0000,
  currency text not null default 'BDT',
  account_number text,
  color text default '#7657E8',
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. CATEGORIES (Income & Expense types)
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text not null default 'Tag',
  color text not null default '#7657E8',
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. TRANSACTIONS
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  wallet_id uuid references public.wallets on delete cascade not null,
  to_wallet_id uuid references public.wallets on delete set null,
  category_id uuid references public.categories on delete set null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  amount numeric(18, 4) not null,
  currency text not null,
  exchange_rate numeric(18, 6) not null default 1.0,
  converted_amount_usd numeric(18, 4) not null,
  date date not null default current_date,
  description text,
  attachment_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. BUDGETS
create table if not exists public.budgets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories on delete cascade not null,
  amount numeric(18, 4) not null,
  period text not null default 'monthly' check (period in ('monthly', 'weekly')),
  alert_threshold int default 80,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. SAVINGS GOALS
create table if not exists public.savings_goals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  target_amount numeric(18, 4) not null,
  current_amount numeric(18, 4) not null default 0.0000,
  currency text not null default 'BDT',
  target_date date,
  color text default '#7657E8',
  icon text default 'Target',
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. RECURRING TRANSACTIONS
create table if not exists public.recurring_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  wallet_id uuid references public.wallets on delete cascade not null,
  category_id uuid references public.categories on delete set null,
  title text not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(18, 4) not null,
  currency text not null default 'BDT',
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  start_date date not null default current_date,
  next_due_date date not null,
  end_date date,
  is_active boolean default true,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. NOTIFICATIONS
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  message text not null,
  type text not null,
  is_read boolean default false,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.notifications enable row level security;

-- Policies (Only owner can read/insert/update/delete)
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users manage own wallets" on public.wallets for all using (auth.uid() = user_id);
create policy "Users manage own categories" on public.categories for all using (auth.uid() = user_id or is_default = true);
create policy "Users manage own transactions" on public.transactions for all using (auth.uid() = user_id);
create policy "Users manage own budgets" on public.budgets for all using (auth.uid() = user_id);
create policy "Users manage own savings" on public.savings_goals for all using (auth.uid() = user_id);
create policy "Users manage own recurring" on public.recurring_transactions for all using (auth.uid() = user_id);
create policy "Users manage own notifications" on public.notifications for all using (auth.uid() = user_id);

-- Indexes for lightning fast queries
create index if not exists idx_tx_user_date on public.transactions(user_id, date desc);
create index if not exists idx_tx_wallet on public.transactions(wallet_id);
create index if not exists idx_tx_category on public.transactions(category_id);
create index if not exists idx_wallets_user on public.wallets(user_id);
create index if not exists idx_budgets_user on public.budgets(user_id);
