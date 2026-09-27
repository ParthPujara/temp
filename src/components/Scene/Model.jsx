import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, PresentationControls } from '@react-three/drei'
import { MathUtils } from 'three'
import {
  contactProgress,
  experienceProgress,
  NODES_SPLIT_AT,
  revealProgress,
  SHATTER_AT,
  skillsProgress,
} from '../../lib/scrollProgress'
import { skillGroups } from '../Skills Section/skills'
import ContactModel from './ContactModel'
import ExperienceNodes from './ExperienceNodes'
import { orbitLayout } from './orbitLayout'
import SkillOrbits from './SkillOrbits'

const { damp, lerp, smoothstep } = MathUtils

// Theme colors from src/index.css (three.js can't read Tailwind classes)
const CYAN_PRIMARY = '#00E5FF'
const VIOLET_ACCENT = '#7C3AED'

const WIRE_RADIUS = 1.4
const STONE_SCALE = 0.8
// Expanded wireframe diameter as a fraction of the screen height
const EXPANDED_FIT = 1.1
// Stone radius relative to the core during Skills (matches STONE_FILL in SkillOrbits.jsx)
const STONE_FILL = 0.65
// Size of the whole orbit system once it has condensed for the Experience timeline
const SYSTEM_SMALL = 0.6

// Stone inside a wireframe shell.
// About: the stone swells, glows and collapses while the wireframe expands around the
// About text (see About.jsx for the text timing).
// Skills: the wireframe shrinks into a small core at the center of the orbits, and the stone
// reforms inside it, charges up and shatters into the orbiting logos (see SkillOrbits.jsx).
// Experience: in the center of the screen, the logos stream back into the core and the stone
// re-forms while the rings fade; then the core splits into the timeline nodes, which only
// move over to the entries at the end (see ExperienceNodes.jsx).
export default function Model() {
  const systemRef = useRef()
  const coreRef = useRef()
  const spinRef = useRef()
  const wireRef = useRef()
  const wireMaterialRef = useRef()
  const stoneRef = useRef()
  const stoneMaterialRef = useRef()
  const smoothProgress = useRef(0)
  const smoothSkills = useRef(0)
  const smoothExperience = useRef(0)
  const smoothContact = useRef(0)

  useFrame((state, delta) => {
    // Ease toward the scroll position so the model never jumps
    const progress = (smoothProgress.current = damp(smoothProgress.current, revealProgress.get(), 6, delta))
    const skills = (smoothSkills.current = damp(smoothSkills.current, skillsProgress.get(), 6, delta))
    const experience = (smoothExperience.current = damp(
      smoothExperience.current,
      experienceProgress.get(),
      6,
      delta,
    ))
    smoothContact.current = damp(smoothContact.current, contactProgress.get(), 6, delta)

    spinRef.current.rotation.y += delta * 0.3

    const layout = orbitLayout(state.viewport, state.size, skillGroups.length)
    // Skills: the core shrinks and drops to the center of the orbit rings
    const shrink = smoothstep(skills, 0, 0.45)
    coreRef.current.position.y = lerp(0, layout.centerY, shrink)

    // Experience: the orbit system (still rotating) condenses in the center of the screen while
    // the logos stream back into the core as particles (see SkillOrbits.jsx), with the core
    // settling at the exact center, where it then splits into the timeline nodes
    const exit = smoothstep(experience, 0, NODES_SPLIT_AT)
    systemRef.current.scale.setScalar(lerp(1, SYSTEM_SMALL, exit))
    systemRef.current.position.y = lerp(0, -SYSTEM_SMALL * layout.centerY, exit)

    // Stone: each later phase takes over once it starts (the earlier one has finished by then)
    let size, presence, swell, glow
    if (experience > 0.001) {
      // Re-forms from the returning particles, then goes into the timeline nodes at the split
      size = (layout.coreRadius * STONE_FILL) / WIRE_RADIUS
      presence = experience < NODES_SPLIT_AT ? smoothstep(experience, 0.3, 0.42) : 0
      swell = 0
      glow = 1.5
    } else if (skills > 0.001) {
      // Reforms inside the core, then swells and glows brighter until it shatters
      const charge = smoothstep(skills, 0.25, SHATTER_AT)
      size = (layout.coreRadius * STONE_FILL) / WIRE_RADIUS
      presence = skills < SHATTER_AT ? smoothstep(skills, 0.05, 0.3) : 0
      swell = charge
      glow = 0.5 + 3 * charge
    } else {
      // About: swells and glows, then collapses as the About text emerges
      size = STONE_SCALE
      swell = smoothstep(progress, 0, 0.2)
      presence = 1 - smoothstep(progress, 0.2, 0.45)
      glow = 2.5 * swell
    }
    stoneRef.current.scale.setScalar(size * (1 + 0.15 * swell) * presence)
    stoneRef.current.visible = presence > 0
    stoneMaterialRef.current.emissiveIntensity = glow
    stoneMaterialRef.current.opacity = presence

    // Wireframe: expands to frame the About content and fades so the text stays readable,
    // then (Skills) shrinks into the core and brightens again
    const expand = smoothstep(progress, 0.15, 0.75)
    const expandedScale = (state.viewport.height * EXPANDED_FIT) / (2 * WIRE_RADIUS)
    const aboutScale = lerp(1, expandedScale, expand)
    wireRef.current.scale.setScalar(lerp(aboutScale, layout.coreRadius / WIRE_RADIUS, shrink))
    wireMaterialRef.current.opacity = lerp(lerp(1, 0.35, expand), 0.7, shrink)
    // Experience: the timeline nodes take over from the core when it splits
    wireRef.current.visible = experience < NODES_SPLIT_AT
  })

  return (
    <>
      {/* The core and its orbits, moved and shrunk together for Experience */}
      <group ref={systemRef}>
        {/* Moves the core to the center of the Skills orbits */}
        <group ref={coreRef}>
          {/* Drag anywhere on the canvas rotates the model itself, not the camera */}
          <PresentationControls
            global
            polar={[-Infinity, Infinity]}
            azimuth={[-Infinity, Infinity]}
            speed={1.5}
          >
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.6}>
              <group ref={spinRef}>
                <mesh ref={wireRef}>
                  <icosahedronGeometry args={[WIRE_RADIUS, 1]} />
                  <meshStandardMaterial
                    ref={wireMaterialRef}
                    color={CYAN_PRIMARY}
                    emissive={CYAN_PRIMARY}
                    emissiveIntensity={0.6}
                    wireframe
                    transparent
                  />
                </mesh>

                <mesh ref={stoneRef} scale={STONE_SCALE}>
                  <icosahedronGeometry args={[WIRE_RADIUS, 0]} />
                  <meshStandardMaterial
                    ref={stoneMaterialRef}
                    color={VIOLET_ACCENT}
                    emissive={VIOLET_ACCENT}
                    emissiveIntensity={0}
                    metalness={0.6}
                    roughness={0.25}
                    transparent
                  />
                </mesh>
              </group>
            </Float>
          </PresentationControls>
        </group>

        {/* Outside the drag controls so the rings hold still while the core is dragged */}
        <SkillOrbits progressRef={smoothSkills} experienceRef={smoothExperience} stoneRef={stoneRef} />
      </group>

      {/* Outside the system group: the nodes sit on their entries in the page */}
      <ExperienceNodes progressRef={smoothExperience} contactRef={smoothContact} wireRef={wireRef} />

      {/* Contact: the nodes merge into this single hero-style model */}
      <ContactModel progressRef={smoothContact} />
    </>
  )
}
