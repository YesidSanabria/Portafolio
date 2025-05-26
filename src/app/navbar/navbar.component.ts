import { Component, HostListener, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router'; // Importar Router, RouterLink, NavigationEnd
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() showLinks: boolean = false;
  isMobileMenuOpen: boolean = false;
  private currentUrl: string = '';

  constructor(private router: Router) {
    // Suscribirse a eventos de navegación para saber la URL actual
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => { // Usar 'any' o un tipo más específico
      this.currentUrl = event.urlAfterRedirects;
    });
  }

  handleNavClick(event: MouseEvent, fragment: string): void {
    event.preventDefault(); // Prevenir siempre el comportamiento por defecto del ancla

    // Disparar evento para que AppComponent sepa que se ha hecho scroll/navegación
    // y pueda ocultar el título animado si es necesario y aún está visible.
    window.dispatchEvent(new CustomEvent('requestTitleFadeOut'));

    if (this.currentUrl === '/' || this.currentUrl.startsWith('/#')) {
      // Ya estamos en la página principal, solo hacer scroll suave
      this.smoothScrollToSection(fragment);
    } else {
      // No estamos en la página principal, navegar a la home y luego hacer scroll
      this.router.navigate(['/'], { fragment: fragment });
    }

    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  smoothScrollToSection(sectionId: string): void {
    const section = document.getElementById(sectionId);
    if (section) {
      const navbarHeight = document.querySelector('.navbar')?.clientHeight || 60;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY - navbarHeight;
      
      window.scrollTo({
        top: sectionTop,
        behavior: 'smooth'
      });
    }
  }

  scrollToTop(event: MouseEvent): void {
    event.preventDefault();
    this.router.navigate(['/']); // Siempre navega a la ruta raíz
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarLinksContainer = document.querySelector('.navbar-links');

    if (this.isMobileMenuOpen && 
        navbarToggle && !navbarToggle.contains(target) && 
        navbarLinksContainer && !navbarLinksContainer.contains(target)) {
      this.isMobileMenuOpen = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (window.innerWidth > 768 && this.isMobileMenuOpen) { 
      this.isMobileMenuOpen = false;
    }
  }
}
