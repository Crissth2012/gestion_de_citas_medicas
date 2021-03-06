import jwt from 'jwt-simple'
import express from 'express'
import { hashear } from '../libs/utiles'
import Pacientes from '../models/pacientes'
import Administradores from '../models/administradores'

const router = express.Router()
const SECRET = 'JyKbgowtVg4HSx7eOrPW'

export function getVerificador (tipos) {
  return (req, res, next) => {
    try {
      if (req.method === 'GET') { return next() }
      const token = req.cookies.tokenAdmin || req.headers.authorization || req.query.token
      if (!token) {
        res.status(500).send('No se proporcionó el token')
        return
      }
      const decodificado = jwt.decode(token, SECRET)
      if (!tipos.includes(decodificado.tipo)) {
        res.status(500).send('Su usuario no tiene autorización para esta función')
        return
      }
      req.payload = decodificado
      next()
    } catch (err) {
      res.status(500).send(err.toString())
    }
  }
}

export function getVerificadorPaciente () {
  return (req, res, next) => {
    try {
      const token = req.cookies.tokenPaciente
      if (!token) {
        res.status(500).send('No se proporcionó el token de paciente')
        return
      }
      const decodificado = jwt.decode(token, SECRET)
      req.payload = decodificado
      next()
    } catch (err) {
      res.status(500).send(err.toString())
    }
  }
}

router.get('/administrador', async (req, res) => {
  try {
    const token = req.headers.authorization || req.query.token
    const decodificado = jwt.decode(token, SECRET)
    res.send(await Administradores.findOne({
      _id: decodificado.usuario
    }, 'nombre correo'))
  } catch (err) { res.status(500).send(err.toString()) }
})

router.post('/administrador', async (req, res) => {
  try {
    const administrador = await Administradores.findOne({
      correo: req.body.correo
    })
    if (!administrador) {
      res.status(500).send('No existe el administrador')
      return
    } else if (administrador.contrasena !== hashear(req.body.contrasena)) {
      res.status(500).send('Contraseña incorrecta')
    } else {
      res.send(jwt.encode({
        usuario: administrador._id,
        tipo: 'admin'
      }, SECRET))
    }
  } catch (err) { res.status(500).send(err.toString()) }
})

router.get('/paciente', async (req, res) => {
  try {
    const token = req.headers.authorization || req.query.token
    const decodificado = jwt.decode(token, SECRET)
    res.send(await Administradores.findOne({
      _id: decodificado.usuario
    }, 'nombre correo'))
  } catch (err) { res.status(500).send(err.toString()) }
})

router.post('/paciente', async (req, res) => {
  try {
    const paciente = await Pacientes.findOne({
      correo: req.body.correo
    })
    if (!paciente) {
      res.status(500).send('No existe el paciente')
      return
    } else if (paciente.contrasena !== hashear(req.body.contrasena)) {
      res.status(500).send('Contraseña incorrecta')
    } else {
      res.send(jwt.encode({
        usuario: paciente._id,
        tipo: 'paciente'
      }, SECRET))
    }
  } catch (err) { res.status(500).send(err.toString()) }
})

export default router
