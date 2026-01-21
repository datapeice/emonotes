package com.datepeice.emonotes.controller;

import com.datepeice.emonotes.dto.NoteBody;
import com.datepeice.emonotes.entity.Note;
import com.datepeice.emonotes.entity.User;
import com.datepeice.emonotes.exception.AccessDeniedException;
import com.datepeice.emonotes.exception.ResourceNotFoundException;
import com.datepeice.emonotes.repository.NoteRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {
    public NoteController(NoteRepository noteRepository) {
        this.noteRepository = noteRepository;
    }
    private final NoteRepository noteRepository;

    @PostMapping("/create")
    public ResponseEntity<Note> createNote(@RequestBody NoteBody noteBody, @AuthenticationPrincipal User user) {
        var note = new Note();
        note.setTitle(noteBody.getTitle());
        note.setContent(noteBody.getContent());
        note.setUser(user);
        Note savedNote = noteRepository.save(note);
        return ResponseEntity.ok(savedNote);
    }

    @GetMapping("/all")
    public List<Note> getAllNotes(@AuthenticationPrincipal User user) {
        return noteRepository.findAllByUser(user);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity updateNote(@PathVariable Long id, @RequestBody NoteBody noteBody, @AuthenticationPrincipal User user) throws Exception {
        var note = noteRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Note not found"));
        if (!note.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorized to update this note");
        }
        note.setTitle(noteBody.getTitle());
        note.setContent(noteBody.getContent());

        noteRepository.save(note);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/delete/{id}")
    public void deleteNote(@PathVariable Long id, @AuthenticationPrincipal User user) throws Exception {
        var note = noteRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Note not found"));
        if (!note.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorized to delete this note");
        }
        noteRepository.delete(note);
    }

}
