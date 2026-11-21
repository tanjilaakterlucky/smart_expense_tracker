-- ==============================================================================
-- FINORA - Smart Personal Finance & Wealth Management Platform
-- Complete SaaS Database Schema with 15 Core Tables & Strict Row Level Security (RLS)
-- ==============================================================================

-- 0. Extensions
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Helper function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- ==============================================================================
-- 1. PROFILES (User Profile extending auth.users)
-- ==============================================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  country text default 'Bangladesh',
  timezone text default 'Asia/Dhaka',
  primary_currency text not null default 'BDT',
  theme text default 'light' check (theme in ('light', 'dark', 'system')),
  role text not null default 'user' check (role in ('user', 'admin', 'support')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 2. WALLETS (Cash, Bank Accounts, Mobile Financial Services)
-- ==============================================================================
create table if not exists public.wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null check (type in ('cash', 'bank', 'bkash', 'nagad', 'rocket', 'paypal', 'other')),
  balance numeric(18, 4) not null default 0.0000,
  currency text not null default 'BDT',
  account_number text,
  color text default '#7657E8',
  icon text default 'Wallet',
  is_archived boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 3. CATEGORIES (Expense & Income Classification)
-- ==============================================================================
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text not null default 'Tag',
  color text not null default '#7657E8',
  is_default boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 4. TRANSACTIONS (Financial Ledger with Currency Snapshot & Decimal Precision)
-- ==============================================================================
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  wallet_id uuid references public.wallets on delete cascade not null,
  to_wallet_id uuid references public.wallets on delete set null,
  category_id uuid references public.categories on delete set null,
  type text not null check (type in ('income', 'expense', 'transfer')),
  amount numeric(18, 4) not null check (amount > 0),
  currency text not null default 'BDT',
  exchange_rate numeric(18, 6) not null default 1.000000,
  converted_amount_usd numeric(18, 4) not null default 0.0000,
  date date not null default current_date,
  description text not null,
  notes text,
  attachment_url text,
  is_recurring boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 5. BUDGETS (Category-wise & Monthly Spending Limits)
-- ==============================================================================
create table if not exists public.budgets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  category_id uuid references public.categories on delete cascade not null,
  amount numeric(18, 4) not null check (amount > 0),
  period text not null default 'monthly' check (period in ('monthly', 'weekly')),
  alert_threshold integer default 80 check (alert_threshold between 10 and 100),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, category_id, period)
);

-- ==============================================================================
-- 6. SAVINGS_GOALS (Target & Progress Tracking)
-- ==============================================================================
create table if not exists public.savings_goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  target_amount numeric(18, 4) not null check (target_amount > 0),
  current_amount numeric(18, 4) not null default 0.0000 check (current_amount >= 0),
  currency text not null default 'BDT',
  target_date date,
  color text default '#7657E8',
  icon text default 'Target',
  is_completed boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 7. RECURRING_TRANSACTIONS (Automated Subscriptions, Salaries & Bills)
-- ==============================================================================
create table if not exists public.recurring_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  wallet_id uuid references public.wallets on delete cascade not null,
  category_id uuid references public.categories on delete set null,
  title text not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(18, 4) not null check (amount > 0),
  currency text not null default 'BDT',
  frequency text not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  start_date date not null default current_date,
  next_due_date date not null,
  end_date date,
  is_active boolean default true not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 8. NOTIFICATIONS (In-App Alerts, Reminders & System Notices)
-- ==============================================================================
create table if not exists public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  message text not null,
  type text not null check (type in ('budget_alert', 'recurring_reminder', 'goal_reached', 'security', 'info')),
  is_read boolean default false not null,
  link text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 9. EXCHANGE_RATES (Multi-Currency Conversion Cache & History)
-- ==============================================================================
create table if not exists public.exchange_rates (
  id uuid default gen_random_uuid() primary key,
  base_currency text not null default 'USD',
  target_currency text not null,
  rate numeric(18, 6) not null check (rate > 0),
  source text default 'open_exchange_rates',
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (base_currency, target_currency)
);

