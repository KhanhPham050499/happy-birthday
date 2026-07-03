/* ==========================================================================
   PARTICLE CANVAS SYSTEM
   ========================================================================== */
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

// Handle window resizing
window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
});

const particles = [];
const maxParticles = 65;

// Color presets matching our color palette
const colors = {
    primary: 'rgba(157, 78, 221, 0.4)', // #9D4EDD
    secondary: 'rgba(199, 125, 255, 0.35)', // #C77DFF
    pink: 'rgba(248, 200, 220, 0.45)', // #F8C8DC
    lavender: 'rgba(235, 216, 255, 0.35)', // #EBD8FF
    sparkle: 'rgba(255, 255, 255, 0.8)',
    star: 'rgba(255, 255, 255, 0.7)'
};

// Particle base class
class Particle {
    constructor(type) {
        this.type = type; // 'sparkle' | 'heart' | 'petal' | 'blur' | 'star' | 'light'
        this.reset();
    }

    reset(startY = null) {
        this.x = Math.random() * width;
        this.y = startY !== null ? startY : Math.random() * height;
        this.size = 0;
        this.alpha = Math.random() * 0.5 + 0.1;
        this.speedX = 0;
        this.speedY = 0;
        this.angle = Math.random() * Math.PI * 2;
        this.spin = Math.random() * 0.02 - 0.01;
        this.color = '';

        if (this.type === 'sparkle') {
            this.size = Math.random() * 2.5 + 1;
            this.speedX = Math.random() * 1.5 - 0.75;
            this.speedY = Math.random() * 1.5 - 0.75;
            this.color = colors.sparkle;
            this.decay = Math.random() * 0.01 + 0.005;
        } else if (this.type === 'heart') {
            this.size = Math.random() * 10 + 6;
            this.speedY = -(Math.random() * 0.8 + 0.4);
            this.speedX = Math.random() * 0.4 - 0.2;
            this.color = Math.random() > 0.5 ? colors.pink : colors.secondary;
            this.swaySpeed = Math.random() * 0.02 + 0.01;
            this.swayOffset = Math.random() * 100;
        } else if (this.type === 'petal') {
            this.size = Math.random() * 8 + 6;
            this.speedY = Math.random() * 0.6 + 0.4;
            this.speedX = Math.random() * 0.6 + 0.2; // drift diagonally
            this.color = colors.pink;
            this.spinSpeed = Math.random() * 0.03 + 0.01;
        } else if (this.type === 'blur') {
            this.size = Math.random() * 120 + 80;
            this.speedY = (Math.random() * 0.2 - 0.1);
            this.speedX = (Math.random() * 0.2 - 0.1);
            this.color = Math.random() > 0.5 ? colors.lavender : colors.pink;
            this.alpha = Math.random() * 0.05 + 0.02; // very translucent
        } else if (this.type === 'star') {
            this.size = Math.random() * 2 + 1;
            this.color = colors.star;
            this.twinkleSpeed = Math.random() * 0.03 + 0.01;
            this.twinklePhase = Math.random() * Math.PI;
        } else if (this.type === 'light') {
            this.size = Math.random() * 4 + 2;
            this.speedY = -(Math.random() * 0.5 + 0.2);
            this.speedX = Math.random() * 0.3 - 0.15;
            this.color = colors.lavender;
        }
    }

