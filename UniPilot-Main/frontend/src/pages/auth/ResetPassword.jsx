import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { resetPassword, clearError } from "../../store/slices/authSlice";
import {
  Lock,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";

const schema = yup.object().shape({
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

const ResetPassword = () => {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);
  const [success, setSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const onSubmit = async (data) => {
    if (!token) return;
    const result = await dispatch(
      resetPassword({ token, newPassword: data.password })
    );
    if (resetPassword.fulfilled.match(result)) {
      setSuccess(true);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-card rounded-card sm:px-10 border border-gray-100 dark:border-gray-700 text-center">
            <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Invalid Link
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              The password reset link is invalid or missing.
            </p>
            <div className="mt-6">
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400"
              >
                Return to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-4xl font-extrabold text-primary-600 dark:text-primary-400 mb-2 font-display">
          UniPilot
        </h1>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Set New Password
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Enter your new password below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-card rounded-card sm:px-10 border border-gray-100 dark:border-gray-700 transition-all duration-300">
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-100 dark:bg-success-900/30 mb-4">
                <CheckCircle className="h-6 w-6 text-success-600 dark:text-success-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Password Reset Successful
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Your password has been successfully updated.
              </p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="btn btn-primary w-full inline-flex justify-center"
                >
                  Sign in with new password
                </Link>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-error-50 dark:bg-error-900/30 border border-error-500/30 text-error-700 dark:text-error-300 text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label htmlFor="password" className="label">
                    New Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="password"
                      {...register("password")}
                      type="password"
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

                <div>
                  <label htmlFor="confirmPassword" className="label">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock
                        className="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </div>
                    <input
                      id="confirmPassword"
                      {...register("confirmPassword")}
                      type="password"
                      className={`input pl-10 block ${errors.confirmPassword ? "border-error-500 focus:ring-error-500" : ""}`}
                      placeholder="••••••••"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-error-600 font-medium">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full btn btn-primary py-2.5 text-base"
                  >
                    {status === "loading" ? (
                      <span className="flex items-center justify-center">
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Resetting...
                      </span>
                    ) : (
                      "Reset Password"
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 flex items-center justify-center">
                <Link
                  to="/login"
                  className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
