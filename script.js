// Dummy slots for next 24 hours (you can dynamically generate)
const slots = [
  "2026-05-04 18:00 UTC",
  "2026-05-04 19:00 UTC",
  "2026-05-04 20:00 UTC",
  "2026-05-04 21:00 UTC",
  "2026-05-05 02:00 UTC",
  "2026-05-05 03:00 UTC"
];

const slotList = document.getElementById('slot-list');
const bookingForm = document.getElementById('booking-form');
const selectedSlotSpan = document.getElementById('selected-slot');
let selectedSlot = null;

// Render slots
slots.forEach(slot => {
  const btn = document.createElement('button');
  btn.className = 'slot-btn';
  btn.textContent = slot;
  btn.onclick = () => selectSlot(slot, btn);
  slotList.appendChild(btn);
});

function selectSlot(slot, btn) {
  // deselect all
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedSlot = slot;
  selectedSlotSpan.textContent = slot;
  bookingForm.style.display = 'block';
  // Update UPI link with dynamic amount and note (using UPI intent)
  updateUPILink(slot);
}

function updateUPILink(slot) {
  const upiID = "your-upi-id@okhdfcbank";  // <-- CHANGE THIS
  const name = "Remote Telescope";
  const amount = "500.00";
  const note = `Telescope slot ${slot}`;
  const upiURL = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
  document.getElementById('upi-link').href = upiURL;
}

// Form submission – for static site, you can just show confirmation or post to a service
document.getElementById('booking-form').addEventListener('submit', function(e) {
  e.preventDefault();
  if (!document.getElementById('paid-confirm').checked) {
    alert('Please confirm payment.');
    return;
  }
  // Here you would normally send data to a backend or a Google Form
  // For demo, just show confirmation
  bookingForm.style.display = 'none';
  document.getElementById('slots').style.display = 'none';
  document.getElementById('confirmation').style.display = 'block';
  // Optionally send email via formspree or log booking
  console.log('Booking:', {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    slot: selectedSlot
  });
});
