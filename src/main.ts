import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { PathPlannerModule } from './PathPlanner/PathPlannerModule';


platformBrowserDynamic()
  .bootstrapModule(PathPlannerModule)
  .catch((err) => console.error(err));
