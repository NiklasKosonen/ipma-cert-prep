// This is a comprehensive fix for the AdminConsole.tsx file
// The changes include:
// 1. Add "Add Question" button to Questions tab
// 2. Change KPI selection from radio to checkboxes (multiple selection)
// 3. Auto-select all KPIs for subtopic by default
// 4. Remove IDs from subtopic display

// Key sections to update:

// 1. Questions Tab Header (around line 1020):
const questionsTabHeader = `
<div className="flex space-x-3">
  <button
    onClick={() => setNewQuestion({ ...newQuestion, prompt: '', connectedKPIs: [] })}
    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
  >
    Add Question
  </button>
  <input
    type="file"
    accept=".xlsx,.xls"
    onChange={handleExcelImport}
    className="hidden"
    id="excel-import"
  />
  <label
    htmlFor="excel-import"
    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 cursor-pointer"
  >
    Import Excel
  </label>
</div>
`;

// 2. KPI Selection (around line 1114):
const kpiSelection = `
<input
  type="checkbox"
  checked={newQuestion.connectedKPIs.includes(kpi.id)}
  onChange={(e) => {
    if (e.target.checked) {
      setNewQuestion({
        ...newQuestion,
        connectedKPIs: [...newQuestion.connectedKPIs, kpi.id]
      })
    } else {
      setNewQuestion({
        ...newQuestion,
        connectedKPIs: newQuestion.connectedKPIs.filter(id => id !== kpi.id)
      })
    }
  }}
  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
/>
`;

// 3. Auto-select KPIs when subtopic changes (around line 1070):
const subtopicChangeHandler = `
onChange={(e) => {
  const selectedSubtopic = subtopics.find(s => s.id === e.target.value)
  const subtopicKPIs = kpis.filter(k => k.subtopicId === e.target.value).map(k => k.id)
  
  setNewQuestion({ 
    ...newQuestion, 
    subtopicId: e.target.value,
    topicId: selectedSubtopic?.topicId || '',
    connectedKPIs: subtopicKPIs // Auto-select all KPIs for this subtopic
  })
}}
`;

// 4. Remove IDs from subtopic display (around line 1085):
const subtopicDisplay = `
<option key={subtopic.id} value={subtopic.id}>
  {topic?.title} - {subtopic.title}
</option>
`;

// 5. Remove IDs from subtopic list display (around line 708):
const subtopicListDisplay = `
<h3 className="text-lg font-medium text-blue-900">
  Edit Subtopic: {subtopic.title}
</h3>
`;

export { questionsTabHeader, kpiSelection, subtopicChangeHandler, subtopicDisplay, subtopicListDisplay };
