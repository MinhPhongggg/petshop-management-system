package com.petshop.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class SchemaMigrationRunner implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        ensurePetImageColumnType();
    }

    private void ensurePetImageColumnType() {
        try {
            jdbcTemplate.execute("ALTER TABLE pets MODIFY COLUMN image LONGTEXT NULL");
            log.info("Schema migration: ensured pets.image is LONGTEXT");
        } catch (Exception ex) {
            // Keep app startup resilient if schema is already compatible or table does not exist yet.
            log.debug("Schema migration skipped for pets.image: {}", ex.getMessage());
        }
    }
}
