/**
 * Cosy Jar - Focus & Flourish
 * Main Application JavaScript
 */

// ==========================================
// APPLICATION STATE
// ==========================================

const AppState = {
    timer: {
        isRunning: false,
        isPaused: false,
        startTime: null,
        elapsedTime: 0,
        totalDuration: 0,
        selectedDuration: 1,
        intervalId: null
    },
    coins: {
        balance: 0,
        jarCoins: 0,
        totalEarned: 0,
        pendingReward: 0
    },
    rewards: {
        0.00833: 10,  // Test mode: 10 coins for visual feedback
        1: 100,
        2: 200,
        4: 500,
        6: 750
    },
    jarFrames: {
        empty: 'assets/pixel-art/jars/frames/frame_00.png',
        quarter: 'assets/pixel-art/jars/frames/frame_02.png',
        half: 'assets/pixel-art/jars/frames/frame_05.png',
        threeQuarters: 'assets/pixel-art/jars/frames/frame_06.png',
        full: 'assets/pixel-art/jars/frames/frame_09.png'
    },
    shop: {
        items: {
            backgrounds: [
                { id: 'bg_rainy', name: 'Rainy Window', price: 50, image: 'assets/pixel-art/backgrounds/rainy.png' },
                { id: 'bg_fireplace', name: 'Cozy Fireplace', price: 75, image: 'assets/pixel-art/backgrounds/fireplace.png' },
                { id: 'bg_forest', name: 'Forest Morning', price: 60, image: 'assets/pixel-art/backgrounds/forest.png' },
                { id: 'bg_sunset', name: 'Sunset Desk', price: 80, image: 'assets/pixel-art/backgrounds/sunset.png' },
                { id: 'bg_starry', name: 'Starry Night', price: 100, image: 'assets/pixel-art/backgrounds/starry.png' },
                { id: 'bg_cafe', name: 'Warm Cafe', price: 65, image: 'assets/pixel-art/backgrounds/cafe.png' }
            ],
            jars: [
                { id: 'jar_classic', name: 'Classic Glass', price: 0, image: 'assets/pixel-art/jars/jar_classic.png', isDefault: true },
                { id: 'jar_mason', name: 'Vintage Mason', price: 30, image: 'assets/pixel-art/jars/jar_mason.png' },
                { id: 'jar_ceramic', name: 'Ceramic Pot', price: 45, image: 'assets/pixel-art/jars/jar_ceramic.png' },
                { id: 'jar_crystal', name: 'Crystal Jar', price: 120, image: 'assets/pixel-art/jars/jar_crystal.png' }
            ],
            decorations: [
                { id: 'dec_fairy', name: 'Fairy Lights', price: 40, image: 'assets/pixel-art/decorations/fairy.png', type: 'draggable' },
                { id: 'dec_plant', name: 'Potted Plant', price: 35, image: 'assets/pixel-art/decorations/plant.png', type: 'draggable' },
                { id: 'dec_cat', name: 'Sleeping Cat', price: 55, image: 'assets/pixel-art/decorations/cat.png', type: 'draggable' },
                { id: 'dec_coffee', name: 'Coffee Cup', price: 25, image: 'assets/pixel-art/decorations/coffee.png', type: 'draggable' },
                { id: 'dec_books', name: 'Stack of Books', price: 30, image: 'assets/pixel-art/decorations/books.png', type: 'draggable' }
            ]
        }
    },
    inventory: {
        purchased: ['jar_classic'],
        equipped: {
            background: null,
            jar: 'jar_classic',
            decorations: []
        },
        placedDecorations: []
    },
    history: {
        sessions: [],
        streak: 0,
        lastSessionDate: null
    },
    audio: {
        currentSound: null,
        isPlaying: false,
        audioContext: null,
        gainNode: null
    }
};

// ==========================================
// DOM ELEMENTS
// ==========================================

const DOM = {
    timerDisplay: document.getElementById('timer-display'),
    timerLabel: document.getElementById('timer-label'),
    durationBtns: document.querySelectorAll('.duration-btn'),
    startBtn: document.getElementById('start-btn'),
    pauseBtn: document.getElementById('pause-btn'),
    stopBtn: document.getElementById('stop-btn'),
    progressBar: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),
    jarPixelArt: document.getElementById('jar-pixel-art'),
    coinContainer: document.getElementById('coin-physics-container'),
    jarFillText: document.getElementById('jar-fill-text'),
    jarReward: document.getElementById('jar-reward'),
    rewardAmount: document.getElementById('reward-amount'),
    claimRewardBtn: document.getElementById('claim-reward-btn'),
    coinBalance: document.getElementById('coin-balance'),
    streakCount: document.getElementById('streak-count'),
    tabWarning: document.getElementById('tab-warning'),
    shopModal: document.getElementById('shop-modal'),
    inventoryModal: document.getElementById('inventory-modal'),
    historyModal: document.getElementById('history-modal'),
    shopItems: document.getElementById('shop-items'),
    inventoryItems: document.getElementById('inventory-items'),
    activeItems: document.getElementById('active-items'),
    sessionList: document.getElementById('session-list'),
    totalSessions: document.getElementById('total-sessions'),
    totalHours: document.getElementById('total-hours'),
    totalCoinsEarned: document.getElementById('total-coins-earned'),
    bgLayer: document.getElementById('bg-layer'),
    placedDecorations: document.getElementById('placed-decorations'),
    audioToggle: document.getElementById('audio-toggle'),
    audioOptions: document.getElementById('audio-options')
};

