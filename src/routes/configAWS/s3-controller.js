const formidable = require('formidable');
const {uploadFileToS3, getBucketListFromS3, getPresignedURL} = require('./s3-service');
const express = require('express')
const router = express.Router()
const pool = require('../../database')



async function s3Upload (req, res) {
 let {ingreso, formData} = req.body
 
      formData = await readFormData(req);
   
     console.log(formData.ingreso)
     console.log(formData.ingresoo)

      
   //  const etc =  req.formData
   
 //  console.log(formData)
  // console.log(formData.name)  FILE
   //console.log(formData.ingreso) falla
    // falla console.log(req.formdata.ingreso)
        
    try{ 
        
      
        await uploadFileToS3(formData.file, "mypdfstorage");
       
        res.send('Uploaded!!');
    } catch(ex) {
        res.send('ERROR!!!!');
    }
}

async function s3Get (req, res) {
    console.log('1');
    try{
        console.log('2');
        const bucketData = await getBucketListFromS3("mypdfstorage");
        const {Contents = []} = bucketData;
        res.header("Access-Control-Allow-Origin", "*"); 
        res.send(Contents.map(content => {
        return {
            key: content.Key,
            size: (content.Size/1024).toFixed(1) + ' KB',
            lastModified: content.LastModified
        }
    }));
    } catch(ex) {
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

        const {key} = req.params;
        const url = await getPresignedURL("mypdfstorage", key);
        res.send(url);

    } catch(ex) {
        res.send('');
    }
}



////////
async function subirlegajo (req, res) {
    
         formData = await leerformlegajo(req);
      
      // console.log(formData.file.originalFilename)
      
       console.log(formData.datos)
       const myArray = formData.datos.split(",");
       cuil_cuit =myArray[0]
       tipo= myArray[1]
       descripcion = myArray[2]
      
       
   
       const datoss = {
        ubicacion: formData.file.originalFilename,
        cuil_cuit:cuil_cuit,
        tipo:tipo,
        descripcion:descripcion,
        estado:'Aprobada'

    }
   
  try {
   await pool.query('insert into constancias set?', datoss)
  } catch (error) {
    
  }
        

    
           
       try{ 
      
         
      await uploadFileToS3(formData.file, "mypdfstorage");
          console.log(' Uploaded!!  ')
          
         
          
       } catch(ex) {
        console.log('NOO')
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
            dataObj.file.originalFilename =  Date.now() +'-legajo-' + file.originalFilename
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

async function subirlegajo1 (req, res) {
    
    formData = await leerformlegajo(req);
 
    const myArray = formData.datos.split(",");
    console.log(myArray)
    cuil_cuit =myArray[0]
    tipo= myArray[1]
    descripcion = myArray[2]
   
    

    const datoss = {
     ubicacion: formData.file.originalFilename,
     cuil_cuit:cuil_cuit,
     tipo:tipo,
     descripcion:descripcion,
    estado:'Pendiente'}
     
try {
await pool.query('insert into constancias set?', datoss)
} catch (error) {

}
   


      
  try{ 
 
    
      await uploadFileToS3(formData.file, "mypdfstorage");
     console.log(' Uploaded!!  ')
     
    
     
  } catch(ex) {
   console.log('NOOO  ')
  }
}
////cargarcbu

async function cargarcbu (req, res) {
    
    formData = await leerformlegajo(req);
 
    const myArray = formData.datos.split(",");
    
    cuil_cuit =myArray[0]
    numero= myArray[1]
    lazo = myArray[2]
  
   

    const datoss = {
     ubicacion: formData.file.originalFilename,
     cuil_cuit,
     numero,
     lazo,
     estado:"P",
     
    }
    console.log(datoss)
     
try {
await pool.query('insert into cbus set?', datoss)


} catch (error) {
console.log(error)
}
   


      
  try{ 
 
    
    await uploadFileToS3(formData.file, "mypdfstorage");
     console.log(' Uploaded!!  ')
     
    
     
  } catch(ex) {
   console.log('NOOO  ')
  }
} 
//////////////pago
async function pagarniv1 (req, res) {
    
    formData = await leerformlegajo(req);
   
    const myArray = formData.datos.split(",");
    console.log(myArray)
    cuil_cuit =myArray[0]
    id= myArray[1]
    monto = myArray[2]
   
    

try {
//// realizar el pago
let estadoo = 'P'


let cuil_cuit_distinto = 'Si'
let monto_distinto = 'Si'
let monto_inusual = 'No'
aux = '%' + cuil_cuit + '%'
   
    let  existe = await pool.query('Select * from cuotas where  id_lote=? and parcialidad = "Final"  order by nro_cuota', [id])
  
    ultima = ((existe.length)-1)

  
    
    id_cuota = existe[ultima]['id']
    mes = existe[ultima]['mes']
    anio = existe[ultima]['anio']
    estado = existe[ultima]['estado']
  
    if (existe.length > 0) {
        /// traer la ultima
        
         ///
        
        let cliente  = await pool.query('Select * from clientes where cuil_cuit like ? ', [aux])
       
       
            montomax = cliente[0]['ingresos'] * 0.3
            console.log(4)
            if (montomax < monto) {

                monto_inusual='Si'
            }

      
       

        const id_cuota = existe[0]["id"]
        console.log(id_cuota)
        if (estado != 'A') {
            console.log(1)
            const newInu = {
                id_cuota,
                cuil_cuit,
                estado,
                mes,
                anio,
             
    
            };
            console.log(1)
            await pool.query('INSERT INTO historial_pagosi SET ?', [newInu]);
            console.log(1)
      
        const newLink = {
            id_cuota,
            monto,
            cuil_cuit,
            estado,
            mes,
            estado: estadoo,
            anio,
            cuil_cuit_distinto,
            monto_distinto,
            monto_inusual,
            ubicacion: formData.file.originalFilename,///////////aca ver el problema

        };
      
        await pool.query('INSERT INTO pagos SET ?', [newLink]);
        
        

    }   }else {
        res.send('Error la cuota no existe')


    }

/////
} catch (error) {

}
   


      
  try{ 
 
    
   await uploadFileToS3(formData.file, "mypdfstorage");
     console.log(' Uploaded!!  ')
     
    
     
  } catch(ex) {
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
    cargarcbu
}