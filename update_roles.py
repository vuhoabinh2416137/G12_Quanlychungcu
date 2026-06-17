import os

backend_dir = r'c:\Users\mrore\G12_Quanlychungcu\backend\src\main\java\com\bluemoon\controller'
for root, dirs, files in os.walk(backend_dir):
    for file in files:
        if file.endswith('.java'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content.replace(
                "hasAnyRole('ADMIN', 'CASHIER', 'RESIDENT')", 
                "hasAnyRole('ADMIN', 'MANAGER', 'CASHIER', 'MAINTENANCE', 'RESIDENT')"
            )
            
            new_content = new_content.replace(
                "hasAnyRole('ADMIN', 'CASHIER')", 
                "hasAnyRole('ADMIN', 'MANAGER', 'CASHIER')"
            )
            
            new_content = new_content.replace(
                "hasRole('ADMIN')", 
                "hasAnyRole('ADMIN', 'MANAGER')"
            )
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Updated {file}')
