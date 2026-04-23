export const DEFAULT_SPIN_SPEED = 'normal'

export const SPIN_SPEED_OPTIONS = [
  {
    id: 'slow',
    name: 'Slow',
    description: 'Longer, more dramatic spins with extra revolutions.',
  },
  {
    id: 'normal',
    name: 'Normal',
    description: 'Balanced timing for everyday picks.',
  },
  {
    id: 'fast',
    name: 'Fast',
    description: 'Quicker results with shorter animations.',
  },
]

export const SPIN_SPEED_TIMING = {
  slow: {
    duration: [5200, 6800],
    extraTurns: [7, 10],
  },
  normal: {
    duration: [4000, 5500],
    extraTurns: [5, 8],
  },
  fast: {
    duration: [1200, 2200],
    extraTurns: [2, 4],
  },
}
