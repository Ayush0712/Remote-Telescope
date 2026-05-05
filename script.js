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
// IMAGE FALLBACK – tries multiple extensions
// =============================================
// =============================================
// IMAGE FALLBACK – Parallel try all extensions
// =============================================
// =============================================
// IMAGE FALLBACK – Immediately shows placeholder, then loads real image
// =============================================
// =============================================
// IMAGE FALLBACK – Silent, no placeholder
// =============================================
function applyImageFallback(imgElement, basePath) {
    // Make the image totally invisible until we have a real source
    imgElement.style.visibility = 'hidden';

    const extensions = ['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG'];
    let base = basePath;
    const lastDot = basePath.lastIndexOf('.');
    if (lastDot > -1) {
        base = basePath.substring(0, lastDot);
    }

    const urls = extensions.map(ext => `${base}.${ext}`);

    let resolved = false;

    const tryLoad = (url) => {
        const testImg = new Image();
        testImg.onload = () => {
            if (!resolved) {
                resolved = true;
                imgElement.src = url;
                imgElement.style.visibility = 'visible';
            }
        };
        testImg.onerror = () => {};
        testImg.src = url;
    };

    urls.forEach(url => tryLoad(url));

    // If after 5 seconds nothing has loaded, stay invisible (no fallback)
    setTimeout(() => {
        if (!resolved) {
            imgElement.style.visibility = 'hidden';
        }
    }, 5000);
}


