'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertsPanel } from './alerts-panel';
import { detectAlerts } from '@/lib/alerts';
import { loadThresholds } from './threshold-settings';
import type { DataRow, Thresholds } from '@/lib/types';

interface Props {
  rows: DataRow[];
  defaultThresholds: Thresholds;
}

export function AlertsClient({ rows, defaultThresholds }: Props) {
  const [thresholds, setThresholds] = useState<Thresholds>(defaultThresholds);

  useEffect(() => {
    setThresholds(loadThresholds(defaultThresholds));
    const handler = () => setThresholds(loadThresholds(defaultThresholds));
    window.addEventListener('thresholds-changed', handler);
    return () => window.removeEventListener('thresholds-changed', handler);
  }, [defaultThresholds]);

  const alerts = useMemo(() => detectAlerts(rows, thresholds), [rows, thresholds]);
  return <AlertsPanel alerts={alerts} total={alerts.length} />;
}
