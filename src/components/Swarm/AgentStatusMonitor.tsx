import React from 'react';
import { useStore } from '../../store/useStore';
import { Activity } from 'lucide-react';
import './Swarm.css';

const AgentStatusMonitor: React.FC = () => {
  const { agentTasks } = useStore();

  if (agentTasks.length === 0) return null;

  return (
    <div className="agent-status-monitor glass-panel">
      <div className="header">
        <Activity size={16} className="pulse-icon" />
        <span>Trạng thái Swarm AI</span>
      </div>
      <div className="task-list">
        {agentTasks.map(task => (
          <div key={task.id} className="task-item">
            <div className="task-info">
              <span className="task-desc">{task.description}</span>
              <span className={`task-status ${task.status}`}>
                {task.status === 'pending' ? 'Chờ' : task.status === 'processing' ? 'Đang xử lý' : 'Hoàn tất'}
              </span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${task.progress}%` }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgentStatusMonitor;
