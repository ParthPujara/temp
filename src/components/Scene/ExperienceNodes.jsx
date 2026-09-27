import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MathUtils, Vector3 } from 'three'
import { experienceAnchors, MERGE_AT, NODES_SPLIT_AT } from '../../lib/scrollProgress'
import { experience } from '../Experience Section/experience'
import { GATHER_END, MERGED_RADIUS } from './contactMerge'
import { domToWorld } from './domToWorld'

const { lerp, smoothstep } = MathUtils

// Theme colors from src/index.css (three.js can't read Tailwind classes)
const CYAN_PRIMARY = '#00E5FF'
const VIOLET_ACCENT = '#7C3AED'

const WIRE_RADIUS = 1.4 // same geometry as the core in Model.jsx
const STONE_FILL = 0.65 // stone size inside each node (same as the core's, which it splits from)
const SPIN_SPEED = 0.5 // radians per second

// experienceProgress timings, after the split at NODES_SPLIT_AT:
const FORMATION_END = 0.65 // nodes have spread into a column in the center of the screen
const LINE_START = 0.55 // the connecting line draws itself down the column...
const LINE_END = 0.72 // ...by here
const SETTLE_START = 0.7 // then the finished timeline glides left onto the entries...
const SETTLE_END = 0.95 // ...by here

// The centered column, relative to the screen height
const FORMATION_SPACING = 0.2 // gap between nodes
const FORMATION_RADIUS = 0.05 // node size

const corePosition = new Vector3()
const coreScale = new Vector3()
const formation = new Vector3()
const target = new Vector3()

// The Experience timeline: the core splits into one small stone-and-wireframe node per entry.
// Everything happens in the center of the screen first: the nodes spread into a vertical
// column and a line joins them. Only then does the timeline glide left onto each entry's
// placeholder box in the page (after which the nodes scroll with their cards).
// Contact (`contactRef`): the nodes leave their entries and gather at the center of the screen,
// where they're replaced by the single merged model (see ContactModel.jsx).
export default function ExperienceNodes({ progressRef, contactRef, wireRef }) {
  const nodeRefs = useRef([])
  const spinRefs = useRef([])
  const stoneRefs = useRef([])
  const wireMaterialRefs = useRef([])
  const nodePositions = useRef(experience.map(() => new Vector3()))
  const lineRef = useRef()
  const linePoints = useMemo(() => new Float32Array(6), [])

  useFrame((state, delta) => {
    const progress = progressRef.current
    const { viewport } = state
    const splitting = progress >= NODES_SPLIT_AT
    const spread = smoothstep(progress, NODES_SPLIT_AT, FORMATION_END)
    const settle = smoothstep(progress, SETTLE_START, SETTLE_END)
    const contact = contactRef.current
    const gather = smoothstep(contact, 0, GATHER_END)
    const mergedRadius = viewport.height * MERGED_RADIUS
    const present = splitting && contact < MERGE_AT // the merged model takes over after this

    // Nodes start exactly where the core is, so it looks like the core divides
    wireRef.current.getWorldPosition(corePosition)
    wireRef.current.getWorldScale(coreScale)
    const formationRadius = viewport.height * FORMATION_RADIUS
    const middle = (experience.length - 1) / 2

    experience.forEach((_, i) => {
      const node = nodeRefs.current[i]
      const anchor = experienceAnchors[i]
      node.visible = present && Boolean(anchor)
      if (!node.visible) return

      // 1. Core → this node's place in the centered column (first entry at the top)
      formation.set(0, (middle - i) * viewport.height * FORMATION_SPACING, 0)
      node.position.lerpVectors(corePosition, formation, spread)
      let radius = lerp(coreScale.x * WIRE_RADIUS, formationRadius, spread)

      // 2. Column → this entry's box on the page, resizing to fit the box
      const anchorRadius = domToWorld(anchor, state, target)
      node.position.lerp(target, settle)
      radius = lerp(radius, anchorRadius, settle)

      // 3. (Contact) entry → the center of the screen, growing to the merged model's size
      node.position.multiplyScalar(1 - gather)
      radius = lerp(radius, mergedRadius, gather)
      node.scale.setScalar(radius / WIRE_RADIUS)
      nodePositions.current[i].copy(node.position)

      spinRefs.current[i].rotation.y += delta * SPIN_SPEED
      stoneRefs.current[i].scale.setScalar(STONE_FILL) // each node carries a piece of the core's stone
      wireMaterialRefs.current[i].opacity = lerp(0.7, 0.9, spread)
    })

    // Line from the first node to the last, drawing itself downward (then moving with them)
    const line = lineRef.current
    const draw = smoothstep(progress, LINE_START, LINE_END)
    line.visible = present && draw > 0 // shrinks away as the nodes gather
    if (!line.visible) return
    const first = nodePositions.current[0]
    const last = nodePositions.current[experience.length - 1]
    const { position } = line.geometry.attributes
    position.setXYZ(0, first.x, first.y, first.z)
    position.setXYZ(1, lerp(first.x, last.x, draw), lerp(first.y, last.y, draw), lerp(first.z, last.z, draw))
    position.needsUpdate = true
    line.material.opacity = 0.5 * draw
  })

  return (
    <>
      {/* Drawn behind the nodes; points are updated every frame, so skip culling */}
      <lineSegments ref={lineRef} visible={false} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePoints, 3]} />
        </bufferGeometry>
        <lineBasicMaterial color={CYAN_PRIMARY} transparent opacity={0} depthWrite={false} />
      </lineSegments>

      {experience.map((item, i) => (
        <group
          key={item.title}
          ref={(el) => {
            nodeRefs.current[i] = el
          }}
          visible={false}
        >
          <group
            ref={(el) => {
              spinRefs.current[i] = el
            }}
          >
            <mesh>
              <icosahedronGeometry args={[WIRE_RADIUS, 1]} />
              <meshStandardMaterial
                ref={(el) => {
                  wireMaterialRefs.current[i] = el
                }}
                color={CYAN_PRIMARY}
                emissive={CYAN_PRIMARY}
                emissiveIntensity={0.6}
                wireframe
                transparent
              />
            </mesh>

            <mesh
              ref={(el) => {
                stoneRefs.current[i] = el
              }}
              scale={0}
            >
              <icosahedronGeometry args={[WIRE_RADIUS, 0]} />
              <meshStandardMaterial
                color={VIOLET_ACCENT}
                emissive={VIOLET_ACCENT}
                emissiveIntensity={1.2}
                metalness={0.6}
                roughness={0.25}
              />
            </mesh>
          </group>
        </group>
      ))}
    </>
  )
}
