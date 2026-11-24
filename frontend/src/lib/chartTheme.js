export function getChartTheme(isDark) {
  if (isDark) {
    return {
      tooltipStyle: {
        backgroundColor: '#070D1D',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        borderRadius: '12px',
        color: '#f8fafc',
        fontSize: '12px',
        boxShadow: '0 14px 30px rgba(0, 0, 0, 0.45)',
      },
      tooltipItemStyle: { color: '#e2e8f0' },
      tooltipLabelStyle: { color: '#94a3b8', fontWeight: 600, marginBottom: '4px' },
      gridStroke: 'rgba(148, 163, 184, 0.13)',
      axisStroke: '#94a3b8',
      polarGridStroke: 'rgba(148, 163, 184, 0.18)',
      radarAngleFill: '#cbd5e1',
      radarRadiusFill: '#64748b',
      legendStyle: { fontSize: '12px', color: '#cbd5e1' },
      cursorFill: 'rgba(148, 163, 184, 0.08)',
      primaryEmerald: '#10B981',
      primaryCyan: '#06B6D4',
      primaryAmber: '#F59E0B',
      primaryRose: '#F43F5E',
    };
  }

  return {
    tooltipStyle: {
      backgroundColor: '#FFFFFF',
      border: '1px solid rgba(15, 23, 42, 0.12)',
      borderRadius: '12px',
      color: '#0F172A',
      fontSize: '12px',
      boxShadow: '0 14px 34px -8px rgba(15, 23, 42, 0.16), 0 2px 6px rgba(15, 23, 42, 0.05)',
    },
    tooltipItemStyle: { color: '#1E293B' },
    tooltipLabelStyle: { color: '#475569', fontWeight: 600, marginBottom: '4px' },
    gridStroke: 'rgba(15, 23, 42, 0.08)',
    axisStroke: '#475569',
    polarGridStroke: 'rgba(15, 23, 42, 0.12)',
    radarAngleFill: '#334155',
    radarRadiusFill: '#64748B',
    legendStyle: { fontSize: '12px', color: '#334155' },
    cursorFill: 'rgba(5, 150, 105, 0.06)',
    primaryEmerald: '#059669',
    primaryCyan: '#0891B2',
    primaryAmber: '#D97706',
    primaryRose: '#E11D48',
  };
}
