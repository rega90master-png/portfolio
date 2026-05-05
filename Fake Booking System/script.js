const STORAGE_KEY = "fake-booking-system.bookings.v1";
const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00"
];

const bookingForm = document.getElementById("bookingForm");
const clientNameInput = document.getElementById("clientName");
const bookingDateInput = document.getElementById("bookingDate");
const bookingTimeSelect = document.getElementById("bookingTime");
const selectedDateLabel = document.getElementById("selectedDateLabel");
const confirmationMessage = document.getElementById("confirmationMessage");
const availableSlotsList = document.getElementById("availableSlots");
const bookedAppointmentsList = document.getElementById("bookedAppointments");
const clearAllBtn = document.getElementById("clearAllBtn");

let bookings = loadBookings();

const todayISO = getTodayISO();
bookingDateInput.min = todayISO;
bookingDateInput.value = todayISO;

renderAll();

bookingForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = clientNameInput.value.trim();
  const date = bookingDateInput.value;
  const time = bookingTimeSelect.value;

  if (name.length < 2) {
    showMessage("error", "من فضلك اكتب اسم صحيح (حرفين على الأقل).");
    return;
  }

  if (!date) {
    showMessage("error", "من فضلك اختار تاريخ الحجز.");
    return;
  }

  if (date < todayISO) {
    showMessage("error", "لا يمكن الحجز في تاريخ قديم.");
    return;
  }

  if (!time) {
    showMessage("error", "من فضلك اختار وقت متاح.");
    return;
  }

  if (isSlotBooked(date, time)) {
    showMessage("error", "هذا الموعد تم حجزه بالفعل. اختار وقت آخر.");
    renderAll();
    return;
  }

  const booking = {
    id: generateId(),
    name,
    date,
    time,
    createdAt: new Date().toISOString()
  };

  bookings.push(booking);
  saveBookings();
  renderAll();

  clientNameInput.value = "";
  bookingDateInput.value = date;
  bookingTimeSelect.value = "";

  showMessage(
    "success",
    `تم تأكيد حجز ${name} يوم ${formatDateArabic(date)} الساعة ${time}.`
  );
});

bookingDateInput.addEventListener("change", () => {
  if (!bookingDateInput.value) {
    bookingDateInput.value = todayISO;
  }

  if (bookingDateInput.value < todayISO) {
    bookingDateInput.value = todayISO;
    showMessage("error", "التاريخ المختار غير صالح. تم إرجاعه إلى تاريخ اليوم.");
  } else {
    hideMessage();
  }

  renderAll();
});

availableSlotsList.addEventListener("click", (event) => {
  const slotButton = event.target.closest("[data-time]");
  if (!slotButton) {
    return;
  }

  const slotTime = slotButton.dataset.time;
  const isBooked = slotButton.dataset.booked === "true";

  if (isBooked) {
    showMessage("error", "هذا الوقت غير متاح حاليًا.");
    return;
  }

  bookingTimeSelect.value = slotTime;
  hideMessage();
});

bookedAppointmentsList.addEventListener("click", (event) => {
  const cancelButton = event.target.closest("[data-cancel-id]");
  if (!cancelButton) {
    return;
  }

  const bookingId = cancelButton.dataset.cancelId;
  const removed = removeBookingById(bookingId);

  if (!removed) {
    showMessage("error", "لم يتم العثور على الحجز.");
    return;
  }

  saveBookings();
  renderAll();
  showMessage("success", "تم إلغاء الحجز بنجاح.");
});

clearAllBtn.addEventListener("click", () => {
  if (bookings.length === 0) {
    showMessage("error", "لا توجد حجوزات لمسحها.");
    return;
  }

  bookings = [];
  saveBookings();
  renderAll();
  showMessage("success", "تم مسح كل الحجوزات.");
});

function renderAll() {
  const selectedDate = bookingDateInput.value || todayISO;
  renderDateLabel(selectedDate);
  renderTimeOptions(selectedDate);
  renderAvailableSlots(selectedDate);
  renderBookedAppointments();
}

function renderDateLabel(date) {
  selectedDateLabel.textContent = formatDateArabic(date);
}

function renderTimeOptions(date) {
  const bookedTimes = new Set(
    bookings.filter((booking) => booking.date === date).map((booking) => booking.time)
  );

  const previousValue = bookingTimeSelect.value;
  bookingTimeSelect.innerHTML = '<option value="">اختار الوقت المناسب</option>';

  TIME_SLOTS.forEach((time) => {
    const option = document.createElement("option");
    const slotBooked = bookedTimes.has(time);

    option.value = time;
    option.textContent = slotBooked ? `${time} (محجوز)` : time;
    option.disabled = slotBooked;

    bookingTimeSelect.append(option);
  });

  if (previousValue && !bookedTimes.has(previousValue)) {
    bookingTimeSelect.value = previousValue;
  }
}

function renderAvailableSlots(date) {
  const bookedTimes = new Set(
    bookings.filter((booking) => booking.date === date).map((booking) => booking.time)
  );

  availableSlotsList.innerHTML = "";

  TIME_SLOTS.forEach((time) => {
    const isBooked = bookedTimes.has(time);
    const li = document.createElement("li");
    li.className = "slot-item";

    li.innerHTML = `
      <span class="time">${time}</span>
      <button
        type="button"
        class="status ${isBooked ? "booked" : "available"}"
        data-time="${time}"
        data-booked="${String(isBooked)}"
      >
        ${isBooked ? "محجوز" : "متاح"}
      </button>
    `;

    availableSlotsList.append(li);
  });
}

function renderBookedAppointments() {
  bookedAppointmentsList.innerHTML = "";

  const sortedBookings = [...bookings].sort((a, b) => {
    const first = `${a.date} ${a.time}`;
    const second = `${b.date} ${b.time}`;
    return first.localeCompare(second);
  });

  clearAllBtn.disabled = sortedBookings.length === 0;

  if (sortedBookings.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = "لا توجد حجوزات حتى الآن.";
    bookedAppointmentsList.append(empty);
    return;
  }

  sortedBookings.forEach((booking) => {
    const item = document.createElement("li");
    item.className = "booking-item";
    item.innerHTML = `
      <div>
        <p class="booking-title">${escapeHTML(booking.name)}</p>
        <p class="booking-meta">${formatDateArabic(booking.date)} - ${booking.time}</p>
      </div>
      <button type="button" class="cancel-btn" data-cancel-id="${booking.id}">
        إلغاء
      </button>
    `;
    bookedAppointmentsList.append(item);
  });
}

function isSlotBooked(date, time) {
  return bookings.some((booking) => booking.date === date && booking.time === time);
}

function removeBookingById(bookingId) {
  const before = bookings.length;
  bookings = bookings.filter((booking) => booking.id !== bookingId);
  return bookings.length !== before;
}

function showMessage(type, text) {
  confirmationMessage.textContent = text;
  confirmationMessage.className = `message visible ${type}`;
}

function hideMessage() {
  confirmationMessage.textContent = "";
  confirmationMessage.className = "message";
}

function loadBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidBooking);
  } catch (_error) {
    return [];
  }
}

function saveBookings() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch (_error) {
    showMessage("error", "تعذر حفظ البيانات في المتصفح.");
  }
}

function isValidBooking(booking) {
  return Boolean(
    booking &&
      typeof booking.id === "string" &&
      typeof booking.name === "string" &&
      typeof booking.date === "string" &&
      typeof booking.time === "string"
  );
}

function getTodayISO() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split("T")[0];
}

function generateId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `bk-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatDateArabic(dateString) {
  if (!dateString) {
    return "--";
  }

  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("ar-EG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

function escapeHTML(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
