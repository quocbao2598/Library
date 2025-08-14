package com.management.library.demo.repository;

import com.management.library.demo.entity.Book;
import com.management.library.demo.entity.Loan;
import com.management.library.demo.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByBook(Book book);

    List<Loan> findByMember(Member member);

    List<Loan> findByReturnDateBeforeAndStatus(LocalDate date, String status);

    List<Loan> findByStatus(String status);

    List<Loan> findByMemberAndStatus(Member member, String status);

    List<Loan> findByBookAndStatus(Book book, String status);
}
