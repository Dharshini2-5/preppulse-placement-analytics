function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function escapeCsvCell(val) {
  const str = val === null || val === undefined ? '' : String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportDashboardJson({ dashboard, workspaceName, planName }) {
  const dateStamp = new Date().toISOString().slice(0, 10);
  const payload = {
    exportedAt: new Date().toISOString(),
    platform: 'PrepPulse Analytics SaaS',
    workspace: workspaceName || 'Anna Univ — ECE 2027',
    subscriptionPlan: planName || 'Placement Pro',
    user: dashboard?.user || null,
    readiness: dashboard?.readiness || null,
    categoryAverages: dashboard?.categoryAverages || [],
    radarSkills: dashboard?.radarSkills || [],
    skillSnapshots: dashboard?.skillSnapshots || [],
    assessments: dashboard?.assessments || [],
    codingActivities: dashboard?.codingActivities || [],
    recommendations: dashboard?.recommendations || [],
    mentorFeedback: dashboard?.mentorFeedback || [],
  };

  const filename = `preppulse-readiness-report-${dateStamp}.json`;
  triggerDownload(JSON.stringify(payload, null, 2), filename, 'application/json;charset=utf-8');
  return filename;
}

export function exportDashboardCsv({ dashboard, workspaceName, planName }) {
  const dateStamp = new Date().toISOString().slice(0, 10);
  const rows = [];

  rows.push(['PrepPulse Analytics — Full Placement Readiness Export']);
  rows.push(['Exported At', new Date().toISOString()]);
  rows.push(['Workspace', workspaceName || 'Anna Univ — ECE 2027']);
  rows.push(['Plan', planName || 'Placement Pro']);
  rows.push([]);

  if (dashboard?.user && dashboard?.readiness) {
    const u = dashboard.user;
    const r = dashboard.readiness;
    rows.push(['SECTION: CANDIDATE & READINESS SUMMARY']);
    rows.push([
      'Full Name',
      'Email',
      'Role',
      'Department',
      'Batch',
      'CGPA',
      'Target Tier',
      'Readiness Index',
      'Readiness Band',
      'Gap To Target',
      'Weighted Assessment Avg (%)',
      'Problems Solved',
      'Coding Accuracy (%)',
      'Trend Slope',
      'Peak Streak (wks)',
    ]);
    rows.push([
      u.fullName,
      u.email,
      u.role,
      u.department,
      u.batchYear,
      u.cgpa,
      r.targetTier,
      r.readinessIndex,
      r.readinessBand,
      r.gapToTarget,
      r.assessmentAverage,
      r.totalProblemsSolved,
      r.codingAccuracyAvg,
      r.trendSlope,
      r.maxWeeklyStreak,
    ]);
    rows.push([]);

    rows.push(['SECTION: 5-FACTOR READINESS DECOMPOSITION']);
    rows.push(['Factor', 'Score', 'Max']);
    rows.push(['Weighted Assessments', r.assessmentComponent, 35]);
    rows.push(['Difficulty-Weighted Coding', r.codingComponent, 30]);
    rows.push(['Skill Progression & Core CS', r.skillProgressionComponent, 15]);
    rows.push(['Assessment Momentum Slope', r.momentumBonus, 10]);
    rows.push(['CGPA & Mock Baseline', r.academicMockComponent, 10]);
    rows.push(['Recommendation Workflow Boost', r.recommendationBoost, 5]);
    rows.push([]);
  }

  if (dashboard?.assessments?.length) {
    rows.push(['SECTION: ASSESSMENTS LEDGER']);
    rows.push(['ID', 'Title', 'Category', 'Difficulty', 'Score', 'Max Score', 'Percentage', 'Percentile', 'Date']);
    dashboard.assessments.forEach((a) => {
      rows.push([
        a.id,
        a.title,
        a.category,
        a.difficulty,
        a.score,
        a.maxScore,
        a.percentage,
        Math.round(a.percentile || 0),
        a.takenAt,
      ]);
    });
    rows.push([]);
  }

  if (dashboard?.codingActivities?.length) {
    rows.push(['SECTION: CODING TOPIC TELEMETRY']);
    rows.push(['Topic', 'Easy', 'Medium', 'Hard', 'Accuracy (%)', 'Avg Solve (min)', 'Weekly Streak', 'Mastery (%)']);
    dashboard.codingActivities.forEach((c) => {
      rows.push([
        c.topic,
        c.easySolved,
        c.mediumSolved,
        c.hardSolved,
        c.accuracyRate,
        c.avgSolveMinutes,
        c.weeklyStreak,
        c.masteryScore,
      ]);
    });
    rows.push([]);
  }

  if (dashboard?.recommendations?.length) {
    rows.push(['SECTION: AI PREPARATION WORKFLOWS']);
    rows.push(['Priority', 'Category', 'Title', 'Impact (+pts)', 'Status', 'Resource Tag']);
    dashboard.recommendations.forEach((rec) => {
      rows.push([
        rec.priority,
        rec.category,
        rec.title,
        rec.estimatedImpactPoints,
        rec.completed ? 'COMPLETED' : 'PENDING',
        rec.resourceTag,
      ]);
    });
  }

  const csvText = rows.map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
  const filename = `preppulse-readiness-report-${dateStamp}.csv`;
  triggerDownload(csvText, filename, 'text/csv;charset=utf-8');
  return filename;
}
