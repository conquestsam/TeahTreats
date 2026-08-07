'use client';

import { useState } from 'react';
import { adminReportDefaultRange } from '@/constants/AdminReport/adminReportConstants';
import type { AdminReportDateRangeInput } from '@/types/AdminReport/adminReportTypes';

export function useAdminReportDateRange() {
  const [range, setRange] = useState<AdminReportDateRangeInput>(adminReportDefaultRange);
  const [draft, setDraft] = useState<AdminReportDateRangeInput>(adminReportDefaultRange);
  const [opened, setOpened] = useState(false);

  return {
    range,
    draft,
    opened,
    open: () => {
      setDraft(range);
      setOpened(true);
    },
    close: () => setOpened(false),
    setDraft,
    apply: () => {
      setRange(draft);
      setOpened(false);
    },
    clear: () => {
      setRange(adminReportDefaultRange);
      setDraft(adminReportDefaultRange);
      setOpened(false);
    }
  };
}
