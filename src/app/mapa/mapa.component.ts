import { Component } from '@angular/core';

@Component({
  selector: 'app-mapa',
  standalone: true,
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.css']
})
export class MapaComponent {

  constructor() { }

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
}
