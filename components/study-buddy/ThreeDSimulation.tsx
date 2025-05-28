import { useState, useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useGLTF, Html, Text } from '@react-three/drei'
import * as THREE from 'three'

interface ExperimentProps {
  temperature?: number
  pH?: number
  volume?: number
  isRunning?: boolean
}

// Helper component for chemistry setup with beaker and solutions
const AcidBaseSetup: React.FC<ExperimentProps> = ({ temperature = 25, pH = 7, volume = 100, isRunning = false }) => {
  // We'll mock the beaker model - in a real app you would load a real model
  const beakerModel = new THREE.Group()
  const solutionRef = useRef<THREE.Mesh>(null!)
  const indicatorRef = useRef<THREE.Mesh>(null!)
  
  // Update solution color based on pH
  useEffect(() => {
    if (indicatorRef.current) {
      // Change color based on pH (pink for basic, clear for acidic)
      const hue = Math.max(0, Math.min(300, (14 - pH) * 30))
      const material = indicatorRef.current.material as THREE.MeshStandardMaterial
      material.color.setHSL(hue/360, 0.8, 0.6)
      material.opacity = Math.min(1, Math.max(0.2, Math.abs(7 - pH) / 4))
    }
    
    if (solutionRef.current) {
      // Update solution level based on volume
      const height = (volume / 500) * 1.8
      solutionRef.current.scale.set(1, height, 1)
      solutionRef.current.position.y = -1 + (height / 2)
    }
  }, [pH, volume])
  
  // Animation for bubbling or movement when running
  useFrame(({ clock }) => {
    if (isRunning && solutionRef.current) {
      const t = clock.getElapsedTime()
      const bubbleHeight = Math.sin(t * 2) * 0.01
      solutionRef.current.position.y += bubbleHeight
    }
  })
  
  return (
    <group position={[0, 0, 0]}>
      {/* Simple beaker shape instead of imported model */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 2, 32]} />
        <meshStandardMaterial color="#dddddd" transparent opacity={0.3} />
      </mesh>
      
      {/* Solution liquid */}
      <mesh ref={solutionRef} position={[0, -1, 0]}>
        <cylinderGeometry args={[1, 1, 1, 32]} />
        <meshStandardMaterial 
          transparent 
          opacity={0.7} 
          color="#c0e5ff" 
        />
      </mesh>
      
      {/* Indicator color layer */}
      <mesh ref={indicatorRef} position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.5, 32]} />
        <meshStandardMaterial 
          transparent 
          opacity={0.3} 
          color="#ff88cc" 
        />
      </mesh>
      
      {/* Temperature indicator */}
      <Html position={[1.5, 1, 0]}>
        <div className="bg-white p-2 rounded shadow-md">
          <p className="text-xs font-bold">{temperature}°C</p>
        </div>
      </Html>
    </group>
  )
}

