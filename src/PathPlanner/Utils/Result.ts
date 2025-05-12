export class Result {
  private matrix: Array<Array<number>>;
  private time: number;
  private weight: number;

  constructor(matrix: Array<Array<number>>, time: number, weight: number) {
    this.matrix = matrix;
    this.time = time;
    this.weight = weight;
  }

  public getMatrix(): Array<Array<number>> {
    return this.matrix;
  }

  public getTime(): number {
    return this.time;
  }

  public getWeight(): number {
    return this.weight;
  }
}
