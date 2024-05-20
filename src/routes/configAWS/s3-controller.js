const formidable = require('formidable');
const { uploadFileToS3, getBucketListFromS3, getPresignedURL, getPresignedURL2 } = require('./s3-service');
const express = require('express')
const router = express.Router()
const pool = require('../../database')
const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')
const ponerguion = require('../../public/apps/transformarcuit')
const sacarguion = require('../../public/apps/transformarcuit')
const pagodecuota = require('../funciones/pagoDeCuota')
const enviodemail = require('../Emails/Enviodemail')

///Funcion modelo de guardado de imagen
async function s3Upload(req, res) {
    let { ingreso, formData } = req.body

    formData = await readFormData(req);


    try {


        
            try {
        await uploadFileToS3(formData.file, "mypdfstorage");
        
        res.send('Uploaded!!');
    }catch{console.log(error)}
    } catch (ex) {
        res.send('ERROR!!!!');
    }
}
/// Funcion para traer la url de la imagen
async function s3Get(req, res) {

    try {

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
///Extrae los datos    
//Field: Arreglo con datos
///File: PDF
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
           
            resolve(dataObj);
        });
    });
}
///traer a partir de la url
async function getSignedUrl(req, res) {

    try {


        const { key } = req.params;
        const url = await getPresignedURL("mypdfstorage", key);
        res.send(url);

    } catch (ex) {
        res.send('');
    }
}

async function getSignedUrl2(req, res) {

    try {


        const { key } = req.params;
        const url = await getPresignedURL2("mypdfstorage", key);
        res.send(url);

    } catch (ex) {
        res.send('');
    }
}
/// Funcion para traer la url de la imagen
async function traerImagen(ubicacion) {

    try {
       
       // const { key } = { ubicacion };

        const url = await getPresignedURL("mypdfstorage", ubicacion);
   
        return (url)


    } catch (ex) {
       // console.log(ex)
        return ('No se encontro imagen');
    }
}

///funcion para guardar comprobante deingresos declarados
async function determinaringreso(req, res) {

    formData = await leerformlegajo(req);

    const myArray = formData.datos.split(",");
   
    cuil_cuit = myArray[0]
    descripcion = myArray[1]
 
    let rta = ''
    const datoss = {
        ingresos: descripcion
    }
   try {
        await pool.query('UPDATE clientes set ? WHERE cuil_cuit= ?', [datoss, cuil_cuit])
        const constancianueva = {
            ubicacion: formData.file.originalFilename,
            cuil_cuit: cuil_cuit,
            descripcion: descripcion,
            tipo: "Ingresos Declarados",
            fecha: (new Date(Date.now())).toLocaleDateString(),
            estado: 'Aprobada'
        }

        await pool.query('insert into constancias set ?', constancianueva)
        rta = 'Ingresos actualizados'
    } catch (error) {
      //  console.log(error)
        rta = 'Ingresos actualizados'
    }




    try {


        
            try {
        await uploadFileToS3(formData.file, "mypdfstorage");
        
        
    }catch{console.log(error)}


    } catch (ex) {
        
        rta = 'Ingresos actualizados'
    }
  
    res.json(rta)
}

///funcion para subir algun legajo
async function subirlegajo(req, res) {

    formData = await leerformlegajo(req);

    const myArray = formData.datos.split(",");
    
    cuil_cuit = myArray[0]
    tipo = myArray[1]
    descripcion = myArray[2]
console.log(1)
    if (tipo == "Cbu personal") {
      
        const datoss = {
            ubicacion: formData.file.originalFilename,
            cuil_cuit: cuil_cuit,
            numero: descripcion,
           
            lazo:"Cbu personal",
            estado: 'A'
        }

        await pool.query('insert into cbus set?', datoss)

    } else {
        if (tipo == "Cbu familiar") {
           
            const datoss = {
                ubicacion: formData.file.originalFilename,
                cuil_cuit: cuil_cuit,
                numero: descripcion,
                
                lazo:"Cbu familiar",
                estado: 'A'
            }

            await pool.query('insert into cbus set?', datoss)
            
        } else {
            console.log(formData.file.originalFilename)
            const datoss = {
                ubicacion: formData.file.originalFilename,
                cuil_cuit: cuil_cuit,
                tipo: tipo,
                descripcion: descripcion,
                fecha: (new Date(Date.now())).toLocaleDateString(),

                estado: 'Aprobada'
            }
            await pool.query('insert into constancias set?', datoss)
        }
    }

    try {

      
    } catch (error) {
        console.log(error)
    }




    try {


      
            try {
        await uploadFileToS3(formData.file, "mypdfstorage");
         }catch{console.log(error)}
        res.json(' Realizado con exito ')
   



    } catch (ex) {
    }
    return
}
///funcion para leer un form legajo
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
            resolve(dataObj);
        });
    });
}

