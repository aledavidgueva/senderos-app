import { TestBed } from '@angular/core/testing';
import {
  PATH_PLANNER_MODEL,
  PathPlannerModel,
} from '../Models/PathPlannerModel';
import { PathPlannerModule } from '../PathPlannerModule';
import { config } from '../config';

describe('PathPlannerModel', () => {
  let model: PathPlannerModel | null = null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: PATH_PLANNER_MODEL,
          useFactory: () => new PathPlannerModel(config),
        },
      ],
    });

    model = TestBed.inject(PATH_PLANNER_MODEL);
  });

  it('debería haberse instanciado el modelo', () => {
    expect(model).toBeTruthy();
  });

  it('debería retornar multiplicaciones válidas', () => {
    expect(model?.multiplicar(5, 0)).toBe(0);
    expect(model?.multiplicar(0, 5)).toBe(0);
    expect(model?.multiplicar(-3, 4)).toBe(-12);
    expect(model?.multiplicar(3, -4)).toBe(-12);
    expect(model?.multiplicar(-3, -4)).toBe(12);
  });
});
