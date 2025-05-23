import { Routes } from '@angular/router';
import { VistaProyectoDetalleComponent } from './vista-proyecto-detalle/vista-proyecto-detalle.component';
// Asume que tienes un componente "Home" o similar para la vista principal
// import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: 'proyecto/:id', component: VistaProyectoDetalleComponent }, // Ruta para detalles de proyecto
  // ... otras rutas ...
   { path: '**', redirectTo: '' } // Redirigir a la home si la ruta no existe
];