////funciond eterminar persona politicamente expuesta
async function determinarPep(req, res) {

    formData = await leerformlegajo(req);

    const myArray = formData.datos.split(",");
    cuil_cuit = myArray[0]
    expuesta = myArray[1]




    const datoss = {
        ubicacion: formData.file.originalFilename,
        cuil_cuit: cuil_cuit,
        tipo: 'Documentacion PEP',
        descripcion: 'Cuil administrador',

        fecha: (new Date(Date.now())).toLocaleDateString()
    }
    try {
        await pool.query('insert into constancias set?', datoss)
        const datosss = {
            expuesta,
        }
        await pool.query('UPDATE clientes set ? WHERE cuil_cuit= ?', [datosss, cuil_cuit])
    } catch (error) {

    }







        
            try {
        await uploadFileToS3(formData.file, "mypdfstorage");
        
        
    }catch{console.log(error)}

   
}

////Subir legajo sin aprobar
async function subirlegajo1(req, res) {

    formData = await leerformlegajo(req);

    const myArray = formData.datos.split(",");
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
    try {
        await pool.query('insert into constancias set?', datoss)
    } catch (error) {

    }




    try {


        
            try {
        await uploadFileToS3(formData.file, "mypdfstorage");
    
        
    }catch{console.log(error)}
    res.json('Subido con exito')

    } catch (ex) {
        res.json('Error algo sucedió ')
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
    alias = myArray[4]
    cuil_cuit_lazo = ponerguion.ponerguion(cuil_cuit_lazo)

    const datoss = {
        ubicacion: formData.file.originalFilename,
        cuil_cuit,
        numero,
        lazo,
        estado: "P",
        cuil_cuit_lazo,
        alias

    }

    try {
        await pool.query('insert into cbus set?', datoss)


    } catch (error) {
      //  console.log(error)
    }




    try {


        
            try {
        await uploadFileToS3(formData.file, "mypdfstorage");
        
      
    }catch{console.log(error)}
  res.json('Subido con exito')


    } catch (ex) {
      //  console.log('NOOO  ')
        res.json('no se ha podido subir')
    }
}




//////////////pago
async function pagarniv1(req, res) {

    formData = await leerformlegajo(req);

    const myArray = formData.datos.split(",");
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
        ///busca la cuota
        let existe = await pool.query('Select * from cuotas where  id_lote=?  and mes =? and anio = ? and parcialidad = "Final" order by nro_cuota', [id, mes, anio])
        // estado = existe[0]
        idcuotas = existe[0]['id']
        yarealizado = 'NO'
        if (existe.length > 0) {////////si existe la cuota


            /// inicia verificacion de ingresos
            let cliente = await pool.query('Select * from clientes where cuil_cuit like ? ', [aux])
            let montomax = 0
            try {
                if (cliente[0]['expuesta'] === 'SI') {
                    montomax = cliente[0]['ingresos'] * 0.2
                } else {
                    montomax = cliente[0]['ingresos'] * 0.3
                }
            } catch (error) {
               // console.log(error)
                montomax = cliente[0]['ingresos'] * 0.3
            }
       
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
                while ((cuil_cuit_distinto === 'Si') && (i < (cantidad))) {
                    //////////
                    ///el while sale si se encuentra monto y cuil o si recorre todos los estractos
                    try {

                        const workbook = XLSX.readFile(path.join(__dirname, '../../Excel/' + extracto[i]['ubicacion']))
                        const workbooksheets = workbook.SheetNames
                        const sheet = workbooksheets[0]

                        const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
        

                        console.log(dataExcel[1]['Descripción'].includes(cuil_cuit_lazo))///IMPORTANTE EL CONSOLE LOG PARA NO LEER EXTRACTOS INVALIDOS
                        for (const property in dataExcel) {////////////recorrido del extracto




                            if ((dataExcel[property]['Descripción']).includes(cuil_cuit_lazo)) {

                                // tipo de pago normal 


                                cuil_cuit_distinto = 'No'



                                credito = String(dataExcel[property]['Créditos'])

                                                       try {

                              


                                    if (credito.includes("$")) {
                                        credito = credito.replace("$", "")
                                      
                                        credito = credito.replace(" ", "")
                                   
                                        credito = credito.replace(".", "")
                                       
                                        credito = credito.replace(",", ".")
                                   
                                        if (credito === monto) {
                                     
                                            monto_distinto = 'No'
                                            fecha = dataExcel[property]['']
                                    
                                            if (fecha === fechapago) {


                                                verificacion = await pool.query('select * from pagos where monto=? and fecha=? ', [monto, fechapago])
                                                if (verificacion.length > 0) {
                                                    yarealizado = 'SI'

                                                } else {
                                                    estadoo = 'A'
                                                    try {

                                                    } catch (error) {

                                                    }
                                                    mensaje = 'Su pago ha sido aprobado'

                                                    email = cliente[0]['email']
                                                    asunto = 'Pago aprobado'
                                                    encabezado = 'este mail es muy importante'
                                                    enviodemail.enviarmail.enviarmail(email, asunto, encabezado, mensaje)


                                                }







                                            }



                                        }

                                    } else {

                                 
                                        credito = credito.replace(" ", "")
                                  
                                        //  credito = credito.replace(".", "")
                                      credito = credito.replace(",", ".")
                                   
                                        if (credito === monto) {
                                        
                                            monto_distinto = 'No'
                                            fecha = dataExcel[property]['']
                                           
                                            if (fecha === fechapago) {
                                              

                                                verificacion = await pool.query('select * from pagos where monto=? and fecha= ? and estado = "A"', [monto, fechapago])
                                           
                                                if (verificacion.length > 0) {
                                                    yarealizado = 'SI'

                                                } else {
                                                    estadoo = 'A'
                                                    try {
                                                        mensaje = 'Su pago ha sido aprobado'

                                                        email = cliente[0]['email']
                                                        asunto = 'Pago aprobado'
                                                        encabezado = 'este mail es muy importante'
                                                        await enviodemail.enviarmail.enviarmail(email, asunto, encabezado, mensaje)


                                                    } catch (error) {
                                                      //  console.log(error)
                                                    }

                                                }







                                            }



                                        }


                                    }

                                } catch (error) {
                                }

                            }

                        }
                    } catch (error) {
                      //  console.log(error)
                    }
                    i += 1
                } //// fin comparacion de estractos


            } catch (error) {
              //  console.log(error)
            }


            //////////////////////////////
            const id_cuota = existe[0]["id"]
          

            //////////   regisTro aprobacion de pago  

            /////////////////////comparacion 
            if (estadoo === 'A') {
                newLink = {
                    id_cuota,
                    monto,
                    cuil_cuit,
                    mes,
                    fecha: fechapago,
                    estado: estadoo,
                    anio,
                    cuil_cuit_distinto,
                    monto_distinto,
                    monto_inusual,
                    ubicacion: formData.file.originalFilename,///////////aca ver el problema
                    id_cbu,
                    yarealizado

                };
                await pagodecuota.pagodecuota(idcuotas, monto)



            } else {
                newLink = {
                    id_cuota,
                    monto,
                    cuil_cuit,
                    mes,
                    estado: estadoo,
                    anio,
                    fecha: fechapago,
                    cuil_cuit_distinto,
                    monto_distinto,
                    monto_inusual,
                    ubicacion: formData.file.originalFilename,///////////aca ver el problema
                    id_cbu,
                    observaciones: 'Inusual',
                    yarealizado

                };

            }


            await pool.query('INSERT INTO pagos SET ?', [newLink]);
            /////////FIN ETC PAGO 
            res.send('Recibimos exitosamente la notificacion del pago, notificaremos cuando sea corroborado')

        } else {
            res.send('Error la cuota no existe')
        }
        /////
    } catch (error) {
       // console.log(error)
        res.send('Error la cuota no existe, elegir una fecha valida')
    }
    try {
        ///guardado de 
        
            try {
        await uploadFileToS3(formData.file, "mypdfstorage");
        
        
    }catch{console.log(error)}

    } catch (ex) {
      //  console.log('NOOO  ')
    }
}


