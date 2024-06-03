export interface EstadoEnvio {
    value: number;
    viewValue?: string;
}

export const estadoDeEnvio = [
    {value: 1, viewValue: 'No enviado'},
    {value: 2, viewValue: 'En Produccion'},
    {value: 3, viewValue: 'Enviado'},
    {value: 4, viewValue: 'Terminado'}
  ];