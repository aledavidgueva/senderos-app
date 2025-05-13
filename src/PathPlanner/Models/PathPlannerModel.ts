import { InjectionToken, Renderer2, RendererFactory2 } from '@angular/core';
import MapLib from 'leaflet';
import { Config } from '../Utils/Config';
import { Location } from '../Utils/Location';
import { IObserver } from '../Utils/IObserver';
import { IObservable } from '../Utils/IObservable';
import PrimAlgorithm from '../Utils/PrimAlg';
import KruskalAlgorithm from '../Utils/KruskalAlg';
import { Result } from '../Utils/Result';

export const PATH_PLANNER_MODEL = new InjectionToken<PathPlannerModel>(
  'PathPlannerModel',
);

export type GraphScreen = 'original' | 'prim' | 'kruskal';

export class PathPlannerModel implements IObservable {
  private config: Config;

  private observers: Array<IObserver>;

  private locations: Array<Location> = new Array();

  private matrix: Array<Array<number>> = new Array();

  private screen: GraphScreen = 'original';

  private primResult: Result | null = null;
  private kruskalResult: Result | null = null;

  constructor(config: Config, rendererFactory: RendererFactory2) {
    this.observers = new Array<IObserver>();
    this.config = config;
  }

  public getConfig(): Config {
    return this.config;
  }

  public getMatrix(): Array<Array<number>> {
    return this.matrix;
  }

  public getPrimResult(): Result | null {
    return this.primResult;
  }

  public getKruskalResult(): Result | null {
    return this.kruskalResult;
  }

  public getLocations(): Array<Location> {
    return this.locations;
  }

  public locationExists(location: Location): boolean {
    let exists = false;
    for (const item of this.locations) {
      exists = exists || item.isEquals(location);
    }
    return exists;
  }

  public addLocation(
    location: Location,
    adjacency: Array<number | null>,
  ): void {
    if (
      location.getLatitude() < Config.minLat ||
      location.getLatitude() > Config.maxLat ||
      location.getLongitude() < Config.minLng ||
      location.getLongitude() > Config.maxLng
    )
      throw new Error('Estación con coordenadas fuera de rango.');

    if (this.locationExists(location))
      throw new Error('La estación ya existe.');

    if (adjacency.length !== this.locations.length)
      throw new Error(
        'La lista de adyacencia no coincide con la cantidad de estaciones actuales.',
      );

    const newLocationIndex = this.locations.length;

    this.locations[newLocationIndex] = location;

    for (let i = 0; i < adjacency.length; i++) {
      const weight = adjacency[i] ?? 0;
      if (
        typeof weight === 'number' &&
        weight !== 0 &&
        (weight < Config.minPathWeight || weight > Config.maxPathWeight)
      )
        throw new Error(
          'La lista de adyacencia contiene pesos fuera de rango.',
        );
    }

    this.matrix[newLocationIndex] = new Array();
    this.matrix[newLocationIndex][newLocationIndex] = 0; // Diagonal cero

    for (let i = 0; i < adjacency.length; i++) {
      const weight = adjacency[i] ?? 0;
      this.matrix[i]![newLocationIndex] = weight;
      this.matrix[newLocationIndex][i] = weight;
    }

    this.primResult = null;
    this.kruskalResult = null;

    this.notifyObservers();
  }

  public setScreen(screen: GraphScreen): void {
    this.screen = screen;
    this.notifyObservers();
  }

  public getScreen(): GraphScreen {
    return this.screen;
  }

  public resolveWithPrim(): void {
    if (this.locations.length < 2)
      throw new Error('No se cumple la cantidad de estaciones mínimas.');
    try {
      // performance es global
      const start: number = performance.now();
      const matrix: Array<Array<number>> = PrimAlgorithm(this.matrix);
      const end: number = performance.now();
      const elapsed: number = end - start;
      this.primResult = new Result(matrix, elapsed, this.calcWeight(matrix));
      this.screen = 'prim';
      this.notifyObservers();
    } catch (err) {
      throw new Error('El grafo no es conexo.');
    }
  }

