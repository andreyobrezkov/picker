export const themes = [
  {
    id: 'foodie',
    name: 'Foodie',
    colors: ['#b51c00', '#7c5800', '#feb700', '#8e4a00', '#db3416', '#b25f00', '#c94a1a', '#5c4300'],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    colors: ['#0077b6', '#023e8a', '#0096c7', '#00b4d8', '#2a9d8f', '#264653', '#1a6b8a', '#005f73'],
  },
  {
    id: 'sunset',
    name: 'Sunset',
    colors: ['#e63946', '#ff6b6b', '#ff8c42', '#ff5f40', '#c77dff', '#9d4edd', '#ff006e', '#f72585'],
  },
  {
    id: 'forest',
    name: 'Forest',
    colors: ['#2d6a4f', '#40916c', '#52b788', '#1b4332', '#588157', '#3a5a40', '#606c38', '#283618'],
  },
  {
    id: 'candy',
    name: 'Candy',
    colors: ['#ff99c8', '#c9b1ff', '#a9def9', '#b5ead7', '#ffdac1', '#ffb7b2', '#ff9aa2', '#c7ceea'],
  },
  {
    id: 'mono',
    name: 'Mono',
    colors: ['#212529', '#343a40', '#495057', '#6c757d', '#868e96', '#52575c', '#3d4146', '#1a1d20'],
  },
]

export const themeById = Object.fromEntries(themes.map(t => [t.id, t]))

export const DEFAULT_THEME = 'foodie'
