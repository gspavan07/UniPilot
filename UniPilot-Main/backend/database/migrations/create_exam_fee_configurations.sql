-- Exam Fee Configurations Table
-- Base fee configuration with registration date windows

CREATE TABLE IF NOT EXISTS exam_fee_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_cycle_id UUID REFERENCES exam_cycles(id) ON DELETE CASCADE,
  base_fee DECIMAL(10,2) NOT NULL CHECK (base_fee >= 0),
  regular_start_date DATE NOT NULL,
  regular_end_date DATE NOT NULL,
  final_registration_date DATE NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(exam_cycle_id),
  CONSTRAINT valid_date_range CHECK (
    regular_start_date <= regular_end_date AND 
    regular_end_date <= final_registration_date
  )
);

-- Late Fee Slabs Table
-- Date-based late fee slabs for flexible fine calculation

CREATE TABLE IF NOT EXISTS late_fee_slabs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_config_id UUID REFERENCES exam_fee_configurations(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  fine_amount DECIMAL(10,2) NOT NULL CHECK (fine_amount >= 0),
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_slab_dates CHECK (start_date <= end_date)
);

-- Fee Configuration Audit Logs Table
-- Track all changes to fee configurations

CREATE TABLE IF NOT EXISTS fee_config_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_config_id UUID REFERENCES exam_fee_configurations(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  field_changed VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_fee_config_cycle ON exam_fee_configurations(exam_cycle_id);
CREATE INDEX idx_late_fee_config ON late_fee_slabs(fee_config_id);
CREATE INDEX idx_late_fee_dates ON late_fee_slabs(start_date, end_date);
CREATE INDEX idx_fee_audit_config ON fee_config_audit_logs(fee_config_id, changed_at DESC);

-- Comments for documentation
COMMENT ON TABLE exam_fee_configurations IS 'Base exam fee with registration date windows';
COMMENT ON TABLE late_fee_slabs IS 'Date-based late fee slabs (e.g., Feb 10-11: ₹100, Feb 12: ₹1000)';
COMMENT ON TABLE fee_config_audit_logs IS 'Audit trail for all fee configuration changes';
COMMENT ON COLUMN exam_fee_configurations.final_registration_date IS 'After this date, registration is blocked';
