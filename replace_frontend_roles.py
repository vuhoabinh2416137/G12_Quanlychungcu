import os

frontend_dir = r'c:\Users\mrore\G12_Quanlychungcu\frontend\src'
for root, dirs, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith('.jsx') or file.endswith('.js'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content.replace("'MANAGER'", "'CASHIER'")
            new_content = new_content.replace("\"MANAGER\"", "\"CASHIER\"")
            new_content = new_content.replace("Quản lý", "Thủ quỹ")
            
            # For arrays like ['ADMIN', 'MANAGER', 'RESIDENT'] -> ['ADMIN', 'CASHIER', 'MAINTENANCE', 'RESIDENT']
            if "'ADMIN', 'MANAGER', 'RESIDENT'" in new_content:
                new_content = new_content.replace("'ADMIN', 'MANAGER', 'RESIDENT'", "'ADMIN', 'CASHIER', 'MAINTENANCE', 'RESIDENT'")
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Updated {filepath}')
