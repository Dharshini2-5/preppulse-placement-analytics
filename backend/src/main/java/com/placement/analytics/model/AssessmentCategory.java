package com.placement.analytics.model;

public enum AssessmentCategory {
    APTITUDE("Quantitative & Logical Aptitude"),
    DSA_CODING("DSA & Competitive Coding"),
    CORE_CS("Core CS (OS, CN, OOP)"),
    SYSTEM_DESIGN("System Design & Architecture"),
    MOCK_INTERVIEW("Technical & HR Mock Interview"),
    SQL_DBMS("SQL, Indexing & DBMS");

    private final String label;

    AssessmentCategory(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }
}
