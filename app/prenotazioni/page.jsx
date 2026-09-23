import { redirect } from 'next/navigation';

// La prenotazione ora vive nella sezione #prenota della homepage.
// Questa pagina resta per non rompere i link esistenti (footer, bookmark, ecc.).
export default function ReservationRedirect() {
  redirect('/#prenota');
}
