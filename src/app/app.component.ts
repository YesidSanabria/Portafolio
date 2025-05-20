import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para *ngIf y otras directivas comunes
import { NavbarComponent } from './navbar/navbar.component'; // Importa tu NavbarComponent
import { MapaComponent } from './mapa/mapa.component';       // Importa tu MapaComponent
import { PersonajeComponent } from './personaje/personaje.component'; // Importa tu PersonajeComponent
// Si estás usando RouterOutlet, asegúrate de importarlo también, aunque no se usa en la plantilla actual del Canvas.
// import { RouterOutlet } from '@angular/router'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,        // Módulo común
    NavbarComponent,     // Tu componente de barra de navegación
    MapaComponent,       // Tu componente de mapa
    PersonajeComponent   // Tu componente de personaje
    // RouterOutlet,     // Inclúyelo si lo necesitas para el enrutamiento
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // En versiones más nuevas puede ser styleUrl (singular)
})
export class AppComponent implements OnInit {
  // Variable para controlar la visibilidad del overlay de fondo
  showIntroOverlay: boolean = true;
  // Variable para controlar la visibilidad de la imagen del título
  showAnimatedTitle: boolean = true; 
  
  // Variable para gestionar el estado actual de la animación DEL TÍTULO
  // Posibles estados: 'idle', 'titleAppearing', 'titleMovingToFinal', 'titleAtFinalPosition'
  introState: string = 'idle'; // Estado inicial

  // Nueva variable para controlar el desvanecimiento del overlay
  isOverlayFadingOut: boolean = false;

  ngOnInit() {
    // Iniciar la secuencia de animación cuando el componente se inicializa
    this.startIntroAnimationSequence();
  }

  startIntroAnimationSequence() {
    // 1. Iniciar la animación de aparición del título
    // Se aplica la clase 'title-appear' a la imagen
    this.introState = 'titleAppearing';

    // Esperar a que termine la animación de aparición (1000ms = 1s, debe coincidir con la duración en CSS)
    setTimeout(() => {
      // 2. Iniciar la animación para mover el título a su posición final
      // Se aplica la clase 'title-move-to-final' a la imagen
      this.introState = 'titleMovingToFinal';

      // Esperar a que termine la animación de movimiento (1500ms = 1.5s, debe coincidir con la duración en CSS)
      setTimeout(() => {
        // 3. Establecer el estado final del título. La clase 'title-final-position' se aplicará
        // y DEBE PERMANECER aplicada para que el título se quede visible.
        this.introState = 'titleAtFinalPosition'; 
        
        // Iniciar el desvanecimiento del overlay usando la nueva variable
        this.isOverlayFadingOut = true; 

        // Esperar a que termine la transición de desvanecimiento del overlay (700ms = 0.7s, debe coincidir con la duración en CSS)
        setTimeout(() => {
          // 4. Ocultar el overlay del DOM una vez que es invisible
          this.showIntroOverlay = false;
          // La imagen del título (showAnimatedTitle = true) permanece visible.
          // El estado de la animación del título ('introState') es 'titleAtFinalPosition'.
        }, 700); // Duración de la transición de opacidad del overlay

      }, 1500); // Duración de la animación 'titleImageMoveToFinalAnimation'

    }, 1000); // Duración de la animación 'titleImageAppearAnimation'
  }
}
