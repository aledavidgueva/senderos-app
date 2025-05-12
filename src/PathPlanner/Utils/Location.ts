import MapLib from 'leaflet';

export class Location {
  private title: string;
  private latLng: MapLib.LatLng;

  constructor(title: string, latLng: MapLib.LatLng) {
    this.title = title;
    this.latLng = latLng;
  }

  public getTitle(): string {
    return this.title;
  }

  public getLatLng(): MapLib.LatLng {
    return this.latLng;
  }

  public getLatitude(): number {
    return this.latLng.lat;
  }

  public getLongitude(): number {
    return this.latLng.lng;
  }

  public isEquals(location: Location): boolean {
    return (
      this.getLatitude() === location.getLatitude() &&
      this.getLongitude() === location.getLongitude()
    );
  }
}
