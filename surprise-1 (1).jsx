import { useState, useEffect, useRef } from "react";

const COLORS = ["#FFD93D","#FF6B9D","#C77DFF","#4ECDC4","#FF8C42","#ffffff"];
const WISH_EMOJIS = ["🌸","💫","🌈","✨","🎉","💖","🌟","🦋","🎊","🌺"];

const REASONS = [
  { emoji:"😂", title:"Always Makes Me Laugh",   text:"No matter how bad the day, one message from you and I'm in tears — the good kind!" },
  { emoji:"🤗", title:"Always There for Me",      text:"Through every high and low, you've never missed a beat. That means everything." },
  { emoji:"✨", title:"Genuinely Unique",          text:"There's literally nobody like you. Your energy, your humour, your heart — one of a kind." },
  { emoji:"🧠", title:"Incredibly Wise",           text:"You give the best advice and somehow always know exactly what I need to hear." },
  { emoji:"🌈", title:"Brings Colour Everywhere",  text:"Every room you walk into becomes a better place. You light things up without trying." },
  { emoji:"💪", title:"Stronger Than You Know",    text:"I've watched you overcome so much. You're one of the strongest people I know." },
];

const MESSAGES = [
  "I don't say it enough, but having you in my life is one of the greatest gifts I've ever received. You make everything brighter. 🌟",
  "Friendship like ours doesn't come around twice. Thank you for choosing to stick around through all my chaos. 😅❤️",
  "You deserve every good thing coming your way — and trust me, SO much good is coming. I just know it. 🔮✨",
  "Remember that time we stayed up until 4am talking about absolutely nothing and everything? Those are the moments I'll hold onto forever. 🌙",
  "I genuinely don't know what I'd do without you. You are my person. My ride or die. My forever friend. 🤝💛",
  "Here's to us, to all our memories, to all the adventures still to come. This is just the beginning! 🚀🎉",
];

const POLAROIDS = [
  { emoji:"🎤", caption:"That karaoke night",  grad:"linear-gradient(135deg,#FFD93D44,#FF6B9D44)" },
  { emoji:"🌊", caption:"Beach adventure!",     grad:"linear-gradient(135deg,#4ECDC444,#C77DFF44)" },
  { emoji:"🍕", caption:"Midnight pizza run",   grad:"linear-gradient(135deg,#FF8C4244,#FFD93D44)" },
  { emoji:"🌙", caption:"Late night talks",     grad:"linear-gradient(135deg,#C77DFF44,#4ECDC444)" },
];

/* ── Confetti engine ── */
function useConfetti(canvasRef) {
  const particles = useRef([]);
  const animId = useRef(null);

  function fire(n = 180, cx, cy) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    for (let i = 0; i < n; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      particles.current.push({
        x: cx ?? Math.random() * canvas.width,
        y: cy ?? -10,
        vx: Math.cos(angle) * speed,
        vy: cy != null ? Math.sin(angle) * speed : Math.random() * 6 + 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 8,
        rect: Math.random() > 0.5,
        life: 1,
        decay: Math.random() * 0.012 + 0.006,
      });
    }
    if (!animId.current) loop();
  }

  function loop() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.current.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.vx *= 0.99;
      p.rotation += p.rotSpeed; p.life -= p.decay;
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      if (p.rect) ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    });
    particles.current = particles.current.filter(p => p.life > 0 && p.y < canvas.height + 40);
    if (particles.current.length > 0) animId.current = requestAnimationFrame(loop);
    else { animId.current = null; ctx.clearRect(0, 0, canvas.width, canvas.height); }
  }

  return { fire };
}

