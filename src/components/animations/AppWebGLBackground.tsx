
import { useEffect, useState } from 'react';
import { WebGLAnimation } from './WebGLAnimation';

export function AppWebGLBackground() {
  const [webglEnabled, setWebglEnabled] = useState(false);
  const [animationType, setAnimationType] = useState<'particles' | 'waves' | 'nebula' | 'stars' | null>(null);
  const [opacity, setOpacity] = useState(0.7);

  useEffect(() => {
    // Загружаем настройки из localStorage
    const savedAnimationType = localStorage.getItem('webglAnimation');
    const savedOpacity = localStorage.getItem('webglOpacity');
    
    if (savedAnimationType && savedAnimationType !== 'none') {
      setAnimationType(savedAnimationType as any);
      setWebglEnabled(true);
    }
    
    if (savedOpacity) {
      setOpacity(parseFloat(savedOpacity));
    }
  }, []);

  // Если WebGL отключен, не рендерим анимацию
  if (!webglEnabled || !animationType) return null;

  return <WebGLAnimation type={animationType} opacity={opacity} />;
}