// ==========================================
// INITIALIZATION
// ==========================================

function init() {
    loadState();
    setupEventListeners();
    setupTabDetection();
    setupDragAndDrop();
    createFloatingStars();
    renderShop('backgrounds');
    renderInventory('backgrounds');
    updateUI();
    applyEquippedItems();
    renderPlacedDecorations();
    updateHistoryUI();
}

function setupEventListeners() {
    // Duration selector
    DOM.durationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!AppState.timer.isRunning) {
                DOM.durationBtns.forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                AppState.timer.selectedDuration = parseFloat(btn.dataset.duration);
            }
        });
    });

    // Timer controls
    DOM.startBtn.addEventListener('click', startTimer);
    DOM.pauseBtn.addEventListener('click', togglePause);
    DOM.stopBtn.addEventListener('click', stopTimer);
    DOM.claimRewardBtn.addEventListener('click', claimReward);
    
    // Test coin button
    const testCoinBtn = document.getElementById('test-coin-btn');
    if (testCoinBtn) {
            testCoinBtn.addEventListener('click', () => {
                console.log('Test coin button clicked');
                addCoinToJar();
            });
    }

    // Modals
    document.getElementById('shop-toggle').addEventListener('click', () => {
        openModal(DOM.shopModal);
    });
    document.getElementById('inventory-toggle').addEventListener('click', () => openModal(DOM.inventoryModal));
    document.getElementById('history-toggle').addEventListener('click', () => {
        updateHistoryUI();
        openModal(DOM.historyModal);
    });

    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeAllModals();
        });
    });

    // Shop tabs
    document.querySelectorAll('.shop-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderShop(tab.dataset.category);
        });
    });

    // Inventory tabs
    document.querySelectorAll('.inventory-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.inventory-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            renderInventory(tab.dataset.category);
        });
    });

    // Audio controls
    DOM.audioToggle.addEventListener('click', () => {
        DOM.audioOptions.classList.toggle('hidden');
    });

    document.querySelectorAll('.audio-option').forEach(btn => {
        btn.addEventListener('click', () => {
            const sound = btn.dataset.sound;
            if (sound === 'none') {
                stopAmbientSound();
            } else {
                playAmbientSound(sound);
            }
            document.querySelectorAll('.audio-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Dev button for testing
    const devBtn = document.getElementById('dev-give-coins');
    if (devBtn) {
        devBtn.addEventListener('click', () => {
            AppState.coins.balance += 100;
            AppState.coins.totalEarned += 100;
            updateUI();
            saveState();
            alert('Added 100 coins for testing! 💰');
        });
    }

    // Select first duration by default
    DOM.durationBtns[0].classList.add('selected');
}

function setupTabDetection() {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && AppState.timer.isRunning && !AppState.timer.isPaused) {
            pauseTimer();
            showTabWarning();
        }
    });
}

// ==========================================
// FLOATING STARS (Habitica-style particles)
// ==========================================

function createFloatingStars() {
    const starImages = [
        'assets/pixel-art/particles/star_white.png',
        'assets/pixel-art/particles/star_gold.png',
        'assets/pixel-art/particles/star_pink.png',
        'assets/pixel-art/particles/star_blue.png'
    ];
    
    const container = document.getElementById('app');
    const starCount = 12;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('img');
        star.src = starImages[Math.floor(Math.random() * starImages.length)];
        star.className = 'floating-star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDuration = `${15 + Math.random() * 20}s`;
        star.style.animationDelay = `${Math.random() * 10}s`;
        star.style.width = `${12 + Math.random() * 8}px`;
        star.style.height = `${12 + Math.random() * 8}px`;
        container.appendChild(star);
    }
}

// ==========================================
// TIMER LOGIC
// ==========================================

