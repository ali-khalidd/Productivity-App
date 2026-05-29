// ==========================================
// COIN SYSTEM (Simple & Reliable)
// ==========================================

console.log('coin-system.js loaded successfully');

function spawnCoinInJar() {
    console.log('spawnCoinInJar called');
    
    // Get container - use DOM if available, otherwise query directly
    let container;
    if (typeof DOM !== 'undefined' && DOM.coinContainer) {
        container = DOM.coinContainer;
        console.log('Using DOM.coinContainer');
    } else {
        container = document.getElementById('coin-physics-container');
        console.log('Using getElementById fallback');
    }
    
    if (!container) {
        console.error('Coin container not found!');
        return;
    }
    
    console.log('Container found:', container);
    
    // Create coin element
    const coin = document.createElement('img');
    coin.src = 'assets/pixel-art/coins/coin_fancy.png';
    coin.className = 'coin-drop';
    coin.style.width = '32px';
    coin.style.height = '32px';
    coin.style.display = 'block';
    
    // Random position within jar width
    const randomX = 20 + Math.random() * 120;
    coin.style.left = randomX + 'px';
    coin.style.top = '-40px';
    
    console.log('Creating coin at X:', randomX);
    
    // Add to container
    container.appendChild(coin);
    console.log('Coin added to container. Total children:', container.children.length);
    
    // Remove coin after animation completes
    setTimeout(() => {
        if (coin.parentNode) {
            coin.remove();
        }
    }, 2000);
}

function clearCoins() {
    console.log('clearCoins called');
    let container;
    if (typeof DOM !== 'undefined' && DOM.coinContainer) {
        container = DOM.coinContainer;
    } else {
        container = document.getElementById('coin-physics-container');
    }
    
    if (container) {
        container.innerHTML = '';
        console.log('Coins cleared');
    }
}

function playCoinClink() {
    try {
        if (typeof initAudioContext === 'function') {
            initAudioContext();
        }
        
        let ctx;
        if (typeof AppState !== 'undefined' && AppState.audio && AppState.audio.audioContext) {
            ctx = AppState.audio.audioContext;
        } else {
            return; // Audio not ready, skip
        }
        
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
