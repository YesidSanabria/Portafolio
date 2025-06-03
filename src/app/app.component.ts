import { Component, OnInit, HostListener, AfterViewInit } from '@angular/core';
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
export class AppComponent implements OnInit, AfterViewInit {
  showNavbarLinks: boolean = false;
  private scrollThreshold: number = 50; 
  isOnHomePage: boolean = true;


  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isOnHomePage = (event.urlAfterRedirects === '/' || event.urlAfterRedirects.startsWith('/#'));
      
      if (!this.isOnHomePage) { 
        this.showNavbarLinks = true; 
      } else { 
        this.onWindowScroll(); 
      }
    });
  }

  ngAfterViewInit(): void {
    // La lógica de la intro ahora está en HomeComponent.
    // Solo nos aseguramos de que los links de la navbar tengan el estado correcto al cargar.
     this.onWindowScroll(); 
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // La visibilidad de los links de la navbar depende del scroll y si estamos en la home.
    // HomeComponent manejará si su propia intro ha terminado.
    // Aquí, solo nos preocupamos del scroll general.
    if (scrollPosition > this.scrollThreshold) {
      if (!this.showNavbarLinks) {
        this.showNavbarLinks = true; 
      }
    } else { 
      if (this.isOnHomePage) { // Solo ocultar links si estamos en la home y arriba
        // Y si la intro de HomeComponent ya terminó (HomeComponent podría emitir un evento o usar un servicio)
        // Por ahora, simplificamos y solo depende del scroll en la home
        if (this.showNavbarLinks) {
          this.showNavbarLinks = false; 
        }
      } else { // En otras páginas, los links siempre visibles si ya se hizo scroll alguna vez
        this.showNavbarLinks = true;
      }
    }
  }
}