    update() {
        if (this.type === 'sparkle') {
            this.x += this.speedX;
            this.y += this.speedY;
            this.alpha -= this.decay;
            if (this.alpha <= 0) this.reset();
        } else if (this.type === 'heart') {
            this.y += this.speedY;
            this.x += Math.sin(this.y * this.swaySpeed + this.swayOffset) * 0.4;
            if (this.y < -30) this.reset(height + 20);
        } else if (this.type === 'petal') {
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.y * 0.01) * 0.2;
            this.angle += this.spinSpeed;
            if (this.y > height + 20 || this.x > width + 20) this.reset(-20);
        } else if (this.type === 'blur') {
            this.x += this.speedX;
            this.y += this.speedY;
            // keep blur circles in bounds or wrap
            if (this.x < -this.size) this.x = width + this.size;
            if (this.x > width + this.size) this.x = -this.size;
            if (this.y < -this.size) this.y = height + this.size;
            if (this.y > height + this.size) this.y = -this.size;
        } else if (this.type === 'star') {
            this.twinklePhase += this.twinkleSpeed;
            this.alpha = (Math.sin(this.twinklePhase) * 0.35) + 0.45;
        } else if (this.type === 'light') {
            this.y += this.speedY;
            this.x += this.speedX;
            if (this.y < -20) this.reset(height + 20);
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;

        if (this.type === 'sparkle' || this.type === 'star' || this.type === 'light') {
            // Draw circle glow
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        } else if (this.type === 'blur') {
            // Draw large blurred circle
            ctx.beginPath();
            let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
            gradient.addColorStop(0, this.color);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
        } else if (this.type === 'heart') {
            // Draw small path-based heart
            ctx.translate(this.x, this.y);
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-this.size/2, -this.size/2, -this.size, 0, 0, this.size);
            ctx.bezierCurveTo(this.size, 0, this.size/2, -this.size/2, 0, 0);
            ctx.fillStyle = this.color;
            ctx.fill();
        } else if (this.type === 'petal') {
            // Draw rotating cherry-blossom petal
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
            // Draw small line down the center of the petal
            ctx.beginPath();
            ctx.moveTo(-this.size, 0);
            ctx.lineTo(this.size, 0);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        ctx.restore();
    }
}

// Instantiate particles
function initParticles() {
    const types = ['sparkle', 'heart', 'petal', 'blur', 'star', 'light'];
    for (let i = 0; i < maxParticles; i++) {
        // Distribute types evenly
        const type = types[i % types.length];
        particles.push(new Particle(type));
    }
}

// Particle rendering animation loop
function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
    }
    requestAnimationFrame(animateParticles);
}

// Sparkles generated on mouse move
window.addEventListener('mousemove', (e) => {
    // Generate limited mouse trail sparkles
    if (Math.random() < 0.22) {
        const sparkle = new Particle('sparkle');
        sparkle.x = e.clientX;
        sparkle.y = e.clientY;
        sparkle.speedX = Math.random() * 2 - 1;
        sparkle.speedY = Math.random() * 2 - 1;
        sparkle.alpha = 0.8;
        sparkle.decay = Math.random() * 0.02 + 0.01;
        // Insert and remove old sparkles if array grows too large
        particles.push(sparkle);
        if (particles.length > maxParticles + 40) {
            particles.shift();
        }
    }
});

// Sparkles generated on touch move for mobile support
window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0 && Math.random() < 0.22) {
        const touch = e.touches[0];
        const sparkle = new Particle('sparkle');
        sparkle.x = touch.clientX;
        sparkle.y = touch.clientY;
        sparkle.speedX = Math.random() * 2 - 1;
        sparkle.speedY = Math.random() * 2 - 1;
        sparkle.alpha = 0.8;
        sparkle.decay = Math.random() * 0.02 + 0.01;
        particles.push(sparkle);
        if (particles.length > maxParticles + 40) {
            particles.shift();
        }
    }
});

initParticles();
animateParticles();

/* ==========================================================================
   APP STAGE CONTROLLER
   ========================================================================== */
const envelopeSection = document.getElementById('envelope-section');
const giftSection = document.getElementById('gift-section');
const cardSection = document.getElementById('card-section');

// Transition Helper: smooth crossfades between sections
function transitionSection(fromSection, toSection, delay = 0) {
    setTimeout(() => {
        fromSection.classList.remove('active');
        
        setTimeout(() => {
            fromSection.classList.add('hidden');
            toSection.classList.remove('hidden');
            
            // Force redraw/reflow
            toSection.offsetHeight;
            
            toSection.classList.add('active');
        }, 800); // matches style.css transition time
    }, delay);
}

/* ==========================================================================
   PHASE 1: ENVELOPE OPENING
   ========================================================================== */
const envelope = document.getElementById('main-envelope');

