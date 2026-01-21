package com.datepeice.emonotes.repository;

import com.datepeice.emonotes.entity.Note;
import com.datepeice.emonotes.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findAllByUser(User user);
}
