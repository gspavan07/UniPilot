# Document Templates

This folder contains all document generation templates (PDF, Excel, CSV) used throughout the UniPilot system.

## Purpose

Templates are separated from business logic to enable easy customization for different colleges without modifying core application code.

## Structure

```
templates/
├── config/
│   └── templateConfig.js      # Central configuration for all templates
├── exam/
│   ├── hallTicketPdf.js       # Hall Ticket PDF generator
│   ├── examReceiptPdf.js      # Exam Payment Receipt PDF
│   ├── marksImportTemplate.js # Marks Import Excel template
│   ├── courseResultsExcel.js  # Course Results Excel export
│   └── departmentResultsExcel.js # Department Results Excel export
├── admission/
│   └── admissionLetterPdf.js  # Admission Letter PDF generator
├── hr/
│   ├── payslipPdf.js          # Payslip PDF generator
│   └── bankTransferCsv.js     # Bank Transfer CSV export
└── fee/
    └── defaultersCsv.js       # Fee Defaulters CSV export
```

## Customization Guide

### For College-Specific Deployments

1. **Update Configuration** (`config/templateConfig.js`):
   - Set university name, address, contact details
   - Modify color schemes
   - Adjust fonts and sizes
   - Customize headers and footers

2. **Modify Templates** (individual template files):
   - Adjust layouts
   - Add/remove sections
   - Change data formatting
   - Customize calculations

3. **Add College Logo**:
   - Place logo file in a secure location
   - Update `UNIVERSITY_LOGO_PATH` in environment variables
   - Logo will appear on PDFs automatically

### Environment Variables

Add these to your `.env` file for college-specific branding:

```env
UNIVERSITY_NAME="Your College Name"
UNIVERSITY_SHORT_NAME="YCN"
UNIVERSITY_ADDRESS="College Address"
UNIVERSITY_PHONE="+91-XXXXXXXXXX"
UNIVERSITY_EMAIL="info@yourcollege.edu"
UNIVERSITY_WEBSITE="www.yourcollege.edu"
UNIVERSITY_LOGO_PATH="/path/to/logo.png"
```

## How Templates Work

Each template module exports a function that:

1. Accepts data from the controller
2. Generates the document (PDF/Excel/CSV)
3. Returns a stream or buffer

**Example:**

```javascript
// In controller
const generateHallTicketPdf = require('../templates/exam/hallTicketPdf');

// Generate PDF
const stream = res;
await generateHallTicketPdf(registration, stream);
```

## Testing Templates

After making changes:

1. **Test PDF Generation**:

   ```bash
   # Download a sample document from the UI
   # Verify layout, branding, and content
   ```

2. **Test Excel Exports**:

   ```bash
   # Export data from the UI
   # Open in Excel/LibreOffice and verify formatting
   ```

3. **Test CSV Exports**:

   ```bash
   # Export CSV from the UI
   # Open in spreadsheet software and verify data
   ```

## Common Customization Scenarios

### Change University Name on All Documents

- Edit `university.name` in `config/templateConfig.js`

### Change Color Scheme

- Edit `pdf.colors` in `config/templateConfig.js`

### Modify Hall Ticket Layout

- Edit `exam/hallTicketPdf.js`
- Adjust photo placement, table layouts, instructions

### Add Custom Fields to Payslip

- Edit `hr/payslipPdf.js`
- Add new rows to the earnings/deductions table

### Change Excel Column Order

- Edit relevant template (e.g., `exam/courseResultsExcel.js`)
- Modify the data mapping array

## Best Practices

1. **Never hardcode college-specific data** in template files
2. **Use configuration** from `templateConfig.js` for all branding
3. **Test thoroughly** after any changes
4. **Document custom changes** in comments
5. **Keep backups** before major modifications

## Support

For template customization support:

- Email: <info@unipilot.com>
- Documentation: [UniPilot Docs](https://docs.unipilot.com)

---

**Note**: These templates are designed for easy customization. You can modify layouts, colors, and content without affecting the core application logic.
