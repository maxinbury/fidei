const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');
const router = express.Router();
const pool = require('../../database');
const path = require('path')

const actividadRiesgo = JSON.parse(fs.readFileSync(path.join(__dirname, './actividad_riesgo.json')));

const cpriesgo = JSON.parse(fs.readFileSync(path.join(__dirname, './codigop.json')));

const nacionalidadriesgo = JSON.parse(fs.readFileSync(path.join(__dirname, './nacionalidad.json')));
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

const riesgoPorTipo = {
    "Consorcios de Propietarios": 3,
    "Sociedad Anónima": 3,
    "Sociedad de Hecho": 3,
    "Sociedad de Responsabilidad Limitada": 3,
    "Sociedad en comandita por acciones": 3,
    "Sociedad en comandita Simple": 3,
    "Sociedad Irregular": 3,
    "Sociedad Unipersonal": 3,
    "Sociedades cooperativas de trabajo": 3,
    "Sociedades de garantía recíproca (SGR)": 3,
    "Asociaciones Civiles": 5,
    "Cooperativas": 5,
    "Embajadas": 5,
    "Entidades sindicales": 5,
    "Fideicomisos": 5,
    "Fundación": 5,
    "Mutuales": 5,
    "Organizaciones sin fines de lucro - Otros": 5,
    "Sociedad Anónima Simplificada": 5,
    "Entes Autarquicos": 5,
    "La Iglesia Católica": 5,
    "SAPEM (participación estatal mayoritaria)": 5,
    "Sector Público Nacional, Provincial o Municipal": 5
};

const riesgoAntiguedad = {
    "Mayor a 21 años": 1,
    "Entre 11 y 20 años": 2,
    "Entre 6 y 10 años": 3,
    "Entre 2 y 5 años": 4,
    "Menor o igual a 1 años": 5
};

