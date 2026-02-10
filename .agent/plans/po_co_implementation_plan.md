# PO-CO Implementation Plan for UniPilot

## Overview
Implement Program Outcomes (POs), Course Outcomes (COs), and CO-PO Mapping functionality in UniPilot. The database schema already exists with the following tables:
- `program_outcomes` (PO_CODE, description, program_id)
- `course_outcomes` (CO_CODE, description, course_id, target_attainment)
- `co_po_maps` (course_outcome_id, program_outcome_id, weightage)

## Architecture Analysis

### Existing Schema (from database/schema.sql)

**program_outcomes:**
```sql
CREATE TABLE public.program_outcomes (
    id uuid NOT NULL,
    program_id uuid NOT NULL,
    po_code character varying(20) NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);
```

**course_outcomes:**
```sql
CREATE TABLE public.course_outcomes (
    id uuid NOT NULL,
    course_id uuid NOT NULL,
    co_code character varying(20) NOT NULL,
    description text NOT NULL,
    target_attainment numeric(5,2) DEFAULT 60,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);
```

**co_po_maps:**
```sql
CREATE TABLE public.co_po_maps (
    id uuid NOT NULL,
    course_outcome_id uuid NOT NULL,
    program_outcome_id uuid NOT NULL,
    weightage integer NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);
```

---

## Implementation Tasks

### Phase 1: Backend Models (Priority: HIGH)

#### 1.1 Create Sequelize Models

**File: `/backend/src/models/ProgramOutcome.js`**
```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ProgramOutcome = sequelize.define('ProgramOutcome', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    program_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'programs', key: 'id' }
    },
    po_code: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    tableName: 'program_outcomes',
    timestamps: true,
    underscored: true
  });

  return ProgramOutcome;
};
```

**File: `/backend/src/models/CourseOutcome.js`**
```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CourseOutcome = sequelize.define('CourseOutcome', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'courses', key: 'id' }
    },
    co_code: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    target_attainment: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 60
    }
  }, {
    tableName: 'course_outcomes',
    timestamps: true,
    underscored: true
  });

  return CourseOutcome;
};
```

**File: `/backend/src/models/CoPoMap.js`**
```javascript
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CoPoMap = sequelize.define('CoPoMap', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    course_outcome_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'course_outcomes', key: 'id' }
    },
    program_outcome_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'program_outcomes', key: 'id' }
    },
    weightage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 3  // Common: 0=None, 1=Low, 2=Medium, 3=High
      }
    }
  }, {
    tableName: 'co_po_maps',
    timestamps: true,
    underscored: true
  });

  return CoPoMap;
};
```

#### 1.2 Update Model Associations (`/backend/src/models/index.js`)

```javascript
// Add associations after all models are imported

// Program associations
Program.hasMany(ProgramOutcome, { foreignKey: 'program_id', as: 'outcomes' });
ProgramOutcome.belongsTo(Program, { foreignKey: 'program_id', as: 'program' });

// Course associations
Course.hasMany(CourseOutcome, { foreignKey: 'course_id', as: 'outcomes' });
CourseOutcome.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

// CO-PO Mapping associations
CourseOutcome.belongsToMany(ProgramOutcome, { 
  through: CoPoMap, 
  foreignKey: 'course_outcome_id',
  otherKey: 'program_outcome_id',
  as: 'programOutcomes' 
});

ProgramOutcome.belongsToMany(CourseOutcome, { 
  through: CoPoMap, 
  foreignKey: 'program_outcome_id',
  otherKey: 'course_outcome_id',
  as: 'courseOutcomes' 
});

// Direct access to mapping
CoPoMap.belongsTo(CourseOutcome, { foreignKey: 'course_outcome_id', as: 'courseOutcome' });
CoPoMap.belongsTo(ProgramOutcome, { foreignKey: 'program_outcome_id', as: 'programOutcome' });
```

---

### Phase 2: Backend Controllers & Routes (Priority: HIGH)

#### 2.1 Create ProgramOutcome Controller

**File: `/backend/src/controllers/programOutcomeController.js`**

Key Functions:
- `getAllProgramOutcomes(req, res)` - GET /api/program-outcomes?program_id=...
- `createProgramOutcome(req, res)` - POST /api/program-outcomes
- `updateProgramOutcome(req, res)` - PUT /api/program-outcomes/:id
- `deleteProgramOutcome(req, res)` - DELETE /api/program-outcomes/:id
- `bulkCreateProgramOutcomes(req, res)` - POST /api/program-outcomes/bulk (for creating during program setup)

#### 2.2 Create CourseOutcome Controller

**File: `/backend/src/controllers/courseOutcomeController.js`**

Key Functions:
- `getAllCourseOutcomes(req, res)` - GET /api/course-outcomes?course_id=...
- `createCourseOutcome(req, res)` - POST /api/course-outcomes
- `updateCourseOutcome(req, res)` - PUT /api/course-outcomes/:id
- `deleteCourseOutcome(req, res)` - DELETE /api/course-outcomes/:id
- `bulkCreateCourseOutcomes(req, res)` - POST /api/course-outcomes/bulk

