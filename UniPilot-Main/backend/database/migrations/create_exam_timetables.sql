-- Exam Timetables Table
-- Stores individual exam schedule entries for each program and course

CREATE TABLE IF NOT EXISTS exam_timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_cycle_id UUID REFERENCES exam_cycles(id) ON DELETE CASCADE,
  program_id UUID REFERENCES programs(id) ON DELETE RESTRICT,
  course_id UUID REFERENCES courses(id) ON DELETE RESTRICT,
  exam_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session VARCHAR(20) DEFAULT 'full_day',
  roll_number_range JSONB,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Indexes for performance
CREATE INDEX idx_timetables_cycle ON exam_timetables(exam_cycle_id);
CREATE INDEX idx_timetables_date ON exam_timetables(exam_date);
CREATE INDEX idx_timetables_program ON exam_timetables(program_id);
CREATE INDEX idx_timetables_course ON exam_timetables(course_id);
CREATE INDEX idx_timetables_not_deleted ON exam_timetables(exam_cycle_id, is_deleted);

-- Comments for documentation
COMMENT ON TABLE exam_timetables IS 'Individual exam schedule entries with support for morning/afternoon sessions and roll number ranges';
COMMENT ON COLUMN exam_timetables.session IS 'Values: morning, afternoon, full_day';
COMMENT ON COLUMN exam_timetables.roll_number_range IS 'JSON: {"from": "22A91A6101", "to": "22A91A6188"}';
COMMENT ON COLUMN exam_timetables.is_deleted IS 'Soft delete flag for undo/redo functionality';
