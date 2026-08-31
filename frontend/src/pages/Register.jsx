import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import { useAuth } from "../contexts/AuthContext";

const COMPANY_TENANT_ID =
  "c49269dc-402d-4fe8-9be9-480025fc2047";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    passwordHash: "",
    tenantId: COMPANY_TENANT_ID,
    role: "EMPLOYEE",
  });

  const [loading, setLoading] = useState(false);

  const { register } = useAuth();

  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.username ||
      !formData.passwordHash
    ) {
      toast.error(
        "Please fill in all required fields."
      );

      return;
    }

    setLoading(true);

    try {
      console.log(
        "REGISTER REQUEST:",
        {
          name: formData.name,
          email: formData.email,
          username: formData.username,
          passwordHash: formData.passwordHash,
          tenantId: COMPANY_TENANT_ID,
          role: "EMPLOYEE",
        }
      );

      const result = await register({
        name: formData.name,
        email: formData.email,
        username: formData.username,
        passwordHash: formData.passwordHash,
        tenantId: COMPANY_TENANT_ID,
        role: "EMPLOYEE",
        teamId: null,
        managerId: null,
      });

      console.log(
        "REGISTER RESPONSE:",
        result
      );

      toast.success(
        "Account created successfully."
      );

      navigate("/login");

    } catch (error) {
      console.error(
        "REGISTER ERROR:",
        error
      );

      console.error(
        "REGISTER STATUS:",
        error.response?.status
      );

      console.error(
        "REGISTER DATA:",
        error.response?.data
      );

      console.error(
        "REGISTER URL:",
        error.config?.url
      );

      toast.error(
        error.response?.data?.message ||
        "Registration failed."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card register-card animate-card">

        <div className="auth-brand">

          <div className="brand-logo">
            T
          </div>

          <h1>
            Create Account
          </h1>

          <p>
            Join TimeTracker
          </p>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>
              Full Name *
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              disabled={loading}
              required
            />

          </div>

          <div className="form-group">

            <label>
              Email *
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              disabled={loading}
              required
            />

          </div>

          <div className="form-group">

            <label>
              Username *
            </label>

            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
              disabled={loading}
              required
            />

          </div>

          <div className="form-group">

            <label>
              Password *
            </label>

            <input
              type="password"
              name="passwordHash"
              value={formData.passwordHash}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={loading}
              required
            />

          </div>

          <div className="form-group">

            <label>
              Company
            </label>

            <input
              type="text"
              value="Finovo Global"
              readOnly
              disabled={loading}
            />

          </div>

          <div className="form-group">

            <label>
              Role
            </label>

            <input
              type="text"
              value="Employee"
              readOnly
              disabled={loading}
            />

          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading
              ? "Creating account..."
              : "Create Account"}

          </button>

        </form>

        <p className="auth-footer">

          Already have an account?{" "}

          <Link to="/login">
            Sign In
          </Link>

        </p>

      </div>

    </div>
  );
};

export default Register;