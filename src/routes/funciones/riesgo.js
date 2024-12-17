const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const router = express.Router();
const pool = require('../../database');
const path = require('path')

const actividadRiesgo = JSON.parse(fs.readFileSync(path.join(__dirname, './actividad_riesgo.json' )));

// Función para calcular la edad
function calcularEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
}

// Función principal: matriz de riesgo
async function matriz(cliente) {
    let riesgo = 0;

    if (cliente['razon'] === 'Persona') {
        // Persona Física

        // Tipo de cliente
        if (cliente['tipoCliente'] === 'Persona Humana con actividad comercial') {
            riesgo += 6;
        } else {
            riesgo += 2;
        }

        // Edad del cliente
        const edad = calcularEdad(cliente['fechaNacimiento']);
        if (edad >= 18 && edad <= 25) {
            riesgo += 6;
        } else if (edad >= 26 && edad <= 55) {
            riesgo += 3;
        } else if (edad >= 56 && edad <= 75) {
            riesgo += 9;
        } else if (edad >= 76) {
            riesgo += 15;
        }

        // Persona expuesta políticamente (PEP)
        if (cliente['expuesta'] === 'SI') {
            riesgo += 10;
        } else {
            riesgo += 2;
        }

        // Actividad económica
        const actividad = cliente['actividadEconomica'];
        console.log('actividad',actividad)
        const nivelRiesgo = actividadRiesgo.find(item => item['Unnamed: 0'] === actividad);
        if (nivelRiesgo) {
            const riesgoActividad = parseInt(nivelRiesgo['Unnamed: 1']) * 4; // Multiplica por 4
            console.log('riesgoActividad', riesgoActividad);
            riesgo += riesgoActividad;
        } else {
            riesgo += 2; // Valor por defecto si no se encuentra la actividad
        }

    } else {
        // Persona Jurídica
       
    }

    
    return riesgo;
}

module.exports = { matriz };
