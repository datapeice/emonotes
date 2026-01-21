package com.datepeice.emonotes.controller;

import com.datepeice.emonotes.dto.SignUpBody;
import com.datepeice.emonotes.entity.User;
import com.datepeice.emonotes.repository.UserRepository;
import com.datepeice.emonotes.security.JwtCore;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    AuthController(
        AuthenticationManager authenticationManager,
        UserRepository userRepository,
        BCryptPasswordEncoder bCryptPasswordEncoder,
        JwtCore jwtCore
    ){
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.jwtCore = jwtCore;
    }

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final JwtCore jwtCore;

    @PostMapping("/signup")
    public void signup(@RequestBody SignUpBody body) throws Exception {
        if (userRepository.existsByUsername(body.getUsername())) {
            throw new Exception("Username already exists");
        }
        var user = new User();
        user.setUsername(body.getUsername());
        user.setPassword(bCryptPasswordEncoder.encode(body.getPassword()));
        user.setRoles("ROLE_USER");
        userRepository.save(user);
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
}
