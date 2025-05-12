import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  Inject,
  Renderer2,
  ChangeDetectorRef,
  OnDestroy,
  OnInit,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import MapLib from 'leaflet';
import { Location } from '../Utils/Location';
import {
  PATH_PLANNER_CONTROLLER,
  PathPlannerController,
} from '../Controllers/PathPlannerController';
import { Result } from '../Utils/Result';
import { GraphScreen } from '../Models/PathPlannerModel';

@Component({
  selector: 'app-map',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
  template: ``,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class MapView implements OnInit, OnDestroy {
  private mapElement: HTMLElement | null = null;

  private map: MapLib.Map | null = null;

  private markerGroup: MapLib.FeatureGroup<MapLib.Marker> =
    MapLib.featureGroup();

  private polygonGroup: MapLib.FeatureGroup<MapLib.Polygon> =
    MapLib.featureGroup();

  @Output()
  onMapClick: EventEmitter<MapLib.LatLng> = new EventEmitter<MapLib.LatLng>();

  constructor(
    @Inject(PATH_PLANNER_CONTROLLER)
    private readonly pathPlanner: PathPlannerController,
    private readonly elRef: ElementRef,
    private readonly renderer: Renderer2,
    private readonly cdRef: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.pathPlanner.addObserver(this);
    this.initMap();
  }

  public ngOnDestroy(): void {
    this.pathPlanner.removeObserver(this);
  }

  private initMap(): void {
    this.mapElement = this.renderer.createElement('div');
    if (!this.mapElement)
      throw new Error('Falló la creación del elemento para el mapa.');
    this.mapElement.style.height = this.pathPlanner.getMapHeight();
    this.map = MapLib.map(this.mapElement);
    this.renderer.appendChild(this.elRef.nativeElement, this.mapElement);
    MapLib.tileLayer(this.pathPlanner.getMapTileLayerUrlTemplate()).addTo(
      this.map
    );
    this.markerGroup.addTo(this.map);
    this.polygonGroup.addTo(this.map);
    this.setOnClickEvent();
    this.centerMap();
    this.updateView();
  }

  private setOnClickEvent(): void {
    this.map?.on('click', (e: MapLib.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      if (!this.pathPlanner.locationExists(lat, lng)) {
        this.onMapClick.emit(new MapLib.LatLng(lat, lng));
      }
    });
  }

  private redrawPolygons(
    locations: Array<Location>,
    matrix: Array<Array<number>>
  ): void {
    this.polygonGroup.clearLayers();
    if (!locations.length) return;

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r]!.length; c++) {
        const weight = matrix[r]![c]!;
        if (weight > 0) {
          this.polygonGroup.addLayer(
            MapLib.polyline(
              [locations[r]!.getLatLng(), locations[c]!.getLatLng()],
              {
                color: this.pathPlanner.getColorOfWeight(weight),
                weight: 6,
                opacity: 0.5,
              }
            ).bindTooltip(`${weight}`, { permanent: true })
          );
        }
      }
    }
  }

  private redrawMarkers(locations: Array<Location>): void {
    this.markerGroup.clearLayers();
    for (const location of locations) {
      this.markerGroup.addLayer(
        MapLib.marker(location.getLatLng()).bindTooltip(location.getTitle(), {
          permanent: true,
          direction: 'auto',
        })
      );
    }
  }

  private centerMap(): void {
    const locations = this.pathPlanner.getLocations();
    const bounds: MapLib.LatLngBounds =
      locations.length === 0
        ? MapLib.latLngBounds(new Array(this.pathPlanner.getMapInitialLatLng()))
        : MapLib.latLngBounds(
            locations.map((location) => location.getLatLng())
          );

    this.map?.fitBounds(bounds, {
      padding: [50, 50],
    });
  }

  private updateView(): void {
    const locations: Array<Location> = this.pathPlanner.getLocations();
    const matrix: Array<Array<number>> = this.getMatrix();
    this.redrawMarkers(locations);
    this.redrawPolygons(locations, matrix);
    this.centerMap();
    this.cdRef.markForCheck();
  }

  private getMatrix(): Array<Array<number>> {
    const screen: GraphScreen = this.pathPlanner.getScreen();
    let result: Result | null = null;
    switch (screen) {
      case 'original':
        return this.pathPlanner.getMatrix();
      case 'prim':
        result = this.pathPlanner.getPrimResult();
        return result ? result.getMatrix() : new Array();
      case 'kruskal':
        result = this.pathPlanner.getKruskalResult();
        return result ? result.getMatrix() : new Array();
    }
  }

  public notify(): void {
    this.updateView();
    this.debug('Notified.');
  }

  private debug(...message: string[]): void {
    console.debug(`[${this.constructor.name}]`, ...message);
  }
}
