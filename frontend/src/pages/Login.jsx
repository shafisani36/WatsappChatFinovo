import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import { useAuth } from "../contexts/AuthContext";
import "../assets/styles/login.css"

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      toast.error(
        "Please enter email and password."
      );

      return;
    }

    setLoading(true);

    try {
      await login(email, password);

      toast.success(
        "Logged in successfully"
      );

      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Login failed"
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

        <form
          onSubmit={handleSubmit}
          className="auth-form"
        >

          <div className="form-group">

            <label htmlFor="login-email">
              Email address
            </label>

            <input
              id="login-email"
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

          <div className="form-group">

            <label htmlFor="login-password">
              Password
            </label>

            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              disabled={loading}
              required
            />

          </div>

          <div
            style={{
              textAlign: "right",
              marginBottom: "16px",
            }}
          >
            <Link
              to="/forgot-password"
              style={{
                color: "var(--primary)",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <span>→</span>
              </>
            )}
          </button>

        </form>

        <div className="auth-footer">

          <span>
            Don't have an account?
          </span>

          <Link to="/register">
            Register Yourself
          </Link>

        </div>

        <div className="auth-security-note">
          <span className="security-dot"></span>
          Secure workspace access
        </div>

      </div>

    </div>
  );
}