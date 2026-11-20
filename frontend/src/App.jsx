
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://127.0.0.1:5000/api";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  source: "",
  status: "New",
};

function App() {
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch all leads
  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API_URL}/leads`);
      setLeads(response.data);
      setError("");
    } catch (err) {
      setError("Unable to load leads. Check the backend server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Handle form input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Add or update a lead
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      if (editingId) {
        await axios.put(`${API_URL}/leads/${editingId}`, form);
        setSuccess("Lead updated successfully!");
      } else {
        await axios.post(`${API_URL}/leads`, form);
        setSuccess("Lead added successfully!");
      }

      setForm(initialForm);
      setEditingId(null);
      await fetchLeads();
    } catch (err) {
      setError(
        err.response?.data?.error || "Unable to save lead."
      );
    }
  };

  // Edit a lead
  const handleEdit = (lead) => {
    setForm({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company || "",
      source: lead.source || "",
      status: lead.status,
    });

    setEditingId(lead.id);
    setSuccess("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete a lead
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lead?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/leads/${id}`);
      setSuccess("Lead deleted successfully!");

      if (editingId === id) {
        setForm(initialForm);
        setEditingId(null);
      }

      await fetchLeads();
    } catch (err) {
      setError("Unable to delete lead.");
    }
  };

  // Search and filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Dashboard counts
  const newLeads = leads.filter(
    (lead) => lead.status === "New"
  ).length;

  const contactedLeads = leads.filter(
    (lead) => lead.status === "Contacted"
  ).length;

  const convertedLeads = leads.filter(
    (lead) => lead.status === "Converted"
  ).length;

  return (
    <div className="app-container">
      <header className="header">
        <div>
          <h1>Lead Manager</h1>
          <p>Manage and track your business leads.</p>
        </div>
        <span className="header-tag">CRM Dashboard</span>
      </header>

      <main>
        {/* Dashboard statistics */}
        <section className="stats-grid">
          <div className="stat-card">
            <span>Total Leads</span>
            <h2>{leads.length}</h2>
          </div>

          <div className="stat-card">
            <span>New Leads</span>
            <h2>{newLeads}</h2>
          </div>

          <div className="stat-card">
            <span>Contacted</span>
            <h2>{contactedLeads}</h2>
          </div>

          <div className="stat-card">
            <span>Converted</span>
            <h2>{convertedLeads}</h2>
          </div>
        </section>

        {/* Add or edit form */}
        <section className="panel">
          <h2>{editingId ? "Edit Lead" : "Add New Lead"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <input
                name="name"
                placeholder="Full Name *"
                value={form.name}
                onChange={handleChange}
                required
                maxLength={100}
              />

              <input
                name="email"
                type="email"
                placeholder="Email Address *"
                value={form.email}
                onChange={handleChange}
                required
                maxLength={120}
              />

              <input
                name="phone"
                type="tel"
                placeholder="Phone Number *"
                value={form.phone}
                onChange={handleChange}
                required
                maxLength={20}
              />

              <input
                name="company"
                placeholder="Company"
                value={form.company}
                onChange={handleChange}
                maxLength={100}
              />

              <input
                name="source"
                placeholder="Source (LinkedIn, Website...)"
                value={form.source}
                onChange={handleChange}
                maxLength={50}
              />

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                {editingId ? "Update Lead" : "Add Lead"}
              </button>

              {editingId && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={() => {
                    setForm(initialForm);
                    setEditingId(null);
                  }}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
        </section>

        {/* Leads table */}
        <section className="panel">
          <div className="table-heading">
            <h2>All Leads</h2>

            <div className="filters">
              <input
                type="search"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p>Loading leads...</p>
          ) : filteredLeads.length === 0 ? (
            <p className="empty-message">No leads found.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Company</th>
                    <th>Source</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredLeads.map((lead) => (
                    <tr key={lead.id}>
                      <td>{lead.name}</td>
                      <td>{lead.email}</td>
                      <td>{lead.phone}</td>
                      <td>{lead.company || "-"}</td>
                      <td>{lead.source || "-"}</td>
                      <td>
                        <span
                          className={`status ${lead.status.toLowerCase()}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="edit-btn"
                          onClick={() => handleEdit(lead)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => handleDelete(lead.id)}
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
      </main>

      <footer>
        Lead Manager | Built with React, Flask and SQLite
      </footer>
    </div>
  );
}

export default App;
