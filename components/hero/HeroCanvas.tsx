'use client'
import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

function Particles() {
  const mesh = useRef<THREE.Points>(null)
  const { mouse } = useThree()

  const [positions, colors] = useMemo(() => {
    const count = 400
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 6
      pos[i * 3 + 1] = (Math.random() - 0.5) * 6
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4
      const t = Math.random()
      col[i * 3]     = t * 0.0 + (1 - t) * 1.0
      col[i * 3 + 1] = t * 0.83 + (1 - t) * 1.0
      col[i * 3 + 2] = t * 0.94 + (1 - t) * 1.0
    }
    return [pos, col]
  }, [])

  useFrame((_, delta) => {
    if (!mesh.current) return
    mesh.current.rotation.y += delta * 0.04
    mesh.current.rotation.x += delta * 0.02
    mesh.current.rotation.y += mouse.x * 0.003
    mesh.current.rotation.x += mouse.y * 0.002
  })

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.025} vertexColors transparent opacity={0.75} sizeAttenuation />
    </points>
  )
}

export default function HeroCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 60 }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      gl={{ antialias: false, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 2]} color="#00D4F0" intensity={2} />
      <pointLight position={[-2, -2, 1]} color="#c8892a" intensity={1.5} />
      <Particles />
    </Canvas>
  )
}
