import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
  Book,
  ArrowRight,
  RefreshCw,
  Library,
} from "lucide-react";
import {
  fetchBooks,
  addBook,
  issueBook,
  returnBook,
} from "../../store/slices/librarySlice";
import api from "../../utils/api";

const LibraryDashboard = () => {
  const dispatch = useDispatch();
  const { books, status } = useSelector((state) => state.library);
  const [activeTab, setActiveTab] = useState("catalog"); // catalog, issue, return
  const [searchTerm, setSearchTerm] = useState("");

  // Forms
  const [bookForm, setBookForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    total_copies: 1,
  });
  const [issueForm, setIssueForm] = useState({
    student_email: "",
    book_isbn: "",
    days: 14,
  });
  const [returnForm, setReturnForm] = useState({
    book_isbn: "",
    student_email: "",
  }); // Simplification for UI

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  const handleAddBook = (e) => {
    e.preventDefault();
    dispatch(addBook(bookForm)).then((res) => {
      if (!res.error) {
        setShowAddModal(false);
        setBookForm({
          title: "",
          author: "",
          isbn: "",
          category: "",
          total_copies: 1,
        });
        alert("Book added successfully");
      }
    });
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    // In a real app, we'd lookup IDs first. This is a simplified flow.
    // For demo, we assume we need to select a student from a search
    alert("Please implement student lookup for ID resolution first.");
  };

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 text-gray-900 dark:text-white max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl text-indigo-600 dark:text-indigo-400">
            <Library className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Library Management</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Catalog, Circulation, and Inventory
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="w-4 h-4 mr-2" /> Add New Book
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
        {[
          { id: "catalog", label: "Book Catalog", icon: Book },
          { id: "issue", label: "Issue Desk", icon: ArrowRight },
          { id: "return", label: "Returns", icon: RefreshCw },
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

      {activeTab === "catalog" && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, author, or ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <span className="text-sm font-bold text-gray-500">
              {filteredBooks.length} Books found
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Book Details</th>
                  <th className="px-6 py-4">ISBN</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Availability</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredBooks.map((book) => (
                  <tr
                    key={book.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-600">
                          <Book className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm">{book.title}</div>
                          <div className="text-xs text-gray-500">
                            {book.author}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      {book.isbn}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs">
                        {book.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`font-bold ${book.available_copies > 0 ? "text-emerald-600" : "text-red-500"}`}
                      >
                        {book.available_copies} / {book.total_copies}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${book.status === "available"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                          }`}
                      >
                        {book.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredBooks.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-20 text-center text-gray-400"
                    >
                      <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-10" />
                      <p className="text-lg font-medium">No books found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-indigo-600 text-white">
              <h3 className="text-xl font-bold">Add New Book</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="hover:bg-indigo-700 p-2 rounded-lg"
              >
                <Filter className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddBook} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold uppercase text-gray-400">
                    Book Title
                  </label>
                  <input
                    required
                    type="text"
                    value={bookForm.title}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, title: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold uppercase text-gray-400">
                    Author
                  </label>
                  <input
                    required
                    type="text"
                    value={bookForm.author}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, author: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400">
                    ISBN
                  </label>
                  <input
                    required
                    type="text"
                    value={bookForm.isbn}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, isbn: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-gray-400">
                    Total Copies
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={bookForm.total_copies}
                    onChange={(e) =>
                      setBookForm({
                        ...bookForm,
                        total_copies: parseInt(e.target.value),
                      })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl mt-1"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-bold uppercase text-gray-400">
                    Category
                  </label>
                  <input
                    required
                    type="text"
                    value={bookForm.category}
                    onChange={(e) =>
                      setBookForm({ ...bookForm, category: e.target.value })
                    }
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl mt-1"
                    placeholder="e.g. Computer Science"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20"
                >
                  Add Book
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryDashboard;
