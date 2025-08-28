const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((user) => {
      return user.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
      return true;
  } else {
      return false;
  }
}

const authenticatedUser = (username,password)=>{ //returns boolean
  // Filter the users array for any user with the same username and password
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  // Return true if any valid user is found, otherwise false
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
  }
  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({data: password}, 'access', { expiresIn: 60 * 60 });

  // Store access token and username in session
     req.session.authorization = {accessToken, username}
     return res.status(200).send("User successfully logged in");
  } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { rating, comment } = req.body;
  const username = req.session.authorization.username; // usuario autenticado en la sesión

  // Validar sesión
  if (!username) {
    return res.status(401).json({ message: "Debes iniciar sesión para agregar reseñas" });
  }

  // Buscar el libro por ISBN
  const book = Object.values(books).find(book => book.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: "Libro no encontrado" });
  }

  // Validar datos
  if (!rating || !comment) {
    return res.status(400).json({ message: "Faltan datos (rating, comment)" });
  }

  // Guardar o modificar reseña
  book.reviews[username] = { rating, comment };

  return res.status(200).json({
    message: "Reseña agregada/modificada exitosamente",
    reviews: book.reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username; // usuario de la sesión

  // Verificar que el usuario esté logueado
  if (!username) {
    return res.status(401).json({ message: "Debes iniciar sesión para eliminar una reseña" });
  }

  // Buscar libro por ISBN
  const book = Object.values(books).find(book => book.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: "Libro no encontrado" });
  }

  // Verificar que el usuario tenga reseña en ese libro
  if (!book.reviews[username]) {
    return res.status(403).json({ message: "No tienes reseñas en este libro para eliminar" });
  }

  // Eliminar la reseña del usuario
  delete book.reviews[username];

  return res.status(200).json({
    message: "Reseña eliminada exitosamente",
    reviews: book.reviews
  });
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
