import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import api from "../api/axios";
import "../assets/styles/login.css";

export default function ForgotPassword() {
  const [step, setStep] = useState("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSendOtp = async (event) => {
    event.preventDefault();

    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/forgot-password", {
        email,
      });

      toast.success("OTP sent to your email");
      setStep("otp");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to send OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();

    if (!otp) {
      toast.error("Please enter the OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(
        "/auth/verify-otp",
        { email, otp }
      );

      setResetToken(
        response.data?.resetToken || ""
      );

      toast.success("OTP verified");
      setStep("reset");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error(
        "Please fill in both password fields."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error(
        "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", {
        email,
        resetToken,
        newPassword,
      });

      toast.success(
        "Password reset successful. Please log in."
      );

      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", {
        email,
      });

      toast.success("A new OTP has been sent");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to resend OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background-shape auth-shape-one"></div>
      <div className="auth-background-shape auth-shape-two"></div>

      <div className="auth-card animate-card">
        <div className="auth-brand">
          <div className="auth-brand-name">
            Finovo Global
          </div>

          <div className="auth-brand-line">
            <span></span>
            SERVICES
            <span></span>
          </div>
        </div>

        {step === "email" && (
          <form
            onSubmit={handleSendOtp}
            className="auth-form"
          >
            <div className="form-group">
              <label htmlFor="forgot-email">
                Email address
              </label>

              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="you@example.com"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Sending OTP...
                </>
              ) : (
                <>
                  Send OTP
                  <span>→</span>
                </>
              )}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form
            onSubmit={handleVerifyOtp}
            className="auth-form"
          >
            <div className="form-group">
              <label htmlFor="forgot-otp">
                Enter the 6-digit OTP sent to{" "}
                {email}
              </label>

              <input
                id="forgot-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(event) =>
                  setOtp(
                    event.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                placeholder="123456"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Verifying...
                </>
              ) : (
                <>
                  Verify OTP
                  <span>→</span>
                </>
              )}
            </button>

            <div className="auth-footer">
              <span>Didn't get the code?</span>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--primary)",
                  fontWeight: 700,
                }}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {step === "reset" && (
          <form
            onSubmit={handleResetPassword}
            className="auth-form"
          >
            <div className="form-group">
              <label htmlFor="new-password">
                New password
              </label>

              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) =>
                  setNewPassword(
                    event.target.value
                  )
                }
                placeholder="Enter new password"
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">
                Confirm new password
              </label>

              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                placeholder="Re-enter new password"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="button-spinner"></span>
                  Resetting...
                </>
              ) : (
                <>
                  Reset Password
                  <span>→</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="auth-footer">
          <span>Remembered your password?</span>

          <Link to="/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
