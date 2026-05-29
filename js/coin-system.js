// ==========================================
// COIN SYSTEM (Simple & Reliable)
// ==========================================

function spawnCoinInJar() {
    const container = DOM.coinContainer || document.getElementById('coin-physics-container');
    if (!container) {
        console.error('Coin container not found!');
        return;
    }
    
    // Create coin element
    const coin = document.createElement('img');
    coin.src = 'assets/pixel-art/coins/coin_fancy.png';
    coin.className = 'coin-drop';
    
    // Random position within jar width (roughly centered, 32px coin, container is 200px)
    const randomX = 20 + Math.random() * 148; // 20 to 168
    coin.style.left = randomX + 'px';
    
    // Start above container
    coin.style.top = '0px';
    
    // Add to container
    container.appendChild(coin);
    
    // Play sound
    try {
        playCoinClink();
    } catch(e) {}
    
    console.log('Coin spawned at X:', randomX);
}

function clearCoins() {
    const container = DOM.coinContainer || document.getElementById('coin-physics-container');
    if (container) {
        container.innerHTML = '';
    }
}

function playCoinClink() {
    try {
        initAudioContext();
        const ctx = AppState.audio.audioContext;
        
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        
        oscillator.frequency.value = 1800 + Math.random() * 400;
        oscillator.type = 'sine';
        
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.15);
    } catch (e) {
        // Silent fail
    }
}
