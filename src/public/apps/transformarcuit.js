


function ponerguion (cuil_cuit) {
      
    cuil_cuit =  (cuil_cuit).slice(0, 2) + "-" + (cuil_cuit).slice(2);
    
     
    cuil_cuit =  (cuil_cuit).slice(0, 11) + "-" + (cuil_cuit).slice(11);
  return cuil_cuit
     
}

function sacarguion (cuil_cuit) {
  
  newWord = cuil_cuit.replace(/-/g, '')    
  return newWord
}

exports.sacarguion = sacarguion

exports.ponerguion = ponerguion