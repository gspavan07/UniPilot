import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { login, clearError } from "../../store/slices/authSlice";
import { LogIn, Mail, Lock, AlertCircle, Loader2 } from "lucide-react";

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error, user } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  // Get message from URL if session expired
  const queryParams = new URLSearchParams(location.search);
  const sessionExpired = queryParams.get("message") === "session_expired";

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate("/dashboard");
    }

    // Clear any previous errors on mount
    dispatch(clearError());
  }, [user, navigate, dispatch]);

  const onSubmit = (data) => {
    dispatch(
      login({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      })
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400 mb-2 font-display">
          UniPilot
        </h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          University Management System
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign in to access your dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-card rounded-card sm:px-10 border border-gray-100 dark:border-gray-700 transition-all duration-300">
          {sessionExpired && (
            <div className="mb-4 p-3 rounded-lg bg-info-50 dark:bg-info-900/30 border border-info-500/30 text-info-700 dark:text-info-300 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Your session has expired. Please sign in again.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error-50 dark:bg-error-900/30 border border-error-500/30 text-error-700 dark:text-error-300 text-sm flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="label">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  className={`input pl-10 block ${errors.email ? "border-error-500 focus:ring-error-500" : ""}`}
                  placeholder="admin@university.edu"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-error-600 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  {...register("password")}
                  type="password"
                  autoComplete="current-password"
                  className={`input pl-10 block ${errors.password ? "border-error-500 focus:ring-error-500" : ""}`}
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-error-600 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  {...register("rememberMe")}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-300 cursor-pointer"
                >
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="/auth/forgot-password"
                  className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors"
                >
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full btn btn-primary py-2.5 text-base relative overflow-hidden group shadow-lg shadow-primary-500/20"
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <LogIn className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    Sign In
                  </span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 whitespace-nowrap">
                  Default Credentials
                </span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Email:{" "}
                <span className="font-mono text-gray-700 dark:text-gray-200">
                  admin@university.edu
                </span>
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Password:{" "}
                <span className="font-mono text-gray-700 dark:text-gray-200">
                  Admin@123
                </span>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          &copy; 2026 UniPilot. Enterprise-grade University Management System.
        </p>
      </div>
    </div>
  );
};

export default Login;
