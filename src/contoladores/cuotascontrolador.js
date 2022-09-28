const pool = require('../database')




////////////cuotas de un lote, react
const cuotasdeunlote = async (req, res) => {
   const id = req.params.id
   console.log(id)
    const cuotas = await pool.query('SELECT * FROM  cuotas where id_lote = ? and parcialidad ="Final"',[id])
    console.log(cuotas)


    res.json(cuotas)

}



//Lista 
const lista = async (req, res) => {

    const cuotas = await pool.query('SELECT * FROM  cuotas ')


    res.render('cuotas/lista', { cuotas })

}

//ampliar

const ampliar = async (req, res) => {
    const cuil_cuit = req.params.cuil_cuit
    let aux = '%' + cuil_cuit + '%'

    const cuotas = await pool.query('SELECT * FROM cuotas where cuil_cuit like ?', [aux])
    res.render('cuotas/listaamp', { cuotas })
}




const add_cliente = async (req, res) => {
    const id = req.params.id
    client = await pool.query('select * from lotes  where id = ?', [id])
    console.log(client)
    cuil_cuit = client[0]['cuil_cuit']
    let aux = '%' + cuil_cuit + '%'

    const cliente = await pool.query('SELECT * FROM  clientes left join lotes on clientes.cuil_cuit = lotes.cuil_cuit where clientes.cuil_cuit like ? and lotes.id = ?', [aux, id])
    console.log(cliente)
    res.render('cuotas/add', { cliente })

}

const postadd = async (req, res) => {
    const { saldo_inicial, saldo_cierre, cuil_cuit } = req.body;
    const newLink = {
        saldo_inicial,
        saldo_cierre,
        cuil_cuit
    };

    await pool.query('INSERT INTO cuotas SET ?', [newLink]);

    req.flash('success', 'Guardado correctamente')
    res.redirect('/cuotas');

}

const postaddaut = async (req, res) => {
    var { id, monto_total, cantidad_cuotas, lote, mes, anio, zona, manzana, fraccion, lote, anticipo,parcela } = req.body;

    const lot = await pool.query('SELECT * from lotes where id= ?', [id])
    cuil_cuit = lot[0]['cuil_cuit']

    let aux = '%' + cuil_cuit + '%'

    const row = await pool.query('SELECT * from clientes where cuil_cuit like ?', [aux])
    //llega
    try {
        if (row[0]['ingresos'] == 0) {

            req.flash('message', 'Error, el cliente no tiene ingresos declarados ')
            res.redirect('/links/detallecliente/' + cuil_cuit)

        } else {
            monto_total -= anticipo
            anticipolote = {
                anticipo
            }

            //llega
            const Amortizacion = monto_total / cantidad_cuotas;
            let toleranciadec = row[0]['toleranciadec'] + Amortizacion
            let tolerancia = row[0]['ingresos'] * 0.3

            if (tolerancia < toleranciadec) {
                req.flash('message', 'Error, la amortizacion del valor de la cuota  es mayor al 30% de los ingresos declarados')
                res.redirect('http://localhost:4000/links/clientes/todos')


            } else {

                let nro_cuota = 1
                let saldo_inicial = monto_total


                if (row.length > 0) {
                    var saldo_cierre = saldo_inicial - Amortizacion
                    const Saldo_real = saldo_inicial
                    const id_cliente = row[0].id

                    try {

                        let actualizar = {
                            toleranciadec
                        }
                        await pool.query('UPDATE clientes set ? WHERE cuil_cuit like ?', [actualizar, aux])

                        for (var i = 1; i <= cantidad_cuotas; i++) {
                            nro_cuota = i
                            const newLink = {
                                //fecha,
                                mes,
                                anio,
                                nro_cuota,
                                Amortizacion,
                                saldo_inicial,
                                saldo_cierre,
                                cuil_cuit,
                                id_cliente,
                                zona,
                                manzana,
                                fraccion,
                                lote,
                                Saldo_real,
                                parcela,
                                anticipo

                            };
                            mes++

                            if (mes > 12) {

                                anio++
                                mes -= 12
                            }

                            await pool.query('INSERT INTO cuotas SET ?', [newLink]);



                            saldo_inicial -= Amortizacion
                            saldo_cierre = saldo_inicial - Amortizacion
                        }

                    } catch (error) {
                        console.log(error)
                    }


                    await pool.query('UPDATE lotes set ? WHERE id = ?', [anticipolote, id])

                    req.flash('success', 'Guardado correctamente')
                    res.redirect('/links/detallecliente/' + cuil_cuit)
                }


                else {
                    req.flash('message', 'Error cliente no existe')
                    res.redirect('links/clientes/todos')
                }

            }


        }


    } catch (error) {
        console.log(error)

    }


}

