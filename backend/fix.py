with open(r'c:\Users\Shivansh\Desktop\Samadhan Path\backend\routes\auth_routes.py', 'r') as f:
    lines = f.readlines()

top = lines[:585]
seeding = lines[597:677]
bottom = lines[679:]

new_bottom = []
for line in bottom:
    new_bottom.append(line)
    if 'db.documents.insert_many(docs)' in line:
        new_bottom.append('\n    # ==== ENHANCED DB SEEDING (Requested by user) ====\n')
        new_bottom.append('    true_name = user.get("name", "Citizen")\n')
        for s in seeding:
            new_bottom.append('    ' + s.lstrip())

final_lines = top + new_bottom

with open(r'c:\Users\Shivansh\Desktop\Samadhan Path\backend\routes\auth_routes.py', 'w') as f:
    f.writelines(final_lines)
