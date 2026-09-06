package com.journalingN.journaling.controller;

import com.journalingN.journaling.dto.LoginRequest;
import com.journalingN.journaling.dto.RegistrationRequest;
import com.journalingN.journaling.dto.UserResponse;
import com.journalingN.journaling.entity.User;
import com.journalingN.journaling.services.UserDetailsServiceImpl;
import com.journalingN.journaling.services.UserService;
import com.journalingN.journaling.utils.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public")
public class PublicController {

    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtUtil jwtUtil;

    public PublicController(UserService userService, AuthenticationManager authenticationManager,
                            UserDetailsServiceImpl userDetailsService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping("/health-Check")
    public String HealthCheck() {
        return "ok";
    }

    @PostMapping("/SignUp")
    public ResponseEntity<UserResponse> SignUp (@Valid @RequestBody RegistrationRequest request){
        User newUser = User.builder()
                .userName(request.userName().trim())
                .email(request.email().trim())
                .Password(request.password())
                .build();
        userService.saveNewUser(newUser);
        return ResponseEntity.ok(UserResponse.from(newUser));
    }

    @PostMapping("/Login")
    public ResponseEntity<String> Login (@Valid @RequestBody LoginRequest request){
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.userName(), request.password()));
        UserDetails userDetails = userDetailsService.loadUserByUsername(request.userName());
        String jwt = jwtUtil.generateToken(userDetails.getUsername());
        return ResponseEntity.ok(jwt);
    }


}
