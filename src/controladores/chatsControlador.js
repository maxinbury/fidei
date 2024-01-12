const pool = require('../database')




const noleidos = async (req, res) => {
    const usuarios = await pool.query('select cuil_cuit from chats where leido="NO" group by cuil_cuit')

    res.render('chats/noleidos', {usuarios})
}


const conversacion = async (req, res) => {
    let cuil_cuit = req.params.cuil_cuit
  
 
   const aux = '%'+cuil_cuit+'%'
   try {
    const chat = await pool.query('select * from chats left join clientes on chats.cuil_cuit = clientes.cuil_cuit  where chats.cuil_cuit like ?',[aux])
    for (var i = 0; i < chat.length; i++) {
        if (chat[i]['leido'] ='NO') {
            await pool.query('UPDATE chats SET leido = "SI" WHERE id=? ',[chat[i]['id']])
        }
     
    }
    res.render('chats/conversacion', {chat})
} catch (error) {
   // console.log(error)
    res.render('profile')
}
   
}

const postenviar = async (req, res) => {
    const { mensaje_nivel2, cuil_cuit} = req.body;
    const contestadopor = req.user.cuil_cuit

        try {
        
        const newr = {
            mensaje_nivel2,
            cuil_cuit,
          contestadopor
        }
        
        await pool.query('INSERT INTO chats SET ?', [newr])
       
        res.redirect(`/chats/conversacion/`+ cuil_cuit);
    } catch (error) {
        console.log(error)   
        res.redirect(`/profile`);
    }
    

}
module.exports = {
    noleidos,
    conversacion,
    postenviar




}