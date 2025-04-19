USE public;

-- Insert dummy data into Organisations
INSERT INTO Organisations (name, line_1, line_2, zip_code, city, state, country, industry) VALUES
('TechCorp', '123 Tech Street', 'Suite 100', 12345, 'Tech City', 'Tech State', 'Tech Country', 'Technology'),
('HealthInc', '456 Health Avenue', 'Building B', 67890, 'Health City', 'Health State', 'Health Country', 'Healthcare'),
('EduWorld', '789 Education Blvd', 'Room 101', 11223, 'Edu City', 'Edu State', 'Edu Country', 'Education');

-- Insert dummy data into Roles
INSERT INTO Roles (name) VALUES
('Admin'),
('User');

-- Insert dummy data into User_Groups
INSERT INTO User_Groups (organisation_id, name) VALUES
(1, 'Marketing Department'),
(1, 'Sales Department'),
(2, 'Administrative Staff'),
(3, 'Support Staff'),
(3, 'R&D Team');

-- Insert dummy data into Users
INSERT INTO Users (organisation_id, email, password, name, role_id, user_group) VALUES
(1, 'john.doe@example.com', 'password123', 'John Doe', 1, [1, 2]),
(1, 'jane.smith@example.com', 'password456', 'Jane Smith', 2, [2]),
(2, 'alice.johnson@example.com', 'password789', 'Alice Johnson', 2, [3]);


