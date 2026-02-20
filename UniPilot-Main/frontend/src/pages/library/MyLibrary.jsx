import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BookOpen,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Book,
  Calendar,
  History,
} from "lucide-react";
import { fetchMyBooks, fetchBooks } from "../../store/slices/librarySlice";

const MyLibrary = () => {
  const dispatch = useDispatch();
  const { myBooks, books, status } = useSelector((state) => state.library);
  const [activeTab, setActiveTab] = useState("my-books");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchMyBooks());
    if (activeTab === "browse") {
      dispatch(fetchBooks());
    }
  }, [dispatch, activeTab]);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      dispatch(fetchBooks(searchTerm));
    }
  };

  return (
    <div className="space-y-6 text-gray-900 dark:text-white max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">My Library</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Track your readings and discover new books
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {[
          { id: "my-books", label: "Borrowed Books", icon: Book },
          { id: "browse", label: "Browse Catalog", icon: Search },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                ? "bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "my-books" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold flex items-center uppercase tracking-wider text-sm">
              <History className="w-4 h-4 mr-2 text-indigo-500" /> Current
              Borrowings
            </h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {myBooks.map((issue) => {
              const daysLeft = Math.ceil(
                (new Date(issue.due_date) - new Date()) / (1000 * 60 * 60 * 24)
              );
              const isOverdue = daysLeft < 0;

              return (
                <div
                  key={issue.id}
                  className="p-6 flex flex-col md:flex-row justify-between items-center hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-center gap-4 mb-4 md:mb-0">
                    <div className="w-12 h-16 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-400 shadow-sm">
                      <Book className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{issue.book?.title}</h4>
                      <p className="text-sm text-gray-500">
                        {issue.book?.author}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-400">
                        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          {issue.book?.isbn}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase font-bold">
                        Due Date
                      </p>
                      <p
                        className={`font-bold ${isOverdue ? "text-red-600" : "text-gray-700 dark:text-gray-200"}`}
                      >
                        {new Date(issue.due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center ${isOverdue
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                        }`}
                    >
                      {isOverdue ? (
                        <AlertCircle className="w-4 h-4 mr-1" />
                      ) : (
                        <Clock className="w-4 h-4 mr-1" />
                      )}
                      {issue.status === "returned"
                        ? "Returned"
                        : isOverdue
                          ? `Overdue by ${Math.abs(daysLeft)} days`
                          : `${daysLeft} days left`}
                    </div>
                  </div>
                </div>
              );
            })}
            {myBooks.length === 0 && (
              <div className="p-12 text-center text-gray-400">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-10" />
                <p>You haven't borrowed any books yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "browse" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search collection..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-50 dark:divide-gray-700">
            {books.map((book) => (
              <div
                key={book.id}
                className="p-6 flex justify-between items-center"
              >
                <div>
                  <h4 className="font-bold">{book.title}</h4>
                  <p className="text-sm text-gray-500">{book.author}</p>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-500 mt-1 inline-block">
                    {book.category}
                  </span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-bold ${book.available_copies > 0 ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {book.available_copies > 0 ? "Available" : "Out of Stock"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLibrary;
