export const spritePresets = [
  { id: 'penguin', emoji: '\u{1F427}', label: 'Penguin' },
  { id: 'car', emoji: '\u{1F697}', label: 'Car' },
  { id: 'dog', emoji: '\u{1F415}', label: 'Dog' },
  { id: 'cat', emoji: '\u{1F408}', label: 'Cat' },
  { id: 'bird', emoji: '\u{1F426}', label: 'Bird' },
  { id: 'rabbit', emoji: '\u{1F407}', label: 'Rabbit' },
  { id: 'horse', emoji: '\u{1F40E}', label: 'Horse' },
  { id: 'snail', emoji: '\u{1F40C}', label: 'Snail' },
  { id: 'rocket', emoji: '\u{1F680}', label: 'Rocket' },
  { id: 'bicycle', emoji: '\u{1F6B2}', label: 'Bicycle' },
]

export const surfacePresets = [
  { id: 'ice', label: 'Ice', gradient: 'linear-gradient(to right, #e0f2fe, #bae6fd, #e0f2fe)' },
  { id: 'tarmac', label: 'Tarmac Road', gradient: 'linear-gradient(to right, #4b5563, #374151, #4b5563)' },
  { id: 'gravel', label: 'Gravel Road', gradient: 'linear-gradient(to right, #a8a29e, #78716c, #a8a29e)' },
  { id: 'grass', label: 'Grass', gradient: 'linear-gradient(to right, #86efac, #4ade80, #86efac)' },
  { id: 'sand', label: 'Sand', gradient: 'linear-gradient(to right, #fde68a, #fcd34d, #fde68a)' },
  { id: 'water', label: 'Water', gradient: 'linear-gradient(to right, #93c5fd, #60a5fa, #93c5fd)' },
]

export function getSurfaceDashColor(surfaceId) {
  switch (surfaceId) {
    case 'ice': return '#94a3b8'
    case 'tarmac': return '#ffffff'
    case 'gravel': return '#d6d3d1'
    case 'grass': return '#ffffff'
    case 'sand': return '#92400e'
    case 'water': return '#dbeafe'
    default: return '#ffffff'
  }
}

export function getSpriteEmoji(spriteId) {
  const preset = spritePresets.find((s) => s.id === spriteId)
  return preset ? preset.emoji : '\u{1F427}'
}

export function getSurfaceGradient(surfaceId) {
  const preset = surfacePresets.find((s) => s.id === surfaceId)
  return preset ? preset.gradient : surfacePresets[0].gradient
}
