/* express = require('express')
  let poool = require('../database/db') */
let miboton = document.getElementById("miboton")

var monto = parseFloat(document.getElementById("monto").value)


let comprobar = document.getElementById("comprobar")

comprobar.addEventListener('click', validar)
//monto.addEventListener('blur', validar);

function validar () {
  
 alert(monto)

       }

//miboton.addEventListener("click",calcularrr)




const calcularr = async()  =>{
  
    let nombre = await ('select * from users where cuil_cuit= "34825125"')
    console.log(nombre)
       // let aux = document.getElementById("uno")
       //alert(nombre[0]['nombre'])
    //  let a = 'sadas-sad-as-das-das-'
   //   let  b = a.Split();
}

 function calcular () {
  let a = 'sadas-sad-as-das-das-'
    let  b = a.split('-');
    console.log(uno)

       }


     async  function calcularrr () {
        let nombre = await  ('select * from users where cuil_cuit= "34825125"')
        console.log(nombre)
             }

 

