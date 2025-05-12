import { Config } from './Utils/Config';

export const config = new Config({
  name: 'Parque nacional',
  mapTileLayerUrlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  mapInitialLatLng: [-34.5230974, -58.7030525],
  mapHeight: 500,
});
