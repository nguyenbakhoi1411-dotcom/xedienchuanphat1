import re

file_path = r'D:\ChuanPhatfilegoc\ChuanPhat\src\main\java\com\chuanphat\warranty\core\entity\Customer.java'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# The fields to add
fields = [
    ('boolean', 'isOrganization', 'false'),
    ('boolean', 'isSupplier', 'false'),
    ('boolean', 'isInternal', 'false'),
    ('String', 'taxUnitCode', 'null'),
    ('String', 'website', 'null'),
    ('String', 'customerGroup', 'null'),
    ('String', 'salesEmployee', 'null'),
    ('String', 'contactTitle', 'null'),
    ('String', 'contactName', 'null'),
    ('String', 'contactEmail', 'null'),
    ('String', 'contactMobilePhone', 'null'),
    ('String', 'legalRepresentative', 'null'),
    ('String', 'invoiceRecipientName', 'null'),
    ('String', 'invoiceRecipientEmail', 'null'),
    ('String', 'invoiceRecipientPhone', 'null'),
    ('String', 'bankAccountNumber', 'null'),
    ('String', 'bankName', 'null'),
    ('String', 'bankBranch', 'null'),
    ('Long', 'customerPriceGroupId', 'null'),
    ('java.math.BigDecimal', 'revenue30Days', 'java.math.BigDecimal.ZERO')
]

field_code = ""
getter_setter_code = ""
for t, name, default_val in fields:
    # avoid duplicates
    if name in content:
        continue
    
    if default_val != 'null':
        field_code += f"    @Column\n    private {t} {name} = {default_val};\n\n"
    else:
        field_code += f"    @Column\n    private {t} {name};\n\n"
    
    cap_name = name[0].upper() + name[1:]
    
    if t == 'boolean':
        getter_name = name if name.startswith('is') else f"is{cap_name}"
    else:
        getter_name = f"get{cap_name}"
        
    setter_name = f"set{cap_name}"
    if name.startswith('is') and t == 'boolean':
        setter_name = f"set{name[2:]}"
        
    getter_setter_code += f"    public {t} {getter_name}() {{ return {name}; }}\n"
    getter_setter_code += f"    public void {setter_name}({t} {name}) {{ this.{name} = {name}; }}\n"

# Insert fields before the getters
content = content.replace('// -- Getters / Setters ------------------------------------------', field_code + '    // -- Getters / Setters ------------------------------------------')

# Insert getters/setters before the last brace
content = content.replace('}\n\n', getter_setter_code + '}\n\n')

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched Customer.java')
