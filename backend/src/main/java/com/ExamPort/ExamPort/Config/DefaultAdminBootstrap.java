package com.ExamPort.ExamPort.Config;

import com.ExamPort.ExamPort.Entity.User;
import com.ExamPort.ExamPort.Repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Ensures at least one admin exists on first startup (empty DB or no admin role).
 * Override credentials via env: EW_BOOTSTRAP_ADMIN_EMAIL, EW_BOOTSTRAP_ADMIN_PASSWORD, EW_BOOTSTRAP_ADMIN_USERNAME.
 */
@Component
@Order(2)
public class DefaultAdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DefaultAdminBootstrap.class);

    @Value("${EW_BOOTSTRAP_ADMIN_EMAIL}")
    private String adminEmail;

    @Value("${EW_BOOTSTRAP_ADMIN_PASSWORD}")
    private String adminPassword;

    @Value("${EW_BOOTSTRAP_ADMIN_USERNAME}")
    private String adminUsername;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByRoleIgnoreCase("admin")) {
            log.debug("Default admin bootstrap skipped: an admin user already exists");
            return;
        }

        if (userRepository.existsByEmail(adminEmail)) {
            log.warn("Default admin bootstrap skipped: email {} already registered without admin role; assign admin in DB or use another email", adminEmail);
            return;
        }

        if (userRepository.existsByUsername(adminUsername)) {
            log.warn("Default admin bootstrap skipped: username {} already taken", adminUsername);
            return;
        }

        User admin = new User();
        admin.setUsername(adminUsername);
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole("admin");
        admin.setFullName("System Administrator");
        admin.setPhoneNumber("0000000000");
        admin.setGender("Other");
        admin.setEmailVerified(true);

        userRepository.save(admin);
        log.info("Default admin user created (email verified). Sign in with email or username: {}", adminEmail);
    }
}
