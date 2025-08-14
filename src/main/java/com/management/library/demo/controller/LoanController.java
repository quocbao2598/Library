package com.management.library.demo.controller;

import com.management.library.demo.entity.Loan;
import com.management.library.demo.service.LoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "*")
public class LoanController {

    @Autowired
    private LoanService loanService;

    @GetMapping
    public List<Loan> getAllLoans() {
        return loanService.getAllLoans();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Loan> getLoanById(@PathVariable Long id) {
        Optional<Loan> loan = loanService.getLoanById(id);
        return loan.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Loan> createLoan(@RequestBody Loan loan) {
        try {
            Loan createdLoan = loanService.saveLoan(loan);
            return ResponseEntity.ok(createdLoan);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Loan> updateLoan(@PathVariable Long id, @RequestBody Loan loanDetails) {
        Optional<Loan> optionalLoan = loanService.getLoanById(id);
        if (optionalLoan.isPresent()) {
            Loan loan = optionalLoan.get();
            loan.setBorrowDate(loanDetails.getBorrowDate());
            loan.setReturnDate(loanDetails.getReturnDate());
            loan.setStatus(loanDetails.getStatus());
            return ResponseEntity.ok(loanService.saveLoan(loan));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLoan(@PathVariable Long id) {
        if (loanService.getLoanById(id).isPresent()) {
            loanService.deleteLoan(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/member/{memberId}")
    public List<Loan> getLoansByMember(@PathVariable Long memberId) {
        return loanService.getLoansByMemberId(memberId);
    }

    @GetMapping("/book/{bookId}")
    public List<Loan> getLoansByBook(@PathVariable Long bookId) {
        return loanService.getLoansByBookId(bookId);
    }

    @GetMapping("/overdue")
    public List<Loan> getOverdueLoans() {
        return loanService.getOverdueLoans();
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<Loan> returnBook(@PathVariable Long id) {
        try {
            Loan returnedLoan = loanService.returnBook(id);
            return ResponseEntity.ok(returnedLoan);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
