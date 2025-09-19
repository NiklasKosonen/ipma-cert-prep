const fs = require('fs');

const filePath = 'src/services/dataMigration.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the TypeScript errors by adding proper type annotations
content = content.replace(
  /\/\/ Ensure all arrays are properly initialized\s*Object\.keys\(dataFromTables\)\.forEach\(key => \{\s*if \(!Array\.isArray\(dataFromTables\[key\]\)\) \{\s*dataFromTables\[key\] = \[\]\s*\}\s*\}\)/s,
  // Ensure all arrays are properly initialized
      Object.keys(dataFromTables).forEach((key: string) => {
        if (!Array.isArray((dataFromTables as any)[key])) {
          (dataFromTables as any)[key] = []
        }
      })
);

fs.writeFileSync(filePath, content);
console.log(' Fixed TypeScript errors in dataMigration.ts');
