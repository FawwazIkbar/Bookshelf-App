document.addEventListener("DOMContentLoaded", function () {
  const submitForm = document.getElementById("bookForm");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });
  if (isStorageExis()) {
    loadDataFromStorage();
    displayBooks();
  }
});

const books = [];
// custom event
const RENDER_EVENT = "render-book";

// menambahkan buku
function addBook() {
  const title = document.getElementById("bookFormTitle");
  const author = document.getElementById("bookFormAuthor");
  const year = document.getElementById("bookFormYear");
  const isComplete = document.getElementById("bookFormIsComplete");

  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, title.value, author.value, parseInt(year.value), isComplete.checked);

  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  showToast("Buku Berhasil Disimpan");
}

// menghasilkan identitas unik pada setiap item book.
function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

//  me-render data yang telah disimpan pada array books
document.addEventListener(RENDER_EVENT, function () {
  const uncompletedbookList = document.getElementById("incompleteBookList");
  uncompletedbookList.innerHTML = "";
  const completedbookList = document.getElementById("completeBookList");
  completedbookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) {
      uncompletedbookList.append(bookElement);
    } else {
      completedbookList.append(bookElement);
    }
  }
});

function makeBook(bookObject) {
  const bookContainer = document.createElement("div");
  bookContainer.classList.add("list-book-item");
  bookContainer.setAttribute("data-bookid", bookObject.id);
  bookContainer.setAttribute("data-testid", "bookItem");

  const bookTitle = document.createElement("h3");
  bookTitle.classList.add("bookItemTitle");
  bookTitle.setAttribute("data-testid", "bookItemTitle");
  bookTitle.innerText = bookObject.title;

  const author = document.createElement("p");
  author.setAttribute("data-testid", "bookItemAuthor");
  author.innerText = `Penulis: ${bookObject.author}`;

  const timeStamp = document.createElement("p");
  timeStamp.setAttribute("data-testid", "bookItemYear");
  timeStamp.innerText = `Tahun: ${bookObject.year}`;

  bookContainer.append(bookTitle, author, timeStamp);

  const container = document.createElement("div");
  container.classList.add("list-book");
  container.setAttribute("id", `book-${bookObject.id}`);

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("btn-item");

  const undoButton = document.createElement("button");
  undoButton.classList.add("btn-undo");
  undoButton.setAttribute("data-testid", "bookItemIsCompleteButton");
  undoButton.innerText = "Belum Selesai dibaca";

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("btn-delete");
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
  deleteButton.innerText = "Hapus buku";

  const doneButton = document.createElement("button");
  doneButton.classList.add("btn-done");
  doneButton.setAttribute("data-testid", "bookItemIsCompleteButton");
  doneButton.innerText = "Selesai dibaca";

  if (bookObject.isComplete) {
    undoButton.addEventListener("click", function () {
      undoBookFromCompleted(bookObject.id);
    });
    deleteButton.addEventListener("click", function () {
      deleteBook(bookObject.id);
    });
    buttonContainer.append(undoButton, deleteButton);
    bookContainer.append(buttonContainer);
    container.append(bookContainer);
  } else {
    doneButton.addEventListener("click", function () {
      addBookToCompleted(bookObject.id);
    });
    deleteButton.addEventListener("click", function () {
      deleteBook(bookObject.id);
    });
    buttonContainer.append(doneButton, deleteButton);
    bookContainer.append(buttonContainer);
    container.append(bookContainer);
  }

  return container;
}

// menambahkan buku ke rak complete
function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  showToast("Buku Telah Selesai Dibaca");
}

// menghapus buku berdasarkan index yang didapatkan dari pencarian buku menggunakann findBookIndex()
function deleteBook(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  showToast("Menghapus Buku");
}

// undo buku dari rak complete
function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  showToast("Buku Belum Selesai Dibaca");
}

// mencari buku dengan id yang sesuai dengan array books
function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

// mencari buku berdasarkan index
function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }

  return -1;
}

const SAVED_EVENT = "saved_todo";
const STORAGE_KEY = "BOOK_APPS";

// melakukan save data
function saveData() {
  if (isStorageExis()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function isStorageExis() {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak support Local Storage");
    return false;
  }
  return true;
}

// custom event, debugging atau tracking ketika terjadi perubahan data
document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

// load data from storage agar tampilan data di wbsite tidak hilang
function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

// menampilkan showtoast
function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 1000);
}

// search form
const searchForm = document.getElementById("searchBook");
const searchInput = document.getElementById("searchBookTitle");

searchForm.addEventListener("submit", function (event) {
  event.preventDefault();
  searchBooks();
});
// melakukan seacrh book dari title
function searchBooks() {
  const query = searchInput.value.toLowerCase();
  const allBooks = document.querySelectorAll(".list-book");

  allBooks.forEach((book) => {
    const titleElement = book.querySelector(".bookItemTitle");
    if (titleElement) {
      const title = titleElement.innerText.toLowerCase();

      if (title.includes(query)) {
        book.hidden = false;
      } else {
        book.hidden = true;
      }
    } else {
      console.warn("Judul buku tidak ditemukan untuk elemen:", book);
    }
  });
}
// menampilkan book yang di cari
function displayBooks() {
  const allBooks = document.querySelectorAll(".list-book-item");
  allBooks.forEach((book) => {
    book.hidden = false;
  });
}
