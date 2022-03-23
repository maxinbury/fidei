
function authnivel2 (rol) {
    return (req, res, next)=>{
        if (req.user.rol == 0) {
            res.status(401)
            return res.send("usuario no autorizado")

        }
        next()
    }
}