package com.management.library.demo.service;

import com.management.library.demo.entity.Book;
import com.management.library.demo.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BookService {

    private final BookRepository bookRepository;

    @Autowired
    public BookService(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public List<Book> findAllBooks() {
        return bookRepository.findAll();
    }

    public Optional<Book> getBookById(Long id) {
        return bookRepository.findById(id);
    }

    public Optional<Book> findBookById(Long id) {
        return bookRepository.findById(id);
    }

    public Book saveBook(Book book) {
        return bookRepository.save(book);
    }

    public Book updateBook(Long id, Book bookDetails) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + id)); // Consider a custom exception

        book.setTitle(bookDetails.getTitle());
        book.setAuthor(bookDetails.getAuthor());
        book.setGenre(bookDetails.getGenre());
        book.setPublishedYear(bookDetails.getPublishedYear());
        book.setAvailable(bookDetails.isAvailable());
        return bookRepository.save(book);
    }

    public void deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new RuntimeException("Book not found with id: " + id); // Consider a custom exception
        }
        bookRepository.deleteById(id);
    }

    public List<Book> findBooksByTitle(String title) {
        return bookRepository.findByTitleContainingIgnoreCase(title);
    }

    public List<Book> findBooksByAuthor(String author) {
        return bookRepository.findByAuthorContainingIgnoreCase(author);
    }

    public List<Book> findBooksByGenre(String genre) {
        return bookRepository.findByGenreIgnoreCase(genre);
    }

    public List<Book> findBooksByPublishedYear(int year) {
        return bookRepository.findByPublishedYear(year);
    }

    public List<Book> findAvailableBooks() {
        return bookRepository.findByAvailable(true);
    }

    public List<Book> getAvailableBooks() {
        return bookRepository.findByAvailable(true);
    }

    public List<Book> searchBooks(String title, String author, String genre) {
        if (title != null && !title.isEmpty()) {
            return findBooksByTitle(title);
        } else if (author != null && !author.isEmpty()) {
            return findBooksByAuthor(author);
        } else if (genre != null && !genre.isEmpty()) {
            return findBooksByGenre(genre);
        }
        return findAllBooks();
    }
}
