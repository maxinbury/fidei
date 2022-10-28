const formidable = require('formidable');
const { uploadFileToS3, getBucketListFromS3, getPresignedURL } = require('./s3-service');
const express = require('express')
const router = express.Router()
const pool = require('../../database')
const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')
const ponerguion = require('../../public/apps/transformarcuit')
const sacarguion = require('../../public/apps/transformarcuit')


async function s3Upload(req, res) {
    let { ingreso, formData } = req.body

    formData = await readFormData(req);





    //  const etc =  req.formData

    //  console.log(formData)
    // console.log(formData.name)  FILE
    //console.log(formData.ingreso) falla
    // falla console.log(req.formdata.ingreso)

    try {


        await uploadFileToS3(formData.file, "mypdfstorage");

        res.send('Uploaded!!');
    } catch (ex) {
        res.send('ERROR!!!!');
    }
}

async function s3Get(req, res) {
    console.log('1');
    try {
        console.log('2');
        const bucketData = await getBucketListFromS3("mypdfstorage");
        const { Contents = [] } = bucketData;
        res.header("Access-Control-Allow-Origin", "*");
        res.send(Contents.map(content => {
            return {
                key: content.Key,
                size: (content.Size / 1024).toFixed(1) + ' KB',
                lastModified: content.LastModified
            }
        }));
    } catch (ex) {
        res.send([]);
    }
}

async function readFormData(req) {
    return new Promise(resolve => {
        const dataObj = {};
        var form = new formidable.IncomingForm();
        form.parse(req);

        form.on('file', (name, file) => {
            dataObj.name = name;
            dataObj.file = file;
        });
        ///

        form.on('field', (fieldName, fieldValue) => {
            dataObj.ingreso = fieldName;
            dataObj.ingresoo = fieldValue;



        });

        ///
        form.on('end', () => {
            console.log(dataObj)
            resolve(dataObj);
        });
    });
}

async function getSignedUrl(req, res) {
    console.log("url1")
    try {
        console.log("url2")

        const { key } = req.params;
        const url = await getPresignedURL("mypdfstorage", key);
        res.send(url);

    } catch (ex) {
        res.send('');
    }
}


async function subirlegajo(req, res) {

    formData = await leerformlegajo(req);

    const myArray = formData.datos.split(",");
    console.log(myArray)
    cuil_cuit = myArray[0]
    tipo = myArray[1]
    descripcion = myArray[2]


    const datoss = {
        ubicacion: formData.file.originalFilename,
        cuil_cuit: cuil_cuit,
        tipo: tipo,
        descripcion: descripcion,
        fecha: (new Date(Date.now())).toLocaleDateString(),

        estado: 'Aprobada'
    }
    console.log(datoss)
    try {
        await pool.query('insert into constancias set?', datoss)
        CONSOLE.LOG(SUBIDO)
    } catch (error) {

    }




    try {


        await uploadFileToS3(formData.file, "mypdfstorage");
        console.log(' Uploaded!!  ')



    } catch (ex) {
        console.log('NOOO  ')
    }
}
async function leerformlegajo(req) {
    return new Promise(resolve => {
        const dataObj = {};
        var form = new formidable.IncomingForm();
        form.parse(req);

        form.on('file', (name, file) => {
            dataObj.name = name;
            dataObj.file = file;

            dataObj.file.originalFilename = '-legajo-' + (new Date(Date.now())).toUTCString() + ((file.originalFilename).substring((file.originalFilename.length - 4), (file.originalFilename.length)))

        });
        ///

        form.on('field', (fieldName, fieldValue) => {
            dataObj.dato = fieldName;
            dataObj.datos = fieldValue;



        });



        ///
        form.on('end', () => {
            console.log(dataObj)
            resolve(dataObj);
        });
    });
}


