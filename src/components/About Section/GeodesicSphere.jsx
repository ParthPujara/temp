import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { IcosahedronGeometry, Object3D, WireframeGeometry } from 'three'

const RADIUS = 1.6
const DETAIL = 2 // geodesic subdivision level: higher = denser grid
const NODE_SIZE = 0.025

// Values above 1 push the nodes past the bloom threshold so they glow
const NODE_GLOW = [0, 2.6, 3]
const EDGE_COLOR = '#00E5FF'

export default function GeodesicSphere() {
  const groupRef = useRef()
  const nodesRef = useRef()

  const { edges, nodes } = useMemo(() => {
    const geometry = new IcosahedronGeometry(RADIUS, DETAIL)
    const edges = new WireframeGeometry(geometry)

    // The geometry repeats each vertex once per triangle; keep one node per point
    const position = geometry.attributes.position
    const seen = new Map()
    for (let i = 0; i < position.count; i++) {
      const [x, y, z] = [position.getX(i), position.getY(i), position.getZ(i)]
      const key = `${x.toFixed(4)},${y.toFixed(4)},${z.toFixed(4)}`
      if (!seen.has(key)) seen.set(key, [x, y, z])
    }
    geometry.dispose()

    return { edges, nodes: [...seen.values()] }
  }, [])

  useLayoutEffect(() => {
    const dummy = new Object3D()
    nodes.forEach((point, i) => {
      dummy.position.set(...point)
      dummy.updateMatrix()
      nodesRef.current.setMatrixAt(i, dummy.matrix)
    })
    nodesRef.current.instanceMatrix.needsUpdate = true
  }, [nodes])

  // Slow self-rotation on the Y axis
  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * 0.12
  })

  return (
    <group ref={groupRef} rotation={[0.3, 0, 0.1]}>
      {/* Structural edges: faint so the nodes stand out */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={EDGE_COLOR} transparent opacity={0.15} depthWrite={false} />
      </lineSegments>

      {/* Glowing nodes at every vertex */}
      <instancedMesh ref={nodesRef} args={[undefined, undefined, nodes.length]}>
        <sphereGeometry args={[NODE_SIZE, 8, 8]} />
        <meshBasicMaterial color={NODE_GLOW} toneMapped={false} />
      </instancedMesh>
    </group>
  )
}
