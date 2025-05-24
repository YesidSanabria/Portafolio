// src/app/servicios/proyectos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// Define una interfaz para la estructura de tus proyectos
export interface Proyecto { // <<--- ¡ASEGÚRATE DE QUE 'export' ESTÉ AQUÍ!
  id: string;
  fecha: string;
  desarrollo: string;
  tecnologias1: string;
  titulo: string;
  subtitulo?: string;
  descripcionCorta: string;
  descripcionLarga: string;
  rol?: string;
  imagenPrincipal: string;
  imagenesGaleria?: string[];
  tecnologias: string[];
  linkDemo?: string | null;
  linkRepo?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ProyectosService { // <<--- Y QUE 'export' ESTÉ AQUÍ TAMBIÉN
  private proyectosUrl = 'assets/data/proyectos.json';

  constructor(private http: HttpClient) { }

  getProyectos(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(this.proyectosUrl);
  }

  getProyectoPorId(id: string): Observable<Proyecto | undefined> {
    return this.http.get<Proyecto[]>(this.proyectosUrl).pipe(
      map((proyectos: Proyecto[]) => proyectos.find(proyecto => proyecto.id === id))
    );
  }
}