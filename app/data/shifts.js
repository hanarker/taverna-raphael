/**
 * Turni di prenotazione — deve restare allineato a backend/src/utils/shifts.js
 * (SHIFTS: lunch, dinner1, dinner2). Unico punto di verità per etichette e orari
 * lato frontend, condiviso tra ReservationForm e ReservationTicket.
 */
export const SHIFT_INFO = {
  lunch: { label: 'Pranzo', time: '13:00 – 15:00' },
  dinner1: { label: 'Cena', time: '19:30 – 21:30' },
  dinner2: { label: 'Cena', time: '21:30 – 23:30' },
};
