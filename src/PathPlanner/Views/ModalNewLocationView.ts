import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  ViewChild,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Modal } from 'bootstrap';
import { ILocationForm } from '../Utils/ILocationForm';
import { Location } from '../Utils/Location';
import {
  PATH_PLANNER_CONTROLLER,
  PathPlannerController,
} from '../Controllers/PathPlannerController';
import { Config } from '../Utils/Config';
import { last } from 'rxjs';
import { latLng } from 'leaflet';

@Component({
  selector: 'app-modal-new-location',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
  templateUrl: './ModalNewLocationView.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class ModalNewLocationView {
  @ViewChild('modal') modalRef: ElementRef | null = null;

  @ViewChild('firstInput') firstInput: ElementRef | null = null;

  private modal: Modal | null = null;

  public formGroup: FormGroup<ILocationForm> | null = null;

  public minPathWeight: number = Config.minPathWeight;
  public maxPathWeight: number = Config.maxPathWeight;
  public minLat: number = Config.minLat;
  public maxLat: number = Config.maxLat;
  public minLng: number = Config.minLng;
  public maxLng: number = Config.maxLng;

  public locations: Array<string> = new Array();

  constructor(
    @Inject(PATH_PLANNER_CONTROLLER)
    private readonly pathPlanner: PathPlannerController,
    private readonly cdRef: ChangeDetectorRef
  ) {}

  public ngAfterViewInit(): void {
    this.modal = new Modal(this.modalRef?.nativeElement, {
      backdrop: 'static',
      focus: true,
      keyboard: false,
    });
  }

  public resetLocations(): void {
    const locations: Array<string> = new Array();
    for (const location of this.pathPlanner.getLocations()) {
      locations.push(location.getTitle());
    }
    this.locations = locations;
  }

  public resetForm(lat: number = 0, lng: number = 0): void {
    const adjacencyFormControls: Array<FormControl<number | null>> =
      new Array();
    for (let i = 0; i < this.locations.length; i++) {
      adjacencyFormControls.push(
        new FormControl<number | null>(null, {
          nonNullable: false,
          validators: [
            Validators.min(this.minPathWeight),
            Validators.max(this.maxPathWeight),
          ],
        })
      );
    }

    this.formGroup = new FormGroup<ILocationForm>({
      name: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(1)],
      }),
      lat: new FormControl<number>(lat, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(this.minLat),
          Validators.max(this.maxLat),
        ],
      }),
      lng: new FormControl<number>(lng, {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.min(this.minLng),
          Validators.max(this.maxLng),
        ],
      }),
      adjacency: new FormArray<FormControl<number | null>>(
        adjacencyFormControls
      ),
    });

    this.cdRef.markForCheck();
  }

  public validateAndSave(): void {
    this.formGroup?.markAllAsTouched();
    if (this.formGroup?.invalid) {
      alert(
        'Hay errores en el formulario. Por favor, verifique los valores ingresados.'
      );
      return;
    }
    const rawValue = this.formGroup?.getRawValue();
    if (!rawValue) throw new Error('Error al obtener valores del formulario.');

    if (this.pathPlanner.locationExists(rawValue.lat, rawValue.lng)) {
      alert('Ya existe una estación en la ubicación indicada.');
    } else {
      this.pathPlanner.addLocation(
        rawValue.name,
        rawValue.lat,
        rawValue.lng,
        rawValue.adjacency ?? []
      );
      this.hide();
    }
  }

  public show(lat: number = 0, lng: number = 0): void {
    this.resetLocations();
    this.resetForm(lat, lng);
    this.modal?.show();
    setTimeout(() => this.firstInput?.nativeElement.focus(), 500);
  }

  public hide(): void {
    this.modal?.hide();
  }
}
