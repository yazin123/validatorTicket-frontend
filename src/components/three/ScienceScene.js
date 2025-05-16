import React, { Suspense, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, Stars, PointMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';
import Atom from './Atom';

// Camera controller for user interaction
function CameraController({ speed = 0.5 }) {
  const { camera, gl } = useThree();
  const keys = useRef({});
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      keys.current[e.key.toLowerCase()] = true;
    };
    
    const handleKeyUp = (e) => {
      keys.current[e.key.toLowerCase()] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Add instructions
    const instructions = document.createElement('div');
    instructions.style.position = 'absolute';
    instructions.style.bottom = '20px';
    instructions.style.left = '20px';
    instructions.style.color = 'white';
    instructions.style.padding = '10px';
    instructions.style.background = 'rgba(0,0,0,0.5)';
    instructions.style.borderRadius = '5px';
    instructions.style.fontFamily = 'sans-serif';
    instructions.style.zIndex = '1000';
    instructions.style.pointerEvents = 'none';
    instructions.innerHTML = 'Use WASD keys to move | Arrow keys or drag to look around | Scroll to zoom';
    gl.domElement.parentNode.appendChild(instructions);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (instructions.parentNode) {
        instructions.parentNode.removeChild(instructions);
      }
    };
  }, [gl]);
  
  useFrame(() => {
    // Movement direction vector
    const direction = new THREE.Vector3();
    const frontVector = new THREE.Vector3(0, 0, Number(keys.current['s']) - Number(keys.current['w']));
    const sideVector = new THREE.Vector3(Number(keys.current['d']) - Number(keys.current['a']), 0, 0);
    
    direction
      .subVectors(frontVector, sideVector)
      .normalize()
      .multiplyScalar(speed);
      
    // Apply to camera position based on its orientation
    if (direction.length() > 0) {
      const cameraDirection = new THREE.Vector3();
      camera.getWorldDirection(cameraDirection);
      
      const movement = new THREE.Vector3();
      if (frontVector.z > 0) { // S key - move backward
        movement.addScaledVector(cameraDirection, -direction.z);
      } else if (frontVector.z < 0) { // W key - move forward
        movement.addScaledVector(cameraDirection, -direction.z);
      }
      
      // Handle strafing (A/D keys) perpendicular to camera direction
      if (sideVector.x !== 0) {
        const strafeDir = new THREE.Vector3()
          .crossVectors(camera.up, cameraDirection)
          .normalize();
        movement.addScaledVector(strafeDir, direction.x);
      }
      
      camera.position.add(movement);
    }
  });
  
  return null;
}

function RandomAtoms({ count = 10, radius = 30 }) {
  const atoms = useMemo(() => {
    const temp = [];
    const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#3b82f6'];
    
    for (let i = 0; i < count; i++) {
      const position = [
        (Math.random() - 0.5) * radius,
        (Math.random() - 0.5) * radius,
        (Math.random() - 0.5) * radius - 5 // Push back a bit
      ];
      
      const size = Math.random() * 0.5 + 0.3;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      temp.push({ position, size, color });
    }
    
    return temp;
  }, [count, radius]);
  
  return atoms.map((props, i) => <Atom key={i} {...props} />);
}

function Stars2({ count = 1000 }) {
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 150;
      positions[i3 + 1] = (Math.random() - 0.5) * 150;
      positions[i3 + 2] = (Math.random() - 0.5) * 150;
    }
    return positions;
  }, [count]);
  
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        size={0.15}
        color="#ffffff"
        sizeAttenuation
        transparent
        depthWrite={false}
      />
    </points>
  );
}

// Interactive atom that reacts to proximity
function InteractiveAtom({ position, size, color, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = React.useState(false);
  const { camera } = useThree();
  
  useFrame(() => {
    if (meshRef.current) {
      // Calculate distance to camera
      const dist = meshRef.current.position.distanceTo(camera.position);
      
      // Pulse effect based on proximity
      if (dist < 10) {
        const scale = 1 + Math.sin(Date.now() * 0.005) * 0.1;
        meshRef.current.scale.set(scale, scale, scale);
      } else {
        meshRef.current.scale.set(1, 1, 1);
      }
    }
  });
  
  return (
    <group 
      position={position} 
      ref={meshRef}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Atom size={size} color={hovered ? '#22d3ee' : color} />
      {hovered && (
        <Text 
          position={[0, size * 2.5, 0]} 
          fontSize={0.5} 
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          Click to interact
        </Text>
      )}
    </group>
  );
}

const ScienceScene = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <Canvas>
        <color attach="background" args={['#050816']} />
        <fog attach="fog" args={['#070b34', 10, 70]} />
        
        {/* Use perspective camera but don't make it default to allow our controller to work */}
        <PerspectiveCamera position={[0, 0, 20]} fov={75} makeDefault />
        
        {/* Lights */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#3b82f6" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
        <pointLight position={[0, 5, 0]} intensity={0.8} color="#ffffff" />
        
        <Suspense fallback={null}>
          {/* Main central atom - now interactive */}
          <InteractiveAtom 
            position={[0, 0, 0]} 
            size={1.2} 
            color="#6366f1" 
            onClick={() => alert('You discovered the central atom!')}
          />
          
          {/* Interactive atoms scattered around */}
          <InteractiveAtom position={[5, 2, -5]} size={0.8} color="#8b5cf6" onClick={() => alert('Quantum physics atom discovered!')} />
          <InteractiveAtom position={[-5, -2, -15]} size={0.7} color="#ec4899" onClick={() => alert('Dark matter particle found!')} />
          <InteractiveAtom position={[-8, 4, -20]} size={0.9} color="#10b981" onClick={() => alert('Higgs boson detected!')} />
          
          {/* Random atoms in the scene */}
          <RandomAtoms count={12} radius={50} />
          
          {/* Star field */}
          <Stars2 count={2000} />
          <Stars radius={100} depth={50} count={3000} factor={5} saturation={0} fade speed={1} />
          
          <Environment preset="night" />
        </Suspense>
        
        {/* First-person camera controller */}
        <CameraController />
        
        {/* Allow orbit controls but with limitations */}
        <OrbitControls 
          enableZoom 
          enablePan={false} 
          maxDistance={50}
          minDistance={2}
        />
      </Canvas>
    </div>
  );
};

export default ScienceScene; 