import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import {
  AdditiveBlending,
  CanvasTexture,
  Color,
  DoubleSide,
  MathUtils,
  SRGBColorSpace,
  Vector3,
} from 'three'
import { SHATTER_AT } from '../../lib/scrollProgress'
import { skillGroups } from '../Skills Section/skills'
import { orbitLayout } from './orbitLayout'

const { damp, lerp, smoothstep } = MathUtils

const CYAN_PRIMARY = '#00E5FF'

const RINGS_START = 0.35 // skillsProgress where the rings start growing out of the core
const RINGS_END = 0.8 // ...and reach full size
const PARTICLES_PER_SKILL = 200
const BURST = 0.6 // how far particles arc outward on their way to the logos
const PARTICLE_SIZE = 0.03
const MAX_DELAY = 0.08 // per-particle start offset so they don't all move in lockstep
const TRAVEL_END = 0.8 // skillsProgress where particles land (before their delay)
const FADE_START = 0.82 // particle logos cross-fade into crisp logos from here to 1
const STONE_FILL = 0.65 // stone radius relative to the core (matches Model.jsx)

const ORBIT_SPEEDS = [0.12, 0.18, 0.25] // radians per second, outer ring first
const RING_OPACITY = 0.3
const BACK_OPACITY = 0.4 // logos on the far side of a ring fade to this...
const BACK_SCALE = 0.85 // ...and shrink to this, for depth
const INTERACTIVE_FROM = 0.95 // skillsProgress after which hovering does anything
const HOVER_SCALE = 1.3 // hovered logo grows by this much
const GLOW_SIZE = 1.8 // glow behind a hovered logo, relative to the logo
const GLOW_OPACITY = 0.55

const STONE_RGB = new Color('#7C3AED').toArray()
// Used for very dark brand colors (e.g. Express, JWT) that would vanish on the dark page
const LIGHT_FALLBACK = '#F3F5F7'

function logoColor(hex) {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance < 0.2 ? LIGHT_FALLBACK : `#${hex}`
}

// Draws a simple-icons path (24x24 viewBox) onto a square canvas
function drawIcon(path, size, color) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  ctx.scale(size / 24, size / 24)
  ctx.fillStyle = color
  ctx.fill(new Path2D(path))
  return canvas
}

// Soft white radial gradient, tinted per logo for the hover glow
function drawGlow() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return canvas
}

// Random points inside the icon's filled area, centered on 0 in a 1x1 square
function sampleIcon(path, count) {
  const size = 64
  const { data } = drawIcon(path, size, '#fff').getContext('2d').getImageData(0, 0, size, size)
  const filled = []
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (data[(y * size + x) * 4 + 3] > 128) filled.push([x / size - 0.5, 0.5 - y / size])
    }
  }
  return Array.from({ length: count }, () => {
    const [x, y] = filled[Math.floor(Math.random() * filled.length)]
    return [x + Math.random() / size, y - Math.random() / size]
  })
}

// Point on a ring for an angle: an ellipse whose lower half comes toward the viewer.
// 0 is the right end, -π/2 the front (bottom), π/2 the back (top).
function ringPoint(target, angle, radius, layout) {
  const sin = Math.sin(angle)
  return target.set(Math.cos(angle) * radius, sin * radius * layout.squash, -sin * radius * layout.depth)
}

// Unit ring as line points (x = cos, y = sin, z = -sin), scaled per ring at runtime
function ringLinePoints(segments = 128) {
  const points = new Float32Array(segments * 3)
  for (let i = 0; i < segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    points[i * 3] = Math.cos(angle)
    points[i * 3 + 1] = Math.sin(angle)
    points[i * 3 + 2] = -Math.sin(angle)
  }
  return points
}