function startTimer() {
    console.log('startTimer called, duration:', AppState.timer.selectedDuration);
    if (AppState.timer.isRunning) {
        console.log('Timer already running, aborting');
        return;
    }

    AppState.timer.isRunning = true;
    AppState.timer.isPaused = false;
    AppState.timer.startTime = Date.now();
    
    // Convert duration to milliseconds
    const durationHours = AppState.timer.selectedDuration;
    AppState.timer.totalDuration = durationHours * 60 * 60 * 1000;
    AppState.timer.elapsedTime = 0;
    AppState.timer.jarCoins = 0;

    // Get the total coins reward for this duration
    const totalCoins = AppState.rewards[durationHours] || Math.ceil(durationHours * 60);

    // Update label based on duration
    if (durationHours < 0.01) {
        DOM.timerLabel.textContent = 'Focusing for 30 seconds (test mode)...';
    } else {
        DOM.timerLabel.textContent = `Focusing for ${durationHours} hour${durationHours > 1 ? 's' : ''}...`;
    }
    
    DOM.startBtn.classList.add('hidden');
    DOM.pauseBtn.classList.remove('hidden');
    DOM.pauseBtn.textContent = 'Pause';
    DOM.stopBtn.classList.remove('hidden');
    DOM.jarReward.classList.add('hidden');

    // Reset jar to empty
    DOM.jarPixelArt.src = AppState.jarFrames.empty;
    clearCoins();

    AppState.timer.intervalId = setInterval(updateTimer, 1000);
    saveState();
}

function updateTimer() {
    if (AppState.timer.isPaused) return;

    const now = Date.now();
    AppState.timer.elapsedTime = now - AppState.timer.startTime;

    // Check if timer is complete
    if (AppState.timer.elapsedTime >= AppState.timer.totalDuration) {
        console.log('Timer complete!');
        completeTimer();
        return;
    }

    // Update display
    const remaining = AppState.timer.totalDuration - AppState.timer.elapsedTime;
    DOM.timerDisplay.textContent = formatTime(remaining);

    // Update progress
    const progress = (AppState.timer.elapsedTime / AppState.timer.totalDuration) * 100;
    DOM.progressBar.style.width = `${progress}%`;
    DOM.progressText.textContent = `${Math.floor(progress)}%`;

    // Update jar frame based on progress
    updateJarFrame(progress);
    
    // Spawn falling coins based on progress
    const durationHours = AppState.timer.selectedDuration;
    const totalCoins = AppState.rewards[durationHours] || Math.ceil(durationHours * 60);
    // Visual cap: show enough coins for visible feedback but not too many
    const displayCoins = Math.min(totalCoins, durationHours < 0.01 ? 10 : 50);
    
    // Calculate expected coins based on progress
    // Test mode uses ceil for faster distribution, long sessions use floor to avoid 0% coin
    const expectedCoins = durationHours < 0.01 
        ? Math.ceil((progress / 100) * displayCoins)
        : Math.floor((progress / 100) * displayCoins);
    
    // Debug logging for coin spawning
    if (AppState.timer.jarCoins < expectedCoins) {
        console.log(`Progress: ${progress.toFixed(1)}%, jarCoins: ${AppState.timer.jarCoins}, expected: ${expectedCoins}, spawning ${expectedCoins - AppState.timer.jarCoins} coin(s)`);
    }
    
    // Spawn coins if needed
    while (AppState.timer.jarCoins < expectedCoins) {
        AppState.timer.jarCoins++;
        addCoinToJar();
    }

    DOM.jarFillText.textContent = `${Math.floor(progress)}% Full`;
}

function updateJarFrame(progress) {
    const frames = AppState.jarFrames;
    let frameSrc = frames.empty;
    
    if (progress >= 95) {
        frameSrc = frames.full;
    } else if (progress >= 70) {
        frameSrc = frames.threeQuarters;
    } else if (progress >= 45) {
        frameSrc = frames.half;
    } else if (progress >= 20) {
        frameSrc = frames.quarter;
    }
    
    DOM.jarPixelArt.src = frameSrc;
}

function addCoinToJar() {
    // Direct implementation - spawn a falling coin
    const container = DOM.coinContainer || document.getElementById('coin-physics-container');
    if (!container) {
        console.error('Coin container not found!');
        return;
    }
    
    // Create coin element
    const coin = document.createElement('img');
    coin.src = 'assets/pixel-art/coins/coin_fancy.png';
    coin.className = 'coin-drop';
    coin.style.width = '64px';
    coin.style.height = '64px';
    coin.style.display = 'block';
    
    // Random position within jar width (container is 160px, decoration is 128px)
    const randomX = 5 + Math.random() * 27;
    coin.style.left = randomX + 'px';
    coin.style.top = '-80px';
    
    // Add to container
    container.appendChild(coin);
    
    // Remove coin after animation completes
    setTimeout(() => {
        if (coin.parentNode) {
            coin.remove();
        }
    }, 2000);
    
    // Play clink sound
    try {
        playCoinClink();
    } catch(e) {}
}

