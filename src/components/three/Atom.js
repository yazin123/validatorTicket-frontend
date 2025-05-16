import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line, Trail } from '@react-three/drei';

const Atom = ({ position = [0, 0, 0], size = 1, color = '#6366f1' }) => {
  const nucleusRef = useRef();
  const electron1Ref = useRef();
  const electron2Ref = useRef();
  const electron3Ref = useRef();
  
  const orbitRadius1 = size * 2;
  const orbitRadius2 = size * 2.5;
  const orbitRadius3 = size * 3;
  
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    
    // Rotate nucleus
    if (nucleusRef.current) {
      nucleusRef.current.rotation.y = t * 0.2;
      nucleusRef.current.rotation.z = t * 0.1;
    }
    
    // Move electrons in orbits
    if (electron1Ref.current) {
      electron1Ref.current.position.x = Math.sin(t * 1.5) * orbitRadius1;
      electron1Ref.current.position.z = Math.cos(t * 1.5) * orbitRadius1;
    }
    
    if (electron2Ref.current) {
      electron2Ref.current.position.x = Math.sin(t * 1.2 + 2) * orbitRadius2;
      electron2Ref.current.position.y = Math.cos(t * 1.2 + 2) * orbitRadius2;
    }
    
    if (electron3Ref.current) {
      electron3Ref.current.position.z = Math.sin(t + 4) * orbitRadius3;
      electron3Ref.current.position.y = Math.cos(t + 4) * orbitRadius3;
    }
  });
  
  return (
    <group position={position}>
      {/* Nucleus */}
      <Sphere ref={nucleusRef} args={[size, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} emissive={color} emissiveIntensity={0.4} />
      </Sphere>
      
      {/* Electrons */}
      <Trail local width={2} length={4} decay={1} attenuation={(width) => width}>
        <Sphere ref={electron1Ref} args={[size * 0.2, 16, 16]} position={[orbitRadius1, 0, 0]}>
          <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={1} />
        </Sphere>
      </Trail>
      
      <Trail local width={2} length={3} decay={1} attenuation={(width) => width}>
        <Sphere ref={electron2Ref} args={[size * 0.2, 16, 16]} position={[0, orbitRadius2, 0]}>
          <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={1} />
        </Sphere>
      </Trail>
      
      <Trail local width={2} length={5} decay={1} attenuation={(width) => width}>
        <Sphere ref={electron3Ref} args={[size * 0.2, 16, 16]} position={[0, 0, orbitRadius3]}>
          <meshStandardMaterial color="#60a5fa" emissive="#60a5fa" emissiveIntensity={1} />
        </Sphere>
      </Trail>
      
      {/* Orbit paths (transparent rings) */}
      <Line
        points={Array(64).fill().map((_, i) => [
          Math.sin(i / 64 * Math.PI * 2) * orbitRadius1,
          0,
          Math.cos(i / 64 * Math.PI * 2) * orbitRadius1
        ])}
        color="white"
        lineWidth={1}
        opacity={0.2}
        transparent
      />
      
      <Line
        points={Array(64).fill().map((_, i) => [
          Math.sin(i / 64 * Math.PI * 2) * orbitRadius2,
          Math.cos(i / 64 * Math.PI * 2) * orbitRadius2,
          0
        ])}
        color="white"
        lineWidth={1}
        opacity={0.2}
        transparent
      />
      
      <Line
        points={Array(64).fill().map((_, i) => [
          0,
          Math.sin(i / 64 * Math.PI * 2) * orbitRadius3,
          Math.cos(i / 64 * Math.PI * 2) * orbitRadius3
        ])}
        color="white"
        lineWidth={1}
        opacity={0.2}
        transparent
      />
    </group>
  );
};

export default Atom; 