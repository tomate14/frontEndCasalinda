export interface Cliente {
    id?:string;
    nombre: string;
    dni: number;
    fechaNacimiento: string;
    direccion: string;
    telefono: string;
    email: string;
    cuit: string;
    fechaAlta: string;
    esDeudor?:boolean;
}