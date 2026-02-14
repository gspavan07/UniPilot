# Requirements Clarifications - Complete Specification

> **Date**: 2026-02-14  
> **Status**: Finalized based on user inputs

---

## 1. Revaluation System

### Overview

Students can apply for full re-evaluation of external exam answer scripts.

### Workflow

```
1. Results Published
2. Exam Cell opens Revaluation Window (configurable dates)
3. Students apply for revaluation (via Main System)
4. Students pay revaluation fee (set by Exam Cell per paper)
5. Application submitted to Exam System
6. New evaluator assigned (different from original)
7. Evaluator performs full re-evaluation
8. New marks compared with original
9. Best marks awarded to student
10. Updated results published
```

### Database Schema

```sql
CREATE TABLE revaluation_windows (
  id UUID PRIMARY KEY,
  exam_schedule_id UUID REFERENCES exam_schedules(id),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE revaluation_fee_config (
  id UUID PRIMARY KEY,
  regulation_id UUID REFERENCES regulations(id),
  academic_year VARCHAR(10),
  fee_per_paper DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE revaluation_applications (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES users(id),
  exam_session_id UUID REFERENCES exam_sessions(id),
  registration_id UUID REFERENCES exam_registrations(id),
  original_marks_id UUID REFERENCES exam_marks(id),
  application_date TIMESTAMP DEFAULT NOW(),
  fee_paid BOOLEAN DEFAULT FALSE,
  fee_transaction_id VARCHAR(100),
  status VARCHAR(20), -- 'pending', 'assigned', 'completed', 'rejected'
  assigned_evaluator_id UUID REFERENCES users(id),
  revaluation_marks_id UUID REFERENCES exam_marks(id),
  final_marks DECIMAL(5,2), -- Best of original and revaluation
  completed_at TIMESTAMP
);

CREATE INDEX idx_reval_student ON revaluation_applications(student_id);
CREATE INDEX idx_reval_status ON revaluation_applications(status);
```

### UI (Main System - Student)

**Revaluation Application Page**:

```jsx
<div>
  <h2>Apply for Revaluation - Semester 3 (Jan 2026)</h2>
  <p>Window: 15 Jan 2026 - 22 Jan 2026</p>
  
  <table>
    <thead>
      <tr>
        <th>Subject</th>
        <th>Current Marks</th>
        <th>Grade</th>
        <th>Fee</th>
        <th>Apply</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data Structures</td>
        <td>42/100</td>
        <td>D</td>
        <td>₹500</td>
        <td><input type="checkbox" /></td>
      </tr>
    </tbody>
  </table>
  
  <p>Total Fee: ₹{totalFee}</p>
  <button>Proceed to Payment</button>
</div>
```

### Rules

- ✅ Only for **external exams** (Semester End, Lab External)
- ✅ Fee configured by exam cell per paper
- ✅ Full re-evaluation (not totaling check)
- ✅ Different evaluator assigned
- ✅ **Best marks awarded** (original or revaluation)
- ❌ Internal exam marks cannot be revaluated

---

## 2. Supplementary Exam System

### Overview

Students who fail in regular exams can write supplementary exams.

### Key Concepts

**Same exam, different attempt type**:

- Junior batch: Regular exam (Jan 2027)
- Senior batch (failed): Supply exam (Jan 2027)
- Same question paper, same hall, different registration type

### Attempt History Tracking

**Student's exam history**:

```
Data Structures (R18 Regulation):
├─ Jan 2026 (Regular) - Failed (38/100)
├─ Mar 2026 (Supply) - Failed (42/100)
└─ Jan 2027 (Regular + Supply) - Pass (52/100) ✓
```

### Database Schema

