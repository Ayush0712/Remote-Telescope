// Slots data
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

// Render Slot Buttons
slots.forEach(slot => {
  const btn = document.createElement('button');
  btn.className = 'slot-btn';
  btn.textContent = slot;
  btn.onclick = () => selectSlot(slot, btn);
  slotList.appendChild(btn);
});

function selectSlot(slot, btn) {
  // Update UI for selected state
  document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedSlotSpan.textContent = slot;
  bookingForm.style.display = 'block';
  
  // Scroll to form if not visible
  bookingForm.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Update UPI payment link
  const upiID = "your-upi-id@okhdfcbank"; // <--- CHANGE THIS
  const name = "Remote Telescope";
  const amount = "500.00";
  const note = `Telescope slot ${slot}`;
  const upiURL = `upi://pay?pa=${upiID}&pn=${encodeURIComponent(name)}&am=${amount}&tn=${encodeURIComponent(note)}&cu=INR`;
  document.getElementById('upi-link').href = upiURL;
}

// Form Submission
document.getElementById('booking-form').addEventListener('submit', function(e) {
  e.preventDefault();
  if (!document.getElementById('paid-confirm').checked) {
    alert('Please confirm your payment.');
    return;
  }
  // Hide form and slots, show confirmation
  document.getElementById('slots').style.display = 'none';
  bookingForm.style.display = 'none';
  document.getElementById('confirmation').style.display = 'block';
  
  console.log('New Booking:', {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    slot: selectedSlotSpan.textContent
  });
});