// Simple pendulum setup
const PendulumSetup: React.FC<ExperimentProps> = ({ isRunning = false }) => {
  const pendulumRef = useRef<THREE.Mesh>(null!)
  const [linePoints, setLinePoints] = useState<THREE.Vector3[]>([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0, -3, 0)
  ])
  const amplitude = Math.PI / 4 // 45 degrees
  const length = 3
  
  useFrame(({ clock }) => {
    if (isRunning && pendulumRef.current) {
      const time = clock.getElapsedTime()
      const angle = amplitude * Math.sin(time * 2)
      
      // Update pendulum position
      pendulumRef.current.position.x = length * Math.sin(angle)
      pendulumRef.current.position.y = -length * Math.cos(angle)
      
      // Update string points
      setLinePoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(pendulumRef.current.position.x, pendulumRef.current.position.y, 0)
      ])
    }
  })
  
  return (
    <group>
      {/* Pendulum string */}
      <group>
        <mesh
          position={[
            (linePoints[0].x + linePoints[1].x) / 2,
            (linePoints[0].y + linePoints[1].y) / 2,
            0
          ]}
          rotation={[0, 0, Math.atan2(
            linePoints[1].y - linePoints[0].y,
            linePoints[1].x - linePoints[0].x
          ) - Math.PI / 2]}
        >
          <cylinderGeometry 
            args={[
              0.02, // radius top
              0.02, // radius bottom
              linePoints[0].distanceTo(linePoints[1]), // height
              8 // segments
            ]} 
          />
          <meshStandardMaterial color="#000000" />
        </mesh>
      </group>
      
      {/* Pendulum bob */}
      <mesh ref={pendulumRef} position={[0, -length, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#8844aa" />
      </mesh>
      
      {/* Base */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[4, 0.2, 1]} />
        <meshStandardMaterial color="#885522" />
      </mesh>
    </group>
  )
}

interface BubbleData {
  position: [number, number, number]
  scale: number
  speed: number
}

// Photosynthesis setup with plant and bubbles
const PhotosynthesisSetup: React.FC<ExperimentProps> = ({ isRunning = false, volume = 100 }) => {
  const [bubbles, setBubbles] = useState<BubbleData[]>([])
  const plantRef = useRef<THREE.Group>(null!)
  
  // Create bubbles
  useEffect(() => {
    const newBubbles = Array(10).fill(null).map(() => ({
      position: [
        (Math.random() - 0.5) * 1.5,
        Math.random() * 2, 
        (Math.random() - 0.5) * 1.5
      ] as [number, number, number],
      scale: Math.random() * 0.2 + 0.1,
      speed: Math.random() * 0.01 + 0.005
    }))
    
    setBubbles(newBubbles)
  }, [])
  
  // Animation for plant and bubbles
  useFrame(() => {
    if (isRunning) {
      // Gentle plant movement
      if (plantRef.current) {
        plantRef.current.rotation.y += 0.001
      }
      
      // Update bubbles
      setBubbles(prevBubbles => 
        prevBubbles.map(bubble => {
          const newPos: [number, number, number] = [...bubble.position]
          newPos[1] += bubble.speed
          
          // Reset bubble position when it reaches the top
          if (newPos[1] > 3) {
            newPos[1] = 0
            newPos[0] = (Math.random() - 0.5) * 1.5
            newPos[2] = (Math.random() - 0.5) * 1.5
          }
          
          return {
            ...bubble,
            position: newPos as [number, number, number]
          }
        })
      )
    }
  })
  
  return (
    <group position={[0, -1.5, 0]}>
      {/* Water tank */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[3, 3, 3]} />
        <meshStandardMaterial transparent opacity={0.3} color="#a0d8f0" />
      </mesh>
      
      {/* Plant */}
      <group ref={plantRef} position={[0, 0.5, 0]}>
        {/* Stem */}
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
          <meshStandardMaterial color="#008800" />
        </mesh>
        
        {/* Leaves */}
        <mesh position={[0.3, 1.2, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.8, 0.1, 0.3]} />
          <meshStandardMaterial color="#00aa00" />
        </mesh>
        <mesh position={[-0.3, 0.9, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[0.8, 0.1, 0.3]} />
          <meshStandardMaterial color="#00aa00" />
        </mesh>
      </group>
      
      {/* Oxygen bubbles */}
      {isRunning && bubbles.map((bubble, i) => (
        <mesh key={i} position={bubble.position} scale={bubble.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial transparent opacity={0.6} color="#ffffff" />
        </mesh>
      ))}
    </group>
  )
}

interface ObjectData {
  position: [number, number, number]
  size: [number, number, number]
  color: string
  name: string
  density: number
}

// Density determination setup 
const DensitySetup: React.FC<ExperimentProps> = ({ isRunning = false, volume = 100 }) => {
  const objects: ObjectData[] = [
    { position: [-1.5, 0, 0], size: [0.8, 0.8, 0.8], color: "#884400", name: "Wood", density: 0.8 },
    { position: [0, 0, 0], size: [0.5, 0.5, 0.5], color: "#888888", name: "Steel", density: 7.8 },
    { position: [1.5, 0, 0], size: [0.7, 0.7, 0.7], color: "#ffcc00", name: "Plastic", density: 1.2 }
  ]
  
  // Water level based on volume
  const waterHeight = (volume / 500) * 2
  
  return (
    <group position={[0, -1, 0]}>
      {/* Container */}
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[5, 3, 3]} />
        <meshStandardMaterial wireframe color="#444444" />
      </mesh>
      
      {/* Water */}
      <mesh position={[0, waterHeight/2, 0]}>
        <boxGeometry args={[4.9, waterHeight, 2.9]} />
        <meshStandardMaterial transparent opacity={0.4} color="#a0d8f0" />
      </mesh>
      
      {/* Objects with different densities */}
      {objects.map((obj, i) => {
        // Calculate if object floats or sinks
        const floatHeight = obj.density < 1 
          ? Math.min(waterHeight - (obj.size[1]/2), 1) 
          : Math.max(-0.5, waterHeight - obj.size[1] - obj.density/2)
        
        return (
          <group key={i}>
            <mesh position={[obj.position[0], floatHeight, obj.position[2]]}>
              <boxGeometry args={obj.size} />
              <meshStandardMaterial color={obj.color} />
            </mesh>
            <Html position={[obj.position[0], -1.3, obj.position[2]]}>
              <div className="bg-white px-2 py-1 rounded text-center">
                <p className="text-xs font-bold">{obj.name}</p>
                <p className="text-xs">{obj.density} g/cm³</p>
              </div>
            </Html>
          </group>
        )
      })}
    </group>
  )
}

interface SceneProps {
  experimentId: string
  temperature: number
  pH: number
  volume: number
  isRunning: boolean
}

// Scene setup with appropriate experiment visualization
const ExperimentScene: React.FC<SceneProps> = ({ experimentId, temperature, pH, volume, isRunning }) => {
  const { camera } = useThree()
  
  // Set initial camera position
  useEffect(() => {
    camera.position.set(0, 0, 6)
    camera.lookAt(0, 0, 0)
  }, [camera])
  
  // Render appropriate experiment based on ID
  const renderExperiment = () => {
    switch(experimentId) {
      case "acid-base":
        return <AcidBaseSetup temperature={temperature} pH={pH} volume={volume} isRunning={isRunning} />
      case "pendulum":
        return <PendulumSetup isRunning={isRunning} />
      case "photosynthesis":
        return <PhotosynthesisSetup isRunning={isRunning} volume={volume} />
      case "density":
        return <DensitySetup isRunning={isRunning} volume={volume} />
      default:
        return (
          <Text position={[0, 0, 0]} color="black" fontSize={0.5} anchorX="center" anchorY="middle">
            Select an experiment
          </Text>
        )
    }
  }
  
  return (
    <>
      {/* Replace Environment component with better lighting setup */}
      <ambientLight intensity={0.8} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <directionalLight 
        position={[-5, 5, 5]} 
        intensity={0.5} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <hemisphereLight args={['#sky', '#ground', 0.5]} />
      {renderExperiment()}
      <OrbitControls enablePan={false} />
    </>
  )
}

interface ThreeDSimulationProps {
  experimentId?: string
  temperature?: number
  pH?: number 
  volume?: number
  isRunning?: boolean
}

// Main component that renders the 3D scene
const ThreeDSimulation: React.FC<ThreeDSimulationProps> = ({ 
  experimentId = "",
  temperature = 25, 
  pH = 7, 
  volume = 100,
  isRunning = false
}) => {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden">
      <Canvas 
        shadows 
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 2]}
      >
        <ExperimentScene 
          experimentId={experimentId} 
          temperature={temperature} 
          pH={pH} 
          volume={volume}
          isRunning={isRunning}
        />
      </Canvas>
    </div>
  )
}

export default ThreeDSimulation 