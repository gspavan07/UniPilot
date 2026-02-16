import { Link } from "react-router-dom";
import { Home, FileQuestion, Compass, ArrowRight, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Abstract Background Decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[50vh] h-[50vh] bg-blue-50/50 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60vh] h-[60vh] bg-gray-50/80 rounded-full blur-3xl opacity-60"></div>
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4=')] opacity-30"></div>
      </div>

      <div className="max-w-2xl w-full relative z-10 text-center">
        {/* Hero Visual */}
        <div className="mb-12 relative inline-flex items-center justify-center group">
          <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20 duration-1000"></div>
          <div className="w-32 h-32 bg-white rounded-3xl shadow-xl shadow-blue-100 border border-blue-50 flex items-center justify-center relative z-10 transform transition-transform group-hover:rotate-6 group-hover:scale-105 duration-300">
            <FileQuestion className="w-14 h-14 text-blue-600" strokeWidth={1.5} />
          </div>

          {/* Floating Elements */}
          <div className="absolute -right-8 -top-4 w-16 h-16 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center animate-bounce duration-[3000ms]">
            <Search className="w-6 h-6 text-gray-400" />
          </div>
          <div className="absolute -left-6 -bottom-2 w-14 h-14 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center animate-bounce duration-[4000ms]">
            <Compass className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* Typography */}
        <h1 className="text-9xl font-black text-gray-900 tracking-tighter leading-none mb-2 select-none">
          4<span className="text-blue-600">0</span>4
        </h1>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
          Page not found
        </h2>

        <p className="text-lg text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">
          Sorry, we couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
        </p>

        {/* Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/"
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-black transition-all hover:-translate-y-1 hover:shadow-lg active:scale-95 min-w-[200px]"
          >
            <Home className="w-4 h-4" />
            <span>Back to Dashboard</span>
            <div className="absolute right-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="px-8 py-3.5 bg-white text-gray-600 text-sm font-bold rounded-xl border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all hover:border-gray-300 min-w-[200px]"
          >
            Go Back
          </button>
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-8 text-xs font-bold text-gray-300 uppercase tracking-widest">
        Error Code: 404_NOT_FOUND
      </div>
    </div>
  );
}
