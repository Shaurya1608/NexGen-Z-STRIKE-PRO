import { Canvas } from "@react-three/fiber";
import { KeyboardControls, PointerLockControls } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { Engine } from "./Engine";
import { Map } from "./Map";
import { Player } from "./Player";
import { Weapon } from "./Weapon";
import { Zombies } from "./Zombies";
import { useEffect, useState, useCallback, useRef } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";

declare global {
  interface Window {
    GametSDK: any;
  }
}

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
  { name: "jump", keys: ["Space"] },
  { name: "reload", keys: ["KeyR"] },
  { name: "shoot", keys: ["KeyE", "KeyF"] },
];

function App() {
  const [gameState, setGameState] = useState<"menu" | "playing" | "gameover">("menu");
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [kills, setKills] = useState(0);
  const [killFeed, setKillFeed] = useState<{ id: number; msg: string }[]>([]);
  const [lastHit, setLastHit] = useState(false);
  const [isDamaged, setIsDamaged] = useState(false);

  const [dangerLevel, setDangerLevel] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);

  const [isMobile] = useState(() => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  const joystickValue = useRef({ x: 0, y: 0 });
  const [joystickDisplay, setJoystickDisplay] = useState({ x: 0, y: 0 });

  const lookDelta = useRef({ x: 0, y: 0 });
  const lastTouch = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (window.GametSDK) {
      window.GametSDK.init("nexgen-z-strike-pro", {
        onInit: () => console.log("GamerThred SDK Pro Ready"),
      });
    }
  }, []);

  useEffect(() => {
    if (gameState !== "playing") return;
    const interval = setInterval(() => {
      setElapsedTime(t => t + 1);
      setDangerLevel(t => Math.floor(t / 60) + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameState]);

  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setHealth(100);
    setKills(0);
    setDangerLevel(1);
    setElapsedTime(0);
    if (window.GametSDK) window.GametSDK.matchStart();
  };

  const handleZombieHit = useCallback((_pos: THREE.Vector3, isKill = false) => {
    setScore((s) => {
      const added = isKill ? 100 : 25;
      const newScore = s + added;
      if (window.GametSDK) window.GametSDK.reportScoreUpdate(newScore);
      return newScore;
    });

    if (isKill) {
      setKills(k => k + 1);
      const id = Date.now();
      const msgs = ["TARGET NEUTRALIZED", "THREAT ELIMINATED", "CONFIRMED KILL"];
      const msg = msgs[Math.floor(Math.random() * msgs.length)];
      setKillFeed(prev => [{ id, msg }, ...prev].slice(0, 3));
      setTimeout(() => setKillFeed(prev => prev.filter(k => k.id !== id)), 3000);
    }

    setLastHit(true);
    setTimeout(() => setLastHit(false), 150);
  }, []);

  const handlePlayerDamage = useCallback(() => {
    if (gameState !== "playing") return;
    setHealth((h) => {
      const newHealth = Math.max(0, h - (5 + dangerLevel));
      if (newHealth <= 0) setGameState("gameover");
      return newHealth;
    });
    setIsDamaged(true);
    setTimeout(() => setIsDamaged(false), 200);
  }, [gameState, dangerLevel]);

  const handleMatchEnd = () => {
    if (window.GametSDK) window.GametSDK.matchEnd({ score, kills, survival_time: elapsedTime });
    window.location.reload();
  };

  const handleMoveJoystick = (e: React.TouchEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const { clientX, clientY } = e.touches[0];

    let dx = (clientX - centerX) / (rect.width / 2);
    let dy = (clientY - centerY) / (rect.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 1) { dx /= dist; dy /= dist; }

    joystickValue.current = { x: dx, y: -dy };
    setJoystickDisplay({ x: dx * 40, y: dy * 40 });
  };

  const handleLookZone = (e: React.TouchEvent) => {
    const { clientX, clientY } = e.touches[0];
    if (lastTouch.current.x !== 0) {
      lookDelta.current = {
        x: clientX - lastTouch.current.x,
        y: clientY - lastTouch.current.y
      };
    }
    lastTouch.current = { x: clientX, y: clientY };
  };

  const resetLook = () => {
    lastTouch.current = { x: 0, y: 0 };
    lookDelta.current = { x: 0, y: 0 };
  };

  return (
    <div className={`game-container ${isMobile ? 'mobile' : ''}`}>
      <AnimatePresence>
        {gameState === "menu" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overlay main-menu">
            <div className="branding">
              <motion.h1 initial={{ y: -20 }} animate={{ y: 0 }}>Z-STRIKE PRO</motion.h1>
              <div className="version-tag">MIDNIGHT SURVIVAL | V2.2</div>
            </div>
            <button className="btn-primary" onClick={startGame}>INITIALIZE MISSION</button>
            <div className="controls-hint">
              {isMobile ? "TOUCH CONTROLS: LEFT=MOVE, RIGHT=LOOK" : "MOVE [WASD] | SHOOT [LMB] | RELOAD [R]"}
            </div>
          </motion.div>
        )}

        {gameState === "gameover" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overlay game-over">
            <h2>MISSION FAILED</h2>
            <div className="final-stats">
              <div className="stat-card"><span>REVENUE</span><strong>${score}</strong></div>
              <div className="stat-card"><span>SURVIVED</span><strong>{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</strong></div>
              <div className="stat-card"><span>DANGER</span><strong>LVL {dangerLevel}</strong></div>
            </div>
            <button className="btn-primary" onClick={handleMatchEnd}>SUBMIT REPORT</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`damage-fx ${isDamaged ? "active" : ""}`} />

      {gameState === "playing" && (
        <div className="hud-layer">
          <div className={`crosshair ${lastHit ? "hit" : ""}`} />

          <div className="hud-top">
            <div className="kill-feed">
              <AnimatePresence>
                {killFeed.map(k => (
                  <motion.div key={k.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 20, opacity: 0 }} className="feed-item">
                    {k.msg}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="danger-widget">
              <div className="label">DANGER LEVEL</div>
              <div className="value">{dangerLevel}</div>
              <div className="danger-bar-bg"><div className="danger-bar-fill" style={{ width: `${(elapsedTime % 60) / 60 * 100}%` }} /></div>
            </div>
            <div className="score-widget">
              <div className="label">REVENUE</div>
              <div className="value">${score.toLocaleString()}</div>
            </div>
          </div>

          <div className="hud-bottom">
            <div className="status-grid">
              <div className="status-group">
                <div className="label">VITALS</div>
                <div className="bar-container hp">
                  <div className="bar-fill" style={{ width: `${health}%` }} />
                </div>
              </div>
            </div>
          </div>

          {isMobile && (
            <div className="mobile-ui">
              <div className="move-zone" onTouchMove={handleMoveJoystick} onTouchEnd={() => { joystickValue.current = { x: 0, y: 0 }; setJoystickDisplay({ x: 0, y: 0 }); }}>
                <div className="joystick-zone">
                  <div className="joystick-knob" style={{ transform: `translate(${joystickDisplay.x}px, ${joystickDisplay.y}px)` }} />
                </div>
              </div>

              <div className="look-zone" onTouchMove={handleLookZone} onTouchEnd={resetLook}>
                <div className="shoot-btn" onTouchStart={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('shoot')); }}>FIRE</div>
                <div className="action-btns">
                  <div className="mini-btn" onTouchStart={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('reload')); }}>R</div>
                  <div className="mini-btn" onTouchStart={(e) => { e.stopPropagation(); window.dispatchEvent(new CustomEvent('jump')); }}>▲</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {gameState === "playing" && (
        <KeyboardControls map={keyboardMap}>
          {/* PERFORMANCE OPTIMIZED CANVAS: Fixed DPR for Mobile */}
          <Canvas
            shadows
            camera={{ fov: 45 }}
            dpr={isMobile ? [1, 1] : [1, 2]}
            gl={{
              powerPreference: "high-performance",
              antialias: !isMobile
            }}
          >
            <Physics gravity={[0, -9.81, 0]}>
              <Engine>
                <Map />
                <Player mobileJoystick={joystickValue.current} mobileLookDelta={lookDelta} />
                <Weapon isMobile={isMobile} />
                <Zombies dangerLevel={dangerLevel} onHit={handleZombieHit} onAttack={handlePlayerDamage} />
              </Engine>
            </Physics>
            {!isMobile && <PointerLockControls makeDefault />}
          </Canvas>
        </KeyboardControls>
      )}
    </div>
  );
}

export default App;
