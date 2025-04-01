
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface WebGLAnimationProps {
  type: 'particles' | 'waves' | 'nebula' | 'stars' | 'galaxy' | 'fireflies' | 'aurora' | 'rain';
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

      case 'galaxy': {
        // Создаем галактику
        const galaxyGeometry = new THREE.BufferGeometry();
        const galaxyCount = 15000;
        const positions = new Float32Array(galaxyCount * 3);
        const colors = new Float32Array(galaxyCount * 3);
        
        const colorInside = new THREE.Color(0x9e42f5); // Фиолетовый
        const colorOutside = new THREE.Color(0x42c5f5); // Голубой
        
        const galaxyParams = {
          branches: 5,
          spin: 1,
          radius: 10,
          randomness: 0.2,
          randomnessPower: 3
        };
        
        for (let i = 0; i < galaxyCount; i++) {
          const i3 = i * 3;
          
          // Position
          const radius = Math.random() * galaxyParams.radius;
          const spinAngle = radius * galaxyParams.spin;
          const branchAngle = (i % galaxyParams.branches) / galaxyParams.branches * Math.PI * 2;
          
          const randomX = Math.pow(Math.random(), galaxyParams.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParams.randomness * radius;
          const randomY = Math.pow(Math.random(), galaxyParams.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParams.randomness * radius;
          const randomZ = Math.pow(Math.random(), galaxyParams.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParams.randomness * radius;
          
          positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
          positions[i3 + 1] = randomY;
          positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;
          
          // Color
          const mixedColor = colorInside.clone();
          mixedColor.lerp(colorOutside, radius / galaxyParams.radius);
          
          colors[i3] = mixedColor.r;
          colors[i3 + 1] = mixedColor.g;
          colors[i3 + 2] = mixedColor.b;
        }
        
        galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const galaxyMaterial = new THREE.PointsMaterial({
          size: 0.1,
          sizeAttenuation: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          vertexColors: true,
          transparent: true,
          opacity: opacity
        });
        
        const galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);
        scene.add(galaxy);
        
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          
          galaxy.rotation.y += 0.0005;
          galaxy.rotation.z += 0.0002;
          
          renderer.render(scene, camera);
        };
        
        animate();
        break;
      }
      
      case 'fireflies': {
        // Светлячки
        const fireflyGeometry = new THREE.BufferGeometry();
        const fireflyCount = 100;
        const fireflyPositions = new Float32Array(fireflyCount * 3);
        const fireflyScales = new Float32Array(fireflyCount);
        
        for (let i = 0; i < fireflyCount; i++) {
          const i3 = i * 3;
          
          fireflyPositions[i3] = (Math.random() - 0.5) * 40;
          fireflyPositions[i3 + 1] = (Math.random() - 0.5) * 20;
          fireflyPositions[i3 + 2] = (Math.random() - 0.5) * 40;
          
          fireflyScales[i] = Math.random();
        }
        
        fireflyGeometry.setAttribute('position', new THREE.BufferAttribute(fireflyPositions, 3));
        fireflyGeometry.setAttribute('aScale', new THREE.BufferAttribute(fireflyScales, 1));
        
        // Настраиваем материал для светлячков с цветом и размером
        const fireflyMaterial = new THREE.PointsMaterial({
          size: 0.5,
          color: 0xe1ff74,
          transparent: true,
          opacity: opacity,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        
        const fireflies = new THREE.Points(fireflyGeometry, fireflyMaterial);
        scene.add(fireflies);
        
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          
          const time = Date.now() * 0.001;
          
          const positions = fireflyGeometry.attributes.position.array;
          const scales = fireflyGeometry.attributes.aScale.array;
          
          for (let i = 0; i < fireflyCount; i++) {
            const i3 = i * 3;
            
            // Создаем эффект движения светлячков
            const x = positions[i3];
            const y = positions[i3 + 1];
            const z = positions[i3 + 2];
            
            positions[i3] = x + Math.sin(time + i * 0.1) * 0.02;
            positions[i3 + 1] = y + Math.cos(time + i * 0.2) * 0.02;
            positions[i3 + 2] = z + Math.sin(time + i * 0.3) * 0.02;
            
            // Пульсирующий размер
            const scale = scales[i];
            fireflyMaterial.size = 0.3 + Math.sin(time + scale * 10) * 0.2;
          }
          
          fireflyGeometry.attributes.position.needsUpdate = true;
          
          renderer.render(scene, camera);
        };
        
        animate();
        break;
      }
      
      case 'aurora': {
        // Северное сияние
        const auroraGeometry = new THREE.PlaneGeometry(100, 30, 100, 20);
        
        // Создаем градиентный материал
        const auroraUniforms = {
          time: { value: 0 }
        };
        
        const auroraMaterial = new THREE.ShaderMaterial({
          uniforms: auroraUniforms,
          vertexShader: `
            varying vec2 vUv;
            uniform float time;
            
            void main() {
              vUv = uv;
              
              // Волнообразная деформация
              vec3 pos = position;
              float waveX = sin(pos.x * 0.05 + time * 0.5) * 2.0;
              float waveY = sin(pos.y * 0.1 + time * 0.2) * 0.5;
              pos.z += waveX + waveY;
              
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `,
          fragmentShader: `
            varying vec2 vUv;
            uniform float time;
            
            void main() {
              // Градиент цвета северного сияния
              vec3 colorA = vec3(0.1, 0.5, 0.9);  // Синий
              vec3 colorB = vec3(0.1, 0.8, 0.5);  // Зеленый
              
              // Добавляем смешивание цветов на основе времени
              float mixValue = sin(vUv.y * 3.14159 + time * 0.2) * 0.5 + 0.5;
              vec3 finalColor = mix(colorA, colorB, mixValue);
              
              // Прозрачность, чтобы края были почти невидимыми
              float alpha = sin(vUv.y * 3.14159) * 0.7 * ${opacity};
              
              gl_FragColor = vec4(finalColor, alpha);
            }
          `,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        });
        
        const aurora = new THREE.Mesh(auroraGeometry, auroraMaterial);
        aurora.position.z = -20;
        aurora.position.y = 10;
        aurora.rotation.x = -Math.PI / 8;
        scene.add(aurora);
        
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          
          // Обновляем время для шейдера
          auroraUniforms.time.value = Date.now() * 0.001;
          
          renderer.render(scene, camera);
        };
        
        animate();
        break;
      }
      
      case 'rain': {
        // Дождь
        const rainGeometry = new THREE.BufferGeometry();
        const rainCount = 10000;
        const rainPositions = new Float32Array(rainCount * 3);
        const rainVelocities = new Float32Array(rainCount);
        
        for (let i = 0; i < rainCount; i++) {
          const i3 = i * 3;
          
          // Распределяем капли дождя над камерой
          rainPositions[i3] = (Math.random() - 0.5) * 100;
          rainPositions[i3 + 1] = Math.random() * 50 + 25; // Выше камеры
          rainPositions[i3 + 2] = (Math.random() - 0.5) * 100;
          
          // Скорость падения
          rainVelocities[i] = 0.1 + Math.random() * 0.3;
        }
        
        rainGeometry.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
        
        // Создаем материал для капель дождя
        const rainMaterial = new THREE.PointsMaterial({
          color: 0x9ab9ff,
          size: 0.1,
          transparent: true,
          opacity: opacity * 0.6,
          blending: THREE.AdditiveBlending
        });
        
        const rain = new THREE.Points(rainGeometry, rainMaterial);
        scene.add(rain);
        
        const animate = () => {
          animationId = requestAnimationFrame(animate);
          
          const positions = rainGeometry.attributes.position.array;
          
          for (let i = 0; i < rainCount; i++) {
            const i3 = i * 3;
            
            // Физика падения дождя
            positions[i3 + 1] -= rainVelocities[i];
            
            // Если капля упала ниже определенного уровня, возвращаем ее наверх
            if (positions[i3 + 1] < -20) {
              positions[i3] = (Math.random() - 0.5) * 100;
              positions[i3 + 1] = Math.random() * 50 + 25;
              positions[i3 + 2] = (Math.random() - 0.5) * 100;
            }
          }
          
          rainGeometry.attributes.position.needsUpdate = true;
          
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
