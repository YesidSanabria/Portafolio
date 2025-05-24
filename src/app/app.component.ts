import { Component, OnInit, HostListener } from '@angular/core';
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
export class AppComponent implements OnInit {
  showNavbarLinks: boolean = false;
  private scrollThreshold: number = 50; // Umbral para mostrar/ocultar links de navbar
  isOnHomePage: boolean = true;

  // Las propiedades de la animación de intro YA NO ESTÁN AQUÍ, se moverían a HomeComponent
  // showIntroOverlay: boolean = true;
  // showAnimatedTitle: boolean = true; // Esta SÍ se queda si el título es global
  // introState: string = 'idle';
  // isOverlayFadingOut: boolean = false;
  // fadeOutAnimatedTitle: boolean = false; // Esta SÍ se queda si el título es global

  // Propiedades para el título animado global (si se queda en AppComponent)
  showAnimatedTitle_global: boolean = true; 
  fadeOutAnimatedTitle_global: boolean = false;
  introState_global: string = 'idle'; 
  isOverlayFadingOut_global: boolean = false; 
  showIntroOverlay_global: boolean = true;    


  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isOnHomePage = (event.urlAfterRedirects === '/' || event.urlAfterRedirects === '/#');
      
      if (!this.isOnHomePage) {
        this.showNavbarLinks = true; // En subpáginas, los links de navbar siempre visibles
        this.fadeOutAnimatedTitle_global = true; // El título global se oculta
        this.showIntroOverlay_global = false; // El overlay global se oculta
      } else {
        // Si estamos en la home, el scroll determinará la visibilidad de los links
        // y HomeComponent manejará su propia intro si la tuviera.
        // El título global podría reiniciarse aquí si es necesario
        this.fadeOutAnimatedTitle_global = false;
        this.showIntroOverlay_global = true; // Preparado para la intro si se reinicia
        this.introState_global = 'idle';
        this.startGlobalIntroAnimationSequence(); // Iniciar la secuencia de intro global
        this.showNavbarLinks = (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0) > this.scrollThreshold;
      }
    });
    
    // Iniciar la animación global solo si estamos en la home al cargar
    if (this.router.url === '/' || this.router.url === '/#') {
      this.startGlobalIntroAnimationSequence();
    } else {
        this.showIntroOverlay_global = false;
        this.showAnimatedTitle_global = true; 
        this.fadeOutAnimatedTitle_global = true; 
        this.introState_global = 'introDone'; // Marcar como hecha para que no intente correr
        this.showNavbarLinks = true;
    }
  }

  // Secuencia para el título animado GLOBAL
  startGlobalIntroAnimationSequence() {
    if (this.introState_global === 'idle' && this.isOnHomePage) { 
        this.introState_global = 'titleAppearing';
        setTimeout(() => {
          this.introState_global = 'titleMovingToFinal';
          setTimeout(() => {
            this.introState_global = 'titleAtFinalPosition'; 
            this.isOverlayFadingOut_global = true; 
            setTimeout(() => {
              this.showIntroOverlay_global = false;
              this.introState_global = 'introDone'; 
              this.onWindowScroll(); 
            }, 700); 
          }, 1500); 
        }, 1000); 
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // Si la intro global no ha terminado, no hacer nada con los links de la navbar por scroll
    if (this.introState_global !== 'introDone' && this.isOnHomePage) return;

    if (scrollPosition > this.scrollThreshold) {
      if (!this.showNavbarLinks) {
        this.showNavbarLinks = true; 
      }
      // Desvanecer el título global si estamos en la home y se hace scroll
      if (this.isOnHomePage && !this.fadeOutAnimatedTitle_global) {
          this.fadeOutAnimatedTitle_global = true;
      }
    } else { 
      if (this.isOnHomePage) { 
        if (this.showNavbarLinks) {
          this.showNavbarLinks = false; 
        }
        // Si el scroll vuelve arriba y estamos en home, el título global podría reaparecer
        // (si no se ha desvanecido por la secuencia de intro).
        // Esto es opcional y depende de la UX deseada.
        // if (this.fadeOutAnimatedTitle_global && this.introState_global === 'introDone') {
        //   this.fadeOutAnimatedTitle_global = false;
        // }
      } else {
        // Si no estamos en la home, los links siempre deberían estar visibles
        this.showNavbarLinks = true;
      }
    }
  }
}