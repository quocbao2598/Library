package com.management.library.demo.controller;

import com.management.library.demo.entity.Member;
import com.management.library.demo.entity.User;
import com.management.library.demo.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberController {

    @Autowired
    private MemberService memberService;

    // Chỉ LIBRARIAN và ADMIN có thể xem tất cả members
    @GetMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public List<Member> getAllMembers() {
        return memberService.getAllMembers();
    }

    // USER có thể xem thông tin của chính mình, LIBRARIAN và ADMIN xem được tất cả
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Member> getMemberById(@PathVariable Long id, Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        
        // Nếu là USER, chỉ cho phép xem thông tin của chính mình
        if (currentUser.getRole() == User.Role.USER) {
            // Giả sử member có liên kết với user qua email hoặc một field khác
            // Ở đây cần logic để kiểm tra xem member này có phải của user hiện tại không
            // Tạm thời cho phép xem tất cả cho demo
        }
        
        Optional<Member> member = memberService.getMemberById(id);
        return member.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public Member createMember(@RequestBody Member member) {
        return memberService.saveMember(member);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Member> updateMember(@PathVariable Long id, @RequestBody Member memberDetails) {
        Optional<Member> optionalMember = memberService.getMemberById(id);
        if (optionalMember.isPresent()) {
            Member member = optionalMember.get();
            member.setName(memberDetails.getName());
            member.setEmail(memberDetails.getEmail());
            member.setPassword(memberDetails.getPassword());
            return ResponseEntity.ok(memberService.saveMember(member));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')") // Chỉ ADMIN mới có thể xóa member
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        if (memberService.getMemberById(id).isPresent()) {
            memberService.deleteMember(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public List<Member> searchMembers(@RequestParam(required = false) String name,
                                     @RequestParam(required = false) String email) {
        return memberService.searchMembers(name, email);
    }

    // Endpoint để USER xem thông tin profile của chính mình
    @GetMapping("/my-profile")
    @PreAuthorize("hasAnyRole('USER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Member> getMyProfile(Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        // Logic để tìm member tương ứng với user hiện tại
        // Ở đây cần có mối liên hệ giữa User và Member
        // Tạm thời trả về thông báo cần implement
        return ResponseEntity.notFound().build(); // TODO: Implement user-member relationship
    }
}
