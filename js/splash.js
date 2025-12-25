// ===== TWO-STAGE SPLASH SCREEN =====

const CONFIG = {
    terminalDelay: 200,      // Delay between terminal lines (ms)
    loadingDuration: 3000,   // Loading bar duration (ms)
    redirectDelay: 1000,     // Delay before redirect (ms)
    targetPage: 'index.html'
};

// DOM Elements
const initialScreen = document.getElementById('initialScreen');
const bootSequence = document.getElementById('bootSequence');
const terminalLines = document.querySelectorAll('.terminal-line');
const loadingContainer = document.querySelector('.loading-container');
const progressBar = document.getElementById('progress');
const percentage = document.getElementById('percentage');
const statusMessage = document.getElementById('status');

let bootStarted = false;

// ===== STAGE 1: Wait for ENTER key =====
function initializeSplash() {
    console.log('505th Splash Screen - Press ENTER to begin');
    
    // Listen for ENTER key or click anywhere
    document.addEventListener('keydown', handleEnter);
    document.addEventListener('click', startBootSequence);
}

function handleEnter(e) {
    if (e.key === 'Enter' && !bootStarted) {
        startBootSequence();
    }
}

// ===== STAGE 2: Boot Sequence =====
function startBootSequence() {
    if (bootStarted) return;
    bootStarted = true;
    
    console.log('Boot sequence initiated...');
    
    // Hide initial screen
    initialScreen.classList.add('hidden');
    
    // Show boot sequence after fade out
    setTimeout(() => {
        bootSequence.classList.add('active');
        showTerminalLines();
    }, 500);
    
    // Remove event listeners
    document.removeEventListener('keydown', handleEnter);
    document.removeEventListener('click', startBootSequence);
}

// Show terminal lines one by one
function showTerminalLines() {
    let currentLine = 0;
    
    function showNextLine() {
        if (currentLine < terminalLines.length) {
            const line = terminalLines[currentLine];
            line.classList.add('show');
            
            // Add typing cursor to current line
            if (currentLine < terminalLines.length - 1) {
                line.classList.add('typing');
            }
            
            // Remove typing cursor from previous line
            if (currentLine > 0) {
                terminalLines[currentLine - 1].classList.remove('typing');
            }
            
            currentLine++;
            setTimeout(showNextLine, CONFIG.terminalDelay);
        } else {
            // All lines shown, remove cursor from last line
            if (terminalLines.length > 0) {
                terminalLines[terminalLines.length - 1].classList.remove('typing');
            }
            
            // Start loading bar
            setTimeout(() => {
                startLoadingBar();
            }, 500);
        }
    }
    
    showNextLine();
}

// Loading bar animation
function startLoadingBar() {
    loadingContainer.classList.add('show');
    statusMessage.classList.add('show');
    
    let currentProgress = 0;
    const targetProgress = 100;
    const updateInterval = 50;
    const incrementAmount = (targetProgress / CONFIG.loadingDuration) * updateInterval;
    
    function updateProgress() {
        if (currentProgress < targetProgress) {
            currentProgress += incrementAmount;
            
            if (currentProgress > targetProgress) {
                currentProgress = targetProgress;
            }
            
            progressBar.style.width = currentProgress + '%';
            percentage.textContent = Math.floor(currentProgress) + '%';
            
            updateStatusMessage(currentProgress);
            
            if (currentProgress < targetProgress) {
                setTimeout(updateProgress, updateInterval);
            } else {
                onLoadingComplete();
            }
        }
    }
    
    updateProgress();
}

function updateStatusMessage(progress) {
    if (progress >= 95) {
        statusMessage.textContent = 'READY';
        statusMessage.style.color = '#00FF41';
        statusMessage.style.textShadow = '0 0 10px #00FF41';
    } else if (progress >= 75) {
        statusMessage.textContent = 'FINALIZING...';
    } else if (progress >= 50) {
        statusMessage.textContent = 'LOADING ASSETS...';
    } else if (progress >= 25) {
        statusMessage.textContent = 'ESTABLISHING CONNECTION...';
    } else {
        statusMessage.textContent = 'STAND BY...';
    }
}

function onLoadingComplete() {
    console.log('Boot sequence complete');
    
    setTimeout(() => {
        redirectToHomepage();
    }, CONFIG.redirectDelay);
}

// ===== STAGE 3: Redirect to Homepage =====
function redirectToHomepage() {
    bootSequence.style.animation = 'fadeOut 1s ease-out forwards';
    
    setTimeout(() => {
        window.location.href = CONFIG.targetPage;
    }, 1000);
}

// ===== INITIALIZE =====
window.addEventListener('DOMContentLoaded', () => {
    initializeSplash();
});

// ===== ACCESSIBILITY: Reduced Motion =====
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    CONFIG.terminalDelay = 100;
    CONFIG.loadingDuration = 1500;
}