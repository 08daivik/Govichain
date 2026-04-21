export const formatCurrency = (amount) => {
  const numeric = Number(amount ?? 0);
  const rounded = Number.isFinite(numeric) ? Math.round(numeric) : 0;
  return `Rs. ${rounded.toLocaleString('en-IN')}`;
};

export const parseRuleList = (rules) => {
  if (!rules) return [];

  return rules
    .split('\n')
    .map((rule) => rule.trim())
    .map((rule) => rule.replace(/^[-*]\s+/, '').trim())
    .map((rule) => rule.replace(/^\d+[.)]\s+/, '').trim())
    .filter(Boolean);
};
