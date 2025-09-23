package com.management.library.demo.controller;

import com.management.library.demo.entity.Book;
import com.management.library.demo.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    @Autowired
    private BookService bookService;

    // Tất cả user đã đăng nhập có thể xem sách
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'LIBRARIAN', 'ADMIN')")
    public List<Book> getAllBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Book> getBookById(@PathVariable Long id) {
        Optional<Book> book = bookService.getBookById(id);
        return book.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public Book createBook(@RequestBody Book book) {
        return bookService.saveBook(book);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book bookDetails) {
        Optional<Book> optionalBook = bookService.getBookById(id);
        if (optionalBook.isPresent()) {
            Book book = optionalBook.get();
            book.setTitle(bookDetails.getTitle());
            book.setAuthor(bookDetails.getAuthor());
            book.setGenre(bookDetails.getGenre());
            book.setPublishedYear(bookDetails.getPublishedYear());
            book.setAvailable(bookDetails.isAvailable());
            return ResponseEntity.ok(bookService.saveBook(book));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        if (bookService.getBookById(id).isPresent()) {
            bookService.deleteBook(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('USER', 'LIBRARIAN', 'ADMIN')")
    public List<Book> getAvailableBooks() {
        return bookService.getAvailableBooks();
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'LIBRARIAN', 'ADMIN')")
    public List<Book> searchBooks(@RequestParam(required = false) String title,
                                 @RequestParam(required = false) String author,
                                 @RequestParam(required = false) String genre) {
        return bookService.searchBooks(title, author, genre);
    }
}
