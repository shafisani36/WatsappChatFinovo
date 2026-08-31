import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
  useAuth,
} from "../contexts/AuthContext";

export default function Login() {
  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const {
    login,
  } = useAuth();

  const navigate =
    useNavigate();

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (!email || !password) {
        toast.error(
          "Please enter email and password."
        );

        return;
      }

      setLoading(true);

      try {
        await login(
          email,
          password
        );

        toast.success(
          "Logged in successfully"
        );

        navigate("/");
      } catch (error) {
        toast.error(
          error.response?.data
            ?.message ||
            "Login failed"
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className="auth-page">

      <div className="auth-card animate-card">

        <div className="auth-brand">

          <div className="brand-logo">
            T
          </div>

          <h1>
            TimeTracker
          </h1>

          <p>
            Track your time.
            Improve your productivity.
          </p>

        </div>

        <form
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="you@example.com"
              disabled={loading}
              required
            />

          </div>

          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value
                )
              }
              placeholder="••••••••"
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
                Signing in...
              </>
            ) : (
              "Sign In"
            )}

          </button>

        </form>

        <p className="auth-footer">
          Don't have an account?{" "}

          <Link to="/register">
            Register Yourself
          </Link>
        </p>

      </div>

    </div>
  );
}