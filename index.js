const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())

morgan.token('body', (req, res) => {
      return JSON.stringify(req.body); // Log the request body for POST requests
})
  
app.use(morgan(':method :url :status :response-time ms :body'));


let persons =[
    {
        id: "1",
        name: "Joona Mäkinen",
        number: "040-123123"
    },
    {
        id: "2",
        name: "Ada Lovelace",
        number: "041-321231"
    },
    {
        id: "3",
        name: "Masi Meikäläinen",
        number: "050-125123"
    },
    {
        id: "4",
        name: "Juha Mieto",
        number: "020202"
    },
]

app.get('/', (request, response) => {
    response.send('<h1>Puhelinluettelo</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/info', (request, response) => {
    const currentTime = new Date().toString();
    const numberOfEntries = persons.length;

    response.send(
        `Puhelinluettelossa on ${numberOfEntries} henkilöä.</br>Pyyntö tehtiin ${currentTime}.`
    );
});

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(persons => persons.id === id)
    if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
  })

app.post('/api/persons',(request, response) =>{
    const body = request.body

    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'Nimi tai numero puuttuu' 
        });
    }

    if (persons.some(person => person.name === body.name)) {
        return response.status(400).json({ 
            error: 'Nimi on jo luettelossa' 
        });
    }

    const newPerson ={
        id: Math.floor(Math.random() * 100000).toString(),
        name: body.name,
        number: body.number,
    }

    persons = persons.concat(newPerson)

    response.json(newPerson)

})

  app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    const index = persons.findIndex(person => person.id === id);

    if (index !== -1) {
        persons.splice(index, 1);
        response.status(204).end();
    } else {
        response.status(404).end();
    }
});

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
