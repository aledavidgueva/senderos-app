import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { IObserver } from '../Utils/IObserver';
import {
  PATH_PLANNER_CONTROLLER,
  PathPlannerController,
} from '../Controllers/PathPlannerController';
import { Result } from '../Utils/Result';
import { GraphScreen } from '../Models/PathPlannerModel';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
  template: `<h1>Planificador de senderos</h1>

    <div class="my-3">
      <button
        class="btn btn-primary"
        (click)="modalNewLocation.show()"
        [disabled]="loading || screen !== 'original'"
      >
        Nueva estación
      </button>
      <button
        class="btn btn-secondary ms-3"
        (click)="exportData()"
        [disabled]="loading || screen !== 'original'"
      >
        Exportar data
      </button>
      <input
        #inputFile
        style="display: none"
        type="file"
        accept=".json"
        (change)="importData($event)"
      />
      <button
        class="btn btn-secondary ms-3"
        (click)="importDataConfirm(inputFile)"
        [disabled]="loading || screen !== 'original'"
      >
        Importar data
      </button>
      <button
        class="btn btn-info ms-3"
        (click)="viewOriginal()"
        [disabled]="screen === 'original'"
      >
        Ver grafo original
      </button>
      <button
        class="btn btn-warning ms-3"
        [disabled]="loading || locationsLength < 2"
        (click)="calcPrim()"
      >
        Calcular AGM con Alg. de Prim
      </button>
      <button
        class="btn btn-warning ms-3"
        [disabled]="loading || locationsLength < 2"
        (click)="calcKruskal()"
      >
        Calcular AGM con Alg. de Kruskal
      </button>
    </div>

    <app-map
      (onMapClick)="
        !loading ? modalNewLocation.show($event.lat, $event.lng) : null
      "
    ></app-map>

    <app-modal-new-location #modalNewLocation></app-modal-new-location>

    <div *ngIf="loading" class="loader"></div> `,
  styles: [
    `
      :host {
        display: block;
      }

      .loader {
        display: block;
        height: 100vh;
        width: 100vw;
        background-color: rgba(0, 0, 0, 0.5);
        background-image: url('/assets/loader.gif');
        background-repeat: no-repeat;
        background-size: 40px;
        background-position: center center;
        position: fixed;
        left: 0;
        top: 0;
        z-index: 1000;
      }
    `,
  ],
})
export class PathPlannerView implements IObserver, OnInit, OnDestroy {
  public loading: boolean = false;

  public screen: GraphScreen = 'original';

  public locationsLength: number = 0;

  constructor(
    @Inject(PATH_PLANNER_CONTROLLER)
    private readonly pathPlanner: PathPlannerController,
    private readonly cdRef: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.pathPlanner.addObserver(this);
  }

  public ngOnDestroy(): void {
    this.pathPlanner.removeObserver(this);
  }

  public importDataConfirm(el: HTMLElement): void {
    if (
      confirm(
        'Esto eliminará lo cargado hasta el momento en favor de lo importado. ¿Seguro/a de continuar?'
      )
    )
      el.click();
  }

  public importData(event: any): void {
    const file = event?.target?.files[0] ?? null;
    if (file) {
      // leer como texto
      const reader = new FileReader();
      reader.onload = (e) => {
        const contenido = e.target?.result;
        if (contenido) {
          try {
            this.pathPlanner.importData(contenido?.toString());
          } catch (err) {
            console.error(err);
            alert('El formato del contenido del archivo no es válido.');
          }
        }
      };
      reader.onerror = (e) =>
        alert('No se pudo leer el contenido del archivo.');
      reader.readAsText(file);
    }
  }

  public exportData(): void {
    const jsonString: string = this.pathPlanner.exportData();
    const blob: Blob = new Blob([jsonString], { type: 'application/json' });
    const url: string = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  public viewOriginal(): void {
    this.pathPlanner.setScreen('original');
  }

  public calcPrim(): void {
    this.setLoading(true);
    this.pathPlanner.resolveWithPrim();
    this.setLoading(false);
  }

  public calcKruskal(): void {
    this.setLoading(true);
    this.pathPlanner.resolveWithKruskal();
    this.setLoading(false);
  }

  public setLoading(loading: boolean): void {
    this.loading = loading;
    this.cdRef.markForCheck();
  }

  public notify(): void {
    this.locationsLength = this.pathPlanner.getLocations().length;
    this.screen = this.pathPlanner.getScreen();

    if (this.screen === 'prim') {
      const result: Result | null = this.pathPlanner.getPrimResult();
      if (result) {
        alert(
          `El algorítmo de Prim demoró ${result.getTime()}ms. El impacto ambiental es de ${result.getWeight()}.`
        );
      }
    }

    if (this.screen === 'kruskal') {
      const result: Result | null = this.pathPlanner.getKruskalResult();
      if (result) {
        alert(
          `El algorítmo de Kruskal demoró ${result.getTime()}ms. El impacto ambiental es de ${result.getWeight()}.`
        );
      }
    }

    this.cdRef.markForCheck();
    this.debug('Notified.');
  }

  private debug(...message: string[]): void {
    console.debug(`[${this.constructor.name}]`, ...message);
  }
}
