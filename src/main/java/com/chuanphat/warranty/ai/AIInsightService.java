package com.chuanphat.warranty.ai;

public interface AIInsightService {
    AiDtos.AssistantStatus status();

    AiDtos.AssistantResponse ask(AiDtos.AssistantRequest request);
}
