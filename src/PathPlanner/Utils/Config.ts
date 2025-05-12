import MapLib from 'leaflet';

export class Config {
  public name: string;
  public mapTileLayerUrlTemplate: string;
  public mapInitialLatLng: MapLib.LatLngExpression;
  public mapHeight: number;

  public static readonly minPathWeight: number = 1;
  public static readonly maxPathWeight: number = 10;
  public static readonly minLat: number = -90;
  public static readonly maxLat: number = 90;
  public static readonly minLng: number = -180;
  public static readonly maxLng: number = 180;

  constructor(
    config: Pick<
      Config,
      'name' | 'mapTileLayerUrlTemplate' | 'mapInitialLatLng' | 'mapHeight'
    >
  ) {
    this.name = config.name;
    this.mapTileLayerUrlTemplate = config.mapTileLayerUrlTemplate;
    this.mapInitialLatLng = config.mapInitialLatLng;
    this.mapHeight = config.mapHeight;
  }

  public getName(): string {
    return this.name;
  }

  public getMapTileLayerUrlTemplate(): string {
    return this.mapTileLayerUrlTemplate;
  }

  public getMapInitialLatLng(): MapLib.LatLngExpression {
    return this.mapInitialLatLng;
  }

  public getMapHeight(): number {
    return this.mapHeight;
  }
}
