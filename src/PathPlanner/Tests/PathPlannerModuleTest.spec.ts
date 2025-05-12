import { TestBed } from '@angular/core/testing';
import { PathPlannerModule } from '../PathPlannerModule';
import { PathPlannerView } from '../Views/PathPlannerView';

describe('PathPlannerModule', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PathPlannerModule],
    }).compileComponents();
  });

  it('Debe haberse creado la vista principal', () => {
    const fixture = TestBed.createComponent(PathPlannerView);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
