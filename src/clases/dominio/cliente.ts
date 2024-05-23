export interface Cliente {
    _id?: {
      $oid: string;
    };
    nombre: string;
    dni: number;
    fechaNacimiento: string;
    direccion: string;
    telefono: string;
    email: string;
    cuit: string;
    fechaAlta: Date;
}