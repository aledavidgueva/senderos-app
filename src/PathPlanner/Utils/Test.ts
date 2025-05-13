import { Config } from './Config';
import MapLib from 'leaflet';
import { Location } from './Location';
import { IObserver } from './IObserver';

export function getRandomLat(): number {
  return Number(
    (Math.random() * (Config.maxLat - Config.minLat) + Config.minLat).toFixed(
      8,
    ),
  );
}

export function getRandomLnt(): number {
  return Number(
    (Math.random() * (Config.maxLng - Config.minLng) + Config.minLng).toFixed(
      8,
    ),
  );
}

export function getRandomLatLnt(): MapLib.LatLng {
  return new MapLib.LatLng(getRandomLat(), getRandomLnt());
}

export function getRandomLocation(): Location {
  return new Location('Test', getRandomLatLnt());
}

export function getRandomLocations(count: number): Array<Location> {
  const locations: Array<Location> = new Array();
  for (let i = 0; i < count; i++) {
    locations.push(getRandomLocation());
  }
  return locations;
}

export function getRandomAdjacencyList(count: number): Array<number> {
  const adjacencyList: Array<number> = new Array();
  for (let j = 0; j < count; j++) {
    adjacencyList.push(
      Math.random() > 0.7
        ? Math.floor(Math.random() * Config.maxPathWeight) + 1
        : 0,
    );
  }
  // Aseguro que al menos esté conectado a otro
  if (count > 0) {
    adjacencyList[Math.floor(Math.random() * count)] =
      Math.floor(Math.random() * Config.maxPathWeight) + 1;
  }
  return adjacencyList;
}

export class TestObserver implements IObserver {
  private notifications: number = 0;
  notify(): void {
    this.notifications++;
  }
  public getNotifications(): number {
    return this.notifications;
  }
}

export const testMatrix = [
  [0, 1, 2, 3, 4, 5],
  [1, 0, 5, 4, 3, 2],
  [2, 5, 0, 5, 2, 0],
  [3, 4, 5, 0, 1, 2],
  [4, 3, 2, 1, 0, 5],
  [5, 2, 0, 2, 5, 0],
];

export const testMatrixWeight = 44;

export const testMatrixMst = [
  [0, 1, 2, 0, 0, 0],
  [1, 0, 0, 0, 0, 2],
  [2, 0, 0, 0, 2, 0],
  [0, 0, 0, 0, 1, 0],
  [0, 0, 2, 1, 0, 0],
  [0, 2, 0, 0, 0, 0],
];

export const testMatrixMstWeight = 8;

export const testJson: string =
  '{"locations":[{"title":"Random 0","latLng":{"lat":-29.73195574,"lng":-63.32212486}},{"title":"Random 1","latLng":{"lat":-29.20977975,"lng":-67.5879138}},{"title":"Random 2","latLng":{"lat":-33.72631145,"lng":-59.74822876}},{"title":"Random 3","latLng":{"lat":-34.1770248,"lng":-62.1174668}},{"title":"Random 4","latLng":{"lat":-31.8744267,"lng":-62.70797564}},{"title":"Random 5","latLng":{"lat":-33.12323857,"lng":-65.92920604}},{"title":"Random 6","latLng":{"lat":-35.61736752,"lng":-60.84718284}},{"title":"Random 7","latLng":{"lat":-29.67761938,"lng":-65.88516379}},{"title":"Random 8","latLng":{"lat":-28.71132652,"lng":-58.74923617}},{"title":"Random 9","latLng":{"lat":-29.19719094,"lng":-64.93323202}}],"matrix":[[0,8,9,5,0,0,0,0,8,0],[8,0,2,5,0,0,4,0,0,8],[9,2,0,10,9,9,5,0,9,3],[5,5,10,0,0,2,0,0,6,0],[0,0,9,0,0,3,8,8,9,4],[0,0,9,2,3,0,10,3,7,0],[0,4,5,0,8,10,0,0,0,8],[0,0,0,0,8,3,0,0,0,0],[8,0,9,6,9,7,0,0,0,4],[0,8,3,0,4,0,8,0,4,0]]}';
