import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common'; // Para leer parámetros de ruta
// Importa un servicio si tienes uno para cargar datos de proyectos
// import { ProyectosService } from '../proyectos.service';

@Component({
  selector: 'app-vista-proyecto-detalle',
  standalone: true,
  imports: [], // Añade CommonModule si usas *ngIf, etc.
  templateUrl: './vista-proyecto-detalle.component.html',
  styleUrls: ['./vista-proyecto-detalle.component.css']
})
export class VistaProyectoDetalleComponent implements OnInit {
  proyectoId: string | null = null;

  constructor(private route: ActivatedRoute /*, private proyectosService: ProyectosService */) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.proyectoId = params.get('id');
      console.log('ID del Proyecto:', this.proyectoId);

    });
  }
}