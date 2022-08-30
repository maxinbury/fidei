const formidable = require('formidable');
const {uploadFileToS3, getBucketListFromS3, getPresignedURL} = require('./s3-service');

async function s3Upload (req, res) {

  
    const  formData = await readFormData(req);

   //  const etc =  req.formData
   
   console.log(formData.name)
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
        form.on('ingreso', (name, file) => {
           
            dataObj.name = name;
            dataObj.file = file;
            console.log(name)
            console.log(file)
            console.log(dataObj.name)
          
        });
       
         ///
        form.on('end', () => {
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

module.exports = {
    s3Upload,
    s3Get,
    getSignedUrl
}
