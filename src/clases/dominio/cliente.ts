export interface Cliente {
    nombre: string;
    dni: number;
    fechaNacimiento: string;
    direccion: string;
    telefono: string;
    email: string;
    cuit: string;
    fechaAlta: string;
    esDeudor?:boolean;
    tipoUsuario?:number;
    porcentajeRemarcar?:number;
}