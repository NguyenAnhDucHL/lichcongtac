import re
import codecs

with codecs.open('seed_db.sql', 'r', encoding='utf-8', errors='ignore') as f:
    sql = f.read()

tables_to_keep = ['Users', 'Departments', 'AppSettings', 'AuditLogs', 'LoginAuditLog', 'PushSubscriptions', 'sqlite_sequence']

statements = re.split(r'(?=CREATE TABLE)', sql)
new_sql = "PRAGMA foreign_keys=OFF;\nBEGIN TRANSACTION;\n"

for stmt in statements:
    if stmt.startswith('CREATE TABLE'):
        table_match = re.search(r'CREATE TABLE (?:IF NOT EXISTS )?(\w+)', stmt)
        if table_match and table_match.group(1) in tables_to_keep:
            new_sql += stmt
    else:
        for line in stmt.split('\n'):
            if line.startswith('INSERT INTO'):
                insert_match = re.search(r'INSERT INTO (\w+)', line)
                if insert_match and insert_match.group(1) in tables_to_keep:
                    new_sql += line + "\n"
            elif line.strip() != "" and not line.startswith('--') and not line.startswith('BEGIN') and not line.startswith('COMMIT') and not line.startswith('PRAGMA'):
                # just append any other non-insert line that belongs to the preamble
                if 'INSERT' not in line and 'CREATE' not in line:
                    pass 

new_sql += "COMMIT;\n"

with codecs.open('seed_db_clean.sql', 'w', encoding='utf-8') as f:
    f.write(new_sql)
