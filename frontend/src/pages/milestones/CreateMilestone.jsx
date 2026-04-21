import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { projectsAPI, milestonesAPI } from '../../services/api';
import { parseRuleList } from '../../utils/formatters';
import './CreateMilestone.css';

const CreateMilestone = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    project_id: location.state?.projectId || '',
    title: '',
    description: '',
    requested_amount: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const res = await projectsAPI.getAll();
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedProject = projects.find(
    (project) => project.id === parseInt(formData.project_id)
  );
  const projectRules = parseRuleList(selectedProject?.compliance_rules);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setAiResult(null);
    setError('');
  };

  const handleCheckCompliance = async () => {
    if (!formData.description || !selectedProject) return;

    setChecking(true);

    try {
      const res = await milestonesAPI.evaluate({
        rules: selectedProject.compliance_rules,
        milestone: formData.description,
      });
      setAiResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (aiResult?.verdict === 'REJECTED') {
      alert('Fix compliance issues before submitting.');
      return;
    }

    setLoading(true);

    try {
      await milestonesAPI.create({
        ...formData,
        project_id: parseInt(formData.project_id),
        requested_amount: parseFloat(formData.requested_amount),
      });

      alert('Milestone created successfully.');
      navigate(`/projects/${formData.project_id}`);
    } catch (err) {
      const detail = err.response?.data?.detail;

      if (detail?.ai) {
        setAiResult(detail.ai);
      }

      setError(
        typeof detail === 'string'
          ? detail
          : detail?.message || 'Failed to create milestone'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-milestone-page">
      <div className="page-header">
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          Back
        </button>
        <h1>Create New Milestone</h1>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="milestone-form">
          {error && <div className="error-banner">{error}</div>}

          <div className="form-group">
            <label>Select Project *</label>
            <select
              name="project_id"
              value={formData.project_id}
              onChange={handleChange}
              required
            >
              <option value="">-- Choose a project --</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Milestone Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>

            <div className="description-box">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Describe milestone..."
              />

              <button
                type="button"
                className="ai-check-btn"
                onClick={handleCheckCompliance}
                disabled={checking || !formData.description}
              >
                {checking ? 'Analyzing...' : 'Analyze with AI'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Requested Amount (Rs.) *</label>
            <input
              type="number"
              name="requested_amount"
              value={formData.requested_amount}
              onChange={handleChange}
              required
            />
          </div>

          {aiResult && (
            <div className="ai-result-inline">
              <div className="ai-result-top">
                <span className="ai-title">AI Analysis</span>

                <span className={`verdict-badge ${aiResult.verdict.toLowerCase()}`}>
                  {aiResult.verdict}
                </span>
              </div>

              <div className="ai-score-row">
                <div className="ai-score-circle">
                  {aiResult.score}%
                </div>

                <p className="ai-summary">
                  {aiResult.summary}
                </p>
              </div>

              {aiResult.issues?.length > 0 && (
                <div className="ai-issues-modern">
                  {aiResult.issues.slice(0, 4).map((issue, i) => (
                    <div key={i} className="issue-item">
                      Issue: {issue}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Milestone'}
            </button>
          </div>
        </form>

        <div className="ai-panel">
          {selectedProject?.compliance_rules && (
            <div className="ai-card">
              <h3>Compliance Rules</h3>
              {projectRules.map((rule, i) => (
                <div key={i} className="rule-chip">{rule}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateMilestone;
