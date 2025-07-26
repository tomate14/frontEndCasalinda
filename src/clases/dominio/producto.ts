export interface Producto {
    id?:number;
    nombre: string;
    codigoBarra: string;
    precioVenta?:number;
    precioCompra?:number;
    idProveedor:number;
    stock:number;
    nombreProveedor?:string;
    precio?:number;
}