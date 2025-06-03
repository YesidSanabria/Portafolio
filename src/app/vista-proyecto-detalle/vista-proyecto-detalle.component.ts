import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProyectosService, Proyecto } from '../servicios/proyectos.service'; // Asegúrate que la ruta a tu servicio sea correcta

@Component({
  selector: 'app-vista-proyecto-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './vista-proyecto-detalle.component.html',
  styleUrls: ['./vista-proyecto-detalle.component.css']
})
export class VistaProyectoDetalleComponent implements OnInit {
  proyectoActual: Proyecto | undefined;
  descripcionLargaFormateada: string = ''; // Propiedad para el HTML formateado
  errorCarga: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private proyectosService: ProyectosService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const nombreProyecto = params.get('nombre');
      if (nombreProyecto) {
        this.proyectosService.getProyectoPorId(nombreProyecto).subscribe({
          next: (proyectoCargado) => {
            this.proyectoActual = proyectoCargado;
            if (!this.proyectoActual) {
              console.error('Proyecto no encontrado con ID:', nombreProyecto);
              this.errorCarga = 'El proyecto solicitado no fue encontrado.';
              this.descripcionLargaFormateada = '';
            } else {
              console.log('Proyecto cargado:', this.proyectoActual);
              if (this.proyectoActual.descripcionLarga) {
                this.descripcionLargaFormateada = this.proyectoActual.descripcionLarga.replace(/\n/g, '<br>');
              } else {
                this.descripcionLargaFormateada = this.proyectoActual?.descripcionLarga || '';
              }
            }
          },
          error: (err) => {
            console.error('Error al cargar el proyecto:', err);
            this.errorCarga = 'Ocurrió un error al cargar los datos del proyecto.';
            this.descripcionLargaFormateada = '';
          }
        });
      } else {
        console.error('No se proporcionó ID de proyecto en la ruta.');
        this.errorCarga = 'No se especificó un proyecto.';
        this.descripcionLargaFormateada = '';
      }
    });
  }
}