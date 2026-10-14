package com.project.budget.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.project.budget.dto.UserRequest;
import com.project.budget.model.Account;
import com.project.budget.model.User;
import com.project.budget.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository users;
    private final AccountService accountService;

    public UserService(UserRepository users, AccountService accountService) {
        this.users = users;
        this.accountService = accountService;
    }

    @Transactional
    public User createUser(UserRequest newUser) {
        String uniqueToken = UUID.randomUUID().toString();
        User user = new User(
                newUser.firstName(),
                newUser.lastName(),
                newUser.email(),
                newUser.phoneNumber(),
                newUser.password(),
                uniqueToken);

        return users.save(user);
    }

    @Transactional(readOnly = true)
    public List<User> getUsers() {
        return users.findAll();
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return users.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found with id: " + id));
    }

    @Transactional
    public User updateUserByID(Long userId, UserRequest userUpdates) {
        User user = users.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User " + userId + " not found"));

        if (userUpdates.firstName() != null && !userUpdates.firstName().isBlank()) {
            user.setFirstName(userUpdates.firstName());
        }

        if (userUpdates.lastName() != null && !userUpdates.lastName().isBlank()) {
            user.setLastName(userUpdates.lastName());
        }

        if (userUpdates.email() != null && !userUpdates.email().isBlank()) {
            user.setEmail(userUpdates.email());
        }

        if (userUpdates.phoneNumber() != null && !userUpdates.phoneNumber().isBlank()) {
            user.setPhoneNumber(userUpdates.phoneNumber());
        }

        return users.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = users.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User " + userId + " not found"));
        users.delete(user);
    }

    @Transactional(readOnly = true)
    public List<Account> getUserAccounts(Long userId) {
        return accountService.getAccountsByUserId(userId);
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        User foundUser = users.findUserByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User with email:  " + email + " not found"));
        return foundUser;
    }

    @Transactional
    public User updateUserByEmail(String email, UserRequest userUpdates) {
        User user = users.findUserByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User with email " + email + " not found"));

        if (userUpdates.firstName() != null && !userUpdates.firstName().isBlank()) {
            user.setFirstName(userUpdates.firstName());
        }

        if (userUpdates.lastName() != null && !userUpdates.lastName().isBlank()) {
            user.setLastName(userUpdates.lastName());
        }

        if (userUpdates.email() != null && !userUpdates.email().isBlank()) {
            user.setEmail(userUpdates.email());
        }

        if (userUpdates.phoneNumber() != null && !userUpdates.phoneNumber().isBlank()) {
            user.setPhoneNumber(userUpdates.phoneNumber());
        }

        return users.save(user);
    }

    // public User validateUser(Long userId) {
    // User user = users.findById(userId)
    // .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
    // "User not found"));

    // Long currentUserId = getCurrentUserIdFromRequest();

    // if (!userId.equals(currentUserId)) {
    // throw new ResponseStatusException(
    // HttpStatus.FORBIDDEN,
    // "Current user is not authorized to make this call");
    // }

    // return user;
    // }

    // private Long getCurrentUserIdFromRequest() {
    // ServletRequestAttributes attributes = (ServletRequestAttributes)
    // RequestContextHolder.getRequestAttributes();

    // if (attributes == null) {
    // throw new ResponseStatusException(
    // HttpStatus.INTERNAL_SERVER_ERROR,
    // "No active request context found");
    // }

    // HttpServletRequest request = attributes.getRequest();

    // String currentId = request.getParameter("userId");

    // if (currentId == null || currentId.isBlank()) {
    // throw new ResponseStatusException(
    // HttpStatus.UNAUTHORIZED,
    // "Missing user information");
    // }

    // return Long.parseLong(currentId);
    // }
}