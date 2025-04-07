
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';

export function BeeMoveAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup
    const camera = new THREE.PerspectiveCamera(10, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 13;

    const scene = new THREE.Scene();
    let bee: THREE.Group;
    let mixer: THREE.AnimationMixer;

    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    containerRef.current.appendChild(renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    scene.add(ambientLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 1);
    topLight.position.set(500, 500, 500);
    scene.add(topLight);

    // Load the bee model
    const loader = new GLTFLoader();
    loader.load(
      "https://raw.githubusercontent.com/DennysDionigi/bee-glb/94253437c023643dd868592e11a0fd2c228cfe07/demon_bee_full_texture.glb",
      (gltf) => {
        bee = gltf.scene;
        scene.add(bee);
        mixer = new THREE.AnimationMixer(bee);
        
        if (gltf.animations.length > 0) {
          mixer.clipAction(gltf.animations[0]).play();
        }
        
        // Set initial position
        bee.position.set(0, -1, 0);
        bee.rotation.set(0, 1.5, 0);
        
        // Add automatic movement
        animateBee();
      },
      undefined,
      (error) => console.error("Error loading model:", error)
    );

    // Simple animation that moves the bee back and forth
    const animateBee = () => {
      if (!bee) return;

      // Create a timeline for continuous animation
      const timeline = gsap.timeline({
        repeat: -1,
        yoyo: true,
        repeatDelay: 0.5
      });

      // Move the bee horizontally
      timeline.to(bee.position, {
        x: 1.5,
        duration: 4,
        ease: "power1.inOut"
      });
      
      timeline.to(bee.position, {
        x: -1.5,
        duration: 4,
        ease: "power1.inOut"
      });

      // Rotate the bee slightly as it moves
      gsap.to(bee.rotation, {
        y: Math.PI * 2,
        duration: 20,
        repeat: -1,
        ease: "none"
      });

      // Add slight up and down movement
      gsap.to(bee.position, {
        y: -0.5,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    };

    // Animation loop
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
      
      if (mixer) {
        mixer.update(0.02);
      }
      
      return animationId;
    };
    
    const animationId = animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      
      if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        pointerEvents: 'none', 
        zIndex: -1 
      }} 
    />
  );
}
