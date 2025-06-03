import { Component, Output, EventEmitter } from '@angular/core'; // Añadido Output y EventEmitter
import { PersonajeComponent } from '../personaje/personaje.component'; // <-- IMPORTANTE: Ajusta esta ruta a la ubicación real de tu PersonajeComponent

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [
    PersonajeComponent // Necesitas importar PersonajeComponent aquí porque lo usas en mapa.component.html
  ],
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent {

  // NUEVA propiedad para emitir el evento hacia HomeComponent
  @Output() personajeEntroEnPuertaGlobal = new EventEmitter<void>();

  // Tu constructor existente
  constructor() { }

  // Tu método existente scrollToAboutMe
  scrollToAboutMe(): void {
    // Disparar un evento personalizado para que AppComponent lo escuche
    window.dispatchEvent(new CustomEvent('requestTitleFadeOut'));

    const aboutMeSection = document.getElementById('sobre-mi');
    if (aboutMeSection) {
      aboutMeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.warn("La sección 'sobre-mi' no fue encontrada.");
    }
  }

  // NUEVO método que se llama cuando app-personaje (en tu mapa.component.html) emite su evento
  onPersonajeEntroEnPuertaLocal(): void {
    console.log("MapaComponent: Evento de 'entradaEnPuertaDetectada' recibido desde PersonajeComponent. Re-emitiendo como 'personajeEntroEnPuertaGlobal'...");
    this.personajeEntroEnPuertaGlobal.emit();
  }
}