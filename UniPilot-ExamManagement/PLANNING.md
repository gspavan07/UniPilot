# Exam Management System - Master Planning Document

> **Version**: 2.0 - FINAL  
> **Last Updated**: 2026-02-14 (All clarifications finalized - Ready for implementation)  
> **Status**: ✅ Planning Complete - Ready to Build

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Core Principles](#core-principles)
3. [Critical Requirements](#critical-requirements)
4. [Architecture](#architecture)
5. [Database Design](#database-design)
6. [Key Features](#key-features)
7. [Phase-wise Development Plan](#phase-wise-development-plan)
8. [Integration Strategy](#integration-strategy)
9. [Timeline & Milestones](#timeline--milestones)

---

## System Overview

### Purpose

Standalone exam management platform for complete exam lifecycle from scheduling to results publication.

### Domain

`exam.unipilot.in` (Subdomain of main UniPilot system)

### Users

- Exam Controller
- Deputy Controller
- Admin Staff
- Faculty/Evaluators
- Scanning Staff

**Note**: Students access exam features ONLY through main system (unipilot.in)

---

## Core Principles

### 1. Dynamic Configuration

**All exam structures read from regulation's `exam_configuration`**

- No hardcoded exam types or components
- Theory, Lab, or any course type can have hierarchical sub-components
- System adapts to any structure defined in regulation

### 2. Flexible Marks Entry

- Each exam can be configured: **Total marks only** OR **Question-wise entry**
- Configuration happens per exam during paper format setup
- UI dynamically generates based on configuration

### 3. Anonymous Marking

- **Internal exams** (student identity visible to evaluators)
- **External exams** (anonymous codes only, identity hidden)
- System setting per exam type

### 4. Centralized Management

- Only **Exam Cell** creates all exam schedules
- Departments/faculties assigned as evaluators
- No department-level scheduling access

---

## Critical Requirements

> **Added 2026-02-14** - Essential features that shape the entire system

### 1. File Storage: Local Only

**Storage**: Local file system (not S3/MinIO)

- Answer scripts stored in: `/storage/answer_scripts/{year}/{semester}/{exam_id}/`
- Hall tickets: `/storage/hall_tickets/{year}/{semester}/`
- Marks cards: `/storage/marks_cards/{year}/{semester}/`

**Backup Strategy**: Regular filesystem backups

### 2. Paper Format Flexibility

**Paper formats can differ by**:

- Academic Year / Cycle
- Regulation
- Course
- Exam session

**Example**: Same course in different regulations can have different paper formats.

**Implementation**: `exam_paper_formats` table has unique index on:

```sql
INDEX idx_unique_paper_format ON exam_paper_formats(
  academic_year, regulation_id, course_id, exam_session_id
);
```

### 3. Question Sub-parts & Choices

**Complex Question Structures**:

- Questions can have sub-parts: **1a, 1b, 1c**
- Choice between questions: **"Best of Q1 or Q2"**
- System must track and apply logic

**Example**:

```
Descriptive Section:
  Q1 (Total: 10 marks)
    └─ 1a: 5 marks
    └─ 1b: 5 marks
  Q2 (Total: 10 marks)
    └─ 2a: 5 marks
    └─ 2b: 5 marks
  
  Rule: Best of (Q1, Q2) → Take highest scoring question
```

**Paper Format Configuration**:

```json
{
  "Descriptive": {
    "entry_type": "question_wise",
    "questions": [
      {
        "question_no": 1,
        "max_marks": 10,
        "sub_parts": [
          { "part": "a", "max_marks": 5 },
          { "part": "b", "max_marks": 5 }
        ]
      },
      {
        "question_no": 2,
        "max_marks": 10,
        "sub_parts": [
          { "part": "a", "max_marks": 5 },
          { "part": "b", "max_marks": 5 }
        ]
      }
    ],
    "choice_logic": "best_of",
    "choice_from": [1, 2]
  }
}
```

### 4. Combined Exam Fees

**Semester End + Lab External**: **Single fee** required

**Fee Structure**:

```sql
CREATE TABLE exam_fee_configurations (
  id UUID PRIMARY KEY,
  academic_year VARCHAR(10),
  semester INTEGER,
  fee_type VARCHAR(50), -- 'semester_external', 'supplementary', etc.
  amount DECIMAL(10,2),
  includes_exams JSONB -- ["Semester End", "Lab External"]
);
```

**Student Payment**:

- One payment unlocks both Semester End and Lab External hall tickets
- Main system checks: Has student paid for this semester's external exams?

### 5. Course Outcome (CO) Mapping

**Every question must map to COs**

**Why**: Track CO attainment for accreditation (NAAC, NBA)

**For Theory/Descriptive Exams**:

```json
{
  "question_no": 1,
  "sub_parts": [
    { "part": "a", "max_marks": 5, "co_mapped": ["CO1", "CO2"] },
    { "part": "b", "max_marks": 5, "co_mapped": ["CO3"] }
  ]
}
```

**For Lab Exams**:

- Each experiment/viva question maps to COs
- Example:

  ```json
  {
    "Lab Internal": {
      "Execution": { "co_mapped": ["CO4", "CO5"] },
      "Viva": {
        "questions": [
          { "q_no": 1, "co_mapped": ["CO1"] },
          { "q_no": 2, "co_mapped": ["CO2"] }
        ]
      }
    }
  }
  ```

**Database Schema Addition**:

```sql
ALTER TABLE exam_paper_formats 
ADD COLUMN co_mappings JSONB;
-- Structure: Maps question paths to CO arrays
```

**CO Attainment Calculation**:

- After results published, system calculates CO attainment %
- Feeds into accreditation reports

### 6. Faculty Access Control (Section-based)

**Internal Exams (Mid, Lab Internal)**:

- Faculty can ONLY evaluate sections they teach
- Read from timetable: `timetable_entries` table
- Filter: `WHERE faculty_id = :facultyId AND course_id = :courseId`

**Lab External**:

- Same restriction (faculty's assigned sections)

**Semester End External**:

- Exam cell manually assigns bundles
- No automatic restriction (can assign any faculty to any bundle)

**Implementation**:

```javascript
// Internal exam - auto-filter students
async function getStudentsForEvaluation(facultyId, examSessionId) {
  const session = await ExamSession.findByPk(examSessionId);
  
  if (session.is_internal) {
    // Get sections faculty teaches
    const sections = await TimetableEntry.findAll({
      where: { faculty_id: facultyId, course_id: session.course_id }
    });
    
    const sectionIds = sections.map(s => s.section_id);
    
    // Only students from those sections
    return await ExamRegistration.findAll({
      where: { 
        exam_session_id: examSessionId,
        section_id: { [Op.in]: sectionIds }
      }
    });
  } else {
    // External - return assigned bundles
    return await getAssignedBundles(facultyId, examSessionId);
  }
}
```

### 7. Internal Evaluation Workflow

**UI Controls**:

1. **Save Button**: Per student (save marks, can edit later)
2. **Student View Toggle**: Allow students to see their answer scripts
3. **Freeze Button**: Freeze marks for all students (no more edits

**Database Schema**:

```sql
CREATE TABLE exam_marks (
  -- existing fields...
  is_saved BOOLEAN DEFAULT FALSE,
  is_frozen BOOLEAN DEFAULT FALSE,
  allow_student_view BOOLEAN DEFAULT FALSE,
  saved_at TIMESTAMP,
  frozen_at TIMESTAMP
);
```

**Workflow**:

```
1. Faculty enters marks → clicks "Save" → is_saved = true
2. Faculty can edit until "Freeze" clicked
3. Faculty toggles "Student View" → students can view scripts
4. Faculty clicks "Freeze All" → is_frozen = true for all students
5. After freeze, faculty cannot edit (unless admin unlocks)
```

**UI Example**:

```jsx
<div className="marks-entry-controls">
  <button onClick={saveMarks} disabled={isFrozen}>
    Save Marks
  </button>
  <button onClick={freezeAll} className="freeze-btn">
    Freeze All Marks
  </button>
  <label>
    <input 
      type="checkbox" 
      checked={allowStudentView}
      onChange={toggleStudentView}
    />
    Allow Students to View Scripts
  </label>
</div>
```

### 8. External Evaluation: No Student View

**Semester End & Lab External**:

- NO student view toggle
- Scripts visible to students only AFTER results published
- Maintains evaluation integrity

### 9. Marks Entry Window

**Exam Cell Sets Deadlines**:

```sql
CREATE TABLE marks_entry_windows (
  id UUID PRIMARY KEY,
  exam_session_id UUID REFERENCES exam_sessions(id),
  start_datetime TIMESTAMP,
  end_datetime TIMESTAMP,
  created_by UUID REFERENCES users(id)
);
```

**Enforcement**:

- Faculty cannot enter marks before `start_datetime`
- Faculty cannot save marks after `end_datetime` (unless extended)
- UI shows countdown timer

**Extension Workflow**:

- Exam controller can extend deadline
- Notification sent to faculty

---

## Final Clarifications

> **Added**: 2026-02-14  
> **Status**: ✅ All questions answered - Ready for implementation

### 1. HOD Faculty-Section Assignment

**Requirement**: HOD needs to assign which faculty teaches which course to which section.

**Database Table**:

```sql
CREATE TABLE faculty_course_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faculty_id UUID REFERENCES users(id),
  course_id UUID REFERENCES courses(id),
  regulation_id UUID REFERENCES regulations(id),
  academic_year VARCHAR(10),
  semester INTEGER,
  section_id UUID REFERENCES sections(id),
  assigned_by UUID REFERENCES users(id), -- HOD who assigned
  assigned_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(faculty_id, course_id, semester, section_id, academic_year)
);

CREATE INDEX idx_faculty_assignments ON faculty_course_assignments(faculty_id, academic_year, semester);
CREATE INDEX idx_course_assignments ON faculty_course_assignments(course_id, section_id, academic_year);
```

**UI - HOD Assignment Interface**:

```jsx
<div className="faculty-assignment-page">
  <h2>Faculty Course Assignments - Semester 3 (2025-26)</h2>
  
  <div className="filters">
    <select value={selectedDept}>
      <option>Computer Science</option>
      <option>Electronics</option>
    </select>
    <select value={selectedSemester}>
      <option>Semester 3</option>
      <option>Semester 4</option>
    </select>
  </div>
  
  <table className="assignment-table">
    <thead>
      <tr>
        <th>Course Code</th>
        <th>Course Name</th>
        <th>Section</th>
        <th>Assigned Faculty</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>CS301</td>
        <td>Data Structures</td>
        <td>A</td>
        <td>
          <select>
            <option value="">-- Select Faculty --</option>
            <option value="faculty1">Dr. Ramesh Kumar</option>
            <option value="faculty2">Dr. Suresh Babu</option>
            <option value="faculty3">Prof. Lakshmi Devi</option>
          </select>
        </td>
        <td>
          <button onClick={saveAssignment}>Save</button>
        </td>
      </tr>
      <tr>
        <td>CS301</td>
        <td>Data Structures</td>
        <td>B</td>
        <td>
          <select>
            <option value="">-- Select Faculty --</option>
            <option>Dr. Ramesh Kumar</option>
            <option selected>Dr. Suresh Babu</option>
          </select>
        </td>
        <td>
          <button>Save</button>
        </td>
      </tr>
    </tbody>
  </table>
  
  <div className="bulk-actions">
    <button onClick={importFromExcel}>Import from Excel</button>
    <button onClick={exportAssignments}>Export Assignments</button>
    <button onClick={copyFromPrevious}>Copy from Previous Semester</button>
  </div>
</div>
```

**Usage in Marks Entry**:
When faculty logs in to enter marks for internal exam:

```javascript
async function getEligibleStudents(facultyId, examSessionId) {
  // Get sections assigned to this faculty for this course
  const assignments = await FacultyCourseAssignment.findAll({
    where: {
      faculty_id: facultyId,
      course_id: session.course_id,
      semester: session.semester,
      academic_year: session.academic_year
    }
  });
  
  const sectionIds = assignments.map(a => a.section_id);
  
  // Get only students from assigned sections
  const registrations = await ExamRegistration.findAll({
    where: {
      exam_session_id: examSessionId,
      section_id: { [Op.in]: sectionIds }
    },
    include: [{ model: User, as: 'student' }]
  });
  
  return registrations;
}
```

---

### 2. External Exam Bundle Assignment

**Clarification**: Exam cell manually assigns bundles to evaluators.

**Workflow**:

```
1. Exam cell creates bundles (groups of answer scripts)
2. Exam cell assigns each bundle to specific evaluator
3. Evaluator sees only their assigned bundles
4. No auto-distribution (manual control)
```

**UI - Exam Cell Bundle Assignment**:

```jsx
<div className="bundle-assignment">
  <h2>Assign Evaluation Bundles - Semester End Exam (Data Structures)</h2>
  
  <div className="bundle-creation">
    <h3>Create Bundles</h3>
    <p>Total Scripts: 450</p>
    <label>Scripts per bundle:</label>
    <input type="number" value={50} />
    <button onClick={createBundles}>Auto-Create Bundles</button>
    <p>Will create 9 bundles of 50 scripts each</p>
  </div>
  
  <div className="bundle-list">
    <h3>Assign Bundles to Evaluators</h3>
    <table>
      <thead>
        <tr>
          <th>Bundle ID</th>
          <th>Script Codes</th>
          <th>Count</th>
          <th>Assigned To</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Bundle 1</td>
          <td>EX24-SEM3-00001 to 00050</td>
          <td>50</td>
          <td>
            <select>
              <option>-- Select Evaluator --</option>
              <option>Dr. External Evaluator 1</option>
              <option>Dr. External Evaluator 2</option>
            </select>
          </td>
          <td>
            <button>Assign</button>
          </td>
        </tr>
        <tr>
          <td>Bundle 2</td>
          <td>EX24-SEM3-00051 to 00100</td>
          <td>50</td>
          <td>Dr. External Evaluator 1</td>
          <td>✅ Assigned</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

---

### 3. Lab Exam Components Structure

**Clarification**: Lab exams can have sub-components too, read from `regulation.exam_configuration`.

**Example Lab Exam Structure** (from regulation config):

```json
{
  "course_types": [
    {
      "id": "lab-course-id",
      "name": "Lab",
      "structure": {
        "name": "Lab External",
        "relation": "Write Up + Execution + Viva",
        "max_marks": 100,
        "components": [
          {
            "name": "Write Up",
            "relation": "",
            "max_marks": 20,
            "components": []
          },
          {
            "name": "Execution",
            "relation": "",
            "max_marks": 50,
            "components": []
          },
          {
            "name": "Viva",
            "relation": "",
            "max_marks": 30,
            "components": []
          }
        ]
      }
    }
  ]
}
```

**Paper Format Configuration** (supports lab components):

```json
{
  "component_config": {
    "Write Up": {
      "entry_type": "total_only",
      "max_marks": 20
    },
    "Execution": {
      "entry_type": "question_wise",
      "questions": [
        {
          "question_no": "Program 1",
          "max_marks": 25,
          "co_mapped": ["CO1", "CO2"]
        },
        {
          "question_no": "Program 2",
          "max_marks": 25,
          "co_mapped": ["CO3", "CO4"]
        }
      ]
    },
    "Viva": {
      "entry_type": "total_only",
      "max_marks": 30
    }
  }
}
```

**Key Point**: System reads structure dynamically, no hardcoding for lab vs theory.

---

### 4. Absent Student Handling

**Workflow**:

1. **Mark as Absent**: Checkbox in marks entry UI
2. **Grade**: Read from grade configuration (typically "Ab" grade)
3. **Supplementary Eligibility**: Auto-eligible (no revaluation needed - no script exists)

**UI - Marks Entry with Absent Checkbox**:

```jsx
<div className="marks-entry-row">
  <div className="student-info">
    <img src={student.photo} />
    <p>{student.name}</p>
    <p>{student.roll_number}</p>
  </div>
  
  <div className="marks-section">
    <label>
      <input 
        type="checkbox" 
        checked={isAbsent}
        onChange={handleAbsentToggle}
      />
      Mark as Absent
    </label>
    
    {isAbsent ? (
      <div className="absent-notice">
        <p>⚠️ Student will be marked as Absent</p>
        <p>Grade: <strong>Ab</strong> (from grade configuration)</p>
        <p>Auto-eligible for supplementary exam</p>
      </div>
    ) : (
      <div className="marks-inputs">
        <label>Assignment (5 marks):</label>
        <input type="number" max="5" step="0.5" />
        
        <label>Objective (10 marks):</label>
        <input type="number" max="10" step="0.5" />
        
        {/* Descriptive section with question-wise entry */}
      </div>
    )}
  </div>
  
  <button onClick={saveMarks}>Save</button>
</div>
```

**Backend Logic**:

```javascript
async function saveMarks(data) {
  if (data.is_absent) {
    // Get 'Ab' grade from grade configuration
    const gradeConfig = await GradeScale.findOne({
      where: { regulation_id: session.regulation_id }
    });
    
    const absentGrade = gradeConfig.grades.find(g => g.code === 'Ab');
    
    await ExamMarks.create({
      registration_id: data.registration_id,
      exam_session_id: data.exam_session_id,
      is_absent: true,
      marks_obtained: 0,
      grade: 'Ab',
      grade_points: 0,
      marks_data: null, // No marks data for absent
      status: 'absent'
    });
    
    // Auto-create supplementary eligibility record
    await SupplementaryEligibility.create({
      student_id: data.student_id,
      course_id: session.course_id,
      reason: 'absent'
    });
  } else {
    // Normal marks entry
    // ...
  }
}
```

**Grade Configuration Example**:

```json
{
  "grades": [
    { "code": "O", "min": 90, "max": 100, "points": 10 },
    { "code": "A+", "min": 80, "max": 89, "points": 9 },
    // ...
    { "code": "F", "min": 0, "max": 39, "points": 0 },
    { "code": "Ab", "min": null, "max": null, "points": 0, "description": "Absent" }
  ]
}
```

---

### 5. Multi-Section Choice Logic in Single Paper

**Clarification**: Yes, supported! A single paper can have different choice logic in different sections.

**Example Paper Pattern**:

```json
{
  "paper_structure": {
    "Section A": {
      "entry_type": "question_wise",
      "questions": [
        { "question_no": 1, "max_marks": 10, "co_mapped": ["CO1"] }
      ],
      "choice_logic": "compulsory",
      "component_max_marks": 10
    },
    "Section B": {
      "entry_type": "question_wise",
      "questions": [
        { "question_no": 1, "max_marks": 15, "co_mapped": ["CO2"] },
        { "question_no": 2, "max_marks": 15, "co_mapped": ["CO2"] },
        { "question_no": 3, "max_marks": 15, "co_mapped": ["CO3"] }
      ],
      "choice_logic": "best_n_of_m",
      "take_best": 2,
      "from_total": 3,
      "component_max_marks": 30
    },
    "Section C": {
      "entry_type": "question_wise",
      "questions": [
        { "question_no": 1, "max_marks": 10, "co_mapped": ["CO3"] },
        { "question_no": 2, "max_marks": 10, "co_mapped": ["CO4"] },
        // ... up to 10
        { "question_no": 10, "max_marks": 10, "co_mapped": ["CO5"] }
      ],
      "choice_logic": "best_n_of_m",
      "take_best": 5,
      "from_total": 10,
      "component_max_marks": 50
    },
    "Section D": {
      "entry_type": "grouped_choice",
      "groups": [
        {
          "name": "Group A",
          "questions": [
            { "question_no": 1, "max_marks": 10, "co_mapped": ["CO1"] },
            { "question_no": 2, "max_marks": 10, "co_mapped": ["CO2"] }
          ],
          "take_best": 1
        },
        {
          "name": "Group B",
          "questions": [
            { "question_no": 3, "max_marks": 10, "co_mapped": ["CO3"] },
            { "question_no": 4, "max_marks": 10, "co_mapped": ["CO4"] }
          ],
          "take_best": 1
        }
      ],
      "component_max_marks": 20
    }
  }
}
```

**Result Calculation**:

```javascript
async function calculateFinalMarks(marksData, paperFormat) {
  let totalMarks = 0;
  const sectionResults = {};
  
  for (const [section, config] of Object.entries(paperFormat)) {
    const sectionMarks = marksData[section];
    
    switch (config.choice_logic) {
      case 'compulsory':
        sectionResults[section] = sumAllMarks(sectionMarks);
        break;
        
      case 'best_n_of_m':
        sectionResults[section] = applyBestNOfM(sectionMarks, config);
        break;
        
      case 'grouped_choice':
        sectionResults[section] = applyGroupedChoice(sectionMarks, config);
        break;
    }
    
    totalMarks += sectionResults[section].final_marks;
  }
  
  return { totalMarks, sectionResults };
}
```

---

### 6. Notification System

**Clarification**: In-app notifications only (no email/SMS for Phase 1).

**Database Table**:

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title VARCHAR(200),
  message TEXT,
  type VARCHAR(50), -- 'exam_schedule', 'result', 'deadline', 'fee_due', etc.
  related_entity_id UUID, -- ID of exam/result/etc.
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
```

**Notification Events**:

| Event | Trigger | Recipients |
|-------|---------|------------|
| Exam scheduled | Exam cell publishes schedule | All eligible students |
| Fee payment due | 3 days before deadline | Students who haven't paid |
| Hall ticket ready | After fee payment | Individual student |
| Marks entry open | Entry window starts | Assigned faculty |
| Marks entry deadline | 1 day before close | Faculty with pending marks |
| Results published | Results approved | All students |
| Revaluation window open | Window opens | Students with published results |

**UI - Notification Bell**:

```jsx
<div className="notification-bell">
  <button onClick={toggleNotifications}>
    🔔
    {unreadCount > 0 && (
      <span className="badge">{unreadCount}</span>
    )}
  </button>
  
  {showNotifications && (
    <div className="notification-dropdown">
      <div className="header">
        <h4>Notifications</h4>
        <button onClick={markAllRead}>Mark all read</button>
      </div>
      <div className="notification-list">
        {notifications.map(notif => (
          <div 
            key={notif.id} 
            className={notif.is_read ? 'read' : 'unread'}
          >
            <h5>{notif.title}</h5>
            <p>{notif.message}</p>
            <span>{formatTime(notif.created_at)}</span>
          </div>
        ))}
      </div>
    </div>
  )}
</div>
```

**Trigger Function**:

```javascript
async function sendNotification(userIds, title, message, type, entityId) {
  const notifications = userIds.map(userId => ({
    user_id: userId,
    title,
    message,
    type,
    related_entity_id: entityId,
    is_read: false
  }));
  
  await Notification.bulkCreate(notifications);
  
  // Emit real-time event via WebSocket (optional)
  io.to(userIds).emit('new_notification', { title, message });
}

// Usage example
await sendNotification(
  studentIds,
  'Results Published',
  'Semester 3 results are now available. Check your performance.',
  'result',
  scheduleId
);
```

---

### 7. Smart Answer Script Upload

**Clarification**: Scan → System recognizes barcode → Confirm → Link → Upload

**Workflow**:

```
1. Scanning staff scans answer script (PDF)
2. Upload PDF to system
3. System auto-detects barcode from PDF using OCR
4. System shows confirmation dialog with detected code
5. Staff confirms or manually corrects
6. System links PDF to student via barcode
7. PDF stored in local filesystem
```

**Backend Implementation**:

```javascript
const Tesseract = require('tesseract.js');
const JsBarcode = require('jsbarcode');
const PDFParser = require('pdf-parse');

async function uploadScript(file) {
  // Step 1: Extract first page as image
  const pdfBuffer = await file.buffer();
  const firstPageImage = await extractFirstPage(pdfBuffer);
  
  // Step 2: OCR to detect barcode
  const { data: { text } } = await Tesseract.recognize(
    firstPageImage,
    'eng'
  );
  
  // Step 3: Extract barcode pattern (e.g., EX24-SEM3-00142)
  const barcodePattern = /EX\d{2}-SEM\d+-\d{5}/;
  const detectedCode = text.match(barcodePattern)?.[0];
  
  // Step 4: Return detected code for confirmation
  return {
    detected_code: detectedCode,
    confidence: detectedCode ? 'high' : 'none',
    file_path: await saveTemporaryFile(pdfBuffer)
  };
}

async function confirmAndLinkScript(tempFilePath, confirmedCode, examSessionId) {
  // Find student by barcode
  const scriptCode = await AnswerScriptCode.findOne({
    where: { 
      code: confirmedCode,
      exam_session_id: examSessionId
    }
  });
  
  if (!scriptCode) {
    throw new Error('Invalid barcode');
  }
  
  // Move file to permanent location
  const permanentPath = `/storage/answer_scripts/${examSessionId}/${confirmedCode}.pdf`;
  await fs.rename(tempFilePath, permanentPath);
  
  // Create script record
  await AnswerScript.create({
    registration_id: scriptCode.registration_id,
    exam_session_id: examSessionId,
    script_code_id: scriptCode.id,
    file_path: permanentPath,
    uploaded_at: new Date()
  });
  
  return { success: true };
}
```

**UI - Smart Upload Interface**:

```jsx
<div className="smart-script-upload">
  <h2>Upload Answer Scripts - Semester End Exam</h2>
  
  <div className="upload-zone">
    <input 
      type="file" 
      accept="application/pdf"
      onChange={handleFileSelect}
    />
    <p>Drag and drop PDF files here</p>
  </div>
  
  {detectedCode && (
    <div className="confirmation-dialog">
      <h3>Barcode Detected</h3>
      <p>Detected Code: <strong>{detectedCode}</strong></p>
      <p>Student: {studentName || 'Loading...'}</p>
      
      {confidence === 'low' && (
        <div className="warning">
          ⚠️ Low confidence. Please verify manually.
        </div>
      )}
      
      <label>Confirm or correct barcode:</label>
      <input 
        type="text" 
        value={confirmedCode}
        onChange={e => setConfirmedCode(e.target.value)}
      />
      
      <div className="actions">
        <button onClick={confirmAndUpload}>Confirm & Upload</button>
        <button onClick={cancelUpload}>Cancel</button>
      </div>
    </div>
  )}
  
  <div className="upload-history">
    <h3>Uploaded Scripts (45/450)</h3>
    <table>
      <thead>
        <tr>
          <th>Barcode</th>
          <th>File</th>
          <th>Time</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {uploadedScripts.map(script => (
          <tr key={script.id}>
            <td>{script.code}</td>
            <td>{script.filename}</td>
            <td>{formatTime(script.uploaded_at)}</td>
            <td>
              <button onClick={() => viewScript(script)}>View</button>
              <button onClick={() => deleteScript(script)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

**Dependencies**:

```json
{
  "dependencies": {
    "tesseract.js": "^4.0.0",
    "pdf-parse": "^1.1.1",
    "sharp": "^0.32.0"
  }
}
```

---

## Summary of Final Clarifications

| Feature | Decision | Impact |
|---------|----------|--------|
| **Faculty Assignment** | HOD assigns via UI | New table + HOD interface needed |
| **Bundle Assignment** | Manual by exam cell | UI for creating/assigning bundles |
| **Lab Components** | From exam_configuration | No special handling, fully dynamic |
| **Absent Students** | Checkbox + auto-supply | Simple UI + backend logic |
| **Multi-section Choice** | Fully supported | Complex calculation logic |
| **Notifications** | In-app only | Simpler Phase 1 implementation |
| **Script Upload** | Smart barcode detection | OCR integration needed |

---

## Architecture

### Technology Stack

**Frontend**:

- React 18 + Vite
- Redux Toolkit
- React Router v6
- Chart.js (analytics)
- PDF generation (jsPDF)
- Barcode generation (JsBarcode)

**Backend**:

- Node.js + Express
- Sequelize ORM
- PostgreSQL (shared with main system)
- Redis (caching)
- **Local File Storage** (not S3/MinIO)

**Authentication**:

- Shared JWT with main system
- Same secret key
- SSO flow

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Main System (unipilot.in)                     │
│  - Student Portal                                       │
│  - Exam Schedule View                                   │
│  - Hall Ticket Download                                 │
│  - Results View                                         │
│  - Fee Payment (Semester + Lab External combined)       │
└──────────────┬──────────────────────────────────────────┘
               │
               │ API Calls + Shared DB
               │
┌──────────────▼──────────────────────────────────────────┐
│      Exam Management System (exam.unipilot.in)          │
│  - Exam Scheduling                                      │
│  - Paper Format Configuration (with CO mapping)         │
│  - Attendance Marking                                   │
│  - Script Upload & Management (Local Storage)           │
│  - Marks Entry (Section-based access)                   │
│  - Internal: Save/Freeze/Student View                   │
│  - External: Anonymous, No student view                 │
│  - Result Compilation (CO attainment)                   │
│  - Analytics & Reports                                  │
└─────────────────────────────────────────────────────────┘
               │
               │
         ┌─────▼──────┐
         │ PostgreSQL │
         │  (Shared)  │
         └────────────┘
```

---

## Database Design

### Updated Tables

#### 1. exam_schedules (No changes)

```sql
CREATE TABLE exam_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regulation_id UUID REFERENCES regulations(id),
  academic_year VARCHAR(10),
  semester INTEGER,
  exam_type VARCHAR(50), -- 'internal', 'external', etc.
  name VARCHAR(100), -- "Mid-1", "Semester End", etc.
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. exam_sessions (Updated)

```sql
CREATE TABLE exam_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id UUID REFERENCES exam_schedules(id),
  course_id UUID REFERENCES courses(id),
  exam_date DATE,
  start_time TIME,
  end_time TIME,
  duration_minutes INTEGER,
  venue_id UUID,
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_internal BOOLEAN DEFAULT TRUE, -- NEW: Internal vs External
  paper_format_id UUID REFERENCES exam_paper_formats(id),
  marks_entry_window_id UUID REFERENCES marks_entry_windows(id), -- NEW
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. exam_paper_formats (Updated)

```sql
CREATE TABLE exam_paper_formats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year VARCHAR(10), -- NEW: Can differ by year
  regulation_id UUID REFERENCES regulations(id),
  course_id UUID REFERENCES courses(id), -- NEW: Can differ by course
  exam_session_id UUID REFERENCES exam_sessions(id),
  course_type VARCHAR(50),
  component_config JSONB,
  -- Enhanced structure with sub-parts, choices, CO mapping:
  -- {
  --   "Descriptive": {
  --     "entry_type": "question_wise",
  --     "questions": [
  --       {
  --         "question_no": 1,
  --         "max_marks": 10,
  --         "sub_parts": [
  --           { "part": "a", "max_marks": 5, "co_mapped": ["CO1"] },
  --           { "part": "b", "max_marks": 5, "co_mapped": ["CO2"] }
  --         ]
  --       },
  --       { "question_no": 2, "max_marks": 10, ... }
  --     ],
  --     "choice_logic": "best_of",
  --     "choice_from": [1, 2]
  --   }
  -- }
  co_mappings JSONB, -- NEW: Overall CO mapping summary
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_unique_paper_format 
  ON exam_paper_formats(academic_year, regulation_id, course_id, exam_session_id);
```

#### 4. marks_entry_windows (NEW)

```sql
CREATE TABLE marks_entry_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_session_id UUID REFERENCES exam_sessions(id),
  start_datetime TIMESTAMP NOT NULL,
  end_datetime TIMESTAMP NOT NULL,
  is_extended BOOLEAN DEFAULT FALSE,
  extension_reason TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. exam_fee_configurations (NEW)

```sql
CREATE TABLE exam_fee_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year VARCHAR(10),
  semester INTEGER,
  regulation_id UUID REFERENCES regulations(id),
  fee_type VARCHAR(50), -- 'semester_external', 'supplementary'
  amount DECIMAL(10,2),
  includes_exams JSONB, -- ["Semester End", "Lab External"]
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 6. exam_registrations (Updated)

```sql
CREATE TABLE exam_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES users(id),
  exam_session_id UUID REFERENCES exam_sessions(id),
  section_id UUID REFERENCES sections(id), -- NEW: For section-based filtering
  script_code_id UUID REFERENCES answer_script_codes(id),
  is_eligible BOOLEAN DEFAULT TRUE,
  eligibility_reason TEXT,
  fee_paid BOOLEAN DEFAULT FALSE,
  fee_configuration_id UUID REFERENCES exam_fee_configurations(id), -- NEW
  hall_ticket_generated BOOLEAN DEFAULT FALSE,
  seat_number VARCHAR(20),
  registered_at TIMESTAMP DEFAULT NOW()
);
```

#### 7. exam_marks (Updated)

```sql
CREATE TABLE exam_marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES exam_registrations(id),
  exam_session_id UUID REFERENCES exam_sessions(id),
  script_code_id UUID REFERENCES answer_script_codes(id),
  marks_data JSONB,
  -- Enhanced structure with sub-parts:
  -- {
  --   "Descriptive": {
  --     "Q1": {
  --       "1a": 4.5,
  --       "1b": 5,
  --       "total": 9.5
  --     },
  --     "Q2": {
  --       "2a": 3,
  --       "2b": 4,
  --       "total": 7
  --     },
  --     "best_of_choice": "Q1",
  --     "final_marks": 9.5
  --   }
  -- }
  total_marks DECIMAL(5,2),
  co_attainment JSONB, -- NEW: CO-wise marks for attainment calculation
  evaluated_by UUID REFERENCES users(id),
  evaluated_at TIMESTAMP,
  moderated_by UUID,
  moderated_at TIMESTAMP,
  is_absent BOOLEAN DEFAULT FALSE,
  is_saved BOOLEAN DEFAULT FALSE, -- NEW: For internal exams
  is_frozen BOOLEAN DEFAULT FALSE, -- NEW: Prevents editing
  allow_student_view BOOLEAN DEFAULT FALSE, -- NEW: Internal only
  saved_at TIMESTAMP,
  frozen_at TIMESTAMP,
  remarks TEXT
);

CREATE INDEX idx_marks_session ON exam_marks(exam_session_id);
CREATE INDEX idx_marks_frozen ON exam_marks(is_frozen);
```

#### 8. evaluator_bundle_assignments (NEW)

For external exam bundle assignments

```sql
CREATE TABLE evaluator_bundle_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_session_id UUID REFERENCES exam_sessions(id),
  evaluator_id UUID REFERENCES users(id),
  bundle_name VARCHAR(100), -- "Bundle A", "Scripts 1-50"
  registration_ids JSONB, -- Array of registration IDs in this bundle
  assigned_by UUID REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW()
);
```

#### 9. answer_scripts (Updated)

```sql
CREATE TABLE answer_scripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_id UUID REFERENCES exam_registrations(id),
  script_code_id UUID REFERENCES answer_script_codes(id),
  file_path TEXT, -- NEW: Local file path instead of URL
  -- Example: /storage/answer_scripts/2024/3/exam-uuid/student-uuid.pdf
  file_size_mb DECIMAL(5,2),
  page_count INTEGER,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMP DEFAULT NOW()
);
```

#### 10. co_attainment_summary (NEW)

Aggregate CO attainment per course

```sql
CREATE TABLE co_attainment_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id),
  regulation_id UUID REFERENCES regulations(id),
  semester INTEGER,
  academic_year VARCHAR(10),
  co_attainment JSONB,
  -- Structure:
  -- {
  --   "CO1": { "average_marks": 7.5, "max_possible": 10, "attainment_%": 75 },
  --   "CO2": { "average_marks": 8.2, "max_possible": 10, "attainment_%": 82 }
  -- }
  calculated_at TIMESTAMP DEFAULT NOW()
);
```

---

## Key Features (Enhanced)

### 1. Question Sub-parts with Choices

**Configuration UI**:

```jsx
// Paper Format Configuration
<div>
  <h4>Descriptive Section</h4>
  <label>
    <input type="checkbox" /> Enable Choice Logic
  </label>
  
  {choiceEnabled && (
    <div>
      <label>Choice Type:</label>
      <select>
        <option>Best of</option>
        <option>Attempt any</option>
      </select>
      <label>Choose from questions:</label>
      <input type="text" placeholder="e.g., 1,2" />
    </div>
  )}
  
  <h5>Question 1 (10 marks)</h5>
  <button>Add Sub-part</button>
  <div>
    1a: <input type="number" /> marks
    CO Mapping: <MultiSelect options={['CO1', 'CO2', 'CO3']} />
  </div>
  <div>
    1b: <input type="number" /> marks
    CO Mapping: <MultiSelect options={['CO1', 'CO2', 'CO3']} />
  </div>
</div>
```

**Marks Entry with Best-of Logic**:

```jsx
// Evaluator sees:
<div>
  <h4>Descriptive (Answer any ONE - best will be considered)</h4>
  
  <div className="question">
    <h5>Question 1 (10 marks)</h5>
    <label>1a (5 marks): <input type="number" max="5" /></label>
    <label>1b (5 marks): <input type="number" max="5" /></label>
    <p>Q1 Total: {q1Total} / 10</p>
  </div>
  
  <div className="question">
    <h5>Question 2 (10 marks)</h5>
    <label>2a (5 marks): <input type="number" max="5" /></label>
    <label>2b (5 marks): <input type="number" max="5" /></label>
    <p>Q2 Total: {q2Total} / 10</p>
  </div>
  
  <p><strong>Best of Q1, Q2: {Math.max(q1Total, q2Total)} marks</strong></p>
</div>
```

### 2. Combined Fee Payment

**Fee Configuration** (Exam Cell):

```jsx
<div>
  <h3>Configure Semester 3 External Exam Fee</h3>
  <label>Amount: <input type="number" value={1000} /></label>
  <label>Includes Exams:</label>
  <CheckboxGroup options={['Semester End', 'Lab External']} />
  <button>Save Configuration</button>
</div>
```

**Student View** (Main System):

```jsx
<div className="fee-card">
  <h4>Semester 3 External Exam Fee</h4>
  <p>Amount: ₹1,000</p>
  <p>Includes:</p>
  <ul>
    <li>Semester End Exams (All theory subjects)</li>
    <li>Lab External Exams (All lab subjects)</li>
  </ul>
  <button>Pay Now</button>
</div>
```

**Hall Ticket Unlock Logic**:

```javascript
const canDownloadHallTicket = (studentId, examSessionId) => {
  const session = await ExamSession.findByPk(examSessionId);
  const registration = await ExamRegistration.findOne({
    where: { student_id: studentId, exam_session_id: examSessionId }
  });
  
  // Check if fee includes this exam type
  const feeConfig = await ExamFeeConfiguration.findByPk(
    registration.fee_configuration_id
  );
  
  const examType = session.exam_type; // "Semester End" or "Lab External"
  const isIncluded = feeConfig.includes_exams.includes(examType);
  
  return registration.fee_paid && isIncluded;
};
```

### 3. Faculty Section-based Access

**Marks Entry Portal**:

```javascript
// API endpoint
GET /api/exams/marks-entry/:sessionId

// Backend logic
router.get('/marks-entry/:sessionId', authenticateToken, async (req, res) => {
  const session = await ExamSession.findByPk(req.params.sessionId);
  const facultyId = req.user.userId;
  
  let registrations;
  
  if (session.is_internal) {
    // Internal exam - filter by sections faculty teaches
    const sections = await TimetableEntry.findAll({
      where: { 
        faculty_id: facultyId, 
        course_id: session.course_id  
      },
      attributes: ['section_id']
    });
    
    const sectionIds = sections.map(s => s.section_id);
    
    registrations = await ExamRegistration.findAll({
      where: { 
        exam_session_id: req.params.sessionId,
        section_id: { [Op.in]: sectionIds }
      },
      include: [{ model: User, as: 'student' }]
    });
  } else {
    // External exam - get assigned bundles
    const bundles = await EvaluatorBundleAssignment.findAll({
      where: {
        exam_session_id: req.params.sessionId,
        evaluator_id: facultyId
      }
    });
    
    const regIds = bundles.flatMap(b => b.registration_ids);
    
    registrations = await ExamRegistration.findAll({
      where: { id: { [Op.in]: regIds } },
      include: [{ model: AnswerScriptCode, as: 'script_code' }] // Anonymous codes
    });
  }
  
  res.json({ registrations, session });
});
```

### 4. Internal Evaluation Workflow

**UI with Save/Freeze/Student View**:

```jsx
const InternalMarksEntry = ({ session, registrations }) => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [marks, setMarks] = useState({});
  const [allowStudentView, setAllowStudentView] = useState(false);
  
  const handleSave = async (studentId) => {
    await saveMarks({
      registration_id: studentId,
      marks_data: marks[studentId],
      is_saved: true,
      allow_student_view: allowStudentView
    });
    toast.success('Marks saved successfully!');
  };
  
  const handleFreezeAll = async () => {
    if (!confirm('This will freeze marks for all students. Continue?')) return;
    
    await api.post(`/exams/marks-entry/${session.id}/freeze-all`);
    toast.success('All marks frozen!');
  };
  
  return (
    <div>
      <div className="controls">
        <label>
          <input 
            type="checkbox" 
            checked={allowStudentView}
            onChange={() => setAllowStudentView(!allowStudentView)}
          />
          Allow students to view answer scripts
        </label>
        <button onClick={handleFreezeAll} className="freeze-btn">
          🔒 Freeze All Marks
        </button>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Name</th>
            <th>Marks</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {registrations.map(reg => (
            <tr key={reg.id}>
              <td>{reg.student.roll_number}</td>
              <td>{reg.student.name}</td>
              <td>
                <MarksEntryForm 
                  paperFormat={session.paper_format}
                  value={marks[reg.id]}
                  onChange={(val) => setMarks({...marks, [reg.id]: val})}
                  disabled={reg.is_frozen}
                />
              </td>
              <td>
                {reg.is_frozen ? '🔒 Frozen' : reg.is_saved ? '✓ Saved' : '⚠️ Not Saved'}
              </td>
              <td>
                <button 
                  onClick={() => handleSave(reg.id)}
                  disabled={reg.is_frozen}
                >
                  Save
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

### 5. CO Attainment Calculation

**After Marks Entry**:

```javascript
async function calculateCOAttainment(examSessionId) {
  const session = await ExamSession.findByPk(examSessionId, {
    include: [{ model: ExamPaperFormat, as: 'paper_format' }]
  });
  
  const allMarks = await ExamMarks.findAll({
    where: { exam_session_id: examSessionId, is_absent: false }
  });
  
  const coConfig = session.paper_format.component_config;
  const coScores = {}; // CO -> [marks array]
  
  for (const mark of allMarks) {
    // Extract CO-wise marks from marks_data
    const coMarks = extractCOMarks(mark.marks_data, coConfig);
    
    for (const [co, score] of Object.entries(coMarks)) {
      if (!coScores[co]) coScores[co] = [];
      coScores[co].push(score);
    }
  }
  
  // Calculate average attainment
  const attainment = {};
  for (const [co, scores] of Object.entries(coScores)) {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const maxPossible = getMaxMarksForCO(co, coConfig);
    attainment[co] = {
      average_marks: avg,
      max_possible: maxPossible,
      attainment_percent: (avg / maxPossible) * 100
    };
  }
  
  await COAttainmentSummary.create({
    course_id: session.course_id,
    regulation_id: session.regulation_id,
    semester: session.semester,
    academic_year: session.academic_year,
    co_attainment: attainment
  });
}
```

---

### 6. Advanced Choice Logic Patterns

**Supporting all common exam question patterns**

#### Pattern 1: Simple "Best of" (Either/Or)

**Example**: "Answer Q1 OR Q2"

**Configuration**:

```json
{
  "Section A": {
    "entry_type": "question_wise",
    "questions": [
      { "question_no": 1, "max_marks": 10, "co_mapped": ["CO1"] },
      { "question_no": 2, "max_marks": 10, "co_mapped": ["CO2"] }
    ],
    "choice_logic": "best_of",
    "choice_from": [1, 2],
    "take_best": 1,
    "component_max_marks": 10
  }
}
```

**Evaluation**: Student may attempt both, system takes highest marks.

---

#### Pattern 2: "Attempt Any N out of M"

**Example**: "Answer any 5 out of 10 questions (Each 10 marks)"

**Configuration**:

```json
{
  "Section B": {
    "entry_type": "question_wise",
    "questions": [
      { "question_no": 1, "max_marks": 10, "co_mapped": ["CO1"] },
      { "question_no": 2, "max_marks": 10, "co_mapped": ["CO2"] },
      // ... up to question 10
      { "question_no": 10, "max_marks": 10, "co_mapped": ["CO5"] }
    ],
    "choice_logic": "best_n_of_m",
    "take_best": 5,
    "from_total": 10,
    "component_max_marks": 50  // 5 × 10 marks
  }
}
```

**Marks Entry UI**:

```jsx
<div className="section-b">
  <h4>Section B: Answer any 5 out of 10 (Each 10 marks)</h4>
  <p className="help-text">
    ℹ️ Student may attempt more than 5. Mark all attempted questions. 
    System will automatically select best 5.
  </p>
  
  <div className="questions-grid">
    {[1,2,3,4,5,6,7,8,9,10].map(qNo => (
      <div key={qNo}>
        <label>Q{qNo} (10 marks):</label>
        <input 
          type="number" 
          max="10" 
          step="0.5"
          placeholder="0 if not attempted"
        />
        <span className="co-tags">CO{Math.ceil(qNo/2)}</span>
      </div>
    ))}
  </div>
  
  <div className="calculation-preview">
    <h5>Auto-calculated:</h5>
    <p>Attempted: {attemptedCount} questions</p>
    <p>Best 5 selected: Q5(10), Q2(9), Q8(9), Q1(8), Q4(7)</p>
    <p className="final-marks"><strong>Final Marks: 43 / 50</strong></p>
  </div>
</div>
```

**Backend Calculation**:

```javascript
function applyChoiceLogic(marksData, config) {
  const { choice_logic, take_best, from_total } = config;
  
  if (choice_logic === "best_n_of_m") {
    // Get all attempted questions (non-null, non-empty)
    const attemptedQuestions = marksData.questions
      .filter(q => q.marks !== null && q.marks !== '' && q.marks > 0)
      .map(q => ({
        question_no: q.question_no,
        marks: parseFloat(q.marks),
        co_mapped: q.co_mapped
      }));
    
    // Sort by marks (descending)
    const sortedByMarks = [...attemptedQuestions]
      .sort((a, b) => b.marks - a.marks);
    
    // Take top N
    const bestN = sortedByMarks.slice(0, take_best);
    
    // Calculate total
    const total = bestN.reduce((sum, q) => sum + q.marks, 0);
    
    // Extract CO-wise marks from selected questions
    const coMarks = {};
    bestN.forEach(q => {
      q.co_mapped.forEach(co => {
        if (!coMarks[co]) coMarks[co] = 0;
        coMarks[co] += q.marks / q.co_mapped.length; // Distribute equally
      });
    });
    
    return {
      all_attempted: attemptedQuestions,
      best_selected: bestN,
      not_considered: attemptedQuestions.filter(
        q => !bestN.find(b => b.question_no === q.question_no)
      ),
      final_marks: total,
      max_possible: take_best * config.max_marks_per_question,
      co_wise_marks: coMarks
    };
  }
}
```

**Stored Data Example**:

```json
{
  "Section B": {
    "all_attempted": [
      { "question_no": 1, "marks": 8, "co_mapped": ["CO1"] },
      { "question_no": 2, "marks": 9, "co_mapped": ["CO1", "CO2"] },
      { "question_no": 4, "marks": 7, "co_mapped": ["CO2"] },
      { "question_no": 5, "marks": 10, "co_mapped": ["CO3"] },
      { "question_no": 6, "marks": 6, "co_mapped": ["CO3"] },
      { "question_no": 8, "marks": 9, "co_mapped": ["CO4"] },
      { "question_no": 10, "marks": 5, "co_mapped": ["CO5"] }
    ],
    "best_selected": [
      { "question_no": 5, "marks": 10, "co_mapped": ["CO3"] },
      { "question_no": 2, "marks": 9, "co_mapped": ["CO1", "CO2"] },
      { "question_no": 8, "marks": 9, "co_mapped": ["CO4"] },
      { "question_no": 1, "marks": 8, "co_mapped": ["CO1"] },
      { "question_no": 4, "marks": 7, "co_mapped": ["CO2"] }
    ],
    "not_considered": [
      { "question_no": 6, "marks": 6 },
      { "question_no": 10, "marks": 5 }
    ],
    "final_marks": 43,
    "max_possible": 50,
    "co_wise_marks": {
      "CO1": 12.5,
      "CO2": 11.5,
      "CO3": 10,
      "CO4": 9
    }
  }
}
```

---

#### Pattern 3: "Best N from Each Group"

**Example**: "Answer any 3 from Group A (Q1-Q5) and any 2 from Group B (Q6-Q10)"

**Configuration**:

```json
{
  "Section C": {
    "entry_type": "grouped_choice",
    "groups": [
      {
        "name": "Group A",
        "questions": [
          { "question_no": 1, "max_marks": 10, "co_mapped": ["CO1"] },
          { "question_no": 2, "max_marks": 10, "co_mapped": ["CO1"] },
          { "question_no": 3, "max_marks": 10, "co_mapped": ["CO2"] },
          { "question_no": 4, "max_marks": 10, "co_mapped": ["CO2"] },
          { "question_no": 5, "max_marks": 10, "co_mapped": ["CO3"] }
        ],
        "take_best": 3
      },
      {
        "name": "Group B",
        "questions": [
          { "question_no": 6, "max_marks": 15, "co_mapped": ["CO3"] },
          { "question_no": 7, "max_marks": 15, "co_mapped": ["CO4"] },
          { "question_no": 8, "max_marks": 15, "co_mapped": ["CO4"] },
          { "question_no": 9, "max_marks": 15, "co_mapped": ["CO5"] },
          { "question_no": 10, "max_marks": 15, "co_mapped": ["CO5"] }
        ],
        "take_best": 2
      }
    ],
    "component_max_marks": 60  // (3 × 10) + (2 × 15)
  }
}
```

---

#### Pattern 4: "Compulsory + Choice"

**Example**: "Q1 is compulsory. Answer any 3 from Q2-Q6"

**Configuration**:

```json
{
  "Section D": {
    "entry_type": "mixed_choice",
    "compulsory": [
      { "question_no": 1, "max_marks": 20, "co_mapped": ["CO1", "CO2"] }
    ],
    "choice_section": {
      "questions": [
        { "question_no": 2, "max_marks": 10, "co_mapped": ["CO2"] },
        { "question_no": 3, "max_marks": 10, "co_mapped": ["CO3"] },
        { "question_no": 4, "max_marks": 10, "co_mapped": ["CO3"] },
        { "question_no": 5, "max_marks": 10, "co_mapped": ["CO4"] },
        { "question_no": 6, "max_marks": 10, "co_mapped": ["CO5"] }
      ],
      "choice_logic": "best_n_of_m",
      "take_best": 3,
      "from_total": 5
    },
    "component_max_marks": 50  // 20 + (3 × 10)
  }
}
```

---

### Edge Cases Handled

#### 1. Student Attempts Fewer than Required

**Scenario**: Required 5, student attempts only 3

**Result**:

```json
{
  "attempted_count": 3,
  "required_count": 5,
  "best_selected": [
    { "question_no": 2, "marks": 9 },
    { "question_no": 5, "marks": 8 },
    { "question_no": 8, "marks": 6 }
  ],
  "final_marks": 23,
  "max_possible": 50,
  "penalty_note": "Student did not attempt minimum required questions"
}
```

**Impact**: Student loses marks for unanswered questions (23/50 instead of potential 50/50)

---

#### 2. Student Attempts Exactly Required Number

**Scenario**: Required 5, student attempts exactly 5

**Result**: All 5 are considered (no choice logic needed)

---

#### 3. Student Attempts More than Required

**Scenario**: Required 5, student attempts 8

**Result**: System automatically selects best 5, benefits the student

---

#### 4. Tie in Marks

**Scenario**: Student scores 8, 8, 8, 7, 7, 7 in 6 attempts (need best 5)

**Logic**: Take first occurrence in question number order

```
Selected: Q1(8), Q2(8), Q4(8), Q5(7), Q7(7)
Not selected: Q9(7) [tie, but comes later]
```

---

#### 5. Zero Marks vs Not Attempted

**Distinction**:

- **Not attempted**: Input left empty → Ignored in calculation
- **Zero marks**: Explicitly marked 0 → Counted as attempted with 0 score

**Example**:

```
Q1: 8
Q2: 0 (attempted but wrong)
Q3: 9
Q4: [empty] (not attempted)
Q5: 7

Attempted: Q1, Q2, Q3, Q5 (4 questions)
If required = 3, best 3: Q3(9), Q1(8), Q5(7) = 24 marks
Q2(0) not selected (lowest score)
```

---

### Implementation Notes

**Validation Rules**:

1. ✅ Total marks from selected questions must not exceed `component_max_marks`
2. ✅ Evaluator can enter marks for all attempted questions
3. ✅ System auto-calculates and stores which questions were considered
4. ✅ CO mapping preserved even for non-selected questions (for future analysis)
5. ✅ Audit trail maintained (what was attempted vs what was counted)

**UI/UX Considerations**:

- Show live preview of selected questions
- Highlight which questions will be considered
- Display warning if student attempted fewer than required
- Show CO distribution for selected questions
- Allow evaluator to override choice logic if needed (with admin approval)

---

## Phase-wise Development Plan

### Phase 1: Foundation Setup (Week 1-2)

**Duration**: 2 weeks  
**Team**: 1 Full-stack developer

#### Tasks

- [ ] Project initialization
  - [ ] Create React + Vite project
  - [ ] Set up Express backend
  - [ ] Configure ESLint, Prettier
- [ ] Database setup
  - [ ] Create ALL updated table migrations
  - [ ] Set up Sequelize models
  - [ ] Create seed data for testing
- [ ] Authentication integration
  - [ ] Shared JWT configuration
  - [ ] Auth middleware
  - [ ] SSO redirect flow
  - [ ] Role-based access control
- [ ] **Local File Storage Setup**
  - [ ] Create storage directory structure
  - [ ] File upload/download utilities
  - [ ] Access control for files
- [ ] Basic UI framework
  - [ ] Design system setup (match main system)
  - [ ] Layout components (Sidebar, Header)
  - [ ] Protected routes
  - [ ] Dashboard skeleton

**Deliverables**:

- ✅ Working authentication (SSO with main system)
- ✅ Database with all tables created
- ✅ Local file storage working
- ✅ Basic navigation structure
- ✅ Role-based access working

---

### Phase 2: Exam Scheduling Module (Week 3-4)

**Duration**: 2 weeks

#### Tasks

- [ ] Backend APIs
  - [ ] `POST /api/exams/schedules` - Create schedule
  - [ ] `GET /api/exams/schedules` - List schedules
  - [ ] `PUT /api/exams/schedules/:id` - Update schedule
  - [ ] `POST /api/exams/schedules/:id/publish` - Publish
  - [ ] Integration with regulation exam_configuration
  - [ ] **Marks entry window creation**
- [ ] Frontend components
  - [ ] Schedule creation wizard (multi-step form)
  - [ ] Regulation selector (loads exam structure)
  - [ ] Course selection from curriculum
  - [ ] Date/time picker with conflict detection
  - [ ] Venue allocation UI
  - [ ] **Marks entry deadline setting**
  - [ ] Schedule calendar view
  - [ ] Draft → Published workflow
- [ ] Validations
  - [ ] Room clash detection
  - [ ] Faculty clash detection
  - [ ] Student conflict detection
- [ ] Notifications
  - [ ] Send to main system API when schedule published

**Deliverables**:

- ✅ Exam Cell can create exam schedules
- ✅ System reads regulation exam structure
- ✅ Marks entry windows configured
- ✅ Conflict detection working
- ✅ Students see schedule in main system

---

### Phase 3: Enhanced Paper Format Configuration (Week 5-6)

**Duration**: 2 weeks (extended for CO mapping)

#### Tasks

- [ ] Backend APIs
  - [ ] `POST /api/exams/paper-formats` - Save configuration
  - [ ] `GET /api/exams/paper-formats/:sessionId` - Get config
  - [ ] Component tree traversal logic
  - [ ] **CO mapping validation**
- [ ] Frontend components
  - [ ] Dynamic component renderer (reads from regulation)
  - [ ] Entry type selector (Total / Question-wise)
  - [ ] **Sub-parts configuration UI**
  - [ ] **Choice logic configuration** (best of, attempt any)
  - [ ] **CO mapping selector** (multi-select dropdown)
  - [ ] Question configuration UI
  - [ ] Marks distribution form
  - [ ] Preview of marks entry form
- [ ] Validation
  - [ ] Marks distribution must equal max_marks
  - [ ] All leaf components must be configured
  - [ ] **All questions must have CO mapping**

**Deliverables**:

- ✅ Admin can configure paper format with sub-parts
- ✅ Choice logic (best of questions) configured
- ✅ CO mapping for all questions
- ✅ Configuration stored as JSONB
- ✅ Preview shows exact marks entry UI

---

### Phase 4: Registration & Combined Fee Integration (Week 7)

**Duration**: 1 week

#### Tasks

- [ ] Backend APIs
  - [ ] `POST /api/exams/registrations/bulk` - Auto-register students
  - [ ] `GET /api/exams/student/:id/registrations` - Student's exams
  - [ ] Eligibility check (attendance, fees from main system)
  - [ ] **Combined fee configuration API**
- [ ] Fee integration (Main System)
  - [ ] **Create exam fee configuration** (Semester + Lab External combined)
  - [ ] API endpoint for exam fee status
  - [ ] Update `fee_paid` flag on payment
  - [ ] **Link payment to fee configuration**
- [ ] Frontend in Main System
  - [ ] Student exam schedule view
  - [ ] **Combined fee payment UI**
  - [ ] Hall ticket download (disabled until fee paid for relevant exams)

**Deliverables**:

- ✅ Students auto-registered after schedule published
- ✅ Combined fee payment working
- ✅ Single payment unlocks both Semester + Lab External
- ✅ Students see their exam schedule

---

### Phase 5: Anonymous Code Generation & Hall Tickets (Week 8)

**Duration**: 1 week

#### Tasks

- [ ] Backend APIs
  - [ ] `POST /api/exams/generate-codes/:sessionId` - Generate codes
  - [ ] `GET /api/exams/hall-ticket/:studentId` - Generate PDF
  - [ ] Barcode/QR code generation
  - [ ] **Store PDFs in local storage**
- [ ] Hall ticket template
  - [ ] Design HTML template
  - [ ] PDF generation with student photo, schedule, barcode
  - [ ] Template customization UI (admin)
- [ ] Frontend
  - [ ] Bulk code generation UI (exam cell)
  - [ ] Code listing with export to Excel
  - [ ] Hall ticket download in main system

**Deliverables**:

- ✅ Anonymous codes generated for external exams
- ✅ Barcodes printable
- ✅ Hall tickets stored locally and downloadable

---

### Phase 6: Section-based Marks Entry System (Week 9-11)

**Duration**: 3 weeks (most complex)

#### Tasks

- [ ] Backend APIs
  - [ ] **Faculty section access check**
  - [ ] `GET /api/exams/marks-entry/:sessionId` - Get students (filtered by section)
  - [ ] `POST /api/exams/marks` - Enter marks
  - [ ] `PUT /api/exams/marks/:id` - Update marks
  - [ ] **`POST /api/exams/marks-entry/:sessionId/save`** - Save per student
  - [ ] **`POST /api/exams/marks-entry/:sessionId/freeze-all`** - Freeze all
  - [ ] **`PUT /api/exams/marks-entry/:sessionId/student-view`** - Toggle
  - [ ] **Marks entry window validation** (check deadline)
  - [ ] Validation (max marks, structure, sub-parts, choices)
- [ ] Frontend - Evaluator Portal
  - [ ] Dynamic marks entry form generator
  - [ ] Total marks input component
  - [ ] **Question-wise with sub-parts input**
  - [ ] **Choice logic display and calculation**
  - [ ] **CO tag display per question**
  - [ ] Auto-calculation of totals (best-of logic)
  - [ ] **Save button per student**
  - [ ] **Freeze All button**
  - [ ] **Student View toggle** (internal only)
  - [ ] **Deadline countdown timer**
  - [ ] Bulk marks entry spreadsheet view (optional)
- [ ] Anonymous vs Named modes
  - [ ] Show student name + section for internal exams
  - [ ] Show only code for external exams (no student view toggle)
  - [ ] Answer script PDF viewer integration
- [ ] External Exam Bundle Assignment
  - [ ] Bundle creation UI
  - [ ] Assign bundles to faculty
  - [ ] Faculty sees only assigned bundles
- [ ] Real-time validation
  - [ ] Component max marks check
  - [ ] Sub-part marks must sum to question total
  - [ ] Deadline enforcement
  - [ ] Auto-save drafts

**Deliverables**:

- ✅ Faculty can only see sections they teach (internal exams)
- ✅ Save/Freeze/Student View working for internal exams
- ✅ Question sub-parts and choice logic working
- ✅ Marks entry form adapts to paper format
- ✅ Anonymous marking for external exams
- ✅ Deadline enforcement

---

### Phase 7: Script Upload & Management (Week 12)

**Duration**: 1 week

#### Tasks

- [ ] Backend APIs
  - [ ] `POST /api/exams/scripts/upload` - Upload script
  - [ ] `GET /api/exams/scripts/:registrationId` - Get script
  - [ ] **Local file storage integration**
- [ ] Frontend - Upload Portal
  - [ ] Student selector/search
  - [ ] Barcode scanner integration (webcam)
  - [ ] Document scanner interface
  - [ ] Multi-page PDF creation
  - [ ] **Save to local storage**
  - [ ] Upload progress indicator
  - [ ] Uploaded scripts listing
- [ ] Validation
  - [ ] File size limits
  - [ ] PDF format validation
  - [ ] Duplicate upload prevention

**Deliverables**:

- ✅ Scanning staff can upload scripts locally
- ✅ Barcode scanning auto-identifies student
- ✅ Scripts linked to registrations
- ✅ Students can view scripts (if toggle enabled for internal)

---

### Phase 8: Results Processing & CO Attainment (Week 13-14)

**Duration**: 2 weeks

#### Tasks

- [ ] Backend - Calculation Engine
  - [ ] Relation parser and evaluator
  - [ ] **Choice logic evaluator** (best-of)
  - [ ] Internal + External marks compilation
  - [ ] Grade scale application
  - [ ] SGPA/CGPA calculation
  - [ ] **CO attainment calculation**
  - [ ] Backlog identification
  - [ ] `POST /api/exams/results/compile` - Compile results
  - [ ] `POST /api/exams/results/publish` - Publish
  - [ ] **`GET /api/exams/co-attainment/:courseId`** - CO report
- [ ] Frontend - Results Dashboard
  - [ ] Pre-publication preview
  - [ ] Statistical analysis (pass %, top performers)
  - [ ] **CO attainment charts**
  - [ ] Department-wise performance
  - [ ] Grade distribution charts
  - [ ] Approval workflow UI
  - [ ] Publication controls
- [ ] Frontend - Main System (Student View)
  - [ ] Results page
  - [ ] Marks card generation (local storage)
  - [ ] Subject-wise breakdown
  - [ ] **CO-wise performance** (if institution enables)
  - [ ] SGPA/CGPA display
  - [ ] Graphical performance analysis
- [ ] Notifications
  - [ ] In-app notifications
  - [ ] Mobile push notifications

**Deliverables**:

- ✅ Results compilation with choice logic
- ✅ CO attainment calculated and stored
- ✅ Grades calculated automatically
- ✅ SGPA/CGPA computed correctly
- ✅ Students can view results
- ✅ Marks cards stored locally

---

### Phase 9: Analytics & Reports (Week 15)

**Duration**: 1 week

#### Tasks

- [ ] Backend APIs
  - [ ] `/api/exams/reports/pass-percentage`
  - [ ] `/api/exams/reports/top-performers`
  - [ ] `/api/exams/reports/department-analysis`
  - [ ] `/api/exams/reports/subject-performance`
  - [ ] **`/api/exams/reports/co-attainment`** - CO attainment report
- [ ] Frontend - Analytics Dashboard
  - [ ] Charts (Chart.js)
  - [ ] Pass percentage by department
  - [ ] Subject-wise performance
  - [ ] **CO attainment trends**
  - [ ] Year-over-year trends
  - [ ] Top 10 students
  - [ ] Failed students list
  - [ ] Export to Excel/PDF

**Deliverables**:

- ✅ Comprehensive analytics dashboard
- ✅ CO attainment reports for accreditation
- ✅ Exportable reports
- ✅ Visual charts and graphs

---

### Phase 10: Testing & Deployment (Week 16-17)

**Duration**: 2 weeks

#### Tasks

- [ ] Testing
  - [ ] Unit tests (backend APIs)
  - [ ] Integration tests (end-to-end flows)
  - [ ] Load testing (marks entry, results compilation)
  - [ ] **Test section-based access control**
  - [ ] **Test choice logic calculations**
  - [ ] **Test CO attainment accuracy**
  - [ ] Security audit
  - [ ] Cross-browser testing
- [ ] Bug fixes
- [ ] Performance optimization
  - [ ] Database indexing
  - [ ] Query optimization
  - [ ] **File storage optimization**
  - [ ] Caching strategy (Redis)
- [ ] Documentation
  - [ ] API documentation (Swagger)
  - [ ] User manuals
  - [ ] Admin guide
  - [ ] Deployment guide
- [ ] Deployment
  - [ ] Set up production server
  - [ ] Configure subdomain (exam.unipilot.in)
  - [ ] **Set up local storage with backups**
  - [ ] SSL certificates
  - [ ] Database migration to production
  - [ ] Backup strategy
  - [ ] Monitoring setup

**Deliverables**:

- ✅ Production-ready system
- ✅ Deployed to exam.unipilot.in
- ✅ Local file storage with backups
- ✅ Documentation complete
- ✅ Monitoring active

---

## Integration Strategy

### Main System → Exam System

**API Endpoints (Exam Backend exposes)**:

```
Student-facing:
GET  /api/exams/student/:studentId/schedule
GET  /api/exams/student/:studentId/hall-ticket
GET  /api/exams/student/:studentId/results
GET  /api/exams/student/:studentId/answer-script/:sessionId (if view enabled)
POST /api/exams/student/:studentId/revaluation

Fee Integration:
GET  /api/exams/fee-config/:semester/:academicYear
POST /api/exams/registrations/mark-fee-paid

Configuration:
GET  /api/exams/regulations/:id/structure (reads exam_configuration)

Timetable Integration:
GET  /api/timetable/faculty/:id/sections/:courseId (for section-based filtering)
```

**Main System Components to Update**:

```
New pages:
/student/exams              - Exam dashboard
/student/exams/schedule     - Calendar view
/student/exams/hall-ticket  - Download
/student/exams/results      - Results view
/student/exams/fees         - Combined fee payment

Existing pages to modify:
/student/fees               - Add exam fee payment
```

### Exam System → Main System

**Webhooks/Notifications**:

```
POST /api/notifications/create
{
  "user_id": "uuid",
  "type": "exam_schedule_published",
  "title": "Exam Schedule Published",
  "message": "Semester 3 exam schedule is now available",
  "metadata": { "schedule_id": "uuid" }
}
```

### Shared Database Tables

**Read-only from Exam System**:

- `users` - Student/faculty data
- `courses` - Course information
- `regulations` - Exam configuration, grade scales
- `departments` - Department data
- `sections` - Section data
- **`timetable_entries`** - For section-based access control

**Full access**:

- All `exam_*` tables
- `co_attainment_summary`

---

## Timeline & Milestones

### Total Duration: 17 weeks (~4 months)

**Milestone 1** (Week 4): Scheduling module with deadline setting complete  
**Milestone 2** (Week 6): Paper format with CO mapping working  
**Milestone 3** (Week 7): Combined fee payment working  
**Milestone 4** (Week 11): Section-based marks entry fully functional  
**Milestone 5** (Week 14): Results compilation with CO attainment working  
**Milestone 6** (Week 17): Production deployment complete

### Team Requirement

- 1-2 Full-stack developers
- 1 UI/UX designer (part-time)
- 1 QA engineer (from week 11)

---

## Success Criteria

### Technical

- ✅ System handles 10,000+ students per exam
- ✅ Marks entry response time < 500ms
- ✅ Result compilation for 1000 students < 5 minutes
- ✅ Local file storage performant (< 2s for script download)
- ✅ CO attainment calculation accurate
- ✅ 99.9% uptime during exam season

### Functional

- ✅ Zero manual intervention in grade calculation
- ✅ Choice logic (best-of) evaluated correctly
- ✅ Anonymous marking maintains complete anonymity
- ✅ Section-based access restricts faculty correctly
- ✅ Save/Freeze workflow prevents accidental edits
- ✅ Combined fee payment unlocks both exam types
- ✅ Hall tickets generated in < 1 second per student
- ✅ Dynamic forms adapt to any exam structure with sub-parts

### User Experience

- ✅ Marks entry <3 minutes per student (complex exam with sub-parts)
- ✅ Schedule creation <30 minutes
- ✅ Results publication <10 clicks

---

## Risk Mitigation

| Risk | Impact | Mitigation |
| --------------------------------- | -------- | ------------------------------------------------------------ |
| Regulation structure changes | High | Version control exam configs, migration scripts |
| Anonymous code generation failure | High | Batch generation with retry, manual override |
| Large file uploads (scripts) | Medium | Chunked upload, compression, local storage optimization |
| Concurrent marks entry conflicts | Medium | Optimistic locking, last-write-wins with audit log |
| Result calculation errors | Critical | Extensive testing, manual override option |
| **Choice logic bugs** | High | **Comprehensive test cases for all choice combinations** |
| **CO mapping incomplete** | Medium | **Validation prevents saving without CO mapping** |
| **Section access bypass** | High | **Server-side validation, audit logs** |
| **Local storage disk full** | Medium | **Monitoring, automatic cleanup of old files, alerts** |
| **Freeze circumvention** | Medium | **Audit trail, admin-only unfreeze with reason logging** |

---

## Open Questions / Decisions Needed

1. [x] File storage: AWS S3 or self-hosted MinIO? → **Local file storage**
2. [ ] Mobile app: Build native or PWA?
3. [ ] Barcode scanner: Dedicated hardware or webcam?
4. [ ] Supplementary exam: Separate module or same flow?
5. [ ] Revaluation: Full re-evaluation or only moderation?
6. [ ] **CO mapping: Optional or mandatory for all exams?**
7. [ ] **Student view of scripts: Always allowed post-publication or faculty controls?**
8. [ ] **Deadline extension: Automatic request or manual approval?**

---

**End of Planning Document**

> This is a living document. Update as requirements evolve.
