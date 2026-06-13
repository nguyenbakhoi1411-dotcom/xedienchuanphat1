package com.chuanphat.warranty.ai;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class AiDtos {
    public record AssistantStatus(
            boolean enabled,
            String mode,
            String message,
            List<String> quickQuestions
    ) {
    }

    public record AssistantRequest(
            String question,
            Long branchId
    ) {
    }

    public record AssistantResponse(
            boolean enabled,
            String intent,
            String answer,
            List<Metric> metrics,
            List<String> warnings,
            List<Link> links,
            List<String> suggestions,
            ProposedAction proposedAction
    ) {
    }

    public record Metric(
            String label,
            BigDecimal value,
            String unit
    ) {
    }

    public record Link(
            String label,
            String href
    ) {
    }

    public record ProposedAction(
            String actionType,
            String title,
            String description,
            Map<String, Object> payload,
            boolean requiresConfirmation
    ) {
    }
}
