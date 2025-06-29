import { useEffect, useRef, useState } from 'preact/hooks'
import * as THREE from 'three'

interface VantaBackgroundProps {
  children: preact.ComponentChildren
}

interface VantaEffect {
  destroy: () => void
}

export function VantaBackground({ children }: VantaBackgroundProps) {
  const [vantaEffect, setVantaEffect] = useState<VantaEffect | null>(null)
  const vantaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadVanta = async () => {
      if (!vantaEffect && vantaRef.current) {
        // @ts-expect-error Vanta types
        const NET = (await import('vanta/dist/vanta.net.min')).default
        setVantaEffect(
          NET({
            el: vantaRef.current,
            THREE: THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.00,
            minWidth: 200.00,
            scale: 1.00,
            scaleMobile: 1.00,
            color: 0xffffff,
            backgroundColor: 0x0
          })
        )
      }
    }
    
    loadVanta()
    
    return () => {
      if (vantaEffect) vantaEffect.destroy()
    }
  }, [vantaEffect])

  return (
    <div ref={vantaRef} style={{ width: '100%', height: '100vh', position: 'fixed'}}>
      {children}
    </div>
  )
}