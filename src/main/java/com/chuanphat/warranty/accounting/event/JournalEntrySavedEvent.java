package com.chuanphat.warranty.accounting.event;

import com.chuanphat.warranty.accounting.entity.JournalEntry;
import org.springframework.context.ApplicationEvent;

public class JournalEntrySavedEvent extends ApplicationEvent {
    private final JournalEntry entry;

    public JournalEntrySavedEvent(Object source, JournalEntry entry) {
        super(source);
        this.entry = entry;
    }

    public JournalEntry getEntry() {
        return entry;
    }
}
