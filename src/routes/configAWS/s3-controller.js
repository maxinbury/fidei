const formidable = require('formidable');
const { uploadFileToS3, getBucketListFromS3, getPresignedURL } = require('./s3-service');
const express = require('express')
const router = express.Router()
const pool = require('../../database')



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



    const datoss = {
        ubicacion: formData.file.originalFilename,
        cuil_cuit,
        numero,
        lazo,
        estado: "P",

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



    try {
        //// realizar el pago
        let estadoo = 'P'


        let cuil_cuit_distinto = 'Si'
        let monto_distinto = 'Si'
        let monto_inusual = 'No'
        aux = '%' + cuil_cuit + '%'
        mes = parseInt(fecha.substring(5, 7))
        anio = parseInt(fecha.substring(0, 4))
        console.log(mes+anio)
        let existe = await pool.query('Select * from cuotas where  id_lote=?  and mes =? and anio = ? and parcialidad = "Final" order by nro_cuota', [id, mes, anio])
        estado = existe[0]
       






        console.log(existe)
        if (existe.length > 0) {
            /// traer la ultima

            ///

            let cliente = await pool.query('Select * from clientes where cuil_cuit like ? ', [aux])


            montomax = cliente[0]['ingresos'] * 0.3
            console.log(4)
            if (montomax < monto) {

                monto_inusual = 'Si'
            }


            const id_cuota = existe[0]["id"]
            console.log(id_cuota)
                console.log(1)
                const newInu = {
                    id_cuota,
                    cuil_cuit,
                    estado,
                    mes,
                    anio,


                };

                await pool.query('INSERT INTO historial_pagosi SET ?', [newInu]);


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

                };
                console.log(1)
                await pool.query('INSERT INTO pagos SET ?', [newLink]);
                res.send('Enviado!')





                
         
        } else {
            res.send('Error la cuota no existe')


        }

        /////
    } catch (error) {
        console.log(error)
        res.send('Error la cuota no existe, elegir una fecha valida')
    }




    try {


        await uploadFileToS3(formData.file, "mypdfstorage");
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
    cuil_cuit = myArray[0] /// del administrador
    id = myArray[1]
    monto = myArray[2]




    try {
        //// realizar el pago
        let estadoo = 'P'


        let cuil_cuit_distinto = 'No'
        let monto_distinto = 'No'
        let monto_inusual = 'No'


        const cuota = await pool.query('select * from cuotas where id = ?', [id]) //objeto cuota
        aux = '%' + cuota[0]["cuil_cuit"] + '%'
        cuil_cuit_admin = cuil_cuit
        cuil_cuit = cuota[0]["cuil_cuit"]
        let cuota_con_ajuste = cuota[0]["cuota_con_ajuste"]
        let saldo_realc = cuota[0]["Saldo_real"]
        let nro_cuota = cuota[0]["nro_cuota"]
        let id_lote = cuota[0]["id_lote"]







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



            const newInu = {
                id_cuota,
                cuil_cuit,
                estado,
                mes,
                anio,


            };

            await pool.query('INSERT INTO historial_pagosi SET ?', [newInu]);


            const newLink = {
                id_cuota,
                monto,
                cuil_cuit,
                mes,
                estado: estado,
                anio,
                cuil_cuit_distinto,
                monto_distinto,
                monto_inusual,
                ubicacion: formData.file.originalFilename,///////////aca ver el problema

            };

            await pool.query('INSERT INTO pagos SET ?', [newLink]);


            console.log(3)
            let pago = cuota[0]["pago"] + parseFloat(monto)



            try {
                console.log(parseFloat(cuota[0]["pago"]))
                console.log(monto)
                console.log('pasa')
                if (cuota_con_ajuste < parseFloat(cuota[0]["pago"]) + parseFloat(monto)) {
                    console.log('antes')
                    Saldo_real = (parseFloat(cuota[0]["saldo_inicial"]) - cuota_con_ajuste).toFixed(2)
                    console.log(Saldo_real)
                    diferencia = cuota[0]["pago"] + parseFloat(monto) - cuota_con_ajuste


                } else {
                    console.log('no pasa')
                    Saldo_real = parseFloat(saldo_realc) - parseFloat(monto)
                    diferencia = 0

                }


                let pago = cuota[0]["pago"] + parseFloat(monto)

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


                diferencia = parseFloat(cant_finales[nro_cuota - 1]["diferencia"])
                ///
                bandera = true
                console.log(bandera)
               if (nro_cuota < cant_finales.length){
                for (ii = (nro_cuota ); ii < cant_finales.length; ii++) {
                    console.log(ii) 

                    // aux = await pool.query('select *from cuotas WHERE id_lote = ? and nro_cuota=?', [id_lote, i]) //cuota concurrente
                    //  cuota_con_ajuste = cant_finales[ii]["cuota_con_ajuste"]
                    saldo_realc = (parseFloat(cant_finales[ii]["Saldo_real"]) - monto).toFixed(2)
                    /* console.log('saldo real')
                    console.log(saldo_realc)
                    console.log(cant_finales[ii]["nro_cuota"])
                    if (bandera){
                        auxx=parseFloat(monto) ///monto es el pago del momento
                        bandera=false
                    }else {
                        auxx=0
                    }
                    console.log(auxx)
                    console.log(cuota_con_ajuste)
                    console.log(bandera) */
                    /*    if (cant_finales[ii]["nro_cuota"]>1){
                           anterior = await pool.query('select * from cuotas where  id_lote = ? and nro_cuota = ?',[id_lote,(cant_finales[ii]["nro_cuota"]-1)])
                           console.log(anterior)
                           auxx= auxx + anterior[0]['diferencia']
                       } */
                    /*       if (cuota_con_ajuste < parseFloat(cant_finales[ii]["pago"]) + auxx) {
  
  
                              console.log('pasa')
                              Saldo_real = parseFloat(cant_finales[ii]["saldo_cierre"])
                              
                              diferencia =  auxx + parseFloat(cant_finales[ii]["pago"]) - cuota_con_ajuste
                              console.log(diferencia)
                             //////diferencia suma el doble el que ya estaba
  
                          } else {
                              console.log(diferencia)
                              Saldo_real = parseFloat(saldo_realc) - parseFloat(monto)
                              diferencia = 0
                              console.log('no pasa')
                              
                          } */

                    idaux = cant_finales[ii]["id"]
                    a = ii
                    //  Saldo_real = saldo_realc - monto

                    update = {
                        Saldo_real: saldo_realc,

                    }
                    console.log(update)


                    await pool.query('UPDATE cuotas set  ? WHERE id = ?', [update, idaux])


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