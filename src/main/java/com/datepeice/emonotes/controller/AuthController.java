package com.datepeice.emonotes.controller;

import com.datepeice.emonotes.dto.SignUpBody;
import com.datepeice.emonotes.entity.User;
import com.datepeice.emonotes.exception.ResourceNotFoundException;
import com.datepeice.emonotes.repository.UserRepository;
import com.datepeice.emonotes.security.JwtCore;
import com.datepeice.emonotes.service.MfaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    AuthController(
        AuthenticationManager authenticationManager,
        UserRepository userRepository,
        BCryptPasswordEncoder bCryptPasswordEncoder,
        JwtCore jwtCore,
        MfaService mfaService
    ){
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.jwtCore = jwtCore;
        this.mfaService = mfaService;
    }

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final JwtCore jwtCore;
    private final MfaService mfaService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignUpBody body) {
        if (userRepository.existsByUsername(body.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        String secret = mfaService.generateSecret();
        String qrUrl = mfaService.getQrCodeUrl(secret, body.getUsername());

        return ResponseEntity.ok(Map.of(
                "secret", secret,
                "qrCodeUrl", qrUrl,
                "message", "Scan QR and verify"
        ));
    }
    @PostMapping("/signup/verify")
    public ResponseEntity<?> verifyAndCreate(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String password = payload.get("password");
        String secret = payload.get("secret");
        int code = Integer.parseInt(payload.get("mfaCode"));

        if (!mfaService.verifyCode(secret, code)) {
            return ResponseEntity.status(403).body("Invalid MFA code");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(bCryptPasswordEncoder.encode(password));
        user.setMfaSecret(secret);
        user.setRoles("ROLE_USER");

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/signin")
    public String signin(@RequestBody SignUpBody body) throws Exception {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(body.getUsername(), body.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtCore.generateToken(authentication);
        return jwt;
    }

    @PostMapping("/resetpw")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String username = payload.get("username");
        String newPassword = payload.get("newPassword");
        String mfaCodeStr = payload.get("mfaCode");

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        try {
            int code = Integer.parseInt(mfaCodeStr);
            if (!mfaService.verifyCode(user.getMfaSecret(), code)) {
                return ResponseEntity.status(403).body("Invalid MFA code");
            }
        } catch (NumberFormatException e) {
            return ResponseEntity.status(400).body("MFA code must be a number");
        }

        if (newPassword.length() < 8) {
            return ResponseEntity.status(400).body("New password too short");
        }

        user.setPassword(bCryptPasswordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }

    @PostMapping("/refresh-mfa")
    public ResponseEntity<?> refreshMfa(@AuthenticationPrincipal User user, @RequestBody String currentMfaCode) {
        int code = Integer.parseInt(currentMfaCode);
        if (!mfaService.verifyCode(user.getMfaSecret(), code)) {
            return ResponseEntity.status(403).body("Invalid current MFA code");
        }

        String newSecret = mfaService.generateSecret();
        String qrUrl = mfaService.getQrCodeUrl(newSecret, user.getUsername());

        return ResponseEntity.ok(Map.of(
                "newSecret", newSecret,
                "qrCodeUrl", qrUrl
        ));
    }

    @PostMapping("/confirm-mfa-update")
    public ResponseEntity<?> confirmMfaUpdate(@AuthenticationPrincipal User user, @RequestBody Map<String, String> payload) {
        String newSecret = payload.get("newSecret");
        int verificationCode = Integer.parseInt(payload.get("code"));

        if (mfaService.verifyCode(newSecret, verificationCode)) {
            user.setMfaSecret(newSecret);
            userRepository.save(user);
            return ResponseEntity.ok("MFA successfully updated");
        } else {
            return ResponseEntity.status(400).body("Verification failed. Try scanning again.");
        }
    }
}
