// === 1. Starfield Animation (Canvas) ===
const canvas = document.getElementById('starfield-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [];
for (let i = 0; i < 250; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.5 + 0.5,
    speed: Math.random() * 0.8 + 0.2,
    opacity: Math.random(),
  });
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  stars.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
    ctx.fill();
    s.y += s.speed;
    if (s.y > canvas.height + 5) {
      s.y = -5;
      s.x = Math.random() * canvas.width;
    }
  });
  requestAnimationFrame(drawStars);
}
drawStars();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  stars = stars.map(s => ({...s, x: Math.random()*canvas.width, y: Math.random()*canvas.height }));
});

// === 2. Scroll Reveal (Intersection Observer) ===
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('active'); });
}, { threshold: 0.15 });
reveals.forEach(el => revealObserver.observe(el));

// === 3. Back to Top Button ===
const backBtn = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
  backBtn?.classList.toggle('visible', window.scrollY > 400);
});
backBtn?.addEventListener('click', () => window.scrollTo({ top:0, behavior:'smooth' }));

// === 4. Gallery Loader (shared between home and gallery page) ===
const galleryImages = [
  { src:'https://placehold.co/600x400/1a1f35/6C63FF?text=Orion+Nebula', title:'Orion Nebula (M42)', equipment:'Takahashi FSQ-106 | 2h', },
  { src:'https://placehold.co/600x400/1a1f35/e942f5?text=Andromeda+Galaxy', title:'Andromeda Galaxy (M31)', equipment:'Celestron RASA 8 | 4h', },
  { src:'https://placehold.co/600x400/1a1f35/6C63FF?text=Horsehead+Nebula', title:'Horsehead Nebula', equipment:'Takahashi FSQ-106 | 3h', },
  { src:'https://placehold.co/600x400/1a1f35/e942f5?text=Pleiades', title:'Pleiades (M45)', equipment:'ASI2600MC Pro | 1.5h', },
  { src:'https://placehold.co/600x400/1a1f35/6C63FF?text=Moon+Crater', title:'Lunar Crater Plato', equipment:'ASI290MC | 500 frames', }
];

function createGalleryCard(img) {
  return `<div class="gallery-card reveal">
    <img src="${img.src}" alt="${img.title}" onclick="openLightbox('${img.src}', '${img.title} (${img.equipment})')">
    <p style="text-align:center; margin-top:0.5rem;">${img.title}</p>
  </div>`;
}

// Fill gallery page if present
const galleryContainer = document.getElementById('gallery-container');
if (galleryContainer) {
  galleryContainer.innerHTML = galleryImages.map(createGalleryCard).join('');
}

// Home page feed (first 4 images)
const homeFeed = document.getElementById('home-feed');
if (homeFeed) {
  homeFeed.innerHTML = galleryImages.slice(0,4).map(img => `
    <div class="gallery-card"><img src="${img.src}" alt="${img.title}" onclick="window.location.href='gallery.html'"></div>
  `).join('');
}

// Lightbox
function openLightbox(src, caption) {
  const lb = document.getElementById('lightbox');
  if (!lb) return;
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox-caption').textContent = caption;
  lb.classList.add('active');
}
document.querySelector('.close-lightbox')?.addEventListener('click', ()=>{
  document.getElementById('lightbox').classList.remove('active');
});

// === 5. Booking Engine (pricing.html) ===
const slotContainer = document.getElementById('slot-container');
if (slotContainer) {
  // Generate some demo slots
  const slots = [
    { time:'21:00', utc:'2026-05-04T21:00:00Z', available:true },
    { time:'22:00', utc:'2026-05-04T22:00:00Z', available:true },
    { time:'23:00', utc:'2026-05-04T23:00:00Z', available:false },
    { time:'00:00', utc:'2026-05-05T00:00:00Z', available:true },
    { time:'01:00', utc:'2026-05-05T01:00:00Z', available:true },
    { time:'02:00', utc:'2026-05-05T02:00:00Z', available:false },
    { time:'03:00', utc:'2026-05-05T03:00:00Z', available:true },
    { time:'04:00', utc:'2026-05-05T04:00:00Z', available:true }
  ];

  let selectedSlot = null;

  slots.forEach(slot => {
    const div = document.createElement('div');
    div.className = `slot-item ${!slot.available ? 'unavailable' : ''}`;
    div.textContent = slot.time + ' UTC';
    div.addEventListener('click', () => {
      if (!slot.available) return;
      document.querySelectorAll('.slot-item').forEach(el => el.classList.remove('selected'));
      div.classList.add('selected');
      selectedSlot = slot;
      // Show payment form
      const paymentForm = document.getElementById('payment-form');
      paymentForm.style.display = 'block';
      // Update UPI link
      const upiLink = document.getElementById('upi-pay-btn');
      const upiID = 'your-upi-id@okhdfcbank'; // <-- Change this!
      const amount = '500.00';
      const note = `RemoteScope slot ${slot.time} UTC`;
      upiLink.href = `upi://pay?pa=${upiID}&pn=RemoteScope&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
    });
    slotContainer.appendChild(div);
  });

  // Booking form submission
  document.getElementById('booking-details-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!selectedSlot) return alert('Please select a slot.');
    if (!document.getElementById('paid-check').checked) return alert('Confirm payment.');
    alert('Booking submitted! We will email your session link.');
    // Reset
    document.getElementById('payment-form').style.display = 'none';
    document.querySelectorAll('.slot-item.selected').forEach(el => el.classList.remove('selected'));
    selectedSlot = null;
  });
}

// === 6. Blog posts loader ===
const blogContainer = document.getElementById('blog-container');
if (blogContainer) {
  const posts = [
    { title:'First Light from Our Bortle 1 Observatory', excerpt:'The story of our first successful test image...', image:'https://placehold.co/600x300/0b0f19/6C63FF?text=First+Light', id:'first-light' },
    { title:'Top 5 Beginner DSO Targets', excerpt:'Where to point the telescope for stunning results.', image:'https://placehold.co/600x300/0b0f19/e942f5?text=DSO+Targets', id:'beginner-dso' }
  ];
  blogContainer.innerHTML = posts.map(post => `
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

// === 7. Contact form handler (demo) ===
document.getElementById('contact-form')?.addEventListener('submit', e => {
  e.preventDefault();
  alert('Message sent! We will get back to you soon.');
});
