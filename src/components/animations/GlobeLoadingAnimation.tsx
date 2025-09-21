
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface GlobeLoadingAnimationProps {
  onComplete?: () => void;
}

export function GlobeLoadingAnimation({ onComplete }: GlobeLoadingAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Создаем сцену
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Создаем камеру
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    // Создаем рендерер
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;

    containerRef.current.appendChild(renderer.domElement);

    // Создаем геометрию глобуса
    const geometry = new THREE.SphereGeometry(1, 64, 32);

    // Создаем более активный материал с динамическими цветами
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color(0x6366f1) },
        color2: { value: new THREE.Color(0x8b5cf6) },
        color3: { value: new THREE.Color(0x3b82f6) },
        color4: { value: new THREE.Color(0xf59e0b) },
        color5: { value: new THREE.Color(0xef4444) },
        color6: { value: new THREE.Color(0x10b981) },
        opacity: { value: 0.9 },
        waveAmplitude: { value: 0.1 },
        waveFrequency: { value: 5.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        uniform float time;
        uniform float waveAmplitude;
        uniform float waveFrequency;
        
        void main() {
          vUv = uv;
          vPosition = position;
          vNormal = normal;
          
          // Более активная деформация с волнами
          vec3 pos = position;
          
          // Основные волны
          pos += sin(position.x * waveFrequency + time * 2.0) * waveAmplitude;
          pos += cos(position.y * waveFrequency + time * 1.5) * waveAmplitude;
          pos += sin(position.z * waveFrequency + time * 1.8) * waveAmplitude;
          
          // Дополнительные волны для большей активности
          pos += sin(position.x * waveFrequency * 2.0 + time * 3.0) * waveAmplitude * 0.5;
          pos += cos(position.y * waveFrequency * 1.5 + time * 2.5) * waveAmplitude * 0.5;
          
          // Пульсация
          float pulse = sin(time * 4.0) * 0.05;
          pos *= (1.0 + pulse);
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform vec3 color4;
        uniform vec3 color5;
        uniform vec3 color6;
        uniform float opacity;
        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;
        
        void main() {
          // Создаем динамические цветовые переходы
          float mixer1 = sin(vPosition.x * 8.0 + time * 2.0) * 0.5 + 0.5;
          float mixer2 = cos(vPosition.y * 6.0 + time * 1.5) * 0.5 + 0.5;
          float mixer3 = sin(vPosition.z * 10.0 + time * 3.0) * 0.5 + 0.5;
          
          // Временные переменные для цикличной смены цветов
          float colorCycle = sin(time * 0.8) * 0.5 + 0.5;
          float colorCycle2 = cos(time * 1.2) * 0.5 + 0.5;
          float colorCycle3 = sin(time * 0.6) * 0.5 + 0.5;
          
          // Смешиваем 6 цветов циклично
          vec3 baseColor1 = mix(color1, color2, colorCycle);
          vec3 baseColor2 = mix(color3, color4, colorCycle2);
          vec3 baseColor3 = mix(color5, color6, colorCycle3);
          
          // Применяем пространственные миксеры
          vec3 color = mix(baseColor1, baseColor2, mixer1);
          color = mix(color, baseColor3, mixer2 * mixer3);
          
          // Добавляем дополнительные цветовые вариации
          float hueShift = sin(time * 2.0 + vPosition.x + vPosition.y + vPosition.z) * 0.3;
          color.rgb = mix(color.rgb, color.brg, hueShift);
          
          // Более активный эффект свечения
          float fresnel = dot(normalize(vNormal), vec3(0.0, 0.0, 1.0));
          fresnel = pow(1.0 - abs(fresnel), 3.0);
          
          // Добавляем пульсирующее свечение с изменением цвета
          float pulse = sin(time * 6.0) * 0.3 + 0.7;
          vec3 glowColor = mix(color1, color4, sin(time * 3.0) * 0.5 + 0.5);
          
          // Энергетические линии
          float lines = sin(vUv.x * 50.0 + time * 4.0) * sin(vUv.y * 30.0 + time * 3.0);
          lines = smoothstep(0.5, 1.0, lines) * 0.2;
          vec3 lineColor = mix(color2, color5, sin(time * 4.0) * 0.5 + 0.5);
          
          vec3 finalColor = color + fresnel * glowColor * pulse + lines * lineColor;
          gl_FragColor = vec4(finalColor, opacity);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    // Создаем глобус
    const globe = new THREE.Mesh(geometry, material);
    globeRef.current = globe;
    scene.add(globe);

    // Создаем более активный каркас глобуса с динамическими цветами
    const wireframeGeometry = new THREE.SphereGeometry(1.02, 32, 16);
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    scene.add(wireframe);

    // Второй каркас для большей активности
    const wireframe2Geometry = new THREE.SphereGeometry(1.05, 24, 12);
    const wireframe2Material = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.2
    });
    const wireframe2 = new THREE.Mesh(wireframe2Geometry, wireframe2Material);
    scene.add(wireframe2);

    // Увеличенное количество частиц для большей активности
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 2000;
    const posArray = new Float32Array(particleCount * 3);
    const velocityArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 1.3 + Math.random() * 1.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      posArray[i] = radius * Math.sin(phi) * Math.cos(theta);
      posArray[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      posArray[i + 2] = radius * Math.cos(phi);

      // Добавляем скорости для движения частиц
      velocityArray[i] = (Math.random() - 0.5) * 0.02;
      velocityArray[i + 1] = (Math.random() - 0.5) * 0.02;
      velocityArray[i + 2] = (Math.random() - 0.5) * 0.02;

      // Добавляем случайные цвета для частиц
      const colors = [
        [0.39, 0.4, 0.95],   // blue
        [0.55, 0.36, 0.96],  // purple
        [0.23, 0.51, 0.96],  // light blue
        [0.96, 0.62, 0.04],  // orange
        [0.94, 0.27, 0.27],  // red
        [0.06, 0.73, 0.51]   // green
      ];
      const colorIndex = Math.floor(Math.random() * colors.length);
      colorArray[i] = colors[colorIndex][0];
      colorArray[i + 1] = colors[colorIndex][1];
      colorArray[i + 2] = colors[colorIndex][2];
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      size: 0.03,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });

    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Дополнительные энергетические кольца с динамическими цветами
    const ringGeometry = new THREE.RingGeometry(1.2, 1.3, 32);
    const ringMaterial1 = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const ringMaterial2 = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    const ringMaterial3 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide
    });
    
    const ring1 = new THREE.Mesh(ringGeometry, ringMaterial1);
    ring1.rotation.x = Math.PI / 2;
    scene.add(ring1);
    
    const ring2 = new THREE.Mesh(ringGeometry, ringMaterial2);
    ring2.rotation.z = Math.PI / 2;
    scene.add(ring2);
    
    const ring3 = new THREE.Mesh(ringGeometry, ringMaterial3);
    ring3.rotation.y = Math.PI / 2;
    scene.add(ring3);

    // Анимация с более активными движениями и сменой цветов
    let startTime = Date.now();
    let animationId: number;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const elapsed = (Date.now() - startTime) / 1000;
      
      // Обновляем uniform для шейдера
      if (material.uniforms) {
        material.uniforms.time.value = elapsed;
        material.uniforms.waveAmplitude.value = 0.08 + Math.sin(elapsed * 2) * 0.05;
        
        // Динамически меняем цвета глобуса
        const hue1 = (elapsed * 0.5) % 1;
        const hue2 = (elapsed * 0.7 + 0.33) % 1;
        const hue3 = (elapsed * 0.9 + 0.66) % 1;
        
        material.uniforms.color1.value.setHSL(hue1, 0.8, 0.6);
        material.uniforms.color2.value.setHSL(hue2, 0.8, 0.6);
        material.uniforms.color3.value.setHSL(hue3, 0.8, 0.6);
        material.uniforms.color4.value.setHSL((hue1 + 0.5) % 1, 0.8, 0.6);
        material.uniforms.color5.value.setHSL((hue2 + 0.5) % 1, 0.8, 0.6);
        material.uniforms.color6.value.setHSL((hue3 + 0.5) % 1, 0.8, 0.6);
      }

      // Более активное вращение глобуса
      if (globe) {
        globe.rotation.y += 0.008 + Math.sin(elapsed) * 0.003;
        globe.rotation.x += 0.003 + Math.cos(elapsed * 1.5) * 0.002;
        globe.rotation.z += 0.001;
      }

      // Динамически меняем цвета каркасов
      const wireframeHue = (elapsed * 0.3) % 1;
      wireframeMaterial.color.setHSL(wireframeHue, 0.8, 0.6);
      wireframe2Material.color.setHSL((wireframeHue + 0.5) % 1, 0.8, 0.6);

      // Более активное вращение каркасов
      wireframe.rotation.y -= 0.006 + Math.sin(elapsed * 2) * 0.002;
      wireframe.rotation.x -= 0.002;
      wireframe.rotation.z += 0.001;

      wireframe2.rotation.y += 0.004;
      wireframe2.rotation.x += 0.003 + Math.cos(elapsed * 1.8) * 0.002;
      wireframe2.rotation.z -= 0.002;

      // Активное движение частиц с обновлением цветов
      const positions = particles.geometry.attributes.position.array as Float32Array;
      const colors = particles.geometry.attributes.color.array as Float32Array;
      
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocityArray[i] + Math.sin(elapsed + i) * 0.001;
        positions[i + 1] += velocityArray[i + 1] + Math.cos(elapsed + i) * 0.001;
        positions[i + 2] += velocityArray[i + 2] + Math.sin(elapsed * 2 + i) * 0.0005;
        
        // Обновляем цвета частиц
        const particleHue = (elapsed * 0.5 + i * 0.01) % 1;
        const color = new THREE.Color().setHSL(particleHue, 0.8, 0.6);
        colors[i] = color.r;
        colors[i + 1] = color.g;
        colors[i + 2] = color.b;
      }
      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.color.needsUpdate = true;

      // Обновляем цвета колец
      const ringHue1 = (elapsed * 0.4) % 1;
      const ringHue2 = (elapsed * 0.6 + 0.33) % 1;
      const ringHue3 = (elapsed * 0.8 + 0.66) % 1;
      
      ringMaterial1.color.setHSL(ringHue1, 0.8, 0.6);
      ringMaterial2.color.setHSL(ringHue2, 0.8, 0.6);
      ringMaterial3.color.setHSL(ringHue3, 0.8, 0.6);

      // Вращение энергетических колец
      ring1.rotation.z += 0.01 + Math.sin(elapsed) * 0.005;
      ring2.rotation.x += 0.008 + Math.cos(elapsed * 1.3) * 0.003;
      ring3.rotation.y += 0.012 + Math.sin(elapsed * 0.8) * 0.004;

      // Масштабирование колец для пульсации
      const scale = 1 + Math.sin(elapsed * 3) * 0.1;
      ring1.scale.setScalar(scale);
      ring2.scale.setScalar(scale * 1.1);
      ring3.scale.setScalar(scale * 0.9);

      renderer.render(scene, camera);

      // Завершаем анимацию через 4 секунды
      if (elapsed > 4 && onComplete) {
        onComplete();
      }
    };

    animate();

    // Обработчик изменения размера
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Очищаем ресурсы
      geometry.dispose();
      material.dispose();
      wireframeGeometry.dispose();
      wireframeMaterial.dispose();
      wireframe2Geometry.dispose();
      wireframe2Material.dispose();
      particlesGeometry.dispose();
      particlesMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial1.dispose();
      ringMaterial2.dispose();
      ringMaterial3.dispose();
      renderer.dispose();
    };
  }, [onComplete]);

  return (
    <div 
      ref={containerRef} 
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
    />
  );
}
