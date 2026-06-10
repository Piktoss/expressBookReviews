const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user. Username or password missing." });
});

// Task 10: Get the complete book list - using async/await with a Promise
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => new Promise((resolve) => resolve(books));
    const allBooks = await getBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Task 11: Get book details based on ISBN - using Promise callbacks
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const getByIsbn = new Promise((resolve, reject) => {
    const book = books[isbn];
    if (book) {
      resolve(book);
    } else {
      reject("Book not found");
    }
  });
  getByIsbn
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json({ message: err }));
});

// Task 12: Get book details based on author - using async/await
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const getByAuthor = () => new Promise((resolve) => {
      const result = [];
      Object.keys(books).forEach((key) => {
        if (books[key].author === author) {
          result.push({ isbn: key, title: books[key].title, reviews: books[key].reviews });
        }
      });
      resolve(result);
    });
    const booksByAuthor = await getByAuthor();
    if (booksByAuthor.length > 0) {
      return res.status(200).json({ booksbyauthor: booksByAuthor });
    } else {
      return res.status(404).json({ message: "No books found for this author" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Task 13: Get all books based on title - using async/await
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const getByTitle = () => new Promise((resolve) => {
      const result = [];
      Object.keys(books).forEach((key) => {
        if (books[key].title === title) {
          result.push({ isbn: key, author: books[key].author, reviews: books[key].reviews });
        }
      });
      resolve(result);
    });
    const booksByTitle = await getByTitle();
    if (booksByTitle.length > 0) {
      return res.status(200).json({ booksbytitle: booksByTitle });
    } else {
      return res.status(404).json({ message: "No books found with this title" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;