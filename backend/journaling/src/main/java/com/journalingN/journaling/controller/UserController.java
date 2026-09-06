package com.journalingN.journaling.controller;
import com.journalingN.journaling.api.responce.WeatherResponse;
import com.journalingN.journaling.dto.UpdateUserRequest;
import com.journalingN.journaling.exception.ResourceNotFoundException;
import com.journalingN.journaling.repository.userRepo;
import com.journalingN.journaling.entity.User;
import com.journalingN.journaling.services.UserService;
import com.journalingN.journaling.services.weatherService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;


@RestController
@RequestMapping("/user")
@SecurityRequirement(name = "bearerAuth")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private userRepo userRepo;

    @Autowired
    private weatherService weatherService;
    /// since we have not added any path
    /// to the mappings,Whenever the journal path is accessed
    ///  based on get or post request it will select getMapping or postMapping

    @DeleteMapping
    public ResponseEntity<?> deleteEntryById(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        userRepo.deleteByUserName(authentication.getName());
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
    @PutMapping
    public ResponseEntity<?> UpdateUser(@Valid @RequestBody UpdateUserRequest user ){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User userInDB = userService.findByUserName(userName);
        if(userInDB!=null){
            userService.updateCredentials(userInDB, user.userName().trim(), user.password());
            return new ResponseEntity<>(HttpStatus.ACCEPTED);
        }
        throw new ResourceNotFoundException("User not found");
    }

    @GetMapping
    public ResponseEntity<?> greetings() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String greeting="";
        try{
            WeatherResponse weatherResponse = weatherService.getWeather("Tumkuru");
            greeting = " For Tumkuru " +" , Weather Feels like " + weatherResponse.getCurrent().getFeelslike() ;
        } catch (Exception e) {
            greeting = "how are you today ";
        }
        return new ResponseEntity<>("Hi " + authentication.getName() + greeting ,HttpStatus.OK);
    }
}
