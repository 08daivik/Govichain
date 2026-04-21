import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { milestonesAPI, projectsAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import AIReportCard from '../../components/AIReportCard';
import { formatCurrency } from '../../utils/formatters';
import './MilestoneReview.css';

const AIRecommendationCard = ({ report }) => {
  if (!report?.auditor_recommendation) return null;

  const isAccept = report.auditor_recommendation === 'ACCEPT';

  return (
    <div className="ai-rec-card-inline">
      <div className="ai-rec-header">
        <span className="ai-label">AI Recommendation</span>
        <span className={`rec-badge ${isAccept ? 'accept' : 'flag'}`}>
          {report.auditor_recommendation}
        </span>
      </div>

      <p className="ai-rec-text">{report.reason}</p>

      <div className="confidence-section">
        <div className="confidence-bar">
          <div
            className="confidence-fill"
            style={{ width: `${report.confidence}%` }}
          />
        </div>
        <span className="confidence-text">
          Confidence: {report.confidence}%
        </span>
      </div>
    </div>
  );
};

const MilestoneReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [milestone, setMilestone] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAIReport, setShowAIReport] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const loadMilestoneDetails = useCallback(async () => {
    try {
      setLoading(true);
      const milestoneRes = await milestonesAPI.getById(id);
      setMilestone(milestoneRes.data);

      const projectRes = await projectsAPI.getById(milestoneRes.data.project_id);
      setProject(projectRes.data);
    } catch (error) {
      console.error('Failed to load milestone data:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMilestoneDetails();
  }, [loadMilestoneDetails]);

  const handleApprove = async () => {
    if (!window.confirm('Are you sure you want to approve this milestone?')) return;
    try {
      setActionLoading(true);
      await milestonesAPI.approve(id);
      alert('Milestone approved successfully.');
      navigate('/milestones/pending');
    } catch (error) {
      alert('Approval failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlag = async () => {
    if (!window.confirm('Are you sure you want to flag this milestone as suspicious?')) return;
    try {
      setActionLoading(true);
      await milestonesAPI.flag(id);
      alert('Milestone flagged successfully.');
      navigate('/milestones/pending');
    } catch (error) {
      alert('Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to reject this milestone?')) return;
    try {
      setActionLoading(true);
      await milestonesAPI.reject(id);
      alert('Milestone rejected successfully.');
      navigate('/milestones/pending');
    } catch (error) {
      alert('Rejection failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching milestone details..." />;
  if (!milestone) return <div className="error-state">Milestone not found.</div>;

  const canApprove = ['PENDING', 'FLAGGED'].includes(milestone.status);
  const canFlag = milestone.status === 'PENDING';
  const canReject = milestone.status === 'FLAGGED';
  const isCompletedReview = ['APPROVED', 'REJECTED'].includes(milestone.status);

  return (
    <div className="milestone-review-page">
      <div className="page-header">
        <button className="btn btn-outline" onClick={() => navigate(-1)}>
          Back
        </button>
        <div className="header-titles">
          <h1>Review Milestone</h1>
          <span className="milestone-id">Milestone Ref: #{id}</span>
        </div>
      </div>

      <div className="review-container">
        <div className="left-panel">
          <div className="milestone-card card">
            <div className="card-header-flex">
              <h2 className="section-title">Milestone Details</h2>
              <span className={`status-pill ${milestone.status?.toLowerCase()}`}>
                {milestone.status}
              </span>
            </div>

            <div className="info-grid">
              <div className="info-item full-width">
                <label>Title</label>
                <p className="title-text">{milestone.title}</p>
              </div>

              <div className="info-item full-width">
                <label>Description</label>
                <div className={`description-container ${isDescExpanded ? 'expanded' : ''}`}>
                  <p>{milestone.description}</p>
                </div>
                {milestone.description?.length > 150 && (
                  <button
                    className="text-toggle-btn"
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                  >
                    {isDescExpanded ? 'Show Less' : 'Read Full Description'}
                  </button>
                )}
              </div>

              <div className="info-item">
                <label>Requested Amount</label>
                <p className="amount-highlighted">{formatCurrency(milestone.requested_amount)}</p>
              </div>

              <div className="info-item">
                <label>Submission Date</label>
                <p>{new Date(milestone.created_at || Date.now()).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</p>
              </div>
            </div>

            {project && (
              <div className="project-sub-section">
                <h3 className="sub-section-title">Project Context</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Project Name</label>
                    <p className="semi-bold">{project.name}</p>
                  </div>
                  <div className="info-item">
                    <label>Total Project Budget</label>
                    <p>{formatCurrency(project.budget)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="right-panel card">
          <h3 className="right-panel-title">Review Actions</h3>
          <p className="instruction-text">
            Carefully review the deliverables. Pending milestones can be flagged for concern, and flagged milestones can be either approved or rejected.
          </p>

          {!isCompletedReview ? (
            <div className="action-buttons">
              <button
                className="btn btn-success btn-full"
                onClick={handleApprove}
                disabled={actionLoading || !canApprove}
              >
                Approve Milestone
              </button>

              {canFlag && (
                <button
                  className="btn btn-danger btn-full"
                  onClick={handleFlag}
                  disabled={actionLoading}
                >
                  Flag as Suspicious
                </button>
              )}

              {canReject && (
                <button
                  className="btn btn-danger btn-full"
                  onClick={handleReject}
                  disabled={actionLoading}
                >
                  Reject Milestone
                </button>
              )}
            </div>
          ) : (
            <div className="review-status-note">
              This milestone has already been {milestone.status.toLowerCase()}.
            </div>
          )}

          <div className="review-guidelines">
            <p>AUDITOR GUIDELINES:</p>
            <ul>
              <li>Confirm evidence matches description</li>
              <li>Validate amount against budget</li>
              <li>Check for regulatory compliance</li>
            </ul>
          </div>

          <div className="ai-integration-box">
            <AIRecommendationCard report={milestone.ai_report} />

            <button
              className="btn-ai-toggle"
              onClick={() => setShowAIReport(!showAIReport)}
            >
              {showAIReport ? 'Hide Detailed AI Report' : 'View Full AI Report'}
            </button>

            {showAIReport && (
              <AIReportCard
                report={milestone.ai_report}
                score={milestone.ai_score}
                flags={milestone.ai_flags}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneReview;
