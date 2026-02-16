import { useRef, useState, useCallback, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { Html, useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";

const Bullet = ({ position, velocity }: { position: THREE.Vector3, velocity: THREE.Vector3 }) => {
    return (
        <RigidBody
            name="bullet"
            userData={{ type: "bullet" }}
            position={[position.x, position.y, position.z]}
            linearVelocity={[velocity.x, velocity.y, velocity.z]}
            colliders="ball"
            ccd={true}
        >
            <mesh>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshBasicMaterial color="#00ffcc" />
            </mesh>
        </RigidBody>
    );
};

export const Weapon = ({ isMobile }: { isMobile: boolean }) => {
    const rootRef = useRef<THREE.Group>(null);
    const swayRef = useRef<THREE.Group>(null);
    const modelRef = useRef<THREE.Group>(null);
    const muzzleFlashRef = useRef<THREE.Mesh>(null);

    const [isShooting, setIsShooting] = useState(false);
    const [isReloading, setIsReloading] = useState(false);
    const [ammo, setAmmo] = useState(30);
    const [bullets, setBullets] = useState<{ id: number, pos: THREE.Vector3, vel: THREE.Vector3 }[]>([]);

    const lastShootTime = useRef(0);
    const [, getKeys] = useKeyboardControls();

    const { camera } = useThree();
    const recoilOffset = useRef(0);

    const handleShoot = useCallback(() => {
        const now = performance.now();
        if (isReloading || ammo <= 0 || now - lastShootTime.current < 150) return;

        lastShootTime.current = now;
        setIsShooting(true);
        setAmmo(a => a - 1);
        recoilOffset.current = 0.1;

        setTimeout(() => setIsShooting(false), 50);

        const bulletPos = camera.position.clone();
        const bulletDir = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
        const bulletVel = bulletDir.multiplyScalar(70);

        const id = Date.now();
        setBullets((prev) => [...prev, { id, pos: bulletPos, vel: bulletVel }]);
        setTimeout(() => setBullets((prev) => prev.filter(b => b.id !== id)), 1000);
    }, [camera, isReloading, ammo]);

    const handleReload = useCallback(() => {
        if (isReloading || ammo === 30) return;
        setIsReloading(true);
        setTimeout(() => {
            setAmmo(30);
            setIsReloading(false);
        }, 1500);
    }, [isReloading, ammo]);

    useFrame((state) => {
        if (!rootRef.current || !swayRef.current || !modelRef.current) return;

        // 1. Root tracking
        rootRef.current.position.copy(state.camera.position);
        rootRef.current.quaternion.copy(state.camera.quaternion);

        // 2. Sway & Recoil Logic
        const targetX = isMobile ? 0 : -state.mouse.x * 0.05;
        const targetY = isMobile ? 0 : state.mouse.y * 0.05;

        recoilOffset.current = THREE.MathUtils.lerp(recoilOffset.current, 0, 0.1);

        swayRef.current.position.x = THREE.MathUtils.lerp(swayRef.current.position.x, 0.3 + targetX, 0.1);
        swayRef.current.position.y = THREE.MathUtils.lerp(swayRef.current.position.y, -0.4 + targetY, 0.1);
        swayRef.current.position.z = -0.6 + recoilOffset.current;

        if (muzzleFlashRef.current) {
            muzzleFlashRef.current.visible = isShooting;
            if (isShooting) muzzleFlashRef.current.scale.setScalar(1 + Math.random());
        }

        // 3. Poll for keyboard shooting
        const { shoot, reload } = getKeys();
        if (shoot) handleShoot();
        if (reload) handleReload();
    });

    useEffect(() => {
        const down = () => { if (document.pointerLockElement || isMobile) handleShoot(); };

        window.addEventListener("mousedown", down);
        window.addEventListener("shoot", handleShoot);
        window.addEventListener("reload", handleReload);

        return () => {
            window.removeEventListener("mousedown", down);
            window.removeEventListener("shoot", handleShoot);
            window.removeEventListener("reload", handleReload);
        };
    }, [handleShoot, handleReload, isMobile]);

    return (
        <>
            <group ref={rootRef}>
                <group ref={swayRef}>
                    <group ref={modelRef} rotation={[0, Math.PI, 0]}>
                        <mesh castShadow>
                            <boxGeometry args={[0.08, 0.1, 0.6]} />
                            <meshStandardMaterial color="#111" roughness={0.1} metalness={0.9} />
                        </mesh>
                        <mesh position={[0, -0.12, 0.1]} castShadow>
                            <boxGeometry args={[0.08, 0.25, 0.12]} />
                            <meshStandardMaterial color="#050505" />
                        </mesh>

                        <mesh ref={muzzleFlashRef} position={[0, 0, 0.35]}>
                            <sphereGeometry args={[0.04, 8, 8]} />
                            <meshBasicMaterial color="#00ffcc" transparent opacity={0.6} />
                            <pointLight color="#00ffcc" intensity={2} distance={3} />
                        </mesh>
                    </group>
                </group>
            </group>

            {bullets.map((b) => (
                <Bullet key={b.id} position={b.pos} velocity={b.vel} />
            ))}

            <Html fullscreen pointerEvents="none">
                <div className="ammo-display" style={{
                    position: 'absolute', bottom: isMobile ? '120px' : '40px',
                    right: '40px', fontSize: isMobile ? '2rem' : '3rem',
                    fontWeight: 900, color: ammo < 10 ? '#ff4444' : '#fff',
                    fontFamily: 'Outfit, sans-serif', textShadow: '0 0 20px rgba(0,0,0,0.5)'
                }}>
                    {isReloading ? "RELOADING..." : `${ammo}/30`}
                </div>
            </Html>
        </>
    );
};