async function determinarPep(req, res) {

    formData = await leerformlegajo(req);

    const myArray = formData.datos.split(",");
    console.log(myArray)
    cuil_cuit = myArray[0]
    expuesta = myArray[1]




    const datoss = {
        ubicacion: formData.file.originalFilename,
        cuil_cuit: cuil_cuit,
        tipo: 'Documentacion PEP',
        descripcion: 'Cuil administrador',

        fecha: (new Date(Date.now())).toLocaleDateString()
    }
    console.log(datoss)
    try {
        await pool.query('insert into constancias set?', datoss)
        const datosss = {
            expuesta,
        }
        await pool.query('UPDATE clientes set ? WHERE cuil_cuit= ?', [datosss, cuil_cuit])
        CONSOLE.LOG(SUBIDO)
    } catch (error) {

    }




    try {


        await uploadFileToS3(formData.file, "mypdfstorage");
        console.log(' Uploaded!!  ')



    } catch (ex) {
        console.log('NOOO  ')
    }
}


async function subirlegajo1(req, res) {

    formData = await leerformlegajo(req);

    const myArray = formData.datos.split(",");
    console.log(myArray)
    cuil_cuit = myArray[0]
    tipo = myArray[1]
    descripcion = myArray[2]



    const datoss = {
        ubicacion: formData.file.originalFilename,
        cuil_cuit: cuil_cuit,
        tipo: tipo,
        descripcion: descripcion,
        estado: 'Pendiente',
        fecha: (new Date(Date.now())).toLocaleDateString()
    }
    console.log(datoss)
    try {
        await pool.query('insert into constancias set?', datoss)
        CONSOLE.LOG(SUBIDO)
    } catch (error) {

    }




    try {


        await uploadFileToS3(formData.file, "mypdfstorage");
        console.log(' Uploaded!!  ')



    } catch (ex) {
        console.log('NOOO  ')
    }
}
////cargarcbu

async function cargarcbu(req, res) {

    formData = await leerformlegajo(req);

    const myArray = formData.datos.split(",");

    cuil_cuit = myArray[0]
    numero = myArray[1]
    lazo = myArray[2]
    cuil_cuit_lazo = myArray[3]
    cuil_cuit_lazo = ponerguion.ponerguion(cuil_cuit_lazo)

    const datoss = {
        ubicacion: formData.file.originalFilename,
        cuil_cuit,
        numero,
        lazo,
        estado: "P",
        cuil_cuit_lazo

    }
    console.log(datoss)

    try {
        await pool.query('insert into cbus set?', datoss)


    } catch (error) {
        console.log(error)
    }




    try {


        await uploadFileToS3(formData.file, "mypdfstorage");
        console.log(' Uploaded!!  ')



    } catch (ex) {
        console.log('NOOO  ')
    }
}




