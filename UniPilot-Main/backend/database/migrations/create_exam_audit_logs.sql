-- Exam Audit Logs Table
-- Comprehensive logging for all Exam Management System actions

CREATE TABLE IF NOT EXISTS exam_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- User Information
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    
    -- Action Details
    action VARCHAR(100) NOT NULL, -- CREATE, UPDATE, DELETE, GENERATE, PUBLISH, etc.
    module VARCHAR(100) NOT NULL, -- HALL_TICKET, EXAM_SCHEDULE, SEATING, GRADES, etc.
    entity_type VARCHAR(100), -- hall_ticket, exam_schedule, seating_plan, grade
    entity_id VARCHAR(255), -- ID of the affected entity
    
    -- Action Context
    description TEXT NOT NULL, -- Human-readable description
    changes JSONB, -- Before/after values for updates
    metadata JSONB, -- Additional context
    
    -- Request Information
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_method VARCHAR(10),
    request_url TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'pending')),
    error_message TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for efficient querying
CREATE INDEX idx_exam_audit_user_id ON exam_audit_logs(user_id);
CREATE INDEX idx_exam_audit_module ON exam_audit_logs(module);
CREATE INDEX idx_exam_audit_action ON exam_audit_logs(action);
CREATE INDEX idx_exam_audit_entity ON exam_audit_logs(entity_type, entity_id);
CREATE INDEX idx_exam_audit_created_at ON exam_audit_logs(created_at);
CREATE INDEX idx_exam_audit_user_email ON exam_audit_logs(user_email);

-- Comments
COMMENT ON TABLE exam_audit_logs IS 'Comprehensive audit trail for all Exam Management System actions';
COMMENT ON COLUMN exam_audit_logs.user_id IS 'User who performed the action';
COMMENT ON COLUMN exam_audit_logs.action IS 'Type of action performed';
COMMENT ON COLUMN exam_audit_logs.module IS 'Exam module affected';
COMMENT ON COLUMN exam_audit_logs.changes IS 'Before/after values for tracking changes';
COMMENT ON COLUMN exam_audit_logs.metadata IS 'Additional context like filters, counts, etc.';
