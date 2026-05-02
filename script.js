// Initialize all components on page load
document.addEventListener('DOMContentLoaded', () => {
    initStarfield();
    initBackToTop();
    initScrollReveal();
    handlePageSpecificLogic();
});

// 1. Starfield Canvas Animation
function initStarfield() {
    const canvas = document.getElementById('starfield-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = [];
    for (let i = 0; i < 200; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 1.5 + 0.5,
            speed: Math.random() * 0.5 + 0.1,
            opacity: Math.random()
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        stars.forEach(s => {
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
            ctx.fill();
            s.y += s.speed;
            if (s.y > canvas.height) {
                s.y = 0;
                s.x = Math.random() * canvas.width;
            }
        });
        requestAnimationFrame(animate);
    }
    animate();
}

// 2. Intersection Observer for Scroll Reveal
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.15 });
    reveals.forEach(el => observer.observe(el));
}

// 3. Back to Top Button
function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > 400);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// 4. Page-Specific Logic Router
function handlePageSpecificLogic() {
    if (document.getElementById('booking-calendar')) {
        initBookingFlow();
    }
    if (document.getElementById('gallery-container')) {
        loadGallery();
    }
    if (document.getElementById('blog-container')) {
        loadBlogPosts();
    }
}

// 5. Booking & Payment Engine
function initBookingFlow() {
    const slots = [
        { id: 1, time: '21:00', utc: '2026-05-04T21:00:00Z', available: true },
        { id: 2, time: '22:00', utc: '2026-05-04T22:00:00Z', available: true },
        { id: 3, time: '23:00', utc: '2026-05-04T23:00:00Z', available: false },
        { id: 4, time: '00:00', utc: '2026-05-05T00:00:00Z', available: true },
        // ... more can be fetched from a backend API
    ];

    const slotContainer = document.querySelector('.slot-grid');
    const paymentForm = document.getElementById('payment-form');
    const upiLink = document.getElementById('upi-pay-btn');
    const bookingForm = document.getElementById('booking-details-form');
    let selectedSlot = null;

    // Render Slots
    slots.forEach(slot => {
        const div = document.createElement('div');
        div.className = `slot-item ${!slot.available ? 'unavailable' : ''}`;
        div.dataset.id = slot.id;
        div.dataset.time = slot.utc;
        div.textContent = slot.time + ' UTC';
        div.addEventListener('click', () => selectSlot(slot, div));
        slotContainer.appendChild(div);
    });

    function selectSlot(slot, element) {
        if (!slot.available) return;
        document.querySelectorAll('.slot-item').forEach(el => el.classList.remove('selected'));
        element.classList.add('selected');
        selectedSlot = slot;
        paymentForm.style.display = 'block';

        // Dynamically update UPI intent link
        const upiID = 'your-upi-id@okhdfcbank';  // CHANGE THIS
        const amount = '500.00';
        const note = `RemoteScope Slot ${slot.time} UTC`;
        const upiURL = `upi://pay?pa=${upiID}&pn=RemoteScope&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
        upiLink.href = upiURL;
    }

    // Handle final booking submission
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!selectedSlot || !document.getElementById('paid-check').checked) {
            alert('Please select a slot and confirm payment.');
            return;
        }
        // Simulate API POST
        console.log('Booking confirmed:', {
            slot: selectedSlot,
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value
        });
        alert('Booking submitted! Check your email for the ASIAIR access link.');
        // Reset UI
        paymentForm.style.display = 'none';
        bookingForm.reset();
        document.querySelectorAll('.slot-item.selected').forEach(el => el.classList.remove('selected'));
    });
}

// 6. Gallery Loader
function loadGallery() {
    const images = [
        { src: 'images/orion.jpg', title: 'Orion Nebula', equipment: 'Takahashi FSQ-106', integration: '2.5 hours' },
        { src: 'images/andromeda.jpg', title: 'Andromeda Galaxy', equipment: 'Celestron RASA 8', integration: '4 hours' },
        // ... Add more objects
    ];
    const container = document.getElementById('gallery-container');
    container.innerHTML = images.map(img => `
        <div class="gallery-card reveal">
            <img src="${img.src}" alt="${img.title}" loading="lazy" />
            <div class="gallery-info">
                <h4>${img.title}</h4>
                <p>${img.equipment} | ${img.integration}</p>
            </div>
        </div>
    `).join('');
}

// 7. Blog Post Loader
function loadBlogPosts() {
    const posts = [
        { title: "First Light: A Journey to Bortle 1", excerpt: "Setting up the remote observatory...", image: "images/blog1.jpg", id: "first-light" },
        { title: "Top 10 Beginner DSO Targets", excerpt: "Must-see objects for your first sessions...", image: "images/blog2.jpg", id: "beginner-dso" },
        // ...
    ];
    const container = document.getElementById('blog-container');
    container.innerHTML = posts.map(post => `
        <article class="blog-card reveal">
            <img src="${post.image}" alt="${post.title}">
            <div class="blog-card-content">
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <a href="posts/${post.id}.html" class="btn-secondary">Read More</a>
            </div>
        </article>
    `).join('');
}

// ... (continue for other pages like About timeline, Contact form handling)
