package com.journalingN.journaling.utils;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {
    private static final String SECRET = "test-secret-that-is-at-least-32-bytes-long";

    @Test
    void generatesAndValidatesAToken() {
        JwtUtil jwtUtil = new JwtUtil(SECRET, 60_000);
        String token = jwtUtil.generateToken("writer");
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("writer");
        assertThat(jwtUtil.validateToken(token)).isTrue();
    }

    @Test
    void identifiesAnExpiredToken() throws InterruptedException {
        JwtUtil jwtUtil = new JwtUtil(SECRET, 1);
        String token = jwtUtil.generateToken("writer");
        Thread.sleep(5);
        org.junit.jupiter.api.Assertions.assertThrows(
                io.jsonwebtoken.ExpiredJwtException.class,
                () -> jwtUtil.validateToken(token));
    }
}
