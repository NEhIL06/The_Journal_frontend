package com.journalingN.journaling.services;

import com.journalingN.journaling.entity.JournalEntry;
import com.journalingN.journaling.entity.User;
import com.journalingN.journaling.repository.journalEntryRepo;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JournalEntryServiceTest {
    @Mock journalEntryRepo repository;
    @Mock UserService userService;
    @InjectMocks JournalEntryService service;

    @Test
    void savesEntryAndAssociatesItWithTheUser() {
        User user = User.builder().userName("writer").Password("encoded").journalEntries(new ArrayList<>()).build();
        JournalEntry entry = new JournalEntry();
        entry.setTitle("Today");
        entry.setContent("A note");
        when(userService.findByUserName("writer")).thenReturn(user);
        when(repository.save(any(JournalEntry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.saveEntry(entry, "writer");

        assertThat(entry.getId()).isNotNull();
        assertThat(entry.getDate()).isNotNull();
        assertThat(user.getJournalEntries()).containsExactly(entry);
        verify(userService).saveUser(user);
    }

    @Test
    void deletesOnlyAnEntryOwnedByTheUser() {
        ObjectId id = new ObjectId();
        JournalEntry entry = new JournalEntry();
        entry.setId(id);
        User user = User.builder().userName("writer").Password("encoded")
                .journalEntries(new ArrayList<>(java.util.List.of(entry))).build();
        when(userService.findByUserName("writer")).thenReturn(user);

        assertThat(service.deleteById(id, "writer")).isTrue();
        assertThat(user.getJournalEntries()).isEmpty();
        verify(repository).deleteById(id);
        verify(userService).saveUser(user);
    }
}