function clearCoins() {
    const container = DOM.coinContainer || document.getElementById('coin-physics-container');
    if (container) {
        container.innerHTML = '';
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
            return;
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

function togglePause() {
    if (AppState.timer.isPaused) {
        resumeTimer();
    } else {
        pauseTimer();
    }
}

function pauseTimer() {
    if (!AppState.timer.isRunning || AppState.timer.isPaused) return;
    
    AppState.timer.isPaused = true;
    // Store the elapsed time at the point of pause
    AppState.timer.elapsedTime = Date.now() - AppState.timer.startTime;
    DOM.pauseBtn.textContent = 'Resume';
    DOM.timerLabel.textContent = 'Timer paused - take your time';
    clearInterval(AppState.timer.intervalId);
}

function resumeTimer() {
    if (!AppState.timer.isRunning || !AppState.timer.isPaused) return;
    
    AppState.timer.isPaused = false;
    // Reset start time to now minus the elapsed time we had before
    AppState.timer.startTime = Date.now() - AppState.timer.elapsedTime;
    DOM.pauseBtn.textContent = 'Pause';
    DOM.timerLabel.textContent = `Focusing for ${AppState.timer.selectedDuration} hour${AppState.timer.selectedDuration > 1 ? 's' : ''}...`;
    AppState.timer.intervalId = setInterval(updateTimer, 1000);
}

function stopTimer() {
    if (!AppState.timer.isRunning) return;

    clearInterval(AppState.timer.intervalId);
    AppState.timer.isRunning = false;
    AppState.timer.isPaused = false;
    
    // Calculate actual elapsed time
    const actualElapsed = AppState.timer.isPaused 
        ? AppState.timer.elapsedTime 
        : Date.now() - AppState.timer.startTime;
    
    // Calculate reward (50% of total reward if stopped early)
    const progress = actualElapsed / AppState.timer.totalDuration;
    const totalCoins = AppState.rewards[AppState.timer.selectedDuration] || Math.ceil(AppState.timer.selectedDuration * 60);
    const earnedCoins = Math.max(1, Math.floor(totalCoins * progress * 0.5));

    // Save session
    addSessionToHistory(AppState.timer.selectedDuration, earnedCoins, false);

    // Show reward
    showReward(earnedCoins);

    // Reset timer display
    DOM.timerDisplay.textContent = '00:00:00';
    DOM.progressBar.style.width = '0%';
    DOM.progressText.textContent = '0%';
    DOM.timerLabel.textContent = 'Choose your focus time';
    
    // Reset jar to empty
    DOM.jarPixelArt.src = AppState.jarFrames.empty;
    clearCoins();

    // Reset buttons
    DOM.startBtn.classList.remove('hidden');
    DOM.pauseBtn.classList.add('hidden');
    DOM.stopBtn.classList.add('hidden');

    saveState();
}

function completeTimer() {
    clearInterval(AppState.timer.intervalId);
    AppState.timer.isRunning = false;
    AppState.timer.isPaused = false;

    const totalCoins = AppState.rewards[AppState.timer.selectedDuration] || Math.ceil(AppState.timer.selectedDuration * 60);
    const earnedCoins = Math.max(1, totalCoins);

    // Save session
    addSessionToHistory(AppState.timer.selectedDuration, earnedCoins, true);

    // Show reward
    showReward(earnedCoins);

    // Reset display
    DOM.timerDisplay.textContent = '00:00:00';
    DOM.progressBar.style.width = '0%';
    DOM.progressText.textContent = '0%';
    DOM.timerLabel.textContent = 'Session complete! Great job!';

    // Show full jar
    DOM.jarPixelArt.src = AppState.jarFrames.full;

    // Reset buttons
    DOM.startBtn.classList.remove('hidden');
    DOM.pauseBtn.classList.add('hidden');
    DOM.stopBtn.classList.add('hidden');

    // Play completion sound
    playCompletionSound();

    saveState();
}

function showReward(amount) {
    DOM.rewardAmount.textContent = amount;
    DOM.jarReward.classList.remove('hidden');
    
    // Show full jar when reward is ready
    DOM.jarPixelArt.src = AppState.jarFrames.full;
    
    // Temporarily store the reward amount
    AppState.coins.pendingReward = amount;
}

function claimReward() {
    const amount = AppState.coins.pendingReward || 0;
    AppState.coins.balance += amount;
    AppState.coins.totalEarned += amount;
    AppState.coins.pendingReward = 0;

    // Reset jar to empty
    DOM.jarPixelArt.src = AppState.jarFrames.empty;
    DOM.jarFillText.textContent = '0% Full';
    DOM.jarReward.classList.add('hidden');
    DOM.timerLabel.textContent = 'Choose your focus time';

    updateUI();
    saveState();
}

function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function showTabWarning() {
    DOM.tabWarning.classList.remove('hidden');
    
    // Hide after user comes back
    const checkVisibility = setInterval(() => {
        if (!document.hidden) {
            DOM.tabWarning.classList.add('hidden');
            clearInterval(checkVisibility);
        }
    }, 1000);
}

// ==========================================
// SHOP SYSTEM
// ==========================================

function renderShop(category) {
    const items = AppState.shop.items[category];
    DOM.shopItems.innerHTML = '';

    items.forEach(item => {
        const isPurchased = AppState.inventory.purchased.includes(item.id);
        const canAfford = AppState.coins.balance >= item.price;

        const itemEl = document.createElement('div');
        itemEl.className = `shop-item ${isPurchased ? 'purchased' : ''}`;
        itemEl.innerHTML = `
            <div class="item-preview">
                <img src="${item.image}" alt="${item.name}" class="pixel-art">
            </div>
            <span class="item-name">${item.name}</span>
            <span class="item-price">
                <img src="assets/pixel-art/coins/coin.png" class="pixel-icon-small" alt="coin"> ${item.price}
            </span>
            <button class="buy-btn" ${isPurchased || !canAfford ? 'disabled' : ''}>
                ${isPurchased ? 'Owned' : 'Buy'}
            </button>
        `;

        const buyBtn = itemEl.querySelector('.buy-btn');
        if (!isPurchased && canAfford) {
            buyBtn.addEventListener('click', () => purchaseItem(item));
        }

        DOM.shopItems.appendChild(itemEl);
    });
}

function purchaseItem(item) {
    if (AppState.coins.balance < item.price) return;
    if (AppState.inventory.purchased.includes(item.id)) return;

    AppState.coins.balance -= item.price;
    AppState.inventory.purchased.push(item.id);

    // Auto-equip purchased item
    if (item.id.startsWith('bg_')) {
        AppState.inventory.equipped.background = item.id;
    } else if (item.id.startsWith('jar_')) {
        AppState.inventory.equipped.jar = item.id;
    } else if (item.id.startsWith('dec_')) {
        if (!AppState.inventory.equipped.decorations.includes(item.id)) {
            AppState.inventory.equipped.decorations.push(item.id);
        }
    }

    applyEquippedItems();
    updateUI();
    renderShop(document.querySelector('.shop-tab.active').dataset.category);
    saveState();
}

// ==========================================
// INVENTORY SYSTEM
// ==========================================

function renderInventory(category) {
    const allItems = AppState.shop.items[category];
    const purchasedItems = allItems.filter(item => AppState.inventory.purchased.includes(item.id));

    DOM.inventoryItems.innerHTML = '';

    if (purchasedItems.length === 0) {
        DOM.inventoryItems.innerHTML = '<p style="color: var(--pixel-light-brown); text-align: center; grid-column: 1/-1;">No items purchased yet. Visit the shop!</p>';
    } else {
        purchasedItems.forEach(item => {
            const isEquipped = isItemEquipped(item);
            const isDraggable = item.type === 'draggable';

            const itemEl = document.createElement('div');
            itemEl.className = 'inventory-item';
            itemEl.innerHTML = `
                <div class="item-preview">
                    <img src="${item.image}" alt="${item.name}" class="pixel-art">
                </div>
                <span class="item-name">${item.name}</span>
                <button class="equip-btn ${isEquipped ? 'equipped' : ''}">
                    ${isEquipped ? 'Equipped' : (isDraggable ? 'Place' : 'Equip')}
                </button>
            `;

            const equipBtn = itemEl.querySelector('.equip-btn');
            equipBtn.addEventListener('click', () => toggleEquip(item));

            DOM.inventoryItems.appendChild(itemEl);
        });
    }

    updateActiveItemsDisplay();
}

function isItemEquipped(item) {
    if (item.id.startsWith('bg_')) {
        return AppState.inventory.equipped.background === item.id;
    } else if (item.id.startsWith('jar_')) {
        return AppState.inventory.equipped.jar === item.id;
    } else if (item.id.startsWith('dec_')) {
        return AppState.inventory.equipped.decorations.includes(item.id);
    }
    return false;
}

function toggleEquip(item) {
    if (item.id.startsWith('bg_')) {
        AppState.inventory.equipped.background = 
            AppState.inventory.equipped.background === item.id ? null : item.id;
    } else if (item.id.startsWith('jar_')) {
        AppState.inventory.equipped.jar = item.id;
    } else if (item.id.startsWith('dec_')) {
        if (item.type === 'draggable') {
            // For draggable items, place them on screen
            placeDecoration(item);
        } else {
            const index = AppState.inventory.equipped.decorations.indexOf(item.id);
            if (index > -1) {
                AppState.inventory.equipped.decorations.splice(index, 1);
            } else {
                AppState.inventory.equipped.decorations.push(item.id);
            }
        }
    }

    applyEquippedItems();
    renderInventory(document.querySelector('.inventory-tab.active').dataset.category);
    saveState();
}

function updateActiveItemsDisplay() {
    DOM.activeItems.innerHTML = '';
    
    const equipped = AppState.inventory.equipped;
    const items = [];

    // Get equipped items details
    if (equipped.background) {
        const bg = AppState.shop.items.backgrounds.find(b => b.id === equipped.background);
        if (bg) items.push(bg);
    }
    if (equipped.jar) {
        const jar = AppState.shop.items.jars.find(j => j.id === equipped.jar);
        if (jar) items.push(jar);
    }
    equipped.decorations.forEach(decId => {
        const dec = AppState.shop.items.decorations.find(d => d.id === decId);
        if (dec) items.push(dec);
    });

    if (items.length === 0) {
        DOM.activeItems.innerHTML = '<span style="color: var(--pixel-light-brown);">No items equipped</span>';
    } else {
        items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'active-item';
            el.innerHTML = `<img src="${item.image}" class="pixel-icon-small" alt=""> ${item.name}`;
            DOM.activeItems.appendChild(el);
        });
    }
}

