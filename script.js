// =============================================
// 1. FALLING STARS CANVAS (shooting stars)
// =============================================
const canvas = document.getElementById('stars-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [];
for (let i = 0; i < 200; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.8 + 0.2,
        opacity: Math.random(),
    });
}
let shootingStars = [];

function drawStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.opacity})`;
        ctx.fill();
        s.y += s.speed;
        if (s.y > canvas.height + 5) {
            s.y = -5;
            s.x = Math.random() * canvas.width;
        }
    });
    if (Math.random() < 0.02) {
        shootingStars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height / 2),
            len: Math.random() * 80 + 20,
            speed: Math.random() * 10 + 5,
            opacity: 1
        });
    }
    shootingStars.forEach((ss, index) => {
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.len, ss.y + ss.len / 2);
        ctx.strokeStyle = `rgba(255,255,255,${ss.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ss.x -= ss.speed;
        ss.y += ss.speed / 2;
        ss.opacity -= 0.02;
        if (ss.opacity <= 0 || ss.x < 0 || ss.y > canvas.height) {
            shootingStars.splice(index, 1);
        }
    });
    requestAnimationFrame(drawStars);
}
drawStars();
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    stars = stars.map(s => ({ ...s, x: Math.random() * canvas.width, y: Math.random() * canvas.height }));
});

