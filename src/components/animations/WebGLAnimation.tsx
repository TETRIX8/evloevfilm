
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface WebGLAnimationProps {
  type: 'particles' | 'waves' | 'nebula' | 'stars';
  opacity?: number;
}

export function WebGLAnimation({ type, opacity = 0.7 }: WebGLAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
  const [scene] = useState(() => new THREE.Scene());
  const [camera] = useState(() => new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));

  // Инициализация сцены
  useEffect(() => {
    if (!containerRef.current) return;

    // Создаем рендерер
    const newRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    newRenderer.setSize(window.innerWidth, window.innerHeight);
    newRenderer.setPixelRatio(window.devicePixelRatio);
    newRenderer.setClearColor(0x000000, 0);
    
    containerRef.current.appendChild(newRenderer.domElement);
    setRenderer(newRenderer);

    // Настраиваем камеру
    camera.position.z = 30;

    // Обработчик изменения размера окна
    const handleResize = () => {
      if (!containerRef.current || !newRenderer) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      newRenderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current && newRenderer.domElement) {
        containerRef.current.removeChild(newRenderer.domElement);
      }
      newRenderer.dispose();
    };
  }, [camera]);

  // Создание анимации в зависимости от типа
  useEffect(() => {
    if (!renderer) return;

    // Очищаем сцену
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }

    let animationId: number;
    let particles: THREE.Points | null = null;
    let particleSystem: { geometry: THREE.BufferGeometry, material: THREE.Material } | null = null;

    switch (type) {
      case 'particles': {
        // Создаем частицы
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 5000;
        const posArray = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i++) {
          posArray[i] = (Math.random() - 0.5) * 50;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
          size: 0.1,
          color: 0xffffff,
          transparent: true,
          opacity: opacity
        });
        
        particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);
        
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          
          if (particles) {
            particles.rotation.x += 0.0005;
            particles.rotation.y += 0.0005;
          }
          
          renderer.render(scene, camera);
        };
        
        animate();
        break;
      }
      
      case 'waves': {
        // Создаем волновую анимацию
        const geometry = new THREE.PlaneGeometry(60, 60, 50, 50);
        const material = new THREE.MeshBasicMaterial({
          color: 0x6a00ff,
          wireframe: true,
          transparent: true,
          opacity: opacity
        });
        
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2;
        scene.add(plane);
        
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          
          const positions = geometry.attributes.position.array;
          const time = Date.now() * 0.0005;
          
          for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i + 1];
            const distance = Math.sqrt(x * x + y * y);
            positions[i + 2] = Math.sin(distance * 0.5 + time) * 2;
          }
          
          geometry.attributes.position.needsUpdate = true;
          renderer.render(scene, camera);
        };
        
        animate();
        break;
      }
      
      case 'nebula': {
        // Создаем туманность
        const particlesGeometry = new THREE.BufferGeometry();
        const particleCount = 10000;
        const posArray = new Float32Array(particleCount * 3);
        const colorArray = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount * 3; i += 3) {
          // Создаем спиральную туманность
          const radius = Math.random() * 20;
          const theta = Math.random() * Math.PI * 2;
          
          posArray[i] = radius * Math.cos(theta);
          posArray[i + 1] = radius * Math.sin(theta);
          posArray[i + 2] = (Math.random() - 0.5) * 5;
          
          // Добавляем цвет
          colorArray[i] = Math.random() * 0.5 + 0.5; // R
          colorArray[i + 1] = Math.random() * 0.2; // G
          colorArray[i + 2] = Math.random() * 0.5 + 0.5; // B
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({
          size: 0.2,
          vertexColors: true,
          transparent: true,
          opacity: opacity
        });
        
        particles = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particles);
        
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          
          if (particles) {
            particles.rotation.z += 0.001;
          }
          
          renderer.render(scene, camera);
        };
        
        animate();
        break;
      }
      
      case 'stars': {
        // Создаем звездное небо
        const starsGeometry = new THREE.BufferGeometry();
        const starsCount = 10000;
        const starsPositions = new Float32Array(starsCount * 3);
        
        for (let i = 0; i < starsCount * 3; i += 3) {
          // Равномерно распределяем звезды по сфере
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const radius = 50 + Math.random() * 100;
          
          starsPositions[i] = radius * Math.sin(phi) * Math.cos(theta);
          starsPositions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
          starsPositions[i + 2] = radius * Math.cos(phi);
        }
        
        starsGeometry.setAttribute('position', new THREE.BufferAttribute(starsPositions, 3));
        
        const starsMaterial = new THREE.PointsMaterial({
          size: 0.1,
          color: 0xffffff,
          transparent: true,
          opacity: opacity
        });
        
        const stars = new THREE.Points(starsGeometry, starsMaterial);
        scene.add(stars);
        
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          stars.rotation.y += 0.0002;
          renderer.render(scene, camera);
        };
        
        animate();
        break;
      }
    }

    // Запускаем рендеринг
    renderer.render(scene, camera);

    return () => {
      cancelAnimationFrame(animationId);
      if (particles) {
        scene.remove(particles);
        particleSystem?.geometry.dispose();
        particleSystem?.material.dispose();
      }
    };
  }, [scene, camera, renderer, type, opacity]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 pointer-events-none z-0" 
      style={{ opacity }}
    />
  );
}
