import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'; // Para leer parámetros de la URL
import { CommonModule } from '@angular/common';   // Para usar *ngIf, etc.

@Component({
  selector: 'app-vista-proyecto-detalle',
  standalone: true,
  imports: [CommonModule], // Importa CommonModule
  templateUrl: './vista-proyecto-detalle.component.html',
  styleUrls: ['./vista-proyecto-detalle.component.css']
})
export class VistaProyectoDetalleComponent implements OnInit {
  nombreDelProyecto: string | null = null;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    // Obtener el nombre del proyecto desde los parámetros de la ruta
    this.route.paramMap.subscribe(params => {
      this.nombreDelProyecto = params.get('nombre'); // Usaremos 'nombre' como parámetro
      console.log('Mostrando detalles para el proyecto:', this.nombreDelProyecto);
    });
  }
}