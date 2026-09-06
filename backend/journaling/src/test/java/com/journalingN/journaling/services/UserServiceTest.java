package com.journalingN.journaling.services;

import com.journalingN.journaling.entity.User;
import com.journalingN.journaling.repository.userRepo;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock userRepo repository;
    @InjectMocks UserService service;

    @Test
    void hashesPasswordsAndAssignsTheUserRoleOnRegistration() {
        User user = User.builder().userName("writer").Password("secret1").build();
        service.saveNewUser(user);

        ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getRoles()).containsExactly("User");
        assertThat(captor.getValue().getPassword()).isNotEqualTo("secret1");
        assertThat(new BCryptPasswordEncoder().matches("secret1", captor.getValue().getPassword())).isTrue();
    }

    @Test
    void hashesPasswordsWhenCredentialsAreUpdated() {
        User user = User.builder().userName("old-name").Password("old-password").build();
        service.updateCredentials(user, "new-name", "new-secret");
        assertThat(user.getUserName()).isEqualTo("new-name");
        assertThat(new BCryptPasswordEncoder().matches("new-secret", user.getPassword())).isTrue();
        verify(repository).save(user);
    }
}
