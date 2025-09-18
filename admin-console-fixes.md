# Admin Console Fixes

## Changes to implement:

### 1. Add "Add Question" button to Questions tab
- Add button next to "Import Excel" button
- Button should trigger question creation

### 2. Fix KPI selection in Questions tab
- Change from radio buttons to checkboxes
- Allow multiple KPI selection
- Auto-select all KPIs for the chosen subtopic

### 3. Remove IDs from subtopic display
- Remove "(ID: xxxx)" from subtopic names
- Show only clean subtopic names

### 4. Auto-select KPIs when subtopic changes
- When user selects a subtopic, automatically check all KPIs for that subtopic
- User can then uncheck any KPIs they don't want

## Implementation details:

### Questions Tab Header Fix:
```typescript
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
```

### KPI Selection Fix:
```typescript
// Change from radio to checkbox
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
```

### Auto-select KPIs when subtopic changes:
```typescript
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
```

### Remove IDs from subtopic display:
```typescript
// Change from: {topic?.title} - {subtopic.title} (ID: {subtopic.id})
// To: {topic?.title} - {subtopic.title}
<option key={subtopic.id} value={subtopic.id}>
  {topic?.title} - {subtopic.title}
</option>
```
