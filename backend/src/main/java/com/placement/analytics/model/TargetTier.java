package com.placement.analytics.model;

public enum TargetTier {
    SERVICE(65.0, "Service & Consulting (TCS / Infosys / Cognizant)"),
    PRODUCT(78.0, "Product Engineering (Zoho / Freshworks / PayPal)"),
    FAANG(88.0, "FAANG & Dream Tier (Google / Amazon / Microsoft)");

    private final double benchmarkScore;
    private final String displayLabel;

    TargetTier(double benchmarkScore, String displayLabel) {
        this.benchmarkScore = benchmarkScore;
        this.displayLabel = displayLabel;
    }

    public double getBenchmarkScore() {
        return benchmarkScore;
    }

    public String getDisplayLabel() {
        return displayLabel;
    }
}
