import {
  Component,
  HostListener,
  OnInit,
  OnDestroy,
  ElementRef,
  Renderer2,
  AfterViewInit,
  Output,
  EventEmitter,
  NgZone // Importante para requestAnimationFrame fuera de Angular si es necesario, aunque requestAnimationFrame usualmente funciona bien.
} from '@angular/core';
import { NgIf } from '@angular/common'; // Necesario si usas *ngIf en la plantilla de este componente (para el debug div)

@Component({
  selector: 'app-personaje',
  standalone: true,
  imports: [NgIf], // Añade NgIf si la plantilla de PersonajeComponent usa *ngIf (ej. para el div de debug)
  templateUrl: './personaje.component.html',
  styleUrls: ['./personaje.component.css']
})
export class PersonajeComponent implements OnInit, AfterViewInit, OnDestroy {
  // --- Posición y Movimiento ---
  posX: number = 50; // Posición inicial X
  posY: number = 50; // Posición inicial Y (Mundo Y desde abajo)
  readonly velocidadPorFrame: number = 4; // Velocidad del personaje

  // --- Dimensiones ---
  private readonly anchoPersonaje: number = 200; // Confirmado 200px
  private readonly altoPersonaje: number = 200;  // Confirmado 200px

  // --- Configuración del Mapa y Viewport (Ajusta estos valores según tu mapa real) ---
  private readonly alturaViewportMapa: number = 600; // Alto visible del contenedor del mapa
  private readonly anchoViewportMapaDefault: number = 800; // Ancho por defecto del viewport del mapa
  private readonly alturaRealImagenMapa: number = 1280; // Alto total de tu imagen de mapa

  // --- Límites del Mundo ---
  private limiteMapaMundo = { minX: 0, minY: 0, maxX: 0, maxY: 0 };

  // --- Elementos del DOM ---
  private personajeElement: HTMLElement | null = null;
  private mapaContainerElement: HTMLElement | null = null; // El viewport del mapa
  private imagenMapaPrincipalElement: HTMLElement | null = null; // La imagen grande del mapa que se scrollea

  // --- Control de Teclas y Animación ---
  private activeKeys: Set<string> = new Set();
  private animationFrameId: number | null = null;

  // --- Sprites y Dirección ---
  private readonly idleGifSrc: string = 'assets/personaje-idle.gif';
  private readonly walkHorizontalGifSrc: string = 'assets/personaje-walk-horizontal.gif';
  private readonly walkUpGifSrc: string = 'assets/personaje-walk-up.gif'; // Hacia el fondo del mapa
  private readonly walkDownGifSrc: string = 'assets/personaje-walk-down.gif'; // Hacia el frente del mapa
  characterImageSrc: string = this.idleGifSrc;
  isFacingRight: boolean = true;

  // --- Scroll del Mapa ---
  private mapScrollY: number = 0; // Cuánto se ha scrolleado verticalmente el mapa (CSS 'top')

  // --- Interacción con la Puerta ---
  private puertaProyectos = { xMin: 1101, xMax: 1151, yMin: 247, yMax: 300 };
  private haEntradoPuertaProyectos: boolean = false;

  // --- Event Emitters ---
  // Para el debug de coordenadas (si aún lo usas en la plantilla de PersonajeComponent)
  @Output() coordenadasCambiadas = new EventEmitter<{posX: number, posY: number, mapScrollY: number, visualPosY: number}>();
  // Para notificar al componente padre (MapaComponent) sobre la entrada en la puerta
  @Output() entradaEnPuertaDetectada = new EventEmitter<void>();

  // Propiedad para el debug en la plantilla de PersonajeComponent (si aplica)
  public coordenadasParaDebug: {posX: number, posY: number, mapScrollY: number, visualPosY: number} | null = null;

  constructor(
    private elRef: ElementRef,
    private renderer: Renderer2,
    private ngZone: NgZone // NgZone puede ser útil para optimizar requestAnimationFrame si hay problemas de detección de cambios
  ) {}

  ngOnInit(): void {
    // Inicializaciones que no dependan del DOM que aún no está listo
  }

