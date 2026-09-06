package com.journalingN.journaling.controller;

import com.journalingN.journaling.entity.User;
import com.journalingN.journaling.exception.GlobalExceptionHandler;
import com.journalingN.journaling.services.UserDetailsServiceImpl;
import com.journalingN.journaling.services.UserService;
import com.journalingN.journaling.utils.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PublicControllerTest {
    @Mock UserService userService;
    @Mock AuthenticationManager authenticationManager;
    @Mock UserDetailsServiceImpl userDetailsService;
    @Mock JwtUtil jwtUtil;
    MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        PublicController controller = new PublicController(userService, authenticationManager, userDetailsService, jwtUtil);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void rejectsInvalidRegistrationWithFieldErrors() throws Exception {
        mockMvc.perform(post("/public/SignUp")
                        .contentType("application/json")
                        .content("{\"userName\":\"\",\"email\":\"not-an-email\",\"password\":\"123\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Request validation failed"))
                .andExpect(jsonPath("$.validationErrors.userName").exists())
                .andExpect(jsonPath("$.validationErrors.email").exists())
                .andExpect(jsonPath("$.validationErrors.password").exists());
    }

    @Test
    void registersWithoutReturningThePassword() throws Exception {
        mockMvc.perform(post("/public/SignUp")
                        .contentType("application/json")
                        .content("{\"userName\":\"writer\",\"email\":\"writer@example.com\",\"password\":\"secret1\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userName").value("writer"))
                .andExpect(jsonPath("$.password").doesNotExist());
        verify(userService).saveNewUser(any(User.class));
    }

    @Test
    void loginKeepsThePlainTextJwtContract() throws Exception {
        UserDetails user = org.springframework.security.core.userdetails.User
                .withUsername("writer").password("encoded").roles("User").build();
        when(userDetailsService.loadUserByUsername("writer")).thenReturn(user);
        when(jwtUtil.generateToken("writer")).thenReturn("signed.jwt.token");

        mockMvc.perform(post("/public/Login")
                        .contentType("application/json")
                        .content("{\"userName\":\"writer\",\"password\":\"secret1\"}"))
                .andExpect(status().isOk())
                .andExpect(content().string("signed.jwt.token"));
        verify(authenticationManager).authenticate(any());
    }
}
