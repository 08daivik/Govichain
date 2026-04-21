import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';
import './ProjectCard.css';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    const badges = {
      CREATED: 'badge-info',
      IN_PROGRESS: 'badge-warning',
      COMPLETED: 'badge-success',
    };
    return badges[status] || 'badge-info';
  };

  return (
    <div className="project-card" onClick={() => navigate(`/projects/${project.id}`)}>
      <div className="project-card-header">
        <h3>{project.name}</h3>
        <span className={`badge ${getStatusBadge(project.status)}`}>
          {project.status.replace('_', ' ')}
        </span>
      </div>
      
      <p className="project-description">{project.description || 'No description'}</p>
      
      <div className="project-card-footer">
        <div className="project-budget">
          <span className="label">Budget:</span>
          <span className="value">{formatCurrency(project.budget)}</span>
        </div>
        <button className="btn btn-primary btn-sm">View Details</button>
      </div>
    </div>
  );
};

export default ProjectCard;
