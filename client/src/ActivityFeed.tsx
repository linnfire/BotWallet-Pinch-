import { useEffect, useMemo, useRef, useState } from 'react';
import type { Activity } from './types';

interface Props { activity: Activity; }
const statusIcon: Record<string, string> = {
  pending: '○',
  active: '⟳',
  complete: '✓',
  locked: '🔐',
  attention: '!',
};

export function ActivityFeed({ activity }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [visibleCount, setVisibleCount] = useState(Math.min(1, activity.steps.length));
  const previousStatus = useRef<Record<string, string>>({});

  useEffect(() => {
    if (!activity.steps.length) return;
    if (visibleCount >= activity.steps.length) return;
    const timer = window.setTimeout(() => {
      setVisibleCount((current) => Math.min(current + 1, activity.steps.length));
    }, 190);
    return () => window.clearTimeout(timer);
  }, [activity.steps.length, visibleCount]);

  const completeCount = useMemo(() => activity.steps.filter((step) => step.status === 'complete').length, [activity.steps]);
  const visibleSteps = activity.steps.slice(0, visibleCount);

  return <section className="activity-feed glass">
    <button className="activity-head" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded}>
      <span className="bot-mark">◈</span>
      <span>
        <b>{activity.title}</b>
        <small>{completeCount}/{activity.steps.length} tasks complete</small>
      </span>
      <span className="chevron">⌄</span>
    </button>

    {expanded && <div className="activity-steps">
      {visibleSteps.map((step, index) => {
        const key = `${step.label}-${index}`;
        const showStatusPop = previousStatus.current[key] && previousStatus.current[key] !== step.status;
        previousStatus.current[key] = step.status;
        return <div className={`activity-step ${step.status} ${showStatusPop ? 'status-pop' : ''}`} key={key}>
          <span className="step-icon" aria-hidden="true">{statusIcon[step.status]}</span>
          <span>
            <b>{step.label}</b>
            {step.detail && <small>{step.detail}</small>}
          </span>
        </div>;
      })}
    </div>}
  </section>;
}
