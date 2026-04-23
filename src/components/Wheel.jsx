import { useRef, useEffect, useCallback, useState, useLayoutEffect } from 'react'
import { DEFAULT_SPIN_SPEED, SPIN_SPEED_TIMING } from '../utils/spinSpeeds.js'
import styles from './Wheel.module.css'

const TAU = Math.PI * 2

function easeOut(t) {
  return 1 - Math.pow(1 - t, 4)
}

function randomBetween(min, max) {
  return min + Math.random() * (max - min)
}

function buildArcs(segments) {
  const totalWeight = segments.reduce((s, seg) => s + seg.weight, 0)
  let cursor = 0
  return segments.map(seg => {
    const arc = (seg.weight / totalWeight) * TAU
    const start = cursor
    cursor += arc
    return { ...seg, start, arc }
  })
}

function resolveWinner(arcs, finalAngle) {
  const norm = ((finalAngle % TAU) + TAU) % TAU
  const pointer = ((TAU - norm) % TAU + TAU) % TAU
  for (const seg of arcs) {
    if (pointer >= seg.start && pointer < seg.start + seg.arc) return seg
  }
  return arcs[arcs.length - 1]
}

function drawSegmentContent(ctx, seg, midR, r, images) {
  const img = seg.icon ? images[seg.icon] : null
  let textY = 0

  if (img) {
    const iconR = Math.min(22, Math.max(10, midR * seg.arc * 0.15))
    const iconCX = midR
    const iconCY = -(iconR + 5)

    // circular clip for avatar photo
    ctx.save()
    ctx.beginPath()
    ctx.arc(iconCX, iconCY, iconR, 0, TAU)
    ctx.clip()
    ctx.drawImage(img, iconCX - iconR, iconCY - iconR, iconR * 2, iconR * 2)
    ctx.restore()

    // white ring around avatar
    ctx.beginPath()
    ctx.arc(iconCX, iconCY, iconR + 1.5, 0, TAU)
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'
    ctx.lineWidth = 2
    ctx.stroke()

    textY = iconCY + iconR + 5
  } else if (seg.emoji) {
    const emojiSize = Math.max(12, Math.min(22, midR * seg.arc * 0.18))
    ctx.font = `${emojiSize}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(seg.emoji, midR, -(emojiSize * 0.7))
    textY = emojiSize * 0.55
  }

  const fontSize = Math.max(10, Math.min(13, midR * seg.arc * 0.13))
  ctx.font = `700 ${fontSize}px 'Spline Sans', system-ui, sans-serif`
  ctx.fillStyle = '#fff'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.shadowColor = 'rgba(0,0,0,0.45)'
  ctx.shadowBlur = 3

  const maxWidth = r * 0.42
  const words = seg.label.split(' ')
  let line = ''
  const lines = []
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line); line = word
    } else { line = test }
  }
  lines.push(line)

  const lineH = fontSize * 1.25
  const baseY = textY + (img || seg.emoji ? 4 : 0)
  const yStart = baseY - ((lines.length - 1) * lineH) / 2
  lines.forEach((l, i) => ctx.fillText(l, midR, yStart + i * lineH, maxWidth))

  ctx.shadowBlur = 0
}

export default function Wheel({ segments, onResult, spinSpeed, spinRequestId }) {
  const canvasRef = useRef(null)
  const wrapperRef = useRef(null)
  const onResultRef = useRef(onResult)
  const spinSpeedRef = useRef(spinSpeed)
  useLayoutEffect(() => { onResultRef.current = onResult }, [onResult])
  useLayoutEffect(() => { spinSpeedRef.current = spinSpeed }, [spinSpeed])

  const stateRef = useRef({ rotation: 0, spinning: false, arcs: [], images: {}, animId: null })
  const [isSpinning, setIsSpinning] = useState(false)

  function draw(canvas, state) {
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width
    const cx = W / 2
    const r = cx - 4

    ctx.clearRect(0, 0, W, W)

    for (const seg of state.arcs) {
      const startAngle = seg.start + state.rotation - Math.PI / 2
      const endAngle = startAngle + seg.arc

      ctx.beginPath()
      ctx.moveTo(cx, cx)
      ctx.arc(cx, cx, r, startAngle, endAngle)
      ctx.closePath()
      ctx.fillStyle = seg.color
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.save()
      ctx.translate(cx, cx)
      ctx.rotate(startAngle + seg.arc / 2)
      drawSegmentContent(ctx, seg, r * 0.62, r, state.images)
      ctx.restore()
    }

    // centre cap (sits behind the HTML SPIN button)
    ctx.beginPath()
    ctx.arc(cx, cx, 46, 0, TAU)
    ctx.fillStyle = '#fff'
    ctx.fill()
  }

  useEffect(() => {
    const state = stateRef.current
    state.arcs = buildArcs(segments)
    state.images = {}

    const promises = segments
      .filter(s => s.icon)
      .map(s => new Promise(resolve => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => { state.images[s.icon] = img; resolve() }
        img.onerror = resolve
        img.src = s.icon
      }))

    Promise.all(promises).then(() => draw(canvasRef.current, state))
  }, [segments])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    if (!canvas || !wrapper) return
    const size = wrapper.offsetWidth
    canvas.width = size
    canvas.height = size
    draw(canvas, stateRef.current)
  }, [])

  const spin = useCallback(() => {
    const state = stateRef.current
    if (state.spinning || state.arcs.length === 0) return

    state.spinning = true
    setIsSpinning(true)

    const speed = spinSpeedRef.current ?? DEFAULT_SPIN_SPEED
    const timing = SPIN_SPEED_TIMING[speed] ?? SPIN_SPEED_TIMING[DEFAULT_SPIN_SPEED]
    const extraTurns = randomBetween(timing.extraTurns[0], timing.extraTurns[1]) * TAU
    const targetOffset = Math.random() * TAU
    const totalRotation = extraTurns + targetOffset
    const duration = randomBetween(timing.duration[0], timing.duration[1])
    const startRotation = state.rotation
    const startTime = performance.now()

    function frame(now) {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      state.rotation = startRotation + totalRotation * easeOut(t)
      draw(canvasRef.current, state)

      if (t < 1) {
        state.animId = requestAnimationFrame(frame)
      } else {
        state.spinning = false
        setIsSpinning(false)
        onResultRef.current(resolveWinner(state.arcs, state.rotation))
      }
    }

    state.animId = requestAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (spinRequestId > 0) spin()
  }, [spinRequestId, spin])

  return (
    <div className={styles.outer}>
      <div ref={wrapperRef} className={styles.wrapper}>
        <div className={styles.ring} />
        <canvas ref={canvasRef} className={styles.canvas} />
        <div className={styles.pointer} />
        <button
          className={`${styles.spinBtn} ${isSpinning ? styles.spinning : ''}`}
          onClick={spin}
          disabled={isSpinning || segments.length === 0}
          aria-label="Spin the wheel"
        >
          <span className={styles.spinLabel}>{isSpinning ? '…' : 'SPIN'}</span>
        </button>
      </div>
    </div>
  )
}
