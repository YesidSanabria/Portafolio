// src/app/servicios/proyectos.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// Define una interfaz para la estructura de tus proyectos
export interface Proyecto { // <<--- ¡ASEGÚRATE DE QUE 'export' ESTÉ AQUÍ!
  id: string;
  advertencia: string;
  fecha: string;
  desarrollo: string;
  tecnologias1: string;
  titulo: string;
  subtitulo_proyecto: string;
  subtitulo?: string;
  descripcionCorta: string;
  descripcionLarga: string;
  funcionalidades: string;
  funcion1: string;
  funcion1_1: string;
  funcion2: string;
  funcion2_1: string;
  funcion3: string;
  funcion3_1: string;
  funcion4: string;
  funcion4_1: string;
  funcion5: string;
  funcion5_1: string;
  funcion6: string;
  funcion6_1: string;
  
  rol?: string;
  imagenPrincipal: string;
  imagen1: string;
  imagen2: string;
  imagen3: string;
  tecnologias: string[];
  linkDemo?: string | null;
  linkRepo?: string | null;

  tectno1: string;
  tectno1_1: string;
  tectno2: string;
  tectno2_1: string;
  tectno3: string;
  tectno3_1: string;
  tectno4: string;
  tectno4_1: string;

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