import React, { useState } from "react";
import {
  X,
  Send,
  Mail,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import api from "../../utils/api";

const BulkCommunicationModal = ({ isOpen, onClose, userCount, filters }) => {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [type, setType] = useState("email"); // 'email' or 'sms'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!message) return alert("Please enter a message");
    if (type === "email" && !subject) return alert("Please enter a subject");

    try {
      setLoading(true);
      // Simulate API call for bulk notification
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log(
        `Sending ${type} to ${userCount} users. Subject: ${subject}, Message: ${message}`
      );
      setSuccess(true);

      setTimeout(() => {
        onClose();
        setSuccess(false);
        setMessage("");
        setSubject("");
      }, 2000);
    } catch (err) {
      alert("Failed to send communications");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-primary-500" />
            Bulk Communication
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <div className="w-16 h-16 bg-success-100 text-success-600 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Messages Sent!
                </h3>
                <p className="text-sm text-gray-500">
                  Communicated with {userCount} recipients successfully.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-2xl border border-primary-100 dark:border-primary-800">
                <p className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest mb-1">
                  RECIPIENTS
                </p>
                <p className="text-sm text-primary-900 dark:text-primary-100 font-medium">
                  {userCount} students targeting currently filtered view
                </p>
              </div>

              <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                <button
                  onClick={() => setType("email")}
                  className={`flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-bold transition-all ${type === "email" ? "bg-white dark:bg-gray-700 shadow-sm text-primary-600" : "text-gray-500"}`}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </button>
                <button
                  onClick={() => setType("sms")}
                  className={`flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-bold transition-all ${type === "sms" ? "bg-white dark:bg-gray-700 shadow-sm text-primary-600" : "text-gray-500"}`}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  SMS
                </button>
              </div>

              {type === "email" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 ml-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 ml-1">
                  Message Body
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none transition-all resize-none"
                />
              </div>

              <button
                disabled={loading}
                onClick={handleSend}
                className="w-full btn btn-primary py-3 rounded-2xl shadow-lg shadow-primary-500/25 flex items-center justify-center font-bold"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </div>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Broadcast
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkCommunicationModal;
