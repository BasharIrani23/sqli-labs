-- Synthetic seed data for SQLi-Labs. Not real credentials.

INSERT INTO users (username, password, email, role) VALUES
('alice',   'alice_pw123',   'alice@sqlilabs.edu',   'student'),
('bob',     'bobby_secure!', 'bob@sqlilabs.edu',     'student'),
('admin',   'S3cretAdm1n!',  'admin@sqlilabs.edu',   'admin'),
('grader',  'grade_me_2026', 'grader@sqlilabs.edu',  'instructor');

INSERT INTO products (name, description, price, category) VALUES
('Wireless Mouse',        'Ergonomic 2.4GHz wireless mouse',        19.99, 'electronics'),
('Mechanical Keyboard',   'Hot-swappable mechanical keyboard',      74.50, 'electronics'),
('USB-C Hub',             '7-in-1 USB-C hub with HDMI',             29.99, 'electronics'),
('Notebook',               'A5 dotted-grid notebook',                 6.50, 'stationery'),
('Desk Lamp',              'LED desk lamp with adjustable brightness',22.00, 'home'),
('Water Bottle',           '1L stainless steel water bottle',        15.75, 'lifestyle'),
('Backpack',               'Water-resistant 20L laptop backpack',    45.00, 'lifestyle');

-- What students should discover via UNION-based injection.
INSERT INTO admin_secrets (secret_name, secret_value, category) VALUES
('flag',               'FLAG{union_based_sqli_confirmed}',  'ctf'),
('internal_api_key',   'sk_demo_5f8a2c9e1b3d4f76',          'confidential'),
('backup_admin_note',  'Rotate demo credentials each cohort','confidential');
