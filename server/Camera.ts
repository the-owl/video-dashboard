export type CameraId = string;

export interface CameraInitOptions {
  backend: string;
  id: string;
  name: string;
}

export class Camera {
  public backend: string;
  public error: string | null = null;
  public id: CameraId;
  public lastUpdated: Date | null = null;
  public lastSuccessfulUpdate: Date | null = null;
  public name: string;
  public updating: boolean = false;

  public failureCounter: number = 0;

  constructor ({ backend, id, name }: CameraInitOptions) {
    this.backend = backend;
    this.name = name;
    this.id = id;
  }
}
