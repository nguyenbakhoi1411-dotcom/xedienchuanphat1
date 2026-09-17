package com.chuanphat.warranty.reports;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class ReportSnapshotControllerTest {
    @Test
    void cannotUpdateOrDeleteExistingSnapshotViaApi() throws Exception {
        ReportSnapshotService snapshotService = org.mockito.Mockito.mock(ReportSnapshotService.class);
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new ReportSnapshotController(snapshotService)).build();

        assertThat(mockMvc.perform(put("/api/report-snapshots/100")).andReturn().getResponse().getStatus())
                .isIn(403, 404, 405);
        assertThat(mockMvc.perform(patch("/api/report-snapshots/100")).andReturn().getResponse().getStatus())
                .isIn(403, 404, 405);
        assertThat(mockMvc.perform(delete("/api/report-snapshots/100")).andReturn().getResponse().getStatus())
                .isIn(403, 404, 405);
    }
}
