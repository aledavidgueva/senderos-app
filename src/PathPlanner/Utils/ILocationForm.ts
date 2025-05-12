import { FormArray, FormControl } from '@angular/forms';

export interface ILocationForm {
  name: FormControl<string>;
  lat: FormControl<number>;
  lng: FormControl<number>;
  adjacency: FormArray<FormControl<number | null>>;
}
