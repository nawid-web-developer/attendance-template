USE attendance;

INSERT IGNORE INTO workspaces (id, name, type, timezone) VALUES
  (1, 'Northstar Academy', 'School workspace', 'UTC'),
  (2, 'Lumen University', 'University workspace', 'UTC'),
  (3, 'Orbit & Co.', 'Company workspace', 'UTC'),
  (4, 'Forge Training', 'Training workspace', 'UTC');

INSERT IGNORE INTO work_schedules (workspace_id, work_start, work_end, grace_minutes) VALUES
  (1, '08:30:00', '16:30:00', 10),
  (2, '09:00:00', '17:00:00', 10),
  (3, '09:00:00', '17:30:00', 5),
  (4, '09:00:00', '17:00:00', 10);

INSERT IGNORE INTO people (id, workspace_id, full_name, group_name, role, qr_code, hourly_rate, avatar_color) VALUES
  (1, 1, 'Emma Smith', 'Year 10 · Room 204', 'Employee', 'employee-0001', 18.50, '#dff3e6'),
  (2, 1, 'Jordan Miller', 'Year 12 · Room 108', 'Employee', 'employee-0002', 21.00, '#fbe4d8'),
  (3, 1, 'Alex Lee', 'Year 9 · Room 201', 'Employee', 'employee-0003', 19.25, '#e6e6fa'),
  (4, 1, 'Samira Khan', 'Year 11 · Room 302', 'Employee', 'employee-0004', 22.00, '#f9e5c7'),
  (5, 2, 'Dr. Maya Patel', 'Computer Science · Lab 3', 'Employee', 'employee-0005', 35.00, '#dff3e6'),
  (6, 2, 'Noah Williams', 'Computer Science · Lab 3', 'Employee', 'employee-0006', 20.00, '#e6e6fa'),
  (7, 3, 'Jamie Chen', 'Product · Squad A', 'Employee', 'employee-0007', 32.00, '#fbe4d8'),
  (8, 3, 'Rafael Costa', 'Engineering · Squad B', 'Employee', 'employee-0008', 38.00, '#dff3e6'),
  (9, 4, 'Mina Rahimi', 'Leadership cohort', 'Employee', 'employee-0009', 24.00, '#f9e5c7');