function applyEquippedItems() {
    const equipped = AppState.inventory.equipped;

    // Apply background
    if (equipped.background) {
        const bg = AppState.shop.items.backgrounds.find(b => b.id === equipped.background);
        if (bg) {
            DOM.bgLayer.style.backgroundImage = `url('${bg.image}')`;
        }
    } else {
        DOM.bgLayer.style.backgroundImage = 'none';
        DOM.bgLayer.style.backgroundColor = 'var(--pixel-bg)';
    }

    // Apply jar skin
    if (equipped.jar) {
        const jar = AppState.shop.items.jars.find(j => j.id === equipped.jar);
        if (jar) {
            // Show the jar skin image when timer is not running
            if (!AppState.timer.isRunning) {
                DOM.jarPixelArt.src = jar.image;
            }
            // When timer is running, updateJarFrame() handles the frames
        }
    } else {
        // Default to empty classic jar
        if (!AppState.timer.isRunning) {
            DOM.jarPixelArt.src = AppState.jarFrames.empty;
        }
    }
}

function renderPlacedDecorations() {
    DOM.placedDecorations.innerHTML = '';
    
    AppState.inventory.placedDecorations.forEach((placed, index) => {
        const dec = AppState.shop.items.decorations.find(d => d.id === placed.id);
        if (!dec) return;

        const el = document.createElement('div');
        el.className = 'placed-item';
        el.dataset.index = index;
        el.style.left = `${placed.x}px`;
        el.style.top = `${placed.y}px`;
        el.innerHTML = `
            <img src="${dec.image}" alt="${dec.name}">
            <button class="remove-btn">&times;</button>
        `;
        
        // Add drag functionality
        setupDraggable(el, index);
        
        // Add remove functionality
        const removeBtn = el.querySelector('.remove-btn');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removePlacedDecoration(index);
        });
        
        DOM.placedDecorations.appendChild(el);
    });
}

