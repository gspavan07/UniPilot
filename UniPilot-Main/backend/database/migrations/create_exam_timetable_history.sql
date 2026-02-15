-- Exam Timetable History Table
-- Tracks all changes to timetable entries for undo/redo functionality

CREATE TABLE IF NOT EXISTS exam_timetable_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timetable_id UUID REFERENCES exam_timetables(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL,
  old_data JSONB,
  new_data JSONB,
  performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  performed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_timetable_history_id ON exam_timetable_history(timetable_id, performed_at DESC);
CREATE INDEX idx_timetable_history_action ON exam_timetable_history(action);

-- Comments for documentation
COMMENT ON TABLE exam_timetable_history IS 'Complete audit trail of timetable changes for undo/redo functionality';
COMMENT ON COLUMN exam_timetable_history.action IS 'Values: create, update, delete, undo, redo';
COMMENT ON COLUMN exam_timetable_history.old_data IS 'JSON snapshot of data before change';
COMMENT ON COLUMN exam_timetable_history.new_data IS 'JSON snapshot of data after change';