  ngAfterViewInit(): void {
    this.personajeElement = this.elRef.nativeElement.querySelector('#personaje');

    // Búsqueda robusta del .mapa-container
    const hostElement = this.elRef.nativeElement.parentElement; // <app-personaje>
    if (hostElement) {
        // Intenta encontrar .mapa-container como hermano o en ancestros comunes si es necesario
        // Esto depende de tu estructura exacta. Si <app-personaje> está DENTRO de .mapa-container:
        this.mapaContainerElement = hostElement.closest('.mapa-container') as HTMLElement;
        if (!this.mapaContainerElement && hostElement.parentElement) {
             // Si <app-personaje> es hermano del mapa y ambos están en un contenedor más grande
             this.mapaContainerElement = hostElement.parentElement.querySelector('.mapa-container') as HTMLElement;
        }
    }

    if (!this.mapaContainerElement) {
        // Fallback o búsqueda global si es necesario, aunque es mejor una estructura clara
        console.warn('PersonajeComponent: No se pudo encontrar .mapa-container. Usando document.body como fallback para dimensiones.');
        this.mapaContainerElement = document.body; // O un contenedor por defecto si document.body no es apropiado
    }
    
    // Asumimos que la imagen del mapa principal tiene un ID 'mapa-principal-imagen'
    // y es accesible globalmente o dentro de una estructura conocida.
    this.imagenMapaPrincipalElement = document.getElementById('mapa-principal-imagen') as HTMLElement;
    if (!this.imagenMapaPrincipalElement) {
        console.warn('PersonajeComponent: No se encontró #mapa-principal-imagen.');
    }

    this.actualizarLimitesDelMapaMundo();
    this.validarYCorregirPosicionPersonaje(); // Asegura que la pos inicial sea válida
    this.actualizarDesplazamientoMapa(); // Calcula el scroll inicial del mapa
    this.aplicarPosicionInicialPersonaje(); // Aplica la posición visual inicial
    this.actualizarPosicionMapaEnDOM(); // Aplica el scroll visual inicial del mapa
    
    this.emitirCoordenadas(); // Para el debug
    this.startGameLoop();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    // Limpiar listeners si se añadieron manualmente (HostListener se limpia solo)
  }

  private aplicarPosicionInicialPersonaje(): void {
    this.actualizarPosicionEnDOM();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event?: Event) {
    this.actualizarLimitesDelMapaMundo();
    this.actualizarDesplazamientoMapa();
    this.validarYCorregirPosicionPersonaje();
    this.actualizarPosicionMapaEnDOM();
    this.emitirCoordenadas();
  }

  private actualizarLimitesDelMapaMundo(): void {
    let anchoViewport = this.anchoViewportMapaDefault;
    if (this.mapaContainerElement && this.mapaContainerElement !== document.body) {
      anchoViewport = this.mapaContainerElement.clientWidth;
    } else if (this.mapaContainerElement === document.body) {
        anchoViewport = window.innerWidth; // O el ancho del viewport si es el body
    }
    
    this.limiteMapaMundo.minX = 0;
    // El personaje se mueve relativo al viewport del mapa, no al ancho total de la imagen del mapa si esta es más ancha que el viewport.
    this.limiteMapaMundo.maxX = anchoViewport - this.anchoPersonaje;
    
    this.limiteMapaMundo.minY = 0; // Borde inferior del mundo del juego
    this.limiteMapaMundo.maxY = this.alturaRealImagenMapa - this.altoPersonaje; // Borde superior del mundo del juego

    this.limiteMapaMundo.maxX = Math.max(0, this.limiteMapaMundo.maxX); // No menor que 0
    this.limiteMapaMundo.maxY = Math.max(0, this.limiteMapaMundo.maxY); // No menor que 0
  }

  private validarYCorregirPosicionPersonaje(): void {
    this.posX = Math.max(this.limiteMapaMundo.minX, Math.min(this.posX, this.limiteMapaMundo.maxX));
    this.posY = Math.max(this.limiteMapaMundo.minY, Math.min(this.posY, this.limiteMapaMundo.maxY));
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
      event.preventDefault();
      this.activeKeys.add(key);
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    this.activeKeys.delete(key);
  }

