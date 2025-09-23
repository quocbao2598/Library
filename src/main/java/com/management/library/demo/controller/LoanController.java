package com.management.library.demo.controller;

import com.management.library.demo.entity.Loan;
import com.management.library.demo.entity.User;
import com.management.library.demo.service.LoanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/loans")
@CrossOrigin(origins = "*")
public class LoanController {

    @Autowired
    private LoanService loanService;

    // Chỉ LIBRARIAN và ADMIN có thể xem tất cả loans
    @GetMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public List<Loan> getAllLoans() {
        return loanService.getAllLoans();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Loan> getLoanById(@PathVariable Long id, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        Optional<Loan> loan = loanService.getLoanById(id);
        
        if (loan.isPresent()) {
            // Nếu là USER, chỉ cho phép xem loan của chính mình
            if (currentUser.getRole() == User.Role.USER) {
                // TODO: Kiểm tra xem loan này có phải của user hiện tại không
                // Cần có mối liên hệ giữa User và Member/Loan
            }
            return ResponseEntity.ok(loan.get());
        }
        return ResponseEntity.notFound().build();
    }

    // Chỉ LIBRARIAN và ADMIN có thể tạo loan (cho member mượn sách)
    @PostMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Loan> createLoan(@RequestBody Loan loan) {
        try {
            Loan createdLoan = loanService.saveLoan(loan);
            return ResponseEntity.ok(createdLoan);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')") // Chỉ ADMIN mới có thể xóa loan record
    public ResponseEntity<Void> deleteLoan(@PathVariable Long id) {
        if (loanService.getLoanById(id).isPresent()) {
            loanService.deleteLoan(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // USER có thể xem loans của chính mình, LIBRARIAN và ADMIN xem được của tất cả members
    @GetMapping("/member/{memberId}")
    @PreAuthorize("hasAnyRole('USER', 'LIBRARIAN', 'ADMIN')")
    public List<Loan> getLoansByMember(@PathVariable Long memberId, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        
        // Nếu là USER, chỉ cho phép xem loans của chính mình
        if (currentUser.getRole() == User.Role.USER) {
            // TODO: Kiểm tra xem memberId này có phải của user hiện tại không
        }
        
        return loanService.getLoansByMemberId(memberId);
    }

    // Chỉ LIBRARIAN và ADMIN có thể xem loans theo book
    @GetMapping("/book/{bookId}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public List<Loan> getLoansByBook(@PathVariable Long bookId) {
        return loanService.getLoansByBookId(bookId);
    }

    // Chỉ LIBRARIAN và ADMIN có thể xem overdue loans
    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public List<Loan> getOverdueLoans() {
        return loanService.getOverdueLoans();
    }

    // LIBRARIAN và ADMIN có thể process return, USER có thể return sách của mình
    @PostMapping("/{id}/return")
    @PreAuthorize("hasAnyRole('USER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Loan> returnBook(@PathVariable Long id, Authentication authentication) {
        try {
            User currentUser = (User) authentication.getPrincipal();
            
            // Nếu là USER, kiểm tra xem loan này có phải của họ không
            if (currentUser.getRole() == User.Role.USER) {
                // TODO: Implement logic để kiểm tra ownership
            }
            
            Loan returnedLoan = loanService.returnBook(id);
            return ResponseEntity.ok(returnedLoan);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Endpoint để USER xem lịch sử mượn sách của chính mình
    @GetMapping("/my-loans")
    @PreAuthorize("hasAnyRole('USER', 'LIBRARIAN', 'ADMIN')")
    public List<Loan> getMyLoans(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        // TODO: Implement logic để tìm loans của user hiện tại
        // Cần có mối liên hệ giữa User và Member/Loan
        return List.of(); // Placeholder
    }
}
