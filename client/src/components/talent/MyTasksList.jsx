import { useState } from 'react';
import SubmitTaskModal from './SubmitTaskModal';

/* ── Timeline step configuration ──
   Each task moves through: Claimed → Submitted → Approved/Rejected */
const TIMELINE_STEPS = ['Claimed', 'Submitted', 'Reviewed'];

const getStepIndex = (status) => {
  if (status === 'Claimed')   return 0;
  if (status === 'Submitted') return 1;
  if (status === 'Approved' || status === 'Rejected') return 2;
  return -1;
};

/* ── Status badge class map ── */
const STATUS_CLASS = {
  Open:      'status-badge-Open',
  Claimed:   'status-badge-Claimed',
  Submitted: 'status-badge-Submitted',
  Approved:  'status-badge-Approved',
  Rejected:  'status-badge-Rejected',
};

/* ── Status colors for the timeline ── */
const STATUS_COLOR = {
  Claimed:   '#F59E0B',
  Submitted: '#60A5FA',
  Approved:  '#34D399',
  Rejected:  '#F87171',
};

/* ── Icons ── */
const IconCalendar = () => (
  <svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="14" height="14" rx="2"/><path d="M7 2v4M13 2v4M3 9h14"/>
  </svg>
);

const IconUpload = () => (
  <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 14V4M6 8l4-4 4 4"/><path d="M3 17h14"/>
  </svg>
);

const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10l5 5 7-7"/>
  </svg>
);

/* ── Date formatter ── */
const fmtDate = (raw) => {
  if (!raw) return null;
  try {
    const d = new Date(raw);
    if (isNaN(d)) return raw;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return raw; }
};

/* ── Deadline urgency badge ── */
const DeadlineBadge = ({ dueDate }) => {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  if (isNaN(due)) return null;
  const diffMs = due - new Date();
  const diffHours = diffMs / (1000 * 60 * 60);
  if (diffMs < 0)       return <span className="badge-overdue">⚠ Overdue</span>;
  if (diffHours <= 24)  return <span className="badge-due-soon">⏰ Due Soon</span>;
  return null;
};

/* ── Visual step timeline ── */
const TaskTimeline = ({ status }) => {
  const activeStep = getStepIndex(status);
  const isRejected = status === 'Rejected';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginTop: '12px' }}>
      {TIMELINE_STEPS.map((step, i) => {
        const done    = i < activeStep;
        const current = i === activeStep;
        const isLast  = i === TIMELINE_STEPS.length - 1;

        let dotColor = 'rgba(255,255,255,0.08)';
        let dotBorder = '1px solid rgba(255,255,255,0.1)';
        let labelColor = 'rgba(255,255,255,0.2)';
        let lineColor = 'rgba(255,255,255,0.07)';

        if (done) {
          dotColor = '#34D399';
          dotBorder = '1px solid #34D399';
          labelColor = 'rgba(255,255,255,0.45)';
          lineColor = '#34D399';
        }
        if (current) {
          const c = isRejected && isLast ? '#F87171' : STATUS_COLOR[status] || '#60A5FA';
          dotColor = c;
          dotBorder = `1px solid ${c}`;
          labelColor = c;
        }

        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center', flex: isLast ? 0 : 1 }}>
            {/* Step node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: dotColor, border: dotBorder,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: current ? `0 0 10px ${dotColor}55` : 'none',
                transition: 'all 0.3s ease',
              }}>
                {done && <IconCheck />}
              </div>
              <span style={{ fontSize: '9.5px', fontWeight: 600, color: labelColor, fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {step}
              </span>
            </div>
            {/* Connecting line */}
            {!isLast && (
              <div style={{
                flex: 1, height: '1.5px', margin: '0 4px', marginBottom: '14px',
                background: done ? lineColor : 'rgba(255,255,255,0.06)',
                transition: 'background 0.3s ease',
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ── Empty state ── */
const EmptyState = () => (
  <div style={{
    padding: '40px 24px',
    textAlign: 'center',
    background: 'rgba(255,255,255,0.015)',
    border: '1px dashed rgba(255,255,255,0.1)',
    borderRadius: '14px',
    color: 'rgba(255,255,255,0.25)',
  }}>
    <div style={{ fontSize: '32px', marginBottom: '10px' }}>🎯</div>
    <p style={{ fontSize: '14px', fontFamily: 'Inter, sans-serif', margin: 0 }}>No active tasks yet</p>
    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.15)', marginTop: '4px', fontFamily: 'Inter, sans-serif' }}>
      Claim a task below to see your progress here
    </p>
  </div>
);

/* ── Main component ── */
const MyTasksList = ({ tasks, onRefresh }) => {
  const [submitTarget, setSubmitTarget] = useState(null);

  if (!tasks || tasks.length === 0) return <EmptyState />;

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {tasks.map((task, i) => {
          const canSubmit = task.status === 'Claimed';
          const accentColor = STATUS_COLOR[task.status] || '#60A5FA';

          return (
            <div key={task._id}
              className="table-row-animate"
              style={{
                animationDelay: `${i * 0.07}s`,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderLeft: `3px solid ${accentColor}`,
                borderRadius: '12px',
                padding: '18px 20px',
                transition: 'background 0.15s, border-color 0.15s, transform 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.035)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Top row: title + action */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#E5E2E1', fontFamily: 'Inter, sans-serif', margin: 0, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {task.title || 'Untitled Task'}
                  </p>
                  {/* Due date + urgency badge */}
                  {task.dueDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11.5px', color: '#4B5563', fontFamily: 'Inter, sans-serif' }}>
                        <IconCalendar /> Due {fmtDate(task.dueDate)}
                      </span>
                      <DeadlineBadge dueDate={task.dueDate} />
                    </div>
                  )}
                </div>

                {/* Right side: status badge + optional submit button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  {canSubmit && (
                    <button
                      onClick={() => setSubmitTarget(task)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '6px 12px', borderRadius: '8px',
                        background: 'rgba(59,130,246,0.1)', color: '#60A5FA',
                        border: '1px solid rgba(59,130,246,0.25)',
                        fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
                        cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.18)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(59,130,246,0.1)'; e.currentTarget.style.borderColor = 'rgba(59,130,246,0.25)'; }}
                    >
                      <IconUpload /> Submit
                    </button>
                  )}
                  <span className={`inline-block px-2.5 py-[3px] rounded-full text-[11px] font-medium ${STATUS_CLASS[task.status] || ''}`}
                    style={{ fontFamily: 'Inter, sans-serif' }}>
                    {task.status}
                  </span>
                </div>
              </div>

              {/* Visual step timeline */}
              <TaskTimeline status={task.status} />
            </div>
          );
        })}
      </div>

      {submitTarget && (
        <SubmitTaskModal
          task={submitTarget}
          onClose={() => setSubmitTarget(null)}
          onSubmitted={() => { setSubmitTarget(null); if (onRefresh) onRefresh(); }}
        />
      )}
    </>
  );
};

export default MyTasksList;
