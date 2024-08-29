const axios = require('axios');
const cheerio = require('cheerio');

async function busquedarenapet(name) {
    try {
        // Realiza una solicitud GET para obtener la página inicial
        const url = 'https://repet.jus.gob.ar/';
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        // Obtener el token CSRF, si es necesario
        const csrfToken = $('input[name="csrf_token"]').val();

        // Simular el envío del formulario
        const searchUrl = 'https://repet.jus.gob.ar/'; // URL de búsqueda (ejemplo)
        const searchResponse = await axios.post(searchUrl, {
            name: name, // Parámetros de búsqueda
            csrf_token: csrfToken,
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const searchHtml = searchResponse.data;
        const $result = cheerio.load(searchHtml);

        let resultado = $result('.resultado').text().trim(); // Ajustar selector según la página

        return resultado ? resultado : 'No se encontró el nombre o no está en la lista';
    } catch (error) {
        console.error('Error al buscar el nombre:', error);
        return null;
    }
}

module.exports = { busquedarenapet };
