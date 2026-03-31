// Starfield Animation Logic
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let animationFrameId;
let stars = [];

const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
};

const initStars = () => {
    stars = [];
    const numStars = Math.floor((canvas.width * canvas.height) / 4000);
    for (let i = 0; i < numStars; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5,
            speed: Math.random() * 0.2 + 0.1,
            alpha: Math.random(),
            fadeSpeed: Math.random() * 0.02 + 0.005
        });
    }
};

const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        
        ctx.fillStyle = `rgba(168, 85, 247, ${star.alpha * 0.6})`;
        ctx.fill();

        star.y -= star.speed;
        if (star.y < 0) star.y = canvas.height;

        star.alpha += star.fadeSpeed;
        if (star.alpha > 1 || star.alpha < 0.2) star.fadeSpeed = -star.fadeSpeed;
    });

    animationFrameId = requestAnimationFrame(animate);
};

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animate();

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
// Donation Logic
const presetButtons = document.querySelectorAll('.donate-amount');
const customAmountInput = document.getElementById('customAmount');
const donateBtn = document.getElementById('donateNowBtn');
const amountError = document.getElementById('amountError');
const successMessage = document.getElementById('successMessage');

let selectedAmount = null;
const MIN_DONATION = 200;

presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Deselect all
        presetButtons.forEach(b => b.classList.remove('selected'));
        // Select this
        btn.classList.add('selected');
        selectedAmount = parseInt(btn.dataset.amount);
        customAmountInput.value = '';
        validateAmount();
    });
});

customAmountInput.addEventListener('input', (e) => {
    // Deselect presets
    presetButtons.forEach(b => b.classList.remove('selected'));
    selectedAmount = null;
    validateAmount();
});

const validateAmount = () => {
    const amount = selectedAmount || parseFloat(customAmountInput.value);
    const isValid = amount && amount >= MIN_DONATION;
    
    donateBtn.disabled = !isValid;
    
    if (customAmountInput.value && parseFloat(customAmountInput.value) < MIN_DONATION) {
        amountError.style.display = 'block';
    } else {
        amountError.style.display = 'none';
    }
};

donateBtn.addEventListener('click', async () => {
    const amount = selectedAmount || parseFloat(customAmountInput.value);
    const phoneNumber = document.getElementById('phoneNumber').value;
    const email = document.getElementById('donorEmail').value;

    try {
        const response = await fetch('/api/payment/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'), // Include the CSRF token
            },
            body: JSON.stringify({
                number: phoneNumber,
                pricing: amount,
                email:email
            })
        });

        const data = await response.json();
        if (data.url) {
            window.location.href = data.url;
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Donation error:', error);
        alert('Failed to process donation. Please try again.');
    }
});
// Theme handling (Mirroring main app's system preference)
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const setTheme = (isDark) => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
};
setTheme(prefersDark.matches);
prefersDark.addListener(e => setTheme(e.matches));