#### 2.3 Create CO-PO Mapping Controller

**File: `/backend/src/controllers/coPoMapController.js`**

Key Functions:
- `getCoPoMappings(req, res)` - GET /api/co-po-maps?course_id=...&program_id=...
- `createOrUpdateMapping(req, res)` - POST /api/co-po-maps (upsert logic)
- `bulkUpdateMappings(req, res)` - POST /api/co-po-maps/bulk (for matrix update)
- `deleteMapping(req, res)` - DELETE /api/co-po-maps/:id
- `getCoPoMatrix(req, res)` - GET /api/co-po-maps/matrix?course_id=... (returns formatted matrix)

#### 2.4 Create Routes

**File: `/backend/src/routes/programOutcome.js`**
**File: `/backend/src/routes/courseOutcome.js`**
**File: `/backend/src/routes/coPoMap.js`**

Register in `/backend/src/server.js`:
```javascript
app.use('/api/program-outcomes', require('./routes/programOutcome'));
app.use('/api/course-outcomes', require('./routes/courseOutcome'));
app.use('/api/co-po-maps', require('./routes/coPoMap'));
```

---

### Phase 3: Update Existing Forms (Priority: HIGH)

#### 3.1 Update Program Form

**File: `/frontend/src/pages/academics/ProgramForm.jsx`**

Add PO Input Section:
```jsx
<div className="space-y-4">
  <h3>Program Outcomes (POs)</h3>
  {programOutcomes.map((po, index) => (
    <div key={index} className="flex gap-4">
      <input 
        placeholder={`PO${index + 1} Code`}
        value={po.po_code}
        onChange={(e) => updatePO(index, 'po_code', e.target.value)}
      />
      <textarea 
        placeholder="Description"
        value={po.description}
        onChange={(e) => updatePO(index, 'description', e.target.value)}
      />
      <button onClick={() => removePO(index)}>Remove</button>
    </div>
  ))}
  <button onClick={addPO}>+ Add PO</button>
</div>
```

Submission Logic:
1. Create/Update Program
2. If successful, bulk create/update POs via `/api/program-outcomes/bulk`

#### 3.2 Update Course Form

**File: `/frontend/src/pages/academics/CourseForm.jsx`**

Add CO Input Section:
```jsx
<div className="space-y-4">
  <h3>Course Outcomes (COs)</h3>
  {courseOutcomes.map((co, index) => (
    <div key={index} className="flex gap-4">
      <input 
        placeholder={`CO${index + 1} Code`}
        value={co.co_code}
        onChange={(e) => updateCO(index, 'co_code', e.target.value)}
      />
      <textarea 
        placeholder="Description"
        value={co.description}
        onChange={(e) => updateCO(index, 'description', e.target.value)}
      />
      <input 
        type="number"
        placeholder="Target Attainment %"
        value={co.target_attainment}
        onChange={(e) => updateCO(index, 'target_attainment', e.target.value)}
      />
      <button onClick={() => removeCO(index)}>Remove</button>
    </div>
  ))}
  <button onClick={addCO}>+ Add CO</button>
</div>
```

Similar submission logic as Programs.

---

### Phase 4: CO-PO Mapping Interface (Priority: MEDIUM)

#### 4.1 Create CO-PO Mapping Page

**File: `/frontend/src/pages/academics/CoPoMapping.jsx`**

**Features:**
1. **Filters:**
   - Department Dropdown
   - Program Dropdown (filtered by department)
   - Course Dropdown (filtered by program)

2. **Mapping Matrix:**
   - Rows: Course Outcomes (CO1, CO2, CO3...)
   - Columns: Program Outcomes (PO1, PO2, PO3...)
   - Cells: Weightage selector (0/1/2/3 or dropdowns)
   - Color coding: 
     - 0 = Gray (No mapping)
     - 1 = Light Yellow (Low)
     - 2 = Yellow (Medium)
     - 3 = Dark Yellow/Orange (High)

3. **Actions:**
   - Save All Mappings button
   - Auto-save on cell change (with debounce)
   - Export as CSV/PDF
   - View-only mode for non-admin users

**UI Structure:**
```jsx
<div>
  {/* Filters */}
  <div className="filters">
    <select>Department</select>
    <select>Program</select>
    <select>Course</select>
  </div>

  {/* Matrix */}
  <table className="co-po-matrix">
    <thead>
      <tr>
        <th>CO / PO</th>
        {programOutcomes.map(po => (
          <th key={po.id} title={po.description}>{po.po_code}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {courseOutcomes.map(co => (
        <tr key={co.id}>
          <td title={co.description}>{co.co_code}</td>
          {programOutcomes.map(po => (
            <td key={`${co.id}-${po.id}`}>
              <select 
                value={getWeightage(co.id, po.id)}
                onChange={(e) => updateMapping(co.id, po.id, e.target.value)}
                className={getColorClass(e.target.value)}
              >
                <option value="0">-</option>
                <option value="1">L</option>
                <option value="2">M</option>
                <option value="3">H</option>
              </select>
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>

  {/* Actions */}
  <button onClick={saveAllMappings}>Save Mappings</button>
</div>
```

