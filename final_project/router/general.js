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

/* ---- Internal data routes: these serve the raw data that the Axios routes below call ---- */
public_users.get('/internal/books', (req, res) => {
  return res.status(200).json(books);
});

public_users.get('/internal/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (book) return res.status(200).json(book);
  return res.status(404).json({ message: "Book not found" });
});

public_users.get('/internal/author/:author', (req, res) => {
  const result = [];
  Object.keys(books).forEach((k) => {
    if (books[k].author === req.params.author) {
      result.push({ isbn: k, title: books[k].title, reviews: books[k].reviews });
    }
  });
  return res.status(200).json({ booksbyauthor: result });
});

public_users.get('/internal/title/:title', (req, res) => {
  const result = [];
  Object.keys(books).forEach((k) => {
    if (books[k].title === req.params.title) {
      result.push({ isbn: k, author: books[k].author, reviews: books[k].reviews });
    }
  });
  return res.status(200).json({ booksbytitle: result });
});

/* ---------------- Public routes using Axios (async/await + Promise callbacks) ---------------- */

// Task 10: Get the complete book list - async/await with Axios
public_users.get('/', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/internal/books');
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Task 11: Get book details based on ISBN - Promise callbacks with Axios
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  axios.get(`http://localhost:5000/internal/isbn/${isbn}`)
    .then((response) => res.status(200).json(response.data))
    .catch((error) => res.status(404).json({ message: "Book not found" }));
});

// Task 12: Get book details based on author - async/await with Axios
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = encodeURIComponent(req.params.author);
    const response = await axios.get(`http://localhost:5000/internal/author/${author}`);
    if (response.data.booksbyauthor.length > 0) {
      return res.status(200).json(response.data);
    }
    return res.status(404).json({ message: "No books found for this author" });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Task 13: Get all books based on title - async/await with Axios
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = encodeURIComponent(req.params.title);
    const response = await axios.get(`http://localhost:5000/internal/title/${title}`);
    if (response.data.booksbytitle.length > 0) {
      return res.status(200).json(response.data);
    }
    return res.status(404).json({ message: "No books found with this title" });
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Get book review based on ISBN
public_users.get('/review/:isbn', function (req, res) {
  const book = books[req.params.isbn];
  if (book) return res.status(200).json(book.reviews);
  return res.status(404).json({ message: "Book not found" });
});

module.exports.general = public_users;