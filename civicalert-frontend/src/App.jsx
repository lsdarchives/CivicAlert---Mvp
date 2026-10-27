
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

const API_URL = "http://localhost:8080/api/reports";

export default function App() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("civicalert_user") || "null");
    } catch {
      return null;
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("civicalert_token");
    localStorage.removeItem("civicalert_user");
    navigate("/admin/login", { replace: true });
  }

  function getAuthHeaders(includeJson = false) {
    const token = localStorage.getItem("civicalert_token");

    return {
      ...(includeJson ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  async function loadReports() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("civicalert_token");

      if (!token) {
        handleLogout();
        return;
      }

      const response = await fetch(API_URL, {
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (response.status === 403) {
        setError("Access denied. Administrator access is required.");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not load reports. Please try again.");
      }

      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err.message ||
          "Could not connect to the server. Check that Spring Boot is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role !== "ROLE_ADMIN") {
      handleLogout();
      return;
    }

    loadReports();
    // Initial dashboard load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = useMemo(() => {
    return [...new Set(reports.map((report) => report.category).filter(Boolean))];
  }, [reports]);

  const filteredReports = useMemo(() => {
    const query = search.trim().toLowerCase();

    return reports.filter((report) => {
      const searchableText = [
        report.referenceNumber,
        report.title,
        report.description,
        report.category,
        report.suburb,
        report.streetAddress,
        report.nearestLandmark,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);
      const matchesStatus =
        statusFilter === "ALL" || report.status === statusFilter;
      const matchesCategory =
        categoryFilter === "ALL" || report.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [reports, search, statusFilter, categoryFilter]);

  const stats = useMemo(() => {
    const total = reports.length;

    const submitted = reports.filter(
      (report) => report.status?.toUpperCase() === "SUBMITTED"
    ).length;

    const inProgress = reports.filter((report) =>
      ["IN_PROGRESS", "IN PROGRESS", "IN-PROGRESS"].includes(
        report.status?.toUpperCase()
      )
    ).length;

    const resolved = reports.filter(
      (report) => report.status?.toUpperCase() === "RESOLVED"
    ).length;

    const urgent = reports.filter((report) =>
      ["HIGH", "URGENT"].includes(report.priority?.toUpperCase())
    ).length;

    return { total, submitted, inProgress, resolved, urgent };
  }, [reports]);

  async function updateReport(report, field, value) {
    const updatedReport = { ...report, [field]: value };

    setUpdatingId(report.id);
    setError("");

    try {
      const response = await fetch(`${API_URL}/${report.id}`, {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify(updatedReport),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (response.status === 403) {
        setError("You are not authorized to update reports.");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not update this report.");
      }

      let savedReport = updatedReport;

      if (response.status !== 204) {
        const responseText = await response.text();

        if (responseText) {
          savedReport = JSON.parse(responseText);
        }
      }

      setReports((current) =>
        current.map((item) =>
          item.id === report.id ? { ...item, ...savedReport } : item
        )
      );
    } catch (err) {
      setError(err.message || "An error occurred while updating the report.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteReport(report) {
    const confirmed = window.confirm(
      `Delete report ${report.referenceNumber || `#${report.id}`}? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`${API_URL}/${report.id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      if (response.status === 403) {
        setError("You are not authorized to delete reports.");
        return;
      }

      if (!response.ok) {
        throw new Error("Could not delete this report.");
      }

      setReports((current) =>
        current.filter((item) => item.id !== report.id)
      );
    } catch (err) {
      setError(err.message || "An error occurred while deleting the report.");
    }
  }

  function formatLabel(value) {
    if (!value) return "—";

    return value
      .toString()
      .replaceAll("_", " ")
      .replaceAll("-", " ")
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return new Intl.DateTimeFormat("en-ZA", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="dashboard-brand-icon">C</div>
          <div>
            <h1>CivicAlert</h1>
            <p>Service Management</p>
          </div>
        </div>

        <nav className="dashboard-nav" aria-label="Main navigation">
          <a className="active" href="#dashboard">
            <span>▦</span> Dashboard
          </a>
          <a href="#reports">
            <span>☷</span> Reports
          </a>
        </nav>

        <div className="sidebar-footer">
          <p>Community services</p>
          <small>Administration portal</small>
        </div>
      </aside>

      <main className="dashboard-main" id="dashboard">
        <header className="dashboard-topbar">
          <div>
            <p className="eyebrow">CIVICALERT / OVERVIEW</p>
            <h2>Admin Dashboard</h2>
          </div>

          <div className="topbar-actions">
            <div className="admin-profile">
              <div className="admin-avatar">A</div>
              <div>
                <strong>{user?.fullName || "Administrator"}</strong>
                <span>Administrator</span>
              </div>
            </div>

            <button
              type="button"
              className="logout-button"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </header>

        <section className="dashboard-content">
          <div className="welcome-row">
            <div>
              <h3>Overview</h3>
              <p>Monitor and manage community service reports.</p>
            </div>

            <button
              type="button"
              className="refresh-button"
              onClick={loadReports}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "↻ Refresh"}
            </button>
          </div>

          {error && (
            <div className="dashboard-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={() => setError("")}>
                Dismiss
              </button>
            </div>
          )}

          <div className="stats-grid">
            <StatCard
              label="Total Reports"
              value={stats.total}
              icon="▤"
              description="All recorded reports"
            />
            <StatCard
              label="Awaiting Action"
              value={stats.submitted}
              icon="◷"
              description="New submissions"
            />
            <StatCard
              label="In Progress"
              value={stats.inProgress}
              icon="↗"
              description="Currently being handled"
            />
            <StatCard
              label="Resolved"
              value={stats.resolved}
              icon="✓"
              description="Completed reports"
            />
          </div>

          <div className="attention-strip">
            <div className="attention-icon">!</div>
            <div>
              <strong>Reports requiring attention</strong>
              <p>
                {stats.urgent} high-priority or urgent report
                {stats.urgent === 1 ? "" : "s"} currently recorded.
              </p>
            </div>
          </div>

          <section className="reports-section" id="reports">
            <div className="reports-heading">
              <div>
                <h3>Service Reports</h3>
                <p>Review submissions and manage their progress.</p>
              </div>
              <span className="report-count">
                {filteredReports.length} report
                {filteredReports.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="report-filters">
              <input
                type="search"
                placeholder="Search reports, locations..."
                aria-label="Search reports"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="ALL">All statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                aria-label="Filter by category"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value="ALL">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {formatLabel(category)}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="dashboard-empty">
                <div className="loading-spinner" />
                <p>Loading reports...</p>
              </div>
            ) : filteredReports.length === 0 ? (
              <div className="dashboard-empty">
                <div className="empty-icon">▤</div>
                <h4>No reports found</h4>
                <p>
                  {reports.length === 0
                    ? "There are no reports to display yet."
                    : "Try changing your search or filter options."}
                </p>
              </div>
            ) : (
              <div className="reports-table-wrapper">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Report</th>
                      <th>Category</th>
                      <th>Location</th>
                      <th>Submitted</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReports.map((report) => (
                      <tr key={report.id}>
                        <td>
                          <div className="report-title-cell">
                            <strong>{report.title || "Untitled report"}</strong>
                            <span>
                              {report.referenceNumber || `#${report.id}`}
                            </span>
                          </div>
                        </td>

                        <td>{formatLabel(report.category)}</td>

                        <td>
                          <div className="location-cell">
                            <strong>{report.suburb || "—"}</strong>
                            <span>
                              {report.streetAddress ||
                                report.nearestLandmark ||
                                "Location not provided"}
                            </span>
                          </div>
                        </td>

                        <td>{formatDate(report.createdAt)}</td>

                        <td>
                          <select
                            aria-label={`Priority for report ${report.id}`}
                            className={`table-select priority-${(
                              report.priority || "medium"
                            ).toLowerCase()}`}
                            value={report.priority || "MEDIUM"}
                            disabled={updatingId === report.id}
                            onChange={(event) =>
                              updateReport(
                                report,
                                "priority",
                                event.target.value
                              )
                            }
                          >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="URGENT">Urgent</option>
                          </select>
                        </td>

                        <td>
                          <select
                            aria-label={`Status for report ${report.id}`}
                            className="table-select"
                            value={report.status || "SUBMITTED"}
                            disabled={updatingId === report.id}
                            onChange={(event) =>
                              updateReport(
                                report,
                                "status",
                                event.target.value
                              )
                            }
                          >
                            <option value="SUBMITTED">Submitted</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="REJECTED">Rejected</option>
                          </select>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="delete-button"
                            onClick={() => deleteReport(report)}
                            disabled={updatingId === report.id}
                            aria-label={`Delete report ${report.id}`}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <footer className="dashboard-footer">
            <span>CivicAlert Administration</span>
            <span>Community reports management</span>
          </footer>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, description }) {
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span>{label}</span>
        <div className="stat-icon">{icon}</div>
      </div>
      <strong className="stat-value">{value}</strong>
      <p>{description}</p>
    </article>
  );
}