-- ==============================================================================
-- 10. ATTACHMENTS (Secure Receipt & Document Metadata)
-- ==============================================================================
create table if not exists public.attachments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  transaction_id uuid references public.transactions on delete set null,
  file_name text not null,
  file_size integer not null,
  mime_type text not null,
  storage_path text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 11. USER_SETTINGS (Preferences, Security & Notifications)
-- ==============================================================================
create table if not exists public.user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  email_notifications boolean default true not null,
  push_notifications boolean default true not null,
  budget_alerts boolean default true not null,
  mfa_enabled boolean default false not null,
  biometric_login boolean default false not null,
  language text default 'en' not null,
  auto_backup boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 12. AUDIT_LOGS (Security, Authentication & Data Access Activity)
-- ==============================================================================
create table if not exists public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  action text not null, -- e.g. 'login', 'logout', 'password_change', 'data_export', 'account_delete_requested'
  ip_address text,
  user_agent text,
  details jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 13. SUBSCRIPTIONS (SaaS Tier, Quotas & Billing)
-- ==============================================================================
create table if not exists public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null unique,
  plan_tier text not null default 'free' check (plan_tier in ('free', 'pro', 'enterprise')),
  status text not null default 'active' check (status in ('active', 'past_due', 'canceled', 'trialing')),
  current_period_end timestamp with time zone,
  cancel_at_period_end boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 14. SUPPORT_TICKETS (Customer Helpdesk & Feedback)
-- ==============================================================================
create table if not exists public.support_tickets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  subject text not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  admin_reply text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- 15. DEVICES (Registered Devices & Session Management)
-- ==============================================================================
create table if not exists public.devices (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  device_name text not null,
  browser text,
  os text,
  ip_address text,
  last_active timestamp with time zone default timezone('utc'::text, now()) not null,
  is_current boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- UPDATED_AT TRIGGERS
-- ==============================================================================
create or replace trigger tr_profiles_updated_at before update on public.profiles for each row execute function public.handle_updated_at();
create or replace trigger tr_wallets_updated_at before update on public.wallets for each row execute function public.handle_updated_at();
create or replace trigger tr_transactions_updated_at before update on public.transactions for each row execute function public.handle_updated_at();
create or replace trigger tr_budgets_updated_at before update on public.budgets for each row execute function public.handle_updated_at();
create or replace trigger tr_savings_goals_updated_at before update on public.savings_goals for each row execute function public.handle_updated_at();
create or replace trigger tr_recurring_updated_at before update on public.recurring_transactions for each row execute function public.handle_updated_at();
create or replace trigger tr_user_settings_updated_at before update on public.user_settings for each row execute function public.handle_updated_at();
create or replace trigger tr_subscriptions_updated_at before update on public.subscriptions for each row execute function public.handle_updated_at();
create or replace trigger tr_support_tickets_updated_at before update on public.support_tickets for each row execute function public.handle_updated_at();

-- ==============================================================================
-- AUTOMATIC PROFILE & SETTINGS CREATION TRIGGER ON SIGNUP
-- ==============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- 1. Insert Profile
  insert into public.profiles (id, email, full_name, avatar_url, primary_currency)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'Finora Member'),
    new.raw_user_meta_data->>'avatar_url',
    coalesce(new.raw_user_meta_data->>'primary_currency', 'BDT')
  );

  -- 2. Insert User Settings
  insert into public.user_settings (user_id)
  values (new.id);

  -- 3. Insert Default Free Subscription
  insert into public.subscriptions (user_id, plan_tier, status)
  values (new.id, 'free', 'active');

  -- 4. Insert Default Starter Wallets (Cash & Bank)
  insert into public.wallets (user_id, name, type, balance, currency, color, icon)
  values
    (new.id, 'Cash in Hand', 'cash', 0.0000, 'BDT', '#10B981', 'Banknote'),
    (new.id, 'Primary Bank', 'bank', 0.0000, 'BDT', '#7657E8', 'Building2');

  -- 5. Insert Welcome Notification
  insert into public.notifications (user_id, title, message, type)
  values (
    new.id,
    'Welcome to FINORA! 🎉',
    'Your isolated, highly secure finance tracker is ready. Start by setting your wallets and logging your transactions.',
    'info'
  );

  return new;
end;
$$ language plpgsql security definer;

-- Trigger execution after auth.users insertion
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES — 100% USER DATA ISOLATION
-- ==============================================================================

