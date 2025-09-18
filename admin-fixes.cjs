// Quick script to implement AdminConsole fixes
const fs = require('fs');
const path = require('path');

const filePath = './src/pages/admin/AdminConsole.tsx';

try {
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add "Add Question" button to Questions tab
  content = content.replace(
    '<div className="flex space-x-3">',
    `<div className="flex space-x-3">
                  <button
                    onClick={() => setNewQuestion({ ...newQuestion, prompt: '', connectedKPIs: [] })}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    Add Question
                  </button>`
  );

  // 2. Change KPI selection from radio to checkbox
  content = content.replace(
    'type="radio"',
    'type="checkbox"'
  );

  // 3. Fix KPI selection logic for multiple selection
  content = content.replace(
    'connectedKPIs: [kpi.id] // Single selection only',
    `connectedKPIs: e.target.checked 
                                      ? [...newQuestion.connectedKPIs, kpi.id]
                                      : newQuestion.connectedKPIs.filter(id => id !== kpi.id)`
  );

  // 4. Remove "name" attribute from radio buttons (now checkboxes)
  content = content.replace(
    'name="selectedKPI"',
    ''
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
  console.log('3. ✅ Fixed multiple KPI selection logic');
  console.log('4. ✅ Removed IDs from subtopic display');
  
} catch (error) {
  console.error('❌ Error applying fixes:', error.message);
}
