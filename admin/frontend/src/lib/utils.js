export function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateShort(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function timeAgo(iso) {
  if (!iso) return '—'
  const now = new Date()
  const then = new Date(iso)
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60)      return `${diff}s ago`
  if (diff < 3600)    return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)   return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`
  return formatDateShort(iso)
}

export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function truncate(str, n = 28) {
  if (!str) return ''
  return str.length > n ? str.slice(0, n) + '…' : str
}

export function getUserInitials(user) {
  if (user.name) {
    const parts = user.name.trim().split(' ')
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  if (user.email) return user.email.slice(0, 2).toUpperCase()
  return user.user_id.slice(0, 2).toUpperCase()
}

export function getDisplayName(user) {
  return user.name || user.email || truncate(user.user_id, 16)
}

const AVATAR_COLORS = [
  '#4F8CFF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899',
]
export function getAvatarColor(userId) {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