//////////////pago
async function pagarniv1(req, res) {

    formData = await leerformlegajo(req);

    const myArray = formData.datos.split(",");
    console.log(myArray)
    cuil_cuit = myArray[0]
    id = myArray[1]
    monto = myArray[2]
    fecha = myArray[3]
    fechapago = myArray[4]
    id_cbu = myArray[5]
    auxiliarfecha = fechapago.split("-");
    fechapago = auxiliarfecha[2] + "-" + auxiliarfecha[1] + "-" + auxiliarfecha[0]
    fechapago = fechapago.replace('-', '/')
    fechapago = fechapago.replace('-', '/')
    


    try {
        
        
        //// realizar el pago
        let estadoo = 'P'
        let cuil_cuit_distinto = 'Si'
        let monto_distinto = 'Si'
        let monto_inusual = 'No'
        aux = '%' + cuil_cuit + '%'
        mes = parseInt(fecha.substring(5, 7))
        anio = parseInt(fecha.substring(0, 4))
        let regex = /(\d+)/g;
        console.log(1)
        ///busca la cuota
        let existe = await pool.query('Select * from cuotas where  id_lote=?  and mes =? and anio = ? and parcialidad = "Final" order by nro_cuota', [id, mes, anio])
        // estado = existe[0]
        if (existe.length > 0) {////////si existe la cuota



            /// inicia verificacion de ingresos
            let cliente = await pool.query('Select * from clientes where cuil_cuit like ? ', [aux])
            montomax = cliente[0]['ingresos'] * 0.3
          
            if (montomax < monto) {
                monto_inusual = 'Si'
            }
            ////// final verificacion de ingresos

            let extracto = await pool.query('Select * from extracto ')
            cantidad = extracto.length

            //////// COMPARACION CON EL EXTRACTO
            aux_cbu = await pool.query('Select * from cbus where id = ? ', [id_cbu])

            cuil_cuit_lazo = aux_cbu[0]['cuil_cuit_lazo']

            try {
                let i = 0

                cuil_cuit_lazo = sacarguion.sacarguion(cuil_cuit_lazo)
                while ((cuil_cuit_distinto === 'Si') && (i < (cantidad ))) {

                    ///el while sale si se encuentra monto y cuil o si recorre todos los estractos

                    const workbook = XLSX.readFile('./src/Excel/' + extracto[i]['ubicacion'])
                    const workbooksheets = workbook.SheetNames
                    const sheet = workbooksheets[0]

                    const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])

                    try {
                        console.log(dataExcel[1]['Descripción'].includes(cuil_cuit_lazo))///IMPORTANTE EL CONSOLE LOG PARA NO LEER EXTRACTOS INVALIDOS
                        for (const property in dataExcel) {////////////recorrido del extracto




                            if ((dataExcel[property]['Descripción']).includes(cuil_cuit_lazo)) {

                                // tipo de pago normal 



                                cuil_cuit_distinto = 'No'



                                credito = String(dataExcel[property]['Créditos'])
                                

                                try {
                                    
                                    console.log('credito')
                                    console.log(credito)
                                    console.log('monto')
                                    console.log(monto)
                                  
                                    
                                if (credito === monto) {
                                     console.log('entra')
                                     monto_distinto = 'No'
                                     estadoo = 'A'}
                                    } catch (error) {
                                    
                                    }
                                /*      
                                credito = credito.split(".");

                                entero = credito[0].match(regex)
                                enteroo = entero[0] + entero[1]
                                //////////////ver el tema de que si son mas digitos

                                //  entero= entero[0]+entero[1]
                                // entero=entero.replace(',','')
                                decimal = credito[1].match(regex)
                                credito = enteroo + '.' + decimal
                                console.log('monto')
                                console.log(monto)
                                onsole.log('credito')
                                console.log(credito)
                                if (monto === credito) {

                                    // tipo de pago normal 
                                    monto_distinto = 'No'
                                    estadoo = 'A'
                                } */

                            }



                        }
                    } catch (error) {
                        console.log(error)
                    }
                    i += 1
                } //// fin comparacion de estractos


            } catch (error) {
                console.log(error)
            }


            //////////////////////////////
            const id_cuota = existe[0]["id"]
            console.log(id_cuota)
           



            const newLink = {
                id_cuota,
                monto,
                cuil_cuit,
                mes,
                estado: estadoo,
                anio,
                cuil_cuit_distinto,
                monto_distinto,
                monto_inusual,
                ubicacion: formData.file.originalFilename,///////////aca ver el problema
                id_cbu

            };

            await pool.query('INSERT INTO pagos SET ?', [newLink]);

            //////////   regisTro aprobacion de pago
            let cuota_con_ajuste = existe[0]["cuota_con_ajuste"]
            let saldo_realc = existe[0]["Saldo_real"]
            let nro_cuota = existe[0]["nro_cuota"]
            let id_lote = existe[0]["id_lote"]
            let Amortizacion = existe[0]["Amortizacion"]
            if (estadoo === 'A') {
                let pago = existe[0]["pago"] + parseFloat(monto)



                try {

                    ////compara si ya supero el 
                    if (cuota_con_ajuste < parseFloat(existe[0]["pago"]) + parseFloat(monto)) {
                        console.log('antes')
                        Saldo_real = (parseFloat(existe[0]["saldo_inicial"]) - parseFloat(Amortizacion)).toFixed(2)

                        diferencia = parseFloat(existe[0]["pago"]) + parseFloat(monto) - cuota_con_ajuste


                    } else {
                        
                        Saldo_real = parseFloat(saldo_realc) - parseFloat(monto)
                        diferencia = 0

                    }



                    pago = existe[0]["pago"] + parseFloat(monto)

                    update = {
                        Saldo_real,
                        pago,
                        diferencia
                    }
                    await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, id])
                    // Saldo_real = cuota[0]["saldo_inicial"] -saldo_realc  - pago 



                    /*  const update = {
                          Saldo_real,
                          pago,
                          diferencia
              
              
                      }
              
                      await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, cuota[0]["id"]])*/

                    cant_finales = await pool.query('select * from cuotas  WHERE id_lote = ? and parcialidad = "Final" order by nro_cuota', [id_lote])

                    pago = pago - monto
                    //  diferencia = parseFloat(cant_finales[nro_cuota - 1]["diferencia"])
                    ///
                    bandera = true
                    console.log(bandera)
                    if (nro_cuota < cant_finales.length) {
                        if (pago < monto + pago - diferencia) { // si el pago ya superó el total }


                            for (ii = (nro_cuota); ii < cant_finales.length; ii++) {
                                console.log(ii)
                                if (diferencia > 0) {
                                    //saldo real seria Saldo

                                    saldo_realc = (parseFloat(cant_finales[ii]["Saldo_real"]) - monto - pago + diferencia).toFixed(2)

                                    idaux = cant_finales[ii]["id"]
                                    a = ii
                                    //  Saldo_real = saldo_realc - monto

                                    update = {
                                        Saldo_real: saldo_realc,

                                    }
                                    console.log(update)


                                    await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, idaux])

                                } /*else  {

                                // aux = await pool.query('select *from cuotas WHERE id_lote = ? and nro_cuota=?', [id_lote, i]) //cuota concurrente
                                //  cuota_con_ajuste = cant_finales[ii]["cuota_con_ajuste"]
                                saldo_realc = (parseFloat(cant_finales[ii]["Saldo_real"]) - monto).toFixed(2)
                            } */





                            }
                        }

                    }




                } catch (error) {
                    console.log(error)
                }

            }
            console.log(estadoo)
            /////////FIN ETC PAGO 
            res.send('Recibimos exitosamente la notificacion del pago, notificaremos cuando sea corroborado')



        } else {
            res.send('Error la cuota no existe')


        }

        /////
    } catch (error) {
        console.log(error)
        res.send('Error la cuota no existe, elegir una fecha valida')
    }




    try {

        ///guardado de 
        //  await uploadFileToS3(formData.file, "mypdfstorage");
        console.log(' Uploaded!!  ')



    } catch (ex) {
        console.log('NOOO  ')
    }
}



