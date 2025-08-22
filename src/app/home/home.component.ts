import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterLink } from '@angular/router';   
import { NavbarComponent } from '../navbar/navbar.component'; 
import { MapaComponent } from '../mapa/mapa.component';       
import { HttpClient } from '@angular/common/http';

// Interfaz para definir la estructura de datos de un proyecto. ¡Buena práctica!
export interface IProyecto {
  id: string;
  desarrollo: string;
  titulo: string;
  descripcionCorta: string;
  imagenPrincipal: string;
  tecnologias1: string;
  tags: string[]; // Se usará para guardar las tecnologías como un array
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent, 
    MapaComponent    
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
  // --- INICIO: CÓDIGO EXISTENTE (SIN MODIFICAR) ---
  // Estados para la animación de introducción
  showIntroOverlay: boolean = true;
  showAnimatedTitle: boolean = true; 
  introState: string = 'idle'; 
  isOverlayFadingOut: boolean = false; 
  fadeOutTitle: boolean = false; 
  private titleDisappearTimer: any;

  // --- Estados para controlar la secuencia interactiva ---
  mostrarJuego: boolean = false; 
  mostrarTransicionNegro: boolean = false;
  mostrarEscenaPC: boolean = false; 
  mostrarBotonPantallaPC: boolean = false; 
  mostrarModalNavegacion: boolean = false; 
  private secuenciaPuertaIniciada: boolean = false;
  // --- FIN: CÓDIGO EXISTENTE (SIN MODIFICAR) ---


  // --- INICIO: CÓDIGO AÑADIDO PARA PROYECTOS ---
  
  // 1. Variable pública para almacenar los proyectos cargados del JSON.
  public proyectos: IProyecto[] = [];

  // 2. Inyectamos HttpClient en el constructor para poder hacer peticiones HTTP.
  constructor(private cdr: ChangeDetectorRef, private http: HttpClient) {}

  ngOnInit(): void {
    this.startIntroAnimationSequence();
    this.cargarProyectos(); // 3. Llamamos al nuevo método al iniciar el componente.
  }

  // 4. Nuevo método para obtener y procesar los datos de los proyectos.
  cargarProyectos(): void {
    // La ruta debe apuntar a donde guardaste tu archivo JSON.
    const dataUrl = 'assets/data/proyectos.json'; 
    
    this.http.get<IProyecto[]>(dataUrl).subscribe(data => {
      // Usamos .map() para transformar cada proyecto que llega del JSON.
      this.proyectos = data.map(proyecto => {
        // Convertimos el string "Python, HTML, CSS" en un array ["Python", "HTML", "CSS"]
        // Esto es ideal para luego usar *ngFor en la plantilla HTML.
        proyecto.tags = proyecto.tecnologias1.split(',').map(tag => tag.trim());
        return proyecto;
      });
      console.log('Proyectos cargados desde JSON:', this.proyectos);
    });
  }
  // --- FIN: CÓDIGO AÑADIDO PARA PROYECTOS ---


  // --- INICIO: CÓDIGO EXISTENTE (SIN MODIFICAR) ---
  ngAfterViewInit(): void {
  }

  startIntroAnimationSequence() {
    if (this.introState === 'idle') {
      this.introState = 'titleAppearing';
      this.cdr.detectChanges();
      setTimeout(() => {
        this.introState = 'titleMovingToFinal';
        this.cdr.detectChanges();
        setTimeout(() => {
          this.introState = 'titleAtFinalPosition';
          this.scheduleTitleDisappear(); 
          this.isOverlayFadingOut = true;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.showIntroOverlay = false;          
            this.mostrarJuego = true;    
            this.cdr.detectChanges();
            console.log("HomeComponent: Intro finalizada, mostrando juego.");
          }, 700); 
        }, 1500); 
      }, 1000); 
    }
  }

  scheduleTitleDisappear(): void {
    clearTimeout(this.titleDisappearTimer);
    const visibleDuration = 3000; 
    this.titleDisappearTimer = setTimeout(() => {
      this.fadeOutTitle = true; 
      this.cdr.detectChanges();
      console.log('HomeComponent: Título de intro desvanecido por timer.');
    }, visibleDuration);
  }
  
  manejarEntradaEnPuertaDesdeMapa(): void {
    console.log("HomeComponent: Evento 'personajeEntroEnPuertaGlobal' recibido desde MapaComponent.");
    if (this.mostrarJuego && !this.secuenciaPuertaIniciada) {
      this.secuenciaPuertaIniciada = true; 
      this.iniciarSecuenciaFundidoNegro();
    }
  }

  iniciarSecuenciaFundidoNegro(): void {
    console.log("HomeComponent: Iniciando secuencia de fundido a negro.");
    this.mostrarTransicionNegro = true; 
    this.cdr.detectChanges();

    setTimeout(() => {
      console.log("HomeComponent: Fundido a negro completo. Ocultando el juego.");
      this.mostrarJuego = false; 
      this.cdr.detectChanges();
      this.activarEscenaPC();
    }, 500); 
  }

  activarEscenaPC(): void {
    console.log("HomeComponent: Activando Escena PC.");
    this.mostrarEscenaPC = true; 
    this.cdr.detectChanges();

    setTimeout(() => {
      console.log("HomeComponent: Ocultando transición negra para revelar Escena PC.");
      this.mostrarTransicionNegro = false;
      this.cdr.detectChanges();
      this.activarBotonEnPantallaPC(); 
    }, 600); 
  }

  activarBotonEnPantallaPC(): void { 
    console.log("HomeComponent: Activando Botón en Pantalla PC.");
    if (!this.mostrarModalNavegacion) {
      setTimeout(() => { 
        this.mostrarBotonPantallaPC = true;
        this.cdr.detectChanges();
        console.log("HomeComponent: Botón en pantalla PC visible.");
      });
    }
  }

  abrirModalNavegacion(): void {
    console.log("HomeComponent: Abriendo modal de navegación.");
    this.mostrarModalNavegacion = true;
    this.cdr.detectChanges();
  }

  cerrarModalNavegacion(): void {
    console.log("HomeComponent: Cerrando modal de navegación.");
    this.mostrarModalNavegacion = false;
    this.mostrarBotonPantallaPC = true;
    this.cdr.detectChanges();
  }

  navegarASeccion(idSeccion: string): void {
    console.log(`HomeComponent: Navegando a sección: ${idSeccion} desde modal.`);
    
    this.mostrarModalNavegacion = false;
    this.mostrarEscenaPC = true;
    this.mostrarBotonPantallaPC = true; 
    
    this.cdr.detectChanges();

    const seccion = document.getElementById(idSeccion);
    if (seccion) {
      const navbarElement = document.querySelector('app-navbar'); 
      const navbarHeight = navbarElement ? navbarElement.clientHeight : 60;       
      const sectionTop = seccion.getBoundingClientRect().top + window.scrollY - navbarHeight;
      
      window.scrollTo({
        top: sectionTop,
        behavior: 'smooth'
      });
    } else {
      console.warn(`HomeComponent: No se encontró la sección con ID: ${idSeccion}`);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.titleDisappearTimer);
  }
  // --- FIN: CÓDIGO EXISTENTE (SIN MODIFICAR) ---
}
