import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Mail, Lock, ArrowRight, Activity, ShieldCheck, Zap, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate("/");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">

      {/* 
        LEFT COLUMN: VISUAL IDENTITY
        Minimalist, deep blue, abstract. 
        Serves as a quiet, professional anchor.
      */}
      <div className="hidden md:flex flex-col items-center justify-center bg-blue-600 text-white p-12 relative overflow-hidden">
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-blue-600 to-blue-800"></div>
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10 text-center space-y-8 max-w-sm">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-900/20">
            <span className="text-4xl font-black text-blue-600 tracking-tighter">U</span>
          </div>

          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">UniPilot</h1>
            <p className="text-blue-100 font-medium text-lg leading-relaxed">
              Next-generation examination management for modern universities.
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 pt-4 opacity-80">
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-widest">Secure</span>
            </div>
            <div className="w-px h-8 bg-blue-400"></div>
            <div className="flex flex-col items-center gap-2">
              <Activity className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-widest">Fast</span>
            </div>
            <div className="w-px h-8 bg-blue-400"></div>
            <div className="flex flex-col items-center gap-2">
              <Zap className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-widest">Smart</span>
            </div>
          </div>
        </div>
      </div>


      {/* 
        RIGHT COLUMN: LOGIN FORM
        Ultra-clean, high whitespace, no clutter.
        Focus is purely on the task: Authentication.
      */}
      <div className="flex flex-col items-center justify-center bg-white p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-sm space-y-10">

          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Sign In</h2>
            <div className="h-1 w-12 bg-blue-600 mt-4 rounded-full mx-auto md:mx-0"></div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2 animate-fadeIn">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-0 top-3.5 text-gray-300 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border-b-2 border-gray-100 focus:border-blue-600 outline-none transition-colors bg-transparent text-gray-900 font-medium placeholder-gray-300"
                  placeholder="you@university.edu"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-0 top-3.5 text-gray-300 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-8 pr-10 py-3 border-b-2 border-gray-100 focus:border-blue-600 outline-none transition-colors bg-transparent text-gray-900 font-medium placeholder-gray-300"
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-3 text-gray-400 hover:text-blue-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white h-12 rounded-lg font-bold text-sm tracking-wide hover:bg-gray-800 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center text-xs text-gray-400 mt-8">
            <a href="#" className="hover:text-blue-600 transition-colors">Forgot Password?</a>
            <span className="mx-2">•</span>
            <a href="#" className="hover:text-blue-600 transition-colors">Help</a>
          </div>
        </div>

        <div className="absolute bottom-6 right-8 text-[10px] text-gray-300 hidden md:block">
          Secure System v2.4
        </div>
      </div>
    </div>
  );
}