function buildOrbits() {
  // Every skill across all groups, with its ring and its evenly spaced place on that ring
  const logos = skillGroups.flatMap((group, ring) =>
    group.skills.map((skill, i) => {
      const color = logoColor(skill.icon.hex)
      const texture = new CanvasTexture(drawIcon(skill.icon.path, 256, color))
      texture.colorSpace = SRGBColorSpace
      return { ...skill, ring, slot: (i / group.skills.length) * Math.PI * 2, color, texture }
    }),
  )
  const glowTexture = new CanvasTexture(drawGlow())

  const count = logos.length * PARTICLES_PER_SKILL
  const particles = {
    count,
    start: new Float32Array(count * 3), // unit direction from the stone's center
    offset: new Float32Array(count * 2), // position within the logo shape
    logo: new Uint16Array(count),
    delay: new Float32Array(count),
    targetColor: new Float32Array(count * 3),
    positions: new Float32Array(count * 3),
    colors: new Float32Array(count * 3),
  }

  const direction = new Vector3()
  const color = new Color()
  logos.forEach(({ icon }, k) => {
    color.set(logoColor(icon.hex))
    sampleIcon(icon.path, PARTICLES_PER_SKILL).forEach(([x, y], j) => {
      const i = k * PARTICLES_PER_SKILL + j
      direction.randomDirection().toArray(particles.start, i * 3)
      particles.offset[i * 2] = x
      particles.offset[i * 2 + 1] = y
      particles.logo[i] = k
      particles.delay[i] = Math.random() * MAX_DELAY
      color.toArray(particles.targetColor, i * 3)
    })
  })

  return { logos, particles, glowTexture, ringLine: ringLinePoints() }
}

const stonePosition = new Vector3()

