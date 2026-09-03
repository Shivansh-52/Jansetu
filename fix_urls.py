import os, glob

frontend_dir = 'c:/Users/Shivansh/Desktop/jansetu/jansetu/JanSetu/frontend/src'
jsx_files = glob.glob(os.path.join(frontend_dir, '**/*.jsx'), recursive=True)

for file in jsx_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'http://localhost:5000' in content:
        # replace localhost with ${BASE_URL}
        content = content.replace('http://localhost:5000', '${BASE_URL}')
        
        # Add import for BASE_URL if not exists
        if 'BASE_URL' not in content:
            if "from '../services/api'" in content:
                content = content.replace("from '../services/api'", ", BASE_URL } from '../services/api'")
                content = content.replace("{ ,", "{")
            elif "from '../../services/api'" in content:
                content = content.replace("from '../../services/api'", ", BASE_URL } from '../../services/api'")
                content = content.replace("{ ,", "{")
            else:
                rel_depth = file.replace(frontend_dir, '').count(os.sep) - 1
                rel_path = '../' * rel_depth + 'services/api'
                content = f"import {{ BASE_URL }} from '{rel_path}';\n" + content
                
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Updated {file}')
