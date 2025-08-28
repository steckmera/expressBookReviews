const axios = require("axios");

const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
    // Check if the user does not already exist
    if (!isValid(username)) {
      // Add the new user to the users array
      users.push({"username": username, "password": password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop with Promise
public_users.get('/', function (req, res) {
  axios.get("http://localhost:5000/books")
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      res.status(500).json({ message: "Error al obtener los libros", error: error.message });
    });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    // Simulamos llamada asíncrona para obtener libros
    const getBooks = () => new Promise((resolve) => {
      setTimeout(() => resolve(Object.values(books)), 500); // simulamos 0.5s de espera
    });

    const allBooks = await getBooks();

    // Filtrar por ISBN
    const filteredBook = allBooks.find(book => book.isbn === isbn);

    if (filteredBook) {
      return res.status(200).json(filteredBook);
    } else {
      return res.status(404).json({ message: "Libro no encontrado" });
    }

  } catch (error) {
    return res.status(500).json({ message: "Error al obtener el libro", error: error.message });
  }
});

  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
  const author = req.params.author.toLowerCase(); // hacemos búsqueda case-insensitive

  try {
    // Simulamos llamada asincrónica para obtener libros
    const getBooks = () => new Promise((resolve) => {
      setTimeout(() => resolve(Object.values(books)), 500); // simulamos 0.5s de espera
    });

    const allBooks = await getBooks();

    // Filtrar libros por autor
    const filteredBooks = allBooks.filter(book => book.author.toLowerCase() === author);

    if (filteredBooks.length > 0) {
      return res.status(200).json(filteredBooks);
    } else {
      return res.status(404).json({ message: "No se encontraron libros de este autor" });
    }

  } catch (error) {
    return res.status(500).json({ message: "Error al obtener libros", error: error.message });
  }
});


// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title.toLowerCase(); // búsqueda case-insensitive

  try {
    // Simulamos llamada asincrónica para obtener libros
    const getBooks = () => new Promise((resolve) => {
      setTimeout(() => resolve(Object.values(books)), 500); // simulamos 0.5s de espera
    });

    const allBooks = await getBooks();

    // Filtrar libros por título
    const filteredBooks = allBooks.filter(book => book.title.toLowerCase() === title);

    if (filteredBooks.length > 0) {
      return res.status(200).json(filteredBooks);
    } else {
      return res.status(404).json({ message: "No se encontraron libros con este título" });
    }

  } catch (error) {
    return res.status(500).json({ message: "Error al obtener libros", error: error.message });
  }
});


//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  //let filtered_books = books.filter((book) => book.isbn === isbn); 
  const book = Object.values(books).find(book => book.isbn === isbn);
  res.json({ reviews: book.reviews });
});

module.exports.general = public_users;
