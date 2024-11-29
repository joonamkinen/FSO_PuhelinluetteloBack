require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()



app.use(express.static('dist'))
app.use(express.json())

morgan.token('body', (req) => {
  return JSON.stringify(req.body) // Log the request body for POST requests
})

app.use(morgan(':method :url :status :response-time ms :body'))


app.use(cors())



let persons =[
  {
    id: '1',
    name: 'Joona Mäkinen',
    number: '040-123123'
  },
  {
    id: '2',
    name: 'Ada Lovelace',
    number: '041-321231'
  },
  {
    id: '3',
    name: 'Masi Meikäläinen',
    number: '050-125123'
  },
  {
    id: '4',
    name: 'Juha Mieto',
    number: '020202'
  },
]



app.get('/', (request, response) => {
  response.send('<h1>Puhelinluettelo</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/info', (request, response) => {
  const currentTime = new Date().toString()
  const numberOfEntries = persons.length

  response.send(
    `Puhelinluettelossa on ${numberOfEntries} henkilöä.</br>Pyyntö tehtiin ${currentTime}.`
  )
})

app.get('/api/persons/:id', (request, response,next) => {
  Person.findById(request.params.id)
    .then(person => {
      if(person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons',(request, response, next) => {
  const body = request.body


  const newPerson = new Person({
    name: body.name,
    number: body.number,
  })

  newPerson.save()
    .then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id',(request, response,next) => {
  const { name, number } = request.body


  Person.findByIdAndUpdate(
    request.params.id,{ name , number },
    { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}


const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError'){
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