////Pagar una cuota nivel 1

async function pagarnivel1cuota(req, res) {

    formData = await leerformlegajo(req);

    const myArray = formData.datos.split(",");
  
    cuil_cuit = myArray[0]
    id = myArray[1] ////id de la cuota
    monto = myArray[2]
    fechapago = myArray[3]
    id_cbu = myArray[4]
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

        let regex = /(\d+)/g;

        ///busca la cuota
        let existe = await pool.query('Select * from cuotas where  id=?   and parcialidad = "Final" order by nro_cuota', [id])
        // estado = existe[0]
        idcuotas = existe[0]['id']
        yarealizado = 'NO'
        if (existe.length > 0) {////////si existe la cuota
            mes = existe[0]['mes']
            anio = existe[0]['anio']
            /// inicia verificacion de ingresos
            let cliente = await pool.query('Select * from clientes where cuil_cuit like ? ', [aux])
            let montomax = 0
            try {
                if (cliente[0]['expuesta'] === 'SI') {
                    montomax = cliente[0]['ingresos'] * 0.2
                } else {
                    montomax = cliente[0]['ingresos'] * 0.3
                }
            } catch (error) {
               // console.log(error)
                montomax = cliente[0]['ingresos'] * 0.3
            }
   


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
                while ((cuil_cuit_distinto === 'Si') && (i < (cantidad))) {
                    //////////
                    ///el while sale si se encuentra monto y cuil o si recorre todos los estractos
                    try {

                        const workbook = XLSX.readFile(path.join(__dirname, '../../Excel/' + extracto[i]['ubicacion']))
                        const workbooksheets = workbook.SheetNames
                        const sheet = workbooksheets[0]

                        const dataExcel = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])


                        console.log(dataExcel[1]['Descripción'].includes(cuil_cuit_lazo))///IMPORTANTE EL CONSOLE LOG PARA NO LEER EXTRACTOS INVALIDOS
                        for (const property in dataExcel) {////////////recorrido del extracto




                            if ((dataExcel[property]['Descripción']).includes(cuil_cuit_lazo)) {

                                // tipo de pago normal 


                                cuil_cuit_distinto = 'No'



                                credito = String(dataExcel[property]['Créditos'])


                                try {



                                    if (credito.includes("$")) {
                                        credito = credito.replace("$", "")

                                        credito = credito.replace(" ", "")

                                        credito = credito.replace(".", "")

                                        credito = credito.replace(",", ".")


                                        if (credito === monto) {


                                            monto_distinto = 'No'
                                            fecha = dataExcel[property]['']
                                  
                                            if (fecha === fechapago) {


                                                verificacion = await pool.query('select * from pagos where monto=? and fecha=? ', [monto, fechapago])
                                                if (verificacion.length > 0) {
                                                    yarealizado = 'SI'

                                                } else {
                                                    estadoo = 'A'
                                                    try {

                                                    } catch (error) {

                                                    }
                                                    mensaje = 'Su pago ha sido aprobado'

                                                    email = cliente[0]['email']
                                                    asunto = 'Pago aprobado'
                                                    encabezado = 'este mail es muy importante'
                                                    enviodemail.enviarmail.enviarmail(email, asunto, encabezado, mensaje)


                                                }







                                            }



                                        }

                                    } else {

                                     
                                        credito = credito.replace(" ", "")
                                   
                                        //  credito = credito.replace(".", "")
                                  
                                        credito = credito.replace(",", ".")
                                  
                                        if (credito === monto) {
                                         
                                            monto_distinto = 'No'
                                            fecha = dataExcel[property]['']
                                          
                                            if (fecha === fechapago) {
                                            

                                                verificacion = await pool.query('select * from pagos where monto=? and fecha= ? and estado = "A"', [monto, fechapago])
                                          
                                                if (verificacion.length > 0) {
                                                    yarealizado = 'SI'

                                                } else {
                                                    estadoo = 'A'
                                                    try {
                                                        mensaje = 'Su pago ha sido aprobado'

                                                        email = cliente[0]['email']
                                                        asunto = 'Pago aprobado'
                                                        encabezado = 'este mail es muy importante'
                                                        await enviodemail.enviarmail.enviarmail(email, asunto, encabezado, mensaje)


                                                    } catch (error) {
                                                      //  console.log(error)
                                                    }

                                                }







                                            }



                                        }


                                    }

                                } catch (error) {
                                }

                            }

                        }
                    } catch (error) {
                       // console.log(error)
                    }
                    i += 1
                } //// fin comparacion de estractos


            } catch (error) {
               // console.log(error)
            }


            //////////////////////////////
            const id_cuota = existe[0]["id"]
           

            //////////   regisTro aprobacion de pago  

            /////////////////////comparacion 
            if (estadoo === 'A') {
                newLink = {
                    id_cuota,
                    monto,
                    cuil_cuit,
                    mes,
                    fecha: fechapago,
                    estado: estadoo,
                    anio,
                    cuil_cuit_distinto,
                    monto_distinto,
                    monto_inusual,
                    ubicacion: formData.file.originalFilename,///////////aca ver el problema
                    id_cbu,
                    yarealizado

                };
                await pagodecuota.pagodecuota(idcuotas, monto)



            } else {
                newLink = {
                    id_cuota,
                    monto,
                    cuil_cuit,
                    mes,
                    estado: estadoo,
                    anio,
                    fecha: fechapago,
                    cuil_cuit_distinto,
                    monto_distinto,
                    monto_inusual,
                    ubicacion: formData.file.originalFilename,///////////aca ver el problema
                    id_cbu,
                    observaciones: 'Inusual',
                    yarealizado

                };

            }


            await pool.query('INSERT INTO pagos SET ?', [newLink]);
            /////////FIN ETC PAGO 
            res.send('Recibimos exitosamente la notificacion del pago, notificaremos cuando sea corroborado')

        } else {
            res.send('Error la cuota no existe')
        }
        /////
    } catch (error) {
       // console.log(error)
        res.send('Error la cuota no existe, elegir una fecha valida')
    }
    try {
        ///guardado de 
        
            try {
        await uploadFileToS3(formData.file, "mypdfstorage");
        
        
    }catch{console.log(error)}
    } catch (ex) {
      //  console.log('NOOO  ')
    }
}


