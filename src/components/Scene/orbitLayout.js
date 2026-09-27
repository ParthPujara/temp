const WIDE_SCREEN = 768 // px, same as Tailwind's md breakpoint

// Where the Skills orbits sit on screen, in world units. Shared by the core (Model.jsx)
// and the rings (SkillOrbits.jsx) so the rings stay centered on the core.
// Ring 0 is the outermost.
//
// The rings are ellipses drawn close to the screen plane rather than circles truly tilted
// in 3D: a real tilt this steep would bring their front edge right up to the camera,
// blowing up the front logos and pushing the outer ring off screen.
export function orbitLayout(viewport, size, ringCount) {
  const isWide = size.width >= WIDE_SCREEN
  // A ring's on-screen height relative to its width: flatter on wide screens, rounder on
  // phones where there's more height than width
  const squash = isWide ? 0.37 : 0.62
  const outer = Math.min(viewport.width * 0.44, (viewport.height * 0.26) / squash)
  const inner = outer * 0.45
  const radii = Array.from({ length: ringCount }, (_, i) =>
    ringCount === 1 ? outer : outer - ((outer - inner) * i) / (ringCount - 1),
  )

  return {
    squash,
    depth: 0.2, // front of a ring sits this much (× radius) toward the viewer, back as far away
    centerY: -viewport.height * 0.05, // a little low, leaving room for the section heading
    radii,
    coreRadius: inner * 0.6,
    logoSize: Math.min(viewport.height * 0.08, viewport.width * 0.1),
  }
}
