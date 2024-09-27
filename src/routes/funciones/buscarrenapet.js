const axios = require('axios');
const cheerio = require('cheerio');

async function busquedarenapet(nombresArray) {
    try {
        // Realiza una solicitud GET para obtener el contenido de la página
        const url = 'https://repet.jus.gob.ar/';
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        // Convertir el contenido de la página en texto y dividirlo en líneas
        const pageText = $('body').text().toLowerCase(); // Convertir todo el texto a minúsculas
        const lines = pageText.split('\n').map(line => line.trim()).filter(line => line.length > 0);

        // Para almacenar resultados de cada nombre
        const allResults = [];

        // Iterar sobre cada objeto en el array de nombres
        for (const obj of nombresArray) {
            const Nombre = obj?.Nombre; // Verificar si el campo Nombre existe

            // Si no existe el Nombre o no es una cadena, continuar con el siguiente objeto
            if (!Nombre || typeof Nombre !== 'string') {
                console.warn('Nombre no válido:', Nombre);
                continue;
            }

            // Convertir el nombre a minúsculas y separar las palabras por espacios
            const nameParts = Nombre.toLowerCase().split(' ').map(word => word.trim()).filter(word => word.length > 0);
            const matchedLines = [];

            // Buscar cada palabra del nombre en las líneas de la página
            lines.forEach(line => {
                let matchFound = false;

                // Verificar si al menos una palabra del nombre aparece en la línea
                nameParts.forEach(word => {
                    if (line.includes(word)) {
                        matchFound = true;
                    }
                });

                // Si se encontró al menos una coincidencia, agregar la línea
                if (matchFound) {
                    matchedLines.push(line);
                }
            });

            // Guardar resultados por nombre si hay coincidencias
            if (matchedLines.length > 0) {
                allResults.push({
                    Nombre,
                    coincidencias: matchedLines,
                });
            }
        }

        // Mostrar el total y los nombres con coincidencias
        if (allResults.length > 0) {
            console.log(`Total de nombres con coincidencias: ${allResults.length}`);
            console.log('Nombres que coinciden:');
            allResults.forEach(result => {
                console.log(`Nombre original: ${result.Nombre}`);
                console.log("Coincidencias:");
                result.coincidencias.forEach(line => {
                    console.log(`- ${line}`);
                });
                console.log('\n'); // Salto de línea entre cada nombre y sus coincidencias
            });
        } else {
            console.log('No se encontraron coincidencias para ninguno de los nombres.');
        }

        // Retornar solo los nombres con coincidencias y las líneas
        return allResults;
    } catch (error) {
        console.error('Error al buscar los nombres en la página:', error);
        return null;
    }
}


module.exports = { busquedarenapet };