// =============================================
// 2. DYNAMIC GALLERY LOADER (from gallery-data.json)
// =============================================
async function loadGalleryData() {
    try {
        const response = await fetch('gallery-data.json');
        if (!response.ok) throw new Error('Failed to load gallery data');
        const images = await response.json();

        const galleryContainer = document.getElementById('gallery-container');
        if (galleryContainer) {
            galleryContainer.innerHTML = images.map(img => `
                <div class="gallery-card">
                    <img src="${img.src}" alt="${img.title}" onclick="openLightbox('${img.src}', '${img.title} (${img.photographer || ''})')">
                    <p style="text-align:center; margin-top:0.5rem;">${img.title}</p>
                </div>
            `).join('');
        }

        const homeGrid = document.getElementById('home-gallery-grid');
        if (homeGrid) {
            const gridImages = images.slice(0, 24);
            homeGrid.innerHTML = gridImages.map(img => `
                <img src="${img.src}" alt="${img.title}" loading="lazy">
            `).join('');
        }

        const homeFeed = document.getElementById('home-feed');
        if (homeFeed) {
            const feedImages = images.slice(0, 4);
            homeFeed.innerHTML = feedImages.map(img => `
                <div class="gallery-card">
                    <img src="${img.src}" alt="${img.title}" onclick="window.location.href='gallery.html'">
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Could not load gallery data:', error);
        const containers = document.querySelectorAll('#gallery-container, #home-gallery-grid');
        containers.forEach(c => c.innerHTML = '<p>Gallery images could not be loaded.</p>');
    }
}

function openLightbox(src, caption) {
    const lb = document.getElementById('lightbox');
    if (!lb) return;
    document.getElementById('lightbox-img').src = src;
    document.getElementById('lightbox-caption').textContent = caption;
    lb.classList.add('active');
}
document.querySelector('.close-lightbox')?.addEventListener('click', () => {
    document.getElementById('lightbox')?.classList.remove('active');
});

document.addEventListener('DOMContentLoaded', loadGalleryData);

// =============================================
// 3. BLOG (dynamic posts)
// =============================================
const blogContainer = document.getElementById('blog-container');
if (blogContainer) {
    const posts = [
        { title: 'First Light from Spiti', excerpt: 'Our first test image from the remote observatory...', image: 'https://placehold.co/600x300/0b0f19/6C63FF?text=First+Light' },
        { title: 'Beginner DSO Targets', excerpt: 'Where to point the telescope for stunning results.', image: 'https://placehold.co/600x300/0b0f19/e942f5?text=DSO+Targets' }
    ];
    blogContainer.innerHTML = posts.map(post => `
        <article class="blog-card">
            <img src="${post.image}" alt="${post.title}">
            <div class="blog-card-content">
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
            </div>
        </article>
    `).join('');
}

// =============================================
// 4. BOOKING ENGINE (dynamic pricing, UPI)
// =============================================
function updatePrice() {
    const equipSelect = document.getElementById('equipment-select');
    const cameraSelect = document.getElementById('camera-select');
    const basePrice = parseInt(equipSelect.selectedOptions[0].dataset.price);
    const cameraExtra = parseInt(cameraSelect.selectedOptions[0].dataset.price);
    const filters = Array.from(document.querySelectorAll('.filter-checkboxes input:checked'));
    const filterCost = filters.length * 100;
    const ditherCheck = document.getElementById('dither');
    const ditherCost = ditherCheck?.checked ? 50 : 0;

    const startTime = document.getElementById('start-time').value;
    const endTime = document.getElementById('end-time').value;
    let hours = 0;
    if (startTime && endTime) {
        const start = new Date(`1970-01-01T${startTime}:00`);
        let end = new Date(`1970-01-01T${endTime}:00`);
        if (end <= start) end.setDate(end.getDate() + 1);
        hours = (end - start) / (1000 * 60 * 60);
    }
    if (hours < 1 && (startTime && endTime)) hours = 1;

    const totalPerHour = basePrice + cameraExtra + filterCost + ditherCost;
    const total = totalPerHour * hours;
    const totalSpan = document.getElementById('total-price');
    const durationSpan = document.getElementById('session-duration');
    if (totalSpan) totalSpan.textContent = total;
    if (durationSpan) durationSpan.textContent = `Duration: ${hours} hours`;

    const upiID = 'your-upi-id@okhdfcbank'; // ← change this
    const note = `RemoteScope Booking - ${hours}hr`;
    const upiLink = document.getElementById('upi-link');
    if (upiLink) upiLink.href = `upi://pay?pa=${upiID}&pn=RemoteScope&am=${total}.00&tn=${encodeURIComponent(note)}&cu=INR`;
}

const dateInput = document.getElementById('booking-date');
if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
}

const urlParams = new URLSearchParams(window.location.search);
const equipParam = urlParams.get('equip');
if (equipParam && document.getElementById('equipment-select')) {
    const select = document.getElementById('equipment-select');
    for (let option of select.options) {
        if (option.value === equipParam) {
            option.selected = true;
            break;
        }
    }
    updatePrice();
}

function submitBooking() {
    const name = document.getElementById('user-name')?.value;
    const email = document.getElementById('user-email')?.value;
    if (!name || !email) {
        alert('Please fill in all details.');
        return;
    }
    alert('Booking submitted! Check your email for access link.');
}

// =============================================
// 5. WEATHER PANEL (mock 14-day forecast)
// =============================================
const weatherGrid = document.getElementById('weather-grid');
if (weatherGrid) {
    const conditions = ['☀️ Clear', '⛅ Partly Cloudy', '☁️ Cloudy', '🌧️ Rain', '❄️ Snow'];
    const icons = { 'Clear': 'fa-sun', 'Partly Cloudy': 'fa-cloud-sun', 'Cloudy': 'fa-cloud', 'Rain': 'fa-cloud-rain', 'Snow': 'fa-snowflake' };
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    let html = '';
    for (let i = 0; i < 14; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() + i);
        const dayName = days[date.getDay()];
        const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
        const condition = conditions[Math.floor(Math.random() * conditions.length)];
        const condName = condition.split(' ')[1] ? condition.split(' ').slice(1).join(' ') : condition;
        const icon = icons[condName] || 'fa-sun';
        html += `
            <div class="weather-card">
                <i class="fas ${icon}"></i>
                <div>${dayName} ${dateStr}</div>
                <div>${Math.floor(Math.random() * 15) + 5}° / ${Math.floor(Math.random() * 10) - 5}°</div>
                <div style="font-size:0.8rem;">${condition}</div>
            </div>
        `;
    }
    weatherGrid.innerHTML = html;
}

// =============================================
// 6. CONTACT FORM (demo submit)
// =============================================
document.getElementById('contact-form')?.addEventListener('submit', e => {
    e.preventDefault();
    alert('Message sent! We will get back to you soon.');
    e.target.reset();
});

// =============================================
// 7. MOBILE MENU TOGGLE
// =============================================
const menuToggle = document.getElementById('menu-toggle');
const menuOverlay = document.getElementById('menu-overlay');

if (menuToggle && menuOverlay) {
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        menuOverlay.classList.toggle('active');
    });

    const overlayLinks = document.querySelectorAll('.overlay-link');
    overlayLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            menuOverlay.classList.remove('active');
        });
    });
}