function setupDraggable(element, index) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    element.addEventListener('mousedown', startDrag);
    element.addEventListener('touchstart', startDrag, { passive: false });

    function startDrag(e) {
        if (e.target.classList.contains('remove-btn')) return;
        
        e.preventDefault();
        isDragging = true;
        element.classList.add('dragging');

        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        startX = clientX - element.offsetLeft;
        startY = clientY - element.offsetTop;

        document.addEventListener('mousemove', drag);
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
    }

    function drag(e) {
        if (!isDragging) return;
        e.preventDefault();

        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        let newX = clientX - startX;
        let newY = clientY - startY;

        // Keep within window bounds
        newX = Math.max(0, Math.min(newX, window.innerWidth - element.offsetWidth));
        newY = Math.max(0, Math.min(newY, window.innerHeight - element.offsetHeight));

        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
    }

    function stopDrag() {
        if (!isDragging) return;
        isDragging = false;
        element.classList.remove('dragging');

        // Save position
        const rect = element.getBoundingClientRect();
        AppState.inventory.placedDecorations[index].x = rect.left;
        AppState.inventory.placedDecorations[index].y = rect.top;
        saveState();

        document.removeEventListener('mousemove', drag);
        document.removeEventListener('touchmove', drag);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchend', stopDrag);
    }
}