const postaddaut2 = async (req, res) => {
    var { id, cantidad_cuotas, lote, mes, anio, zona, manzana, fraccion, lote,parcela } = req.body;
    
    console.log(cantidad_cuotas)
    


    if (cantidad_cuotas == undefined){
        cantidad_cuotas=60
    }
    console.log(cantidad_cuotas)
    id_lote= id
    const lot = await pool.query('SELECT * from lotes where id= ?', [id])
    cuil_cuit = lot[0]['cuil_cuit']
    lote = lot[0]['lote']
    zona = lot[0]['zona']
    manzana = lot[0]['manzana']
    fraccion = lot[0]['fraccion']
    parcela = lot[0]['parcela']
    superficie= lot[0]['superficie']


    let aux = '%' + cuil_cuit + '%'

    const row = await pool.query('SELECT * from clientes where cuil_cuit like ?', [aux])
    //llega
    try {
        if (zona=='PIT'){
            valormetro= await pool.query('select * from nivel3 where valormetroparque = "PIT" order by id')
        }else {
            valormetro= await pool.query('select * from nivel3 where valormetroparque = "IC3" order by id')
        }
        
        valor = valormetro[(valormetro.length-1)]['valormetrocuadrado']
        console.log(valor)
        
        monto_total = valor*superficie
        anticipo = monto_total*0.2
        if (row[0]['ingresos'] == 0) {
            rtaa=[cuil_cuit,'Error, el cliente no tiene ingresos declarados ']
            
          
           

        } else {
            monto_total -= anticipo
            anticipolote = {
                anticipo
            }

            //llega
            const Amortizacion = monto_total / cantidad_cuotas;
            let toleranciadec = row[0]['toleranciadec'] + Amortizacion
            let tolerancia = row[0]['ingresos'] * 0.3

            if (tolerancia < toleranciadec) {
             

                
                ///////[cuil_cuit,'Error, el cliente no tiene ingresos declarados ']
                rtaa= [cuil_cuit,'Error, la amortizacion del valor de la cuota  es mayor al 30% de los ingresos declarados']
                res.send( )


            } else {

                let nro_cuota = 1
                let saldo_inicial = monto_total


                if (row.length > 0) {
                    var saldo_cierre = saldo_inicial - Amortizacion
                    if (nro_cuota ==1){
                         Saldo_real = monto_total
                    }else{
                         Saldo_real = saldo_inicial
                    }
                    
                    const id_cliente = row[0].id

                    try {

                        let actualizar = {
                            toleranciadec
                        }
                        await pool.query('UPDATE clientes set ? WHERE cuil_cuit like ?', [actualizar, aux])

                        for (var i = 1; i <= cantidad_cuotas; i++) {
                            nro_cuota = i
                            const newLink = {
                                //fecha,
                                mes,
                                anio,
                                nro_cuota,
                                Amortizacion,
                                saldo_inicial,
                                saldo_cierre,
                                cuil_cuit,
                                id_cliente,
                                zona,
                                manzana,
                                fraccion,
                                lote,
                                Saldo_real,
                                parcela,
                                anticipo,
                                id_lote,
                                pago:0

                            };
                            mes++

                            if (mes > 12) {

                                anio++
                                mes -= 12
                            }

                            await pool.query('INSERT INTO cuotas SET ?', [newLink]);



                            saldo_inicial -= Amortizacion
                            saldo_cierre = saldo_inicial - Amortizacion
                        }

                    } catch (error) {
                        res.send([cuil_cuit,'Error, algo sucedio'])
                    }


                    await pool.query('UPDATE lotes set ? WHERE id = ?', [anticipolote, id])

                    res.send([cuil_cuit,'Cuotas agregadas con exito'])
                    
                }


                else {
                    res.send([cuil_cuit,'Error, algo sucedio'])
                   
                }

            }


        }


    } catch (error) {
        console.log(error)
        res.send([cuil_cuit,'Erro, algo sucedio'])

    }

    

}
const quelote = async (req, res) => {
    const cuil_cuit = req.params.cuil_cuit
    let aux = '%' + cuil_cuit + '%'

    const lote = await pool.query('SELECT * FROM lotes WHERE cuil_cuit like ?', [cuil_cuit])
    if (lote.length === 0) {
        let aux = '%' + cuil_cuit + '%'

        const cliente = await pool.query('SELECT * FROM clientes WHERE cuil_cuit like ?', [aux])

        res.render('cuotas/notienelote', { cliente })

    } else { res.render('cuotas/quelote', { lote }) }

}



