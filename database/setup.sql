CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  company_name TEXT,
  phone_number TEXT,
  invoice_type TEXT,
  invoice_number TEXT
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer TEXT NOT NULL,
  items TEXT NOT NULL, -- JSON string: [{productId, quantity, unit, price, cost}, ...]
  total REAL NOT NULL,
  date TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  invoice_type TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  discount REAL DEFAULT 0,
  bank_name TEXT
);