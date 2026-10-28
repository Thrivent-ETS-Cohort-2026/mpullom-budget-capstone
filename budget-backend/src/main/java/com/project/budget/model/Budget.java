package com.project.budget.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

@Entity
@Table(name = "budget_data")
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "description", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_period", nullable = false)
    private TargetPeriod targetPeriod;

    // Derive based on transactions
    // => and category table

    @Column(name = "max_amount", nullable = false)
    private Double maxAmount;

    @Column(name = "enabled", nullable = false)
    private Boolean enabled;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false)
    private Category category;

    public Budget() {
    }

    public Budget(User user, String description, TargetPeriod targetPeriod, Double currentAmount, Double maxAmount,
            Boolean enabled, LocalDateTime startDate, Category category) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null.");
        }
        if (description == null || description.isBlank()) {
            throw new IllegalArgumentException("Description cannot be null or empty.");
        }
        if (enabled == null) {
            throw new IllegalArgumentException("Enabled status cannot be null.");
        }

        this.user = user;
        this.description = description;
        this.targetPeriod = targetPeriod;
        this.maxAmount = maxAmount;
        this.enabled = enabled;
        this.startDate = (startDate != null) ? startDate : LocalDateTime.now();
        this.category = category;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public TargetPeriod getTargetPeriod() {
        return targetPeriod;
    }

    public void setTargetPeriod(TargetPeriod targetPeriod) {
        this.targetPeriod = targetPeriod;
    }

    public Double getMaxAmount() {
        return maxAmount;
    }

    public void setMaxAmount(Double maxAmount) {
        this.maxAmount = maxAmount;
    }

    public Boolean getEnabled() {
        return enabled;
    }

    public void setEnabled(Boolean enabled) {
        this.enabled = enabled;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category newCategory) {
        this.category = newCategory;
    }
}