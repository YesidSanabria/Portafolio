import { Component, HostListener, OnInit, OnDestroy, ElementRef, Renderer2, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-personaje',
  standalone: true,
  templateUrl: './personaje.component.html',
  styleUrls: ['./personaje.component.css']
})
export class PersonajeComponent implements OnInit, AfterViewInit, OnDestroy {
  posX: number = 50;
  posY: number = 50;
  readonly velocidadPorFrame: number = 3;

  private readonly anchoPersonaje: number = 100;
  private readonly altoPersonaje: number = 100;
  private readonly alturaFijaMapa: number = 600;

  private limiteMapa = {
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0
  };

  private personajeElement: HTMLElement | null = null;
  private mapaContainerElement: HTMLElement | null = null;
  private activeKeys: Set<string> = new Set();
  private animationFrameId: number | null = null;

  private readonly idleGifSrc: string = 'assets/personaje-idle.gif';
  private readonly walkHorizontalGifSrc: string = 'assets/personaje-walk-horizontal.gif';
  private readonly walkUpGifSrc: string = 'assets/personaje-walk-up.gif';
  private readonly walkDownGifSrc: string = 'assets/personaje-walk-down.gif';

  characterImageSrc: string = this.idleGifSrc;
  isFacingRight: boolean = true;

  constructor(private elRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.personajeElement = this.elRef.nativeElement.querySelector('#personaje');
    console.log('Personaje Element en ngAfterViewInit:', this.personajeElement); // LOG 1
    
    const appPersonajeElement = this.elRef.nativeElement.parentElement;
    if (appPersonajeElement) {
      this.mapaContainerElement = appPersonajeElement.parentElement;
    }

    if (!this.mapaContainerElement || !this.mapaContainerElement.classList.contains('mapa-container')) {
        console.warn('PersonajeComponent: No se pudo encontrar .mapa-container como padre esperado.');
        this.mapaContainerElement = document.body; 
    }
    
    this.actualizarLimitesDelMapa();
    this.aplicarPosicionInicialPersonaje();
    this.startGameLoop();
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private aplicarPosicionInicialPersonaje(): void {
    if (this.personajeElement) {
      this.renderer.setStyle(this.personajeElement, 'left', `${this.posX}px`);
      this.renderer.setStyle(this.personajeElement, 'bottom', `${this.posY}px`);
      console.log(`Posición inicial aplicada: left=${this.posX}px, bottom=${this.posY}px`); // LOG 2
    } else {
      console.error('aplicarPosicionInicialPersonaje: personajeElement es null'); // LOG 3
    }
  }
  
  @HostListener('window:resize', ['$event'])
  onWindowResize(event?: Event) {
    this.actualizarLimitesDelMapa();
    this.validarYCorregirPosicion();
  }

  private actualizarLimitesDelMapa(): void {
    // ... (código sin cambios) ...
    if (this.mapaContainerElement) {
      const anchoMapaActual = this.mapaContainerElement.clientWidth;
      this.limiteMapa.maxX = anchoMapaActual - this.anchoPersonaje;
      this.limiteMapa.maxY = this.alturaFijaMapa - this.altoPersonaje;
      this.limiteMapa.maxX = Math.max(this.limiteMapa.minX, this.limiteMapa.maxX);
      this.limiteMapa.maxY = Math.max(this.limiteMapa.minY, this.limiteMapa.maxY);
    } else {
      this.limiteMapa.maxX = window.innerWidth - this.anchoPersonaje;
      this.limiteMapa.maxY = this.alturaFijaMapa - this.altoPersonaje;
    }
  }

  private validarYCorregirPosicion(): void {
    // ... (código sin cambios) ...
    this.posX = Math.max(this.limiteMapa.minX, Math.min(this.posX, this.limiteMapa.maxX));
    this.posY = Math.max(this.limiteMapa.minY, Math.min(this.posY, this.limiteMapa.maxY));
    this.actualizarPosicionEnDOM();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
      event.preventDefault();
      this.activeKeys.add(key);
      console.log('Tecla presionada:', key, 'ActiveKeys:', Array.from(this.activeKeys)); // LOG 4
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent) {
    const key = event.key.toLowerCase();
    this.activeKeys.delete(key);
    console.log('Tecla soltada:', key, 'ActiveKeys:', Array.from(this.activeKeys)); // LOG 5
  }

  private startGameLoop(): void {
    const gameLoopTick = () => {
      this.updateCharacterState(); 
      this.updateMovement();      
      this.animationFrameId = requestAnimationFrame(gameLoopTick);
    };
    gameLoopTick();
  }

  private updateCharacterState(): void {
    // ... (código sin cambios, el que maneja los 4 GIFs direccionales) ...
    let newImageSrc = this.idleGifSrc; 
    let isMoving = false;

    if (this.activeKeys.has('arrowup') || this.activeKeys.has('w')) {
      newImageSrc = this.walkUpGifSrc;
      isMoving = true;
    } else if (this.activeKeys.has('arrowdown') || this.activeKeys.has('s')) {
      newImageSrc = this.walkDownGifSrc;
      isMoving = true;
    } else if (this.activeKeys.has('arrowleft') || this.activeKeys.has('a')) {
      newImageSrc = this.walkHorizontalGifSrc;
      this.isFacingRight = false; 
      isMoving = true;
    } else if (this.activeKeys.has('arrowright') || this.activeKeys.has('d')) {
      newImageSrc = this.walkHorizontalGifSrc;
      this.isFacingRight = true; 
      isMoving = true;
    }

    if (!isMoving) {
        newImageSrc = this.idleGifSrc;
    }

    if (this.characterImageSrc !== newImageSrc) {
      this.characterImageSrc = newImageSrc;
      // console.log('Cambiando GIF a:', this.characterImageSrc); // Puedes descomentar este si quieres
    }
  }

  private updateMovement(): void {
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
    if (this.activeKeys.has('arrowup') || this.activeKeys.has('w')) {
      nuevaPosY += this.velocidadPorFrame;
      seMovioEnEsteFrame = true;
    }
    if (this.activeKeys.has('arrowdown') || this.activeKeys.has('s')) {
      nuevaPosY -= this.velocidadPorFrame;
      seMovioEnEsteFrame = true;
    }

    if (seMovioEnEsteFrame) {
      const oldX = this.posX; // Guardar valor antiguo para el log
      const oldY = this.posY; // Guardar valor antiguo para el log

      this.posX = Math.max(this.limiteMapa.minX, Math.min(nuevaPosX, this.limiteMapa.maxX));
      this.posY = Math.max(this.limiteMapa.minY, Math.min(nuevaPosY, this.limiteMapa.maxY));
      
      console.log(`updateMovement: seMovioEnEsteFrame=true. Old(${oldX},${oldY}) -> New(${this.posX},${this.posY}). Teclas:`, Array.from(this.activeKeys)); // LOG 6

      this.actualizarPosicionEnDOM();
    } else {
      // Opcional: Log para cuando no hay movimiento detectado en este frame
      // if (this.activeKeys.size > 0) { // Si hay teclas activas pero no se tradujo en movimiento (raro con la lógica actual)
      //   console.log('updateMovement: Teclas activas pero seMovioEnEsteFrame=false. ActiveKeys:', Array.from(this.activeKeys));
      // }
    }
  }

  private actualizarPosicionEnDOM() {
    if (this.personajeElement) {
      this.renderer.setStyle(this.personajeElement, 'left', `${this.posX}px`);
      this.renderer.setStyle(this.personajeElement, 'bottom', `${this.posY}px`);
      // console.log(`Estilos aplicados: left=${this.personajeElement.style.left}, bottom=${this.personajeElement.style.bottom}`); // LOG 7 (Puede ser muy verboso)
    } else {
      console.error('actualizarPosicionEnDOM: personajeElement es null. No se puede mover el personaje.'); // LOG 8
    }
  }
}
