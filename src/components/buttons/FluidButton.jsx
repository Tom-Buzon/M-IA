import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { extend, Canvas, useFrame, useThree } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

// Shader pour l'effet de fluide
const FluidMaterial = shaderMaterial(
  {
    time: 0,
    mouse: new THREE.Vector2(0, 0),
    resolution: new THREE.Vector2(0, 0),
    color: new THREE.Color('#3B82F6'),
  },
  // Vertex shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment shader
  `
    uniform float time;
    uniform vec2 mouse;
    uniform vec2 resolution;
    uniform vec3 color;
    varying vec2 vUv;

    // Fonction de bruit simplex
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187,
                         0.366025403784439,
                         -0.577350269189626,
                         0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
                      + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      vec2 uv = vUv;
      
      // Effet de distorsion fluide
      float noise1 = snoise(uv * 3.0 + time * 1);
      float noise2 = snoise(uv * 6.0 - time * 0.6);
      float noise3 = snoise(uv * 9.0 + time * 1.4);
      
      float combinedNoise = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
      
      // Ajout d'un effet de souris
      float mouseDist = length(uv - mouse);
      float mouseInfluence = smoothstep(0.5, 0.0, mouseDist);
      
      // Couleur finale avec effet de gradient et luminosité
      vec3 finalColor = mix(
        color,
        color * 1.5,
        combinedNoise * 0.5 + mouseInfluence
      );
      
      // Ajout d'un effet de brillance
      float brightness = smoothstep(0.4, 0.6, combinedNoise);
      finalColor += vec3(brightness) * 0.3;
      
      gl_FragColor = vec4(finalColor, 1.0);
    }
  `
);

extend({ FluidMaterial });

const FluidPlane = ({ color }) => {
  const ref = useRef();
  const { viewport, mouse } = useThree();
  
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.time = clock.getElapsedTime();
      ref.current.mouse.x = (mouse.x + 1) / 2;
      ref.current.mouse.y = (mouse.y + 1) / 2;
    }
  });

  return (
    <mesh>
      <planeGeometry args={[viewport.width, viewport.height]} />
      <fluidMaterial ref={ref} color={color} />
    </mesh>
  );
};

const FluidButton = ({ children, onClick, className = '' }) => {
  const containerRef = useRef();
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative group overflow-hidden rounded-xl ${className}`}
      style={{ width: '200px', height: '60px' }}
    >
      <div className="absolute inset-0 z-0">
        <Canvas>
          <FluidPlane color="#3B82F6" />
        </Canvas>
      </div>
      <button
        onClick={onClick}
        className="relative z-10 w-full h-full flex items-center justify-center text-white font-medium transition-transform duration-300 group-hover:scale-105"
      >
        {children}
      </button>
    </div>
  );
};

export default FluidButton;
