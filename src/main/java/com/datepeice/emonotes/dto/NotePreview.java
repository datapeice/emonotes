package com.datepeice.emonotes.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class NotePreview {
    private Long id;
    private String title;
    private String previewContent; // Тут будет обрезанный текст
    private LocalDateTime createdAt;
}
