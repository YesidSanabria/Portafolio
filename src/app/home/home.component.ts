import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf
import { RouterLink } from '@angular/router';   // Para [routerLink] si las tarjetas de proyecto están aquí

// Importa los componentes que usas DIRECTAMENTE en la plantilla de HomeComponent
import { MapaComponent } from '../mapa/mapa.component'; 
import { PersonajeComponent } from '../personaje/personaje.component';
// Si tienes más componentes que usas en home.component.html, impórtalos aquí también.

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink, 
    MapaComponent,
    PersonajeComponent
 
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'] // Asegúrate de tener este archivo CSS
})
export class HomeComponent implements OnInit {

  // Propiedades para controlar la animación de introducción (AHORA EN HOMECOMPONENT)
  showIntroOverlay: boolean = true;
  showAnimatedTitle: boolean = true; 
  introState: string = 'idle'; // Estados: 'idle', 'titleAppearing', 'titleMovingToFinal', 'introDone'
  isOverlayFadingOut: boolean = false; 
  fadeOutAnimatedTitle: boolean = true; // Para desvanecer el título después de la intro
  showNavbarLinks: boolean = false;
  private scrollThreshold: number = 100;
  fadeOutTitle: boolean = false;
   
  constructor() { }

  ngOnInit(): void {
    this.startIntroAnimationSequence();
  }

  startIntroAnimationSequence() {
    // Solo correr si está en idle para evitar múltiples ejecuciones
    if (this.introState === 'idle') { 
        this.introState = 'titleAppearing'; // Inicia aparición del título
        setTimeout(() => {
          this.introState = 'titleMovingToFinal'; // Mueve el título a su posición final
          setTimeout(() => {
            // El título ya está en su posición final
            this.introState = 'titleAtFinalPosition'; 
            this.isOverlayFadingOut = true; // Activa la clase .fade-out-overlay
            setTimeout(() => {
              this.showIntroOverlay = false; // Oculta el overlay del DOM
      
              this.fadeOutAnimatedTitle = false;  
            }, 700); // Tiempo de desvanecimiento del overlay (0.7s)
          }, 1500); // Tiempo de animación del título moviéndose a su posición final (1.5s)
        }, 1000); // Tiempo de animación de aparición del título (1s)
    }
  }
}
