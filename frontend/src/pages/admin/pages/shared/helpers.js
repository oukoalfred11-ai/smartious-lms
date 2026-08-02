export const avColor = (name) => {
  const tokens = ['#7D1025', '#A51C2E', '#C9A030', '#15803D', '#7C2D12', '#1E3A8A']
  let hash = 0
  for (let i = 0; i < (name || '').length; i++) hash = ((hash << 5) - hash) + name.charCodeAt(i)
  return tokens[Math.abs(hash) % tokens.length]
}

export const initials = (firstName = '', lastName = '') => {
  const a = (firstName[0] || '?').toUpperCase()
  const b = (lastName[0] || '').toUpperCase()
  return a + b
}

export const fmtKsh = (n) => 'KSh ' + Math.round(n || 0).toLocaleString('en-KE')

export const fmtDate = (d) => {
  if (!d) return 'N/A'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const greetingText = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
