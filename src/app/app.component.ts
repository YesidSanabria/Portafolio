import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { MapaComponent } from './mapa/mapa.component';      
import { PersonajeComponent } from './personaje/personaje.component'; 

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,        
    NavbarComponent,   
    MapaComponent,      
    PersonajeComponent   
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showIntroOverlay: boolean = true;
  showAnimatedTitle: boolean = true; 
  introState: string = 'idle';
  isOverlayFadingOut: boolean = false;
  fadeOutTitle: boolean = false;

  showNavbarLinks: boolean = false;
  private scrollThreshold: number = 100;

  ngOnInit() {
    this.startIntroAnimationSequence();
  }

  startIntroAnimationSequence() {
    this.introState = 'titleAppearing';
    setTimeout(() => {
      this.introState = 'titleMovingToFinal';
      setTimeout(() => {
        this.introState = 'titleAtFinalPosition'; 
        this.isOverlayFadingOut = true; 
        setTimeout(() => {
          this.showIntroOverlay = false;
        }, 700);

      }, 1500);

    }, 1000);
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
