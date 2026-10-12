package com.example.banking_backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.banking_backend.dto.CustomerRequest;
import com.example.banking_backend.model.Account;
import com.example.banking_backend.model.Customer;
import com.example.banking_backend.repository.CustomerRepository;

@Service
public class CustomerService {

    private final CustomerRepository customers;
    private final AccountService accountService;

    public CustomerService(CustomerRepository customers, AccountService accountService) {
        this.customers = customers;
        this.accountService = accountService;
    }

    @Transactional
    public Customer createCustomer(CustomerRequest newCustomer) {
        Customer customer = new Customer(
                newCustomer.firstName(),
                newCustomer.lastName(),
                newCustomer.email(),
                newCustomer.phoneNumber());

        return customers.save(customer);
    }

    @Transactional(readOnly = true)
    public List<Customer> getCustomers() {
        return customers.findAll();
    }

    @Transactional(readOnly = true)
    public Customer getCustomerById(Long id) {
        return customers.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Customer not found with id: " + id));
    }

    @Transactional
    public Customer updateCustomer(Long customerId, CustomerRequest customerUpdates) {
        Customer customer = customers.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer " + customerId + " not found"));

        if (customerUpdates.firstName() != null && !customerUpdates.firstName().isBlank()) {
            customer.setFirstName(customerUpdates.firstName());
        }

        if (customerUpdates.lastName() != null && !customerUpdates.lastName().isBlank()) {
            customer.setLastName(customerUpdates.lastName());
        }

        if (customerUpdates.email() != null && !customerUpdates.email().isBlank()) {
            customer.setEmail(customerUpdates.email());
        }

        if (customerUpdates.phoneNumber() != null && !customerUpdates.phoneNumber().isBlank()) {
            customer.setPhoneNumber(customerUpdates.phoneNumber());
        }

        return customers.save(customer);
    }

    @Transactional
    public void deleteCustomer(Long customerId) {
        Customer customer = customers.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer " + customerId + " not found"));
        customers.delete(customer);
    }

    @Transactional(readOnly = true)
    public List<Account> getCustomerAccounts(Long customerId) {
        return accountService.getAccountsByCustomerId(customerId);
    }

    // public Customer validateCustomer(Long customerId) {
    // Customer customer = customers.findById(customerId)
    // .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
    // "Customer not found"));

    // Long currentUserId = getCurrentUserIdFromRequest();

    // if (!customerId.equals(currentUserId)) {
    // throw new ResponseStatusException(
    // HttpStatus.FORBIDDEN,
    // "Current user is not authorized to make this call");
    // }

    // return customer;
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