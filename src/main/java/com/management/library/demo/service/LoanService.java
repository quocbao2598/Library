package com.management.library.demo.service;

import com.management.library.demo.entity.Book;
import com.management.library.demo.entity.Loan;
import com.management.library.demo.entity.Member;
import com.management.library.demo.repository.BookRepository;
import com.management.library.demo.repository.LoanRepository;
import com.management.library.demo.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class LoanService {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;

    public static final String LOAN_STATUS_BORROWED = "BORROWED";
    public static final String LOAN_STATUS_RETURNED = "RETURNED";
    public static final String LOAN_STATUS_OVERDUE = "OVERDUE";

    @Autowired
    public LoanService(LoanRepository loanRepository, BookRepository bookRepository, MemberRepository memberRepository) {
        this.loanRepository = loanRepository;
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
    }

    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    public List<Loan> findAllLoans() {
        return loanRepository.findAll();
    }

    public Optional<Loan> getLoanById(Long id) {
        return loanRepository.findById(id);
    }

    public Optional<Loan> findLoanById(Long id) {
        return loanRepository.findById(id);
    }

    public Loan saveLoan(Loan loan) {
        return loanRepository.save(loan);
    }

    public void deleteLoan(Long id) {
        loanRepository.deleteById(id);
    }

    public Loan borrowBook(Long bookId, Long memberId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + memberId));

        if (!book.isAvailable()) {
            throw new RuntimeException("Book is not available for loan: " + book.getTitle());
        }

        book.setAvailable(false);
        bookRepository.save(book);

        Loan loan = new Loan(book, member, LocalDate.now(), LOAN_STATUS_BORROWED);
        return loanRepository.save(loan);
    }

    public Loan returnBook(Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new RuntimeException("Loan not found with id: " + loanId));

        if (LOAN_STATUS_RETURNED.equals(loan.getStatus())){
            throw new RuntimeException("Book already returned for this loan: " + loanId);
        }

        Book book = loan.getBook();
        book.setAvailable(true);
        bookRepository.save(book);

        loan.setReturnDate(LocalDate.now());
        loan.setStatus(LOAN_STATUS_RETURNED);
        return loanRepository.save(loan);
    }

    public List<Loan> findLoansByMember(Long memberId) {
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + memberId));
        return loanRepository.findByMember(member);
    }

    public List<Loan> findLoansByBook(Long bookId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found with id: " + bookId));
        return loanRepository.findByBook(book);
    }

    public List<Loan> findOverdueLoans() {
        // This is a simple check. A more robust solution might involve a scheduled task
        // to update statuses or more complex query logic based on due dates.
        return loanRepository.findByReturnDateBeforeAndStatus(LocalDate.now(), LOAN_STATUS_BORROWED);
    }

    public List<Loan> findLoansByStatus(String status) {
        return loanRepository.findByStatus(status);
    }

    public List<Loan> getLoansByMemberId(Long memberId) {
        return findLoansByMember(memberId);
    }

    public List<Loan> getLoansByBookId(Long bookId) {
        return findLoansByBook(bookId);
    }

    public List<Loan> getOverdueLoans() {
        return findOverdueLoans();
    }
    
    public List<Loan> getLoansByUserId(Long userId) {
        // Thực hiện logic để lấy loans theo user ID
        // Có thể cần join với member table hoặc có thêm mapping
        return loanRepository.findAll().stream()
                .filter(loan -> loan.getMember() != null && loan.getMember().getId().equals(userId))
                .toList();
    }
}
