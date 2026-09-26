export const isStaff = (user) => {
  if (!user) return false
  if (user.is_staff || user.is_superuser) return true
  return (user.roles || []).some((r) =>
    ['Superadmin', 'Coordinación Central', 'Moderador', 'EditorPublicaciones'].includes(r),
  )
}

export const hasRole = (user, nombre) => {
  if (!user) return false
  if (user.is_superuser && nombre === 'Superadmin') return true
  return (user.roles || []).includes(nombre)
}

export const hasPermiso = (user, codename) => {
  if (!user) return false
  if (user.is_staff || user.is_superuser) return true
  return (user.permisos || []).includes(codename)
}
