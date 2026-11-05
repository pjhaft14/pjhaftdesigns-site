(() => {
  'use strict';
  const today = new Date();
  const closeDate = (day, offset = 0) => new Date(today.getFullYear(), today.getMonth() + offset, day, 12);
  const records = [
    ['Summit expansion', 'Summit Technologies', 'apac', 'Negotiation', 148000, 22, 0, 'Maya Chen', 'MC', 'Confirm final scope with the regional team and align on the rollout plan.'],
    ['Atlas platform rollout', 'Atlas Financial', 'emea', 'Proposal', 96000, 23, 0, 'James Wilson', 'JW', 'The proposal is with the buying team. Follow up on implementation timing.'],
    ['Meridian enterprise plan', 'Meridian Group', 'apac', 'Proposal', 210000, 25, 0, 'Maya Chen', 'MC', 'Review regional requirements before the next stakeholder meeting.'],
    ['Northstar renewal', 'Northstar Logistics', 'amer', 'Negotiation', 84000, 27, 0, 'Alex Morgan', 'AM', 'Prepare the renewal summary and confirm the agreed service levels.'],
    ['Pacific workspace expansion', 'Pacific Industries', 'apac', 'Qualification', 67500, 28, 0, 'Priya Patel', 'PP', 'Schedule a discovery call with the wider sales operations team.'],
    ['Evergreen team plan', 'Evergreen Partners', 'mena', 'Discovery', 54000, 30, 0, 'Sofia Rivera', 'SR', 'Map the team’s current workflow and confirm the decision process.'],
    ['Horizon regional rollout', 'Horizon Systems', 'apac', 'Proposal', 175000, 4, 1, 'Priya Patel', 'PP', 'Share the updated proposal with the regional sales lead.'],
    ['Cedar new business', 'Cedar Health', 'latam', 'Qualification', 72000, 6, 1, 'Alex Morgan', 'AM', 'Validate the initial scope and agree on the next demonstration.'],
    ['Vertex sales enablement', 'Vertex Labs', 'emea', 'Proposal', 128000, 9, 1, 'James Wilson', 'JW', 'Confirm success criteria with the enablement team.'],
    ['Orion growth plan', 'Orion Digital', 'ssa', 'Discovery', 48000, 12, 1, 'Maya Chen', 'MC', 'Explore how the team tracks opportunities across its regional offices.'],
    ['Brookfield license expansion', 'Brookfield Services', 'na', 'Negotiation', 112000, 16, 1, 'Sofia Rivera', 'SR', 'Check the final license count before sending the agreement.'],
    ['Lumen regional platform', 'Lumen Networks', 'apac', 'Qualification', 136000, 18, 1, 'Maya Chen', 'MC', 'Bring the regional sponsor into the next discovery session.'],
  ].map((r, index) => ({ id: `opp-${index + 1}`, name: r[0], account: r[1], region: r[2], stage: r[3], amount: r[4], close: closeDate(r[5], r[6]), owner: r[7], initials: r[8], note: r[9] }));
  window.CFOpportunities = { today, records };
})();
