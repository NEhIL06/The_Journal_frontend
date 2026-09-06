package com.journalingN.journaling.services;

import com.journalingN.journaling.entity.User;
import com.journalingN.journaling.repository.userRepo;
import lombok.extern.slf4j.Slf4j;
import org.bson.types.ObjectId;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Slf4j
@Component
public class  UserService {


    @Autowired
    private userRepo userRepo;

    private static final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();


    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    //Methods below
    public void saveNewUser(User user){
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(List.of("User"));
        userRepo.save(user);
    }

    public void saveNewAdmin(User user){
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRoles(Arrays.asList("User","ADMIN"));
        userRepo.save(user);
    }

    public void saveUser(User user){
        userRepo.save(user);
    }

    public void updateCredentials(User user, String userName, String password) {
        user.setUserName(userName);
        user.setPassword(passwordEncoder.encode(password));
        userRepo.save(user);
    }

    public List<User> getAll(){
        return userRepo.findAll();
    }

    public User findByUserName(String userName){
        return userRepo.findByUserName(userName);
    }

    public void deleteById(ObjectId id){
        userRepo.deleteById(id);
    }
}