-- Enable RLS on all 15 tables
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.savings_goals enable row level security;
alter table public.recurring_transactions enable row level security;
alter table public.notifications enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.attachments enable row level security;
alter table public.user_settings enable row level security;
alter table public.audit_logs enable row level security;
alter table public.subscriptions enable row level security;
alter table public.support_tickets enable row level security;
alter table public.devices enable row level security;

-- 1. PROFILES
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- 2. WALLETS
create policy "Users manage own wallets" on public.wallets for all using (auth.uid() = user_id);

-- 3. CATEGORIES (Read system defaults OR manage own)
create policy "Users read own and default categories" on public.categories for select using (auth.uid() = user_id or is_default = true);
create policy "Users create own categories" on public.categories for insert with check (auth.uid() = user_id);
create policy "Users update own categories" on public.categories for update using (auth.uid() = user_id and is_default = false);
create policy "Users delete own categories" on public.categories for delete using (auth.uid() = user_id and is_default = false);

-- 4. TRANSACTIONS
create policy "Users manage own transactions" on public.transactions for all using (auth.uid() = user_id);

-- 5. BUDGETS
create policy "Users manage own budgets" on public.budgets for all using (auth.uid() = user_id);

-- 6. SAVINGS GOALS
create policy "Users manage own savings" on public.savings_goals for all using (auth.uid() = user_id);

-- 7. RECURRING TRANSACTIONS
create policy "Users manage own recurring" on public.recurring_transactions for all using (auth.uid() = user_id);

-- 8. NOTIFICATIONS
create policy "Users manage own notifications" on public.notifications for all using (auth.uid() = user_id);

-- 9. EXCHANGE RATES (Publicly readable, authenticated write)
create policy "Anyone can read exchange rates" on public.exchange_rates for select using (true);

-- 10. ATTACHMENTS
create policy "Users manage own attachments" on public.attachments for all using (auth.uid() = user_id);

-- 11. USER SETTINGS
create policy "Users manage own settings" on public.user_settings for all using (auth.uid() = user_id);

-- 12. AUDIT LOGS (Users can view own logs, insert own logs)
create policy "Users view own audit logs" on public.audit_logs for select using (auth.uid() = user_id);
create policy "Users insert own audit logs" on public.audit_logs for insert with check (auth.uid() = user_id);

-- 13. SUBSCRIPTIONS
create policy "Users view own subscription" on public.subscriptions for select using (auth.uid() = user_id);

-- 14. SUPPORT TICKETS
create policy "Users manage own support tickets" on public.support_tickets for all using (auth.uid() = user_id);

-- 15. DEVICES
create policy "Users manage own devices" on public.devices for all using (auth.uid() = user_id);

-- ==============================================================================
-- PERFORMANCE & SECURITY INDEXES
-- ==============================================================================
create index if not exists idx_tx_user_date on public.transactions(user_id, date desc);
create index if not exists idx_tx_wallet on public.transactions(wallet_id);
create index if not exists idx_tx_category on public.transactions(category_id);
create index if not exists idx_wallets_user on public.wallets(user_id);
create index if not exists idx_budgets_user on public.budgets(user_id);
create index if not exists idx_savings_user on public.savings_goals(user_id);
create index if not exists idx_recurring_user on public.recurring_transactions(user_id);
create index if not exists idx_notifications_user on public.notifications(user_id, is_read);
create index if not exists idx_audit_user_created on public.audit_logs(user_id, created_at desc);
create index if not exists idx_devices_user on public.devices(user_id);
create index if not exists idx_support_user on public.support_tickets(user_id);

-- ==============================================================================
-- STORAGE BUCKET POLICIES (Receipts & Avatars with Private Isolation)
-- ==============================================================================
-- Insert private storage buckets
insert into storage.buckets (id, name, public)
values 
  ('receipts', 'receipts', false),
  ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Storage policies: Receipts are private to each user (folder name = user_id)
create policy "Users upload own receipts"
  on storage.objects for insert
  with check (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users view own receipts"
  on storage.objects for select
  using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own receipts"
  on storage.objects for delete
  using (bucket_id = 'receipts' and auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies: Avatars
create policy "Users upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');
