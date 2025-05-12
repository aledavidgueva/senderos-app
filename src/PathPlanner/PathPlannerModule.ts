import { NgModule, Renderer2, RendererFactory2 } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { config } from './config';
import {
  PATH_PLANNER_MODEL,
  PathPlannerModel,
} from './Models/PathPlannerModel';
import { PathPlannerView } from './Views/PathPlannerView';
import { MapView } from './Views/MapView';
import { ModalNewLocationView } from './Views/ModalNewLocationView';
import {
  PATH_PLANNER_CONTROLLER,
  PathPlannerController,
} from './Controllers/PathPlannerController';

@NgModule({
  declarations: [PathPlannerView, MapView, ModalNewLocationView],
  imports: [BrowserModule, FormsModule, ReactiveFormsModule],
  providers: [
    {
      provide: PATH_PLANNER_MODEL,
      useFactory: (rendererFactory: RendererFactory2) =>
        new PathPlannerModel(config, rendererFactory),
      deps: [RendererFactory2],
    },
    {
      provide: PATH_PLANNER_CONTROLLER,
      useFactory: (pathPlanner: PathPlannerModel) => {
        return new PathPlannerController(pathPlanner);
      },
      deps: [PATH_PLANNER_MODEL],
    },
  ],

  bootstrap: [PathPlannerView],
})
export class PathPlannerModule {}
