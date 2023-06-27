USE employeeTracker_db;

INSERT INTO departments (department_name)
VALUES
('Executive Board'),
('Marketing'),
('Human Resources'),
('Finance'),
('Engineering'),
('Information Technology'),
('Customer Relations'),
('Research and Development'),
('Legal'),
('Maintenance');

INSERT INTO roles (title, salary, department_id)
VALUES 
('Vibrator-Equipment Tester', 555000.00, 1),
('Back-end Specialist', 125000.00, 2),
('Digital Overlord', 189000.00, 3),
('Finance Head', 145000.00, 4),
('Smutter', 185000.00, 5),
('Bunghole Borer', 125000.00, 6),
('Customer Relations Manager', 75000.00, 7),
('Chick Sexer', 185000.00, 8),
('Penetration Tester', 95000.00, 9),
('Erection Engineer', 135000.00, 10);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES
('Mike', 'Hawk', 1, 1),
('Ben', 'Dover', 2, 2),
('Phil', 'McCavity', 3, 3),
('Jenny', 'Talia', 4, 4),
('Jack', 'Mihoff', 5, 5),
('Richard', 'Head', 6, 6),
('Anita', 'Hanjaab', 7, 7),
('Dixon', 'Kuntz', 8, 8),
('Harry', 'Sach', 9, 9),
('Hugh', 'Janus', 10, 10);