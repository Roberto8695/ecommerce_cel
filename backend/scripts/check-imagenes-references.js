// Script para verificar referencias a Imagenes en SQL
const fs = require('fs');
const path = require('path');

// Función para buscar referencias en archivos
function searchReferences(directory, pattern) {
  const results = [];
  
  // Leer todos los archivos del directorio
  const files = fs.readdirSync(directory);
  
  files.forEach(file => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Si es un directorio, buscar recursivamente
      results.push(...searchReferences(filePath, pattern));
    } else if (
      (file.endsWith('.js') || file.endsWith('.sql')) && 
      !file.includes('node_modules') && 
      !file.includes('test') &&
      !file.includes('.git')
    ) {
      // Si es un archivo .js o .sql, buscar el patrón
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes(pattern)) {
          // Encontrar líneas que contengan el patrón
          const lines = content.split('\n');
          const matchingLines = [];
          
          lines.forEach((line, i) => {
            if (line.includes(pattern)) {
              matchingLines.push({
                lineNumber: i + 1,
                content: line.trim()
              });
            }
          });
          
          if (matchingLines.length > 0) {
            results.push({
              file: filePath,
              matches: matchingLines
            });
          }
        }
      } catch (error) {
        console.error(`Error al leer el archivo ${filePath}:`, error);
      }
    }
  });
  
  return results;
}

// Ruta del proyecto
const projectRoot = path.resolve(__dirname, '..');

// Patrón a buscar
const pattern = 'FROM Imagenes';

// Buscar referencias
console.log(`Buscando referencias a "${pattern}" en los archivos...`);
const references = searchReferences(projectRoot, pattern);

// Mostrar resultados
if (references.length === 0) {
  console.log('No se encontraron referencias.');
} else {
  console.log(`Se encontraron ${references.length} archivos con referencias:`);
  
  references.forEach(ref => {
    console.log(`\nArchivo: ${ref.file}`);
    
    ref.matches.forEach(match => {
      console.log(`  Línea ${match.lineNumber}: ${match.content}`);
    });
  });
}

// Buscar también "Imagenes."
const pattern2 = 'Imagenes.';
console.log(`\nBuscando referencias a "${pattern2}" en los archivos...`);
const references2 = searchReferences(projectRoot, pattern2);

// Mostrar resultados
if (references2.length === 0) {
  console.log('No se encontraron referencias a "Imagenes."');
} else {
  console.log(`Se encontraron ${references2.length} archivos con referencias a "Imagenes.":`);
  
  references2.forEach(ref => {
    console.log(`\nArchivo: ${ref.file}`);
    
    ref.matches.forEach(match => {
      console.log(`  Línea ${match.lineNumber}: ${match.content}`);
    });
  });
}
