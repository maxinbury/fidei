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
      
       console.log(formData.file.originalFilename)
       console.log(formData.datos)
      
       const datoss = {
        ubicacion: formData.file.originalFilename,
        cuil_cuit:formData.datos

    }
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
            dataObj.cuil_cuit = fieldName;
            dataObj.datos = fieldValue;
     
        
          
        });
      
         ///
        form.on('end', () => {
            //console.log(dataObj)
            resolve(dataObj);
        });
    });
}

async function subirlegajo1 (req, res) {
    
    formData = await leerformlegajo(req);
 
  console.log(formData.file.originalFilename)
  console.log(formData.datos)
 
  const datoss = {
   ubicacion: formData.file.originalFilename,
   cuil_cuit:formData.datos,
   estado : 'P'

}
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
module.exports = {
    s3Upload,
    s3Get,
    getSignedUrl,
    subirlegajo
}
