// Do your work here...
console.log("Hello, world!");

// Munculkan PopUp Modal Tambahkan Buku
const buttonModal = document.querySelector("header .btn");
const bgModal = document.querySelector("main .modal");
const modal = document.querySelector("section.modal-addBook");
const closeModal = document.getElementById("closeModal");
const formBook = document.getElementById("bookForm");
const inputISComplete = document.getElementById("bookFormIsComplete");
const textComplete = document.querySelector("#bookFormSubmit span");

// Modal Edit
const editModal = document.getElementById("editModal");
const closeModalEdit = document.getElementById("closeEditModal");
const saveEditButton = document.getElementById("saveEdit");
const editTitleInput = document.getElementById("editTitle");
const editAuthorInput = document.getElementById("editAuthor");
const editYearInput = document.getElementById("editYear");

let editingBookId = null;

const books = [];
const RENDER_LIST_BOOK = "render_list_book";
const STORAGE_KEY = "BOOKSHELF_APP";
const SAVED_DATA = "save-data";

document.addEventListener("DOMContentLoaded", () => {
    formBook.addEventListener("submit", (e) => {
    bgModal.classList.remove("active-flex");
    addBook();
    textComplete.textContent = "Belum selesai dibaca";
    window.alert(`Buku berhasil ditambahkan di Rak`);
    e.preventDefault();
    formBook.reset();
  });

  if (isStorageExist()) {
    loadSaveFromStorage();
  }
});

buttonModal.addEventListener("click", () => {
  bgModal.classList.toggle("active-flex");
});

closeModal.addEventListener("click", () => {
  bgModal.classList.remove("active-flex");
});

document.addEventListener("click", (e) => {
  if (
    bgModal.classList.contains("active-flex") &&
    !modal.contains(e.target) &&
    e.target !== buttonModal
  ) {
    bgModal.classList.remove("active-flex");
  }
});

inputISComplete.addEventListener("change", () => {
  if (inputISComplete.checked) {
    textComplete.textContent = "Selesai dibaca";
  } else {
    textComplete.textContent = "Belum selesai dibaca";
  }
});

function generateId() {
  return Number(new Date());
}

function generateObjectBook(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    window.alert(
      `Browser yg kamu gunakan tidak mendukung Web Storage, telah terjadi error`
    );
    return false;
  }
  return true;
}

function addBook() {
  const inputTitle = document.getElementById("bookFormTitle").value;
  const inputAuthor = document.getElementById("bookFormAuthor").value;
  const inputYear = document.getElementById("bookFormYear").value;
  const isComplete = inputISComplete.checked;

  const generatedID = generateId();
  const bookObject = generateObjectBook(
    generatedID,
    inputTitle,
    inputAuthor,
    inputYear,
    isComplete
);

  books.push(bookObject);
  document.dispatchEvent(new Event(RENDER_LIST_BOOK));
  saveData();
}

document.addEventListener(RENDER_LIST_BOOK, () => {
  const inCompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");
  inCompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  for (let bookItem of books) {
    const bookElement = makeBookShelf(bookItem);
    if (bookItem.isComplete) {
        completeBookList.appendChild(bookElement);
    } else {
        inCompleteBookList.appendChild(bookElement);
    }
  }
});