envelope.addEventListener('click', () => {
    if (envelope.classList.contains('open')) return;
    
    // Play music on click (user interaction triggers audio play)
    tryPlayMusic();
    
    // Animate open
    envelope.classList.add('open');
    
    // Transition to Phase 2: Gift Box
    transitionSection(envelopeSection, giftSection, 2600);
});

/* ==========================================================================
   PHASE 2: GIFT BOX
   ========================================================================== */
const giftBox = document.getElementById('main-gift-box');
let wiggleInterval;

// Start wiggle interval
function startWiggleInterval() {
    wiggleInterval = setInterval(() => {
        if (!giftBox.classList.contains('popped')) {
            giftBox.classList.add('wobble');
            setTimeout(() => {
                giftBox.classList.remove('wobble');
            }, 600); // matches style.css wiggle duration
        }
    }, 4500);
}

// Monitor section changes to start wiggle when gift section becomes active
const giftObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
            if (giftSection.classList.contains('active')) {
                startWiggleInterval();
                giftObserver.disconnect(); // stop observing
            }
        }
    });
});
giftObserver.observe(giftSection, { attributes: true });

giftBox.addEventListener('click', () => {
    if (giftBox.classList.contains('popped')) return;
    
    clearInterval(wiggleInterval);
    giftBox.classList.remove('wobble');
    giftBox.classList.add('popped');
    
    // Confetti explosion using CDN canvas-confetti
    triggerConfettiExplosion();
    
    // Spawn DOM balloons & floating hearts
    spawnBalloonsAndHearts();
    
    // Transition to Phase 3: Birthday Card
    transitionSection(giftSection, cardSection, 2500);
});

// Canvas-confetti helper
function triggerConfettiExplosion() {
    const end = Date.now() + (1.2 * 1000);
    const colors = ['#9D4EDD', '#C77DFF', '#F8C8DC', '#EBD8FF', '#FFFFFF'];

    (function frame() {
        confetti({
            particleCount: 4,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.8 },
            colors: colors
        });
        confetti({
            particleCount: 4,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.8 },
            colors: colors
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// Spawn balloons and hearts floating upwards
function spawnBalloonsAndHearts() {
    const balloonColors = ['#9D4EDD', '#C77DFF', '#F8C8DC', '#EBD8FF'];
    
    for (let i = 0; i < 22; i++) {
        setTimeout(() => {
            const isBalloon = Math.random() > 0.4;
            const element = document.createElement('div');
            element.classList.add('floating-element');
            
            // Random horizontal positions and custom animations
            const startX = Math.random() * 90 + 5; // 5% to 95% width
            const scale = Math.random() * 0.4 + 0.8;
            const delay = Math.random() * 1.5;
            const drift = (Math.random() * 160 - 80) + 'px';
            const rot = (Math.random() * 60 - 30) + 'deg';
            
            element.style.left = startX + 'vw';
            element.style.transform = `scale(${scale})`;
            element.style.setProperty('--drift', drift);
            element.style.setProperty('--rot', rot);
            element.style.animationDelay = delay + 's';
            
            if (isBalloon) {
                const color = balloonColors[Math.floor(Math.random() * balloonColors.length)];
                element.innerHTML = `
                    <div class="balloon" style="background-color: ${color};">
                        <div class="balloon-string"></div>
                    </div>
                `;
            } else {
                const color = Math.random() > 0.5 ? '#F8C8DC' : '#EBD8FF';
                element.innerHTML = `
                    <div class="flying-heart" style="background-color: ${color};"></div>
                `;
                // Add heart before & after pseudo background-color hacks through JS runtime styling
                const heartEl = element.querySelector('.flying-heart');
                const styleSheet = document.createElement('style');
                styleSheet.innerText = `
                    .flying-heart[style*="background-color: ${color}"]::before,
                    .flying-heart[style*="background-color: ${color}"]::after {
                        background-color: ${color} !important;
                    }
                `;
                document.head.appendChild(styleSheet);
            }
            
            document.body.appendChild(element);
            
            // Cleanup
            setTimeout(() => {
                element.remove();
            }, 6000);
        }, i * 150);
    }
}

/* ==========================================================================
   PHASE 3: BIRTHDAY CARD & TYPEWRITER EFFECT
   ========================================================================== */
let typingStarted = false;
const cardObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
            if (cardSection.classList.contains('active') && !typingStarted) {
                typingStarted = true;
                startTypingSequence();
                cardObserver.disconnect();
            }
        }
    });
});
cardObserver.observe(cardSection, { attributes: true });

