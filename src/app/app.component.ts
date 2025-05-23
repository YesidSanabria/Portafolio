import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink, RouterOutlet, } from '@angular/router'; // Importar Router y NavigationEnd
import { filter } from 'rxjs/operators'; // Importar filter


import { NavbarComponent } from './navbar/navbar.component';
// Ya no importamos MapaComponent ni PersonajeComponent aquí directamente
// porque estarán en HomeComponent y VistaProyectoDetalleComponent

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet, // Esencial para que las rutas se rendericen
    RouterLink,   // Para usar routerLink en la navbar si es necesario
    NavbarComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // Estas propiedades se podrían mover a HomeComponent si son específicas de la intro de la home.
  // O se pueden quedar aquí si el título animado es global y se oculta en otras rutas.
  showAnimatedTitle: boolean = true; 
  fadeOutAnimatedTitle: boolean = false;
  introState: string = 'idle'; // Para el título animado inicial
  isOverlayFadingOut: boolean = false; // Para el overlay inicial
  showIntroOverlay: boolean = true;    // Para el overlay inicial
  
  showNavbarLinks: boolean = false;
  private scrollThreshold: number = 100;
  isOnHomePage: boolean = true; // Para controlar visibilidad de elementos de la home

  constructor(private router: Router) {} // Inyectar Router

  ngOnInit() {
    // Suscribirse a eventos de navegación para saber si estamos en la home
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => { // Usar 'any' o un tipo más específico
      this.isOnHomePage = (event.urlAfterRedirects === '/' || event.urlAfterRedirects === '/#');
      if (this.isOnHomePage) {
        // Si volvemos a la home, podríamos reiniciar la animación de intro
        // o simplemente asegurar que el título esté visible si no se ha desvanecido por scroll
        // this.showAnimatedTitle = true; // Asegurar que el título es candidato a mostrarse
        // this.fadeOutAnimatedTitle = false; // Resetear el desvanecimiento por scroll
        // this.startIntroAnimationSequence(); // Podría ser mucho, considerar la UX
      } else {
        // Si no estamos en la home, nos aseguramos de que el título de intro se desvanezca
        // y los links de la navbar aparezcan (si el scroll ya lo hizo, está bien)
        this.fadeOutAnimatedTitle = true;
        this.showNavbarLinks = true;
      }
    });

    // La animación de intro solo debería correr si estamos en la home inicialmente.
    // Sin embargo, `startIntroAnimationSequence` también maneja el estado del título que se superpone.
    // Vamos a dejar que se ejecute, y el *ngIf en el HTML controlará la visibilidad.
    this.startIntroAnimationSequence();
  }

  startIntroAnimationSequence() {
    // Esta secuencia es para el título principal de la página
    if (this.introState === 'idle') { // Solo correr si está en idle para evitar múltiples ejecuciones
        this.introState = 'titleAppearing';
        setTimeout(() => {
          this.introState = 'titleMovingToFinal';
          setTimeout(() => {
            this.introState = 'titleAtFinalPosition'; 
            this.isOverlayFadingOut = true; 
            setTimeout(() => {
              this.showIntroOverlay = false;
              // Ya no controlamos fadeOutAnimatedTitle ni showNavbarLinks aquí directamente
              // se manejarán por el scroll o por estar fuera de la home.
              // Pero podemos marcar que la intro ha terminado para la lógica del scroll
              this.introState = 'introDone'; 
              // Forzar una comprobación de scroll por si la página cargó ya scrolleada
              this.onWindowScroll(); 
            }, 700); 
          }, 1500); 
        }, 1000); 
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    if (scrollPosition > this.scrollThreshold) {
      if (!this.fadeOutAnimatedTitle) {
        this.fadeOutAnimatedTitle = true; 
      }
      if (!this.showNavbarLinks) {
        this.showNavbarLinks = true; 
      }
    } else { // Si el scroll está arriba del umbral
      // Solo ocultar links de navbar si estamos en la home y la intro ya terminó
      // Y el título principal no debería reaparecer solo por scroll, se controla por la intro.
      if (this.isOnHomePage && this.introState === 'introDone') {
        if (this.showNavbarLinks) {
          this.showNavbarLinks = false; 
        }
        // No hacemos reaparecer el título principal aquí.
        // this.fadeOutAnimatedTitle = false; 
      } else if (!this.isOnHomePage) {
        // Si no estamos en la home, los links deberían estar visibles y el título de intro desvanecido
        this.showNavbarLinks = true;
        this.fadeOutAnimatedTitle = true;
      }
    }
  }
}
