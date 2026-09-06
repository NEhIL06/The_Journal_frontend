package com.journalingN.journaling.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.journalingN.journaling.dto.JournalEntryRequest;
import com.journalingN.journaling.entity.User;
import com.journalingN.journaling.exception.ResourceNotFoundException;
import com.journalingN.journaling.services.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.journalingN.journaling.entity.JournalEntry;
import com.journalingN.journaling.services.JournalEntryService;

@RestController
@RequestMapping("/journal")
@SecurityRequirement(name = "bearerAuth")
public class JournalEntryControllerV2 {

    private final JournalEntryService journalEntryService;
    private final UserService userService;

    public JournalEntryControllerV2(JournalEntryService journalEntryService, UserService userService) {
        this.journalEntryService = journalEntryService;
        this.userService = userService;
    }
    /// since we have not added any path
    /// to the mappings,Whenever the journal path is accessed
    ///  based on get or post request it will select getMapping or postMapping
    @GetMapping
    public ResponseEntity<?> getAllUserEntriesByUserName() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User user = userService.findByUserName(userName);
        if(user == null){
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        List<JournalEntry> all = user.getJournalEntries();
        if(all != null && !all.isEmpty()){
            return new ResponseEntity<>(all,HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping
    public ResponseEntity<JournalEntry> createEntry(@Valid @RequestBody JournalEntryRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        JournalEntry newEntry = new JournalEntry();
        newEntry.setTitle(request.title().trim());
        newEntry.setContent(request.content().trim());
        journalEntryService.saveEntry(newEntry, authentication.getName());
        return ResponseEntity.ok(newEntry);
    }



    @GetMapping("/id/{myId}")
    public ResponseEntity<JournalEntry> getJournalEntryById(@PathVariable ObjectId myId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User user = requireUser(userName);
        //to check if the current user's requested id is his own or not and list it
        List<JournalEntry> collect = user.getJournalEntries().stream().filter(x -> x.getId().equals(myId)).collect(Collectors.toList());
        if (!collect.isEmpty()) {
            Optional<JournalEntry> journalEntry = journalEntryService.findByID(myId);
            if (journalEntry.isPresent()) {
                return new ResponseEntity<>(journalEntry.get(), HttpStatus.OK);
            }
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/id/{myId}")
    public ResponseEntity<?> deleteEntryById(@PathVariable ObjectId myId){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        boolean bool = journalEntryService.deleteById(myId,userName);
        if(bool){
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
    @PutMapping("/id/{myId}")
    public ResponseEntity<Void> updateJournalById(
            @PathVariable ObjectId myId,
            @Valid @RequestBody JournalEntryRequest request
            ){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User user = requireUser(userName);
        //to check if the current user's requested id is his own or not and list it
        List<JournalEntry> collect = user.getJournalEntries().stream().filter(x -> x.getId().equals(myId)).toList();
        if (!collect.isEmpty()) {
            JournalEntry old = journalEntryService.findByID(myId)
                    .orElseThrow(() -> new ResourceNotFoundException("Journal entry not found"));
            old.setTitle(request.title().trim());
            old.setContent(request.content().trim());
            old.setDate(LocalDateTime.now());
            journalEntryService.saveEntry(old);
            return ResponseEntity.ok().build();
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    private User requireUser(String userName) {
        User user = userService.findByUserName(userName);
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        return user;
    }
}
