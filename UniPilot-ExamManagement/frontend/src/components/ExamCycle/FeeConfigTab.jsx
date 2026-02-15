import { useState, useEffect } from "react";
import {
  getFeeConfigByCycle,
  createFeeConfig,
  updateFeeConfig,
  addLatFeeSlab,
  updateLatFeeSlab,
  deleteLatFeeSlab,
  calculateFee,
} from "../../services/examCycleService";
import "./FeeConfigTab.css";

export default function FeeConfigTab({ cycleId }) {
  const [feeConfig, setFeeConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [feePreview, setFeePreview] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    base_fee: "",
    regular_start_date: "",
    regular_end_date: "",
    final_registration_date: "",
  });

  // New slab form
  const [newSlab, setNewSlab] = useState({
    start_date: "",
    end_date: "",
    fine_amount: "",
  });

  const [showAddSlab, setShowAddSlab] = useState(false);

  useEffect(() => {
    loadFeeConfig();
  }, [cycleId]);

  const loadFeeConfig = async () => {
    setLoading(true);
    try {
      const response = await getFeeConfigByCycle(cycleId);
      setFeeConfig(response.data.data);
      setFormData({
        base_fee: response.data.data.base_fee,
        regular_start_date: response.data.data.regular_start_date,
        regular_end_date: response.data.data.regular_end_date,
        final_registration_date: response.data.data.final_registration_date,
      });
    } catch (err) {
      if (err.response?.status === 404) {
        // No fee config yet
        setFeeConfig(null);
        setEditing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    const { regular_start_date, regular_end_date, final_registration_date } =
      formData;

    if (new Date(regular_start_date) > new Date(regular_end_date)) {
      alert("Regular start date cannot be after regular end date");
      setLoading(false);
      return;
    }
    if (new Date(regular_end_date) > new Date(final_registration_date)) {
      alert("Regular end date cannot be after final registration date");
      setLoading(false);
      return;
    }

    try {
      if (feeConfig) {
        await updateFeeConfig(feeConfig.id, formData);
      } else {
        await createFeeConfig(cycleId, { ...formData, slabs: [] });
      }
      await loadFeeConfig();
      setEditing(false);
    } catch (err) {
      alert(
        "Failed to save fee configuration: " +
          (err.response?.data?.error || err.message),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlab = async (e) => {
    e.preventDefault();
    const { start_date, end_date } = newSlab;
    if (new Date(start_date) > new Date(end_date)) {
      alert("Start date cannot be after end date for late fee slabs");
      setLoading(false);
      return;
    }

    try {
      await addLatFeeSlab(feeConfig.id, newSlab);
      await loadFeeConfig();
      setNewSlab({ start_date: "", end_date: "", fine_amount: "" });
      setShowAddSlab(false);
    } catch (err) {
      alert("Failed to add late fee slab");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlab = async (slabId) => {
    if (!confirm("Delete this late fee slab?")) return;

    try {
      await deleteLatFeeSlab(slabId);
      await loadFeeConfig();
    } catch (err) {
      alert("Failed to delete slab");
    }
  };

  const handleCalculateFee = async () => {
    try {
      const response = await calculateFee(cycleId);
      setFeePreview(response.data.data);
    } catch (err) {
      alert("Failed to calculate fee");
    }
  };

  if (loading && !feeConfig) {
    return <div className="loading">Loading fee configuration...</div>;
  }

  if (!feeConfig && !editing) {
    return (
      <div className="empty-state">
        <div className="empty-icon">💰</div>
        <h3>No Fee Configuration</h3>
        <p>Set up the exam fee and late fee slabs</p>
        <button onClick={() => setEditing(true)} className="btn-primary">
          Configure Fee
        </button>
      </div>
    );
  }

  return (
    <div className="fee-config-tab">
      {editing ? (
        <form onSubmit={handleCreateOrUpdate} className="fee-config-form">
          <h3>
            {feeConfig ? "Edit Fee Configuration" : "Create Fee Configuration"}
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label>Base Exam Fee (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.base_fee}
                onChange={(e) =>
                  setFormData({ ...formData, base_fee: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Regular Start Date *</label>
              <input
                type="date"
                value={formData.regular_start_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    regular_start_date: e.target.value,
                  })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Regular End Date *</label>
              <input
                type="date"
                value={formData.regular_end_date}
                onChange={(e) =>
                  setFormData({ ...formData, regular_end_date: e.target.value })
                }
                required
              />
            </div>

            <div className="form-group">
              <label>Final Registration Date *</label>
              <input
                type="date"
                value={formData.final_registration_date}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    final_registration_date: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="form-actions">
            {feeConfig && (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
            )}
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? "Saving..."
                : feeConfig
                  ? "Update Configuration"
                  : "Create Configuration"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="fee-config-view">
            <div className="config-header">
              <h3>Fee Configuration</h3>
              <button
                onClick={() => setEditing(true)}
                className="btn-secondary"
              >
                Edit Configuration
              </button>
            </div>

            <div className="config-details">
              <div className="detail-row">
                <span className="label">Base Fee:</span>
                <span className="value">₹{feeConfig.base_fee}</span>
              </div>
              <div className="detail-row">
                <span className="label">Regular Period:</span>
                <span className="value">
                  {new Date(feeConfig.regular_start_date).toLocaleDateString()}{" "}
                  - {new Date(feeConfig.regular_end_date).toLocaleDateString()}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Final Registration Date:</span>
                <span className="value">
                  {new Date(
                    feeConfig.final_registration_date,
                  ).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="late-fee-slabs">
            <div className="section-header">
              <h3>Late Fee Slabs</h3>
              <button
                onClick={() => setShowAddSlab(!showAddSlab)}
                className="btn-primary"
              >
                {showAddSlab ? "Cancel" : "+ Add Slab"}
              </button>
            </div>

            {showAddSlab && (
              <form onSubmit={handleAddSlab} className="add-slab-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      value={newSlab.start_date}
                      onChange={(e) =>
                        setNewSlab({ ...newSlab, start_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date *</label>
                    <input
                      type="date"
                      value={newSlab.end_date}
                      onChange={(e) =>
                        setNewSlab({ ...newSlab, end_date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Fine Amount (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newSlab.fine_amount}
                      onChange={(e) =>
                        setNewSlab({ ...newSlab, fine_amount: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  Add Slab
                </button>
              </form>
            )}

            {feeConfig.slabs && feeConfig.slabs.length > 0 ? (
              <div className="slabs-table">
                <table>
                  <thead>
                    <tr>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Fine Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeConfig.slabs.map((slab) => (
                      <tr key={slab.id}>
                        <td>
                          {new Date(slab.start_date).toLocaleDateString()}
                        </td>
                        <td>{new Date(slab.end_date).toLocaleDateString()}</td>
                        <td>₹{slab.fine_amount}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteSlab(slab.id)}
                            className="btn-icon-danger"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-slabs">No late fee slabs configured</p>
            )}
          </div>

          <div className="fee-preview">
            <h3>Fee Preview</h3>
            <button onClick={handleCalculateFee} className="btn-secondary">
              Calculate Current Fee
            </button>
            {feePreview && (
              <div
                className={`preview-result ${feePreview.blocked ? "blocked" : ""}`}
              >
                <div className="preview-row">
                  <span>Base Fee:</span>
                  <span>₹{feePreview.base_fee}</span>
                </div>
                <div className="preview-row">
                  <span>Late Fine:</span>
                  <span>₹{feePreview.late_fine}</span>
                </div>
                <div className="preview-row total">
                  <span>Total Payable:</span>
                  <span>₹{feePreview.total}</span>
                </div>
                <div className="preview-message">{feePreview.message}</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