// =============================================
// 2. DYNAMIC GALLERY LOADER (from gallery-data.json)
// =============================================
async function loadGalleryData() {
    try {
        const response = await fetch(`gallery-data.json?v=${Date.now()}`);
        if (!response.ok) throw new Error('Failed to load gallery data');
        const images = await response.json();

        // Gallery page
        const galleryContainer = document.getElementById('gallery-container');
        if (galleryContainer) {
            galleryContainer.innerHTML = images.map(img => `
                <div class="gallery-card">
                    <img class="gallery-img" data-base="${img.src}" alt="${img.title}" onclick="openLightbox(this.src, '${img.title} (${img.photographer || ''})')">
                    <p style="text-align:center; margin-top:0.5rem;">${img.title}</p>
                </div>
            `).join('');

            document.querySelectorAll('.gallery-img').forEach(img => {
                const base = img.getAttribute('data-base');
                applyImageFallback(img, base);
            });
        }

        // Home page 3×8 grid
        const homeGrid = document.getElementById('home-gallery-grid');
        if (homeGrid) {
            const gridImages = images.slice(0, 24);
            homeGrid.innerHTML = gridImages.map(img => `
                <img class="grid-img" data-base="${img.src}" alt="${img.title}" loading="lazy">
            `).join('');

            document.querySelectorAll('.grid-img').forEach(img => {
                const base = img.getAttribute('data-base');
                applyImageFallback(img, base);
            });
        }

        // Home "Recent Captures" feed (if still present)
        const homeFeed = document.getElementById('home-feed');
        if (homeFeed) {
            const feedImages = images.slice(0, 4);
            homeFeed.innerHTML = feedImages.map(img => `
                <div class="gallery-card">
                    <img class="feed-img" data-base="${img.src}" alt="${img.title}" onclick="window.location.href='gallery.html'">
                </div>
            `).join('');

            document.querySelectorAll('.feed-img').forEach(img => {
                const base = img.getAttribute('data-base');
                applyImageFallback(img, base);
            });
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

document.addEventListener('DOMContentLoaded', loadGalleryData);document.addEventListener('DOMContentLoaded', () => {
    loadGalleryData();
    loadHeroImages();      // already present from previous step
    loadEquipmentCards();  // new
    loadHeroBackground(); 
});

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
        if (!equipSelect || !equipSelect.selectedOptions.length || !cameraSelect || !cameraSelect.selectedOptions.length) return;
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
// 5. WEATHER PANEL (Live 14-day forecast from Open-Meteo)
// =============================================
const weatherGrid = document.getElementById('weather-grid');

async function loadWeatherData() {
    if (!weatherGrid) return;

    // Coordinates for Kaza, Spiti Valley
    const latitude = 32.2461;
    const longitude = 78.0349;

    // Construct the API URL for a 14-day forecast with daily parameters
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=14`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Weather data fetch failed');
        const data = await response.json();
        displayWeather(data.daily);
    } catch (error) {
        console.error('Could not load weather data:', error);
        weatherGrid.innerHTML = '<p>Weather data temporarily unavailable.</p>';
    }
}

function displayWeather(daily) {
    // Map WMO weather codes to your preferred descriptive icons and condition names
    const weatherIcons = {
        0: { icon: 'fa-sun', condition: 'Clear Sky' },
        1: { icon: 'fa-sun', condition: 'Mainly Clear' },
        2: { icon: 'fa-cloud-sun', condition: 'Partly Cloudy' },
        3: { icon: 'fa-cloud', condition: 'Overcast' },
        // ... (add more codes for rain, snow, etc. as needed)
        45: { icon: 'fa-smog', condition: 'Fog' },
        48: { icon: 'fa-smog', condition: 'Depositing Rime Fog' },
        51: { icon: 'fa-cloud-rain', condition: 'Light Drizzle' },
        53: { icon: 'fa-cloud-rain', condition: 'Moderate Drizzle' },
        55: { icon: 'fa-cloud-rain', condition: 'Dense Drizzle' },
        61: { icon: 'fa-cloud-rain', condition: 'Slight Rain' },
        63: { icon: 'fa-cloud-rain', condition: 'Moderate Rain' },
        65: { icon: 'fa-cloud-rain', condition: 'Heavy Rain' },
        71: { icon: 'fa-snowflake', condition: 'Slight Snowfall' },
        73: { icon: 'fa-snowflake', condition: 'Moderate Snowfall' },
        75: { icon: 'fa-snowflake', condition: 'Heavy Snowfall' },
        95: { icon: 'fa-bolt', condition: 'Thunderstorm' },
    };
    const fallbackWeather = { icon: 'fa-cloud-sun', condition: 'Variable' };

    let html = '';
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < daily.time.length; i++) {
        const date = new Date(daily.time[i] + 'T00:00:00'); // Ensure correct date parsing
        const dayName = days[date.getDay()];
        const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

        const weatherCode = daily.weather_code[i];
        const weatherInfo = weatherIcons[weatherCode] || fallbackWeather;
        const tempMax = Math.round(daily.temperature_2m_max[i]);
        const tempMin = Math.round(daily.temperature_2m_min[i]);

        html += `
            <div class="weather-card">
                <i class="fas ${weatherInfo.icon}"></i>
                <div>${dayName} ${dateStr}</div>
                <div>${tempMax}° / ${tempMin}°</div>
                <div style="font-size:0.8rem;">${weatherInfo.condition}</div>
            </div>
        `;
    }
    weatherGrid.innerHTML = html;
}

// Call the function to load weather data when the page is ready
document.addEventListener('DOMContentLoaded', loadWeatherData);

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
menuOverlay.addEventListener('click', (e) => {
    if (e.target === menuOverlay) {
        menuOverlay.classList.remove('active');
        menuToggle.classList.remove('active');
    }
});
// =============================================
// 8. DYNAMIC EQUIPMENT FLIP CARDS
// =============================================
// =============================================
// 8. DYNAMIC EQUIPMENT FLIP CARDS (faint preview + click to flip)
// =============================================
async function loadEquipmentCards() {
    const container = document.getElementById('flip-container');
    if (!container) return;

    try {
        const response = await fetch(`equipment.json?v=${Date.now()}`);
        if (!response.ok) throw new Error('Could not load equipment data');
        const equipment = await response.json();

        container.innerHTML = equipment.map(eq => `
            <div class="flip-card">
                <div class="flip-inner">
                    <div class="flip-front">
                        <!-- Faint preview image -->
                        <img class="front-preview-img" data-base="images/${eq.imageBase}" alt="">
                        <h3>${eq.name}</h3>
                        <p>${eq.price}</p>
                    </div>
                    <div class="flip-back">
                        <!-- Full brightness image -->
                        <img class="back-full-img" data-base="images/${eq.imageBase}" alt="${eq.name}">
                        <a href="booking.html?equip=${eq.equipParam}" class="book-now-btn">Book Now</a>
                    </div>
                </div>
            </div>
        `).join('');

        // Apply image fallback to both front-preview and back-full images
        document.querySelectorAll('.front-preview-img, .back-full-img').forEach(img => {
            const base = img.getAttribute('data-base');
            applyImageFallback(img, base);
        });

        // Add click listeners to all cards to toggle flip
        document.querySelectorAll('.flip-card').forEach(card => {
            card.addEventListener('click', function(e) {
                // Prevent the click from accidentally following a link that may be inside
                // Only toggle if the click didn't happen on the Book Now button itself
                if (!e.target.closest('a')) {
                    this.classList.toggle('flipped');
                }
            });
        });

    } catch (error) {
        console.error('Equipment cards failed:', error);
        container.innerHTML = '<p>Equipment data could not be loaded.</p>';
    }
}
// =============================================
// 9. HERO BACKGROUND LOADER (Andromeda image)
// =============================================
async function loadHeroBackground() {
    const bgDiv = document.getElementById('hero-background');
    if (!bgDiv) return;

    try {
        const response = await fetch(`hero-background.json?v=${Date.now()}`);
        if (!response.ok) throw new Error('Could not load hero background config');
        const data = await response.json();
        const basePath = `images/${data.imageBase}`;

        // Temporary <img> to find the correct file extension using applyImageFallback
        const testImg = new Image();
        testImg.onload = () => {
            bgDiv.style.backgroundImage = `url('${testImg.src}')`;
        };
        testImg.onerror = () => {
            // Fallback to a placeholder if all extensions fail
            bgDiv.style.backgroundImage = `url('https://placehold.co/1600x900/0b0f19/6C63FF?text=Andromeda')`;
        };
        applyImageFallback(testImg, basePath);
    } catch (error) {
        console.warn('Hero background could not be loaded:', error);
    }
}
// =============================================
// 8. DYNAMIC HERO IMAGES (from hero-images.json)
// =============================================
async function loadHeroImages() {
    const heroImgElements = document.querySelectorAll('.hero-images img');
    if (!heroImgElements.length) return;

    // Default fallback (shown if no image file works)
    const fallback = 'https://placehold.co/150x150/0b0f19/6C63FF?text=No+Image';

    try {
        const response = await fetch('hero-images.json');
        if (!response.ok) throw new Error('Could not load hero images config');
        const baseNames = await response.json();

        // Only the first 4 images needed
        const names = baseNames.slice(0, 4);
        let index = 0;

        // For each <img> element, try to load named file with different extensions
        heroImgElements.forEach((img, i) => {
            const name = names[i];
            if (!name) {
                img.src = fallback;
                return;
            }

            const extensions = ['jpg', 'jpeg', 'png', 'JPG', 'JPEG', 'PNG'];
            let extIndex = 0;

            function tryNextExtension() {
                if (extIndex >= extensions.length) {
                    // All extensions failed, use fallback
                    img.src = fallback;
                    return;
                }
                const ext = extensions[extIndex];
                const url = `images/${name}.${ext}`;
                const testImg = new Image();
                testImg.onload = () => {
                    img.src = url;   // Success, set as src
                };
                testImg.onerror = () => {
                    extIndex++;
                    tryNextExtension();
                };
                testImg.src = url;
            }

            tryNextExtension();
        });

    } catch (error) {
        console.warn('Hero images could not be loaded, using fallback:', error);
        heroImgElements.forEach(img => img.src = fallback);
    }
}

// Call it on page load
document.addEventListener('DOMContentLoaded', loadHeroImages);
