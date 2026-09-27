// Places a DOM element in the 3D scene: sets `target` to the world position (on the z = 0
// plane) of the element's center and returns half its width in world units.
// Works because the canvas is fixed to fill the whole window (see Scene.jsx).
export function domToWorld(element, { size, viewport }, target) {
  const rect = element.getBoundingClientRect()
  target.set(
    ((rect.left + rect.width / 2) / size.width - 0.5) * viewport.width,
    (0.5 - (rect.top + rect.height / 2) / size.height) * viewport.height,
    0,
  )
  return (rect.width / 2 / size.width) * viewport.width
}
