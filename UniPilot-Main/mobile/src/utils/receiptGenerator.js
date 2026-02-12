import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';
import {
  Platform,
  Alert,
  ToastAndroid,
  PermissionsAndroid,
} from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';

/**
 * saveToDownloads - Saves PDF file to Android Downloads folder
 * @param {string} sourcePath - Path to the generated PDF file
 * @param {string} filename - Desired filename for the downloaded file
 * @returns {Promise<string>} - Path to the saved file
 */
const saveToDownloads = async (sourcePath, filename) => {
  try {
    console.log('=== Starting Download Process ===');
    console.log('Source path:', sourcePath);
    console.log('Filename:', filename);

    // Check if source file exists
    const exists = await ReactNativeBlobUtil.fs.exists(sourcePath);
    console.log('Source file exists:', exists);

    if (!exists) {
      throw new Error('Source file does not exist');
    }

    // For Android 10+, use MediaCollection API for scoped storage
    if (Platform.OS === 'android') {
      // Use the MediaCollection API to save to Downloads
      const savedPath =
        await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
          {
            name: filename,
            parentFolder: '', // Empty means root of Downloads
            mimeType: 'application/pdf',
          },
          'Download', // Use 'Download' collection
          sourcePath,
        );

      console.log('File saved via MediaCollection:', savedPath);
      return savedPath;
    }

    // Fallback for older Android or testing
    const downloadDir = ReactNativeBlobUtil.fs.dirs.DownloadDir;
    const destPath = `${downloadDir}/${filename}`;
    await ReactNativeBlobUtil.fs.cp(sourcePath, destPath);
    console.log('File copied to:', destPath);
    return destPath;
  } catch (error) {
    console.error('Error in saveToDownloads:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
};

/**
 * generateReceiptPDF - Generates a PDF receipt and triggers sharing/saving
 *
 * @param {Object} transaction - The main transaction record
 * @param {Array} items - List of payment items (for batch processing)
 */
export const generateReceiptPDF = async (transaction, items = []) => {
  console.log(
    'Generating Receipt with data:',
    JSON.stringify(transaction, null, 2),
  );
  if (!transaction && items.length === 0) {
    Alert.alert('Error', 'No transaction data available to generate receipt.');
    return;
  }

  try {
    // Use the first record or the main transaction for header info
    const mainData = items.length > 0 ? items[0] : transaction;

    // Handle different transaction structures (master vs existing receipt)
    const transaction_id =
      mainData.transaction_id ||
      mainData.transactionId ||
      mainData.number ||
      transaction.transactionId ||
      'N/A';
    const student = mainData.student || mainData.Student || {};
    const payment_date =
      mainData.payment_date ||
      mainData.createdAt ||
      mainData.date ||
      new Date();
    const payment_method =
      mainData.payment_method ||
      mainData.paymentMethod ||
      mainData.method ||
      'N/A';

    console.log('Extracted Data:', {
      transaction_id,
      student,
      payment_date,
      payment_method,
    });

    const dateStr = new Date(payment_date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const timeStr = new Date(payment_date).toLocaleTimeString('en-IN');

    // Handle student data (might be student or Student or top-level fields)
    const getStudentName = s => {
      if (!s) return 'Unknown';
      if (s.first_name) return `${s.first_name} ${s.last_name || ''}`.trim();
      return s.name || s.full_name || 'Unknown';
    };

    const studentName = getStudentName(student);
    const studentId =
      student.admission_number ||
      student.student_id ||
      student.registration_no ||
      student.registration_number ||
      mainData.admission_number ||
      'N/A';
    const departmentName =
      student.department?.name || student.Department?.name || 'N/A';
    const programName = student.program?.name || student.Program?.name || 'N/A';

    // Calculate totals and items list
    // If it's a single receipt from ledger, it might not have 'details'
    const receiptItems =
      items.length > 0
        ? items
        : mainData.details && mainData.details.length > 0
        ? mainData.details
        : [mainData];

    console.log(`Processing ${receiptItems.length} items for receipt`);

    const totalAmount = receiptItems.reduce((sum, item) => {
      const amt = item.amount_paid || item.amount || item.paid_amount || 0;
      return sum + parseFloat(amt);
    }, 0);
    const totalAmountStr = totalAmount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica', Arial, sans-serif; padding: 20px; color: #333; line-height: 1.4; }
          .receipt-container { max-width: 100%; border: 1px solid #333; padding: 20px; }
          .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 15px; margin-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #1e1b4b; margin-bottom: 5px; }
          .sub-header { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
          
          .info-grid { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .info-column { flex: 1; }
          .info-group label { display: block; font-size: 9px; font-weight: bold; text-transform: uppercase; color: #888; margin-bottom: 2px; }
          .info-group div { font-size: 12px; font-weight: 600; }

          .section-title { margin: 15px 0 10px 0; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #eee; padding-bottom: 3px; color: #666; }
          .student-details { background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; }
          .student-grid { display: flex; flex-wrap: wrap; }
          .student-item { width: 50%; margin-bottom: 10px; }
          
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          .items-table th { text-align: left; font-size: 9px; text-transform: uppercase; color: #888; padding: 10px 5px; border-bottom: 1px solid #eee; }
          .items-table td { padding: 10px 5px; border-bottom: 1px solid #eee; font-size: 11px; }
          .amount-col { text-align: right; }
          
          .total-section { margin-top: 15px; border-top: 2px solid #333; padding-top: 10px; }
          .total-row { display: flex; justify-content: space-between; align-items: center; font-size: 16px; font-weight: bold; }
          
          .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
          .signature { text-align: center; }
          .signature-line { width: 150px; border-bottom: 1px solid #000; margin-bottom: 5px; }
          .footer-text { font-size: 9px; color: #888; flex: 1; margin-right: 20px; }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <div class="logo">UniPilot University</div>
            <div class="sub-header">Official Payment Receipt</div>
          </div>

          <div class="info-grid">
            <div class="info-column">
              <div class="info-group" style="margin-bottom: 10px">
                <label>Transaction ID</label>
                <div style="font-family: monospace; font-size: 14px;">${transaction_id}</div>
              </div>
              <div class="info-group">
                <label>Payment Date</label>
                <div>${dateStr} <span style="font-weight: normal; font-size: 10px; color: #666">at ${timeStr}</span></div>
              </div>
            </div>
            <div class="info-column" style="text-align: right">
              <div class="info-group" style="margin-bottom: 10px">
                <label>Mode of Payment</label>
                <div style="text-transform: capitalize">${
                  payment_method ? payment_method.replace('_', ' ') : 'N/A'
                }</div>
              </div>
              <div class="info-group">
                <label>Status</label>
                <div style="color: #16a34a">SUCCESSFUL</div>
              </div>
            </div>
          </div>

          <div class="student-details">
            <h3 class="section-title">Student Information</h3>
            <div class="student-grid">
              <div class="student-item">
                <div class="info-group">
                  <label>Name</label>
                  <div>${studentName}</div>
                </div>
              </div>
              <div class="student-item">
                <div class="info-group">
                  <label>Reg Number</label>
                  <div>${studentId}</div>
                </div>
              </div>
              <div class="student-item">
                <div class="info-group">
                  <label>Program</label>
                  <div>${programName}</div>
                </div>
              </div>
              <div class="student-item">
                <div class="info-group">
                  <label>Department</label>
                  <div>${departmentName}</div>
                </div>
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
                  item => `
                <tr>
                  <td>
                    <div style="font-weight: bold">${
                      item.category ||
                      item.fee_structure?.category?.name ||
                      item.student_fee_charge?.category?.name ||
                      (item.semester && !item.fee_structure_id
                        ? 'Late Payment Fine'
                        : 'Academic Fee')
                    }</div>
                  </td>
                  <td style="text-align: center; color: #666;">
                    SEM ${
                      item.semester || item.fee_structure?.semester || 'N/A'
                    }
                  </td>
                  <td class="amount-col" style="font-weight: bold">
                    ${parseFloat(
                      item.amount_paid || item.amount || 0,
                    ).toLocaleString('en-IN', {
                      style: 'currency',
                      currency: 'INR',
                    })}
                  </td>
                </tr>
              `,
                )
                .join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <div>Grand Total</div>
              <div>${totalAmountStr}</div>
            </div>
          </div>

          <div class="footer">
            <div class="footer-text">
              For support contact: accounts@unipilot.edu<br>
              This is a computer-generated document.
            </div>
            <div class="signature">
              <div class="signature-line"></div>
              <div style="font-size: 10px; font-weight: bold;">Authorized Signatory</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // On Android, 'Documents' directory can cause permission issues with scoped storage.
    // Removing 'directory' and 'base64' lets it save to the app's internal cache, which is always accessible/shareable.
    const options = {
      html: htmlContent,
      fileName: `Receipt_${transaction_id.replace(/\W/g, '_')}`,
    };

    const file = await RNHTMLtoPDF.convert(options);
    console.log('Generated PDF File:', JSON.stringify(file, null, 2));

    // Comprehensive validation
    if (!file || !file.filePath || file.filePath.trim() === '') {
      throw new Error(
        'PDF file generation failed - no valid file path returned',
      );
    }

    const filePath = file.filePath.trim();
    console.log('Validated file path:', filePath);

    // Platform-specific behavior
    if (Platform.OS === 'android') {
      // Android: Save directly to Downloads folder
      const filename = `Receipt_${transaction_id.replace(/\W/g, '_')}.pdf`;

      try {
        const downloadPath = await saveToDownloads(filePath, filename);

        // Show success toast
        ToastAndroid.show(
          `Receipt saved to Downloads/${filename}`,
          ToastAndroid.LONG,
        );

        console.log('Receipt successfully saved to:', downloadPath);
      } catch (error) {
        console.error('Failed to save to Downloads:', error);
        console.error('Error message:', error.message);
        Alert.alert(
          'Download Failed',
          `Could not save receipt: ${
            error.message || 'Unknown error'
          }. Check console logs for details.`,
        );
      }
    } else {
      // iOS: Use share dialog with preview
      const shareOptions = {
        url: filePath.startsWith('file://') ? filePath : `file://${filePath}`,
        type: 'application/pdf',
        title: 'Payment Receipt',
        message: `Receipt for Transaction ${transaction_id}`,
        subject: `Receipt for Transaction ${transaction_id}`,
        failOnCancel: false,
      };

      console.log('Share options:', JSON.stringify(shareOptions, null, 2));

      await Share.open(shareOptions);
    }
  } catch (error) {
    console.error('Error generating receipt:', error);
    Alert.alert('Error', 'Failed to generate receipt. Please try again.');
  }
};
