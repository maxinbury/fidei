const express = require('express')
const router = express.Router()
const pool = require('../database')

router.get('/leer/:id', async (req, res) => {
    id = req.params.id

    try {
        const noti = await pool.query('select * from notificaciones where id = ?', [id]);
        console.log(noti)

        const update={
            leida:'Si'
        }
        await pool.query('UPDATE notificaciones set ? WHERE id = ?', [update, id])
        res.json(noti[0])

    } catch (error) {
        res.json(error)
    }
  

})

router.get('/cantidad/:cuil_cuit', async (req, res) => {
    cuil_cuit = req.params.cuil_cuit
const aux = '%'+cuil_cuit+'%'
    try {
        const noti = await pool.query('select count(*) from notificaciones where leida="No" and cuil_cuit like ?', [aux]);
        console.log(noti[0]["count(*)"])

      
   
        res.json(noti[0]["count(*)"])

    } catch (error) {
        res.json(error)
    }
  

})


module.exports = router