/////////////////////pagar nivel 2 directamente aprobado 
async function pagonivel2(req, res) {

    formData = await leerformlegajo(req);

    const myArray = formData.datos.split(",");
    console.log(myArray)
    cuil_cuit_administrador = myArray[0] /// del administrador
    id = myArray[1]
    monto = myArray[2]




    try {
        //// realizar el pago
   
        


        let cuil_cuit_distinto = 'No'
        let monto_distinto = 'No'
        let monto_inusual = 'No'


        const cuota = await pool.query('select * from cuotas where id = ?', [id]) //objeto cuota
        aux = '%' + cuota[0]["cuil_cuit"] + '%'
        
        cuil_cuit = cuota[0]["cuil_cuit"]
        let cuota_con_ajuste = cuota[0]["cuota_con_ajuste"]
        let saldo_realc = cuota[0]["Saldo_real"]
        let nro_cuota = cuota[0]["nro_cuota"]
        let id_lote = cuota[0]["id_lote"]
        let Amortizacion = cuota[0]["Amortizacion"]







        mes = cuota[0]["mes"]
        anio = cuota[0]["anio"]

        estado = 'A'

        if (cuota.length >= 0) {
            /// traer la ultima

            ///
            console.log(aux)
            let cliente = await pool.query('Select * from clientes where cuil_cuit like ? ', [aux])
            ///////////////////CONSIDERAR PEP

            montomax = cliente[0]['ingresos'] * 0.3
            console.log(montomax)
            if (montomax < monto) {

                monto_inusual = 'Si'
            }

            const id_cuota = id

            
            


            const newLink = {
                id_cuota,
                monto,
                cuil_cuit,
                mes,
                estado: estado,
                anio,
                cuil_cuit_administrador,
                cuil_cuit_distinto,
                monto_distinto,
                monto_inusual,
                ubicacion: formData.file.originalFilename,///////////aca ver el problema

            };

            await pool.query('INSERT INTO pagos SET ?', [newLink]);



            let pago = cuota[0]["pago"] + parseFloat(monto)



            try {

                ////compara si ya supero el 
                if (cuota_con_ajuste < parseFloat(cuota[0]["pago"]) + parseFloat(monto)) {
                    console.log('antes')
                    Saldo_real = (parseFloat(cuota[0]["saldo_inicial"]) - parseFloat(Amortizacion)).toFixed(2)

                    diferencia = parseFloat(cuota[0]["pago"]) + parseFloat(monto) - cuota_con_ajuste


                } else {
                    console.log('no pasa')
                    Saldo_real = parseFloat(saldo_realc) - parseFloat(monto)
                    diferencia = parseFloat(cuota[0]["pago"]) + parseFloat(monto) - cuota_con_ajuste

                }



                pago = cuota[0]["pago"] + parseFloat(monto)

                update = {
                    Saldo_real,
                    pago,
                    diferencia
                }
                await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, id])
                // Saldo_real = cuota[0]["saldo_inicial"] -saldo_realc  - pago 



                /*  const update = {
                      Saldo_real,
                      pago,
                      diferencia
          
          
                  }
          
                  await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, cuota[0]["id"]])*/

                cant_finales = await pool.query('select * from cuotas  WHERE id_lote = ? and parcialidad = "Final" order by nro_cuota', [id_lote])

                pago = pago - monto
                //  diferencia = parseFloat(cant_finales[nro_cuota - 1]["diferencia"])
                ///
                bandera = true
                console.log(bandera)
                if (nro_cuota < cant_finales.length) {
                    if (pago < monto + pago - diferencia) { // si el pago ya superó el total }


                        for (ii = (nro_cuota); ii < cant_finales.length; ii++) {
                            console.log(ii)
                            if (diferencia > 0) {
                                //saldo real seria Saldo

                                saldo_realc = (parseFloat(cant_finales[ii]["Saldo_real"]) - monto - pago + diferencia).toFixed(2)

                                idaux = cant_finales[ii]["id"]
                                a = ii
                                //  Saldo_real = saldo_realc - monto

                                update = {
                                    Saldo_real: saldo_realc,

                                }
                                console.log(update)


                                await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, idaux])

                            } /*else  {

                                // aux = await pool.query('select *from cuotas WHERE id_lote = ? and nro_cuota=?', [id_lote, i]) //cuota concurrente
                                //  cuota_con_ajuste = cant_finales[ii]["cuota_con_ajuste"]
                                saldo_realc = (parseFloat(cant_finales[ii]["Saldo_real"]) - monto).toFixed(2)
                            } */





                        }
                    }

                }




            } catch (error) {
                console.log(error)
            }



            res.send('Enviado!')







        } else {
            res.send('Error la cuota no existe o no esta calculada')


        }

        /////
    } catch (error) {
        console.log(error)
        res.send('Error no se pudo enviar')
    }




    try {


        await uploadFileToS3(formData.file, "mypdfstorage");
        console.log(' Uploaded!!  ')



    } catch (ex) {
        console.log('NOOO  ')
    }
}

