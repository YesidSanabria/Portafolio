import { Component, HostListener,Input  } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  @Input() showLinks: boolean = false;
  isMobileMenuOpen: boolean = false;

  constructor() { }

  smoothScrollTo(event: MouseEvent, sectionId: string): void {
    event.preventDefault();
    
    // Ocultar el título animado principal si aún es visible y el usuario navega
    const titleFadeEvent = new CustomEvent('requestTitleFadeOut');
    window.dispatchEvent(titleFadeEvent);

    const section = document.getElementById(sectionId);
    if (section) {
      const navbarHeight = document.querySelector('.navbar')?.clientHeight || 60;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY - navbarHeight;
      
      window.scrollTo({
        top: sectionTop,
        behavior: 'smooth'
      });
    }
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  scrollToTop(event: MouseEvent): void {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Podrías añadir una clase al body para prevenir scroll cuando el menú está abierto
    // document.body.classList.toggle('no-scroll', this.isMobileMenuOpen);
  }

  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const navbarToggle = document.querySelector('.navbar-toggle');
    const navbarLinks = document.querySelector('.navbar-links');

    if (this.isMobileMenuOpen && 
        navbarToggle && !navbarToggle.contains(target) && 
        navbarLinks && !navbarLinks.contains(target)) {
      this.isMobileMenuOpen = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    if (window.innerWidth > 768 && this.isMobileMenuOpen) { // 768px es un breakpoint común para móviles
      this.isMobileMenuOpen = false;
    }
  }
}