/////////////////////pagar nivel 2 directamente aprobado 
async function pagonivel2(req, res) {

    formData = await leerformlegajo(req);

    const myArray = formData.datos.split(",");
  
    cuil_cuit_administrador = myArray[0] /// del administrador
    id = myArray[1]
    monto = myArray[2]
    cbupago = myArray[4]
    fecha=myArray[3]
    if (cbupago==''){
        cbupago=0
    }
    ///
    ///INICIO GUARDADO DE PAGO


    let cuil_cuit_distinto = 'No'
    let monto_distinto = 'No'
    let monto_inusual = 'No'
    let mensaje = ''

    const cuota = await pool.query('select * from cuotas where id = ?', [id]) //objeto cuota

    aux = '%' + cuota[0]["cuil_cuit"] + '%'

    cuil_cuit = cuota[0]["cuil_cuit"]

    Saldo_real = parseFloat(cuota[0]["Saldo_real"])


    mes = cuota[0]["mes"]
    anio = cuota[0]["anio"]

    estado = 'A'

    if (cuota[0]['parcialidad'] === 'Final') {
        /// traer la ultima

        let cliente = await pool.query('Select * from clientes where cuil_cuit like ? ', [aux])
        ///////////////////CONSIDERAR PEP
        let variante = 0.3
        if (cliente[0]['expuesta'] == "SI") {
            console.log('expuesta')
            variante = 0.2
        }
        montomax = cliente[0]['ingresos'] * variante
        console.log(montomax)
        const id_cuota = id
        if (montomax < monto) {

            monto_inusual = 'Si'
        }
        if (monto_inusual == 'Si') {

            const newLink2 = {
                id_cuota,
                monto,
                cuil_cuit,
                mes,
                estado: estado,
                anio,
                proceso: "averificarnivel3",
                cuil_cuit_administrador,
                ubicacion: formData.file.originalFilename,///////////aca ver el problema
                fecha

            };
            await pool.query('INSERT INTO historial_pagosi SET ?', [newLink2]);

        }





        const newLink = {
            id_cuota,
            monto,
            fecha,
            cuil_cuit,
            mes,
            estado: estado,
            anio,
            cuil_cuit_administrador,
            cuil_cuit_distinto,
            monto_distinto,
            monto_inusual,
            id_cbu:cbupago,
            ubicacion: formData.file.originalFilename,///////////aca ver el problema

        };

        await pool.query('INSERT INTO pagos SET ?', [newLink]);

        /////////FIN  GUARDADO DE PAGO
        ///INICIO IMPACTO EN LA CUOTA
        await pagodecuota.pagodecuota(id, monto)
        ///FIN IMPACTO EN LA CUOTAconsole.log('Realizado')
        const cuota = await pool.query('select * from cuotas where id = ?', [id]) //objeto cuota
        aux = cuota[0]["cuil_cuit"]
        mensaje = 'Pago realizado'

    } else {
        mensaje = 'cuota no calculada'
    }

    try {


        
            try {
        await uploadFileToS3(formData.file, "mypdfstorage");
       
        
    }catch(error){console.log(error)}
 res.json([mensaje, cuota[0]['cuil_cuit'],cuota[0]['id_lote']])
    } catch (ex) {
      // console.log('NOOO  ')
      console.log(ex)
    }
}


