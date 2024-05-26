
export function horaPrincipioFinDia(date:string, isEnd:boolean):string {
    // Crear una nueva fecha para la fecha de inicio del día
    let startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0); // Establecer a las 00:00:00.000 UTC
    if (isEnd) {
        startOfDay.setUTCHours(23, 59, 59, 150); // Establecer a las 23:59:59.999 UTC
    }
    return startOfDay.toISOString();
}

//Usar para labels de barras. Ej: 22 May
export function  formatDateToDayMonth(dateStr: string | number | Date) {
  // Crear un objeto Date a partir de la cadena de fecha
  const date = new Date(dateStr);

  // Opciones para formatear la fecha
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' };

  // Formatear la fecha con las opciones especificadas
  const formattedDate = date.toLocaleDateString('en-US', options);

  return formattedDate;
}

export function getPreviousDays(dateStr:string, isEnd:boolean, days:number):string {
    // Crear un objeto Date a partir de la cadena de fecha
    const date = new Date(dateStr);
  
    // Restar un día
    date.setDate(date.getDate() - days);
  
    // Setear la hora a 00:00:00
    date.setHours(0, 0, 0, 0);
  
    if (isEnd) {
        // Setear la hora a 00:00:00
        date.setHours(23, 59, 59, 150);
    }
    // Convertir a formato ISO
    const isoDate = date.toISOString();
  
    return isoDate;
  }