const lotefuncion = async (req, res) => {
    const id = req.params.id
    console.log('controladorloteduncion')
    console.log(id)
    let auxiliar = await pool.query('Select * from lotes where id =?', [id])
    console.log(auxiliar)
    zona = auxiliar[0]['zona']
    manzana = auxiliar[0]['manzana']
    fraccion = auxiliar[0]['fraccion']
    lote = auxiliar[0]['lote']
    parcela = auxiliar[0]['parcela']
    let cuotas 
    if (zona == 'IC3') {
        cuotas = await pool.query('SELECT * FROM cuotas WHERE zona = ? and manzana = ? and fraccion = ? and lote =  ?', [zona, manzana, fraccion, lote])
    }
    else {
        console.log(zona, manzana, parcela)
        cuotas= await pool.query('SELECT * FROM cuotas WHERE zona = ? and manzana = ? and parcela =  ?', [zona, manzana, parcela])
        
       
    }
    console.log(cuotas)
    if (cuotas.length > 0) {
        res.render('cuotas/lista', { cuotas }) } 
        else {

            let aux = '%' + auxiliar[0]['cuil_cuit'] + '%'
            cliente = await pool.query('SELECT * FROM clientes WHERE cuil_cuit like ? ', [aux])
    
            res.render('cuotas/listavacia', { auxiliar })
    
        }


}



//// para react
const lotefuncion2 = async (req, res) => {
    try {
        const id = req.params.id
        
    
        const cuotas = await pool.query('SELECT * FROM cuotas WHERE id_lote =  ?', [id])

        if (cuotas.length > 0) {
    
            /*      let aux = '%' + auxiliar[0]['cuil_cuit'] + '%'
               cliente = await pool.query('SELECT * FROM clientes WHERE cuil_cuit like ? ', [aux]) */
            res.json(cuotas)
            //res.render('cuotas/listavacia', { auxiliar })
    
        } else {/* res.render('cuotas/lista', { cuotas })*/ res.json('') }
        
    } catch (error) {
        
    }
 
}

/// fin para react

const cuotascli = async (req, res) => {
    const cuil_cuit = req.params.cuil_cuit
    const cuotas = await pool.query('SELECT * FROM cuotas WHERE cuil_cuit = ?', [cuil_cuit])
    if (cuotas.length === 0) {
        let aux = '%' + cuil_cuit + '%'

        const cliente = await pool.query('SELECT * FROM clientes WHERE cuil_cuit like ?', [aux])

        res.render('cuotas/listavacia', { cliente })

    } else { res.render('cuotas/lista', { cuotas }) }

}

const edit_c = async (req, res) => {
    const id = req.params.id
    const cuotas = await pool.query('SELECT * FROM cuotas WHERE id = ?', [id])
    res.render('cuotas/edit', { cuotas })
}


const agregar_icc = async (req, res) => {
    const id = req.params.id
    const cuotas = await pool.query('SELECT * FROM cuotas WHERE id = ?', [id])
    res.render('cuotas/agregaricc', { cuotas })
}

const post_agregaricc = async (req, res,) => {
    const { id, ICC, nro_cuota, cuil_cuit, Amortizacion } = req.body;
    const cuotaa = await pool.query("select * from cuotas where id = ? ", [id])

    const parcialidad = "Final"
    if (nro_cuota == 1) {
        saldo_inicial = cuotaa[0]["saldo_inicial"]
        const Ajuste_ICC = 0
        const Base_calculo = Amortizacion
        const cuota_con_ajuste = Amortizacion
        const Saldo_real = saldo_inicial


        var cuota = {
            ICC,
            Ajuste_ICC,
            Base_calculo,
            cuota_con_ajuste,
            Saldo_real,
            parcialidad
        }
    } else {
        const anterior = await pool.query('Select * from cuotas where nro_cuota = ? and cuil_cuit = ?', [nro_cuota - 1, cuil_cuit])

        var Saldo_real_anterior = anterior[0]["Saldo_real"]
        console.log('Saldo_real_anterior')
            console.log(Saldo_real_anterior)
        const cuota_con_ajuste_anterior = anterior[0]["cuota_con_ajuste"]
        console.log('cuota_con_ajuste_anterior')
        console.log(cuota_con_ajuste_anterior)
        const Base_calculo = cuota_con_ajuste_anterior
        const Ajuste_ICC = cuota_con_ajuste_anterior * ICC

        const cuota_con_ajuste = cuota_con_ajuste_anterior + Ajuste_ICC
        Saldo_real_anterior += Ajuste_ICC
        const Saldo_real = Saldo_real_anterior

        var cuota = {
            ICC,
            Ajuste_ICC,
            Base_calculo,
            cuota_con_ajuste,
            Saldo_real,
            parcialidad

        }

    }
    await pool.query('UPDATE cuotas set ? WHERE id = ?', [cuota, id])
    res.redirect(`/cuotas/cuotas/` + cuil_cuit);



}

const lotes = async (req, res) => {
    const cuil_cuit = req.params.cuil_cuit

    res.render('cuotas/lotes')
}

module.exports = {
    lista,
    ampliar,
    add_cliente,
    postadd,
    postaddaut2,
    postaddaut,
    quelote,
    lotefuncion,
    cuotascli,
    edit_c,
    agregar_icc,
    post_agregaricc,
    lotes,
    lotefuncion2,
    cuotasdeunlote

}