async function pagarnivel2varios(req, res) {

    formData = await leerformlegajo(req);

    const myArray = formData.datos.split(",");
  
    cuil_cuit_administrador = myArray[0] /// del administrador

    fecha = myArray[1]
    id = myArray[2]


    ///INICIO GUARDADO DE PAGO


    let cuil_cuit_distinto = 'No'
    let monto_distinto = 'No'
    let monto_inusual = 'No'
    let mensaje = ''

    const cuota = await pool.query('select * from cuotas where id = ?', [id]) //objeto cuota
    aux = '%' + cuota[0]["cuil_cuit"] + '%'

    cuil_cuit = cuota[0]["cuil_cuit"]
    let cuota_con_ajuste = cuota[0]["cuota_con_ajuste"]
    let saldo_realc = cuota[0]["Saldo_real"]
    Saldo_real = parseFloat(cuota[0]["Saldo_real"])
    let nro_cuota = cuota[0]["nro_cuota"]
    let id_lote = cuota[0]["id_lote"]
    let Amortizacion = cuota[0]["Amortizacion"]
    let diferencia = cuota[0]["diferencia"]






    mes = cuota[0]["mes"]
    anio = cuota[0]["anio"]

    estado = 'A'

    if (cuota[0]['parcialidad'] === 'Final') {
        /// traer la ultima

        ///

        /////////FIN  GUARDADO DE PAGO



        let regex = /(\d+)/g;
        monto = 0
        for (iii = 3; iii < (myArray.length); iii++) {


            auxxx = myArray[iii].split(":")

            idd = auxxx[0].match(regex)
            mont = auxxx[1].match(regex)

            if (mont.length > 1) {
                mont = [mont[0] + "." + mont[1]]
            }

            idd = parseInt(idd[0])
            mont = parseFloat(mont[0])
       
            monto = monto + mont

            await pagodecuota.pagodecuota(idd, mont)

        }


        //pagodecuota.pagodecuota(id, monto)

        const cuota = await pool.query('select * from cuotas where id = ?', [idd]) //objeto cuota
        aux = cuota[0]["cuil_cuit"]
        mensaje = 'Pagos realizados'


        let cliente = await pool.query('Select * from clientes where cuil_cuit like ? ', [aux])


        montomax = cliente[0]['ingresos'] * 0.3
   
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


    } else { mensaje = 'una de las cuotas no estaba calculada' }
    try {


        
            try {
        await uploadFileToS3(formData.file, "mypdfstorage");
        
       
    }catch{console.log(error)} res.json(['mensaje', aux])


    } catch (ex) {
     
    }
}

//////
async function justificar(req, res) {

    formData = await leerformlegajo(req);

    const myArray = formData.datos.split(",");
  
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


        
            try {
        await uploadFileToS3(formData.file, "mypdfstorage");
        
        
    }catch{console.log(error)}


    } catch (ex) {
    
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
    pagonivel2,
    pagarnivel2varios,
    traerImagen,
    determinaringreso,
    pagarnivel1cuota,
    getSignedUrl2
}