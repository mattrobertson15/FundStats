export function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function fromSlug(slug, raises) {
  return raises.find(r => toSlug(r.company) === slug) || null
}
