const getErrors = (workbook, profName) => {

   let infos = {}
   const tables = []

   workbook.SheetNames.forEach((sheetName, index) => {

      const sheet = workbook.Sheets[sheetName]
      if (!sheet['A1'] || sheet['A1'].v !== 'الجمهورية الجزائرية الديمقراطية الشعبية') return
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" })

      const startIndex = jsonData[5][2]
      const text = jsonData[4][0]

      const regex = /الفوج التربوي\s*:\s*([^:]+)\s*مادة\s*:\s*([^:]+)/
      const matches = text.match(regex)

      const group = matches[1].replace(/\s+/g, ' ').trim()
      const subject = matches[2].replace(/\s+/g, ' ').trim()
      const header = ["الرقم", ...jsonData[7]]

      const body = jsonData.slice(8).map((row, index) => [index + Number(startIndex), ...row]).filter(row => row.some((col, index) => errorValue(col) && index > 4 && index < header.length - 2))
            
      if (index === 0) infos = {
         profName,
         subject
      }

      tables.push({
         sheetName,
         startIndex,
         group,
         header,
         body
      })
      
   })


   displayErrors({ infos, tables })
}


const displayErrors = errors => {

   const { profName, startIndex, group, subject } = errors.infos

   let html = `
   <div class="flex flex-col bg-white border shadow-sm rounded-xl dark:bg-neutral-900 dark:border-neutral-700 dark:shadow-neutral-700/70">
      <div class="p-4 md:p-10">
         <h3 class="text-lg font-bold text-gray-800 dark:text-white">الأستاذ: ${profName} - مادة: ${subject}</h3>
         <br>
         <div class="flex flex-col">
            <div class="-m-1.5 overflow-x-auto">
               <div class="p-1.5 min-w-full inline-block align-middle">
                  <div class="p-4 flex flex-col gap-8 border rounded-md shadow overflow-hidden dark:border-neutral-700 dark:shadow-gray-900">
                     ${
                        errors.tables.map((table, index) => table.body.length ? `
                        <div class="flex flex-col gap-2">
                           <div class="py-2 flex gap-4 text-sm text-gray-600 dark:text-neutral-500">
                              <span>اسم ورقة العمل: ${table.sheetName}</span>
                              <span>/</span>
                              <span>القسم: ${table.group}</span>
                           </div>
                           <table class="min-w-full border border-gray-200 dark:divide-neutral-700">
                              <thead class="bg-gray-100 dark:bg-neutral-700">
                                 <tr class="divide-x divide-gray-200 rtl:divide-x-reverse dark:divide-neutral-700">
                                    ${table.header.map((col, index) => `<th scope="col" class="px-2 py-3 text-xs font-medium text-gray-500 uppercase dark:text-neutral-500">${col}</th>`).join('')}
                                 </tr>
                              </thead>

                              <tbody class="text-center divide-y divide-gray-200 dark:divide-neutral-700">
                              ${table.body.map((row, index) => `
                                 <tr class="divide-x divide-gray-200 rtl:divide-x-reverse dark:divide-neutral-700">
                                    ${row.map((col, index) => `<td class="${index > 4 && index < table.header.length - 2 && errorValue(col) ? 'bg-red-100 dark:bg-red-900' : ''} px-2 py-2 text-xs font-medium text-gray-800 whitespace-nowrap dark:text-neutral-200">${col}</td>`).join('')}
                                 </tr>
                              `).join('')}
                              </tbody>
                           </table>
                        </div>

                        ` : `
                        <p class="py-2 text-start text-sm text-gray-600 dark:text-neutral-500">اسم ورقة العمل: ${table.sheetName} <span class="text-green-500">لا يوجد أخطاء</span></p>
                        `).join('')
                     }
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
   `

   const el = document.createElement('div');
   el.innerHTML = html;
   document.getElementById('errors').appendChild(el);

}

const errorValue = value => {
   if (typeof value === "string") value = Number(value.replace(',', '.')); // Convert "5,6" to 5.6
   return typeof value !== "number" || isNaN(value) || value < 0 || value > 20;
}


export {displayErrors, getErrors };