#### 4.2 Add Navigation Link

**File: `/frontend/src/pages/academics/AcademicsManagement.jsx`**

Add new module:
```jsx
{
  title: "CO-PO Mapping",
  description: "Map Course Outcomes to Program Outcomes",
  icon: Network,
  path: "/academics/co-po-mapping",
  permission: "academics:co_po:manage"
}
```

---

### Phase 5: Redux State Management (Priority: MEDIUM)

#### 5.1 Create Redux Slices

**File: `/frontend/src/store/slices/programOutcomeSlice.js`**
- State: `programOutcomes`, `status`, `error`
- Actions: `fetchProgramOutcomes`, `createProgramOutcome`, `updateProgramOutcome`, `deleteProgramOutcome`

**File: `/frontend/src/store/slices/courseOutcomeSlice.js`**
- Similar to programOutcomeSlice

**File: `/frontend/src/store/slices/coPoMapSlice.js`**
- State: `mappings`, `matrix`, `status`, `error`
- Actions: `fetchCoPoMappings`, `updateMapping`, `bulkUpdateMappings`, `fetchCoPoMatrix`

#### 5.2 Register in Store

**File: `/frontend/src/store/index.js`**
```javascript
import programOutcomeReducer from './slices/programOutcomeSlice';
import courseOutcomeReducer from './slices/courseOutcomeSlice';
import coPoMapReducer from './slices/coPoMapSlice';

// Add to reducers
programOutcomes: programOutcomeReducer,
courseOutcomes: courseOutcomeReducer,
coPoMaps: coPoMapReducer,
```

---

### Phase 6: Permissions & Access Control (Priority: LOW)

#### 6.1 Define Permissions

Add to permission system:
```javascript
'academics:program_outcomes:view'
'academics:program_outcomes:manage'
'academics:course_outcomes:view'
'academics:course_outcomes:manage'
'academics:co_po:view'
'academics:co_po:manage'
```

#### 6.2 Apply Middleware

Protect routes in backend controllers:
```javascript
router.get('/', requirePermission('academics:program_outcomes:view'), getAllProgramOutcomes);
router.post('/', requirePermission('academics:program_outcomes:manage'), createProgramOutcome);
```

---

### Phase 7: Testing & Validation (Priority: LOW)

#### 7.1 Backend Tests
- Test CRUD operations for POs, COs
- Test CO-PO mapping creation/updates
- Test cascade deletes (when Program/Course is deleted)
- Validate weightage constraints (0-3)

#### 7.2 Frontend Tests
- Test form submission with POs/COs
- Test matrix rendering and updates
- Test filter interactions
- Test permission-based visibility

---

## Data Flow Example

### Creating a Program with POs:
1. User fills Program Form with basic info + POs
2. Frontend submits to `POST /api/programs` (creates program)
3. On success, frontend submits to `POST /api/program-outcomes/bulk` with `program_id` and PO array
4. Backend creates all POs in transaction
5. Success toast shown

### Creating a Course with COs:
1. User fills Course Form with basic info + COs
2. Similar flow as Program

### Mapping COs to POs:
1. User selects Department → Program → Course
2. Frontend fetches:
   - `GET /api/course-outcomes?course_id={courseId}`
   - `GET /api/program-outcomes?program_id={programId}`
   - `GET /api/co-po-maps?course_id={courseId}&program_id={programId}`
3. Renders matrix
4. User updates cell weightage
5. Frontend calls `POST /api/co-po-maps` (upsert logic)
6. On "Save All", calls `POST /api/co-po-maps/bulk` with entire matrix

---

## Expected Outcomes

1. ✅ Programs can have multiple POs defined during creation/editing
2. ✅ Courses can have multiple COs defined during creation/editing
3. ✅ Dedicated CO-PO Mapping page with interactive matrix
4. ✅ Visual representation of mapping strength (0/1/2/3)
5. ✅ Ability to export mappings for accreditation purposes
6. ✅ Proper cascade handling (delete course → delete COs → delete mappings)

---

## Accreditation Use Cases

This implementation supports:
- **NBA (National Board of Accreditation)** requirements for Indian institutions
- **NAAC (National Assessment and Accreditation Council)** documentation
- **ABET (Accreditation Board for Engineering and Technology)** for international programs
- **OBE (Outcome-Based Education)** framework implementation

---

## Next Steps After Plan Approval

1. Create backend models (1-2 hours)
2. Create controllers and routes (2-3 hours)
3. Update Program and Course forms (2 hours)
4. Build CO-PO Mapping interface (3-4 hours)
5. Add Redux integration (1-2 hours)
6. Testing and refinement (2 hours)

**Total Estimated Time: 11-15 hours**
