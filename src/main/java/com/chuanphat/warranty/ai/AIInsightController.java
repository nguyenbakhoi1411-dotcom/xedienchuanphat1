package com.chuanphat.warranty.ai;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/ai-assistant")
@PreAuthorize("hasAnyRole('ADMIN')")
public class AIInsightController {
    private final AIInsightService service;

    public AIInsightController(AIInsightService service) {
        this.service = service;
    }

    @GetMapping("/status")
    @PreAuthorize("hasAuthority('AI_ASSISTANT_USE')")
    public AiDtos.AssistantStatus status() {
        return service.status();
    }

    @PostMapping("/ask")
    @PreAuthorize("hasAuthority('AI_ASSISTANT_USE')")
    public AiDtos.AssistantResponse ask(@RequestBody AiDtos.AssistantRequest request) {
        return service.ask(request);
    }
}