```sql
CREATE TABLE exam_attempts (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  regulation_id UUID REFERENCES regulations(id),
  exam_session_id UUID REFERENCES exam_sessions(id),
  attempt_type VARCHAR(20), -- 'regular', 'supply'
  attempt_number INTEGER, -- 1st, 2nd, 3rd attempt
  exam_month VARCHAR(20), -- 'January', 'March', 'July'
  exam_year INTEGER,
  marks_obtained DECIMAL(5,2),
  grade VARCHAR(2),
  status VARCHAR(20), -- 'pass', 'fail'
  is_cleared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attempts_student_course ON exam_attempts(student_id, course_id);

CREATE TABLE supplementary_exam_config (
  id UUID PRIMARY KEY,
  regulation_id UUID REFERENCES regulations(id),
  course_id UUID REFERENCES courses(id),
  exam_session_id UUID REFERENCES exam_sessions(id),
  paper_format_differs BOOLEAN DEFAULT FALSE,
  custom_paper_format_id UUID REFERENCES exam_paper_formats(id),
  fee_differs BOOLEAN DEFAULT FALSE,
  supply_fee DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Supplementary Exam Workflow

```
1. Regular exam results published (some students fail)
2. Exam Cell schedules supplementary exam
3. Exam Cell configures:
   - Use same paper format OR different
   - Same fee OR different (can differ per paper)
4. Failed students auto-eligible + Juniors register
5. Students pay respective fees (supply or regular)
6. Combined exam conducted
7. Results published with attempt history
```

### UI (Student Results View)

```jsx
<div className="exam-history">
  <h3>Data Structures - Exam History</h3>
  <table>
    <thead>
      <tr>
        <th>Attempt</th>
        <th>Type</th>
        <th>Month/Year</th>
        <th>Marks</th>
        <th>Grade</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>Regular</td>
        <td>Jan/26</td>
        <td>38</td>
        <td>F</td>
        <td>❌ Failed</td>
      </tr>
      <tr>
        <td>2</td>
        <td>Supply</td>
        <td>Mar/26</td>
        <td>42</td>
        <td>F</td>
        <td>❌ Failed</td>
      </tr>
      <tr>
        <td>3</td>
        <td>Regular + Supply</td>
        <td>Jan/27</td>
        <td>52</td>
        <td>D</td>
        <td>✅ Cleared</td>
      </tr>
    </tbody>
  </table>
  <p><strong>Final Status: Cleared in 3rd attempt (Jan 2027)</strong></p>
</div>
```

### Rules

- ✅ Supplementary exam scheduled separately
- ✅ Paper format **may differ** (exam cell decides)
- ✅ Fee **may differ** (exam cell decides, even per paper)
- ✅ Results tracked with attempt history
- ✅ Show month/year and attempt type for each attempt
- ✅ CGPA calculation: Best marks from all attempts

---

## 3. Answer Script Scanning & Viewing

### Scanning Timeline

**After exam completion** (batch process)

### Internal Exams (Mid, Lab Internal)

- **Who initiates**: Faculty
- **Process**:
  1. Faculty evaluates physical scripts
  2. Faculty can optionally upload scanned scripts
  3. Faculty controls "Open for Student View" toggle
  4. Scripts available immediately after toggle enabled
- **Fee**: Free (no fee for students)
- **Storage**: Local file system

### External Exams (Semester End, Lab External)

- **Who initiates**: Exam Cell
- **Process**:
  1. Scanning staff uploads scripts after exam completion
  2. Scripts stored with anonymous codes
  3. Exam Cell sets viewing fee
  4. Students pay fee to unlock viewing
  5. Scripts visible after payment
- **Fee**: Set by exam cell
- **Storage**: Local file system (encrypted)

### Database Schema

```sql
ALTER TABLE answer_scripts
ADD COLUMN is_viewable_by_student BOOLEAN DEFAULT FALSE,
ADD COLUMN viewing_fee_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN viewing_fee_amount DECIMAL(10,2),
ADD COLUMN viewed_at TIMESTAMP;

