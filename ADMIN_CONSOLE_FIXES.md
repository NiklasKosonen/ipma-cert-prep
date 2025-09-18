# Admin Console Fixes Implementation

## 🎯 **Changes to Implement:**

### 1. **Add "Add Question" Button**
- Location: Questions tab header (around line 1020)
- Add button next to "Import Excel" button

### 2. **Fix KPI Selection**
- Location: Question form KPI selection (around line 1114)
- Change from `type="radio"` to `type="checkbox"`
- Allow multiple KPI selection

### 3. **Auto-select KPIs for Subtopic**
- Location: Subtopic change handler (around line 1070)
- Auto-select all KPIs when subtopic is selected

### 4. **Remove IDs from Subtopic Display**
- Location: Subtopic dropdown options (around line 1085)
- Remove "(ID: xxxx)" from display

## 🔧 **Implementation Steps:**

1. **Update Questions Tab Header:**
```typescript
// Add "Add Question" button before "Import Excel"
<button
  onClick={() => setNewQuestion({ ...newQuestion, prompt: '', connectedKPIs: [] })}
  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
>
  Add Question
</button>
```

2. **Update KPI Selection:**
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

3. **Update Subtopic Change Handler:**
```typescript
// Auto-select all KPIs for subtopic
onChange={(e) => {
  const selectedSubtopic = subtopics.find(s => s.id === e.target.value)
  const subtopicKPIs = kpis.filter(k => k.subtopicId === e.target.value).map(k => k.id)
  
  setNewQuestion({ 
    ...newQuestion, 
    subtopicId: e.target.value,
    topicId: selectedSubtopic?.topicId || '',
    connectedKPIs: subtopicKPIs // Auto-select all KPIs
  })
}}
```

4. **Update Subtopic Display:**
```typescript
// Remove ID from display
<option key={subtopic.id} value={subtopic.id}>
  {topic?.title} - {subtopic.title}
</option>
```

## 🚀 **Ready to Deploy:**
All fixes are ready to be implemented and deployed to Vercel!