function placeDecoration(item) {
    // Place in a random position near the center but not overlapping too much
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offsetX = (Math.random() - 0.5) * 300;
    const offsetY = (Math.random() - 0.5) * 200;
    
    const placedItem = {
        id: item.id,
        x: centerX + offsetX - 32,
        y: centerY + offsetY - 32
    };
    
    AppState.inventory.placedDecorations.push(placedItem);
    renderPlacedDecorations();
    saveState();
}

function removePlacedDecoration(index) {
    AppState.inventory.placedDecorations.splice(index, 1);
    renderPlacedDecorations();
    saveState();
}

function setupDragAndDrop() {
    // Drag and drop is handled per-item in renderPlacedDecorations
}

function createFloatingParticles(decoration) {
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.className = 'firefly';
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 15}s`;
        particle.style.animationDuration = `${10 + Math.random() * 10}s`;
        DOM.placedDecorations.appendChild(particle);
    }
}

function createStaticDecoration(decoration) {
    const el = document.createElement('div');
    el.className = 'placed-item static';
    el.style.cssText = `
        position: absolute;
        font-size: 3rem;
        opacity: 0.7;
        pointer-events: none;
        z-index: 0;
    `;
    
    // Position decorations around the screen
    const positions = [
        { bottom: '10%', left: '5%' },
        { bottom: '15%', right: '10%' },
        { top: '20%', left: '8%' },
        { top: '25%', right: '5%' }
    ];
    
    const pos = positions[Math.floor(Math.random() * positions.length)];
    Object.assign(el.style, pos);
    el.innerHTML = `<img src="${decoration.image}" alt="${decoration.name}">`;
    
    DOM.placedDecorations.appendChild(el);
}

// ==========================================
// SESSION HISTORY
// ==========================================

function addSessionToHistory(duration, coins, completed) {
    const session = {
        date: new Date().toISOString(),
        duration: duration,
        coins: coins,
        completed: completed
    };

    AppState.history.sessions.unshift(session);
    console.log('Session added:', session);
    console.log('Total sessions:', AppState.history.sessions.length);
    
    // Update streak
    updateStreak();
    
    // Keep only last 50 sessions
    if (AppState.history.sessions.length > 50) {
        AppState.history.sessions = AppState.history.sessions.slice(0, 50);
    }
}

function updateStreak() {
    const today = new Date().toDateString();
    const lastDate = AppState.history.lastSessionDate;

    if (!lastDate) {
        AppState.history.streak = 1;
    } else {
        const last = new Date(lastDate);
        const todayDate = new Date(today);
        const diffTime = todayDate - last;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
            AppState.history.streak++;
        } else if (diffDays > 1) {
            AppState.history.streak = 1;
        }
        // If same day, streak stays the same
    }

    AppState.history.lastSessionDate = today;
    console.log('Streak updated:', AppState.history.streak);
}

function updateHistoryUI() {
    const sessions = AppState.history.sessions;
    
    // Update stats
    DOM.totalSessions.textContent = sessions.length;
    
    const totalHours = sessions.reduce((sum, s) => sum + (s.duration * (s.completed ? 1 : 0.5)), 0);
    DOM.totalHours.textContent = totalHours.toFixed(1);
    
    const totalCoins = sessions.reduce((sum, s) => sum + s.coins, 0);
    DOM.totalCoinsEarned.textContent = totalCoins;

    // Update session list
    DOM.sessionList.innerHTML = '';
    
    if (sessions.length === 0) {
        DOM.sessionList.innerHTML = '<p style="color: var(--pixel-text-light); text-align: center; font-family: Nunito, sans-serif; padding: 2rem;">No sessions yet. Start focusing!</p>';
    } else {
        sessions.slice(0, 10).forEach(session => {
            const date = new Date(session.date);
            const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            const entry = document.createElement('div');
            entry.className = 'session-entry';
            entry.innerHTML = `
                <span class="session-date">${dateStr} at ${timeStr}</span>
                <div class="session-details">
                    <span class="session-duration">${session.duration}h</span>
                    <span class="session-coins"><img src="assets/pixel-art/coins/coin_fancy.png" class="pixel-icon-small" style="width: 16px; height: 16px;"> ${session.coins}</span>
                    <span class="session-status ${session.completed ? 'status-completed' : 'status-partial'}">
                        ${session.completed ? 'Completed' : 'Partial'}
                    </span>
                </div>
            `;
            DOM.sessionList.appendChild(entry);
        });
    }

    // Update streak display
    DOM.streakCount.textContent = AppState.history.streak;
}

// ==========================================
// AUDIO SYSTEM (Web Audio API)
// ==========================================

function initAudioContext() {
    if (!AppState.audio.audioContext) {
        AppState.audio.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playAmbientSound(soundType) {
    initAudioContext();
    
    // Stop current sound
    if (AppState.audio.gainNode) {
        AppState.audio.gainNode.gain.setValueAtTime(0, AppState.audio.audioContext.currentTime);
        AppState.audio.gainNode.disconnect();
    }

    const ctx = AppState.audio.audioContext;
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.value = 0.3;
    
    AppState.audio.gainNode = gainNode;
    AppState.audio.currentSound = soundType;
    AppState.audio.isPlaying = true;

    // Generate ambient noise based on type
    switch (soundType) {
        case 'rain':
            createRainSound(ctx, gainNode);
            break;
        case 'fire':
            createFireSound(ctx, gainNode);
            break;
        case 'cafe':
            createCafeSound(ctx, gainNode);
            break;
        case 'forest':
            createForestSound(ctx, gainNode);
            break;
    }

    DOM.audioToggle.textContent = 'Sound';
}

function createRainSound(ctx, gainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Filter to make it sound like rain
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    noise.connect(filter);
    filter.connect(gainNode);
    noise.start();

    AppState.audio.currentSource = noise;
}

function createFireSound(ctx, gainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    noise.connect(filter);
    filter.connect(gainNode);
    noise.start();

    AppState.audio.currentSource = noise;
}

function createCafeSound(ctx, gainNode) {
    // Simple ambient noise for cafe
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.08;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 0.5;

    noise.connect(filter);
    filter.connect(gainNode);
    noise.start();

    AppState.audio.currentSource = noise;
}

function createForestSound(ctx, gainNode) {
    const bufferSize = ctx.sampleRate * 2;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.06;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 600;

    noise.connect(filter);
    filter.connect(gainNode);
    noise.start();

    AppState.audio.currentSource = noise;
}

function stopAmbientSound() {
    if (AppState.audio.gainNode) {
        AppState.audio.gainNode.gain.setValueAtTime(0, AppState.audio.audioContext.currentTime);
        AppState.audio.gainNode.disconnect();
    }
    if (AppState.audio.currentSource) {
        AppState.audio.currentSource.stop();
    }
    AppState.audio.isPlaying = false;
    AppState.audio.currentSound = null;
    DOM.audioToggle.textContent = 'Mute';
    DOM.audioOptions.classList.add('hidden');
}

function playCoinSound() {
    try {
        initAudioContext();
        const ctx = AppState.audio.audioContext;
        
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();
        
        oscillator.connect(gain);
        gain.connect(ctx.destination);
        
        oscillator.frequency.value = 1200;
        oscillator.type = 'sine';
        
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    } catch (e) {
        // Silent fail for audio
    }
}

function playCompletionSound() {
    try {
        initAudioContext();
        const ctx = AppState.audio.audioContext;
        
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        
        notes.forEach((freq, i) => {
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();
            
            oscillator.connect(gain);
            gain.connect(ctx.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            const time = ctx.currentTime + i * 0.15;
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.1, time + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);
            
            oscillator.start(time);
            oscillator.stop(time + 0.4);
        });
    } catch (e) {
        // Silent fail for audio
    }
}

// ==========================================
// UI UPDATES
// ==========================================

function updateUI() {
    DOM.coinBalance.textContent = AppState.coins.balance;
}

function openModal(modal) {
    closeAllModals();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.add('hidden');
    });
    document.body.style.overflow = '';
}

// ==========================================
// LOCAL STORAGE PERSISTENCE
// ==========================================

const STORAGE_KEY = 'cosyJarData';

function saveState() {
    const data = {
        coins: AppState.coins,
        inventory: AppState.inventory,
        history: AppState.history,
        audio: {
            currentSound: AppState.audio.currentSound,
            isPlaying: AppState.audio.isPlaying
        }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            
            if (data.coins) {
                AppState.coins.balance = data.coins.balance || 0;
                AppState.coins.totalEarned = data.coins.totalEarned || 0;
            }
            
            if (data.inventory) {
                AppState.inventory.purchased = data.inventory.purchased || ['jar_classic'];
                AppState.inventory.equipped = data.inventory.equipped || {
                    background: null,
                    jar: 'jar_classic',
                    decorations: []
                };
                AppState.inventory.placedDecorations = data.inventory.placedDecorations || [];
            }
            
            if (data.history) {
                AppState.history.sessions = data.history.sessions || [];
                AppState.history.streak = data.history.streak || 0;
                AppState.history.lastSessionDate = data.history.lastSessionDate || null;
            }
        }
    } catch (e) {
        console.log('No saved data found, starting fresh');
    }
}

// ==========================================
// START THE APP
// ==========================================

document.addEventListener('DOMContentLoaded', init);