const wishes = [
    "Chúc chị có một tuổi mới thật nhiều sức khỏe, luôn giữ được nụ cười và nguồn năng lượng tích cực như bây giờ.",
    "Mong những ca trực sẽ bớt vất vả hơn, những ngày bận rộn sẽ luôn có thật nhiều niềm vui để cân bằng.",
    "Chúc chị luôn gặp những điều tử tế, được yêu thương nhiều và vẫn giữ mãi trái tim ấm áp của một người bác sĩ.",
    "Hy vọng tuổi mới sẽ mang đến cho chị thật nhiều niềm vui, những điều may mắn và thật nhiều người luôn trân trọng chị như cách chị luôn tận tâm với mọi người.",
    "Còn em thì hy vọng... sau hôm nay sẽ có thêm thật nhiều cơ hội được nói chuyện với chị hơn một chút. 😊",
    "Happy Birthday! 🎂💜"
];

const typingArea = document.getElementById('wishes-typing-area');
const endingIcons = document.getElementById('ending-icons');
const secretTrigger = document.getElementById('secret-trigger');

function startTypingSequence() {
    typingArea.innerHTML = '';
    let pIndex = 0;
    
    function typeNextParagraph() {
        if (pIndex >= wishes.length) {
            // Typing complete: display icons and show secret button
            setTimeout(() => {
                endingIcons.classList.add('visible');
                setTimeout(() => {
                    secretTrigger.classList.add('visible');
                }, 1000);
            }, 500);
            return;
        }
        
        const text = wishes[pIndex];
        const pElement = document.createElement('p');
        pElement.classList.add('cursor-blink');
        typingArea.appendChild(pElement);
        
        let charIndex = 0;
        
        function typeChar() {
            if (charIndex < text.length) {
                pElement.textContent += text.charAt(charIndex);
                charIndex++;
                setTimeout(typeChar, 42); // Character typing interval
            } else {
                pElement.classList.remove('cursor-blink');
                pIndex++;
                setTimeout(typeNextParagraph, 900); // Delay between paragraphs
            }
        }
        
        typeChar();
    }
    
    // Small starting delay
    setTimeout(typeNextParagraph, 1200);
}

/* ==========================================================================
   PHASE 4: SECRET MODAL POPUP
   ========================================================================== */
const secretModal = document.getElementById('secret-modal');
const closeModal = document.getElementById('close-modal');

secretTrigger.addEventListener('click', () => {
    secretModal.classList.add('open');
});

closeModal.addEventListener('click', () => {
    secretModal.classList.remove('open');
});

// Close modal on outside click
secretModal.addEventListener('click', (e) => {
    if (e.target === secretModal) {
        secretModal.classList.remove('open');
    }
});

/* ==========================================================================
   AUDIO PLAYER SYSTEM
   ========================================================================== */
const bgMusic = document.getElementById('bg-music');
const musicToggleBtn = document.getElementById('music-toggle-btn');
let userHasInteracted = false;

function toggleMusic() {
    if (bgMusic.paused) {
        bgMusic.play()
            .then(() => {
                musicToggleBtn.classList.add('playing');
            })
            .catch((err) => {
                console.warn("Lỗi phát nhạc:", err);
            });
    } else {
        bgMusic.pause();
        musicToggleBtn.classList.remove('playing');
    }
}

function tryPlayMusic() {
    if (!userHasInteracted && bgMusic.paused) {
        userHasInteracted = true;
        bgMusic.play()
            .then(() => {
                musicToggleBtn.classList.add('playing');
            })
            .catch((err) => {
                console.warn("Tự động phát nhạc thất bại:", err);
            });
    }
}

musicToggleBtn.addEventListener('click', toggleMusic);
