package com.journalingN.journaling.controller;

import com.journalingN.journaling.cache.AppCache;
import com.journalingN.journaling.dto.RegistrationRequest;
import com.journalingN.journaling.dto.UserResponse;
import com.journalingN.journaling.entity.User;
import com.journalingN.journaling.services.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;


@RestController
@RequestMapping("/Admin")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {


    @Autowired
    private AppCache appCache;

    @Autowired
    private UserService userService;

    @GetMapping("/all-users")
    public ResponseEntity<?> getAllUser(){
        List<User> all = userService.getAll();
        if(all!=null && !all.isEmpty()){
            return new ResponseEntity<>(all,HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PostMapping("/Create-Admin")
    public ResponseEntity<UserResponse> createNewAdmin(@Valid @RequestBody RegistrationRequest request){
        User newEntry = User.builder()
                .userName(request.userName().trim())
                .email(request.email().trim())
                .Password(request.password())
                .build();
        userService.saveNewAdmin(newEntry);
        return ResponseEntity.ok(UserResponse.from(newEntry));
    }

    @GetMapping("clear-app-cache")
    public void clearAppCache(){
        appCache.init();
    }

}
