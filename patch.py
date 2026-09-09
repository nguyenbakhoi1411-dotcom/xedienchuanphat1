def replace_in_file(path, old, new):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if old in content:
        content = content.replace(old, new)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print('Fixed: ' + path)

replace_in_file(r'D:\ChuanPhatfilegoc\ChuanPhat\src\main\java\com\chuanphat\warranty\accounting\controller\BankDepositController.java', 
'import org.springframework.web.bind.annotation.RestController;', 
'import org.springframework.web.bind.annotation.RestController;\nimport org.springframework.security.access.prepost.PreAuthorize;')

replace_in_file(r'D:\ChuanPhatfilegoc\ChuanPhat\src\main\java\com\chuanphat\warranty\inventory\controller\InventoryController.java', 
'import org.springframework.web.bind.annotation.RestController;', 
'import org.springframework.web.bind.annotation.RestController;\nimport org.springframework.security.access.prepost.PreAuthorize;')

replace_in_file(r'D:\ChuanPhatfilegoc\ChuanPhat\src\main\java\com\chuanphat\warranty\marketing\controller\PromotionController.java', 
'import org.springframework.web.bind.annotation.RestController;', 
'import org.springframework.web.bind.annotation.RestController;\nimport org.springframework.security.access.prepost.PreAuthorize;')

replace_in_file(r'D:\ChuanPhatfilegoc\ChuanPhat\src\main\java\com\chuanphat\warranty\core\entity\SalesOrderItem.java', 
'    @ManyToOne(fetch = FetchType.LAZY)\n    @JoinColumn(name = "warehouse_id")\n    private Warehouse warehouse;', 
'')

replace_in_file(r'D:\ChuanPhatfilegoc\ChuanPhat\src\main\java\com\chuanphat\warranty\core\enums\InventoryTransactionType.java', 
'    TRANSFER,\n    TRANSFER', 
'    TRANSFER')

replace_in_file(r'D:\ChuanPhatfilegoc\ChuanPhat\src\main\java\com\chuanphat\warranty\core\entity\SalesReturnItem.java', 
'    public void setRefundPrice(BigDecimal refundPrice) { this.refundPrice = refundPrice; }\n    public BigDecimal getRefundPrice() { return refundPrice; }\n    public void setReason(String reason) { this.reason = reason; }\n    public BigDecimal getTotalRefund() { return totalRefund; }\n', 
'')

replace_in_file(r'D:\ChuanPhatfilegoc\ChuanPhat\src\main\java\com\chuanphat\warranty\marketing\entity\PriceList.java', 
'        public PriceListBuilder moTa(String m) { return this; }\n        public PriceListBuilder moTa(String m) { return this; }', 
'        public PriceListBuilder moTa(String m) { return this; }')

replace_in_file(r'D:\ChuanPhatfilegoc\ChuanPhat\src\main\java\com\chuanphat\warranty\marketing\dto\PriceListItemDTO.java', 
'        public PriceListItemDTOBuilder giaToiThieu(BigDecimal giaToiThieu) { this.giaToiThieu = giaToiThieu; return this; }\n        public PriceListItemDTOBuilder giaToiThieu(BigDecimal giaToiThieu) { this.giaToiThieu = giaToiThieu; return this; }', 
'        public PriceListItemDTOBuilder giaToiThieu(BigDecimal giaToiThieu) { this.giaToiThieu = giaToiThieu; return this; }')