  private updateCharacterState(): void {
    let newImageSrc = this.characterImageSrc; // Mantener actual si no hay cambio
    const isMovingHorizontal = this.activeKeys.has('arrowleft') || this.activeKeys.has('a') || this.activeKeys.has('arrowright') || this.activeKeys.has('d');
    const isMovingUp = this.activeKeys.has('arrowup') || this.activeKeys.has('w');
    const isMovingDown = this.activeKeys.has('arrowdown') || this.activeKeys.has('s');

    if (isMovingUp) {
      newImageSrc = this.walkUpGifSrc;
    } else if (isMovingDown) {
      newImageSrc = this.walkDownGifSrc;
    } else if (this.activeKeys.has('arrowleft') || this.activeKeys.has('a')) {
      newImageSrc = this.walkHorizontalGifSrc;
      this.isFacingRight = false;
    } else if (this.activeKeys.has('arrowright') || this.activeKeys.has('d')) {
      newImageSrc = this.walkHorizontalGifSrc;
      this.isFacingRight = true;
    } else {
      newImageSrc = this.idleGifSrc; // No hay teclas de movimiento activas
    }

    if (this.characterImageSrc !== newImageSrc) {
      this.characterImageSrc = newImageSrc;
    }
  }

  private actualizarDesplazamientoMapa(): void {
    // Centrar el personaje verticalmente en el viewport del mapa
    // targetMapTop es cuánto debe moverse la imagen del mapa hacia arriba (valor negativo de 'top')
    // o hacia abajo (valor positivo de 'top') para mantener al personaje centrado.
    let targetMapTop = (this.alturaViewportMapa / 2) - (this.posY + this.altoPersonaje / 2);

    // Limitar el scroll del mapa
    const maxMapTopValue = 0; // El mapa no puede bajar más de su posición original (top: 0)
    // El mapa no puede subir más allá de mostrar su final, menos la altura del viewport
    const minMapTopValue = -(this.alturaRealImagenMapa - this.alturaViewportMapa);
    
    // Asegurarse que minMapTopValue no sea positivo si alturaRealImagenMapa < alturaViewportMapa
    const effectiveMinMapTopValue = Math.min(0, minMapTopValue);

    this.mapScrollY = Math.max(effectiveMinMapTopValue, Math.min(targetMapTop, maxMapTopValue));
    this.mapScrollY = Math.round(this.mapScrollY); // Evitar subpíxeles si causan problemas
  }
  
  private actualizarPosicionMapaEnDOM() {
    if (this.imagenMapaPrincipalElement) {
      this.renderer.setStyle(this.imagenMapaPrincipalElement, 'top', `${this.mapScrollY}px`);
    }
  }

  private checkProjectDoorInteraction(): void {
    if (this.haEntradoPuertaProyectos) return;

    // Usar las dimensiones confirmadas
    const personajeCenterX = this.posX + (this.anchoPersonaje / 2);
    const personajeCenterY = this.posY + (this.altoPersonaje / 2);

    if (personajeCenterX >= this.puertaProyectos.xMin && personajeCenterX <= this.puertaProyectos.xMax &&
        personajeCenterY >= this.puertaProyectos.yMin && personajeCenterY <= this.puertaProyectos.yMax) {
      
      this.haEntradoPuertaProyectos = true; 
      console.log("PersonajeComponent: ¡Entrada en puerta detectada! Emitiendo evento entradaEnPuertaDetectada...");
      this.entradaEnPuertaDetectada.emit(); 
    }
  }

  private startGameLoop(): void {
    const gameLoopTick = () => {
      this.updateCharacterState();
      this.updateMovementAndMapScroll(); // Actualiza posX, posY, y luego mapScrollY basado en nueva posY
      this.checkProjectDoorInteraction();
      
      this.emitirCoordenadas(); // Para el debug, si aún se usa

      this.animationFrameId = requestAnimationFrame(gameLoopTick);
    };
    
    // Usar NgZone.runOutsideAngular para requestAnimationFrame si hay muchos ciclos y
    // no se necesita detección de cambios de Angular en cada frame.
    // Pero para un juego simple, puede no ser necesario.
    // this.ngZone.runOutsideAngular(() => gameLoopTick());
    gameLoopTick(); // Inicia el bucle
  }

