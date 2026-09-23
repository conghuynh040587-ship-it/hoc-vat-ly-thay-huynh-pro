<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hệ thống Quản lý Học tập</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    
    <!-- KaTeX cho Toán học/Vật lý -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/contrib/auto-render.min.js"></script>

    <!-- Thư viện SheetJS cho tính năng xuất/nhập Excel -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>

    <!-- React & Babel -->
    <script src="https://unpkg.com/react@17/umd/react.production.min.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #f3f4f6; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
        
        .animate-fadeIn { animation: fadeIn 0.3s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        
        /* CSS cho Marquee chạy ngang (Học sinh) */
        .marquee-container { overflow: hidden; white-space: nowrap; width: 100%; box-sizing: border-box; }
        .marquee-content { display: inline-block; animation: marquee 15s linear infinite; font-weight: bold; }
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
    </style>
</head>
<body>
    <div id="root"></div>

    <script type="text/babel">
        const { useState, useEffect, useRef, useMemo } = React;

        const generateId = () => Math.random().toString(36).substr(2, 9);

        // Dữ liệu mẫu ban đầu
        const initialClassData = {
            "Khối 10": {
                "10A1": [
                    { id: generateId(), name: "Nguyễn Văn A", phone: "0901234567" },
                    { id: generateId(), name: "Trần Thị B", phone: "0987654321" },
                    { id: generateId(), name: "Lê Văn C", phone: "12345" }
                ],
                "10A2": []
            },
            "Khối 11": { "11B1": [] },
            "Khối 12": { "12C1": [] }
        };

        const initialLessonData = {
            "Khối 10": {
                "Chương 1: Động học": [
                    { id: generateId(), name: "Bài 1: Chuyển động thẳng đều", theoryLinks: [{id: generateId(), title: "Lý thuyết CĐT Đều", url: "https://drive.google.com/..."}], simLinks: [{id: generateId(), title: "Mô phỏng Phet", url: "https://phet.colorado.edu/..."}], quizzes: [] },
                    { id: generateId(), name: "Bài 2: Chuyển động biến đổi đều", theoryLinks: [], simLinks: [], quizzes: [] }
                ],
                "Chương 2: Động lực học": []
            },
            "Khối 11": {},
            "Khối 12": {}
        };

        const LatexPreview = ({ text }) => {
            const containerRef = useRef(null);
            useEffect(() => {
                if (containerRef.current && window.renderMathInElement) {
                    window.renderMathInElement(containerRef.current, {
                        delimiters: [ {left: "$$", right: "$$", display: true}, {left: "$", right: "$", display: false} ],
                        throwOnError: false
                    });
                }
            }, [text]);
            return <div ref={containerRef} dangerouslySetInnerHTML={{__html: text.replace(/\n/g, '<br/>')}} className="prose max-w-none text-sm text-gray-800 break-words"/>;
        };

        const CustomModal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = "Xác nhận", cancelText = "Hủy", isDanger = false }) => {
            if (!isOpen) return null;
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
                        <p className="text-gray-600 mb-6">{message}</p>
                        <div className="flex justify-end space-x-3">
                            <button onClick={onCancel} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">{cancelText}</button>
                            <button onClick={onConfirm} className={`px-4 py-2 text-white rounded-lg font-medium transition ${isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{confirmText}</button>
                        </div>
                    </div>
                </div>
            );
        };

        const CustomPrompt = ({ isOpen, title, placeholder, initialValue = "", onConfirm, onCancel }) => {
            const [val, setVal] = useState(initialValue);
            useEffect(() => { if(isOpen) setVal(initialValue); }, [isOpen, initialValue]);
            if (!isOpen) return null;
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
                        <input type="text" value={val} onChange={e=>setVal(e.target.value)} placeholder={placeholder} className="w-full border-gray-300 rounded-lg shadow-sm p-3 mb-6 focus:ring-indigo-500 border" autoFocus />
                        <div className="flex justify-end space-x-3">
                            <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded-lg font-medium">Hủy</button>
                            <button onClick={() => onConfirm(val)} className="px-4 py-2 text-white bg-indigo-600 rounded-lg font-medium">Lưu</button>
                        </div>
                    </div>
                </div>
            );
        };

        const AddResourceModal = ({ isOpen, title, onConfirm, onCancel }) => {
            const [resourceTitle, setResourceTitle] = useState('');
            const [url, setUrl] = useState('');
            
            useEffect(() => {
                if(isOpen) { setResourceTitle(''); setUrl(''); }
            }, [isOpen]);

            if(!isOpen) return null;

            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
                        <div className="space-y-3 mb-6">
                            <input type="text" value={resourceTitle} onChange={e=>setResourceTitle(e.target.value)} placeholder="Tên tài liệu/đề..." className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500" />
                            <input type="text" value={url} onChange={e=>setUrl(e.target.value)} placeholder="Đường link (URL)..." className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded-lg font-medium">Hủy</button>
                            <button onClick={() => {
                                if(!resourceTitle.trim() || !url.trim()) return;
                                onConfirm({ id: generateId(), title: resourceTitle, url: url });
                            }} className="px-4 py-2 text-white bg-indigo-600 rounded-lg font-medium">Lưu</button>
                        </div>
                    </div>
                </div>
            );
        };

        const EditStudentModal = ({ isOpen, student, onConfirm, onCancel }) => {
            const [name, setName] = useState('');
            const [phone, setPhone] = useState('');
            useEffect(() => { if(isOpen && student) { setName(student.name); setPhone(student.phone); } }, [isOpen, student]);
            if(!isOpen) return null;
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Sửa thông tin Học sinh</h3>
                        <div className="space-y-3 mb-6">
                            <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Họ và tên" className="w-full border rounded-lg p-3" />
                            <input type="text" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="Số điện thoại" className="w-full border rounded-lg p-3" />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded-lg">Hủy</button>
                            <button onClick={() => onConfirm(name, phone)} className="px-4 py-2 text-white bg-indigo-600 rounded-lg">Lưu lại</button>
                        </div>
                    </div>
                </div>
            );
        };

        const MultiSelectModal = ({ isOpen, title, options, onConfirm, onCancel }) => {
            const [selectedGrade, setSelectedGrade] = useState(Object.keys(options || {})[0] || '');
            const [selectedClass, setSelectedClass] = useState('');
            useEffect(() => {
                if(isOpen) {
                    const initialG = Object.keys(options || {})[0] || '';
                    setSelectedGrade(initialG);
                    setSelectedClass(initialG ? Object.keys((options || {})[initialG] || {})[0] || '' : '');
                }
            }, [isOpen, options]);
            useEffect(() => { if (selectedGrade && (options || {})[selectedGrade]) setSelectedClass(Object.keys((options || {})[selectedGrade] || {})[0] || ''); }, [selectedGrade, options]);

            if (!isOpen) return null;
            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Khối đích</label>
                                <select value={selectedGrade} onChange={e=>setSelectedGrade(e.target.value)} className="w-full p-2 border rounded-md">
                                    {Object.keys(options || {}).map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Lớp đích</label>
                                <select value={selectedClass} onChange={e=>setSelectedClass(e.target.value)} className="w-full p-2 border rounded-md">
                                    {selectedGrade && Object.keys((options || {})[selectedGrade] || {}).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded-lg">Hủy</button>
                            <button onClick={() => onConfirm(selectedGrade, selectedClass)} className="px-4 py-2 text-white bg-indigo-600 rounded-lg">Chuyển</button>
                        </div>
                    </div>
                </div>
            );
        };

        const QuizBuilderOverlay = ({ isOpen, initialData, onSave, onClose, showToast }) => {
            const [quiz, setQuiz] = useState(initialData || {
                title: 'Đề kiểm tra mới', timeLimit: 45,
                questions: { part1: [], part2: [], part3: [] },
                part1Score: 0.25, part2Scores: { s1: 0.1, s2: 0.25, s3: 0.5, s4: 1.0 }, part3Score: 0.5 
            });
            const [activePartTab, setActivePartTab] = useState('part1');
            const [selectedQIndex, setSelectedQIndex] = useState(null);
            const [showScoreConfig, setShowScoreConfig] = useState(false);

            useEffect(() => {
                if (isOpen) {
                    setQuiz(initialData || {
                        title: 'Đề kiểm tra mới', timeLimit: 45,
                        questions: { part1: [], part2: [], part3: [] },
                        part1Score: 0.25, part2Scores: { s1: 0.1, s2: 0.25, s3: 0.5, s4: 1.0 }, part3Score: 0.5 
                    });
                    setActivePartTab('part1');
                    setSelectedQIndex(null);
                }
            }, [isOpen, initialData]);

            if (!isOpen) return null;

            const getEmptyQuestion = (part) => {
                const base = { id: generateId(), content: '', imageUrl: '', solutionLink: '' };
                if (part === 'part1') return { ...base, options: ['', '', '', ''], correctOption: 0 };
                if (part === 'part2') return { ...base, subQuestions: [{text:'', isTrue:true}, {text:'', isTrue:true}, {text:'', isTrue:true}, {text:'', isTrue:true}] };
                if (part === 'part3') return { ...base, shortAnswer: '' };
            };

            const handleAddQuestion = () => {
                const newQuiz = { ...quiz };
                newQuiz.questions[activePartTab].push(getEmptyQuestion(activePartTab));
                setQuiz(newQuiz);
                setSelectedQIndex(newQuiz.questions[activePartTab].length - 1);
            };

            const updateCurrentQ = (field, value) => {
                if (selectedQIndex === null) return;
                const newQuiz = { ...quiz };
                newQuiz.questions[activePartTab][selectedQIndex][field] = value;
                setQuiz(newQuiz);
            };

            const currentQ = selectedQIndex !== null ? quiz.questions[activePartTab][selectedQIndex] : null;

            return (
                <div className="fixed inset-0 bg-gray-100 z-[9999] flex flex-col animate-fadeIn">
                    <div className="bg-indigo-700 text-white p-4 flex justify-between items-center shadow-md">
                        <div className="flex items-center space-x-4">
                            <button onClick={onClose} className="text-indigo-200 hover:text-white"><i className="fas fa-arrow-left text-xl"></i></button>
                            <input type="text" value={quiz.title} onChange={e=>setQuiz({...quiz, title: e.target.value})} className="bg-indigo-800 border-none rounded px-3 py-1 text-white font-bold text-lg w-64" placeholder="Tên đề..." />
                            <div className="flex items-center space-x-2 text-sm bg-indigo-800 px-3 py-1 rounded">
                                <span>Thời gian (phút):</span>
                                <input type="number" value={quiz.timeLimit} onChange={e=>setQuiz({...quiz, timeLimit: parseInt(e.target.value) || 0})} className="w-16 bg-transparent border-b border-indigo-400 text-center focus:outline-none" />
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button onClick={() => setShowScoreConfig(true)} className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-bold shadow transition flex items-center text-sm">
                                <i className="fas fa-sliders-h mr-2"></i> Cài đặt Điểm
                            </button>
                            <button onClick={() => { onSave(quiz); onClose(); }} className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-bold shadow transition flex items-center text-sm">
                                <i className="fas fa-save mr-2"></i> Lưu Đề & Thoát
                            </button>
                        </div>
                    </div>

                    {showScoreConfig && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center animate-fadeIn">
                            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 text-gray-800">
                                <h3 className="text-xl font-bold mb-4 border-b pb-2 text-indigo-800">Cấu hình Điểm số (Chuẩn 2025)</h3>
                                
                                <div className="space-y-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-bold mb-1">Phần 1: Trắc nghiệm (Điểm/Câu)</label>
                                        <input type="number" step="0.01" value={quiz.part1Score} onChange={e => setQuiz({...quiz, part1Score: Number(e.target.value)})} className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    
                                    <div className="bg-gray-50 p-3 rounded-lg border">
                                        <label className="block text-sm font-bold mb-2">Phần 2: Đúng/Sai (Điểm lũy tiến)</label>
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="flex items-center justify-between"><span className="text-gray-600">Đúng 1 ý:</span> <input type="number" step="0.01" value={quiz.part2Scores?.s1 || 0.1} onChange={e => setQuiz({...quiz, part2Scores: {...quiz.part2Scores, s1: Number(e.target.value)}})} className="w-16 border p-1 rounded text-center bg-white" /></div>
                                            <div className="flex items-center justify-between"><span className="text-gray-600">Đúng 2 ý:</span> <input type="number" step="0.01" value={quiz.part2Scores?.s2 || 0.25} onChange={e => setQuiz({...quiz, part2Scores: {...quiz.part2Scores, s2: Number(e.target.value)}})} className="w-16 border p-1 rounded text-center bg-white" /></div>
                                            <div className="flex items-center justify-between"><span className="text-gray-600">Đúng 3 ý:</span> <input type="number" step="0.01" value={quiz.part2Scores?.s3 || 0.5} onChange={e => setQuiz({...quiz, part2Scores: {...quiz.part2Scores, s3: Number(e.target.value)}})} className="w-16 border p-1 rounded text-center bg-white" /></div>
                                            <div className="flex items-center justify-between"><span className="text-gray-600">Đúng 4 ý:</span> <input type="number" step="0.01" value={quiz.part2Scores?.s4 || 1.0} onChange={e => setQuiz({...quiz, part2Scores: {...quiz.part2Scores, s4: Number(e.target.value)}})} className="w-16 border p-1 rounded text-center bg-white" /></div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold mb-1">Phần 3: Trả lời ngắn (Điểm/Câu)</label>
                                        <input type="number" step="0.01" value={quiz.part3Score} onChange={e => setQuiz({...quiz, part3Score: Number(e.target.value)})} className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                </div>
                                
                                <div className="flex justify-end">
                                    <button onClick={() => setShowScoreConfig(false)} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow transition">Xong</button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-1 overflow-hidden">
                        <div className="w-1/4 bg-white border-r flex flex-col shadow-sm">
                            <div className="p-3 bg-gray-50 border-b flex space-x-1">
                                <button onClick={()=> {setActivePartTab('part1'); setSelectedQIndex(null);}} className={`flex-1 py-2 text-xs font-bold rounded ${activePartTab==='part1'?'bg-indigo-600 text-white':'bg-gray-200 text-gray-600'}`}>P.1 (Chọn 1)</button>
                                <button onClick={()=> {setActivePartTab('part2'); setSelectedQIndex(null);}} className={`flex-1 py-2 text-xs font-bold rounded ${activePartTab==='part2'?'bg-indigo-600 text-white':'bg-gray-200 text-gray-600'}`}>P.2 (Đ/S)</button>
                                <button onClick={()=> {setActivePartTab('part3'); setSelectedQIndex(null);}} className={`flex-1 py-2 text-xs font-bold rounded ${activePartTab==='part3'?'bg-indigo-600 text-white':'bg-gray-200 text-gray-600'}`}>P.3 (Điền)</button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-3 bg-gray-50 flex flex-col space-y-2">
                                {quiz.questions[activePartTab].length === 0 ? (
                                    <p className="text-center text-gray-400 text-sm py-4 italic">Chưa có câu hỏi nào</p>
                                ) : (
                                    quiz.questions[activePartTab].map((q, idx) => (
                                        <div key={q.id} onClick={() => setSelectedQIndex(idx)} className={`p-3 rounded-lg border cursor-pointer flex items-center justify-between group ${selectedQIndex === idx ? 'bg-indigo-100 border-indigo-400' : 'bg-white hover:border-indigo-300'}`}>
                                            <span className="font-bold text-sm">Câu {idx + 1}</span>
                                            <button onClick={(e) => { e.stopPropagation(); const n={...quiz}; n.questions[activePartTab].splice(idx,1); setQuiz(n); setSelectedQIndex(null); }} className="text-red-400 opacity-0 group-hover:opacity-100"><i className="fas fa-trash"></i></button>
                                        </div>
                                    ))
                                )}
                                <button onClick={handleAddQuestion} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-bold hover:border-indigo-500 hover:text-indigo-600">+ Thêm Câu</button>
                            </div>
                        </div>

                        <div className="flex-1 bg-white p-6 overflow-y-auto">
                            {currentQ ? (
                                <div className="max-w-4xl mx-auto space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-xl border">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Nội dung câu hỏi (LaTeX kẹp trong $ hoặc $$):</label>
                                        <div className="flex space-x-4">
                                            <textarea value={currentQ.content} onChange={e=>updateCurrentQ('content', e.target.value)} rows="4" className="flex-1 border p-3 rounded-lg font-mono text-sm" placeholder="VD: Tính $v$ khi $t=2$"></textarea>
                                            <div className="flex-1 border p-3 rounded-lg bg-white overflow-y-auto min-h-[120px]"><LatexPreview text={currentQ.content || "Xem trước..."} /></div>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-4">
                                            <div><label className="text-xs font-bold text-gray-500">Link Ảnh (CDN GitHub):</label><input type="text" value={currentQ.imageUrl || ''} onChange={e=>updateCurrentQ('imageUrl', e.target.value)} className="w-full border p-2 rounded mt-1 text-sm" /></div>
                                            <div><label className="text-xs font-bold text-gray-500">Link Lời giải (Youtube/Drive):</label><input type="text" value={currentQ.solutionLink || ''} onChange={e=>updateCurrentQ('solutionLink', e.target.value)} className="w-full border p-2 rounded mt-1 text-sm" /></div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border shadow-sm border-l-4 border-indigo-500">
                                        <h3 className="font-bold text-lg mb-4 text-indigo-800">Cấu hình Đáp Án</h3>
                                        {activePartTab === 'part1' && (
                                            <div className="space-y-3">
                                                {currentQ.options.map((opt, i) => (
                                                    <div key={i} className="flex items-center space-x-3">
                                                        <input type="radio" checked={currentQ.correctOption === i} onChange={()=>updateCurrentQ('correctOption', i)} className="h-5 w-5 text-indigo-600" />
                                                        <span className="font-bold w-6">{['A', 'B', 'C', 'D'][i]}.</span>
                                                        <input type="text" value={opt} onChange={e=>{const n=[...currentQ.options]; n[i]=e.target.value; updateCurrentQ('options', n);}} className="flex-1 border p-2 rounded font-mono text-sm" />
                                                        <div className="flex-1 bg-gray-50 border p-2 rounded"><LatexPreview text={opt} /></div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {activePartTab === 'part2' && (
                                            <div className="space-y-4">
                                                <p className="text-sm text-gray-500 italic">4 mệnh đề Đúng/Sai (Điểm lũy tiến cấu hình ở tab chung).</p>
                                                {currentQ.subQuestions.map((sq, i) => (
                                                    <div key={i} className="flex space-x-3 items-start border-b pb-3 border-gray-100">
                                                        <span className="font-bold w-6 pt-2">{['a', 'b', 'c', 'd'][i]}.</span>
                                                        <div className="flex-1 space-y-2">
                                                            <input type="text" value={sq.text} onChange={e=>{const n=[...currentQ.subQuestions]; n[i].text=e.target.value; updateCurrentQ('subQuestions', n);}} className="w-full border p-2 rounded text-sm" />
                                                            <div className="bg-gray-50 p-1 rounded"><LatexPreview text={sq.text} /></div>
                                                        </div>
                                                        <button onClick={()=>{const n=[...currentQ.subQuestions]; n[i].isTrue=!n[i].isTrue; updateCurrentQ('subQuestions', n);}} className={`mt-2 px-4 py-2 rounded font-bold w-20 text-center ${sq.isTrue ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {sq.isTrue ? 'ĐÚNG' : 'SAI'}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {activePartTab === 'part3' && (
                                            <div>
                                                <p className="text-sm text-gray-500 italic mb-2">Nhập số (chấp nhận cả . và ,)</p>
                                                <input type="text" value={currentQ.shortAnswer || ''} onChange={e=>updateCurrentQ('shortAnswer', e.target.value)} className="w-full max-w-sm border-2 border-indigo-200 p-3 rounded-lg text-xl font-bold" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <i className="fas fa-hand-pointer text-5xl mb-4 text-gray-300"></i>
                                    <p>Chọn hoặc thêm câu hỏi để soạn thảo.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        };

        const QuizImportModal = ({ isOpen, showToast, onCancel, onConfirmImport }) => {
            const [step, setStep] = useState(1);
            const [p1Count, setP1Count] = useState(12);
            const [p2Count, setP2Count] = useState(4);
            const [p3Count, setP3Count] = useState(6);
            const fileInputRef = useRef(null);

            useEffect(() => { if(isOpen) setStep(1); }, [isOpen]);

            if (!isOpen) return null;

            const handleDownloadTemplate = () => {
                if (!window.XLSX) return showToast("Thư viện Excel chưa sẵn sàng!", "error");
                
                const data = [["Phần", "Nội dung câu hỏi", "Đáp án (P1: 0/1/2/3, P2: Đ,S,Đ,S, P3: Số)", "Tùy chọn (Cách nhau bởi dấu |)", "Link Ảnh (Tuỳ chọn)", "Link Lời giải (Tuỳ chọn)"]];
                
                for (let i = 0; i < p1Count; i++) data.push([1, `Câu trắc nghiệm ${i + 1}`, "0", "Lựa chọn A | Lựa chọn B | Lựa chọn C | Lựa chọn D", "", ""]);
                for (let i = 0; i < p2Count; i++) data.push([2, `Câu Đúng/Sai ${i + 1}`, "Đ,S,Đ,S", "Mệnh đề a | Mệnh đề b | Mệnh đề c | Mệnh đề d", "", ""]);
                for (let i = 0; i < p3Count; i++) data.push([3, `Câu Trả lời ngắn ${i + 1}`, "12.5", "", "", ""]);

                const ws = XLSX.utils.aoa_to_sheet(data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "DeThi");
                XLSX.writeFile(wb, "Template_Nhap_De.xlsx");
                setStep(2);
            };

            const handleUpload = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (evt) => {
                    try {
                        const wb = window.XLSX.read(evt.target.result, { type: 'binary' });
                        const data = window.XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 });
                        
                        const parsedQuiz = {
                            title: 'Đề nhập từ Excel', timeLimit: 45,
                            questions: { part1: [], part2: [], part3: [] },
                            part1Score: 0.25, part2Scores: { s1: 0.1, s2: 0.25, s3: 0.5, s4: 1.0 }, part3Score: 0.5
                        };

                        for (let i = 1; i < data.length; i++) {
                            const row = data[i];
                            if (!row || !row[0]) continue;
                            
                            const part = parseInt(row[0]);
                            const content = String(row[1] || "");
                            const ans = String(row[2] || "");
                            const optsStr = String(row[3] || "");
                            const img = String(row[4] || "");
                            const sol = String(row[5] || "");

                            if (part === 1) {
                                const opts = optsStr.split('|').map(s => s.trim());
                                while (opts.length < 4) opts.push("");
                                parsedQuiz.questions.part1.push({
                                    id: generateId(),
                                    content, imageUrl: img, solutionLink: sol,
                                    options: opts.slice(0, 4), correctOption: parseInt(ans) || 0
                                });
                            } else if (part === 2) {
                                const ansArr = ans.split(',').map(s => s.trim().toUpperCase() === 'Đ');
                                const opts = optsStr.split('|').map(s => s.trim());
                                while (opts.length < 4) opts.push("");
                                while (ansArr.length < 4) ansArr.push(false);
                                parsedQuiz.questions.part2.push({
                                    id: generateId(),
                                    content, imageUrl: img, solutionLink: sol,
                                    subQuestions: [
                                        { text: opts[0], isTrue: ansArr[0] },
                                        { text: opts[1], isTrue: ansArr[1] },
                                        { text: opts[2], isTrue: ansArr[2] },
                                        { text: opts[3], isTrue: ansArr[3] }
                                    ]
                                });
                            } else if (part === 3) {
                                parsedQuiz.questions.part3.push({
                                    id: generateId(),
                                    content, imageUrl: img, solutionLink: sol,
                                    shortAnswer: ans
                                });
                            }
                        }
                        
                        // Đóng modal excel và mở Modal soạn đề
                        onConfirmImport(parsedQuiz);
                        showToast("Nhập đề thành công! Hãy kiểm tra và lưu lại.", "success");
                    } catch (error) {
                        showToast("File không hợp lệ hoặc lỗi định dạng!", "error");
                    }
                };
                reader.readAsBinaryString(file);
            };

            const handleDirectCreate = () => {
                const newQuiz = {
                    title: 'Đề kiểm tra mới', timeLimit: 45,
                    questions: { part1: [], part2: [], part3: [] },
                    part1Score: 0.25, part2Scores: { s1: 0.1, s2: 0.25, s3: 0.5, s4: 1.0 }, part3Score: 0.5
                };

                const getEmptyQuestion = (part) => {
                    const base = { id: generateId(), content: '', imageUrl: '', solutionLink: '' };
                    if (part === 'part1') return { ...base, options: ['', '', '', ''], correctOption: 0 };
                    if (part === 'part2') return { ...base, subQuestions: [{text:'', isTrue:true}, {text:'', isTrue:true}, {text:'', isTrue:true}, {text:'', isTrue:true}] };
                    if (part === 'part3') return { ...base, shortAnswer: '' };
                };

                for(let i=0; i<p1Count; i++) newQuiz.questions.part1.push(getEmptyQuestion('part1'));
                for(let i=0; i<p2Count; i++) newQuiz.questions.part2.push(getEmptyQuestion('part2'));
                for(let i=0; i<p3Count; i++) newQuiz.questions.part3.push(getEmptyQuestion('part3'));

                onConfirmImport(newQuiz);
                showToast("Đã khởi tạo đề. Bạn có thể bắt đầu rà soát và lưu lại!", "success");
            };

            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Khởi Tạo Đề Thi Mới</h3>
                        
                        {step === 1 ? (
                            <div className="space-y-4 mb-6">
                                <p className="text-sm text-gray-600 mb-4">Cấu trúc đề thi (Chuẩn 2025). Nhập số lượng câu hỏi để hệ thống khởi tạo form.</p>
                                <div>
                                    <label className="block font-bold text-sm mb-1 text-gray-700">Số câu Phần 1 (Chọn 1)</label>
                                    <input type="number" min="0" value={p1Count} onChange={e=>setP1Count(Number(e.target.value))} className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block font-bold text-sm mb-1 text-gray-700">Số câu Phần 2 (Đúng/Sai)</label>
                                    <input type="number" min="0" value={p2Count} onChange={e=>setP2Count(Number(e.target.value))} className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                <div>
                                    <label className="block font-bold text-sm mb-1 text-gray-700">Số câu Phần 3 (Điền số)</label>
                                    <input type="number" min="0" value={p3Count} onChange={e=>setP3Count(Number(e.target.value))} className="w-full border p-2 rounded focus:ring-2 focus:ring-indigo-500" />
                                </div>
                                
                                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                                    <button onClick={onCancel} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition text-sm">Hủy</button>
                                    <button onClick={handleDirectCreate} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow transition text-sm">
                                        Soạn Trên Web
                                    </button>
                                    <button onClick={handleDownloadTemplate} className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow transition text-sm">
                                        <i className="fas fa-file-excel mr-1"></i> Tải File Mẫu
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 mb-6 text-center py-4">
                                <div className="inline-block p-4 bg-green-100 rounded-full mb-2">
                                    <i className="fas fa-file-excel text-4xl text-green-600"></i>
                                </div>
                                <h4 className="font-bold text-gray-800">Tải lên File đã điền</h4>
                                <p className="text-sm text-gray-600 mb-4">File mẫu đã được tải xuống. Hãy điền nội dung câu hỏi và chọn nút dưới đây để tải ngược lên hệ thống.</p>
                                
                                <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleUpload} className="hidden" />
                                
                                <div className="flex justify-between items-center mt-4 border-t pt-4">
                                    <button onClick={()=>setStep(1)} className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm font-medium transition">&laquo; Quay lại cấu hình</button>
                                    <div className="flex space-x-2">
                                        <button onClick={onCancel} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">Hủy</button>
                                        <button onClick={()=>fileInputRef.current?.click()} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow transition">
                                            <i className="fas fa-upload mr-2"></i> Tải Lên & Duyệt
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            );
        };

        const AssignQuizModal = ({ isOpen, grade, classes, quiz, onConfirm, onCancel }) => {
            const [selectedClasses, setSelectedClasses] = useState([]);

            useEffect(() => {
                if (isOpen && quiz) {
                    setSelectedClasses(quiz.assignedClasses || []);
                }
            }, [isOpen, quiz]);

            if (!isOpen) return null;

            const handleToggle = (cls) => {
                if (selectedClasses.includes(cls)) {
                    setSelectedClasses(selectedClasses.filter(c => c !== cls));
                } else {
                    setSelectedClasses([...selectedClasses, cls]);
                }
            };

            return (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] animate-fadeIn">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Giao đề thi</h3>
                        <p className="text-sm font-bold text-indigo-700 mb-2">{quiz?.title}</p>
                        <p className="text-sm text-gray-600 mb-3">Chọn các lớp thuộc <span className="font-bold">{grade}</span> được phép làm đề này:</p>
                        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto border p-2 rounded bg-gray-50">
                            {classes.length === 0 ? (
                                <p className="text-sm italic text-gray-500 text-center py-2">Chưa có lớp nào.</p>
                            ) : (
                                classes.map(cls => (
                                    <label key={cls} className="flex items-center space-x-3 p-2 hover:bg-white rounded cursor-pointer border bg-white shadow-sm transition">
                                        <input type="checkbox" checked={selectedClasses.includes(cls)} onChange={() => handleToggle(cls)} className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500" />
                                        <span className="font-bold text-gray-700">{cls}</span>
                                    </label>
                                ))
                            )}
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button onClick={onCancel} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition">Hủy</button>
                            <button onClick={() => onConfirm(selectedClasses)} className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold shadow transition">Lưu Cài Đặt</button>
                        </div>
                    </div>
                </div>
            );
        };

        const TeacherManage = ({ classTree, setClassTree, lessonTree, setLessonTree, onLogout, showToast }) => {
            const [activeTab, setActiveTab] = useState('students');
            const [statSubTab, setStatSubTab] = useState('byClass');
            const fileInputRef = useRef(null);
            
            // Student state
            const [selectedGrade, setSelectedGrade] = useState("Khối 10");
            const [selectedClass, setSelectedClass] = useState("10A1");
            const [studentInputs, setStudentInputs] = useState([{ name: "", phone: "" }]);
            const [selectedStudents, setSelectedStudents] = useState([]);
            const [isSelecting, setIsSelecting] = useState(false);

            // Modals
            const [modalConfig, setModalConfig] = useState({ isOpen: false });
            const [promptConfig, setPromptConfig] = useState({ isOpen: false });
            const [multiSelectConfig, setMultiSelectConfig] = useState({ isOpen: false });
            const [editStudentConfig, setEditStudentConfig] = useState({ isOpen: false });
            const [quizBuilderState, setQuizBuilderState] = useState({ isOpen: false });
            const [quizImportConfig, setQuizImportConfig] = useState({ isOpen: false, path: null });
            const [resourceModalConfig, setResourceModalConfig] = useState({ isOpen: false });
            const [assignQuizConfig, setAssignQuizConfig] = useState({ isOpen: false });

            // Lesson state
            const [lessonGrade, setLessonGrade] = useState("Khối 10");
            const [selectedChapter, setSelectedChapter] = useState(null);
            const [selectedLesson, setSelectedLesson] = useState(null);

            // Stats state
            const [statGrade, setStatGrade] = useState("Khối 10");
            const [statClass, setStatClass] = useState("10A1");
            const [statStudentId, setStatStudentId] = useState("");
            const [statChapter, setStatChapter] = useState("");
            const [statLessonId, setStatLessonId] = useState("");

            const availableStatGrades = Object.keys(classTree);
            const curStatGrade = availableStatGrades.includes(statGrade) ? statGrade : availableStatGrades[0] || "";

            const availableStatClasses = curStatGrade ? Object.keys(classTree[curStatGrade] || {}) : [];
            const curStatClass = availableStatClasses.includes(statClass) ? statClass : availableStatClasses[0] || "";

            const availableStatStudents = (curStatGrade && curStatClass) ? classTree[curStatGrade][curStatClass] : [];
            const curStatStudentId = availableStatStudents.some(s => s.id === statStudentId) ? statStudentId : (availableStatStudents[0]?.id || "");

            const availableStatChapters = curStatGrade && lessonTree[curStatGrade] ? Object.keys(lessonTree[curStatGrade]) : [];
            const curStatChapter = availableStatChapters.includes(statChapter) ? statChapter : availableStatChapters[0] || "";

            const availableStatLessons = curStatChapter ? lessonTree[curStatGrade][curStatChapter] : [];
            const curStatLessonId = availableStatLessons.some(l => l.id === statLessonId) ? statLessonId : (availableStatLessons[0]?.id || "");

            const students = classTree[selectedGrade]?.[selectedClass] || [];
            const isAllSelected = students.length > 0 && selectedStudents.length === students.length;

            const closeAllModals = () => { setModalConfig({isOpen:false}); setPromptConfig({isOpen:false}); setMultiSelectConfig({isOpen:false}); setEditStudentConfig({isOpen:false}); setResourceModalConfig({isOpen:false}); setAssignQuizConfig({isOpen: false}); };

            // Student Logic
            const handleAddClass = () => {
                setPromptConfig({ isOpen: true, title: "Thêm Lớp Mới", placeholder: "Tên lớp", onConfirm: (val) => {
                    if(val && !classTree[selectedGrade][val]) {
                        setClassTree(prev => ({...prev, [selectedGrade]: {...prev[selectedGrade], [val]: []}}));
                        setSelectedClass(val); showToast("Thêm lớp thành công!");
                    }
                    closeAllModals();
                }});
            };

            const handleEditClass = (grade, oldCls) => {
                setPromptConfig({
                    isOpen: true,
                    title: "Sửa Tên Lớp",
                    placeholder: "Nhập tên lớp mới",
                    initialValue: oldCls,
                    onConfirm: (newCls) => {
                        if (!newCls || newCls.trim() === "") return showToast("Tên lớp không được để trống!", "error");
                        if (newCls === oldCls) return closeAllModals();
                        if (classTree[grade][newCls]) return showToast("Tên lớp đã tồn tại!", "error");
                        const newTree = { ...classTree };
                        newTree[grade][newCls] = newTree[grade][oldCls];
                        delete newTree[grade][oldCls];
                        setClassTree(newTree);
                        if (selectedGrade === grade && selectedClass === oldCls) setSelectedClass(newCls);
                        showToast("Đã cập nhật tên lớp!");
                        closeAllModals();
                    }
                });
            };

            const handleDeleteClass = (grade, cls) => {
                setModalConfig({
                    isOpen: true,
                    title: "Xóa Lớp",
                    message: `Xóa lớp ${cls} sẽ xóa luôn toàn bộ ${classTree[grade][cls].length} học sinh trong lớp này. Bạn chắc chắn chứ?`,
                    isDanger: true,
                    onConfirm: () => {
                        const newTree = { ...classTree };
                        delete newTree[grade][cls];
                        setClassTree(newTree);
                        if (selectedGrade === grade && selectedClass === cls) {
                            const remain = Object.keys(newTree[grade]);
                            setSelectedClass(remain.length > 0 ? remain[0] : "");
                        }
                        showToast("Đã xóa lớp!");
                        closeAllModals();
                    }
                });
            };

            const handleSaveStudents = () => {
                const valid = studentInputs.filter(s => s.name.trim() && s.phone.trim()).map(s => ({...s, id: generateId()}));
                if(valid.length === 0) return showToast("Vui lòng nhập dữ liệu!", "error");
                const newTree = {...classTree};
                newTree[selectedGrade][selectedClass] = [...newTree[selectedGrade][selectedClass], ...valid];
                setClassTree(newTree); setStudentInputs([{name:"", phone:""}]); showToast("Thêm thành công!");
            };
            const handleDeleteSelected = () => {
                if(selectedStudents.length === 0) return showToast("Chưa chọn học sinh!", "error");
                setModalConfig({isOpen: true, title: "Xóa học sinh", message: `Xóa ${selectedStudents.length} em?`, isDanger: true, onConfirm: () => {
                    const newTree = {...classTree};
                    newTree[selectedGrade][selectedClass] = newTree[selectedGrade][selectedClass].filter(s => !selectedStudents.includes(s.id));
                    setClassTree(newTree); setSelectedStudents([]); setIsSelecting(false); closeAllModals(); showToast("Đã xóa!");
                }});
            };
            const handleMoveSelected = () => {
                if(selectedStudents.length === 0) return showToast("Chưa chọn học sinh!", "error");
                setMultiSelectConfig({isOpen: true, title: "Chuyển lớp", options: classTree, onConfirm: (tGrade, tClass) => {
                    if(tGrade === selectedGrade && tClass === selectedClass) { closeAllModals(); return showToast("Trùng lớp hiện tại", "error"); }
                    const newTree = JSON.parse(JSON.stringify(classTree));
                    const moving = newTree[selectedGrade][selectedClass].filter(s => selectedStudents.includes(s.id));
                    newTree[selectedGrade][selectedClass] = newTree[selectedGrade][selectedClass].filter(s => !selectedStudents.includes(s.id));
                    newTree[tGrade][tClass] = [...newTree[tGrade][tClass], ...moving];
                    setClassTree(newTree); setSelectedStudents([]); setIsSelecting(false); closeAllModals(); showToast("Đã chuyển lớp!");
                }});
            };

            const handleDownloadStudentTemplate = () => {
                if (!window.XLSX) return showToast("Thư viện Excel chưa sẵn sàng!", "error");
                const data = [
                    ["Ho va ten", "So dien thoai"],
                    ["Nguyễn Văn A", "0901234567"],
                    ["Trần Thị B", "0987654321"]
                ];
                const ws = XLSX.utils.aoa_to_sheet(data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, "DanhSachHS");
                XLSX.writeFile(wb, "Mau_Nhap_Hoc_Sinh.xlsx");
            };

            const handleImportStudents = (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (!window.XLSX) return showToast("Thư viện Excel chưa sẵn sàng!", "error");

                const reader = new FileReader();
                reader.onload = (evt) => {
                    try {
                        const bstr = evt.target.result;
                        const wb = XLSX.read(bstr, { type: 'binary' });
                        const wsname = wb.SheetNames[0];
                        const ws = wb.Sheets[wsname];
                        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
                        
                        const newStudents = [];
                        for (let i = 1; i < data.length; i++) { // Bỏ qua dòng tiêu đề
                            const row = data[i];
                            if (row && row.length >= 2 && row[0] && row[1]) {
                                newStudents.push({
                                    id: generateId(),
                                    name: String(row[0]).trim(),
                                    phone: String(row[1]).trim()
                                });
                            }
                        }

                        if (newStudents.length > 0) {
                            const newTree = {...classTree};
                            newTree[selectedGrade][selectedClass] = [...newTree[selectedGrade][selectedClass], ...newStudents];
                            setClassTree(newTree);
                            showToast(`Đã thêm thành công ${newStudents.length} học sinh từ file Excel!`);
                        } else {
                            showToast("Không tìm thấy dữ liệu hợp lệ trong file!", "error");
                        }
                    } catch (error) {
                        showToast("Lỗi khi đọc file Excel!", "error");
                    }
                    if (fileInputRef.current) fileInputRef.current.value = "";
                };
                reader.readAsBinaryString(file);
            };

            // Lesson Logic
            const handleAddChapter = () => {
                setPromptConfig({ isOpen: true, title: "Thêm Chương Mới", placeholder: "VD: Chương 1: Động học", onConfirm: (val) => {
                    if (!val || val.trim() === "") return closeAllModals();
                    if (lessonTree[lessonGrade][val]) return showToast("Tên chương đã tồn tại!", "error");
                    const newTree = {...lessonTree};
                    newTree[lessonGrade][val] = [];
                    setLessonTree(newTree);
                    setSelectedChapter(val);
                    showToast("Thêm chương thành công!");
                    closeAllModals();
                }});
            };

            const handleEditChapter = (oldChapter) => {
                setPromptConfig({ isOpen: true, title: "Sửa Tên Chương", placeholder: "Nhập tên chương mới", initialValue: oldChapter, onConfirm: (newChapter) => {
                    if (!newChapter || newChapter.trim() === "") return showToast("Tên không được để trống!", "error");
                    if (newChapter === oldChapter) return closeAllModals();
                    if (lessonTree[lessonGrade][newChapter]) return showToast("Tên chương đã tồn tại!", "error");
                    
                    const newTree = {...lessonTree};
                    newTree[lessonGrade][newChapter] = newTree[lessonGrade][oldChapter];
                    delete newTree[lessonGrade][oldChapter];
                    setLessonTree(newTree);
                    if (selectedChapter === oldChapter) setSelectedChapter(newChapter);
                    if (selectedLesson && selectedLesson.chapter === oldChapter) {
                        setSelectedLesson({...selectedLesson, chapter: newChapter});
                    }
                    showToast("Đã cập nhật tên chương!");
                    closeAllModals();
                }});
            };

            const handleDeleteChapter = (chapter) => {
                setModalConfig({ isOpen: true, title: "Xóa Chương", message: `Bạn có chắc chắn muốn xóa "${chapter}" cùng toàn bộ bài học bên trong không?`, isDanger: true, onConfirm: () => {
                    const newTree = {...lessonTree};
                    delete newTree[lessonGrade][chapter];
                    setLessonTree(newTree);
                    if (selectedChapter === chapter) setSelectedChapter(null);
                    if (selectedLesson && selectedLesson.chapter === chapter) setSelectedLesson(null);
                    showToast("Đã xóa chương!");
                    closeAllModals();
                }});
            };

            const handleEditLessonName = (chapter, lessonIndex, oldName) => {
                setPromptConfig({ isOpen: true, title: "Sửa Tên Bài Học", placeholder: "Nhập tên bài mới", initialValue: oldName, onConfirm: (newName) => {
                    if (!newName || newName.trim() === "") return showToast("Tên không được để trống!", "error");
                    const newTree = {...lessonTree};
                    newTree[lessonGrade][chapter][lessonIndex].name = newName;
                    setLessonTree(newTree);
                    if (selectedLesson && selectedLesson.id === newTree[lessonGrade][chapter][lessonIndex].id) {
                        setSelectedLesson({...selectedLesson, name: newName});
                    }
                    showToast("Đã cập nhật tên bài!");
                    closeAllModals();
                }});
            };

            const handleDeleteLesson = (chapter, lessonIndex) => {
                setModalConfig({ isOpen: true, title: "Xóa Bài Học", message: "Bạn có chắc chắn muốn xóa bài học này không?", isDanger: true, onConfirm: () => {
                    const newTree = {...lessonTree};
                    const deletedId = newTree[lessonGrade][chapter][lessonIndex].id;
                    newTree[lessonGrade][chapter].splice(lessonIndex, 1);
                    setLessonTree(newTree);
                    if (selectedLesson && selectedLesson.id === deletedId) setSelectedLesson(null);
                    showToast("Đã xóa bài học!");
                    closeAllModals();
                }});
            };

            const updateLink = (chapter, lessonIndex, field) => {
                setPromptConfig({ isOpen: true, title: "Cập nhật Link", placeholder: "Dán link vào đây...", initialValue: lessonTree[lessonGrade][chapter][lessonIndex][field], onConfirm: (val) => {
                    const newTree = JSON.parse(JSON.stringify(lessonTree));
                    newTree[lessonGrade][chapter][lessonIndex][field] = val;
                    setLessonTree(newTree); 
                    if (selectedLesson && selectedLesson.chapter === chapter && selectedLesson.lessonIndex === lessonIndex) {
                        setSelectedLesson({...selectedLesson, [field]: val});
                    }
                    closeAllModals(); showToast("Đã cập nhật!");
                }});
            };

            return (
                <div className="min-h-screen bg-gray-50">
                    <div className="bg-indigo-700 text-white shadow-md sticky top-0 z-50">
                        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center h-16">
                            <h1 className="font-bold text-xl flex items-center"><i className="fas fa-chalkboard-teacher mr-3"></i> Quản lý Giáo viên</h1>
                            <div className="flex space-x-6">
                                <button onClick={()=>setActiveTab('students')} className={`font-medium pb-2 border-b-2 ${activeTab==='students'?'border-white':'border-transparent opacity-70'}`}>Học sinh</button>
                                <button onClick={()=>setActiveTab('lessons')} className={`font-medium pb-2 border-b-2 ${activeTab==='lessons'?'border-white':'border-transparent opacity-70'}`}>Bài học</button>
                                <button onClick={()=>setActiveTab('stats')} className={`font-medium pb-2 border-b-2 ${activeTab==='stats'?'border-white':'border-transparent opacity-70'}`}>Thống kê</button>
                            </div>
                            <button onClick={onLogout} className="bg-indigo-800 hover:bg-indigo-900 px-4 py-2 rounded text-sm font-bold">Đăng xuất</button>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto p-4 md:p-6">
                        {activeTab === 'students' && (
                            <div className="flex flex-col md:flex-row gap-6 animate-fadeIn">
                                <div className="w-full md:w-1/3 bg-white p-5 rounded-xl shadow-sm border">
                                    <div className="flex justify-between items-center mb-4"><h3 className="font-bold">Cấu trúc Lớp</h3><button onClick={handleAddClass} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded border">+ Thêm Lớp</button></div>
                                    {Object.keys(classTree).map(grade => (
                                        <div key={grade} className="mb-4">
                                            <h4 className="font-bold text-gray-700 mb-2 border-b">{grade}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.keys(classTree[grade]).map(cls => (
                                                    <div key={cls} className={`flex items-stretch rounded-md border overflow-hidden transition-all ${selectedGrade===grade && selectedClass===cls ? 'border-indigo-600 shadow-sm' : 'border-gray-200'}`}>
                                                        <button onClick={()=>{setSelectedGrade(grade); setSelectedClass(cls);}} className={`px-3 py-1.5 text-sm font-medium ${selectedGrade===grade && selectedClass===cls ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}`}>
                                                            {cls}
                                                        </button>
                                                        <div className={`flex border-l bg-white ${selectedGrade===grade && selectedClass===cls ? 'border-indigo-600' : 'border-gray-200'}`}>
                                                            <button onClick={() => handleEditClass(grade, cls)} className="px-2 text-blue-500 hover:bg-blue-50 transition" title="Sửa tên lớp"><i className="fas fa-edit text-xs"></i></button>
                                                            <button onClick={() => handleDeleteClass(grade, cls)} className="px-2 text-red-500 hover:bg-red-50 border-l border-gray-100 transition" title="Xóa lớp"><i className="fas fa-trash text-xs"></i></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="w-full md:w-2/3 bg-white p-5 rounded-xl shadow-sm border flex flex-col">
                                    <div className="flex justify-between items-center mb-4 border-b pb-4">
                                        <h3 className="font-bold text-xl text-indigo-800">Danh sách {selectedClass}</h3>
                                        <div className="flex space-x-2">
                                            {isSelecting && selectedStudents.length > 0 && (
                                                <><button onClick={handleMoveSelected} className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-sm font-bold">Chuyển ({selectedStudents.length})</button>
                                                <button onClick={handleDeleteSelected} className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-sm font-bold">Xóa ({selectedStudents.length})</button></>
                                            )}
                                            <button onClick={()=>setIsSelecting(!isSelecting)} className="px-3 py-1.5 rounded-lg text-sm font-bold bg-orange-50 text-orange-600 border">Chọn nhiều</button>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg mb-4 border">
                                        {studentInputs.map((input, idx) => (
                                            <div key={idx} className="flex space-x-2 mb-2">
                                                <input type="text" placeholder="Họ Tên" value={input.name} onChange={e=>{const n=[...studentInputs]; n[idx].name=e.target.value; setStudentInputs(n);}} className="flex-1 p-2 border rounded" />
                                                <input type="text" placeholder="SĐT" value={input.phone} onChange={e=>{const n=[...studentInputs]; n[idx].phone=e.target.value; setStudentInputs(n);}} className="flex-1 p-2 border rounded" />
                                                {idx===studentInputs.length-1 && <button onClick={()=>setStudentInputs([...studentInputs, {name:"", phone:""}])} className="bg-gray-200 px-3 rounded">+</button>}
                                            </div>
                                        ))}
                                        <div className="flex space-x-2 mt-3">
                                            <button onClick={handleSaveStudents} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition">Thêm Thủ Công</button>
                                            <button onClick={handleDownloadStudentTemplate} className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-4 py-2 rounded-lg font-bold transition flex items-center"><i className="fas fa-download mr-2"></i> Tải File Mẫu</button>
                                            <button onClick={() => fileInputRef.current && fileInputRef.current.click()} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition flex items-center"><i className="fas fa-file-excel mr-2"></i> Nhập Excel</button>
                                            <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleImportStudents} className="hidden" />
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-y-auto border rounded-lg">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 border-b">
                                                <tr>
                                                    {isSelecting && <th className="p-3 w-10 text-center"><input type="checkbox" checked={isAllSelected} onChange={() => isAllSelected ? setSelectedStudents([]) : setSelectedStudents(students.map(s=>s.id))} /></th>}
                                                    <th className="p-3 font-bold text-gray-600">STT</th><th className="p-3 font-bold text-gray-600">Họ và Tên</th><th className="p-3 font-bold text-gray-600">SĐT</th><th className="p-3 text-right">Thao tác</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {students.map((s, idx) => (
                                                    <tr key={s.id} className="border-b hover:bg-gray-50">
                                                        {isSelecting && <td className="p-3 text-center"><input type="checkbox" checked={selectedStudents.includes(s.id)} onChange={() => selectedStudents.includes(s.id) ? setSelectedStudents(selectedStudents.filter(id=>id!==s.id)) : setSelectedStudents([...selectedStudents, s.id])} /></td>}
                                                        <td className="p-3">{idx+1}</td><td className="p-3 font-medium text-gray-800">{s.name}</td><td className="p-3 text-gray-600">{s.phone}</td>
                                                        <td className="p-3 text-right">
                                                            <button onClick={()=>setEditStudentConfig({isOpen: true, student: s})} className="text-blue-500 mr-3"><i className="fas fa-edit"></i></button>
                                                            <button onClick={()=>{setSelectedStudents([s.id]); setIsSelecting(true);}} className="text-red-500"><i className="fas fa-trash"></i></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'lessons' && (
                            <div className="flex flex-col md:flex-row gap-6 animate-fadeIn">
                                <div className="w-full md:w-1/3 bg-white p-5 rounded-xl shadow-sm border h-[calc(100vh-140px)]">
                                    <div className="flex space-x-2 mb-4 bg-gray-100 p-1 rounded-lg">
                                        {Object.keys(lessonTree).map(grade => (
                                            <button key={grade} onClick={()=>{setLessonGrade(grade); setSelectedChapter(null); setSelectedLesson(null);}} className={`flex-1 py-1.5 text-sm font-bold rounded-md ${lessonGrade===grade?'bg-white shadow text-indigo-600':'text-gray-500'}`}>{grade}</button>
                                        ))}
                                    </div>
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-bold">Chương trình {lessonGrade}</h3>
                                        <button onClick={handleAddChapter} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded border hover:bg-indigo-100 transition">+ Thêm Chương</button>
                                    </div>
                                    <div className="overflow-y-auto space-y-3">
                                        {Object.keys(lessonTree[lessonGrade]).map(chapter => (
                                            <div key={chapter} className="border rounded-lg">
                                                <div className="bg-gray-50 px-3 py-2 font-bold cursor-pointer flex justify-between items-center group" onClick={()=>setSelectedChapter(selectedChapter===chapter?null:chapter)}>
                                                    <span className="flex-1 truncate pr-2"><i className="fas fa-folder text-yellow-500 mr-2"></i> {chapter}</span>
                                                    <div className="flex space-x-2 items-center">
                                                        <button onClick={(e)=>{e.stopPropagation(); handleEditChapter(chapter);}} className="text-blue-500 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition" title="Sửa tên chương"><i className="fas fa-edit"></i></button>
                                                        <button onClick={(e)=>{e.stopPropagation(); handleDeleteChapter(chapter);}} className="text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition" title="Xóa chương"><i className="fas fa-trash"></i></button>
                                                        <button onClick={(e)=>{e.stopPropagation(); setPromptConfig({isOpen:true, title:"Thêm Bài", placeholder:"Tên bài mới", onConfirm:(val)=>{if(!val) return closeAllModals(); const n={...lessonTree}; n[lessonGrade][chapter].push({id:generateId(), name:val, theoryLinks:[], simLinks:[], quizzes:[]}); setLessonTree(n); closeAllModals(); showToast("Đã thêm bài!");}});}} className="text-indigo-600 border border-indigo-200 bg-white hover:bg-indigo-50 px-2 py-0.5 rounded text-xs ml-2 transition whitespace-nowrap">+ Thêm Bài</button>
                                                    </div>
                                                </div>
                                                {selectedChapter === chapter && (
                                                    <div className="p-2 space-y-1">
                                                        {lessonTree[lessonGrade][chapter].map((lesson, idx) => (
                                                            <div key={lesson.id} onClick={()=>setSelectedLesson({chapter, lessonIndex: idx, ...lesson})} className={`px-3 py-2 text-sm rounded cursor-pointer flex justify-between items-center group ${selectedLesson?.id === lesson.id ? 'bg-indigo-100 font-bold' : 'hover:bg-gray-50'}`}>
                                                                <span className="flex-1 truncate pr-2"><i className="fas fa-file-alt mr-2 text-gray-400"></i> {lesson.name}</span>
                                                                <div className="flex space-x-3 opacity-0 group-hover:opacity-100 transition">
                                                                    <button onClick={(e)=>{e.stopPropagation(); handleEditLessonName(chapter, idx, lesson.name);}} className="text-blue-500 hover:text-blue-700" title="Sửa tên bài"><i className="fas fa-edit"></i></button>
                                                                    <button onClick={(e)=>{e.stopPropagation(); handleDeleteLesson(chapter, idx);}} className="text-red-500 hover:text-red-700" title="Xóa bài"><i className="fas fa-trash"></i></button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {lessonTree[lessonGrade][chapter].length === 0 && <div className="text-center text-xs text-gray-400 py-2 italic">Chưa có bài học nào</div>}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="w-full md:w-2/3 bg-white p-6 rounded-xl shadow-sm border flex flex-col">
                                    {selectedLesson ? (
                                        <div className="space-y-6">
                                            <h2 className="text-2xl font-bold text-indigo-900 border-b pb-3">{selectedLesson.name}</h2>
                                            
                                            <div className="border rounded-xl overflow-hidden bg-blue-50/30">
                                                <div className="bg-blue-100 p-3 flex justify-between items-center border-b border-blue-200">
                                                    <h4 className="font-bold text-blue-800"><i className="fas fa-book mr-2"></i> 1. Tài liệu Lý thuyết</h4>
                                                    <button onClick={()=>setResourceModalConfig({isOpen: true, title: "Thêm tài liệu Lý thuyết", onConfirm: (data) => {
                                                        const newTree = {...lessonTree};
                                                        if(!newTree[lessonGrade][selectedLesson.chapter][selectedLesson.lessonIndex].theoryLinks) newTree[lessonGrade][selectedLesson.chapter][selectedLesson.lessonIndex].theoryLinks = [];
                                                        newTree[lessonGrade][selectedLesson.chapter][selectedLesson.lessonIndex].theoryLinks.push(data);
                                                        setLessonTree(newTree); setSelectedLesson({...newTree[lessonGrade][selectedLesson.chapter][selectedLesson.lessonIndex], chapter: selectedLesson.chapter, lessonIndex: selectedLesson.lessonIndex});
                                                        closeAllModals(); showToast("Đã thêm tài liệu!");
                                                    }})} className="bg-white border border-blue-300 hover:bg-blue-50 text-blue-700 px-3 py-1 rounded text-sm font-bold transition">+ Thêm Tài Liệu</button>
                                                </div>
                                                <div className="p-4 space-y-2">
                                                    {(selectedLesson.theoryLinks || []).length > 0 ? selectedLesson.theoryLinks.map((link, idx) => (
                                                        <div key={link.id} className="flex justify-between items-center bg-white border p-2 rounded hover:shadow-sm transition group">
                                                            <div className="overflow-hidden pr-4">
                                                                <p className="font-bold text-sm text-gray-800 truncate">{link.title}</p>
                                                                <a href={link.url} target="_blank" className="text-xs text-blue-500 truncate block">{link.url}</a>
                                                            </div>
                                                            <button onClick={()=>{
                                                                const newTree = {...lessonTree};
                                                                newTree[lessonGrade][selectedLesson.chapter][selectedLesson.lessonIndex].theoryLinks.splice(idx, 1);
                                                                setLessonTree(newTree); setSelectedLesson({...newTree[lessonGrade][selectedLesson.chapter][selectedLesson.lessonIndex], chapter: selectedLesson.chapter, lessonIndex: selectedLesson.lessonIndex});
                                                                showToast("Đã xóa tài liệu!");
                                                            }} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 p-2"><i className="fas fa-trash"></i></button>
                                                        </div>
                                                    )) : <p className="text-sm text-gray-400 italic text-center py-2">Chưa có tài liệu lý thuyết nào.</p>}
                                                </div>
                                            </div>

                                            <div className="border rounded-xl overflow-hidden bg-orange-50/30">
                                                <div className="bg-orange-100 p-3 flex justify-between items-center border-b border-orange-200">
                                                    <h4 className="font-bold text-orange-800"><i className="fas fa-flask mr-2"></i> 2. Link Thí nghiệm</h4>
                                                    <button onClick={()=>setResourceModalConfig({isOpen: true, title: "Thêm link Thí nghiệm", onConfirm: (data) => {
                                                        const newTree = {...lessonTree};
                                                        if(!newTree[lessonGrade][selectedLesson.chapter][selectedLesson.lessonIndex].simLinks) newTree[lessonGrade][selectedLesson.chapter][selectedLesson.lessonIndex].simLinks = [];
                                                        newTree[lessonGrade][selectedLesson.chapter][selectedLesson.lessonIndex].simLinks.push(data);
                                                        setLessonTree(newTree); setSelectedLesson({...newTree[lessonGrade][selectedLesson.chapter][selectedLesson.lessonIndex], chapter: selectedLesson.chapter, lessonIndex: selectedLesson.lessonIndex});
                                                        closeAllModals(); showToast("Đã thêm link thí nghiệm!");
                                                    }})} className="bg-white border border-orange-300 hover:bg-orange-50 text-orange-700 px-3 py-1 rounded text-sm font-bold transition">+ Thêm Thí Nghiệm</button>
                                                </div>
                                                <div className="p-4 space-y-2">
                                                    {(selectedLesson.simLinks || []).length > 0 ? selectedLesson.simLinks.map((link, idx) => (
                                                        <div key={link.id} className="flex justify-between items-center bg-white border p-2 rounded hover:shadow-sm transition group">
                                                            <div className="overflow-hidden pr-4">
                                                                <p className="font-bold text-sm text-gray-800 truncate">{link.title}</p>
                                                                <a href={link.url} target="_blank" className="text-xs text-orange-500 truncate block">{link.url}</a>
                                                            </div>
                                                            <button onClick={()=>{
                                                                const newTree = {...lessonTree};
                                                                newTree[lessonGrade][selectedLesson.chapter][selectedLesson.lessonIndex].simLinks.splice(idx, 1);
                                                                setLessonTree(newTree); setSelectedLesson({...newTree[lessonGrade][selectedLesson.chapter][selectedLesson.lessonIndex], chapter: selectedLesson.chapter, lessonIndex: selectedLesson.lessonIndex});
                                                                showToast("Đã xóa link thí nghiệm!");
                                                            }} className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 p-2"><i className="fas fa-trash"></i></button>
                                                        </div>
                                                    )) : <p className="text-sm text-gray-400 italic text-center py-2">Chưa có link thí nghiệm nào.</p>}
                                                </div>
                                            </div>

                                            <div className="border rounded-xl overflow-hidden bg-green-50/30">
                                                <div className="bg-green-100 p-3 flex justify-between items-center border-b border-green-200">
                                                    <h4 className="font-bold text-green-800"><i className="fas fa-tasks mr-2"></i> 3. Đề Ôn Tập</h4>
                                                    <div className="flex space-x-2">
                                                        <button onClick={()=>setQuizImportConfig({isOpen: true, path: {c: selectedLesson.chapter, i: selectedLesson.lessonIndex, qIdx: -1}})} className="bg-green-600 text-white hover:bg-green-700 px-4 py-1.5 rounded text-sm font-bold transition">+ Soạn Đề Mới</button>
                                                    </div>
                                                </div>
                                                <div className="p-4 grid grid-cols-1 gap-3">
                                                    {(selectedLesson.quizzes || []).length > 0 ? selectedLesson.quizzes.map((quiz, idx) => (
                                                        <div key={quiz.id || idx} className="flex justify-between items-center bg-white border border-green-200 p-3 rounded-lg hover:shadow-md transition group">
                                                            <div>
                                                                <p className="font-bold text-green-800 text-lg">{quiz.title}</p>
                                                                <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                                                                    <span><i className="far fa-clock"></i> {quiz.timeLimit} phút</span>
                                                                    <span>|</span>
                                                                    <span title="Các lớp được giao">
                                                                        <i className="fas fa-users text-purple-500"></i> {quiz.assignedClasses?.length > 0 ? quiz.assignedClasses.join(', ') : 'Chưa giao'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="flex space-x-2">
                                                                <button onClick={()=>setAssignQuizConfig({isOpen: true, path: {c: selectedLesson.chapter, i: selectedLesson.lessonIndex, qIdx: idx}, quiz: quiz, grade: lessonGrade, classes: Object.keys(classTree[lessonGrade] || {})})} className="text-sm bg-purple-50 text-purple-600 px-3 py-1 rounded border border-purple-200 font-bold hover:bg-purple-100"><i className="fas fa-share-square mr-1"></i> Giao đề</button>
                                                                <button onClick={()=>setQuizBuilderState({isOpen: true, data: quiz, path: {c: selectedLesson.chapter, i: selectedLesson.lessonIndex, qIdx: idx}})} className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded border border-blue-200 font-bold hover:bg-blue-100">Sửa đề</button>
                                                                <button onClick={()=>{
                                                                    setModalConfig({isOpen: true, title: "Xóa đề thi", message: `Bạn có chắc muốn xóa đề "${quiz.title}"?`, isDanger: true, onConfirm: () => {
                                                                        const newTree = {...lessonTree};
                                                                        newTree[lessonGrade][selectedLesson.chapter][selectedLesson.lessonIndex].quizzes.splice(idx, 1);
                                                                        setLessonTree(newTree); setSelectedLesson({...newTree[lessonGrade][selectedLesson.chapter][selectedLesson.lessonIndex], chapter: selectedLesson.chapter, lessonIndex: selectedLesson.lessonIndex});
                                                                        closeAllModals(); showToast("Đã xóa đề thi!");
                                                                    }});
                                                                }} className="text-sm bg-red-50 text-red-600 px-3 py-1 rounded border border-red-200 font-bold hover:bg-red-100"><i className="fas fa-trash"></i></button>
                                                            </div>
                                                        </div>
                                                    )) : <p className="text-sm text-gray-400 italic text-center py-4">Chưa có đề ôn tập nào được tạo.</p>}
                                                </div>
                                            </div>
                                        </div>
                                    ) : <div className="h-full flex flex-col items-center justify-center text-gray-400">Chọn bài học để thao tác</div>}
                                </div>
                            </div>
                        )}

                        {activeTab === 'stats' && (
                            <div className="bg-white p-5 rounded-xl shadow-sm border min-h-[500px] animate-fadeIn">
                                <div className="flex space-x-4 mb-6 border-b pb-3">
                                    <button onClick={()=>setStatSubTab('byClass')} className={`font-bold px-4 py-2 rounded-lg ${statSubTab==='byClass'?'bg-indigo-100 text-indigo-700':'text-gray-500'}`}>Theo Lớp</button>
                                    <button onClick={()=>setStatSubTab('byStudent')} className={`font-bold px-4 py-2 rounded-lg ${statSubTab==='byStudent'?'bg-indigo-100 text-indigo-700':'text-gray-500'}`}>Theo Học Sinh</button>
                                    <button onClick={()=>setStatSubTab('byQuiz')} className={`font-bold px-4 py-2 rounded-lg ${statSubTab==='byQuiz'?'bg-indigo-100 text-indigo-700':'text-gray-500'}`}>Theo Đề</button>
                                </div>
                                
                                {statSubTab === 'byClass' && (
                                    <div>
                                        {}
                                        <div className="flex space-x-4 mb-4">
                                            <select value={curStatGrade} onChange={e => {setStatGrade(e.target.value); setStatClass("");}} className="border p-2 rounded bg-gray-50 min-w-[120px]">
                                                {availableStatGrades.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                            <select value={curStatClass} onChange={e => setStatClass(e.target.value)} className="border p-2 rounded bg-gray-50 min-w-[120px]">
                                                {availableStatClasses.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <table className="w-full text-left border"><thead className="bg-gray-50 border-b"><tr><th className="p-3">STT</th><th className="p-3">Họ Tên</th><th className="p-3 text-center">Tiến độ</th><th className="p-3 text-center">Điểm TB</th><th className="p-3">Xếp Loại</th></tr></thead>
                                        <tbody>
                                            {availableStatStudents.map((s,i) => ( <tr key={s.id} className="border-b"><td className="p-3">{i+1}</td><td className="p-3 font-bold">{s.name}</td><td className="p-3 text-center">15/20</td><td className="p-3 text-center font-bold text-blue-600">8.5</td><td className="p-3 text-green-600 font-bold">Giỏi</td></tr> ))}
                                            {availableStatStudents.length === 0 && <tr><td colSpan="5" className="p-3 text-center text-gray-500">Chưa có học sinh trong lớp này</td></tr>}
                                        </tbody></table>
                                    </div>
                                )}
                                {statSubTab === 'byStudent' && (
                                    <div>
                                        {}
                                        <div className="flex space-x-4 mb-4">
                                            <select value={curStatGrade} onChange={e => {setStatGrade(e.target.value); setStatClass(""); setStatStudentId("");}} className="border p-2 rounded bg-gray-50 min-w-[120px]">
                                                {availableStatGrades.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                            <select value={curStatClass} onChange={e => {setStatClass(e.target.value); setStatStudentId("");}} className="border p-2 rounded bg-gray-50 min-w-[120px]">
                                                {availableStatClasses.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <select value={curStatStudentId} onChange={e => setStatStudentId(e.target.value)} className="border p-2 rounded bg-gray-50 min-w-[150px]">
                                                {availableStatStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                        {curStatStudentId ? (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border min-w-[800px]"><thead className="bg-gray-50 border-b"><tr><th className="p-3 w-12 text-center">STT</th><th className="p-3">Họ và Tên</th><th className="p-3">Tên đề</th><th className="p-3 text-center">Điểm TB</th><th className="p-3 text-center">Điểm cao nhất</th><th className="p-3 text-center">Số lượt</th><th className="p-3">Thời gian các lượt</th></tr></thead>
                                                <tbody>
                                                    {availableStatChapters.length > 0 && availableStatChapters.some(c => lessonTree[curStatGrade][c].some(l => l.quiz)) ? (
                                                        availableStatChapters.flatMap((chapter, cIdx) => 
                                                            lessonTree[curStatGrade][chapter].filter(l => l.quiz).map((l, lIdx) => {
                                                                const studentName = availableStatStudents.find(s => s.id === curStatStudentId)?.name || "";
                                                                const attempts = Math.floor(Math.random() * 3) + 1;
                                                                const scores = Array.from({length: attempts}, () => Number((Math.random() * 4 + 6).toFixed(1)));
                                                                const highest = Math.max(...scores).toFixed(1);
                                                                const avg = (scores.reduce((a,b)=>a+b, 0) / attempts).toFixed(1);
                                                                const times = Array.from({length: attempts}, (_, idx) => `Lần ${idx+1}: ${Math.floor(Math.random() * 30 + 10)}p`).join(', ');
                                                                return (
                                                                    <tr key={l.id} className="border-b hover:bg-gray-50">
                                                                        <td className="p-3 text-center">{cIdx * 10 + lIdx + 1}</td>
                                                                        <td className="p-3 font-medium text-gray-800">{studentName}</td>
                                                                        <td className="p-3 font-bold">{l.quiz.title}</td>
                                                                        <td className="p-3 text-center font-bold text-blue-600">{avg}</td>
                                                                        <td className="p-3 text-center font-bold text-green-600">{highest}</td>
                                                                        <td className="p-3 text-center">{attempts}</td>
                                                                        <td className="p-3 text-gray-600 text-xs">{times}</td>
                                                                    </tr>
                                                                );
                                                            })
                                                        )
                                                    ) : (
                                                        <tr className="border-b hover:bg-gray-50">
                                                            <td className="p-3 text-center">1</td>
                                                            <td className="p-3 font-medium text-gray-800">{availableStatStudents.find(s => s.id === curStatStudentId)?.name || ""}</td>
                                                            <td className="p-3 font-bold">Bài 1: CĐT Đều (Mẫu)</td>
                                                            <td className="p-3 text-center font-bold text-blue-600">8.5</td>
                                                            <td className="p-3 text-center font-bold text-green-600">9.0</td>
                                                            <td className="p-3 text-center">2</td>
                                                            <td className="p-3 text-gray-600 text-xs">Lần 1: 30p, Lần 2: 25p</td>
                                                        </tr>
                                                    )}
                                                </tbody></table>
                                            </div>
                                        ) : <div className="text-center text-gray-500 py-8 border rounded-lg bg-gray-50">Không có dữ liệu học sinh. Vui lòng chọn lớp có học sinh.</div>}
                                    </div>
                                )}
                                {statSubTab === 'byQuiz' && (
                                    <div>
                                        {}
                                        <div className="flex space-x-2 mb-4">
                                            <select value={curStatGrade} onChange={e => {setStatGrade(e.target.value); setStatClass(""); setStatChapter(""); setStatLessonId("");}} className="border p-2 rounded bg-gray-50 text-sm">
                                                {availableStatGrades.map(g => <option key={g} value={g}>{g}</option>)}
                                            </select>
                                            <select value={curStatClass} onChange={e => setStatClass(e.target.value)} className="border p-2 rounded bg-gray-50 text-sm">
                                                {availableStatClasses.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <select value={curStatChapter} onChange={e => {setStatChapter(e.target.value); setStatLessonId("");}} className="border p-2 rounded bg-gray-50 text-sm">
                                                {availableStatChapters.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                            <select value={curStatLessonId} onChange={e => setStatLessonId(e.target.value)} className="border p-2 rounded bg-gray-50 text-sm max-w-xs truncate">
                                                {availableStatLessons.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                            </select>
                                            {/* Ô hiển thị Đề (Quiz) thuộc về Bài học hiện tại */}
                                            <select className="border p-2 rounded bg-indigo-50 text-indigo-700 font-bold text-sm max-w-xs truncate" disabled>
                                                <option>{availableStatLessons.find(l => l.id === curStatLessonId)?.quiz?.title || "Bài học này chưa có đề"}</option>
                                            </select>
                                        </div>
                                        {curStatLessonId && availableStatLessons.find(l => l.id === curStatLessonId)?.quiz ? (
                                            <div className="flex flex-col space-y-6">
                                                <div className="overflow-x-auto">
                                                    <h4 className="font-bold text-gray-700 mb-2">Phần 1: Kết quả của học sinh</h4>
                                                    <table className="w-full text-left border text-sm min-w-[700px]">
                                                        <thead className="bg-gray-50 border-b">
                                                            <tr>
                                                                <th className="p-3 w-12 text-center">STT</th>
                                                                <th className="p-3">Họ và Tên</th>
                                                                <th className="p-3 text-center">Điểm TB</th>
                                                                <th className="p-3 text-center">Điểm Cao Nhất</th>
                                                                <th className="p-3 text-center">Số Lượt</th>
                                                                <th className="p-3">Thời gian các lượt</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {availableStatStudents.map((s, i) => {
                                                                const attempts = Math.floor(Math.random() * 3) + 1;
                                                                const scores = Array.from({length: attempts}, () => Number((Math.random() * 4 + 6).toFixed(1)));
                                                                const highest = Math.max(...scores).toFixed(1);
                                                                const avg = (scores.reduce((a,b)=>a+b, 0) / attempts).toFixed(1);
                                                                const times = Array.from({length: attempts}, (_, idx) => `Lần ${idx+1}: ${Math.floor(Math.random() * 30 + 10)}p`).join(', ');
                                                                
                                                                return (
                                                                    <tr key={s.id} className="border-b hover:bg-gray-50">
                                                                        <td className="p-3 text-center">{i + 1}</td>
                                                                        <td className="p-3 font-bold">{s.name}</td>
                                                                        <td className="p-3 text-center font-bold text-blue-600">{avg}</td>
                                                                        <td className="p-3 text-center font-bold text-green-600">{highest}</td>
                                                                        <td className="p-3 text-center">{attempts}</td>
                                                                        <td className="p-3 text-gray-600 text-xs">{times}</td>
                                                                    </tr>
                                                                );
                                                            })}
                                                            {availableStatStudents.length === 0 && <tr><td colSpan="6" className="text-center p-4 text-gray-500">Chưa có học sinh trong lớp này</td></tr>}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                
                                                <div className="overflow-x-auto">
                                                    <h4 className="font-bold text-gray-700 mb-2">Phần 2: Thống kê theo câu hỏi</h4>
                                                    <table className="w-full text-left border text-sm min-w-[500px]">
                                                        <thead className="bg-gray-50 border-b">
                                                            <tr>
                                                                <th className="p-3">Câu hỏi (Minh họa)</th>
                                                                <th className="p-3 text-center text-green-600">Số HS Đúng</th>
                                                                <th className="p-3 text-center text-red-600">Số HS Sai</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr className="border-b hover:bg-gray-50"><td className="p-3 font-bold">Câu 1 (Chọn 1)</td><td className="p-3 text-center font-bold text-green-600">{(Math.random() * 20 + 10).toFixed()}</td><td className="p-3 text-center font-bold text-red-600">{(Math.random() * 10).toFixed()}</td></tr>
                                                            <tr className="border-b hover:bg-gray-50"><td className="p-3 font-bold">Câu 2 (Đúng/Sai)</td><td className="p-3 text-center font-bold text-green-600">{(Math.random() * 20 + 10).toFixed()}</td><td className="p-3 text-center font-bold text-red-600">{(Math.random() * 10).toFixed()}</td></tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ) : <div className="text-center text-gray-500 py-8 border rounded-lg bg-gray-50">Bài học này hiện chưa được cấu hình Đề kiểm tra. Hãy sang tab "Bài học" để soạn đề.</div>}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <CustomModal {...modalConfig} onCancel={closeAllModals} />
                    <CustomPrompt {...promptConfig} onCancel={closeAllModals} />
                    <MultiSelectModal {...multiSelectConfig} onCancel={closeAllModals} />
                    <AddResourceModal {...resourceModalConfig} onCancel={closeAllModals} />
                    <AssignQuizModal isOpen={assignQuizConfig.isOpen} grade={assignQuizConfig.grade} classes={assignQuizConfig.classes || []} quiz={assignQuizConfig.quiz} onCancel={closeAllModals} onConfirm={(selectedClasses) => {
                        const {c, i, qIdx} = assignQuizConfig.path;
                        const newTree = JSON.parse(JSON.stringify(lessonTree));
                        newTree[lessonGrade][c][i].quizzes[qIdx].assignedClasses = selectedClasses;
                        setLessonTree(newTree);
                        if (selectedLesson && selectedLesson.chapter === c && selectedLesson.lessonIndex === i) {
                            setSelectedLesson({...newTree[lessonGrade][c][i], chapter: c, lessonIndex: i});
                        }
                        closeAllModals(); showToast("Đã cập nhật danh sách lớp được giao đề!");
                    }} />
                    <QuizImportModal isOpen={quizImportConfig.isOpen} showToast={showToast} onCancel={()=>setQuizImportConfig({isOpen: false})} onConfirmImport={(parsedQuiz) => {
                        setQuizImportConfig({isOpen: false});
                        setQuizBuilderState({isOpen: true, data: parsedQuiz, path: quizImportConfig.path});
                    }}/>
                    <EditStudentModal {...editStudentConfig} onCancel={closeAllModals} onConfirm={(n,p)=>{
                        const newTree = {...classTree}; const cls = newTree[selectedGrade][selectedClass];
                        const idx = cls.findIndex(s => s.id === editStudentConfig.student.id);
                        if(idx > -1) { cls[idx].name = n; cls[idx].phone = p; setClassTree(newTree); showToast("Đã cập nhật!"); }
                        closeAllModals();
                    }}/>
                    <QuizBuilderOverlay isOpen={quizBuilderState.isOpen} initialData={quizBuilderState.data} onClose={()=>setQuizBuilderState({isOpen:false})} showToast={showToast} onSave={(data)=>{
                        const {c, i, qIdx} = quizBuilderState.path;
                        const newTree = JSON.parse(JSON.stringify(lessonTree)); 
                        
                        // Đảm bảo mảng quizzes tồn tại
                        if (!newTree[lessonGrade][c][i].quizzes) newTree[lessonGrade][c][i].quizzes = [];
                        
                        // Nếu là đề mới (qIdx === -1), tạo id mới và push vào mảng
                        if (qIdx === -1) {
                            data.id = generateId();
                            newTree[lessonGrade][c][i].quizzes.push(data);
                        } else {
                            // Cập nhật đề cũ
                            newTree[lessonGrade][c][i].quizzes[qIdx] = data;
                        }
                        
                        setLessonTree(newTree); 
                        // Cập nhật lại UI hiện tại
                        if (selectedLesson && selectedLesson.chapter === c && selectedLesson.lessonIndex === i) {
                            setSelectedLesson({...newTree[lessonGrade][c][i], chapter: c, lessonIndex: i});
                        }
                        showToast("Đã lưu đề!");
                    }} />
                </div>
            );
        };

        const StudentSetup = ({ phone, classTree, onComplete }) => {
            const [grade, setGrade] = useState('');
            const [cls, setCls] = useState('');
            const [studentId, setStudentId] = useState('');
            const [errorMsg, setErrorMsg] = useState('');

            const grades = Object.keys(classTree);
            const classes = grade ? Object.keys(classTree[grade]) : [];
            // Lọc danh sách học sinh: CHỈ lấy những học sinh có SĐT khớp với SĐT đang đăng nhập
            const students = (grade && cls) ? classTree[grade][cls].filter(s => s.phone === phone) : [];

            const handleSubmit = (e) => {
                e.preventDefault();
                if (!grade || !cls || !studentId) {
                    setErrorMsg("Vui lòng chọn đầy đủ thông tin Khối, Lớp và Tên!");
                    return;
                }
                const student = students.find(s => s.id === studentId);
                const sName = student ? student.name : "Học sinh";
                onComplete({ grade, cls, name: sName, studentId });
            };

            return (
                <div className="min-h-screen bg-green-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border-t-4 border-green-500">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"><i className="fas fa-user-check"></i></div>
                        <h2 className="text-2xl font-bold text-green-800 mb-2 text-center">Xác nhận thông tin</h2>
                        <p className="text-sm text-gray-500 text-center mb-6">Chọn đúng tên của bạn trong danh sách lớp để vào không gian học tập.</p>
                        
                        {errorMsg && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center">
                                <i className="fas fa-exclamation-circle mr-2"></i> {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">1. Khối học</label>
                                <select value={grade} onChange={e=>{setGrade(e.target.value); setCls(''); setStudentId(''); setErrorMsg('');}} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition" required>
                                    <option value="">-- Chọn Khối --</option>
                                    {grades.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">2. Lớp học</label>
                                <select value={cls} onChange={e=>{setCls(e.target.value); setStudentId(''); setErrorMsg('');}} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition" required disabled={!grade}>
                                    <option value="">-- Chọn Lớp --</option>
                                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700">3. Họ và Tên</label>
                                <select value={studentId} onChange={e=>{setStudentId(e.target.value); setErrorMsg('');}} className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition" required disabled={!cls}>
                                    <option value="">-- Chọn Tên của bạn --</option>
                                    {students.length > 0 ? (
                                        students.map(s => <option key={s.id} value={s.id}>{s.name} (SĐT: {s.phone})</option>)
                                    ) : (
                                        cls && <option value="" disabled>Không có học sinh nào khớp SĐT {phone} ở lớp này</option>
                                    )}
                                </select>
                            </div>
                            <button type="submit" className="w-full bg-green-600 text-white font-bold py-3.5 rounded-lg shadow-md hover:bg-green-700 transition mt-4 flex justify-center items-center">
                                <i className="fas fa-door-open mr-2"></i> Vào Không Gian Học Tập
                            </button>
                        </form>
                    </div>
                </div>
            );
        };

        const StudentQuizPlayer = ({ quiz, onClose, onComplete }) => {
            const [answers, setAnswers] = useState({ part1: {}, part2: {}, part3: {} });
            const answersRef = useRef(answers); // Bổ sung ref để theo dõi đáp án thực tế mới nhất
            const [timeLeft, setTimeLeft] = useState((quiz.timeLimit || 45) * 60);
            const [isSubmitted, setIsSubmitted] = useState(false);
        const [scoreResult, setScoreResult] = useState(null);
        const [activeTab, setActiveTab] = useState('part1');
        const [showConfirmModal, setShowConfirmModal] = useState({ isOpen: false, type: null }); // Thêm state quản lý hộp thoại

        // Cập nhật ref mỗi khi học sinh có thay đổi đáp án
        useEffect(() => {
            answersRef.current = answers;
        }, [answers]);

        useEffect(() => {
            if (isSubmitted) return;
            const timer = setInterval(() => {
                setTimeLeft(prev => Math.max(0, prev - 1));
            }, 1000);
            return () => clearInterval(timer);
        }, [isSubmitted]);

        useEffect(() => {
            // Tự động nộp bài khi thời gian bằng 0
            if (timeLeft === 0 && !isSubmitted) {
                handleSubmit();
            }
        }, [timeLeft, isSubmitted]);

        const formatTime = (secs) => {
                const m = Math.floor(secs / 60); const s = secs % 60;
                return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            };

            const handleSubmit = () => {
                let totalScore = 0;
                let maxPossibleScore = 0;
                const p1Score = quiz.part1Score || 0.25;
                const p2Scores = quiz.part2Scores || { s1: 0.1, s2: 0.25, s3: 0.5, s4: 1.0 };
                const p3Score = quiz.part3Score || 0.5;

                const currentAnswers = answersRef.current; // Sử dụng đáp án mới nhất

                // Chấm Phần 1
                (quiz.questions?.part1 || []).forEach((q) => {
                    maxPossibleScore += p1Score;
                    if (currentAnswers.part1[q.id] === q.correctOption) totalScore += p1Score;
                });

                // Chấm Phần 2
                (quiz.questions?.part2 || []).forEach((q) => {
                    maxPossibleScore += p2Scores.s4;
                    let correctCount = 0;
                    q.subQuestions.forEach((sq, sIdx) => {
                        if (currentAnswers.part2[q.id] && currentAnswers.part2[q.id][sIdx] === sq.isTrue) correctCount++;
                    });
                    if (correctCount === 1) totalScore += p2Scores.s1;
                    if (correctCount === 2) totalScore += p2Scores.s2;
                    if (correctCount === 3) totalScore += p2Scores.s3;
                    if (correctCount === 4) totalScore += p2Scores.s4;
                });

                // Chấm Phần 3 (Ép kiểu String an toàn 100%)
                (quiz.questions?.part3 || []).forEach((q) => {
                    maxPossibleScore += p3Score;
                    const studentAns = String(currentAnswers.part3[q.id] || "").trim().replace(',', '.');
                    const correctAns = String(q.shortAnswer || "").trim().replace(',', '.');
                if (studentAns !== "" && studentAns === correctAns) totalScore += p3Score;
            });

            setShowConfirmModal({ isOpen: false, type: null }); // Đóng hộp thoại nếu đang mở
            setScoreResult({ score: totalScore, max: maxPossibleScore });
            setIsSubmitted(true);
            
            // Báo cáo kết quả về màn hình chính để cập nhật thống kê
            if (onComplete) {
                onComplete({ quizId: quiz.id, score: totalScore, maxScore: maxPossibleScore });
            }
        };

        if (isSubmitted && scoreResult) {
                return (
                    <div className="fixed inset-0 bg-gray-100 z-[9999] flex items-center justify-center animate-fadeIn">
                        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-green-500">
                            <i className="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Hoàn thành bài thi!</h2>
                            <p className="text-gray-500 mb-6">Kết quả của bạn đã được ghi nhận vào hệ thống.</p>
                            <div className="bg-green-50 p-6 rounded-xl mb-6 border border-green-100">
                                <span className="block text-sm text-green-700 font-bold mb-1">ĐIỂM SỐ CỦA BẠN</span>
                                <span className="text-5xl font-black text-green-600">{scoreResult.score.toFixed(2)} <span className="text-2xl text-green-400">/ {scoreResult.max.toFixed(2)}</span></span>
                            </div>
                            <button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition shadow-md">
                                Về Không Gian Học Tập
                            </button>
                        </div>
                    </div>
                );
            }

            return (
                <div className="fixed inset-0 bg-gray-50 z-[9999] flex flex-col animate-fadeIn">
                    {/* Hộp thoại xác nhận tùy chỉnh thay thế cho window.confirm */}
                    {showConfirmModal.isOpen && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 z-[10000] flex items-center justify-center animate-fadeIn">
                            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 text-center">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Xác nhận</h3>
                                <p className="text-gray-600 mb-6">
                                    {showConfirmModal.type === 'submit' 
                                        ? 'Bạn có chắc chắn muốn nộp bài ngay bây giờ?' 
                                        : 'Thoát sẽ không lưu lại bài làm. Chắc chắn muốn thoát?'}
                                </p>
                                <div className="flex justify-center space-x-4">
                                    <button onClick={() => setShowConfirmModal({ isOpen: false, type: null })} className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold transition">Hủy</button>
                                    <button onClick={() => {
                                        if (showConfirmModal.type === 'submit') handleSubmit();
                                        if (showConfirmModal.type === 'exit') onClose();
                                    }} className={`px-6 py-2 text-white rounded-lg font-bold transition shadow-sm ${showConfirmModal.type === 'submit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                        Đồng ý
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="bg-white shadow-md p-4 flex justify-between items-center z-10 sticky top-0">
                        <div className="flex items-center space-x-4">
                            <button onClick={() => setShowConfirmModal({ isOpen: true, type: 'exit' })} className="text-gray-400 hover:text-red-500 transition"><i className="fas fa-times text-xl"></i></button>
                            <h2 className="font-bold text-lg text-gray-800 hidden md:block">{quiz.title}</h2>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className={`px-4 py-1.5 rounded-full font-bold flex items-center ${timeLeft < 300 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-green-100 text-green-700'}`}>
                                <i className="far fa-clock mr-2"></i> {formatTime(timeLeft)}
                            </div>
                            <button onClick={() => setShowConfirmModal({ isOpen: true, type: 'submit' })} className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-bold shadow transition flex items-center">
                                <i className="fas fa-paper-plane mr-2"></i> Nộp bài
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col md:flex-row max-w-7xl mx-auto w-full p-4 gap-4">
                        {/* Bảng điều hướng */}
                        <div className="w-full md:w-1/4 bg-white rounded-xl shadow-sm border p-4 flex flex-col h-auto md:h-full">
                            <div className="flex space-x-2 border-b pb-3 mb-3">
                                <button onClick={()=>setActiveTab('part1')} className={`flex-1 py-1.5 text-sm font-bold rounded ${activeTab==='part1'?'bg-green-600 text-white':'bg-gray-100 text-gray-600'}`}>P.1 ({quiz.questions?.part1?.length||0})</button>
                                <button onClick={()=>setActiveTab('part2')} className={`flex-1 py-1.5 text-sm font-bold rounded ${activeTab==='part2'?'bg-green-600 text-white':'bg-gray-100 text-gray-600'}`}>P.2 ({quiz.questions?.part2?.length||0})</button>
                                <button onClick={()=>setActiveTab('part3')} className={`flex-1 py-1.5 text-sm font-bold rounded ${activeTab==='part3'?'bg-green-600 text-white':'bg-gray-100 text-gray-600'}`}>P.3 ({quiz.questions?.part3?.length||0})</button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <div className="grid grid-cols-5 gap-2">
                                    {(quiz.questions?.[activeTab] || []).map((q, idx) => {
                                        let isAnswered = false;
                                        if (activeTab === 'part1') isAnswered = answers.part1[q.id] !== undefined;
                                        if (activeTab === 'part2') isAnswered = answers.part2[q.id] && answers.part2[q.id].filter(x=>x!==null).length === 4;
                                        if (activeTab === 'part3') isAnswered = (answers.part3[q.id]||"").trim() !== "";
                                        
                                        return (
                                            <a key={q.id} href={`#q-${activeTab}-${idx}`} className={`h-8 flex items-center justify-center rounded border text-sm font-bold transition hover:opacity-80 ${isAnswered ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-600 border-gray-300'}`}>
                                                {idx + 1}
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Vùng làm bài */}
                        <div className="w-full md:w-3/4 bg-white rounded-xl shadow-sm border p-4 md:p-6 overflow-y-auto h-full scroll-smooth">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
                                {activeTab === 'part1' && "Phần 1: Trắc nghiệm nhiều lựa chọn"}
                                {activeTab === 'part2' && "Phần 2: Trắc nghiệm Đúng/Sai"}
                                {activeTab === 'part3' && "Phần 3: Trả lời ngắn"}
                            </h3>
                            
                            {(quiz.questions?.[activeTab] || []).map((q, idx) => (
                                <div key={q.id} id={`q-${activeTab}-${idx}`} className="mb-8 p-5 bg-gray-50 rounded-xl border">
                                    <div className="font-bold text-lg mb-3 flex"><span className="mr-2 text-green-700">Câu {idx + 1}:</span> <div className="flex-1"><LatexPreview text={q.content} /></div></div>
                                    {q.imageUrl && <img src={q.imageUrl} alt={`Hình ảnh câu ${idx+1}`} className="max-w-full h-auto mb-4 rounded-lg shadow-sm border" />}
                                    
                                    {activeTab === 'part1' && (
                                        <div className="space-y-3 mt-4">
                                            {q.options.map((opt, oIdx) => (
                                                <label key={oIdx} className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${answers.part1[q.id] === oIdx ? 'bg-green-100 border-green-400 shadow-sm' : 'bg-white hover:bg-gray-100'}`}>
                                                    <input type="radio" name={`p1-${q.id}`} checked={answers.part1[q.id] === oIdx} onChange={() => setAnswers(prev => ({...prev, part1: {...prev.part1, [q.id]: oIdx}}))} className="w-5 h-5 text-green-600 mr-3" />
                                                    <span className="font-bold w-6 text-gray-600">{['A', 'B', 'C', 'D'][oIdx]}.</span>
                                                    <div className="flex-1"><LatexPreview text={opt} /></div>
                                                </label>
                                            ))}
                                        </div>
                                    )}

                                    {activeTab === 'part2' && (
                                        <div className="space-y-3 mt-4">
                                            {q.subQuestions.map((sq, sIdx) => {
                                                const currentVal = answers.part2[q.id] ? answers.part2[q.id][sIdx] : null;
                                                return (
                                                    <div key={sIdx} className="flex flex-col sm:flex-row sm:items-center p-3 bg-white rounded-lg border gap-3">
                                                        <span className="font-bold w-6 text-gray-600 hidden sm:block">{['a', 'b', 'c', 'd'][sIdx]}.</span>
                                                        <div className="flex-1 text-sm"><LatexPreview text={sq.text} /></div>
                                                        <div className="flex space-x-2 shrink-0">
                                                            <button onClick={() => setAnswers(prev => { const arr = prev.part2[q.id] ? [...prev.part2[q.id]] : [null,null,null,null]; arr[sIdx] = true; return {...prev, part2: {...prev.part2, [q.id]: arr}}; })} className={`px-4 py-1.5 rounded font-bold text-sm transition ${currentVal === true ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-green-100'}`}>ĐÚNG</button>
                                                            <button onClick={() => setAnswers(prev => { const arr = prev.part2[q.id] ? [...prev.part2[q.id]] : [null,null,null,null]; arr[sIdx] = false; return {...prev, part2: {...prev.part2, [q.id]: arr}}; })} className={`px-4 py-1.5 rounded font-bold text-sm transition ${currentVal === false ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-red-100'}`}>SAI</button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {activeTab === 'part3' && (
                                        <div className="mt-4">
                                            <input type="text" placeholder="Nhập số..." value={answers.part3[q.id] || ""} onChange={(e) => setAnswers(prev => ({...prev, part3: {...prev.part3, [q.id]: e.target.value}}))} className="w-full max-w-sm border-2 border-gray-300 p-3 rounded-lg font-bold focus:ring-2 focus:ring-green-500 focus:border-green-500 transition outline-none" />
                                            <p className="text-xs text-gray-500 mt-2 italic">* Chấp nhận cả định dạng dấu chấm (.) và phẩy (,)</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {(quiz.questions?.[activeTab] || []).length === 0 && <div className="text-center text-gray-400 py-10 italic">Phần này không có câu hỏi nào.</div>}
                        </div>
                    </div>
                </div>
            );
        };

        const StudentView = ({ user, classTree, lessonTree, onLogout }) => {
            const [activeChapter, setActiveChapter] = useState(null);
            const [activeLesson, setActiveLesson] = useState(null);
            const [activeQuiz, setActiveQuiz] = useState(null);
            const [quizResults, setQuizResults] = useState({}); // Lưu tạm kết quả làm bài trong phiên này để thống kê

            const grade = user.grade;
            const chapters = lessonTree[grade] || {};

            // --- Tính toán thống kê ---
            let totalAssigned = 0;
            Object.values(chapters).forEach(lessons => {
                lessons.forEach(lesson => {
                    (lesson.quizzes || []).forEach(q => {
                        if (q.assignedClasses?.includes(user.cls)) {
                            totalAssigned++;
                        }
                    });
                });
            });

            const attempted = Object.keys(quizResults).length;
            const pending = Math.max(0, totalAssigned - attempted);
            
            let avgScore10 = 0;
            if (attempted > 0) {
                let totalPercentage = 0;
                Object.values(quizResults).forEach(res => {
                    if(res.max > 0) totalPercentage += (res.score / res.max);
                });
                avgScore10 = (totalPercentage / attempted) * 10;
            }

            let rank = "Chưa xếp loại";
            if (attempted > 0) {
                if (avgScore10 >= 8) rank = "Giỏi";
                else if (avgScore10 >= 6.5) rank = "Khá";
                else if (avgScore10 >= 5) rank = "Trung bình";
                else rank = "Yếu";
            }

            const handleQuizComplete = (result) => {
                setQuizResults(prev => ({...prev, [result.quizId]: { score: result.score, max: result.maxScore }}));
            };
            // --- Kết thúc tính toán thống kê ---

            return (
                <div className="min-h-screen bg-gray-50 flex flex-col animate-fadeIn">
                    <div className="bg-green-700 text-white shadow-md z-10 relative">
                        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap justify-between items-center gap-2">
                            <h1 className="font-bold text-lg md:text-xl flex items-center"><i className="fas fa-graduation-cap mr-3 text-2xl"></i> Học vật lý cùng thầy Lê Công Huynh</h1>
                            <div className="flex items-center space-x-4">
                                <span className="font-medium text-sm md:text-base hidden sm:inline-block"><i className="fas fa-user-circle mr-1"></i> {user.name} ({user.cls})</span>
                                <button onClick={onLogout} className="bg-green-800 hover:bg-green-900 px-3 py-1.5 rounded-lg text-sm font-bold transition shadow"><i className="fas fa-sign-out-alt mr-1"></i> Đăng xuất</button>
                            </div>
                        </div>
                        
                        {/* Thanh thống kê học tập */}
                        <div className="bg-green-800/60 border-t border-green-600 px-4 py-2 text-sm text-green-100 flex flex-wrap gap-4 md:gap-8 justify-center md:justify-start shadow-inner">
                            <div className="flex items-center" title="Số lượng đề thi bạn đã hoàn thành"><i className="fas fa-check-square mr-2 opacity-70"></i> Đã làm: <span className="font-bold text-white ml-1">{attempted}</span><span className="opacity-70 text-xs ml-0.5">/{totalAssigned}</span></div>
                            <div className="flex items-center" title="Số lượng đề thi được giao nhưng chưa làm"><i className="fas fa-clock mr-2 opacity-70"></i> Chưa làm: <span className="font-bold text-white ml-1">{pending}</span></div>
                            <div className="flex items-center" title="Điểm trung bình quy đổi về hệ 10"><i className="fas fa-star mr-2 opacity-70"></i> Điểm TB: <span className="font-bold text-white ml-1">{attempted > 0 ? avgScore10.toFixed(1) : '-'}</span></div>
                            <div className="flex items-center"><i className="fas fa-award mr-2 opacity-70"></i> Xếp loại: <span className="font-bold text-yellow-300 ml-1">{rank}</span></div>
                        </div>
                    </div>
                    
                    <div className="bg-red-50 border-b border-red-100 text-red-600 marquee-container py-2.5 shadow-sm">
                        <div className="marquee-content text-sm md:text-base">
                            🔥 Chào mừng {user.name} đến với hệ thống học tập! Hãy nỗ lực hết mình để đạt điểm cao nhé! Chúc bạn có những giờ học Vật Lý thật thú vị và bổ ích! 🚀
                        </div>
                    </div>

                    <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col md:flex-row gap-6">
                        {/* Cột Danh sách bài học */}
                        <div className="w-full md:w-1/3 bg-white rounded-xl shadow-sm border p-4 h-fit">
                            <h3 className="font-bold text-lg mb-4 text-green-800 border-b pb-2"><i className="fas fa-list-ul mr-2"></i> Chương trình {grade}</h3>
                            <div className="space-y-3">
                                {Object.keys(chapters).map(chap => (
                                    <div key={chap} className="border rounded-lg overflow-hidden transition shadow-sm">
                                        <div onClick={()=>setActiveChapter(activeChapter===chap?null:chap)} className="bg-green-50 px-4 py-3 font-bold text-green-800 cursor-pointer flex justify-between items-center hover:bg-green-100 transition">
                                            <span className="flex-1 pr-2 truncate"><i className="fas fa-folder text-yellow-500 mr-2"></i> {chap}</span>
                                            <i className={`fas fa-chevron-${activeChapter===chap?'up':'down'} text-sm text-green-600`}></i>
                                        </div>
                                        {activeChapter === chap && (
                                            <div className="p-2 bg-white space-y-1">
                                                {chapters[chap].map(lesson => (
                                                    <div key={lesson.id} onClick={()=>setActiveLesson(lesson)} className={`px-4 py-2.5 text-sm rounded-lg cursor-pointer transition flex items-center ${activeLesson?.id === lesson.id ? 'bg-green-100 font-bold text-green-700' : 'hover:bg-gray-50 text-gray-700'}`}>
                                                        <i className="fas fa-file-alt mr-3 text-gray-400"></i> <span className="flex-1 truncate">{lesson.name}</span>
                                                    </div>
                                                ))}
                                                {chapters[chap].length === 0 && <div className="text-sm text-gray-400 italic p-3 text-center">Chưa có bài học nào</div>}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {Object.keys(chapters).length === 0 && <p className="text-gray-500 italic text-sm text-center py-4">Chưa có dữ liệu chương trình.</p>}
                            </div>
                        </div>

                        {/* Cột Nội dung bài học */}
                        <div className="w-full md:w-2/3 bg-white rounded-xl shadow-sm border p-5 md:p-8 flex flex-col">
                            {activeLesson ? (
                                <div className="animate-fadeIn space-y-8">
                                    <h2 className="text-2xl md:text-3xl font-bold text-green-800 border-b-2 border-green-100 pb-3">{activeLesson.name}</h2>
                                    
                                    <div className="bg-blue-50/30 rounded-xl border border-blue-100 p-5">
                                        <h4 className="font-bold text-blue-800 mb-4 text-lg flex items-center"><i className="fas fa-book-open mr-2 text-2xl"></i> 1. Tài liệu Lý thuyết</h4>
                                        <div className="grid gap-3">
                                            {(activeLesson.theoryLinks||[]).map(link => (
                                                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border border-blue-200 rounded-lg bg-white hover:shadow-md hover:border-blue-400 transition text-sm font-medium text-blue-900 group">
                                                    <div className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-3 group-hover:bg-blue-600 group-hover:text-white transition"><i className="fas fa-link"></i></div>
                                                    <span className="flex-1">{link.title}</span>
                                                    <i className="fas fa-external-link-alt text-gray-400 group-hover:text-blue-500"></i>
                                                </a>
                                            ))}
                                            {(!activeLesson.theoryLinks || activeLesson.theoryLinks.length === 0) && <p className="text-sm text-gray-500 italic bg-white p-3 rounded border border-dashed">Chưa có tài liệu lý thuyết.</p>}
                                        </div>
                                    </div>

                                    <div className="bg-orange-50/30 rounded-xl border border-orange-100 p-5">
                                        <h4 className="font-bold text-orange-800 mb-4 text-lg flex items-center"><i className="fas fa-flask mr-2 text-2xl"></i> 2. Thí nghiệm Mô phỏng</h4>
                                        <div className="grid gap-3">
                                            {(activeLesson.simLinks||[]).map(link => (
                                                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 border border-orange-200 rounded-lg bg-white hover:shadow-md hover:border-orange-400 transition text-sm font-medium text-orange-900 group">
                                                    <div className="bg-orange-100 text-orange-600 p-2 rounded-lg mr-3 group-hover:bg-orange-500 group-hover:text-white transition"><i className="fas fa-play"></i></div>
                                                    <span className="flex-1">{link.title}</span>
                                                    <i className="fas fa-external-link-alt text-gray-400 group-hover:text-orange-500"></i>
                                                </a>
                                            ))}
                                            {(!activeLesson.simLinks || activeLesson.simLinks.length === 0) && <p className="text-sm text-gray-500 italic bg-white p-3 rounded border border-dashed">Chưa có link thí nghiệm.</p>}
                                        </div>
                                    </div>

                                    <div className="bg-green-50/30 rounded-xl border border-green-100 p-5">
                                        <h4 className="font-bold text-green-800 mb-4 text-lg flex items-center"><i className="fas fa-tasks mr-2 text-2xl"></i> 3. Đề Ôn Tập & Kiểm Tra</h4>
                                        <div className="grid gap-4">
                                            {(activeLesson.quizzes||[]).filter(q => q.assignedClasses?.includes(user.cls)).map((quiz) => (
                                                <div key={quiz.id} className="p-4 border border-green-300 rounded-xl bg-white flex flex-col md:flex-row justify-between items-start md:items-center shadow-sm hover:shadow-md transition">
                                                    <div className="mb-3 md:mb-0">
                                                        <h5 className="font-bold text-lg text-gray-800">{quiz.title}</h5>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                                                            <span className="bg-gray-100 px-2 py-1 rounded font-medium"><i className="far fa-clock text-green-600 mr-1"></i> {quiz.timeLimit} phút</span>
                                                            <span className="bg-gray-100 px-2 py-1 rounded font-medium"><i className="fas fa-list-ol text-blue-600 mr-1"></i> {(quiz.questions?.part1?.length||0) + (quiz.questions?.part2?.length||0) + (quiz.questions?.part3?.length||0)} câu</span>
                                                        </div>
                                                    </div>
                                                    <button onClick={() => setActiveQuiz(quiz)} className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-bold transition shadow flex justify-center items-center">
                                                        <i className="fas fa-pen-nib mr-2"></i> Bắt đầu làm bài
                                                    </button>
                                                </div>
                                            ))}
                                            {(!activeLesson.quizzes || activeLesson.quizzes.filter(q => q.assignedClasses?.includes(user.cls)).length === 0) && <p className="text-sm text-gray-500 italic bg-white p-3 rounded border border-dashed">Chưa có đề nào được giao cho lớp của bạn lúc này.</p>}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 py-20">
                                    <div className="bg-gray-50 p-6 rounded-full mb-4 border border-gray-100 shadow-inner">
                                        <i className="fas fa-book-reader text-6xl text-green-200"></i>
                                    </div>
                                    <p className="text-lg font-medium text-gray-500">Chọn một bài học ở cột bên trái để bắt đầu học tập</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {activeQuiz && <StudentQuizPlayer quiz={activeQuiz} onClose={() => setActiveQuiz(null)} onComplete={handleQuizComplete} />}
                </div>
            );
        };

        const App = () => {
            const [user, setUser] = useState(null); // null, {role:'teacher'}, {role:'student', phone, grade, cls, name, isFirstTime}
            const [classTree, setClassTree] = useState(initialClassData);
            const [lessonTree, setLessonTree] = useState(initialLessonData);
            const [registeredStudents, setRegisteredStudents] = useState({}); // Lưu trữ tài khoản học sinh đã đăng ký hoặc đổi mật khẩu
            const [registeredTeachers, setRegisteredTeachers] = useState({"admin": "admin"}); // Lưu tài khoản giáo viên đã đăng ký
            
            const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
            const showToast = (msg, type="success") => { setToast({ show: true, msg, type }); setTimeout(() => setToast({ show: false, msg: "", type: "success" }), 3000); };

            const [forceChangePassUser, setForceChangePassUser] = useState(null);

            const handleLogin = (phone, pass, role) => {
                if (role === 'teacher') {
                    if ((phone === "admin" && pass === "admin") || pass === "00000000" || (registeredTeachers[phone] && registeredTeachers[phone] === pass)) {
                        setUser({ role: 'teacher' });
                    } else {
                        showToast("Sai thông tin đăng nhập Giáo viên!", "error");
                    }
                    return;
                }
                
                if (role === 'student') {
                    // 1. Kiểm tra tài khoản đã tự đăng ký hoặc đã đổi mật khẩu
                    if (registeredStudents[phone]) {
                        if (registeredStudents[phone] === pass) {
                            setUser({ role: 'student', phone: phone, isFirstTime: true });
                        } else {
                            showToast("Sai mật khẩu!", "error");
                        }
                        return;
                    }

                    // 2. Dự phòng: Kiểm tra xem GV đã thêm SĐT này vào lớp chưa (dùng pass mặc định 00000000)
                    let foundAny = false;
                    for (const grade in classTree) {
                        for (const cls in classTree[grade]) {
                            if(classTree[grade][cls].some(s => s.phone === phone)) foundAny = true;
                        }
                    }
                    
                    if(foundAny) {
                        if (pass === "00000000") {
                            setForceChangePassUser({ role: 'student', phone: phone, isFirstTime: true });
                        } else {
                            showToast("Sai mật khẩu! Nếu chưa đổi mật khẩu, hãy dùng 00000000", "error");
                        }
                    } else {
                        showToast("Tài khoản chưa tồn tại! Vui lòng Đăng ký hoặc báo GV thêm vào lớp.", "error");
                    }
                }
            };

            const handleRegister = (phone, pass, role) => {
                if (role === 'teacher') {
                    if (registeredTeachers[phone] || phone === "admin") {
                        showToast("Tên đăng nhập này đã tồn tại!", "error");
                        return;
                    }
                    setRegisteredTeachers(prev => ({...prev, [phone]: pass}));
                    showToast("Đăng ký thành công! Đang tự động đăng nhập...", "success");
                    setUser({ role: 'teacher' });
                    return;
                }
                if (role === 'student') {
                    if (registeredStudents[phone]) {
                        showToast("Số điện thoại này đã được đăng ký!", "error");
                        return;
                    }
                    setRegisteredStudents(prev => ({...prev, [phone]: pass}));
                    showToast("Đăng ký thành công! Đang tự động đăng nhập...", "success");
                    setUser({ role: 'student', phone: phone, isFirstTime: true });
                }
            };

            const handleStudentChangePass = (newPass) => {
                if (!newPass || newPass.trim() === "") return showToast("Mật khẩu không được để trống!", "error");
                setRegisteredStudents(prev => ({...prev, [forceChangePassUser.phone]: newPass})); // Lưu mật khẩu mới vào hệ thống
                setUser(forceChangePassUser);
                setForceChangePassUser(null);
                showToast("Đổi mật khẩu thành công!", "success");
            };

            const AuthScreen = () => {
                const [authModal, setAuthModal] = useState({ isOpen: false });
                
                // Teacher state
                const [tMode, setTMode] = useState('login');
                const [tPhone, setTPhone] = useState("");
                const [tPass, setTPass] = useState("");
                
                // Student state
                const [sMode, setSMode] = useState('login');
                const [sPhone, setSPhone] = useState("");
                const [sPass, setSPass] = useState("");
                
                const handleTeacherForgot = () => {
                    setAuthModal({
                        isOpen: true, title: "Khôi phục mật khẩu (Giáo viên)", message: "Mật khẩu của bạn đã được hệ thống đặt lại thành: 00000000",
                        confirmText: "Đóng", onConfirm: () => setAuthModal({isOpen: false}), onCancel: () => setAuthModal({isOpen: false})
                    });
                    setTPass("00000000");
                };

                const handleStudentForgot = () => {
                    if(!sPhone) return showToast("Vui lòng nhập số điện thoại của bạn trước!", "error");
                    setAuthModal({
                        isOpen: true, title: "Yêu cầu cấp lại mật khẩu", 
                        message: `Đã gửi yêu cầu cấp lại mật khẩu cho SĐT ${sPhone} đến Giáo viên. Vui lòng chờ phê duyệt...`,
                        confirmText: "Mô phỏng: GV Đồng ý", cancelText: "Hủy",
                        onConfirm: () => {
                            showToast("Giáo viên đã đồng ý. Mật khẩu mới của bạn là: 00000000", "success");
                            setSPass("00000000");
                            setAuthModal({isOpen: false});
                        },
                        onCancel: () => setAuthModal({isOpen: false})
                    });
                };

                return (
                    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex flex-col items-center justify-center p-4">
                        <div className="w-full max-w-5xl mb-8 text-center">
                            <div className="inline-block bg-white p-4 rounded-full shadow-lg mb-4"><i className="fas fa-graduation-cap text-4xl text-indigo-600"></i></div>
                            <h1 className="text-4xl font-bold text-indigo-900 mb-2">Hệ thống Quản lý Học tập</h1>
                            <p className="text-gray-600 font-medium">Đăng nhập hoặc Đăng ký để tiếp tục trải nghiệm hệ thống</p>
                        </div>
                        
                        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8">
                            {/* Cột Học Sinh */}
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn border-t-4 border-green-500">
                                <div className="bg-green-50 p-6 text-center border-b border-green-100">
                                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3"><i className="fas fa-user-graduate"></i></div>
                                    <h2 className="text-2xl font-bold text-green-800">Khu vực Học sinh</h2>
                                </div>
                                <div className="p-6">
                                    <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-lg">
                                        <button onClick={()=>setSMode('login')} className={`flex-1 py-2 rounded-md font-bold text-sm transition ${sMode==='login'?'bg-white shadow text-green-600':'text-gray-500 hover:text-green-500'}`}>Đăng nhập</button>
                                        <button onClick={()=>setSMode('register')} className={`flex-1 py-2 rounded-md font-bold text-sm transition ${sMode==='register'?'bg-white shadow text-green-600':'text-gray-500 hover:text-green-500'}`}>Đăng ký</button>
                                    </div>
                                    <form onSubmit={(e)=>{
                                        e.preventDefault(); 
                                        if(sMode==='login') {
                                            handleLogin(sPhone, sPass, 'student'); 
                                        } else {
                                            handleRegister(sPhone, sPass, 'student');
                                        }
                                    }} className="space-y-4">
                                        <div><label className="block text-sm font-medium mb-1 text-gray-700">Số điện thoại</label><input type="text" value={sPhone} onChange={e=>setSPhone(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none transition" required placeholder="Nhập SĐT của bạn" /></div>
                                        {sMode === 'register' && <div><label className="block text-sm font-medium mb-1 text-gray-700">Họ và Tên</label><input type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none transition" required placeholder="Nhập họ và tên" /></div>}
                                        <div><label className="block text-sm font-medium mb-1 text-gray-700">Mật khẩu</label><input type="password" value={sPass} onChange={e=>setSPass(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 outline-none transition" required placeholder="Nhập mật khẩu" /></div>
                                        {sMode === 'login' && <div className="text-right"><button type="button" onClick={handleStudentForgot} className="text-sm text-green-600 font-medium hover:underline">Quên mật khẩu?</button></div>}
                                        <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-lg shadow hover:bg-green-700 transition">{sMode === 'login' ? 'Đăng nhập Học sinh' : 'Đăng ký Tài khoản'}</button>
                                    </form>
                                </div>
                            </div>

                            {/* Cột Giáo Viên */}
                            <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fadeIn border-t-4 border-indigo-500">
                                <div className="bg-indigo-50 p-6 text-center border-b border-indigo-100">
                                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-3"><i className="fas fa-chalkboard-teacher"></i></div>
                                    <h2 className="text-2xl font-bold text-indigo-800">Khu vực Giáo viên</h2>
                                </div>
                                <div className="p-6">
                                    <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-lg">
                                        <button onClick={()=>setTMode('login')} className={`flex-1 py-2 rounded-md font-bold text-sm transition ${tMode==='login'?'bg-white shadow text-indigo-600':'text-gray-500 hover:text-indigo-500'}`}>Đăng nhập</button>
                                        <button onClick={()=>setTMode('register')} className={`flex-1 py-2 rounded-md font-bold text-sm transition ${tMode==='register'?'bg-white shadow text-indigo-600':'text-gray-500 hover:text-indigo-500'}`}>Đăng ký</button>
                                    </div>
                                    <form onSubmit={(e)=>{
                                        e.preventDefault(); 
                                        if(tMode==='login') {
                                            handleLogin(tPhone, tPass, 'teacher'); 
                                        } else {
                                            handleRegister(tPhone, tPass, 'teacher');
                                        }
                                    }} className="space-y-4">
                                        <div><label className="block text-sm font-medium mb-1 text-gray-700">Tên đăng nhập / SĐT</label><input type="text" value={tPhone} onChange={e=>setTPhone(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition" required placeholder="admin" /></div>
                                        {tMode === 'register' && <div><label className="block text-sm font-medium mb-1 text-gray-700">Họ và Tên</label><input type="text" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition" required placeholder="Nhập họ và tên" /></div>}
                                        <div><label className="block text-sm font-medium mb-1 text-gray-700">Mật khẩu</label><input type="password" value={tPass} onChange={e=>setTPass(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition" required placeholder="admin" /></div>
                                        {tMode === 'login' && <div className="text-right"><button type="button" onClick={handleTeacherForgot} className="text-sm text-indigo-600 font-medium hover:underline">Quên mật khẩu?</button></div>}
                                        <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg shadow hover:bg-indigo-700 transition">{tMode === 'login' ? 'Đăng nhập Giáo viên' : 'Đăng ký Tài khoản'}</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <CustomModal {...authModal} />
                    </div>
                );
            };

            return (
                <div>
                    {!user && !forceChangePassUser ? <AuthScreen /> : 
                     forceChangePassUser ? <CustomPrompt isOpen={true} title="Vui lòng đổi mật khẩu mới để bảo mật" placeholder="Nhập mật khẩu mới của bạn..." initialValue="" onConfirm={handleStudentChangePass} onCancel={()=>setForceChangePassUser(null)} /> :
                     user.role === 'teacher' ? <TeacherManage classTree={classTree} setClassTree={setClassTree} lessonTree={lessonTree} setLessonTree={setLessonTree} onLogout={()=>setUser(null)} showToast={showToast} /> :
                     user.isFirstTime ? <StudentSetup phone={user.phone} classTree={classTree} onComplete={(details) => setUser({...user, ...details, isFirstTime: false})} /> :
                     <StudentView user={user} classTree={classTree} lessonTree={lessonTree} onLogout={()=>setUser(null)} />
                    }
                    
                    {toast.show && (
                        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg font-bold flex items-center animate-fadeIn z-[10000] text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                            <i className={`fas ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2 text-xl`}></i>
                            {toast.msg}
                        </div>
                    )}
                </div>
            );
        };

        ReactDOM.render(<App />, document.getElementById('root'));
    </script>
</body>
</html>
