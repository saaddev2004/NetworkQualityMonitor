-- 1. Database banayein
CREATE DATABASE IF NOT EXISTS network_monitor_db;
USE network_monitor_db;

-- 2. Table A: monitored_targets create karein
CREATE TABLE IF NOT EXISTS monitored_targets (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    target_type ENUM('website', 'http_service', 'host') NOT NULL,
    address VARCHAR(2048) NOT NULL,
    check_method ENUM('http', 'icmp') NOT NULL,
    check_interval_seconds INT UNSIGNED NOT NULL DEFAULT 60,
    warning_threshold_ms INT UNSIGNED NOT NULL DEFAULT 500,
    critical_threshold_ms INT UNSIGNED NOT NULL DEFAULT 1000,
    timeout_seconds INT UNSIGNED NOT NULL DEFAULT 5,
    is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    current_status ENUM('unknown', 'online', 'offline', 'warning', 'critical', 'disabled') NOT NULL DEFAULT 'unknown',
    last_checked_at DATETIME(3) NULL,
    created_at DATETIME(3) NOT NULL,
    updated_at DATETIME(3) NOT NULL
);

-- 3. Table B: monitoring_results create karein
CREATE TABLE IF NOT EXISTS monitoring_results (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    target_id INT UNSIGNED NOT NULL,
    checked_at DATETIME(3) NOT NULL,
    is_available BOOLEAN NOT NULL,
    response_time_ms DECIMAL(10,2) NULL,
    http_status_code SMALLINT UNSIGNED NULL,
    result_status ENUM('online', 'offline', 'warning', 'critical', 'error') NOT NULL,
    error_type VARCHAR(50) NULL,
    error_message VARCHAR(500) NULL,
    created_at DATETIME(3) NOT NULL,
    FOREIGN KEY (target_id) REFERENCES monitored_targets(id) ON DELETE CASCADE,
    INDEX idx_history (target_id, checked_at),
    INDEX idx_checked_at (checked_at)
);

-- 4. Table C: events create karein
CREATE TABLE IF NOT EXISTS events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    target_id INT UNSIGNED NOT NULL,
    event_type ENUM('warning', 'critical', 'offline', 'recovery', 'repeated_failure') NOT NULL,
    severity ENUM('info', 'warning', 'critical') NOT NULL,
    description VARCHAR(500) NOT NULL,
    occurred_at DATETIME(3) NOT NULL,
    resolved_at DATETIME(3) NULL,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME(3) NOT NULL,
    FOREIGN KEY (target_id) REFERENCES monitored_targets(id) ON DELETE CASCADE,
    INDEX idx_events_target_time (target_id, occurred_at),
    INDEX idx_is_resolved (is_resolved)
);