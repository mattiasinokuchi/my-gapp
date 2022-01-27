# Clone

## Install dependencies

```bash
npm install
```

## Setup database

Create tables

```sql
DROP TABLE IF EXISTS product_table;

CREATE TABLE product_table (
	id serial PRIMARY KEY,
	product_name TEXT NOT NULL,
	price INT NOT NULL,
	delivery_interval INT
);

INSERT INTO product_table(
	product_name, price, delivery_interval)
VALUES
	('Big bag of vegetables', 20, 7),
	('1 kg of tomatoes', 10, NULL);

DROP TABLE IF EXISTS customer_table;

CREATE TABLE customer_table (
	id serial PRIMARY KEY,
	first_name TEXT NOT NULL,
	last_name TEXT NOT NULL,
	street_address TEXT NOT NULL,
	postcode TEXT NOT NULL,
	city TEXT NOT NULL,
	telephone TEXT NOT NULL,
	email TEXT NOT NULL,
	active BOOLEAN NOT NULL DEFAULT TRUE,
	delivery_order INT
);

INSERT INTO customer_table(
	first_name,
	last_name,
	street_address,
	postcode,
	city,
	telephone,
	email,
 	delivery_order)
VALUES(
	'Dynamit',
	'Harry',
	'Vilkenjädragatan 0',
	'6...5...4...',
	'Hadirajastad',
	'3...2...1...',
	'eld.i@berg.et',
	'1');

DROP TABLE IF EXISTS time_out_table;

CREATE TABLE time_out_table (
	id serial PRIMARY KEY,
	customer_id INT NOT NULL,
	start_time DATE NOT NULL,
	end_time DATE NOT NULL
);

INSERT INTO time_out_table(
	customer_id,
	start_time,
	end_time)
VALUES(
	'1',
	'2021-12-01',
	'2022-01-01');

DROP TABLE IF EXISTS order_table;

CREATE TABLE order_table (
	id serial PRIMARY KEY,
	customer_id INT NOT NULL,
	product_id INT NOT NULL,
	start_date DATE NOT NULL
);

INSERT INTO order_table(
	customer_id,
	product_id,
	start_date)
VALUES
	('1', '1', CURRENT_DATE),
	('1', '2', CURRENT_DATE);

DROP TABLE IF EXISTS delivery_table;

CREATE TABLE delivery_table (
	id serial PRIMARY KEY,
	delivery_time TIMESTAMPTZ NOT NULL DEFAULT timezone('Europe/Stockholm', NOW()),
	customer_id INT NOT NULL,
	product_name TEXT NOT NULL,
	product_id TEXT NOT NULL,
	price INT NOT NULL,
	order_id INT NOT NULL,
	billing_date DATE
);

INSERT INTO delivery_table(
	customer_id,
	price,
	product_name,
	product_id,
	order_id
)
VALUES(
	'1',
	'20',
	'Big bag of vegetable',
	'1',
	'1'
);
```

## Develop

```bash
npm run dev
```