  private updateMovementAndMapScroll(): void {
    let nuevaPosX = this.posX;
    let nuevaPosY = this.posY;
    let seMovioEnEsteFrame = false;

    if (this.activeKeys.has('arrowleft') || this.activeKeys.has('a')) {
      nuevaPosX -= this.velocidadPorFrame;
      seMovioEnEsteFrame = true;
    }
    if (this.activeKeys.has('arrowright') || this.activeKeys.has('d')) {
      nuevaPosX += this.velocidadPorFrame;
      seMovioEnEsteFrame = true;
    }
    if (this.activeKeys.has('arrowup') || this.activeKeys.has('w')) { // Mover personaje "hacia arriba" en el mundo del juego
      nuevaPosY += this.velocidadPorFrame;
      seMovioEnEsteFrame = true;
    }
    if (this.activeKeys.has('arrowdown') || this.activeKeys.has('s')) { // Mover personaje "hacia abajo" en el mundo del juego
      nuevaPosY -= this.velocidadPorFrame;
      seMovioEnEsteFrame = true;
    }

    if (seMovioEnEsteFrame) {
      // Aplicar límites del mundo a las nuevas posiciones
      this.posX = Math.max(this.limiteMapaMundo.minX, Math.min(nuevaPosX, this.limiteMapaMundo.maxX));
      this.posY = Math.max(this.limiteMapaMundo.minY, Math.min(nuevaPosY, this.limiteMapaMundo.maxY));
      
      this.actualizarDesplazamientoMapa(); // Calcula el nuevo mapScrollY basado en la nueva this.posY
      this.actualizarPosicionEnDOM();      // Aplica la posición VISUAL del personaje en el viewport
      this.actualizarPosicionMapaEnDOM();  // Aplica el scroll del mapa
    }
  }

  private actualizarPosicionEnDOM() {
    if (this.personajeElement) {
      // La posición 'bottom' visual del personaje en el viewport es su this.posY (mundo)
      // más el this.mapScrollY (que es el 'top' del mapa, usualmente negativo o cero).
      // Si mapScrollY es -100 (mapa subió 100px), un personaje en posY=50 se verá en visualPosY = 50 - 100 = -50 (desde el bottom)
      // Esto significa que el personaje debe estar posicionado con respecto al *viewport del mapa*, no al mundo entero directamente si hay scroll.
      // La lógica actual de posY es "distancia desde el borde inferior del mapa del MUNDO".
      // El `visualPosY` es la posición `bottom` CSS del personaje DENTRO del viewport del mapa.
      const visualPosY_CSS = this.posY + this.mapScrollY;

      this.renderer.setStyle(this.personajeElement, 'left', `${this.posX}px`);
      this.renderer.setStyle(this.personajeElement, 'bottom', `${visualPosY_CSS}px`);
    }
  }

  // Para el debug de coordenadas (si la plantilla de PersonajeComponent lo usa)
  private emitirCoordenadas(): void {
    if (this.coordenadasCambiadas.observers.length > 0 || this.personajeElement) { // Solo calcular si hay suscriptores o para el debug interno
        const visualPosY_CSS = this.posY + this.mapScrollY;
        const nuevasCoordenadas = {
        posX: Math.round(this.posX),
        posY: Math.round(this.posY), // Coordenada Y en el mundo (desde el "suelo" del mapa)
        mapScrollY: Math.round(this.mapScrollY), // Cuánto se ha scrolleado el mapa (valor 'top' CSS para la imagen del mapa)
        visualPosY: Math.round(visualPosY_CSS) // Coordenada Y visual del personaje en el viewport (valor 'bottom' CSS para el personaje)
        };
        this.coordenadasCambiadas.emit(nuevasCoordenadas);
        this.coordenadasParaDebug = nuevasCoordenadas;
    }
  }
}