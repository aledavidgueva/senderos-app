import { TestBed } from '@angular/core/testing';
import {
  PATH_PLANNER_MODEL,
  PathPlannerModel,
} from '../Models/PathPlannerModel';
import { config } from '../config';
import { RendererFactory2 } from '@angular/core';
import { Config } from '../Utils/Config';
import { Location } from '../Utils/Location';
import MapLib from 'leaflet';
import * as TestUtils from '../Utils/Test';
import { Result } from '../Utils/Result';

describe('PathPlannerModel', () => {
  let model: PathPlannerModel | null = null;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: PATH_PLANNER_MODEL,
          useFactory: (rendererFactory: RendererFactory2) =>
            new PathPlannerModel(config, rendererFactory),
          deps: [RendererFactory2],
        },
      ],
    });

    model = TestBed.inject(PATH_PLANNER_MODEL);
  });

  it('debería haberse instanciado el modelo', () => {
    expect(model).toBeTruthy();
  });

  /**
   * Screens
   */

  it('la vista inicial debe ser <original>', () => {
    expect(model?.getScreen()).toBe('original');
  });

  it('debería cambiar la vista a <prim>', () => {
    model?.setScreen('prim');
    expect(model?.getScreen()).toBe('prim');
  });

  it('debería cambiar la vista a <kruskal>', () => {
    model?.setScreen('kruskal');
    expect(model?.getScreen()).toBe('kruskal');
  });

  it('debería cambiar la vista a <original>', () => {
    model?.setScreen('original');
    expect(model?.getScreen()).toBe('original');
  });

  /**
   * Config
   */

  it('debería obtener la config', () => {
    const config = model?.getConfig();
    expect(config).toBeInstanceOf(Config);
  });

  /**
   * Estaciones
   */

  it('debería agregar estaciones', () => {
    const testLocations = TestUtils.getRandomLocations(10);
    for (let i = 0; i < testLocations.length; i++) {
      model?.addLocation(
        testLocations[i]!,
        TestUtils.getRandomAdjacencyList(i),
      );
    }
    const locations = model?.getLocations();
    expect(locations).toEqual(testLocations);
  });

  it('debería lanzar excepción si una estación nueva tiene coordenadas inválidas', () => {
    const location = new Location('Test', new MapLib.LatLng(99999, 99999));
    expect(() => {
      model?.addLocation(location, TestUtils.getRandomAdjacencyList(1));
    }).toThrowError('Estación con coordenadas fuera de rango.');
  });

  it('debería lanzar excepción si una estación ya existe', () => {
    const testLocation = TestUtils.getRandomLocation();
    model?.addLocation(testLocation, TestUtils.getRandomAdjacencyList(0));
    expect(() => {
      model?.addLocation(testLocation, TestUtils.getRandomAdjacencyList(1));
    }).toThrowError('La estación ya existe.');
  });

  it('debería lanzar excepción si al intentar agregar una estación la lista de adyacencia no es válida', () => {
    model?.addLocation(
      TestUtils.getRandomLocation(),
      TestUtils.getRandomAdjacencyList(0),
    );
    expect(() => {
      model?.addLocation(TestUtils.getRandomLocation(), new Array(1).fill(-1));
    }).toThrowError('La lista de adyacencia contiene pesos fuera de rango.');
    expect(() => {
      model?.addLocation(
        TestUtils.getRandomLocation(),
        TestUtils.getRandomAdjacencyList(5),
      );
    }).toThrowError(
      'La lista de adyacencia no coincide con la cantidad de estaciones actuales.',
    );
  });

  it('debería verificar que una estación existe', () => {
    const testLocation = TestUtils.getRandomLocation();
    model?.addLocation(testLocation, new Array(0).fill(0));
    const exists = model?.locationExists(testLocation);
    expect(exists).toBe(true);
  });

  it('debería verificar que una estación no existe', () => {
    const testLocation1 = TestUtils.getRandomLocation();
    const testLocation2 = TestUtils.getRandomLocation();
    model?.addLocation(testLocation1, new Array(0).fill(0));
    const exists = model?.locationExists(testLocation2);
    expect(exists).toBe(false);
  });

  it('debería obtener una lista vacia de estaciones al inicio', () => {
    const locations = model?.getLocations();
    expect(locations).toEqual(new Array());
  });

  it('debería obtener una lista de estaciones según las estaciones agregadas', () => {
    const testLocations = TestUtils.getRandomLocations(10);
    for (let i = 0; i < testLocations.length; i++) {
      model?.addLocation(
        testLocations[i]!,
        TestUtils.getRandomAdjacencyList(i),
      );
    }
    const locations = model?.getLocations();
    expect(locations).toEqual(testLocations);
  });

  /**
   * Matriz de adyacencia original
   */

  it('debería obtener una matriz de adyacencia vacía al inicio', () => {
    const matrix = model?.getMatrix();
    expect(matrix).toEqual(new Array());
  });

  it('debería obtener una matriz de adyacencia según las estaciones agregadas', () => {
    const testLocations = TestUtils.getRandomLocations(
      TestUtils.testMatrix.length,
    );
    for (let i = 0; i < testLocations.length; i++) {
      const adjacency: Array<number> = TestUtils.testMatrix[i]!.slice(0, i);
      model?.addLocation(testLocations[i]!, adjacency);
    }
    const matrix = model?.getMatrix();
    expect(matrix).toEqual(TestUtils.testMatrix);
  });

  it('debería obtener nulo impacto ambiental si no hay estaciones', () => {
    const weight = (model as any)['calcWeight'](model?.getMatrix()); // es método privado
    expect(weight).toBe(0);
  });

  it('debería obtener el impacto ambiental total según una matriz dada', () => {
    const testLocations = TestUtils.getRandomLocations(
      TestUtils.testMatrix.length,
    );
    for (let i = 0; i < testLocations.length; i++) {
      const adjacency: Array<number> = TestUtils.testMatrix[i]!.slice(0, i);
      model?.addLocation(testLocations[i]!, adjacency);
    }
    const weight = (model as any)['calcWeight'](model?.getMatrix()); // es método privado
    expect(weight).toBe(TestUtils.testMatrixWeight);
  });

  /**
   * AGM Prim
   */

  it('debe lanzar excepción calcular AGM de Prim si no hay al menos dos estaciones', () => {
    expect(() => {
      model?.resolveWithPrim();
    }).toThrowError('No se cumple la cantidad de estaciones mínimas.');
    model?.addLocation(
      TestUtils.getRandomLocation(),
      TestUtils.getRandomAdjacencyList(0),
    );
    expect(() => {
      model?.resolveWithPrim();
    }).toThrowError('No se cumple la cantidad de estaciones mínimas.');
    model?.addLocation(
      TestUtils.getRandomLocation(),
      TestUtils.getRandomAdjacencyList(1),
    );
    const result = model?.resolveWithPrim();
    expect(result).toBeUndefined();
  });

  it('debe lanzar excepción calcular AGM de Prim si hay una estación no conexa', () => {
    model?.addLocation(
      TestUtils.getRandomLocation(),
      TestUtils.getRandomAdjacencyList(0),
    );
    model?.addLocation(
      TestUtils.getRandomLocation(),
      new Array(1).fill(0), // no conexa
    );
    expect(() => {
      model?.resolveWithPrim();
    }).toThrowError('El grafo no es conexo.');
  });

  it('debe calcular AGM de Prim a partir de dos estaciones, donde el grafo es conexo', () => {
    const testLocations = TestUtils.getRandomLocations(
      TestUtils.testMatrix.length,
    );
    for (let i = 0; i < testLocations.length; i++) {
      const adjacency: Array<number> = TestUtils.testMatrix[i]!.slice(0, i);
      model?.addLocation(testLocations[i]!, adjacency);
    }
    model?.resolveWithPrim();
    const result = model?.getPrimResult();
    expect(result).toBeInstanceOf(Result);
    expect(result?.getMatrix()).toEqual(TestUtils.testMatrixMst);
    expect(result?.getWeight()).toBe(TestUtils.testMatrixMstWeight);
  });

  it('debo obtener resultado nulo del cálculo del AGM de Prim si aún no se calculó', () => {
    const result = model?.getPrimResult();
    expect(result).toBe(null);
  });

  it('debo obtener resultado válido del cálculo del AGM de Prim luego de haberse realizado', () => {
    const testLocations = TestUtils.getRandomLocations(2);
    for (let i = 0; i < testLocations.length; i++) {
      model?.addLocation(
        testLocations[i]!,
        TestUtils.getRandomAdjacencyList(i),
      );
    }
    model?.resolveWithPrim();
    const result = model?.getPrimResult();
    expect(result).toBeInstanceOf(Result);
  });

  it('debo obtener resultado nulo del cálculo del AGM de Prim siempre luego de agregar estaciones', () => {
    const testLocations = TestUtils.getRandomLocations(2);
    for (let i = 0; i < testLocations.length; i++) {
      model?.addLocation(
        testLocations[i]!,
        TestUtils.getRandomAdjacencyList(i),
      );
    }
    model?.resolveWithPrim();
    model?.addLocation(
      TestUtils.getRandomLocation(),
      TestUtils.getRandomAdjacencyList(testLocations.length),
    );
    const result = model?.getPrimResult();
    expect(result).toBe(null);
  });

  /**
   * AGM Kruskal
   */

  it('debe lanzar excepción calcular AGM de Prim si no hay al menos dos estaciones', () => {
    expect(() => {
      model?.resolveWithKruskal();
    }).toThrowError('No se cumple la cantidad de estaciones mínimas.');
    model?.addLocation(
      TestUtils.getRandomLocation(),
      TestUtils.getRandomAdjacencyList(0),
    );
    expect(() => {
      model?.resolveWithKruskal();
    }).toThrowError('No se cumple la cantidad de estaciones mínimas.');
    model?.addLocation(
      TestUtils.getRandomLocation(),
      TestUtils.getRandomAdjacencyList(1),
    );
    const result = model?.resolveWithKruskal();
    expect(result).toBeUndefined();
  });

  it('debe lanzar excepción calcular AGM de Kruskal si hay una estación no conexa', () => {
    model?.addLocation(
      TestUtils.getRandomLocation(),
      TestUtils.getRandomAdjacencyList(0),
    );
    model?.addLocation(
      TestUtils.getRandomLocation(),
      new Array(1).fill(0), // no conexa
    );
    expect(() => {
      model?.resolveWithKruskal();
    }).toThrowError('El grafo no es conexo.');
  });

  it('debe calcular AGM de Kruskal a partir de dos estaciones, donde el grafo es conexo', () => {
    const testLocations = TestUtils.getRandomLocations(
      TestUtils.testMatrix.length,
    );
    for (let i = 0; i < testLocations.length; i++) {
      const adjacency: Array<number> = TestUtils.testMatrix[i]!.slice(0, i);
      model?.addLocation(testLocations[i]!, adjacency);
    }
    model?.resolveWithKruskal();
    const result = model?.getKruskalResult();
    expect(result).toBeInstanceOf(Result);
    expect(result?.getMatrix()).toEqual(TestUtils.testMatrixMst);
    expect(result?.getWeight()).toBe(TestUtils.testMatrixMstWeight);
  });

  it('debo obtener resultado nulo del cálculo del AGM de Kruskal si aún no se calculó', () => {
    const result = model?.getKruskalResult();
    expect(result).toBe(null);
  });

  it('debo obtener resultado válido del cálculo del AGM de Kruskal luego de haberse realizado', () => {
    const testLocations = TestUtils.getRandomLocations(2);
    for (let i = 0; i < testLocations.length; i++) {
      model?.addLocation(
        testLocations[i]!,
        TestUtils.getRandomAdjacencyList(i),
      );
    }
    model?.resolveWithKruskal();
    const result = model?.getKruskalResult();
    expect(result).toBeInstanceOf(Result);
  });

  it('debo obtener resultado nulo del cálculo del AGM de Kruskal siempre luego de agregar estaciones', () => {
    const testLocations = TestUtils.getRandomLocations(2);
    for (let i = 0; i < testLocations.length; i++) {
      model?.addLocation(
        testLocations[i]!,
        TestUtils.getRandomAdjacencyList(i),
      );
    }
    model?.resolveWithKruskal();
    model?.addLocation(
      TestUtils.getRandomLocation(),
      TestUtils.getRandomAdjacencyList(testLocations.length),
    );
    const result = model?.getKruskalResult();
    expect(result).toBe(null);
  });

  /**
   * Interoperabilidad
   */

  it('debe lanzar excepción si al importar texto este no cumple con un formato válido', () => {
    const text: string = 'asflkasdhflkashdflka';
    expect(() => {
      model?.import(text);
    }).toThrow();
  });

  it('debe importar texto como datos y exportar datos como texto', () => {
    model?.import(TestUtils.testJson);
    const newText = model?.export();
    expect(newText).toEqual(TestUtils.testJson);
  });

  /**
   * Observers
   */

  it('debería aceptar observadores', () => {
    const observer = new TestUtils.TestObserver();
    const result = model?.addObserver(observer);
    expect(result).toBeUndefined();
    expect((model as any)['observers'][0]).toBe(observer);
  });

  it('debería informar a observadores que la lista de estaciones cambió', () => {
    const observer = new TestUtils.TestObserver();
    model?.addObserver(observer);
    model?.addLocation(
      TestUtils.getRandomLocation(),
      TestUtils.getRandomAdjacencyList(0),
    );
    expect(observer.getNotifications()).toBe(2);
  });

  it('debería informar a observadores que la matriz AGM de Prim cambió', () => {
    const observer = new TestUtils.TestObserver();
    model?.addObserver(observer);
    model?.addLocation(
      TestUtils.getRandomLocation(),
      TestUtils.getRandomAdjacencyList(0),
    );
    model?.addLocation(
      TestUtils.getRandomLocation(),
      TestUtils.getRandomAdjacencyList(1),
    );
    model?.resolveWithPrim();
    expect(observer.getNotifications()).toBe(4);
  });

  it('debería informar a observadores que la matriz AGM de Kruskal cambió', () => {
    const observer = new TestUtils.TestObserver();
    model?.addObserver(observer);
    model?.addLocation(
      TestUtils.getRandomLocation(),
      TestUtils.getRandomAdjacencyList(0),
    );
    model?.addLocation(
      TestUtils.getRandomLocation(),
      TestUtils.getRandomAdjacencyList(1),
    );
    model?.resolveWithKruskal();
    expect(observer.getNotifications()).toBe(4);
  });

  it('debería remover observadores', () => {
    const observer = new TestUtils.TestObserver();
    model?.addObserver(observer);
    const result = model?.removeObserver(observer);
    expect(result).toBeUndefined();
    expect((model as any)['observers'].length).toBe(0);
  });
});
