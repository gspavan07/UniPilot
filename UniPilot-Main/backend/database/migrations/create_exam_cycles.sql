-- Exam Cycles Table
-- Stores master exam cycle information with auto-generated names

CREATE TABLE IF NOT EXISTS exam_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_name VARCHAR(255) NOT NULL UNIQUE,
  degree VARCHAR(50) NOT NULL,
  regulation_id UUID REFERENCES regulations(id) ON DELETE RESTRICT,
  exam_month VARCHAR(20) NOT NULL,
  course_type VARCHAR(50) NOT NULL,
  cycle_type VARCHAR(50) NOT NULL,
  batch VARCHAR(20) NOT NULL,
  semester INTEGER NOT NULL,
  exam_year INTEGER NOT NULL,
  needs_fee BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'scheduling',
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_exam_cycles_status ON exam_cycles(status);
CREATE INDEX idx_exam_cycles_regulation ON exam_cycles(regulation_id);
CREATE INDEX idx_exam_cycles_batch ON exam_cycles(batch);
CREATE INDEX idx_exam_cycles_year_semester ON exam_cycles(exam_year, semester);

-- Comments for documentation
COMMENT ON TABLE exam_cycles IS 'Master exam cycle information with auto-generated names like B.Tech_R20_VI_Semester_Examination_Feb-2026';
COMMENT ON COLUMN exam_cycles.status IS 'Values: scheduling, scheduled, active, completed';
COMMENT ON COLUMN exam_cycles.needs_fee IS 'Whether students need to pay fee for this exam cycle';