CREATE TABLE script_viewing_fees (
  id UUID PRIMARY KEY,
  regulation_id UUID REFERENCES regulations(id),
  academic_year VARCHAR(10),
  semester INTEGER,
  fee_amount DECIMAL(10,2),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### UI (Student - Main System)

**Internal Exam Script View**:

```jsx
<div>
  <h3>Mid-1 Exam - Data Structures</h3>
  {faculty.allowStudentView ? (
    <div>
      <p>✅ Your answer script is available for viewing</p>
      <button>View Script</button>
    </div>
  ) : (
    <p>⏳ Faculty has not enabled script viewing yet</p>
  )}
</div>
```

**External Exam Script View**:

```jsx
<div>
  <h3>Semester End Exam - Database Management</h3>
  {!feePaid ? (
    <div>
      <p>Pay ₹{viewingFee} to view your answer script</p>
      <button>Pay Now</button>
    </div>
  ) : (
    <div>
      <button>View Script (Online)</button>
      <p>❌ Download not allowed</p>
    </div>
  )}
</div>
```

### Rules

- ✅ **Internal**: Free, faculty-controlled toggle, immediate viewing
- ✅ **External**: Fee-based, exam cell opens, online view only
- ❌ Students **cannot download** scripts (view only)
- ✅ Viewing tracked in database

---

## 4. Attendance-based Eligibility

### Overview

Students must meet minimum attendance criteria to appear in exams.

### Attendance Criteria

| Attendance % | Eligibility Status |
|--------------|-------------------|
| < 65% | ❌ Detained (HOD Permission + Condonation required) |
| 65% - 75% | ⚠️ Requires Condonation |
| ≥ 75% | ✅ Eligible |

### Automatic Check

Runs **before exam fee payment** in main system.

### Database Schema

```sql
CREATE TABLE attendance_criteria (
  id UUID PRIMARY KEY,
  regulation_id UUID REFERENCES regulations(id),
  min_attendance_auto_eligible DECIMAL(5,2) DEFAULT 75.00,
  min_attendance_with_condonation DECIMAL(5,2) DEFAULT 65.00,
  requires_hod_permission_below DECIMAL(5,2) DEFAULT 65.00,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE exam_condonations (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES users(id),
  exam_schedule_id UUID REFERENCES exam_schedules(id),
  attendance_percentage DECIMAL(5,2),
  condonation_type VARCHAR(50), -- 'auto_condonation', 'hod_permission'
  granted_by UUID REFERENCES users(id),
  granted_at TIMESTAMP,
  remarks TEXT
);

ALTER TABLE exam_registrations
ADD COLUMN attendance_percentage DECIMAL(5,2),
ADD COLUMN eligibility_override BOOLEAN DEFAULT FALSE,
ADD COLUMN override_by UUID REFERENCES users(id),
ADD COLUMN override_reason TEXT;
```

### Workflow

```
1. Student navigates to exam fee payment
2. System fetches student's attendance % from attendance module
3. System checks criteria:
   - >= 75%: Proceed to payment
   - 65-75%: Check if condonation granted → Proceed
   - < 65%: Check if HOD permission + condonation granted → Proceed
   - Else: Block, show "Not Eligible" message
4. Payment allowed only if eligible
5. Registration created with eligibility status
```

### UI (Main System - Student)

```jsx
<div className="exam-eligibility">
  <h3>Semester 3 Exam Eligibility</h3>
  
  {attendance >= 75 ? (
    <div className="eligible">
      <p>✅ Your attendance: {attendance}%</p>
      <p>You are eligible to appear in exams.</p>
      <button>Proceed to Fee Payment</button>
    </div>
  ) : attendance >= 65 ? (
    condonationGranted ? (
      <div className="eligible-with-condonation">
        <p>⚠️ Your attendance: {attendance}%</p>
        <p>✅ Condonation granted. You can appear for exams.</p>
        <button>Proceed to Fee Payment</button>
      </div>
    ) : (
      <div className="not-eligible">
        <p>❌ Your attendance: {attendance}%</p>
        <p>Condonation required. Contact your department.</p>
      </div>
    )
  ) : (
    hodPermissionGranted ? (
      <div className="eligible-with-hod">
        <p>⚠️ Your attendance: {attendance}%</p>
        <p>✅ HOD Permission + Condonation granted.</p>
        <button>Proceed to Fee Payment</button>
      </div>
    ) : (
      <div className="not-eligible">
        <p>❌ Your attendance: {attendance}%</p>
        <p>HOD Permission + Condonation required.</p>
      </div>
    )
  )}
</div>
```

### Rules

- ✅ Automatic check before fee payment
- ✅ Configured by exam cell (criteria configurable)
- ✅ Can be overridden by authorities
- ✅ Condonation/permission tracked in database

---

## 5. Question Paper Management

### Overview

Secure storage and distribution of question papers with marking schemes.

### Features

1. **Storage**: Encrypted local files
2. **Access Control**: Role-based (Exam Controller, Deputy, Faculty)
3. **Audit Logs**: Track who accessed when
4. **Distribution**: Faculty gets question paper + marking scheme during evaluation

### Database Schema

```sql
CREATE TABLE question_papers (
  id UUID PRIMARY KEY,
  exam_session_id UUID REFERENCES exam_sessions(id),
  course_id UUID REFERENCES courses(id),
  regulation_id UUID REFERENCES regulations(id),
  file_path TEXT, -- Encrypted file path
  file_hash VARCHAR(64), -- SHA-256 hash for integrity
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW(),
  is_encrypted BOOLEAN DEFAULT TRUE
);

CREATE TABLE marking_schemes (
  id UUID PRIMARY KEY,
  question_paper_id UUID REFERENCES question_papers(id),
  file_path TEXT,
  scheme_data JSONB, -- Question-wise marking breakdown
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE question_paper_access_logs (
  id UUID PRIMARY KEY,
  question_paper_id UUID REFERENCES question_papers(id),
  accessed_by UUID REFERENCES users(id),
  accessed_at TIMESTAMP DEFAULT NOW(),
  access_type VARCHAR(20), -- 'view', 'download', 'print'
  ip_address VARCHAR(50)
);

CREATE INDEX idx_qp_access ON question_paper_access_logs(question_paper_id, accessed_by);
```

### Security

**Encryption**:

- AES-256 encryption for stored files
- Decrypted only when accessed by authorized users
- Encryption keys stored in environment variables (not database)

**Access Control**:

```javascript
const canAccessQuestionPaper = (userId, questionPaperId) => {
  const user = await User.findByPk(userId);
  const qp = await QuestionPaper.findByPk(questionPaperId);
  
  // Exam Controller/Deputy: Full access
  if (user.role === 'exam_controller' || user.role === 'deputy_controller') {
    return true;
  }
  
  // Faculty: Only if assigned as evaluator for that session
  if (user.role === 'faculty') {
    const isAssigned = await EvaluatorBundleAssignment.findOne({
      where: {
        exam_session_id: qp.exam_session_id,
        evaluator_id: userId
      }
    });
    return !!isAssigned;
  }
  
  return false;
};
```

### UI (Evaluator Portal)

```jsx
<div className="evaluator-resources">
  <h3>Evaluation Resources - Data Structures</h3>
  
  <div className="resource-card">
    <h4>📄 Question Paper</h4>
    <button onClick={viewQuestionPaper}>View</button>
    <button onClick={downloadPDF}>Download PDF</button>
  </div>
  
  <div className="resource-card">
    <h4>📋 Marking Scheme</h4>
    <table>
      <thead>
        <tr>
          <th>Question</th>
          <th>Max Marks</th>
          <th>Breakdown</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Q1(a)</td>
          <td>5</td>
          <td>Definition (2) + Example (3)</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Rules

- ✅ Encrypted storage (AES-256)
- ✅ Access logs maintained
- ✅ Faculty gets question paper + marking scheme
- ✅ Role-based access control
- ✅ File integrity checks (SHA-256 hash)

---

## 6. Hall Ticket Configuration

### Template Structure

**Separate template file** (editable by admin):

```
/storage/templates/hall_ticket_template.html
```

**Components to Include**:

- ✅ Student Photo
- ✅ Exam Schedule (all subjects, dates, timings)
- ✅ College Logo
- ✅ Barcode/QR Code (for external exams)
- ✅ Rules and Regulations text
- ✅ Principal's signature (optional image)

### Template Scope

- **Institution-wide** (not per regulation)
- Single template for all exams
- Customizable HTML/CSS

### Sample Template Structure

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    /* Editable CSS */
    .hall-ticket { ... }
    .student-photo { ... }
    .schedule-table { ... }
  </style>
</head>
<body>
  <div class="hall-ticket">
    <img src="{{college_logo}}" class="logo" />
    <h1>{{college_name}}</h1>
    <h2>Hall Ticket - {{exam_type}} Exams</h2>
    
    <div class="student-info">
      <img src="{{student_photo}}" class="student-photo" />
      <p>Name: {{student_name}}</p>
      <p>Roll No: {{roll_number}}</p>
      <p>Regulation: {{regulation}}</p>
    </div>
    
    <table class="schedule-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Subject</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {{#each subjects}}
        <tr>
          <td>{{date}}</td>
          <td>{{subject_name}}</td>
          <td>{{start_time}} - {{end_time}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
    
    <div class="barcode">
      <img src="{{barcode_image}}" />
      <p>{{barcode_text}}</p>
    </div>
    
    <div class="rules">
      <h3>Instructions:</h3>
      <ol>
        <li>{{rule_1}}</li>
        <li>{{rule_2}}</li>
        <!-- Editable rules -->
      </ol>
    </div>
    
    <div class="signature">
      <img src="{{principal_signature}}" />
      <p>Principal</p>
    </div>
  </div>
</body>
</html>
```

### Database Schema

```sql
CREATE TABLE hall_ticket_templates (
  id UUID PRIMARY KEY,
  template_name VARCHAR(100),
  html_content TEXT,
  css_content TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  variables JSONB, -- List of available template variables
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### EditorUI (Exam Cell)

```jsx
<div className="template-editor">
  <h2>Edit Hall Ticket Template</h2>
  
  <div className="editor-pane">
    <h3>HTML Editor</h3>
    <textarea rows="20" value={htmlContent} />
  </div>
  
  <div className="editor-pane">
    <h3>CSS Editor</h3>
    <textarea rows="20" value={cssContent} />
  </div>
  
  <div className="preview-pane">
    <h3>Preview</h3>
    <iframe srcDoc={generatePreview()} />
  </div>
  
  <div className="variables-help">
    <h4>Available Variables:</h4>
    <ul>
      <li>{{college_name}}</li>
      <li>{{student_name}}</li>
      <li>{{student_photo}}</li>
      <!-- ... -->
    </ul>
  </div>
  
  <button onClick={saveTemplate}>Save Template</button>
  <button onClick={testGenerate}>Test with Sample Data</button>
</div>
```

### Rules

- ✅ Template stored as separate HTML/CSS file
- ✅ Institution-wide (not per regulation)
- ✅ Editable via admin UI
- ✅ Preview before saving
- ✅ Version controlled (track changes)

---

## 7. CO Mapping Requirements

### Scope

- **Mandatory for all descriptive question papers**
- Optional for objective/MCQ sections
- Can be enabled/disabled at paper format configuration level

### UI (Paper Format Configuration)

```jsx
<div className="co-mapping-section">
  <h3>Descriptive Section</h3>
  
  <label>
    <input 
      type="checkbox" 
      checked={coMappingEnabled}
      onChange={toggleCOMapping}
    />
    Enable CO Mapping (Mandatory for descriptive exams)
  </label>
  
  {coMappingEnabled && (
    <div className="questions">
      <div className="question-config">
        <h4>Question 1 (10 marks)</h4>
        <label>CO Mapping:</label>
        <MultiSelect 
          options={['CO1', 'CO2', 'CO3', 'CO4', 'CO5']}
          value={q1CO}
          onChange={setQ1CO}
        />
        {q1CO.length === 0 && (
          <span className="error">⚠️ CO mapping required</span>
        )}
      </div>
    </div>
  )}
</div>
```

### Validation

```javascript
const validatePaperFormat = (config) => {
  if (config.entry_type === 'question_wise') {
    for (const question of config.questions) {
      if (!question.co_mapped || question.co_mapped.length === 0) {
        throw new Error(`CO mapping required for Question ${question.question_no}`);
      }
    }
  }
};
```

### Rules

- ✅ Mandatory for descriptive exams
- ✅ Can be disabled for objective sections
- ✅ Validation enforced before saving paper format
- ✅ Multiple COs can be mapped to single question

---

## 8. Results Approval Workflow

### Approval Chain

**Before publishing results**:

1. Exam Controller compiles results
2. Exam Controller reviews and approves
3. OR Dean/Principal reviews and approves
4. Results published to students

### Database Schema

```sql
CREATE TABLE result_approvals (
  id UUID PRIMARY KEY,
  schedule_id UUID REFERENCES exam_schedules(id),
  compiled_by UUID REFERENCES users(id),
  compiled_at TIMESTAMP,
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  approval_status VARCHAR(20), -- 'pending', 'approved', 'rejected'
  approval_comments TEXT,
  published_at TIMESTAMP
);
```

### UI (Exam Controller)

```jsx
<div className="results-approval">
  <h2>Results - Semester 3 (Jan 2026)</h2>
  
  <div className="stats">
    <p>Total Students: 450</p>
    <p>Pass: 382 (84.9%)</p>
    <p>Fail: 68 (15.1%)</p>
  </div>
  
  <div className="actions">
    <button onClick={reviewResults}>Review Results</button>
    <button onClick={sendForApproval}>Send for Dean Approval</button>
    
    {user.role === 'dean' && status === 'pending_approval' && (
      <>
        <button onClick={approveResults} className="approve">
          Approve & Publish
        </button>
        <button onClick={rejectResults} className="reject">
          Reject
        </button>
      </>
    )}
  </div>
</div>
```

### Rules

- ✅ Exam Controller OR Dean can approve
- ✅ Results can be unpublished if errors found (before notification sent)
- ✅ Approval tracked with timestamp and comments

---

## 9. Moderation Requirements

### Scope

- Required for all external exams
- Sample-based or full moderation (configurable)

### Workflow

```
1. Evaluator completes marking
2. Marks submitted
3. System assigns moderator (Deputy Controller or Senior Faculty)
4. Moderator reviews:
   - Sample scripts (10-20% random) OR
   - All scripts (if configured)
5. Moderator can:
   - Accept marks as-is
   - Suggest changes (evaluator edits)
   - Directly edit marks (with justification)
6. Changes logged in audit trail
7. Final marks compiled
```

### Database Schema

```sql
CREATE TABLE moderation_assignments (
  id UUID PRIMARY KEY,
  exam_session_id UUID REFERENCES exam_sessions(id),
  moderator_id UUID REFERENCES users(id),
  moderation_type VARCHAR(20), -- 'sample', 'full'
  sample_percentage INTEGER, -- If sample, what %
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP
);

CREATE TABLE moderation_changes (
  id UUID PRIMARY KEY,
  marks_id UUID REFERENCES exam_marks(id),
  moderator_id UUID REFERENCES users(id),
  original_marks DECIMAL(5,2),
  moderated_marks DECIMAL(5,2),
  change_reason TEXT,
  changed_at TIMESTAMP
);
```

### Rules

- ✅ Mandatory for external exams
- ✅ Sample or full moderation (configurable)
- ✅Moderator can edit marks directly
- ✅ Changes tracked with reasons

---

**End of Requirements Clarifications**

> All requirements finalized and ready for implementation planning.
