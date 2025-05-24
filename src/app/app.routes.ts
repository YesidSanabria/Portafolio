import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component'; // Asumiendo que src/app/home/ existe
import { VistaProyectoDetalleComponent } from './vista-proyecto-detalle/vista-proyecto-detalle.component'; // RUTA CORREGIDA

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' }, 
  { path: 'proyecto/:nombre', component: VistaProyectoDetalleComponent },
  { path: '**', redirectTo: '', pathMatch: 'full' } 
];