function makeBookShelf(bookObject) {
  const elementBook = document.createElement("div");
  elementBook.classList.add("book-item");
  elementBook.setAttribute("data-bookid", bookObject.id);
  elementBook.setAttribute("data-testid", "bookItem");

  const title = document.createElement("h3");
  title.setAttribute("data-testid", "bookItemTitle");
  title.textContent = bookObject.title;

  const author = document.createElement("p");
  author.setAttribute("data-testid", "bookItemAuthor");
  author.innerHTML = `Penulis: <span class="author">${bookObject.author}</span>`;

  const year = document.createElement("p");
  year.setAttribute("data-testid", "bookItemYear");
  year.innerHTML = `Tahun: <span class="year">${bookObject.year}</span>`;

  const buttonContainer = document.createElement("div");
  
  const completeButton = document.createElement("button");
  completeButton.setAttribute("data-testid", "bookItemIsCompleteButton");
  completeButton.innerHTML = `<a href="#"><i class="fa-solid fa-circle-check"></i></a>`;
  
  completeButton.addEventListener("click", (e) => {
    if(!bookObject.isComplete) {
        addBookCompleted(bookObject.id);
    } else {
        const disabledButton = document.querySelector('[data-testid="bookItemIsCompeteButton"');
        disabledButton.disabled = true;
        disabledButton.style.cursor = "not-allowed";
    }
    e.preventDefault();
  });

  const deleteButton = document.createElement("button");
  deleteButton.setAttribute("data-testid", "bookItemDeleteButton");
  deleteButton.innerHTML = `<a href="#"><i class="fa-regular fa-trash-can"></i></a>`;
  
  deleteButton.addEventListener("click", (e) => {
    const confirmDelete = confirm("Apakah kamu ingin menghapus buku ini dari rak?");
    if (confirmDelete) {
      removeBookFromBookShelf(bookObject.id);
    }
    e.preventDefault();
  });

  const editButton = document.createElement("button");
  editButton.setAttribute("data-testid", "bookItemEditButton");
  editButton.innerHTML = `<a href="#"><i class="fa-regular fa-pen-to-square"></i></a>`;
  
  editButton.addEventListener("click", (e) => {
    editBook(bookObject.id);
    e.preventDefault();
  });

  buttonContainer.appendChild(completeButton);
  buttonContainer.appendChild(deleteButton);
  buttonContainer.appendChild(editButton);

  elementBook.appendChild(title);
  elementBook.appendChild(author);
  elementBook.appendChild(year);
  elementBook.appendChild(buttonContainer);

  return elementBook;
}

function addBookCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if(bookId === null) {
        return;
    }
    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_LIST_BOOK));
    saveData();
}

function removeBookFromBookShelf(bookId) {
    const bookTarget = findBookIndex(bookId);

    if(bookTarget === -1) {
        return;
    }

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_LIST_BOOK));
    saveData();
}

function editBook(bookId) {
    const book = books.find((item) => item.id === bookId);
    if (!book) return;

    editingBookId = bookId;

    editTitleInput.value = book.title;
    editAuthorInput.value = book.author;
    editYearInput.value = book.year;

    editModal.style.display = "flex";
}

saveEditButton.addEventListener("click", () => {
    if (editingBookId === null) return;

    const bookIndex = books.findIndex((item) => item.id === editingBookId);
    if (bookIndex === -1) return;

    books[bookIndex].title = editTitleInput.value;
    books[bookIndex].author = editAuthorInput.value;
    books[bookIndex].year = editYearInput.value;

    saveData();

    document.dispatchEvent(new Event(RENDER_LIST_BOOK));

    // Tutup modal
    editModal.style.display = "none";
    editingBookId = null;
    window.alert(`Data berhasil diubah`);
});

closeModalEdit.addEventListener("click", () => {
    editModal.style.display = "none";
    editingBookId = null;
});

function findBookIndex(bookId) {
    for (const index in books) {
        if(books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function findBook(bookId) {
    for(const bookItem of books) {
        if(bookItem.id === bookId) {
            return bookItem;
        }
    }

    return null;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_DATA));
  }
}

function loadSaveFromStorage() {
  const serialzedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serialzedData);

  if (data !== null) {
    for (let book of data) {
        books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_LIST_BOOK));
}

document.addEventListener(SAVED_DATA, () => {
    console.log('Halo', localStorage.getItem(STORAGE_KEY));
});

document.getElementById("searchBook").addEventListener("submit", function (e) {
    e.preventDefault();

    const searchInput = document.getElementById("searchBookTitle").value.toLowerCase();
    const inCompleteBookList = document.getElementById("incompleteBookList");
    const completeBookList = document.getElementById("completeBookList");

    inCompleteBookList.innerHTML = "";
    completeBookList.innerHTML = "";

    let hasResult = false;

    for (let book of books) {
        const titleMatch = book.title.toLowerCase().includes(searchInput);
        const authorMatch = book.author.toLowerCase().includes(searchInput);
        const yearMatch = book.year.toString().includes(searchInput);

        if (titleMatch || authorMatch || yearMatch) {
            const bookElement = makeBookShelf(book);

            if (book.isComplete) {
                completeBookList.appendChild(bookElement);
            } else {
                inCompleteBookList.appendChild(bookElement);
            }

            hasResult = true;
        }
    }

    const resultText = document.getElementById("resultSearchBook");
    if (hasResult) {
        resultText.innerHTML = ``;
    } else {
        resultText.innerHTML = `Buku dengan kata kunci "<span>${searchInput}</span>" tidak ditemukan.`;
    }
});

// footer Year
const yearFooter = new Date().getFullYear();

document.querySelector('footer .year-footer').innerText = yearFooter;