// Función principal: matriz de riesgo
async function matriz(cliente) {

    let riesgo = 0;
    if (cliente['pep_extranjero'] === 'Si' || cliente['categoria_especial'] === 'Si') {
       // console.log('Cliente con riesgo alto (PEP o categoría especial)');
        riesgo=100
        return riesgo; // Devuelve un riesgo de 100
    }
  
    if (cliente['razon'] == 'Persona') {
        // Persona Física

        // Tipo de cliente
        if (cliente['tipoCliente'] == 'Persona Humana con Actividad Comercial') {
            riesgo += 6;
           // console.log('Persona Humana con actividad',6)
        } else {
            riesgo += 2;
           // console.log('Persona Humana con actividad',2)
        }

        // Edad del cliente
        const edad = calcularEdad(cliente['fechaNacimiento']);
       // 
      
        if (edad >= 18 && edad <= 25) {
            riesgo += 6;
           // console.log('riesgo edad',6)
        } else if (edad >= 26 && edad <= 55) {
            riesgo += 3;
           // console.log('riesgo edad',3)
        } else if (edad >= 56 && edad <= 75) {
            riesgo += 9;
           // console.log('riesgo edad',9)
        } else if (edad >= 76) {
            riesgo += 15;
           // console.log('riesgo edad',15)
        }


         //// volument transaccional persona
         try {
            const volumen = cliente['volumenTransaccional'];

            if (volumen >= 0 && volumen <= 15000000) {
                riesgo += 4;
               // console.log('volumen riesgo 1',4);
            } else if (volumen > 15000000 && volumen <= 30000000) {
                riesgo += 8;
               // console.log('volumen riesgo 2',8);
            } else if (volumen > 30000000 && volumen <= 45000000) {
                riesgo += 12;
               // console.log('volumen riesgo 3',12);
            } else if (volumen > 45000000 && volumen <= 60000000) {
                riesgo += 16;
               // console.log('volumen riesgo 4',16);
            } else if (volumen > 60000000) {
                riesgo += 20;
               // console.log('volumen riesgo 5',20);
            } else {
               // console.log('No se encuentra', volumen);
            }
            
        } catch (error) {
           // console.log(error)
        }

    } else {
        // Persona Jurídica
        if (riesgoPorTipo.hasOwnProperty(cliente['tipoClienteEmpresa'])) {
            riesgo += riesgoPorTipo[cliente['tipoClienteEmpresa']]*2;
        } else {
            riesgo += 2; // Valor por defecto si no está en la lista
        }
       // console.log('tipoClienteEmpresa',riesgoPorTipo[cliente['tipoClienteEmpresa']]*2)
    // Sumar el riesgo si el valor coincide con el mapeo
    if (riesgoAntiguedad[cliente['antiguedad']] !== undefined) {
        riesgo += riesgoAntiguedad[cliente['antiguedad']]*3;
       // console.log('riesgoAntiguedad', riesgoAntiguedad[cliente['antiguedad']]*3)
    } else {
        //console.warn("Valor de antigüedad no reconocido:", cliente['antiguedad']);
    }

     //// volument transaccional juridica
     try {
        const volumen = cliente['volumenTransaccional'];

        if (volumen >= 0 && volumen <= 150000000) {
            riesgo += 4;
           // console.log('volumen riesgo 1 juridica',4);
        } else if (volumen > 150000000 && volumen <= 300000000) {
            riesgo += 8;
           // console.log('volumen riesgo 2 juridica',8);
        } else if (volumen > 300000000 && volumen <= 450000000) {
            riesgo += 12;
           // console.log('volumen riesgo 3 juridica',12);
        } else if (volumen > 450000000 && volumen <= 600000000) {
            riesgo += 16;
           // console.log('volumen riesgo 4 juridica',16);
        } else if (volumen > 600000000) {
            riesgo += 20;
           // console.log('volumen riesgo 5 juridica',20);
        } else {
           // console.log('No se encuentra', volumen);
        }
        
    } catch (error) {
       // console.log(error)
    }

        ///fin persona juridica

    }





        // Persona expuesta políticamente (PEP)
        if (cliente['expuesta'] === 'SI') {
            riesgo += 10;
           // console.log('expuesta',10)
        } else {
            riesgo += 2;
           // console.log('expuesta',2)
        }

        // Actividad económica
        const actividad = cliente['actividadEconomica'];
       // console.log('actividad', actividad);
        const nivelRiesgo = actividadRiesgo.find(item => item['Unnamed: 0'] === actividad);
        if (nivelRiesgo) {
            const riesgoActividad = parseInt(nivelRiesgo['Unnamed: 1']) * 4; // Multiplica por 4
           // console.log('riesgoActividad', riesgoActividad);
            riesgo += riesgoActividad;
        } else {
            riesgo += 2; // Valor por defecto si no se encuentra la actividad
        }

        // Código postal (CP)
        const cp = cliente['cp'];
        const riesgoCP = cpriesgo.find(item => item['codigo'] === cp);
        if (riesgoCP) {
            const riesgoCPValue = parseInt(riesgoCP['riesgo']) * 2; // Multiplica por 2
           // console.log('riesgoCP', riesgoCPValue);
            riesgo += riesgoCPValue;
        } else {
            riesgo += 2; // Valor por defecto si no se encuentra el CP
        }

        //////////nacionalidad riesgo
        nacionalidadriesgo
        const nacionariesgo = cliente['nacionalidad'];
        const riesgoNAC = nacionalidadriesgo.find(item => item['NACIONALIDAD'] === nacionariesgo);

        if (riesgoNAC) {
            const riesgoNACValue = parseInt(riesgoNAC['NIVEL DE RIESGO']) * 3; // Multiplica por 3
           // console.log('riesgoNAC', riesgoNACValue);
            riesgo += riesgoNACValue;
        } else {
            riesgo += 3; // Valor por defecto si no se encuentra el CP
        }
       
  


    return riesgo;
}


async function montomaximodelicliente(cliente) {

    const criterios = await pool.query("SELECT * FROM criterios_riesgo ORDER BY id DESC LIMIT 1")
const porcentaje = await matriz(cliente);

    const svm = await pool.query("SELECT * FROM salariovital ORDER BY id DESC LIMIT 1");
    montomax = 0
    if(porcentaje<59){
        
        

        if(cliente.razon=="Empresa"){
            console.log("Empresa")
            montomax = svm[0]['valor'] *criterios[0]['bajoempresa']
            

        }else{
           
            montomax = svm[0]['valor'] *criterios[0]['bajopersona']
            
        }



    }else{
        if(porcentaje<71){
            console.log('medio')

            if(cliente.razon=="Empresa"){
                console.log("Empresa")
                montomax = svm[0]['valor'] *criterios[0]['medioempresa']
                


            }else{
               
                montomax = svm[0]['valor'] *criterios[0]['mediopersona']
                
            }
    


        }else{
            console.log('alto')
            if(cliente.razon=="Empresa"){
                console.log("Empresa")
                montomax = svm[0]['valor'] *criterios[0]['altoempresa']
                

            }else{
               
                montomax = svm[0]['valor'] *criterios[0]['altopersona']
                
            }
    

        }
    }
    return montomax
}


module.exports = { matriz,montomaximodelicliente };
