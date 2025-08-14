package com.management.library.demo.repository;

import com.management.library.demo.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {

    Optional<Member> findByEmail(String email);
    
    List<Member> findByNameContainingIgnoreCase(String name);
    
    List<Member> findByEmailContainingIgnoreCase(String email);

}
