let _id = 1
const id = () => String(_id++)

const defaultSegments = [
  { id: id(), label: 'Alice',   subtitle: '',  color: null, emoji: '🧑‍💻', icon: null, weight: 1, enabled: true },
  { id: id(), label: 'Bob',     subtitle: '',      color: null, emoji: '👨‍💼', icon: null, weight: 1, enabled: true },
  { id: id(), label: 'Carol',   subtitle: '',       color: null, emoji: '👩‍🎨', icon: null, weight: 1, enabled: true },
  { id: id(), label: 'David',   subtitle: '',  color: null, emoji: '👨‍💻', icon: null, weight: 1, enabled: true },
  { id: id(), label: 'Eve',     subtitle: '',           color: null, emoji: '👩‍🔬', icon: null, weight: 1, enabled: true },
  { id: id(), label: 'Frank',   subtitle: '',       color: null, emoji: '🧑‍🔧', icon: null, weight: 1, enabled: true },
]

export default defaultSegments
