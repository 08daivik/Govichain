import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '../../services/api';
import { parseRuleList } from '../../utils/formatters';
import './CreateProject.css';

const CreateProject = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedRules, setGeneratedRules] = useState('');

  const rulesList = parseRuleList(generatedRules);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const projectData = {
        ...formData,
        budget: parseFloat(formData.budget),
      };

      const res = await projectsAPI.create(projectData);
      const rules =
        res.data?.compliance_rules ||
        res.data?.project?.compliance_rules;

      setGeneratedRules(rules || '');
      alert('Project created successfully.');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-project-page">
      <div className="page-header">
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          Back
        </button>
        <h1>Create New Project</h1>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="project-form">
          {error && (
            <div className="error-banner">
              <span>Error</span>
              <p>{error}</p>
            </div>
          )}

          <div className="form-group">
            <label>Project Name *</label>
            <input
              type="text"
              name="name"
              placeholder="e.g., Highway Construction Project"
              value={formData.name}
              onChange={handleChange}
              required
              minLength={3}
            />
            <small>Minimum 3 characters</small>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              placeholder="Describe the project objectives, scope, and expected outcomes..."
              value={formData.description}
              onChange={handleChange}
              rows={5}
            />
          </div>

          <div className="form-group">
            <label>Budget (Rs.) *</label>
            <input
              type="number"
              name="budget"
              placeholder="e.g., 10000000"
              value={formData.budget}
              onChange={handleChange}
              required
              min="1"
              step="0.01"
            />
            <small>Budget must be greater than 0</small>
          </div>

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
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>

        {rulesList.length > 0 && (
          <div className="ai-rules-card">
            <div className="ai-header">
              <h3>AI Generated Compliance</h3>
              <span className="ai-badge">Smart Rules</span>
            </div>

            <div className="rules-list">
              {rulesList.map((rule, i) => (
                <div key={i} className="rule-item">
                  <span className="rule-icon">{i + 1}</span>
                  <p>{rule}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="info-card">
          <h3>Project Creation Tips</h3>
          <ul>
            <li>Choose a clear, descriptive project name</li>
            <li>Provide detailed objectives and scope</li>
            <li>Set a realistic budget allocation</li>
            <li>Projects start with "CREATED" status</li>
            <li>AI will generate compliance rules automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
