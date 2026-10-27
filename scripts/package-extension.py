from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
with zipfile.ZipFile(root / 'public/CheatSight-extension.zip', 'w', zipfile.ZIP_DEFLATED) as archive:
    for path in sorted((root / 'extension').iterdir()):
        if path.is_file() and not path.name.endswith('.test.mjs'):
            archive.write(path, path.name)
print('Packaged public/CheatSight-extension.zip')
