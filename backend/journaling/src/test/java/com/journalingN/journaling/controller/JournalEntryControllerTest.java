package com.journalingN.journaling.controller;

import com.journalingN.journaling.entity.JournalEntry;
import com.journalingN.journaling.entity.User;
import com.journalingN.journaling.exception.GlobalExceptionHandler;
import com.journalingN.journaling.services.JournalEntryService;
import com.journalingN.journaling.services.UserService;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class JournalEntryControllerTest {
    @Mock JournalEntryService journalEntryService;
    @Mock UserService userService;
    MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new JournalEntryControllerV2(journalEntryService, userService))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken("writer", null, List.of()));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void listsEntriesForTheAuthenticatedUser() throws Exception {
        JournalEntry entry = new JournalEntry();
        entry.setId(new ObjectId());
        entry.setTitle("Today");
        entry.setContent("A note");
        entry.setDate(LocalDateTime.now());
        User user = User.builder().userName("writer").Password("encoded")
                .journalEntries(new ArrayList<>(List.of(entry))).build();
        when(userService.findByUserName("writer")).thenReturn(user);

        mockMvc.perform(get("/journal"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Today"));
    }

    @Test
    void validatesNewEntriesBeforeCallingTheService() throws Exception {
        mockMvc.perform(post("/journal")
                        .contentType("application/json")
                        .content("{\"title\":\" \",\"content\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.title").exists())
                .andExpect(jsonPath("$.validationErrors.content").exists());
    }

    @Test
    void createsAnEntryUsingTheAuthenticatedUsername() throws Exception {
        mockMvc.perform(post("/journal")
                        .contentType("application/json")
                        .content("{\"title\":\"Today\",\"content\":\"A note\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Today"));
        verify(journalEntryService).saveEntry(any(JournalEntry.class), eq("writer"));
    }
}
