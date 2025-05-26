import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core'; // AfterViewInit es importante
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    NavbarComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit { // Implementar AfterViewInit
  showNavbarLinks: boolean = false;
  private scrollThreshold: number = 50; 
  isOnHomePage: boolean = true;

  // Propiedades para el título animado global
  showAnimatedTitle_global: boolean = true; 
  fadeOutAnimatedTitle_global: boolean = false;
  introState_global: string = 'idle'; 
  isOverlayFadingOut_global: boolean = false; 
  showIntroOverlay_global: boolean = true;    

  private introHasPlayed: boolean = false; // Bandera para controlar si la intro ya se ejecutó

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isOnHomePage = (event.urlAfterRedirects === '/' || event.urlAfterRedirects.startsWith('/#'));
      
      if (!this.isOnHomePage) {
        this.showNavbarLinks = true; 
        this.fadeOutAnimatedTitle_global = true; 
        this.showIntroOverlay_global = false; 
        this.introState_global = 'introDone'; // Marcar como hecha si navegamos fuera
      } else { // Estamos volviendo a la Home
        if (this.introHasPlayed) { // Si ya se reprodujo la intro
          this.showIntroOverlay_global = false;
          this.showAnimatedTitle_global = true; 
          this.fadeOutAnimatedTitle_global = true; // El título de intro ya debería estar desvanecido
          this.introState_global = 'introDone';
        } else {
          // Si volvemos a la home y la intro NO se ha jugado (la primera carga se maneja en ngAfterViewInit)
          // Preparamos para que la intro pueda correr si es la primera vez.
          this.introState_global = 'idle';
          this.showIntroOverlay_global = true;
          this.showAnimatedTitle_global = true;
          this.fadeOutAnimatedTitle_global = false;
          this.isOverlayFadingOut_global = false;
        }
        // La visibilidad de los links se maneja por onWindowScroll o al final de la intro
        this.onWindowScroll(); 
      }
    });
  }

  ngAfterViewInit(): void {
    // Iniciar la animación global solo si estamos en la home al cargar la app por primera vez
    // y la intro no se ha reproducido aún.
    if (this.router.url === '/' || this.router.url.startsWith('/#')) { 
      if (!this.introHasPlayed) {
        this.startGlobalIntroAnimationSequence();
      } else { 
        // Si ya se reprodujo y estamos en home (ej. recarga de página después de la primera intro)
        this.showIntroOverlay_global = false;
        this.showAnimatedTitle_global = true;
        this.fadeOutAnimatedTitle_global = true;
        this.introState_global = 'introDone';
        this.showNavbarLinks = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0) > this.scrollThreshold;
      }
    } else { // Si cargamos directamente en una subpágina
        this.showIntroOverlay_global = false;
        this.showAnimatedTitle_global = true; 
        this.fadeOutAnimatedTitle_global = true; 
        this.introState_global = 'introDone';
        this.showNavbarLinks = true;
        this.introHasPlayed = true; // Marcar como reproducida si se carga en subpágina
    }
  }

  // Secuencia para el título animado GLOBAL
  startGlobalIntroAnimationSequence() {
    // Solo correr si está en idle, estamos en la home y no se ha reproducido
    if (this.introState_global === 'idle' && this.isOnHomePage && !this.introHasPlayed) { 
        this.introState_global = 'titleAppearing';
        this.showAnimatedTitle_global = true; 
        this.showIntroOverlay_global = true;  
        this.fadeOutAnimatedTitle_global = false; 
        this.isOverlayFadingOut_global = false; 

        setTimeout(() => {
          this.introState_global = 'titleMovingToFinal';
          setTimeout(() => {
            this.introState_global = 'titleAtFinalPosition'; 
            this.isOverlayFadingOut_global = true; 
            setTimeout(() => {
              this.showIntroOverlay_global = false;
              this.introState_global = 'introDone'; 
              this.fadeOutAnimatedTitle_global = true; // Desvanece el título después de la intro
              this.showNavbarLinks = true;    // Muestra los links
              this.introHasPlayed = true;     // MARCAR QUE LA INTRO YA SE EJECUTÓ
              this.onWindowScroll(); // Re-evaluar links de navbar
            }, 700); 
          }, 1500); 
        }, 1000); 
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // No mostrar/ocultar links si la intro global no ha terminado en la home
    if (this.isOnHomePage && this.introState_global !== 'introDone') {
        return; // La visibilidad de los links se activará al final de la intro
    }

    if (scrollPosition > this.scrollThreshold) {
      if (!this.showNavbarLinks) {
        this.showNavbarLinks = true; 
      }
      // Desvanecer el título global si estamos en la home y se hace scroll y la intro ya terminó
      if (this.isOnHomePage && !this.fadeOutAnimatedTitle_global && this.introState_global === 'introDone') {
          this.fadeOutAnimatedTitle_global = true;
      }
    } else { // Si el scroll está arriba del umbral
      if (this.isOnHomePage && this.introState_global === 'introDone') { 
        if (this.showNavbarLinks) {
          this.showNavbarLinks = false; 
        }
        // No reaparecer el título global solo por scroll hacia arriba si ya se desvaneció post-intro.
      } else if (!this.isOnHomePage) {
        // Si no estamos en la home, los links siempre deberían estar visibles
        this.showNavbarLinks = true;
      }
    }
  }
}
