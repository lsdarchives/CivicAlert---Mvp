import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

const API_URL = "http://localhost:8080/api/auth/login";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed. Check your credentials."
        );
      }

      if (!data.token || !data.user) {
        throw new Error("The server returned an incomplete login response.");
      }

      if (data.user.role !== "ROLE_ADMIN") {
        throw new Error("Access denied. An administrator account is required.");
      }

      // Save the token and basic user information for this MVP.
      localStorage.setItem("civicalert_token", data.token);
      localStorage.setItem(
        "civicalert_user",
        JSON.stringify(data.user)
      );

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the server. Check that Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <div className="login-brand">
          <div className="login-brand-icon">C</div>
          <div>
            <h1>CivicAlert</h1>
            <p>ADMINISTRATION PORTAL</p>
          </div>
        </div>

        <div className="login-heading">
          <h2>Welcome back</h2>
          <p>Sign in to manage community reports.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="admin-email">Email address</label>
          <input
            id="admin-email"
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="username"
            required
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in to dashboard"}
          </button>
        </form>

        <p className="login-footer">
          Authorized administrators only
        </p>
      </section>
    </main>
  );
}

