package com.chuanphat.warranty.core.service;

import com.chuanphat.warranty.core.dto.CreateSalesExchangeRequest;
import com.chuanphat.warranty.core.dto.CreateSalesReturnRequest;
import com.chuanphat.warranty.core.dto.PaymentEntryRequest;
import com.chuanphat.warranty.core.dto.SalesExchangeHistoryResponse;
import com.chuanphat.warranty.core.dto.SalesExchangeResponse;
import com.chuanphat.warranty.core.dto.SalesOrderResponse;
import com.chuanphat.warranty.core.dto.SalesReturnResponse;
import com.chuanphat.warranty.core.entity.SalesOrder;
import com.chuanphat.warranty.core.entity.SalesReturn;
import com.chuanphat.warranty.core.repository.SalesOrderRepository;
import com.chuanphat.warranty.core.repository.SalesReturnRepository;
import com.chuanphat.warranty.exception.BusinessException;
import java.math.BigDecimal;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SalesExchangeService {
    private final SalesService salesService;
    private final SalesReturnRepository returnRepository;
    private final SalesOrderRepository orderRepository;

    public SalesExchangeService(SalesService salesService,
                                SalesReturnRepository returnRepository,
                                SalesOrderRepository orderRepository) {
        this.salesService = salesService;
        this.returnRepository = returnRepository;
        this.orderRepository = orderRepository;
    }

    public SalesExchangeResponse createExchange(CreateSalesExchangeRequest request) {
        UUID exchangeGroupId = UUID.randomUUID();
        SalesReturnResponse salesReturn = salesService.createReturn(exchangeReturnRequest(request));
        SalesOrderResponse newOrder = salesService.create(request.newOrderRequest());

        SalesReturn returnEntity = returnRepository.findById(salesReturn.id())
                .orElseThrow(() -> new BusinessException("Sales return not found after exchange create: " + salesReturn.id()));
        SalesOrder orderEntity = orderRepository.findById(newOrder.id())
                .orElseThrow(() -> new BusinessException("Sales order not found after exchange create: " + newOrder.id()));
        returnEntity.setExchangeGroupId(exchangeGroupId);
        orderEntity.setExchangeGroupId(exchangeGroupId);

        BigDecimal difference = newOrder.totalAmount().subtract(salesReturn.returnAmount());
        if (difference.compareTo(BigDecimal.ZERO) > 0) {
            applyAdditionalPaymentIfProvided(newOrder.id(), request.additionalPayment(), difference);
        } else if (difference.compareTo(BigDecimal.ZERO) < 0) {
            returnEntity.setRefundAmount(difference.abs());
        }

        returnRepository.save(returnEntity);
        orderRepository.save(orderEntity);
        return new SalesExchangeResponse(
                exchangeGroupId,
                SalesReturnResponse.from(returnEntity),
                SalesOrderResponse.from(orderEntity),
                difference);
    }

    @Transactional(readOnly = true)
    public SalesExchangeHistoryResponse history(UUID exchangeGroupId) {
        return new SalesExchangeHistoryResponse(
                exchangeGroupId,
                returnRepository.findByExchangeGroupId(exchangeGroupId).stream()
                        .map(SalesReturnResponse::from)
                        .toList(),
                orderRepository.findByExchangeGroupId(exchangeGroupId).stream()
                        .map(SalesOrderResponse::from)
                        .toList());
    }

    private CreateSalesReturnRequest exchangeReturnRequest(CreateSalesExchangeRequest request) {
        CreateSalesReturnRequest source = request.returnRequest();
        return new CreateSalesReturnRequest(
                request.originalSalesOrderId(),
                source.returnDate(),
                BigDecimal.ZERO,
                source.refundMethod(),
                source.bankAccountId(),
                source.reasonCode(),
                source.reasonNote(),
                source.items());
    }

    private void applyAdditionalPaymentIfProvided(Long newOrderId, PaymentEntryRequest requestedPayment, BigDecimal difference) {
        if (requestedPayment == null) {
            return;
        }
        PaymentEntryRequest payment = new PaymentEntryRequest(
                requestedPayment.paymentMethod(),
                difference,
                requestedPayment.bankAccountId(),
                requestedPayment.paymentDate(),
                requestedPayment.referenceNo(),
                requestedPayment.note());
        salesService.addPayment(newOrderId, payment);
    }
}