/* ── Stars background ── */
function Stars() {
  const stars = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    size: Math.random() * 2.5 + 0.5,
    top: Math.random() * 100,
    left: Math.random() * 100,
    dur: (Math.random() * 4 + 2).toFixed(1),
    delay: (Math.random() * 5).toFixed(1),
  }));
  return (
    <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0 }}>
      {stars.map(s => (
        <div key={s.id} style={{
          position:"absolute",
          width: s.size, height: s.size,
          top: `${s.top}%`, left: `${s.left}%`,
          background:"white", borderRadius:"50%",
          animation:`twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
        }}/>
      ))}
    </div>
  );
}

/* ── Floating heart ── */
function FloatingHeart({ x, y, emoji, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2600); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position:"fixed", left: x, top: y, fontSize:"1.5rem",
      pointerEvents:"none", zIndex:50,
      animation:"floatUp 2.5s ease forwards",
    }}>{emoji}</div>
  );
}

export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [friendName, setFriendName] = useState("");
  const [displayName, setDisplayName] = useState("Friend");
  const [msgIdx, setMsgIdx] = useState(0);
  const [msgVisible, setMsgVisible] = useState(true);
  const [wishes, setWishes] = useState([]);
  const [wishText, setWishText] = useState("");
  const [hearts, setHearts] = useState([]);
  const canvasRef = useRef(null);
  const { fire } = useConfetti(canvasRef);

  useEffect(() => {
    function resize() {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    }
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  function handleUnlock() {
    const name = friendName.trim() || "Friend";
    setDisplayName(name);
    setUnlocked(true);
    setTimeout(() => fire(180), 400);
    setTimeout(() => fire(180), 1400);
  }

  function nextMessage() {
    setMsgVisible(false);
    setTimeout(() => { setMsgIdx(i => (i + 1) % MESSAGES.length); setMsgVisible(true); }, 350);
  }

  function spawnHearts(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const newHearts = ["❤️","💛","💜","💚","💖"].map((emoji, i) => ({
      id: Date.now() + i,
      x: rect.left + rect.width/2 + (Math.random()-0.5)*60,
      y: rect.top + rect.height/2,
      emoji,
    }));
    setHearts(h => [...h, ...newHearts]);
  }

  function sendWish() {
    if (!wishText.trim()) return;
    const em = WISH_EMOJIS[Math.floor(Math.random() * WISH_EMOJIS.length)];
    setWishes(w => [{ id: Date.now(), text: em + " " + wishText.trim() }, ...w]);
    setWishText("");
    fire(60, window.innerWidth/2, window.innerHeight/2);
  }

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Pacifico&family=Nunito:wght@400;600;700;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0D0D1A; }
    @keyframes twinkle { 0%,100%{opacity:.1;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
    @keyframes bounce  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
    @keyframes spin    { to{transform:rotate(360deg)} }
    @keyframes gradShift { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
    @keyframes cardIn  { from{opacity:0;transform:translateY(30px) scale(.95)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes floatUp { 0%{opacity:1;transform:translateY(0) rotate(0deg)} 100%{opacity:0;transform:translateY(-200px) rotate(30deg)} }
    @keyframes wishIn  { from{opacity:0;transform:translateX(-20px)} to{opacity:1;transform:translateX(0)} }
    @keyframes pulseGlow { 0%,100%{text-shadow:0 0 20px rgba(255,217,61,.4)} 50%{text-shadow:0 0 60px rgba(255,217,61,.9)} }
  `;

  /* ── LOCK SCREEN ── */
  if (!unlocked) return (
    <>
      <style>{css}</style>
      <canvas ref={canvasRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:100, width:"100%", height:"100%" }}/>
      <Stars />
      <div style={{
        position:"fixed", inset:0, background:"#0D0D1A",
        display:"flex", flexDirection:"column", alignItems:"center",
        justifyContent:"center", gap:24, zIndex:10,
        fontFamily:"'Nunito', sans-serif",
      }}>
        <div style={{ fontSize:"5rem", animation:"bounce 1.5s ease-in-out infinite" }}>🎁</div>

        <div style={{
          fontFamily:"'Pacifico', cursive",
          fontSize:"clamp(2rem,8vw,3.5rem)",
          color:"#FFD93D",
          animation:"pulseGlow 2s ease-in-out infinite",
        }}>A Surprise Awaits...</div>

        <div style={{ color:"rgba(255,255,255,.5)", fontSize:"0.85rem", letterSpacing:"3px", textTransform:"uppercase", fontWeight:700 }}>
          Enter your best friend's name to unlock
        </div>

        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
          <label style={{ color:"rgba(255,255,255,.35)", fontSize:"0.75rem", letterSpacing:"3px", textTransform:"uppercase" }}>
            Their Name
          </label>
          <input
            autoFocus
            value={friendName}
            onChange={e => setFriendName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleUnlock()}
            placeholder="e.g. Sarah, Alex, Maya…"
            maxLength={20}
            style={{
              background:"rgba(255,255,255,.05)",
              border:"2px solid rgba(255,217,61,.35)",
              borderRadius:16, padding:"14px 24px",
              color:"white", fontFamily:"'Nunito',sans-serif",
              fontSize:"1.1rem", fontWeight:700,
              textAlign:"center", outline:"none", width:260,
            }}
          />
        </div>

        <button
          onClick={handleUnlock}
          style={{
            background:"linear-gradient(135deg,#FF6B9D,#C77DFF)",
            color:"white", border:"none", borderRadius:50,
            padding:"16px 48px", fontFamily:"'Nunito',sans-serif",
            fontSize:"1.1rem", fontWeight:900, cursor:"pointer",
            letterSpacing:1,
            boxShadow:"0 8px 32px rgba(199,125,255,.45)",
            transition:"transform .2s, box-shadow .2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-3px) scale(1.04)"; e.currentTarget.style.boxShadow="0 16px 40px rgba(199,125,255,.65)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 8px 32px rgba(199,125,255,.45)"; }}
        >
          🎉 Reveal Surprise
        </button>
      </div>
    </>
  );

  /* ── MAIN PAGE ── */
  return (
    <>
      <style>{css}</style>
      <canvas ref={canvasRef} style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:100, width:"100%", height:"100%" }}/>
      <Stars />

      {hearts.map(h => (
        <FloatingHeart key={h.id} x={h.x} y={h.y} emoji={h.emoji}
          onDone={() => setHearts(hs => hs.filter(x => x.id !== h.id))}/>
      ))}

      <div style={{ position:"relative", zIndex:1, minHeight:"100vh", paddingBottom:80, fontFamily:"'Nunito',sans-serif", background:"transparent" }}>

        {/* Hero */}
        <section style={{ textAlign:"center", padding:"80px 20px 60px" }}>
          <div style={{ fontSize:"4rem", display:"inline-block", animation:"spin 6s linear infinite" }}>🎊</div>
          <div style={{
            fontFamily:"'Pacifico',cursive",
            fontSize:"clamp(2.5rem,10vw,6rem)",
            background:"linear-gradient(135deg,#FFD93D,#FF6B9D,#C77DFF,#4ECDC4)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
            backgroundClip:"text", backgroundSize:"200%",
            animation:"gradShift 4s ease infinite", lineHeight:1.1, margin:"16px 0 8px",
          }}>Hey there,</div>
          <div style={{
            fontFamily:"'Pacifico',cursive",
            fontSize:"clamp(1.8rem,7vw,4rem)",
            color:"#FFD93D", display:"block", marginBottom:16,
            textShadow:"0 0 40px rgba(255,217,61,.6)",
          }}>{displayName}!</div>
          <div style={{ color:"rgba(255,255,255,.6)", fontSize:"1.05rem", fontWeight:600, letterSpacing:"2px", textTransform:"uppercase" }}>
            ✨ You are incredibly loved ✨
          </div>
          <button
            onClick={() => fire(200)}
            style={{
              marginTop:32, background:"linear-gradient(135deg,#FFD93D,#FF8C42)",
              color:"#0D0D1A", border:"none", borderRadius:50,
              padding:"18px 56px", fontFamily:"'Nunito',sans-serif",
              fontSize:"1.2rem", fontWeight:900, cursor:"pointer",
              boxShadow:"0 8px 32px rgba(255,217,61,.4)", transition:"transform .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.transform="translateY(-4px) scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform=""}
          >🎆 Burst the Confetti!</button>
        </section>

        <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 20px 60px" }}>

          {/* Reasons */}
          <SectionTitle emoji="💛" title="Why You're Amazing" />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))", gap:20, marginBottom:60 }}>
            {REASONS.map((r, i) => (
              <div key={i} onClick={spawnHearts} style={{
                background:"#1A1A2E", borderRadius:24, padding:"28px 24px",
                border:"1px solid rgba(255,255,255,.06)", cursor:"pointer",
                transition:"transform .3s, box-shadow .3s", position:"relative", overflow:"hidden",
                animation:`cardIn .6s ${i*0.1}s both`,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-8px) rotate(-1deg)"; e.currentTarget.style.boxShadow="0 20px 50px rgba(0,0,0,.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
                <span style={{ position:"absolute", top:18, right:18, fontSize:"0.7rem", fontWeight:900, letterSpacing:2, color:"rgba(255,255,255,.15)" }}>
                  #{String(i+1).padStart(2,"0")}
                </span>
                <div style={{ fontSize:"2.5rem", marginBottom:14 }}>{r.emoji}</div>
                <h3 style={{ color:"white", fontSize:"1.05rem", fontWeight:900, marginBottom:8 }}>{r.title}</h3>
                <p style={{ color:"rgba(255,255,255,.5)", fontSize:"0.9rem", lineHeight:1.6 }}>{r.text}</p>
              </div>
            ))}
          </div>

          <Divider />

          {/* Polaroids */}
          <SectionTitle emoji="📸" title="Our Best Moments" />
          <div style={{ display:"flex", flexWrap:"wrap", gap:28, justifyContent:"center", marginBottom:60 }}>
            {POLAROIDS.map((p, i) => {
              const rots = [-4,3,-2,5];
              return (
                <div key={i} style={{
                  background:"white", borderRadius:4, padding:"16px 16px 50px",
                  width:190, boxShadow:"0 10px 40px rgba(0,0,0,.5)",
                  transform:`rotate(${rots[i]}deg)`, transition:"transform .3s, box-shadow .3s",
                  cursor:"default", zIndex:1,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform="rotate(0deg) scale(1.08) translateY(-8px)"; e.currentTarget.style.zIndex=10; }}
                onMouseLeave={e => { e.currentTarget.style.transform=`rotate(${rots[i]}deg)`; e.currentTarget.style.zIndex=1; }}>
                  <div style={{ width:"100%", height:140, borderRadius:2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"3.5rem", background:p.grad }}>{p.emoji}</div>
                  <div style={{ textAlign:"center", fontFamily:"'Pacifico',cursive", fontSize:"0.8rem", color:"#333", paddingTop:12 }}>{p.caption}</div>
                </div>
              );
            })}
          </div>

          <Divider />

          {/* Messages */}
          <SectionTitle emoji="💌" title="From the Heart" />
          <div style={{ background:"#1A1A2E", borderRadius:32, padding:"48px 40px", border:"1px solid rgba(255,255,255,.06)", marginBottom:60 }}>
            <p style={{
              color:"rgba(255,255,255,.85)", fontSize:"clamp(1rem,2.5vw,1.2rem)",
              lineHeight:1.9, fontWeight:600, minHeight:80,
              opacity: msgVisible ? 1 : 0, transform: msgVisible ? "translateY(0)" : "translateY(10px)",
              transition:"opacity .35s, transform .35s",
            }}>{MESSAGES[msgIdx]}</p>
            <div style={{ display:"flex", alignItems:"center", gap:16, marginTop:28 }}>
              <button onClick={nextMessage} style={{
                background:"linear-gradient(135deg,#4ECDC4,#C77DFF)", color:"white",
                border:"none", borderRadius:50, padding:"12px 32px",
                fontFamily:"'Nunito',sans-serif", fontSize:"0.95rem", fontWeight:800, cursor:"pointer",
                transition:"transform .2s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform="translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform=""}>
                Next Message 💫
              </button>
              <span style={{ color:"rgba(255,255,255,.3)", fontSize:"0.85rem", fontWeight:700 }}>
                {msgIdx+1} / {MESSAGES.length}
              </span>
            </div>
          </div>

          <Divider />

          {/* Wish wall */}
          <SectionTitle emoji="🌠" title="Send a Wish" />
          <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
            <input
              value={wishText}
              onChange={e => setWishText(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendWish()}
              placeholder="Write a sweet message or birthday wish…"
              maxLength={120}
              style={{
                flex:1, minWidth:200, background:"rgba(255,255,255,.05)",
                border:"2px solid rgba(255,255,255,.1)", borderRadius:16,
                padding:"16px 22px", color:"white", fontFamily:"'Nunito',sans-serif",
                fontSize:"1rem", fontWeight:600, outline:"none",
              }}
            />
            <button onClick={sendWish} style={{
              background:"linear-gradient(135deg,#FF6B9D,#FF8C42)", color:"white",
              border:"none", borderRadius:16, padding:"16px 28px",
              fontFamily:"'Nunito',sans-serif", fontSize:"1rem", fontWeight:900, cursor:"pointer",
              transition:"transform .2s",
            }}
            onMouseEnter={e => e.currentTarget.style.transform="scale(1.05)"}
            onMouseLeave={e => e.currentTarget.style.transform=""}>
              Send 🚀
            </button>
          </div>
          <div style={{ marginTop:24, display:"flex", flexDirection:"column", gap:12 }}>
            {wishes.map(w => (
              <div key={w.id} style={{
                background:"rgba(255,255,255,.04)", borderRadius:14, padding:"14px 20px",
                color:"rgba(255,255,255,.7)", fontSize:"0.95rem", fontWeight:600,
                borderLeft:"3px solid #FF6B9D", animation:"wishIn .4s ease",
              }}>{w.text}</div>
            ))}
          </div>
        </div>

        <div style={{ textAlign:"center", padding:"40px 20px", color:"rgba(255,255,255,.2)", fontSize:"0.85rem", fontWeight:600, letterSpacing:2 }}>
          Made with <span style={{ color:"#FF6B9D" }}>♥</span> for the best friend in the world
        </div>
      </div>
    </>
  );
}

function SectionTitle({ emoji, title }) {
  return (
    <div style={{ fontFamily:"'Pacifico',cursive", fontSize:"clamp(1.6rem,5vw,2.4rem)", color:"white", marginBottom:32, display:"flex", alignItems:"center", gap:14 }}>
      <span style={{ fontSize:"2rem" }}>{emoji}</span> {title}
    </div>
  );
}

function Divider() {
  return <div style={{ height:1, background:"linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent)", margin:"0 0 60px" }}/>;
}
