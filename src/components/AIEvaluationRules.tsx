import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export interface EvaluationRule {
  id: string;
  description: string;
  points: number;
  kpiCount: number;
  condition: 'exactly' | 'at_least' | 'at_most';
}

interface AIEvaluationRulesProps {
  rules: EvaluationRule[];
  onRulesChange: (rules: EvaluationRule[]) => void;
}

const AIEvaluationRules: React.FC<AIEvaluationRulesProps> = ({ rules, onRulesChange }) => {
  const { t } = useLanguage();
  const [newRule, setNewRule] = useState<Partial<EvaluationRule>>({
    description: '',
    points: 0,
    kpiCount: 0,
    condition: 'exactly'
  });

  const addRule = () => {
    if (!newRule.description || newRule.points === undefined || newRule.kpiCount === undefined) {
      return;
    }

    const rule: EvaluationRule = {
      id: `rule_${Date.now()}`,
      description: newRule.description,
      points: newRule.points,
      kpiCount: newRule.kpiCount,
      condition: newRule.condition || 'exactly'
    };

    onRulesChange([...rules, rule]);
    setNewRule({
      description: '',
      points: 0,
      kpiCount: 0,
      condition: 'exactly'
    });
  };

  const removeRule = (ruleId: string) => {
    onRulesChange(rules.filter(rule => rule.id !== ruleId));
  };

  const updateRule = (ruleId: string, updates: Partial<EvaluationRule>) => {
    onRulesChange(rules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('evaluationRules')}</h3>
          <p className="text-sm text-gray-600 mb-4">{t('ruleDescription')}</p>
          
          {/* AI Evaluation Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="text-md font-medium text-blue-900 mb-3">💡 AI Arviointivinkit</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• <strong>KPI:t eivät tarvitse olla kirjoitettu sanatarkasti</strong> - AI ymmärtää niiden olemassaolon vastauksen kontekstista</p>
              <p>• <strong>Synonyymit ja liittyvät käsitteet</strong> lasketaan KPI:ksi jos ne liittyvät aiheeseen</p>
              <p>• <strong>Implisiittiset viittaukset</strong> ovat yhtä arvokkaita kuin suorat maininnat</p>
              <p>• <strong>Vastauksen laadun arviointi</strong> perustuu kokonaisuuteen, ei vain KPI-määrään</p>
              <p>• <strong>Ymmärryksen taso</strong> näkyy vastauksen syvyydessä ja perustelujen laadussa</p>
            </div>
          </div>
        </div>

      {/* Default Scoring Rules */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">{t('scoringRubric')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800">{t('rule3Points')}</span>
              <span className="text-lg font-bold text-green-600">3</span>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800">{t('rule2Points')}</span>
              <span className="text-lg font-bold text-blue-600">2</span>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-800">{t('rule1Point')}</span>
              <span className="text-lg font-bold text-yellow-600">1</span>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-800">{t('rule0Points')}</span>
              <span className="text-lg font-bold text-red-600">0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Rules */}
      <div className="mb-6">
        <h4 className="text-md font-medium text-gray-900 mb-3">{t('additionalRules')}</h4>
        
        {/* Add New Rule Form */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('description')}
              </label>
              <input
                type="text"
                value={newRule.description || ''}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Sääntökuvaus"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('grade')}
              </label>
              <input
                type="number"
                min="0"
                max="3"
                value={newRule.points || 0}
                onChange={(e) => setNewRule({ ...newRule, points: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                KPI määrä
              </label>
              <input
                type="number"
                min="0"
                value={newRule.kpiCount || 0}
                onChange={(e) => setNewRule({ ...newRule, kpiCount: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={addRule}
                disabled={!newRule.description}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {t('addRule')}
              </button>
            </div>
          </div>
        </div>

        {/* Existing Rules */}
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">
                      {rule.description}
                    </span>
                    <span className="text-sm text-gray-500">
                      {rule.points} pistettä
                    </span>
                    <span className="text-sm text-gray-500">
                      {rule.kpiCount} KPI
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removeRule(rule.id)}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {rules.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Ei lisäsääntöjä määritelty</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIEvaluationRules;
