import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapaComponent } from '../mapa/mapa.component'; // Ajusta la ruta si es necesario
import { PersonajeComponent } from '../personaje/personaje.component'; // Ajusta la ruta
import { RouterLink } from '@angular/router';

// Si las secciones son componentes, impórtalas, si no, su HTML va en home.component.html
// Ejemplo: import { SobreMiSectionComponent } from '../sobre-mi-section/sobre-mi-section.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MapaComponent,
    RouterLink,
    PersonajeComponent
    // SobreMiSectionComponent, // Si fuera un componente
    // ... otros componentes de sección
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'] // Crea este archivo CSS si necesitas estilos específicos para la home
})
export class HomeComponent {
  // Si alguna lógica de animación de intro o de scroll
  // que estaba en AppComponent es *solo* para la Home, muévela aquí.
  // Por ahora, dejamos que AppComponent maneje el título animado global y los links de navbar.
  constructor() { }
}
