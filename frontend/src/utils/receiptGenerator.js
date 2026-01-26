export const printReceipt = (transaction, items = []) => {
  if (!transaction && items.length === 0) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert("Please allow popups to print receipts");
    return;
  }

  // Use the first record or the main transaction for header info
  const mainData = items.length > 0 ? items[0] : transaction;
  const {
    transaction_id,
    student,
    payment_date,
    payment_method,
    amount_paid,
    fee_structure,
    semester,
    remarks,
  } = mainData;

  const dateStr = new Date(payment_date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const timeStr = new Date(payment_date).toLocaleTimeString("en-IN");

  const studentName = student?.first_name
    ? `${student.first_name} ${student.last_name}`
    : student?.name || "Unknown";

  const studentId =
    student?.admission_number ||
    student?.student_id ||
    student?.registration_no ||
    "N/A";
  const department = student?.department?.name || "N/A";
  const program = student?.program?.name || "N/A";

  // Calculate totals and items list
  const receiptItems = items.length > 0 ? items : [transaction];
  const totalAmount = receiptItems.reduce(
    (sum, item) => sum + parseFloat(item.amount_paid || 0),
    0,
  );
  const totalAmountStr = totalAmount.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt #${transaction_id}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; line-height: 1.5; }
        .receipt-container { max-width: 800px; margin: 0 auto; border: 2px solid #333; padding: 30px; }
        .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; margin-bottom: 5px; color: #1e1b4b; }
        .sub-header { font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 2px; }
        
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
        .info-group label { display: block; font-size: 10px; font-weight: bold; text-transform: uppercase; color: #888; margin-bottom: 4px; }
        .info-group div { font-size: 14px; font-weight: 600; }

        .section-title { margin: 0 0 15px 0; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 5px; color: #666; }
        .student-details { background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 30px; border: 1px solid #e2e8f0; }
        
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { text-align: left; font-size: 10px; text-transform: uppercase; color: #888; padding: 12px 8px; border-bottom: 2px solid #eee; }
        .items-table td { padding: 12px 8px; border-bottom: 1px solid #eee; font-size: 13px; }
        .items-table .amount-col { text-align: right; width: 120px; }
        
        .total-section { margin-top: 20px; border-top: 2px solid #333; padding-top: 15px; }
        .total-row { display: flex; justify-content: space-between; align-items: center; font-size: 18px; font-weight: bold; }
        
        .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
        .signature { text-align: center; }
        .signature-line { width: 200px; border-bottom: 1px solid #000; margin-bottom: 8px; }
        .footer-text { font-size: 10px; color: #888; }
        
        @media print {
          body { padding: 0; }
          .receipt-container { border: none; }
          .logo { color: #000; }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <div class="logo">UniPilot University</div>
          <div class="sub-header">Official Payment Receipt</div>
        </div>

        <div class="info-grid">
          <div>
            <div class="info-group" style="margin-bottom: 15px">
              <label>Transaction ID</label>
              <div style="font-family: monospace; font-size: 16px;">${transaction_id}</div>
            </div>
            <div class="info-group">
              <label>Payment Date</label>
              <div>${dateStr} <span style="font-weight: normal; font-size: 12px; color: #666">at ${timeStr}</span></div>
            </div>
          </div>
          <div style="text-align: right">
            <div class="info-group" style="margin-bottom: 15px">
              <label>Mode of Payment</label>
              <div style="text-transform: capitalize">${payment_method.replace("_", " ")}</div>
            </div>
            <div class="info-group">
              <label>Status</label>
              <div style="color: #16a34a">SUCCESSFUL</div>
            </div>
          </div>
        </div>

        <div class="student-details">
          <h3 class="section-title">Student Information</h3>
          <div class="info-grid" style="margin-bottom: 0; gap: 15px">
            <div class="info-group">
              <label>Name</label>
              <div>${studentName}</div>
            </div>
            <div class="info-group">
              <label>Reg Number</label>
              <div>${studentId}</div>
            </div>
            <div class="info-group">
              <label>Program</label>
              <div>${program}</div>
            </div>
            <div class="info-group">
              <label>Department</label>
              <div>${department}</div>
            </div>
          </div>
        </div>

        <h3 class="section-title">Payment Breakdown</h3>
        <table class="items-table">
          <thead>
            <tr>
              <th>Fee Description</th>
              <th style="text-align: center">Semester</th>
              <th class="amount-col">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${receiptItems
              .map(
                (item) => `
              <tr>
                <td>
                  <div style="font-weight: bold">${item.fee_structure?.category?.name || (item.semester && !item.fee_structure_id ? "Late Payment Fine" : "Ad-hoc Payment")}</div>
                  <div style="font-size: 10px; color: #666; margin-top: 2px;">${item.remarks || "Regular collection"}</div>
                </td>
                <td style="text-align: center; color: #666;">
                  SEM ${item.semester || item.fee_structure?.semester || "N/A"}
                </td>
                <td class="amount-col" style="font-weight: bold">
                  ${parseFloat(item.amount_paid).toLocaleString("en-IN", { style: "currency", currency: "INR" })}
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <div>Grand Total</div>
            <div>${totalAmountStr}</div>
          </div>
          <div style="font-size: 10px; color: #666; margin-top: 5px; text-align: right; text-transform: uppercase;">
            Amount in words: ${totalAmount > 0 ? "Rupees Paid" : ""} 
          </div>
        </div>

        <div class="footer">
          <div class="footer-text">
            For support contact: accounts@unipilot.edu<br>
            This is a computer-generated document and does not require a physical signature.
          </div>
          <div class="signature">
            <div class="signature-line"></div>
            <div style="font-size: 12px; font-weight: bold;">Authorized Signatory</div>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
