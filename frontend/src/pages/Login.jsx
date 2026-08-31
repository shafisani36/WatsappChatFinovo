import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleSubmit = async (e) => {
e.preventDefault();


setError("");
setLoading(true);

try {
  const response = await fetch("http://localhost:5000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    setError(data.message || "Login failed");
    setLoading(false);
    return;
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  setLoading(false);

  navigate("/dashboard");
} catch (error) {
  console.error("Login Error:", error);

  setError("Unable to connect to the server");
  setLoading(false);
}

};

return ( <div className="min-h-screen bg-slate-950 px-4"> <div className="flex min-h-screen items-center justify-center"> <div className="w-full max-w-md">

```
      <div className="mb-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white">
          <span className="text-2xl font-bold text-slate-900">
            T
          </span>
        </div>

        <h1 className="mt-5 text-3xl font-bold text-white">
          TimeTrack
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Sign in to your workspace
        </p>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">

          {error && (
            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
              />
              Remember me
            </label>

            <button
              type="button"
              className="text-sm font-medium text-slate-900 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        Authorized company users only
      </p>

    </div>
  </div>
</div>
);
}

export default Login;