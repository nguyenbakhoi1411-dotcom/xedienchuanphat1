package com.chuanphat.warranty.operations;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface SystemErrorLogRepository extends JpaRepository<SystemErrorLog, Long>, JpaSpecificationExecutor<SystemErrorLog> {
}
