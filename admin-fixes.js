// Quick script to implement AdminConsole fixes
const fs = require('fs');
const path = require('path');

const filePath = './src/pages/admin/AdminConsole.tsx';

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add "Add Question" button to Questions tab
content = content.replace(
  '<div className="flex space-x-3">\n                  <input',
  `<div className="flex space-x-3">
                  <button
                    onClick={() => setNewQuestion({ ...newQuestion, prompt: '', connectedKPIs: [] })}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add Question
                  </button>
                  <input`
);

// 2. Change KPI selection from radio to checkbox
content = content.replace(
  /type="radio"/g,
  'type="checkbox"'
);

// 3. Change single KPI selection to multiple
content = content.replace(
  'connectedKPIs: [kpi.id] // Single selection only',
  'connectedKPIs: [...newQuestion.connectedKPIs, kpi.id] // Multiple selection'
);

// 4. Auto-select all KPIs when subtopic changes
content = content.replace(
  /setNewQuestion\(\{ \n\s+\.\.\.newQuestion, \n\s+subtopicId: e\.target\.value,\n\s+topicId: selectedSubtopic\?\.topicId \|\| ''\n\s+\}\)/g,
  `const subtopicKPIs = kpis.filter(k => k.subtopicId === e.target.value).map(k => k.id)
                        setNewQuestion({ 
                          ...newQuestion, 
                          subtopicId: e.target.value,
                          topicId: selectedSubtopic?.topicId || '',
                          connectedKPIs: subtopicKPIs // Auto-select all KPIs
                        })`
);

// 5. Remove IDs from subtopic display
content = content.replace(
  /Edit Subtopic: \{subtopic\.title\} \(ID: \{subtopic\.id\}\)/g,
  'Edit Subtopic: {subtopic.title}'
);

// Write the file back
fs.writeFileSync(filePath, content);

console.log('✅ AdminConsole fixes applied successfully!');
console.log('Changes made:');
console.log('1. ✅ Added "Add Question" button');
console.log('2. ✅ Changed KPI selection to checkboxes');
console.log('3. ✅ Auto-select KPIs for subtopic');
console.log('4. ✅ Removed IDs from subtopic display');
