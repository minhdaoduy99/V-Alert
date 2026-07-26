import React, { useState, useEffect } from 'react';
import { MapPin, X } from 'lucide-react';
import { useStore, type Alert } from '../../store/useStore';

const CitizenReporter: React.FC = () => {
  const { 
    isReportMode, 
    setReportMode, 
    draftReportLocation, 
    setDraftReportLocation,
    addAlert,
    addAgentTask,
    updateAgentTask
  } = useStore();
  
  const [type, setType] = useState<Alert['type']>('Ngập lụt');
  const [severity, setSeverity] = useState<Alert['severity']>('Cảnh báo');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Close report mode if user presses escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setReportMode(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [setReportMode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftReportLocation) return;
    
    setSubmitting(true);
    const taskId = 'task-' + Date.now();
    const alertId = 'alert-' + Date.now();
    
    // Simulate AI Swarm verification process
    addAgentTask({
      id: taskId,
      description: 'AI đang phân tích ảnh báo cáo...',
      status: 'processing',
      progress: 30
    });

    setTimeout(() => {
      updateAgentTask(taskId, { progress: 60, description: 'Đang đối chiếu dữ liệu vệ tinh & cảm biến IoT...' });
      
      // Publish the unverified alert immediately
      addAlert({
        id: alertId,
        type,
        severity,
        location: draftReportLocation,
        description,
        timestamp: new Date(),
        verified: false
      });
      
      // Cleanup UI form
      setReportMode(false);
      setDraftReportLocation(null);
      setDescription('');
      setSubmitting(false);

      // Finish verification 3 seconds later
      setTimeout(() => {
        updateAgentTask(taskId, { progress: 100, status: 'completed', description: 'Xác minh hoàn tất. Cảnh báo đã được duyệt.' });
        useStore.getState().updateAlert(alertId, { verified: true });
      }, 3000);

    }, 1500);
  };

  return (
    <div style={{ position: 'absolute', bottom: '20px', right: '20px', zIndex: 1000 }}>
      {!isReportMode ? (
        <button className="btn btn-danger" onClick={() => setReportMode(true)} style={{ padding: '12px 24px', fontSize: '16px' }}>
          <MapPin size={20} /> Báo cáo điểm nguy hiểm
        </button>
      ) : (
        <div className="glass-panel" style={{ width: '340px', display: 'flex', flexDirection: 'column' }}>
          {!draftReportLocation ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <MapPin size={32} color="#ef4444" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ marginBottom: '8px' }}>Chế độ báo cáo</h3>
              <p style={{ fontSize: '14px', color: '#64748b' }}>
                Vui lòng nhấp vào một điểm trên bản đồ để chọn vị trí sự cố.
              </p>
              <button className="btn" onClick={() => setReportMode(false)} style={{ marginTop: '16px', background: 'transparent', color: '#64748b', border: '1px solid #cbd5e1' }}>
                Hủy báo cáo
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px' }}>Chi tiết sự cố</h3>
                <button type="button" onClick={() => setDraftReportLocation(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                  <X size={18} />
                </button>
              </div>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Loại thiên tai</label>
                <select value={type} onChange={e => setType(e.target.value as any)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.5)' }}>
                  <option value="Ngập lụt">Ngập lụt</option>
                  <option value="Sạt lở">Sạt lở</option>
                  <option value="Cháy rừng">Cháy rừng</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Mức độ nghiêm trọng</label>
                <select value={severity} onChange={e => setSeverity(e.target.value as any)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.5)' }}>
                  <option value="Cảnh báo">Cảnh báo (Màu Vàng)</option>
                  <option value="Nguy cơ cao">Nguy cơ cao (Màu Cam)</option>
                  <option value="Đặc biệt nguy hiểm">Đặc biệt nguy hiểm (Màu Đỏ)</option>
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Mô tả chi tiết</label>
                <textarea 
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ví dụ: Nước ngập qua đầu gối, xe cộ không thể di chuyển..."
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'rgba(255,255,255,0.5)', minHeight: '60px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', fontWeight: 600 }}>Hình ảnh minh chứng</label>
                <input type="file" accept="image/*" style={{ fontSize: '12px' }} />
              </div>

              <button type="submit" className="btn btn-danger" style={{ width: '100%' }} disabled={submitting}>
                {submitting ? 'Đang gửi...' : 'Gửi Báo Cáo'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default CitizenReporter;
