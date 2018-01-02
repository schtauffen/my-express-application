const sa = require('superagent')

const user = (userId, name) => ({ userId, name })
const users = [
  user('zd1', 'Zach Dahl'),
  user('nay', 'Andrea Hunt'),
  user('test', 'Test McTesterson')
]

Promise.all(users.map(data => {
  sa.post('http://localhost:3000/users')
    .send(data)
    .then(response => console.log(response.body))
}))

