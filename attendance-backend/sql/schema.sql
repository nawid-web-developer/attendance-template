CREATE DATABASE IF NOT EXISTS attendance;
USE attendance;

CREATE TABLE IF NOT EXISTS workspaces (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  type VARCHAR(80) NOT NULL,
  timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS people (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  workspace_id INT UNSIGNED NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  group_name VARCHAR(160) NOT NULL DEFAULT '',
  role VARCHAR(80) NOT NULL DEFAULT 'Employee',
  qr_code VARCHAR(160) NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 0,
  avatar_color CHAR(7) NOT NULL DEFAULT '#dff3e6',
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_people_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  UNIQUE KEY people_qr_code (qr_code),
  INDEX people_workspace_active (workspace_id, active)
);

CREATE TABLE IF NOT EXISTS work_schedules (
  workspace_id INT UNSIGNED PRIMARY KEY,
  work_start TIME NOT NULL DEFAULT '09:00:00',
  work_end TIME NOT NULL DEFAULT '17:00:00',
  grace_minutes INT UNSIGNED NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_schedule_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attendance_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  workspace_id INT UNSIGNED NOT NULL,
  person_id INT UNSIGNED NOT NULL,
  work_date DATE NOT NULL,
  device_id VARCHAR(120) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'present',
  method VARCHAR(20) NOT NULL DEFAULT 'qr',
  checked_in_at DATETIME NULL,
  checked_out_at DATETIME NULL,
  late_minutes INT UNSIGNED NOT NULL DEFAULT 0,
  early_leave_minutes INT UNSIGNED NOT NULL DEFAULT 0,
  deduction_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_attendance_workspace FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  CONSTRAINT fk_attendance_person FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
  UNIQUE KEY attendance_person_day (workspace_id, person_id, work_date),
  INDEX attendance_workspace_date (workspace_id, work_date),
  INDEX attendance_person_date (person_id, work_date)
);