// The Skills phase: the stone's particles fly out and reassemble as skill logos orbiting
// the core on one tilted ring per skill group (first group on the outermost ring).
// Rendered outside the drag controls so the rings hold still while the core is dragged.
export default function SkillOrbits({ progressRef, stoneRef }) {
  const { logos, particles, glowTexture, ringLine } = useMemo(() => buildOrbits(), [])
  const ringRefs = useRef([]) // group per ring: line, hover area, logos, label
  const lineRefs = useRef([])
  const hitAreaRefs = useRef([])
  const labelAnchorRefs = useRef([])
  const labelRefs = useRef([])
  const spriteRefs = useRef([])
  const logoWorld = useRef(logos.map(() => new Vector3()))
  const logoWorldSize = useRef(logos.map(() => 0))
  const pointsRef = useRef()

  // Orbit angle per ring, and the hover state with the animated values that follow it
  // (orbit slows to a stop, logo grows, glow and name fade in)
  const angles = useRef(skillGroups.map(() => 0))
  const speeds = useRef(skillGroups.map((_, k) => ORBIT_SPEEDS[k % ORBIT_SPEEDS.length]))
  const ringHover = useRef(skillGroups.map(() => false))
  const hoveredLogo = useRef(null)
  const hoverScales = useRef(logos.map(() => 1))
  const glowRef = useRef()
  const nameAnchorRef = useRef()
  const nameRef = useRef()
  const [hoveredName, setHoveredName] = useState('')

  useEffect(
    () => () => {
      logos.forEach(({ texture }) => texture.dispose())
      glowTexture.dispose()
    },
    [logos, glowTexture],
  )

  const onLogoOver = (i) => (event) => {
    // Only the front-most logo under the pointer reacts, not ones behind it
    event.stopPropagation()
    hoveredLogo.current = i
    setHoveredName(logos[i].name)
  }
  const onLogoOut = (i) => () => {
    if (hoveredLogo.current === i) hoveredLogo.current = null
  }

  useFrame(({ viewport, size }, delta) => {
    const progress = progressRef.current
    const layout = orbitLayout(viewport, size, skillGroups.length)
    const grow = smoothstep(progress, RINGS_START, RINGS_END)
    const ringsVisible = progress >= RINGS_START

    // Hovering only counts once the logos have fully formed
    const interactive = progress >= INTERACTIVE_FROM
    const activeLogo = interactive ? hoveredLogo.current : null
    const activeRing = !interactive
      ? -1
      : activeLogo !== null
        ? logos[activeLogo].ring
        : ringHover.current.indexOf(true)

    skillGroups.forEach((_, k) => {
      const ring = ringRefs.current[k]
      ring.visible = ringsVisible
      ring.position.y = layout.centerY

      // Rings grow outward from the core
      const radius = Math.max(layout.radii[k] * grow, 0.001)
      lineRefs.current[k].scale.set(radius, radius * layout.squash, radius * layout.depth)
      lineRefs.current[k].material.opacity = RING_OPACITY * grow
      hitAreaRefs.current[k].scale.set(radius, radius * layout.squash, 1)

      // Orbit eases to a stop while the pointer is over this ring
      const baseSpeed = ORBIT_SPEEDS[k % ORBIT_SPEEDS.length]
      speeds.current[k] = damp(speeds.current[k], k === activeRing ? 0 : baseSpeed, 5, delta)
      angles.current[k] += delta * speeds.current[k]

      // Group name just below the front of the ring
      ringPoint(labelAnchorRefs.current[k].position, -Math.PI / 2, radius, layout)
      labelRefs.current[k].style.opacity = smoothstep(progress, 0.8, 1)
    })

    // Logos travel around their ring; the far side is smaller and dimmer for depth
    const logoOpacity = smoothstep(progress, FADE_START, 1)
    logos.forEach(({ ring, slot }, k) => {
      const sprite = spriteRefs.current[k]
      const angle = angles.current[ring] + slot
      ringPoint(sprite.position, angle, layout.radii[ring] * grow, layout)

      const front = (1 - Math.sin(angle)) / 2 // 1 at the front (bottom) of the ring, 0 at the back
      const hoverScale = (hoverScales.current[k] = damp(
        hoverScales.current[k],
        k === activeLogo ? HOVER_SCALE : 1,
        10,
        delta,
      ))
      const worldSize = layout.logoSize * lerp(BACK_SCALE, 1, front) * hoverScale
      sprite.scale.setScalar(worldSize)
      sprite.material.opacity =
        logoOpacity * (k === activeLogo ? 1 : lerp(BACK_OPACITY, 1, front))
      sprite.getWorldPosition(logoWorld.current[k])
      logoWorldSize.current[k] = worldSize
    })

    // Glow behind the hovered logo and its name underneath
    const glow = glowRef.current
    if (activeLogo !== null) {
      const center = logoWorld.current[activeLogo]
      const logoSize = logoWorldSize.current[activeLogo]
      glow.position.copy(center)
      glow.scale.setScalar(logoSize * GLOW_SIZE)
      glow.material.color.set(logos[activeLogo].color)
      nameAnchorRef.current.position.set(center.x, center.y - logoSize * 0.5 - 0.08, center.z)
    }
    glow.material.opacity = damp(glow.material.opacity, activeLogo !== null ? GLOW_OPACITY : 0, 10, delta)
    glow.visible = glow.material.opacity > 0.01
    nameRef.current.style.opacity = activeLogo !== null ? 1 : 0

    const points = pointsRef.current
    points.visible = progress >= SHATTER_AT && progress < 1
    if (!points.visible) return
    points.material.opacity = 1 - logoOpacity

    stoneRef.current.getWorldPosition(stonePosition)
    const stoneRadius = layout.coreRadius * STONE_FILL
    const { start, offset, logo, delay, targetColor } = particles
    // Write through the geometry (a ref) rather than the memoized arrays
    const { position, color } = points.geometry.attributes
    const positions = position.array
    const colors = color.array
    for (let i = 0; i < particles.count; i++) {
      const t = smoothstep(progress, SHATTER_AT + delay[i], TRAVEL_END + delay[i])
      const arc = Math.sin(t * Math.PI) * BURST
      const target = logoWorld.current[logo[i]]
      const logoSize = logoWorldSize.current[logo[i]]
      // The camera never rotates, so world x/y is the screen plane: logo shapes face the viewer
      const shape = [offset[i * 2] * logoSize, offset[i * 2 + 1] * logoSize, 0]

      for (let axis = 0; axis < 3; axis++) {
        const out = start[i * 3 + axis]
        const from = stonePosition.getComponent(axis) + out * stoneRadius
        const to = target.getComponent(axis) + shape[axis]
        // Straight line from stone to logo, pushed outward mid-flight for a burst
        positions[i * 3 + axis] = from + (to - from) * t + out * arc
        // Violet like the stone, shifting to the brand color on the way
        colors[i * 3 + axis] = STONE_RGB[axis] + (targetColor[i * 3 + axis] - STONE_RGB[axis]) * t
      }
    }
    position.needsUpdate = true
    color.needsUpdate = true
  })

  return (
    <>
      {skillGroups.map((group, k) => (
        <group
          key={group.name}
          ref={(el) => {
            ringRefs.current[k] = el
          }}
          visible={false}
        >
          <lineLoop
            ref={(el) => {
              lineRefs.current[k] = el
            }}
          >
            <bufferGeometry>
              <bufferAttribute attach="attributes-position" args={[ringLine, 3]} />
            </bufferGeometry>
            <lineBasicMaterial color={CYAN_PRIMARY} transparent opacity={0} depthWrite={false} />
          </lineLoop>

          {/* Invisible band along the ring: a thin line is too hard to hover on its own */}
          <mesh
            ref={(el) => {
              hitAreaRefs.current[k] = el
            }}
            onPointerOver={() => {
              ringHover.current[k] = true
            }}
            onPointerOut={() => {
              ringHover.current[k] = false
            }}
          >
            <ringGeometry args={[0.88, 1.12, 64]} />
            <meshBasicMaterial side={DoubleSide} colorWrite={false} depthWrite={false} />
          </mesh>

          {logos.map((logo, i) =>
            logo.ring === k ? (
              <sprite
                key={logo.name}
                ref={(el) => {
                  spriteRefs.current[i] = el
                }}
                renderOrder={1} // drawn over the hover glow
                onPointerOver={onLogoOver(i)}
                onPointerOut={onLogoOut(i)}
              >
                <spriteMaterial map={logo.texture} transparent opacity={0} depthWrite={false} />
              </sprite>
            ) : null,
          )}

          {/* Group name below the front of the ring */}
          <group
            ref={(el) => {
              labelAnchorRefs.current[k] = el
            }}
          >
            <Html center style={{ pointerEvents: 'none' }}>
              <p
                ref={(el) => {
                  labelRefs.current[k] = el
                }}
                className="translate-y-10 text-xs font-medium tracking-widest whitespace-nowrap text-cyan-bright uppercase"
                style={{ opacity: 0 }}
              >
                {group.name}
              </p>
            </Html>
          </group>
        </group>
      ))}

      {/* Hover glow, tinted with the hovered logo's brand color */}
      <sprite ref={glowRef} visible={false}>
        <spriteMaterial
          map={glowTexture}
          transparent
          opacity={0}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </sprite>

      {/* Hovered skill's name, under its logo */}
      <group ref={nameAnchorRef}>
        <Html center style={{ pointerEvents: 'none' }}>
          <p
            ref={nameRef}
            className="rounded-full border border-border-subtle bg-surface/80 px-3 py-1 text-xs font-medium whitespace-nowrap text-text-primary transition-opacity duration-200"
            style={{ opacity: 0 }}
          >
            {hoveredName}
          </p>
        </Html>
      </group>

      <points ref={pointsRef} visible={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[particles.positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[particles.colors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={PARTICLE_SIZE} vertexColors transparent depthWrite={false} />
      </points>
    </>
  )
}
