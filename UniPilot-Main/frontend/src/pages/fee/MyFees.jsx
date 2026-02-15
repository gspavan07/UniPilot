import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CreditCard,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Percent,
  Wallet,
} from "lucide-react";
import {
  fetchMyFeeStatus,
  createFeePayment,
  studentPayFees,
  createPaymentOrder,
} from "../../store/slices/feeSlice";
import { printReceipt } from "../../utils/receiptGenerator";
import { toast } from "react-hot-toast";

const MyFees = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { myStatus, status } = useSelector((state) => state.fee);

  // Student State
  const [selectedFees, setSelectedFees] = useState(new Set());
  const [customAmounts, setCustomAmounts] = useState({});
  const [activeSemester, setActiveSemester] = useState(null);

  useEffect(() => {
    dispatch(fetchMyFeeStatus());
  }, [dispatch]);

  // Set default active semester (first one with data)
  useEffect(() => {
    if (myStatus?.semesterWise && !activeSemester) {
      const semesters = Object.keys(myStatus.semesterWise);
      if (semesters.length > 0) {
        setActiveSemester(semesters[0]);
      }
    }
  }, [myStatus, activeSemester]);

  const toggleFeeSelection = (feeId, fullDue) => {
    const next = new Set(selectedFees);
    if (next.has(feeId)) {
      next.delete(feeId);
      // Optional: Clean up custom amount
      const newAmounts = { ...customAmounts };
      delete newAmounts[feeId];
      setCustomAmounts(newAmounts);
    } else {
      next.add(feeId);
      // Initialize with full due amount
      setCustomAmounts((prev) => ({ ...prev, [feeId]: fullDue }));
    }
    setSelectedFees(next);
  };

  const handleAmountChange = (feeId, val, maxLimit) => {
    const amount = parseFloat(val) || 0;
    if (amount < 0) return;
    if (amount > maxLimit) return;

    setCustomAmounts((prev) => ({ ...prev, [feeId]: amount }));
  };

  const calculateSelectedTotal = () => {
    let total = 0;
    selectedFees.forEach((feeId) => {
      total += customAmounts[feeId] || 0;
    });
    return total;
  };

  const handleBulkPayment = async () => {
    const total = calculateSelectedTotal();
    if (total <= 0) return;

    const walletCredit = grandTotals?.excessBalance || 0;
    const appliedWallet = Math.min(total, walletCredit);
    const netPayable = total - appliedWallet;

    // Build detailed fee breakdown
    const feeDetails = [];
    const chargeDetails = [];
    const fineDetails = [];

    selectedFees.forEach((feeId) => {
      const amount = customAmounts[feeId] || 0;
      if (amount <= 0) return;

      // Check if it's a fine
      if (feeId.toString().startsWith("fine:")) {
        const sem = feeId.split(":")[1];
        fineDetails.push({
          semester: parseInt(sem),
          amount: amount,
        });
      } else {
        // Find the fee object in all semesters
        Object.entries(semesterWise).forEach(([sem, semData]) => {
          const feeObj = semData.fees.find((f) => f.id === feeId);
          if (feeObj) {
            if (feeObj.is_charge) {
              chargeDetails.push({
                category: feeObj.category,
                semester: parseInt(sem),
                amount: amount,
                description: feeObj.description,
              });
            } else {
              feeDetails.push({
                category: feeObj.category,
                semester: parseInt(sem),
                amount: amount,
              });
            }
          }
        });
      }
    });

    // Build enhanced confirmation message
    let confirmMsg = `=== PAYMENT SUMMARY ===\n\n`;

    if (feeDetails.length > 0) {
      confirmMsg += `📚 Academic Fees:\n`;
      feeDetails.forEach((fee) => {
        confirmMsg += `  • ${fee.category} (Sem ${fee.semester}): ₹${fee.amount.toLocaleString("en-IN")}\n`;
      });
      confirmMsg += `\n`;
    }

    if (chargeDetails.length > 0) {
      confirmMsg += `💳 Charges:\n`;
      chargeDetails.forEach((charge) => {
        confirmMsg += `  • ${charge.category} (Sem ${charge.semester}): ₹${charge.amount.toLocaleString("en-IN")}\n`;
      });
      confirmMsg += `\n`;
    }

    if (fineDetails.length > 0) {
      confirmMsg += `⚠️ Late Payment Fines:\n`;
      fineDetails.forEach((fine) => {
        confirmMsg += `  • Semester ${fine.semester}: ₹${fine.amount.toLocaleString("en-IN")}\n`;
      });
      confirmMsg += `\n`;
    }

    confirmMsg += `━━━━━━━━━━━━━━━━━━━━\n`;
    confirmMsg += `Total Amount: ₹${total.toLocaleString("en-IN")}\n`;

    if (appliedWallet > 0) {
      confirmMsg += `Using Wallet Credit: -₹${appliedWallet.toLocaleString("en-IN")}\n`;
      if (netPayable > 0) {
        confirmMsg += `Net Payment Required: ₹${netPayable.toLocaleString("en-IN")}\n`;
      } else {
        confirmMsg += `\n✅ Your Wallet covers the entire fee! No external payment needed.`;
      }
    }

    confirmMsg += `\n\nProceed with payment?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      const paymentBatch = [];

      selectedFees.forEach((feeId) => {
        const amount = customAmounts[feeId];
        if (amount > 0) {
          // Check if it's a fine (starts with "fine:")
          if (feeId.toString().startsWith("fine:")) {
            const sem = feeId.split(":")[1];
            paymentBatch.push({
              type: "fine",
              semester: parseInt(sem),
              amount: amount,
            });
          } else {
            // Find the fee object to determine if it's a charge or structure
            let feeType = "structure";
            let found = false;

            // Search in all semesters
            Object.entries(semesterWise).forEach(([sem, semData]) => {
              if (found) return;
              const feeObj = semData.fees.find((f) => f.id === feeId);
              if (feeObj) {
                if (feeObj.is_charge) feeType = "charge";
                found = true;
                paymentBatch.push({
                  type: feeType,
                  structure_id: feeId,
                  semester: parseInt(sem),
                  amount: amount,
                });
              }
            });
          }
        }
      });

      if (netPayable > 0) {
        // Load Razorpay Script
        const res = await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

        if (!res) {
          toast.error("Razorpay SDK failed to load. Are you online?");
          return;
        }

        // Create Order
        const orderRes = await dispatch(
          createPaymentOrder({ amount: netPayable }),
        ).unwrap();

        // Build description and notes for Razorpay
        let description = "Student Fee Payment";
        if (feeDetails.length > 0) {
          const categories = feeDetails.map((f) => f.category).join(", ");
          description =
            categories.length > 50
              ? `Academic Fees - ${categories.substring(0, 47)}...`
              : `Academic Fees - ${categories}`;
        }

        const allSemesters = [
          ...new Set([
            ...feeDetails.map((f) => f.semester),
            ...chargeDetails.map((c) => c.semester),
            ...fineDetails.map((f) => f.semester),
          ]),
        ];

        const options = {
          key: orderRes.key_id,
          amount: orderRes.data.amount,
          currency: orderRes.data.currency,
          name: "UniPilot University",
          description: description,
          image: "https://your-logo-url.com/logo.png", // Valid logo url
          order_id: orderRes.data.id,
          handler: async function (response) {
            try {
              // Verify Payment
              await dispatch(
                studentPayFees({
                  payments: paymentBatch,
                  payment_method: "razorpay", // Explicit method
                  transaction_id: response.razorpay_payment_id,
                  remarks: "Online Razorpay Payment",
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              ).unwrap();

              setSelectedFees(new Set());
              dispatch(fetchMyFeeStatus());
              toast.success("Payment Successful!");
            } catch (err) {
              toast.error("Payment Verification Failed: " + err);
            }
          },
          prefill: {
            name: user.first_name + " " + user.last_name,
            email: user.email,
            contact: user.phone_number,
          },
          notes: {
            student_id: user.student_id || user.id,
            admission_number: user.admission_number || "N/A",
            student_name: `${user.first_name} ${user.last_name}`,
            payment_type:
              feeDetails.length > 0 ? "academic_fees" : "fee_payment",
            fee_categories:
              feeDetails.map((f) => f.category).join(", ") || "N/A",
            semesters: allSemesters.join(", ") || "N/A",
            total_items: selectedFees.size,
            wallet_credit_used:
              appliedWallet > 0 ? `₹${appliedWallet}` : "None",
          },
          theme: {
            color: "#4f46e5",
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      } else {
        // Full Wallet Payment
        await dispatch(
          studentPayFees({
            payments: paymentBatch,
            payment_method: "wallet",
            transaction_id: `WAL-${Date.now()}`,
            remarks: "Paid via Wallet",
          }),
        ).unwrap();

        setSelectedFees(new Set());
        dispatch(fetchMyFeeStatus());
        toast.success("Payment Successful!");
      }
    } catch (err) {
      toast.error("Payment initiation failed: " + err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    })
      .format(amount)
      .replace("₹", "₹ ");
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  const {
    semesterWise = {},
    grandTotals = {},
    studentInfo = {},
  } = myStatus || {};
  const selectedTotal = calculateSelectedTotal();

  const handlePrintReceipt = (feeStructure, receipt, semester) => {
    printReceipt({
      transaction_id: receipt.number,
      student: studentInfo,
      amount_paid: receipt.amount || 0,
      payment_date: receipt.date,
      payment_method: receipt.method || "online",
      fee_structure: {
        category: { name: feeStructure.category },
      },
      semester: semester,
      remarks: "Student Portal Download",
    });
  };

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto p-4 md:p-8">
      {/* Student Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-indigo-600" />
            My Fee Ledger
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Batch {studentInfo?.batch_year || "N/A"} •{" "}
            {studentInfo?.admission_type
              ? studentInfo.admission_type.charAt(0).toUpperCase() +
                studentInfo.admission_type.slice(1)
              : "N/A"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all">
            <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-indigo-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-xs font-black uppercase tracking-widest">
              Total Payable
            </span>
            <FileText className="w-5 h-5 text-indigo-200" />
          </div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-white">
            {formatCurrency(grandTotals?.payable || 0)}
          </h3>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-xs font-black uppercase tracking-widest">
              Paid to Date
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          </div>
          <h3 className="text-2xl font-black text-emerald-600">
            {formatCurrency(grandTotals?.paid || 0)}
          </h3>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-500 text-xs font-black uppercase tracking-widest">
              Outstanding Due
            </span>
            <AlertCircle className="w-5 h-5 text-red-200" />
          </div>
          <h3 className="text-2xl font-black text-red-600">
            {formatCurrency(grandTotals?.due || 0)}
          </h3>
        </div>

        {grandTotals?.excessBalance > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-amber-500 animate-in zoom-in duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs font-black uppercase tracking-widest">
                Wallet / Credit Balance
              </span>
              <Wallet className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-2xl font-black text-amber-600">
              {formatCurrency(grandTotals?.excessBalance || 0)}
            </h3>
            <p className="text-[9px] font-bold text-amber-500/80 mt-1 uppercase tracking-tight">
              Overage will be adjusted in next sem
            </p>
          </div>
        )}

        {grandTotals?.waiver > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 border-l-4 border-l-indigo-500 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs font-black uppercase tracking-widest">
                Scholarships / Waivers
              </span>
              <Percent className="w-5 h-5 text-indigo-200" />
            </div>
            <h3 className="text-2xl font-black text-indigo-600">
              {formatCurrency(grandTotals?.waiver || 0)}
            </h3>
          </div>
        )}
      </div>

      {/* Semester Deadlines Tracker (Clutter-free) */}
      {Object.values(semesterWise).some((d) => d.fine.deadline) && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Payment Deadlines Timeline
          </h4>
          <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-hide">
            {Object.entries(semesterWise)
              .filter(([_, d]) => d.fine.deadline)
              .map(([sem, d]) => {
                const label = [
                  "I",
                  "II",
                  "III",
                  "IV",
                  "V",
                  "VI",
                  "VII",
                  "VIII",
                ][parseInt(sem) - 1];
                const isPaid = d.totals.due <= 0;
                return (
                  <div
                    key={sem}
                    className={`min-w-[180px] p-3 rounded-xl border-l-4 transition-all ${
                      isPaid
                        ? "bg-emerald-50/30 border-emerald-500"
                        : d.fine.isOverdue
                          ? "bg-red-50/30 border-red-500"
                          : "bg-amber-50/30 border-amber-500"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-black text-gray-500">
                        {label} SEM
                      </span>
                      {isPaid && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      )}
                    </div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">
                      {formatDate(d.fine.deadline)}
                    </div>
                    <div
                      className={`text-[10px] font-black mt-1 uppercase ${
                        isPaid
                          ? "text-emerald-600"
                          : d.fine.isOverdue
                            ? "text-red-600"
                            : "text-amber-600"
                      }`}
                    >
                      {isPaid
                        ? "Cleared"
                        : d.fine.isOverdue
                          ? "Overdue"
                          : "Pending"}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Semester Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide border-b border-gray-100 dark:border-gray-700">
        {Object.keys(semesterWise).map((sem) => {
          const isActive = activeSemester === sem;
          const getSemesterLabel = (num) =>
            ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"][num - 1] +
            " Semester";

          return (
            <button
              key={sem}
              onClick={() => setActiveSemester(sem)}
              className={`px-5 py-3 rounded-t-xl font-bold text-sm whitespace-nowrap transition-all ${
                isActive
                  ? "bg-white dark:bg-gray-800 text-indigo-600 border-b-2 border-indigo-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              }`}
            >
              {getSemesterLabel(sem)}
            </button>
          );
        })}
      </div>

      {/* Active Semester Ledger Table */}
      {activeSemester && semesterWise[activeSemester] && (
        <div className="bg-white dark:bg-gray-800 rounded-b-2xl rounded-tr-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-900/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <th className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                    Select
                  </th>
                  <th className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                    Fee Category
                  </th>
                  <th className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 text-right">
                    Payable (₹)
                  </th>
                  <th className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 text-right">
                    Paid (₹)
                  </th>
                  <th className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 text-right">
                    Waiver (₹)
                  </th>
                  <th className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 text-right w-48">
                    Amount to Pay
                  </th>
                  <th className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                    Due Info
                  </th>
                  <th className="px-6 py-5 border-b border-gray-100 dark:border-gray-700 text-right">
                    Due (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {semesterWise[activeSemester].fees.map((fee) => (
                  <tr
                    key={fee.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${selectedFees.has(fee.id) ? "bg-indigo-50/20 dark:bg-indigo-900/10" : ""}`}
                  >
                    <td className="px-6 py-4">
                      {fee.due > 0 && (
                        <input
                          type="checkbox"
                          checked={selectedFees.has(fee.id)}
                          onChange={() => toggleFeeSelection(fee.id, fee.due)}
                          className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">
                        {fee.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-gray-900 dark:text-white">
                      {fee.payable.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-emerald-600">
                      {fee.paid > 0 ? fee.paid.toLocaleString("en-IN") : "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-indigo-600">
                      {fee.waiver > 0 ? (
                        <div className="flex flex-col items-end">
                          <span>{fee.waiver.toLocaleString("en-IN")}</span>
                          <span className="text-[8px] font-black uppercase text-indigo-400 leading-none mt-0.5">
                            Scholarship
                          </span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {selectedFees.has(fee.id) ? (
                        <div className="relative">
                          <span className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={customAmounts[fee.id] ?? ""}
                            onChange={(e) =>
                              handleAmountChange(
                                fee.id,
                                e.target.value,
                                fee.due,
                              )
                            }
                            className="w-32 pl-6 pr-2 py-1 text-right text-sm border border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg outline-none transition-all font-bold text-gray-900"
                            placeholder="0"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {fee.receipts.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {fee.receipts.map((r, i) => (
                            <button
                              key={i}
                              onClick={() =>
                                handlePrintReceipt(fee, r, activeSemester)
                              }
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-[10px] font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1 transition-colors"
                            >
                              <Download className="w-3 h-3" /> #
                              {r.number.slice(-6)}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td
                      className={`px-6 py-4 text-sm text-right font-black ${fee.due > 0 ? "text-red-600" : "text-emerald-600/50"}`}
                    >
                      {fee.due.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}

                {/* Fine Row */}
                {semesterWise[activeSemester].fine.amount > 0 && (
                  <tr className="bg-red-50/30 dark:bg-red-900/10">
                    <td className="px-6 py-4">
                      {semesterWise[activeSemester].fine.due > 0 && (
                        <input
                          type="checkbox"
                          checked={selectedFees.has(`fine:${activeSemester}`)}
                          onChange={() =>
                            toggleFeeSelection(`fine:${activeSemester}`)
                          }
                          className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Late Payment Fine
                      </div>
                      <div className="text-[10px] font-medium text-red-500/70 uppercase">
                        Deadline:{" "}
                        {formatDate(semesterWise[activeSemester].fine.deadline)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-red-600">
                      {semesterWise[activeSemester].fine.amount.toLocaleString(
                        "en-IN",
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-emerald-600">
                      {semesterWise[activeSemester].fine.paid > 0
                        ? semesterWise[activeSemester].fine.paid.toLocaleString(
                            "en-IN",
                          )
                        : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {selectedFees.has(`fine:${activeSemester}`) ? (
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                            ₹
                          </span>
                          <input
                            type="number"
                            value={
                              customAmounts[`fine:${activeSemester}`] ?? ""
                            }
                            onChange={(e) =>
                              handleAmountChange(
                                `fine:${activeSemester}`,
                                e.target.value,
                                semesterWise[activeSemester].fine.due,
                              )
                            }
                            className="w-32 pl-6 pr-2 py-1 text-right text-sm border border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200 rounded-lg outline-none transition-all font-bold text-gray-900"
                            placeholder="0"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs italic text-gray-400">
                      Automatically applied
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-black text-red-600">
                      {semesterWise[activeSemester].fine.due.toLocaleString(
                        "en-IN",
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Applied Scholarships List */}
      {myStatus?.scholarships?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">
            Applied Scholarships
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myStatus.scholarships.map((s) => (
              <div
                key={s.id}
                className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/20 flex justify-between items-center"
              >
                <div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {s.type}
                  </div>
                  <div className="text-[10px] text-gray-400 font-medium">
                    Approved on {formatDate(s.approved_at)}
                  </div>
                </div>
                <div className="text-lg font-black text-indigo-600">
                  {formatCurrency(parseFloat(s.amount))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Sticky Footer */}
      {selectedFees.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50 animate-in slide-in-from-bottom-4">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex gap-8">
              <div>
                <div className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">
                  Total Selection
                </div>
                <div className="text-xl font-black text-gray-900 dark:text-white">
                  {formatCurrency(selectedTotal)}
                </div>
              </div>

              {grandTotals?.excessBalance > 0 && (
                <div className="relative">
                  <div className="text-[10px] text-amber-500 uppercase font-black tracking-widest mb-1">
                    Wallet Applied
                  </div>
                  <div className="text-xl font-black text-amber-600">
                    -{" "}
                    {formatCurrency(
                      Math.min(selectedTotal, grandTotals.excessBalance),
                    )}
                  </div>
                </div>
              )}

              <div className="border-l border-gray-100 dark:border-gray-800 h-10 mx-2 hidden md:block"></div>

              <div>
                <div className="text-[10px] text-indigo-500 uppercase font-black tracking-widest mb-1">
                  Net to Pay
                </div>
                <div className="text-xl font-black text-indigo-600">
                  {formatCurrency(
                    Math.max(
                      0,
                      selectedTotal - (grandTotals?.excessBalance || 0),
                    ),
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={handleBulkPayment}
              disabled={status === "loading" || selectedTotal <= 0}
              className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/30 transition-all flex items-center gap-2"
            >
              {status === "loading" ? (
                "Processing..."
              ) : (
                <>
                  Pay Now <CreditCard className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFees;
