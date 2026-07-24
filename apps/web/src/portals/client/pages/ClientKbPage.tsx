import React, { useState } from 'react';
import { Search, BookOpen } from 'lucide-react';
import { MOCK_KB_ARTICLES, MockKbArticle } from '../../../mocks/data';
import { Link } from 'react-router-dom';
import { useEscapeModal } from '../../../hooks/use-escape-modal';
import { ArticleModal } from '../components/ArticleModal';

export default function ClientKbPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [selectedArticle, setSelectedArticle] = useState<MockKbArticle | null>(null);

  const articles = MOCK_KB_ARTICLES.filter((a) => a.status === 'published');
  const categories = ['Todas', ...Array.from(new Set(articles.map((a) => a.category)))];

  const filtered = articles.filter((a) => {
    const matchSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'Todas' || a.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const closeModal = () => {
    setSelectedArticle(null);
  };

  return (
    <div className="space-y-6 relative">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-1">Base de Conhecimento</h1>
        <p className="text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm">Encontre respostas, tutoriais e guias de uso para resolver suas dúvidas.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar artigos, tutoriais..."
          className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-3.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-50 shadow-sm"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat} onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-105' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-600'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 dark:text-slate-400 dark:text-slate-500 text-sm bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 border-dashed">
          Nenhum artigo encontrado para a sua busca.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((article) => (
            <div 
              key={article.id} 
              onClick={() => setSelectedArticle(article)}
              className="flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer group transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <BookOpen className="h-5 w-5 text-blue-600 group-hover:text-white" />
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">{article.category}</span>
              </div>
              
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 transition-colors line-clamp-2 mb-2 leading-tight">{article.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 dark:text-slate-500 line-clamp-3 leading-relaxed">{article.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Article Modal */}
      {selectedArticle && (
        <ArticleModal article={selectedArticle} onClose={closeModal} />
      )}
    </div>
  );
}
