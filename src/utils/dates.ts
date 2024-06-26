
import { DateTime } from 'luxon';

export function nowConLuxonATimezoneArgentina():string {
    // Obtener la hora actual
    let fechaActual = DateTime.now();

    // Convertir la hora actual al huso horario de Argentina
    let fechaArgentina = fechaActual.setZone('America/Argentina/Buenos_Aires');

    // Obtener la fecha en formato ISO 8601
    let fechaArgentinaISO = fechaArgentina.toISO();

    if (fechaArgentinaISO === null) {
        throw new Error('Failed to convert date to ISO string');
    }

    return fechaArgentinaISO;
}

export function transformarAHoraArgentinaISO(date:string) {
    // Crear un objeto DateTime a partir de la cadena de fecha en la zona horaria de Argentina
    let dateTime = DateTime.fromISO(date, { zone: 'America/Argentina/Buenos_Aires' });

    const isoDate = dateTime.toISO();

    if (isoDate === null) {
        throw new Error('Failed to convert date to ISO string');
    }

    return isoDate;
}
export function horaPrincipioFinDia(date: string, isEnd: boolean): string {
    // Crear un objeto DateTime a partir de la cadena de fecha en la zona horaria de Argentina
    let dateTime = DateTime.fromISO(date, { zone: 'America/Argentina/Buenos_Aires' });

    dateTime = dateTime.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    if (isEnd) {
        // Establecer a las 23:59:59.150 en la zona horaria de Argentina
        dateTime = dateTime.set({ hour: 23, minute: 59, second: 59, millisecond: 995 });
    } 

    const isoDate = dateTime.toISO();

    if (isoDate === null) {
        throw new Error('Failed to convert date to ISO string');
    }

    return isoDate;
}

//Usar para labels de barras. Ej: 22 May
export function formatDateToDayMonth(dateStr: string | number | Date): string {
    // Crear un objeto DateTime a partir de la cadena de fecha, número o instancia de Date
    let date = DateTime.fromJSDate(new Date(dateStr), { zone: 'America/Argentina/Buenos_Aires' });
  
    // Formatear la fecha con las opciones especificadas
    const formattedDate = date.toFormat('dd LLL yy');
  
    return formattedDate;
}

//Usar para labels de barras. Ej: 22 May
export function formatearFechaDesdeUnIso(fechaISO: string, format:string): string {
    // Parsear la fecha utilizando Luxon
    const fechaLuxon = DateTime.fromISO(fechaISO);

    // Obtener la fecha en formato deseado (YYYY-MM-DD)
    return fechaLuxon.toFormat(format);
}

export function getPreviousDays(dateStr: string, isEnd: boolean, days: number): string {
    // Crear un objeto DateTime a partir de la cadena de fecha
    let date = DateTime.fromISO(dateStr, { zone: 'America/Argentina/Buenos_Aires' });

    date = date.minus({ days: days });

    if (isEnd) {
        // Setear la hora a 23:59:59.150
        date = date.set({ hour: 23, minute: 59, second: 59, millisecond: 995 });
    } else {
        // Setear la hora a 00:00:00.000
        date = date.set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
    }

    // Convertir a formato ISO y asegurarse que está en UTC
    const isoDate = date.toISO();

    if (isoDate === null) {
        throw new Error('Failed to convert date to ISO string');
    }

    return isoDate;
}

export function diferenciaDias(fechaMenor:string, fechaMayor:string) {
    // Convertir las fechas a objetos DateTime
    const dt1 = DateTime.fromISO(fechaMenor, { zone: 'America/Argentina/Buenos_Aires' });
    const dt2 = DateTime.fromISO(fechaMayor, { zone: 'America/Argentina/Buenos_Aires' });

    // Calcular la diferencia en días
    const diffDays = dt1.diff(dt2, 'days').days;

    return Math.floor(Math.abs(diffDays)); // Devolver el valor absoluto de la diferencia en días
}

export function generarFechasFromMonthPicker(fechaDesde: string, fechaHasta: string) {
    const inicio = DateTime.fromFormat(fechaDesde, "yyyy-MM", { zone: 'America/Argentina/Buenos_Aires' });
    const fin = DateTime.fromFormat(fechaHasta, "yyyy-MM", { zone: 'America/Argentina/Buenos_Aires' });
    return { 
        fechaDesde: inicio.startOf('month').toISO(),
        fechaHasta: fin.endOf('month').toISO()
    }
  }