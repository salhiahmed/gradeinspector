import { displayErrors, getErrors } from './funcs.js';

document.getElementById('fileInput').addEventListener('change', handleFile);

async function handleFile(event) {
   const files = event.target.files;
   const profs = [];

   // Convert file processing to a promise-based approach
   Array.from(files).map(file => {
      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (e) {
         const data = new Uint8Array(e.target.result);

         const profName = file.name.match(/^(.+?)-/)[1];

         const workbook = XLSX.read(data, { type: 'array' });

         getErrors(workbook, profName);
      };

      reader.readAsArrayBuffer(file);
   });


}

