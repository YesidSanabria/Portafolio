    import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
    import { provideRouter } from '@angular/router'; // Importa provideRouter
    import { provideHttpClient, withFetch } from '@angular/common/http';
    import { routes } from './app.routes'; // Importa tus rutas

    export const appConfig: ApplicationConfig = {
      providers: [
        provideZoneChangeDetection({ eventCoalescing: true }),
        provideRouter(routes), // Configura el enrutador con tus rutas
        provideHttpClient(withFetch())
      ]
    };
    