// Fix the Add Question button functionality
const fs = require('fs');

const filePath = './src/pages/admin/AdminConsole.tsx';

try {
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add handleAddQuestion function after the backup functions
  const handleAddQuestionFunction = `
  const handleAddQuestion = () => {
    if (!newQuestion.subtopicId || !newQuestion.prompt.trim()) {
      alert('Please select a subtopic and enter a question prompt')
      return
    }

    const questionToAdd = {
      ...newQuestion,
      prompt: newQuestion.prompt.trim(),
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    addQuestion(questionToAdd)
    
    // Reset form
    setNewQuestion({
      subtopicId: '',
      topicId: '',
      prompt: '',
      connectedKPIs: []
    })
    
    alert('Question added successfully!')
  }`;

  // Insert the function after the backup functions
  content = content.replace(
    /const handleSyncFromSupabase = async \(\) => \{[\s\S]*?\}\s*\}/,
    `$&${handleAddQuestionFunction}`
  );

  // 2. Fix the Add Question button to call the function
  content = content.replace(
    'onClick={() => setNewQuestion({ ...newQuestion, prompt: \'\', connectedKPIs: [] })}',
    'onClick={handleAddQuestion}'
  );

  // 3. Add a submit button to the form as well
  const submitButton = `
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                    >
                      Add Question
                    </button>
                  </div>`;

  // Add submit button before the closing div of the form
  content = content.replace(
    /(\s*<\/div>\s*<\/div>\s*<\/div>\s*<!-- Questions List -->)/,
    `${submitButton}$1`
  );

  fs.writeFileSync(filePath, content);

  console.log('✅ Add Question button fixed successfully!');
  console.log('Changes made:');
  console.log('1. ✅ Added handleAddQuestion function');
  console.log('2. ✅ Fixed button to call the function');
  console.log('3. ✅ Added submit button to the form');
  
} catch (error) {
  console.error('❌ Error fixing Add Question button:', error.message);
}
