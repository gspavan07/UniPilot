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
  History,
  Printer,
  ArrowUpRight,
  ChevronRight,
  Info,
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

  const {
    semesterWise = {},
    grandTotals = {},
    studentInfo = {},
  } = myStatus || {};
  const selectedTotal = calculateSelectedTotal();

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
          script.src = "https://checkout.razorpay.com/v1/checkout";
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
            color: "#2563EB", // Blue-600
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
      .replace("₹", "");
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

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
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 border-b border-gray-100 pb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] border border-blue-100/50">
                Financial Management
              </span>
              <div className="h-px w-8 bg-gray-100"></div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {studentInfo?.admission_type || "Standard Enrollment"}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter leading-none">
              Tuition & <span className="text-blue-600">Payments.</span>
            </h1>
            <p className="text-gray-500 text-lg font-medium max-w-2xl leading-relaxed">
              Monitor your academic fee structures, transaction history, and
              outstanding modular dues.
            </p>
          </div>

          {/* <div className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-[1.5rem] border border-gray-100">
            <button className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 hover:bg-white rounded-xl transition-all">
              <History className="w-3.5 h-3.5" /> History
            </button>
            <button className="flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-500/20">
              <Download className="w-3.5 h-3.5" /> Statement
            </button>
          </div> */}
        </header>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Total Payable
            </span>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-lg font-medium text-gray-400">₹</span>
              <span className="text-4xl font-black text-gray-900 tracking-tight">
                {formatCurrency(grandTotals?.payable || 0)}
              </span>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Total Paid
            </span>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-lg font-medium text-gray-400">₹</span>
              <span className="text-4xl font-black text-emerald-600 tracking-tight">
                {formatCurrency(grandTotals?.paid || 0)}
              </span>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all">
            <span className="text-xs font-bold uppercase tracking-widest text-red-600">
              Outstanding Due
            </span>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-lg font-medium text-gray-400">₹</span>
              <span className="text-4xl font-black text-red-600 tracking-tight">
                {formatCurrency(grandTotals?.due || 0)}
              </span>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-200">
              Wallet Balance
            </span>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-lg font-medium text-blue-300">₹</span>
              <span className="text-4xl font-black tracking-tight">
                {formatCurrency(grandTotals?.excessBalance || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Fee Breakdown Section */}
        <div className="space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-black tracking-tight">
                Active Invoices
              </h2>
              <p className="text-sm font-medium text-gray-400">
                Detailed breakdown for each academic semester
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-gray-100/50 p-1.5 rounded-[1.5rem] border border-gray-100 overflow-x-auto">
              {Object.keys(semesterWise).map((sem) => (
                <button
                  key={sem}
                  onClick={() => setActiveSemester(sem)}
                  className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeSemester === sem
                      ? "bg-blue-600 text-white shadow-xl shadow-blue-500/20"
                      : "text-gray-400 hover:text-blue-600 hover:bg-white"
                    }`}
                >
                  Semester {sem}
                </button>
              ))}
            </div>
          </div>

          {activeSemester && semesterWise[activeSemester] && (
            <div className="border border-gray-100 rounded-3xl overflow-hidden shadow-sm bg-white">
              {/* Select All/Clear All Controls */}
              <div className="px-8 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  {selectedFees.size} item(s) selected
                </span>
                <button
                  onClick={() => {
                    const unpaidFees = semesterWise[activeSemester].fees.filter(f => f.due > 0);
                    const hasFine = semesterWise[activeSemester].fine.due > 0;

                    if (selectedFees.size > 0) {
                      // Clear all
                      setSelectedFees(new Set());
                      setCustomAmounts({});
                    } else {
                      // Select all unpaid
                      const newSelected = new Set();
                      const newAmounts = {};

                      unpaidFees.forEach(fee => {
                        newSelected.add(fee.id);
                        newAmounts[fee.id] = fee.due;
                      });

                      if (hasFine) {
                        newSelected.add(`fine:${activeSemester}`);
                        newAmounts[`fine:${activeSemester}`] = semesterWise[activeSemester].fine.due;
                      }

                      setSelectedFees(newSelected);
                      setCustomAmounts(newAmounts);
                    }
                  }}
                  className="px-4 py-2 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all uppercase tracking-wider"
                >
                  {selectedFees.size > 0 ? 'Clear All' : 'Select All'}
                </button>
              </div>

              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider w-20">
                      Select
                    </th>
                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Payable
                    </th>
                    <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Paid
                    </th>
                    <th className="px-8 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider w-48">
                      Amount
                    </th>
                    <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Receipt
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {semesterWise[activeSemester].fees.map((fee) => {
                    const isSelected = selectedFees.has(fee.id);
                    const isFullyPaid = fee.due <= 0;

                    return (
                      <tr
                        key={fee.id}
                        className={`transition-colors ${isSelected ? "bg-blue-50/30" : "hover:bg-gray-50/50"}`}
                      >
                        <td className="px-8 py-5 text-center">
                          {!isFullyPaid && (
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() =>
                                toggleFeeSelection(fee.id, fee.due)
                              }
                              className="w-5 h-5 rounded-md border-gray-300 text-black focus:ring-black cursor-pointer bg-gray-300"
                            />
                          )}
                        </td>
                        <td className="px-8 py-5">
                          <div>
                            <p className="font-bold text-gray-900">
                              {fee.category}
                            </p>
                            {fee.waiver > 0 && (
                              <p className="text-xs font-medium text-emerald-600 mt-0.5">
                                Waiver Applied: ₹{formatCurrency(fee.waiver)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right text-sm font-medium text-gray-500">
                          ₹{fee.payable.toLocaleString("en-IN")}
                        </td>
                        <td className="px-8 py-5 text-right text-sm font-bold text-emerald-600">
                          {fee.paid > 0
                            ? `₹${fee.paid.toLocaleString("en-IN")}`
                            : "-"}
                        </td>
                        <td className="px-8 py-5 text-center">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${isFullyPaid
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-red-50 text-red-700"
                              }`}
                          >
                            {fee.due > 0 ? "Due" : "Paid"}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          {isSelected ? (
                            <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
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
                                className="w-full pl-8 pr-4 py-2 bg-white border border-blue-200 rounded-xl text-right font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                autoFocus
                              />
                            </div>
                          ) : (
                            <span className="text-gray-300 font-medium">-</span>
                          )}
                        </td>
                        <td className="px-8 py-5 text-right">
                          {fee.receipts.length > 0 && (
                            <div className="flex justify-end gap-1">
                              {fee.receipts.map((r, i) => (
                                <button
                                  key={i}
                                  onClick={() =>
                                    handlePrintReceipt(fee, r, activeSemester)
                                  }
                                  className="p-2 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-black rounded-lg transition-colors"
                                >
                                  <Printer className="w-4 h-4" />
                                </button>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Fines Section */}
                  {semesterWise[activeSemester].fine.amount > 0 && (
                    <tr className="bg-red-50/30 border-t border-red-100">
                      <td className="px-8 py-6 text-center">
                        {semesterWise[activeSemester].fine.due > 0 && (
                          <input
                            type="checkbox"
                            checked={selectedFees.has(`fine:${activeSemester}`)}
                            onChange={() =>
                              toggleFeeSelection(`fine:${activeSemester}`)
                            }
                            className="w-5 h-5 rounded-md border-red-200 text-red-600 focus:ring-red-500 cursor-pointer bg-red-50"
                          />
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <p className="font-bold text-red-700">
                            Late Fee Penalty
                          </p>
                          <p className="text-xs font-medium text-red-500 mt-0.5">
                            Deadline:{" "}
                            {formatDate(
                              semesterWise[activeSemester].fine.deadline,
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right text-sm font-medium text-red-700">
                        ₹
                        {semesterWise[
                          activeSemester
                        ].fine.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="px-8 py-6 text-right text-sm font-bold text-red-700">
                        {semesterWise[activeSemester].fine.paid > 0
                          ? `₹${semesterWise[activeSemester].fine.paid.toLocaleString("en-IN")}`
                          : "-"}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-red-100 text-red-700">
                          {semesterWise[activeSemester].fine.due > 0
                            ? "Overdue"
                            : "Paid"}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {selectedFees.has(`fine:${activeSemester}`) ? (
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 font-medium">
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
                              className="w-full pl-8 pr-4 py-2 bg-white border border-red-200 rounded-xl text-right font-bold text-red-700 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            />
                          </div>
                        ) : (
                          <span className="text-red-200 font-medium">-</span>
                        )}
                      </td>
                      <td className="px-8 py-6"></td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Floating Checkout Bar */}
      {selectedFees.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-6 duration-500">
          <div className="bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] py-6 px-8">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-12">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Total Selected
                  </p>
                  <p className="text-3xl font-black text-gray-900">
                    ₹{formatCurrency(selectedTotal)}
                  </p>
                </div>

                {grandTotals?.excessBalance > 0 && selectedTotal > 0 && (
                  <div className="hidden sm:block pl-8 border-l border-gray-100">
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">
                      Wallet Used
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      - ₹
                      {formatCurrency(
                        Math.min(selectedTotal, grandTotals.excessBalance),
                      )}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-8 w-full md:w-auto">
                <div className="hidden lg:block text-right">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Net Payable
                  </p>
                  <p className="text-2xl font-black text-black">
                    ₹
                    {formatCurrency(
                      Math.max(
                        0,
                        selectedTotal - (grandTotals?.excessBalance || 0),
                      ),
                    )}
                  </p>
                </div>

                <button
                  onClick={handleBulkPayment}
                  disabled={status === "loading" || selectedTotal <= 0}
                  className="w-full md:w-auto px-10 py-5 bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all duration-300 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-500/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {status === "loading" ? (
                    "Syncing..."
                  ) : (
                    <>
                      Execute Secure Payment{" "}
                      <ArrowUpRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyFees;