//////
async function justificar(req, res) {

    formData = await leerformlegajo(req);

    const myArray = formData.datos.split(",");
    console.log(myArray)
    id = myArray[0]  // id
    cuil_cuit = myArray[1] //// cuil
    descripcion = myArray[2] /// descripcion
    const noti = await pool.query('Select * from notificaciones where id = ? ', [id])






    try {
        const constancia = {
            tipo: 'justificacion',
            cuil_cuit: cuil_cuit,
            descripcion,
            ubicacion: formData.file.originalFilename,
            fecha: (new Date(Date.now())).toLocaleDateString(),
            otros: noti[0]['id_referencia']
        }
        await pool.query('INSERT INTO constancias SET ?', [constancia]);

        const act = {

            estado: 'justificacionp'
        }

        await pool.query('UPDATE pagos SET ?  where id = ?', [act, noti[0]['id_referencia']])
        res.send('Enviado con exito')

    } catch (error) {
        res.send('Error algo sucedio')
    }


    try {


        await uploadFileToS3(formData.file, "mypdfstorage");
        console.log(' Uploaded!!  ')



    } catch (ex) {
        console.log('NOOO  ')
    }
}






module.exports = {
    s3Upload,
    s3Get,
    getSignedUrl,
    subirlegajo,
    subirlegajo1,
    pagarniv1,
    cargarcbu,
    determinarPep,
    justificar,
    pagonivel2
}