  public resolveWithKruskal(): void {
    if (this.locations.length < 2)
      throw new Error('No se cumple la cantidad de estaciones mínimas.');
    try {
      // performance es global
      const start: number = performance.now();
      const matrix: Array<Array<number>> = KruskalAlgorithm(this.matrix);
      const end: number = performance.now();
      const elapsed: number = end - start;
      this.kruskalResult = new Result(matrix, elapsed, this.calcWeight(matrix));
      this.screen = 'kruskal';
      this.notifyObservers();
    } catch (err) {
      throw new Error('El grafo no es conexo.');
    }
  }

  private calcWeight(matrix: Array<Array<number>>): number {
    let weight = 0;
    const n = matrix.length;

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        weight += matrix[i]![j]!;
      }
    }

    return weight / 2;
  }

  public import(data: string): void {
    const content = JSON.parse(data);
    this.validateUntypedObject(content);
    this.locations = content['locations'].map(
      (untyped: any) =>
        new Location(
          untyped['title'],
          new MapLib.LatLng(untyped['latLng']['lat'], untyped['latLng']['lng']),
        ),
    );
    this.matrix = content['matrix'];
    this.notifyObservers();
  }

  private validateUntypedObject(content: any): void {
    if (
      typeof content['locations'] !== 'object' ||
      !Array.isArray(content['locations'])
    )
      throw new Error('Validation failed: no locations found or invalid type.');

    // Validar locations
    for (let i = 0; i < content['locations'].length; i++) {
      const item = content['locations'][i];
      if (typeof item['title'] !== 'string')
        throw new Error(`Validation failed: location[${i}].title type error.`);
      if (typeof item['latLng'] !== 'object')
        throw new Error(`Validation failed: location[${i}].latLng type error.`);
      if (
        typeof item['latLng']['lat'] !== 'number' ||
        item['latLng']['lat'] < Config.minLat ||
        item['latLng']['lat'] > Config.maxLat
      )
        throw new Error(
          `Validation failed: location[${i}].latLng.lat type error.`,
        );
      if (
        typeof item['latLng']['lng'] !== 'number' ||
        item['latLng']['lng'] < Config.minLng ||
        item['latLng']['lng'] > Config.maxLng
      )
        throw new Error(
          `Validation failed: location[${i}].latLng.lng type error.`,
        );
    }

    // Validar matriz
    if (
      typeof content['matrix'] !== 'object' ||
      !Array.isArray(content['matrix'])
    )
      throw new Error('Validation failed: no matrix found or invalid type.');

    if (content['matrix'].length !== content['locations'].length)
      throw new Error(
        'Validation failed: matrix length is distinct to locations.',
      );

    for (let r = 0; r < content['matrix'].length; r++) {
      if (
        typeof content['matrix'][r] !== 'object' ||
        !Array.isArray(content['matrix'][r])
      )
        throw new Error(`Validation failed: matrix[${r}] type error.`);
      for (let c = 0; c < content['matrix'][r].length; c++) {
        if (
          typeof content['matrix'][r][c] !== 'number' ||
          (content['matrix'][r][c] !== 0 &&
            (content['matrix'][r][c] < Config.minPathWeight ||
              content['matrix'][r][c] > Config.maxPathWeight))
        )
          throw new Error(`Validation failed: matrix[${r}][${c}] type error.`);
      }
    }
  }

  public export(): string {
    return JSON.stringify({ locations: this.locations, matrix: this.matrix });
  }

  public addObserver(observer: IObserver): void {
    this.observers.push(observer);
    observer.notify();
    this.debug(`Observer ${observer.constructor.name} agregado.`);
  }

  public removeObserver(observer: IObserver): void {
    this.observers = this.observers.filter(
      (current: IObserver) => current !== observer,
    );
    this.debug(`Observer ${observer.constructor.name} removido.`);
  }

  private notifyObservers(): void {
    for (const observer of this.observers) {
      observer.notify();
      this.debug(`Observer ${observer.constructor.name} notificado.`);
    }
  }

  private debug(...message: string[]): void {
    console.debug(`[${this.constructor.name}]`, ...message);
  }
}
