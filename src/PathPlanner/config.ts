import { Config } from './Utils/Config';

export const config = new Config({
  name: 'Parque nacional',
  mapTileLayerUrlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  mapInitialLatLng: [-34.52196155654428, -58.70021882873647],
  mapHeight: 500,
});
