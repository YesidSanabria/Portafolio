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
  fadeOutAnimatedTitle: boolean = false; // Para desvanecer el título después de la intro
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
              this.introState = 'introDone'; // Marcador de que la intro principal terminó

              // Ahora que el overlay se fue, desvanecer el título principal
              // (Este título es el que está en home.component.html)
              this.fadeOutAnimatedTitle = true; 
              
              // La visibilidad de los enlaces de la navbar la sigue controlando AppComponent
              // basado en el scroll y si es la página de inicio o no.
            }, 700); // Tiempo de desvanecimiento del overlay (0.7s)
          }, 1500); // Tiempo de animación del título moviéndose a su posición final (1.5s)
        }, 1000); // Tiempo de animación de aparición del título (1s)
    }
  }

@HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    if (scrollPosition > this.scrollThreshold) {
      if (!this.fadeOutTitle) {
        this.fadeOutTitle = true;
      }
      if (!this.showNavbarLinks) {
        this.showNavbarLinks = true;
      }
    }
  }

  // Método para ser llamado por el botón de scroll del mapa
  triggerScrollEffects(): void {
    if (!this.fadeOutTitle) {
      this.fadeOutTitle = true;
    }
    if (!this.showNavbarLinks) {
      this.showNavbarLinks = true;
    }
  }



}
