package com.management.library.demo.service;

import com.management.library.demo.entity.Member;
import com.management.library.demo.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
// import org.springframework.security.crypto.password.PasswordEncoder; // For password hashing

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class MemberService {

    private final MemberRepository memberRepository;
    // private final PasswordEncoder passwordEncoder; // Inject if using Spring Security

    @Autowired
    public MemberService(MemberRepository memberRepository) { // Add PasswordEncoder if using
        this.memberRepository = memberRepository;
        // this.passwordEncoder = passwordEncoder;
    }

    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    public List<Member> findAllMembers() {
        return memberRepository.findAll();
    }

    public Optional<Member> getMemberById(Long id) {
        return memberRepository.findById(id);
    }

    public Optional<Member> findMemberById(Long id) {
        return memberRepository.findById(id);
    }

    public Optional<Member> findMemberByEmail(String email) {
        return memberRepository.findByEmail(email);
    }

    public Member saveMember(Member member) {
        // // Hash password before saving - requires PasswordEncoder bean
        // member.setPassword(passwordEncoder.encode(member.getPassword()));
        return memberRepository.save(member);
    }

    public Member updateMember(Long id, Member memberDetails) {
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Member not found with id: " + id)); // Consider a custom exception

        member.setName(memberDetails.getName());
        member.setEmail(memberDetails.getEmail());
        // Handle password update carefully, perhaps in a separate method
        // if (memberDetails.getPassword() != null && !memberDetails.getPassword().isEmpty()) {
        //     member.setPassword(passwordEncoder.encode(memberDetails.getPassword()));
        // }
        return memberRepository.save(member);
    }

    public void deleteMember(Long id) {
        if (!memberRepository.existsById(id)) {
            throw new RuntimeException("Member not found with id: " + id); // Consider a custom exception
        }
        memberRepository.deleteById(id);
    }

    public List<Member> searchMembers(String name, String email) {
        if (name != null && !name.isEmpty()) {
            return memberRepository.findByNameContainingIgnoreCase(name);
        } else if (email != null && !email.isEmpty()) {
            return memberRepository.findByEmailContainingIgnoreCase(email);
        }
        return findAllMembers();
    }
}
