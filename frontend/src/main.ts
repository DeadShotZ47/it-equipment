import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { AllCommunityModule, ModuleRegistry, ValidationModule } from 'ag-grid-community';

// Register all AG Grid Community modules globally
ModuleRegistry.registerModules([AllCommunityModule, ValidationModule]);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
