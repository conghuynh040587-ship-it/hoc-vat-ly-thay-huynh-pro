/**
 * ==========================================
 * NỀN TẢNG QUẢN LÝ VÀ HỌC TẬP MÔN VẬT LÍ
 * Giảng viên: Thầy Lê Công Huynh
 * ==========================================
 */
import React, { useState, useEffect } from 'react';
import { User, Lock, Phone, Mail, GraduationCap, ShieldCheck, LogOut, BookOpen, ChevronRight, ChevronDown, FileText, Video, FileQuestion, Clock, School, Users, UserCheck, AlertCircle, CheckCircle, Database, Plus, Trash2, Edit, FileSpreadsheet, ArrowLeft, Save, Image as ImageIcon, Link as LinkIcon, Sliders, Eye, BarChart2, Filter, Calendar, Award } from 'lucide-react';
import * as XLSX from 'xlsx';
import { firestoreDb } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

// ==========================================
// HÀM HỖ TRỢ: XỬ LÝ CÔNG THỨC MATHTYPE / LATEX (KaTeX)
// ==========================================
const renderMathContent = (text) => {
  if (!text) return '';
  try {
    let processed = String(text).replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
      try { 
        if (window.katex) {
          return window.katex.renderToString(formula, { displayMode: true, throwOnError: false }); 
        }
      } catch (e) {}
      return match;
    });
    processed = processed.replace(/\$([\s\S]*?)\$/g, (match, formula) => {
      try { 
        if (window.katex) {
          return window.katex.renderToString(formula, { displayMode: false, throwOnError: false }); 
        }
      } catch (e) {}
      return match;
    });
    return <span dangerouslySetInnerHTML={{ __html: processed }} />;
  } catch (err) {
    return text;
  }
};

/**
 * ==========================================
 * MODULE: XÁC THỰC NGƯỜI DÙNG (Auth.jsx)
 * ==========================================
 */
function Auth({ onLoginSuccess }) {
  const [role, setRole] = useState('student');
  const [mode, setMode] = useState('login'); 
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (role === 'student') {
        onLoginSuccess({
            role: 'student',
            name: formData.name || 'Học sinh Demo',
            phone: formData.phone || '0901234567'
        });
    } else {
        onLoginSuccess({
            role: 'teacher',
            name: 'Thầy Lê Công Huynh',
            phone: formData.phone || '0900000000'
        });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 p-4 font-sans">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-3 backdrop-blur-sm border border-white/20 shadow-inner">
            <GraduationCap size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider">
            Học Vật Lý
          </h1>
          <p className="text-sm font-medium text-blue-100 mt-1">Cùng Thầy Lê Công Huynh</p>
        </div>

        <div className="flex text-sm font-bold border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => { setRole('student'); setMode('login'); }}
            className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all ${
              role === 'student' ? 'text-blue-600 border-b-2 border-blue-600 bg-white shadow-xs' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <GraduationCap size={18} /> Học Sinh
          </button>
          <button
            onClick={() => setRole('teacher')}
            className={`flex-1 py-4 flex items-center justify-center gap-2 transition-all ${
              role === 'teacher' ? 'text-slate-900 border-b-2 border-slate-900 bg-white shadow-xs' : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <ShieldCheck size={18} /> Quản Trị Viên
          </button>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {role === 'student' && mode === 'register' && (
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="text"
                  name="name"
                  placeholder="Họ và tên của em"
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800 transition-all text-sm"
                />
              </div>
            )}

            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                required
                type="tel"
                name="phone"
                placeholder={role === 'teacher' ? "Số điện thoại quản trị" : "Số điện thoại"}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800 transition-all text-sm"
              />
            </div>

            {role === 'student' && mode === 'register' && (
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email (Không bắt buộc)"
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800 transition-all text-sm"
                />
              </div>
            )}

            {mode !== 'forgot' && (
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="password"
                  name="password"
                  placeholder="Mật khẩu"
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800 transition-all text-sm"
                />
              </div>
            )}

            {role === 'student' && mode === 'register' && (
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="password"
                  name="confirmPassword"
                  placeholder="Xác nhận lại mật khẩu"
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-800 transition-all text-sm"
                />
              </div>
            )}

            <button
              type="submit"
              className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-[0.98] text-sm tracking-wide ${
                role === 'teacher' ? 'bg-slate-900 hover:bg-black shadow-slate-900/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
              }`}
            >
              {role === 'teacher' 
                ? 'Vào Trang Quản Trị' 
                : (mode === 'login' ? 'Đăng Nhập Hệ Thống' : mode === 'register' ? 'Đăng Ký Tài Khoản' : 'Gửi Yêu Cầu Khôi Phục')}
            </button>
          </form>

          {role === 'student' && (
            <div className="mt-6 flex flex-col items-center gap-2.5 text-xs font-semibold text-gray-500">
              {mode === 'login' ? (
                <>
                  <button onClick={() => setMode('register')} className="hover:text-blue-600 transition-colors">
                    Chưa có tài khoản? <span className="text-blue-600 font-bold underline">Đăng ký ngay</span>
                  </button>
                  <button onClick={() => setMode('forgot')} className="hover:text-blue-600 transition-colors">
                    Quên mật khẩu? (Báo cho thầy)
                  </button>
                </>
              ) : (
                <button onClick={() => setMode('login')} className="hover:text-blue-600 transition-colors">
                  Đã có tài khoản? <span className="text-blue-600 font-bold underline">Quay lại đăng nhập</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ==========================================
 * MODULE: XÁC THỰC HỒ SƠ HỌC SINH (StudentLinkProfile.jsx)
 * ==========================================
 */
function StudentLinkProfile({ currentUser, db, onConfirmLink, onLogout }) {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [error, setError] = useState('');

  const availableClasses = db.classes?.filter(c => c.gradeId === selectedGrade) || [];
  const availableStudents = db.studentsList?.filter(s => s.classId === selectedClass) || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!selectedStudent) {
      setError('Vui lòng chọn tên của em trong danh sách lớp.');
      return;
    }

    const studentRecord = db.studentsList.find(s => s.id === selectedStudent);
    if (studentRecord.phone && studentRecord.phone !== currentUser.phone) {
      setError(`Lỗi bảo mật: Tên này được đăng ký bằng một số điện thoại khác. Vui lòng chọn đúng tên của mình!`);
      return;
    }

    onConfirmLink({ studentId: studentRecord.id, classId: studentRecord.classId });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200/80">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-center text-white relative">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center mb-3 backdrop-blur-sm border border-white/20">
            <UserCheck size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-black uppercase tracking-wider">Xác Thực Lớp Học</h2>
          <p className="text-blue-100 text-xs mt-1.5 leading-relaxed font-medium">
            Em cần xác nhận đúng thông tin của mình trong danh sách lớp do giáo viên cung cấp.
          </p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl flex items-start gap-3 shadow-inner">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-500" />
              <span className="font-bold leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                <School size={15} className="text-blue-500" /> 1. Chọn Khối Lớp
              </label>
              <select 
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold text-sm transition-all"
                value={selectedGrade}
                onChange={(e) => {
                  setSelectedGrade(e.target.value);
                  setSelectedClass('');  
                  setSelectedStudent(''); 
                  setError('');
                }}
              >
                <option value="">-- Bấm để chọn khối --</option>
                {db.grades?.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                <Users size={15} className="text-blue-500" /> 2. Chọn Tên Lớp
              </label>
              <select 
                disabled={!selectedGrade}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold text-sm transition-all disabled:opacity-40 disabled:bg-slate-100"
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedStudent(''); 
                  setError('');
                }}
              >
                <option value="">-- Bấm để chọn lớp --</option>
                {availableClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-2">
                <UserCheck size={15} className="text-blue-500" /> 3. Chọn Tên Của Em
              </label>
              <select 
                disabled={!selectedClass}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 font-bold text-sm transition-all disabled:opacity-40 disabled:bg-slate-100"
                value={selectedStudent}
                onChange={(e) => {
                  setSelectedStudent(e.target.value);
                  setError('');
                }}
              >
                <option value="">-- Tìm và chọn tên em --</option>
                {availableStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.phone ? `(SĐT: ***${s.phone.slice(-3)})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={!selectedStudent}
              className="w-full py-4 mt-4 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Vào Lớp Học Ngay
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-100 pt-5">
            <button 
              onClick={onLogout}
              className="text-xs font-bold text-slate-400 hover:text-red-600 flex items-center justify-center gap-2 w-full transition-colors"
            >
              <LogOut size={15} /> Nhầm tài khoản? Thoát ra đăng nhập lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ==========================================
 * MODULE: DASHBOARD HỌC SINH (StudentDashboard.jsx)
 * ==========================================
 */
function StudentDashboard({ currentUser, db, onLogout, onStartQuiz }) {
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [activeTab, setActiveTab] = useState('theory');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({});

  const toggleChapter = (chapId) => {
    setExpandedChapters(prev => ({ ...prev, [chapId]: !prev[chapId] }));
  };

  const currentStudent = db.studentsList?.find(s => s.id === currentUser?.linkedStudentId);
  const studentClassId = currentUser?.classId || currentStudent?.classId;
  
  const studentClass = db.classes?.find(c => c.id === studentClassId);
  const studentGradeId = studentClass?.gradeId;

  const filteredChapters = (db.chapters || []).filter(chap => {
    if (!studentGradeId) return true;
    return chap.gradeId === studentGradeId;
  });

  const availableMaterials = (db.materials || []).filter(mat => {
    if (mat.lessonId !== selectedLesson) return false;
    if (mat.type === 'theory' || mat.type === 'video') return true;
    if (mat.type === 'quiz') {
      if (mat.assignedClassIds && mat.assignedClassIds.length > 0) {
        return mat.assignedClassIds.includes(studentClassId);
      }
      return true;
    }
    return false;
  });

  const studentAttempts = db.quizAttempts?.filter(a => a.studentId === currentUser?.linkedStudentId) || [];
  const totalDone = studentAttempts.length;
  const avgScore = totalDone > 0 
    ? (studentAttempts.reduce((sum, a) => sum + parseFloat(a.score || 0), 0) / totalDone).toFixed(2) 
    : 0;

  let rankName = 'Chưa có dữ liệu';
  let rankColor = 'bg-slate-100 text-slate-700 border-slate-200';
  
  if (totalDone > 0) {
    if (avgScore >= 8.5) { 
      rankName = '🌟 Giỏi (Rất xuất sắc)'; 
      rankColor = 'bg-emerald-50 text-emerald-800 border-emerald-200'; 
    } else if (avgScore >= 6.5) { 
      rankName = '👍 Khá (Nắm chắc kiến thức)'; 
      rankColor = 'bg-blue-50 text-blue-800 border-blue-200'; 
    } else if (avgScore >= 5.0) { 
      rankName = '✍️ Đạt (Cần luyện bài tập thêm)'; 
      rankColor = 'bg-amber-50 text-amber-800 border-amber-200'; 
    } else { 
      rankName = '🎯 Cần cố gắng nhiều hơn'; 
      rankColor = 'bg-rose-50 text-rose-800 border-rose-200'; 
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <header className="bg-indigo-900 text-white px-6 py-4 shadow-md flex justify-between items-center z-20 relative border-b border-indigo-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-800 rounded-xl flex items-center justify-center border border-indigo-700 shadow-inner">
            <BookOpen size={20} className="text-indigo-200" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wider">Học Vật Lý Cùng Thầy Huynh</h1>
            <p className="text-xs text-indigo-300 font-medium">Nền tảng học tập & rèn luyện tư duy chuyên sâu</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">{currentUser?.name}</p>
            <p className="text-xs text-indigo-300 font-medium">Lớp: {currentStudent ? db.classes?.find(c => c.id === currentStudent.classId)?.name : ''}</p>
          </div>
          <button 
            onClick={onLogout} 
            className="bg-indigo-800/80 hover:bg-red-600 px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all border border-indigo-700 shadow-xs"
          >
            <LogOut size={15}/> Thoát
          </button>
        </div>
      </header>

      <div className="md:hidden bg-white p-3 border-b flex justify-between items-center shadow-xs">
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)} 
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md"
        >
          <BookOpen size={18} /> {showMobileMenu ? 'Ẩn mục lục bài học' : 'Mở danh sách bài học'}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className={`
          ${showMobileMenu ? 'absolute inset-0 z-30 bg-white w-full' : 'hidden'} 
          md:flex md:w-1/3 lg:w-1/4 bg-white border-r border-slate-200 flex-col overflow-y-auto shadow-sm
        `}>
          <div className="p-4 bg-slate-50 border-b flex justify-between items-center md:hidden">
            <h3 className="font-black text-slate-800 text-sm">MỤC LỤC BÀI HỌC</h3>
            <button onClick={() => setShowMobileMenu(false)} className="text-red-600 font-black text-xs bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">Đóng [x]</button>
          </div>
          
          <div className="p-4 space-y-3">
            <h3 className="font-black text-xs text-slate-400 uppercase tracking-wider mb-2 hidden md:block px-1">Chương Trình Học</h3>
            {filteredChapters.map(chap => {
              const lessons = db.lessons?.filter(l => l.chapterId === chap.id) || [];
              const isOpen = expandedChapters[chap.id];
              return (
                <div key={chap.id} className="border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden transition-all bg-white">
                  <button 
                    onClick={() => toggleChapter(chap.id)} 
                    className="w-full text-left p-3.5 flex justify-between items-center bg-slate-50/80 hover:bg-slate-100 font-bold text-slate-800 transition-colors"
                  >
                    <span className="text-xs sm:text-sm">{chap.name}</span>
                    {isOpen ? <ChevronDown size={16} className="text-blue-600 shrink-0"/> : <ChevronRight size={16} className="text-slate-400 shrink-0"/>}
                  </button>
                  {isOpen && (
                    <div className="p-2 space-y-1 bg-white border-t border-slate-100">
                      {lessons.map(les => (
                        <button 
                          key={les.id} 
                          onClick={() => {
                            setSelectedLesson(les.id); 
                            setShowMobileMenu(false);  
                          }}
                          className={`w-full text-left p-3 rounded-xl text-xs sm:text-sm transition-all font-medium ${
                            selectedLesson === les.id 
                              ? 'bg-blue-50 text-blue-700 font-bold border-l-4 border-blue-600 shadow-2xs' 
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                          }`}
                        >
                          {les.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 bg-slate-100 p-4 sm:p-8 overflow-y-auto">
          {!selectedLesson ? (
            <div className="max-w-2xl mx-auto space-y-6 mt-2 sm:mt-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl text-center relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                <h2 className="text-2xl sm:text-3xl font-black mb-2">Chào em, {currentUser?.name}! 👋</h2>
                <p className="text-blue-100 text-sm font-medium">Hãy chọn một bài học ở danh sách bên trái để bắt đầu ôn luyện kiến thức nhé.</p>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/80 space-y-6">
                <h3 className="font-black text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                  <BarChart2 size={20} className="text-blue-600"/> Tiến Trình Rèn Luyện Cá Nhân
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-center shadow-inner">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Số bài đã làm</p>
                    <p className="text-3xl sm:text-4xl font-black text-blue-600">{totalDone}</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-center shadow-inner">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Điểm trung bình</p>
                    <p className="text-3xl sm:text-4xl font-black text-indigo-600">{avgScore}</p>
                  </div>
                </div>
                <div className={`p-4 rounded-2xl border font-bold text-center text-sm shadow-xs ${rankColor}`}>
                  {rankName}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
              <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest block mb-1">Bài học hiện tại</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800">
                  {db.lessons?.find(l => l.id === selectedLesson)?.name}
                </h2>
              </div>
              
              <div className="flex border-b border-slate-200 overflow-x-auto bg-white px-6">
                <button 
                  onClick={() => setActiveTab('theory')} 
                  className={`py-4 px-6 text-sm font-black flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${activeTab === 'theory' ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
                >
                  <FileText size={18}/> Tài Liệu Lý Thuyết
                </button>
                <button 
                  onClick={() => setActiveTab('video')} 
                  className={`py-4 px-6 text-sm font-black flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${activeTab === 'video' ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
                >
                  <Video size={18}/> Video Thí Nghiệm
                </button>
                <button 
                  onClick={() => setActiveTab('quiz')} 
                  className={`py-4 px-6 text-sm font-black flex items-center gap-2 border-b-2 whitespace-nowrap transition-all ${activeTab === 'quiz' ? 'border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl' : 'border-transparent text-slate-400 hover:text-slate-700'}`}
                >
                  <FileQuestion size={18}/> Đề Kiểm Tra & Luyện Tập
                </button>
              </div>

              <div className="p-6 sm:p-8">
                {availableMaterials.filter(m => m.type === activeTab).length === 0 ? (
                  <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold text-sm">Chưa có học liệu cho phần này.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {availableMaterials.filter(m => m.type === activeTab).map(mat => (
                      <div key={mat.id} className="p-6 border border-slate-200/80 rounded-2xl hover:shadow-md transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h4 className="font-black text-slate-800 text-base sm:text-lg mb-1">{mat.name}</h4>
                          {mat.type === 'quiz' && mat.quizConfig && (
                            <p className="text-xs text-slate-500 flex items-center gap-2 font-bold mt-1">
                              <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg border border-blue-100">
                                <Clock size={14}/> Thời gian: {mat.quizConfig.time} phút
                              </span> 
                              <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
                                🔄 Làm tối đa: {mat.quizConfig.attempts} lần
                              </span>
                            </p>
                          )}
                        </div>

                        {mat.type === 'theory' || mat.type === 'video' ? (
                           <a 
                             href={mat.link || '#'} 
                             target="_blank" 
                             rel="noreferrer" 
                             className="px-6 py-3 bg-blue-50 text-blue-700 font-black rounded-xl hover:bg-blue-100 text-xs sm:text-sm text-center border border-blue-200 transition-all shadow-2xs"
                           >
                             Mở Xem Chi Tiết
                           </a>
                        ) : (
                           <button 
                             onClick={() => onStartQuiz(mat)} 
                             className="px-8 py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 text-xs sm:text-sm shadow-md shadow-emerald-600/25 transition-transform active:scale-95"
                           >
                             Bắt Đầu Làm Bài
                           </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ==========================================
 * MODULE: GIAO DIỆN LÀM BÀI VÀ XEM LẠI (QuizPlayer.jsx)
 * ==========================================
 */
function QuizPlayer({ quiz, currentUser, onFinish, onSaveResult }) {
  const [timeLeft, setTimeLeft] = useState((quiz.quizConfig?.time || 45) * 60); 
  const [answers, setAnswers] = useState({}); 
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    if (isFinished) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          submitQuiz(true); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFinished]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAnswerChange = (questionId, value) => {
    if (isReviewing) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleTFChange = (questionId, statementIndex, value) => {
    if (isReviewing) return;
    setAnswers(prev => {
      const currentQ = prev[questionId] || {};
      return { ...prev, [questionId]: { ...currentQ, [statementIndex]: value } };
    });
  };

  const submitQuiz = (isAuto = false) => {
    const questions = quiz.questions || [];
    if (questions.length === 0) {
      setFinalScore(0);
      setIsFinished(true);
      return;
    }

    const scoresConfig = quiz.quizConfig?.sectionScores || { multiScore: 4.0, tfScore: 3.0, numScore: 3.0 };
    
    const multiQuestions = questions.filter(q => q.type === 'multi' || !q.type);
    const tfQuestions = questions.filter(q => q.type === 'truefalse');
    const numQuestions = questions.filter(q => q.type === 'number');

    const pointPerMulti = multiQuestions.length > 0 ? scoresConfig.multiScore / multiQuestions.length : 0;
    const pointPerNum = numQuestions.length > 0 ? scoresConfig.numScore / numQuestions.length : 0;
    const pointPerTfQuestion = tfQuestions.length > 0 ? scoresConfig.tfScore / tfQuestions.length : 0;

    let totalEarnedScore = 0;

    questions.forEach(q => {
      const qType = q.type || 'multi';

      if (qType === 'multi') {
        if (answers[q.id] === q.answerMCQ) {
          totalEarnedScore += pointPerMulti;
        }
      } 
      else if (qType === 'truefalse') {
        const studentAns = answers[q.id] || {};
        let correctCount = 0;
        (q.tfStatements || []).forEach((stmt, idx) => {
          if (studentAns[idx] === stmt.isTrue) {
            correctCount++;
          }
        });

        let ratio = 0;
        if (correctCount === 1) ratio = 0.10;
        else if (correctCount === 2) ratio = 0.25;
        else if (correctCount === 3) ratio = 0.50;
        else if (correctCount === 4) ratio = 1.00;

        totalEarnedScore += (pointPerTfQuestion * ratio);
      } 
      else if (qType === 'number') {
        const rawAns = String(answers[q.id] || '').trim().toLowerCase();
        const dotAns = String(q.answerNumDot || '').trim().toLowerCase();
        const commaAns = String(q.answerNumComma || '').trim().toLowerCase();

        if (rawAns && (rawAns === dotAns || rawAns === commaAns)) {
          totalEarnedScore += pointPerNum;
        }
      }
    });

    const calculatedScore = Math.min(10, Math.max(0, totalEarnedScore)).toFixed(2);
    setFinalScore(calculatedScore);

    const totalTimeAllowed = (quiz.quizConfig?.time || 45) * 60;
    const secondsSpent = totalTimeAllowed - timeLeft;
    const minutesDone = Math.floor(secondsSpent / 60);
    const secondsDone = secondsSpent % 60;
    const durationText = minutesDone > 0 ? `${minutesDone} phút ${secondsDone} giây` : `${secondsDone} giây`;

    if (onSaveResult) {
      onSaveResult({
        quizId: quiz.id,
        score: calculatedScore,
        duration: durationText
      });
    }

    setShowConfirmModal(false);
    setIsFinished(true); 
  };

  if (isFinished && !isReviewing) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-200/80 space-y-6">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 mb-1">Nộp Bài Thành Công!</h2>
            <p className="text-slate-500 text-xs font-medium">Kết quả đã được ghi nhận vào hệ thống lớp học.</p>
          </div>
          
          <div className="bg-emerald-50/60 p-6 rounded-2xl border border-emerald-200/60 shadow-inner">
             <p className="text-5xl sm:text-6xl font-black text-emerald-700 mb-1">{finalScore}</p>
             <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Điểm Số Tổng Kết</p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => setIsReviewing(true)} 
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 text-sm"
            >
              <Eye size={18}/> Xem Lại Chi Tiết Bài Làm
            </button>

            {quiz.quizConfig?.answerLink && (
              <a 
                href={quiz.quizConfig.answerLink} 
                target="_blank" 
                rel="noreferrer" 
                className="block text-center bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-3.5 rounded-xl font-bold transition-colors text-xs sm:text-sm border border-slate-200"
              >
                Mở Tài Liệu / Video Giải Chi Tiết
              </a>
            )}
            
            <button 
              onClick={onFinish} 
              className="w-full py-3 text-slate-400 hover:text-slate-700 font-bold text-xs sm:text-sm transition-colors"
            >
              Quay Lại Danh Sách Bài Học
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {isReviewing && (
            <button onClick={() => setIsReviewing(false)} className="text-slate-600 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <ArrowLeft size={20}/>
            </button>
          )}
          <div>
            <h1 className="text-sm font-black text-slate-800 line-clamp-1">{quiz.name} {isReviewing && <span className="text-blue-600 font-black">(CHẾ ĐỘ XEM LẠI)</span>}</h1>
            <span className="text-xs text-slate-400 font-bold">Học sinh: {currentUser?.name}</span>
          </div>
        </div>

        {!isReviewing ? (
          <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-0 pt-3 sm:pt-0">
            <div className={`flex items-center gap-2 font-bold text-xs sm:text-sm px-4 py-2 rounded-xl border shadow-2xs ${timeLeft <= 300 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
              <Clock size={16}/>
              <span>Thời gian còn lại: <strong>{formatTime(timeLeft)}</strong></span>
            </div>
            <button onClick={() => setShowConfirmModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-transform active:scale-95">
              Nộp Bài Ngay
            </button>
          </div>
        ) : (
          <div className="bg-blue-50 px-5 py-2 rounded-xl border border-blue-200 text-blue-800 font-black text-xs sm:text-sm shadow-2xs">
            Điểm Đạt Được: {finalScore} điểm
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
         <div className="max-w-3xl mx-auto space-y-6">
            {!quiz.questions || quiz.questions.length === 0 ? (
               <div className="bg-white p-12 rounded-3xl shadow-sm text-center border border-slate-200">
                  <p className="text-slate-400 font-bold text-sm">Đề thi chưa có câu hỏi nào.</p>
               </div>
            ) : (
               quiz.questions.map((q, index) => {
                  const qType = q.type || 'multi';

                  return (
                     <div key={q.id} className="p-6 sm:p-8 bg-white rounded-3xl shadow-sm border border-slate-200/80 space-y-5">
                        <div className="flex gap-3 border-b border-slate-100 pb-4">
                           <span className="w-8 h-8 bg-blue-50 text-blue-700 rounded-xl font-black text-xs flex items-center justify-center shrink-0 border border-blue-100">
                             {index + 1}
                           </span>
                           <div className="font-bold text-slate-800 text-base leading-relaxed pt-1">{renderMathContent(q.content)}</div>
                        </div>
                        
                        {q.imageLink && (
                           <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-3">
                               <img src={q.imageLink} alt={`Minh họa câu ${index+1}`} className="w-full object-contain max-h-96 rounded-xl" />
                           </div>
                        )}

                        {qType === 'multi' && (
                           <div className="space-y-3 pt-2">
                              {['A', 'B', 'C', 'D'].map((opt, optIdx) => {
                                 const optionText = q.options && q.options[optIdx] ? q.options[optIdx] : `Đáp án ${opt}`;
                                 const isSelected = answers[q.id] === opt;
                                 const isCorrect = isReviewing && q.answerMCQ === opt;
                                 const isWrongSelected = isReviewing && isSelected && !isCorrect;

                                 let badgeStyle = "bg-slate-50/80 border-slate-200/80 hover:bg-slate-100 text-slate-700";
                                 if (isReviewing) {
                                   if (isCorrect) badgeStyle = "bg-emerald-50 border-emerald-300 text-emerald-900 ring-1 ring-emerald-300";
                                   else if (isWrongSelected) badgeStyle = "bg-rose-50 border-rose-300 text-rose-900 ring-1 ring-rose-300";
                                 } else if (isSelected) {
                                   badgeStyle = "bg-blue-50 border-blue-300 text-blue-900 ring-1 ring-blue-300 shadow-2xs";
                                 }

                                 return (
                                    <label key={opt} className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${badgeStyle}`}>
                                       <input 
                                          type="radio" 
                                          name={`ans_${q.id}`} 
                                          checked={isSelected} 
                                          disabled={isReviewing}
                                          onChange={() => handleAnswerChange(q.id, opt)}
                                          className="mt-1 w-4 h-4 text-blue-600 shrink-0"
                                       />
                                       <div className="flex-1 flex gap-2.5 leading-relaxed font-semibold text-sm">
                                          <span className="font-black opacity-80">{opt}.</span>
                                          <span>{renderMathContent(optionText)}</span>
                                       </div>
                                       {isReviewing && isCorrect && <span className="text-xs font-black text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">Đúng</span>}
                                       {isReviewing && isWrongSelected && <span className="text-xs font-black text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">Sai</span>}
                                    </label>
                                 );
                              })}
                           </div>
                        )}

                        {qType === 'truefalse' && (
                           <div className="space-y-3 pt-2">
                              <p className="text-xs text-slate-400 font-black uppercase tracking-wider mb-3">Các phát biểu Đúng / Sai:</p>
                              {(q.tfStatements || []).map((stmt, sIdx) => {
                                 const studentVal = answers[q.id]?.[sIdx];
                                 const correctVal = stmt.isTrue;

                                 return (
                                    <div key={sIdx} className="p-4 border border-slate-200/80 rounded-2xl bg-slate-50/60 flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                                       <div className="font-semibold text-slate-800 text-sm flex-1 flex gap-2.5">
                                          <span className="font-black text-slate-900 shrink-0">{['a', 'b', 'c', 'd'][sIdx]}.</span> 
                                          {renderMathContent(stmt.text)}
                                       </div>
                                       <div className="flex gap-2.5 shrink-0 items-center">
                                          <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border font-black text-xs transition-all ${studentVal === true ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-white text-slate-600 border-slate-200'}`}>
                                             <input type="radio" disabled={isReviewing} className="hidden" checked={studentVal === true} onChange={() => handleTFChange(q.id, sIdx, true)} />
                                             Đúng
                                          </label>
                                          <label className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-xl border font-black text-xs transition-all ${studentVal === false ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-white text-slate-600 border-slate-200'}`}>
                                             <input type="radio" disabled={isReviewing} className="hidden" checked={studentVal === false} onChange={() => handleTFChange(q.id, sIdx, false)} />
                                             Sai
                                          </label>
                                          {isReviewing && (
                                             <span className={`text-xs font-black px-3 py-1.5 rounded-xl ${studentVal === correctVal ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                                                Đáp án: {correctVal ? 'Đúng' : 'Sai'}
                                             </span>
                                          )}
                                       </div>
                                    </div>
                                 );
                              })}
                           </div>
                        )}

                        {qType === 'number' && (
                           <div className="space-y-3 pt-2">
                              <input 
                                 type="text" 
                                 disabled={isReviewing}
                                 placeholder="Nhập câu trả lời của em (VD: 15.5)..." 
                                 className="w-full p-4 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50 text-sm shadow-inner" 
                                 value={answers[q.id] || ''} 
                                 onChange={(e) => handleAnswerChange(q.id, e.target.value)} 
                              />
                              {isReviewing && (
                                 <p className="text-xs font-bold text-blue-900 bg-blue-50 p-4 rounded-2xl border border-blue-200 shadow-2xs">
                                    Đáp án chuẩn của giáo viên: <span className="text-blue-700 font-black text-sm ml-1">{q.answerNumDot || q.answerNumComma || '-'}</span>
                                 </p>
                              )}
                           </div>
                        )}
                     </div>
                  );
               })
            )}
         </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl space-y-5 border border-slate-100">
            <div className="w-16 h-16 bg-amber-50 rounded-2xl mx-auto flex items-center justify-center border border-amber-100">
              <AlertCircle size={32} className="text-amber-500" />
            </div>
            <div>
              <h3 className="font-black text-xl text-slate-800 mb-1">Xác Nhận Nộp Bài</h3>
              <p className="text-slate-500 text-xs font-medium">Hệ thống sẽ tiến hành chấm điểm tự động. Em có chắc chắn muốn nộp không?</p>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowConfirmModal(false)} className="px-4 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 w-full text-xs sm:text-sm transition-colors">Tiếp Tục Làm</button>
              <button onClick={() => submitQuiz(false)} className="px-4 py-3.5 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 w-full text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all">Nộp Ngay</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ==========================================
 * MODULE: SOẠN CÂU HỎI & CẤU HÌNH ĐIỂM (QuizEditor.jsx)
 * ==========================================
 */
function QuizEditor({ db, setDb, quizId, onClose, showToast }) {
  const quiz = db.materials?.find(m => m.id === quizId) || { name: 'Đề kiểm tra', questions: [], quizConfig: {} };
  
  const [questions, setQuestions] = useState(quiz.questions || []);
  const [answerLink, setAnswerLink] = useState(quiz.quizConfig?.answerLink || '');

  const [sectionScores, setSectionScores] = useState(quiz.quizConfig?.sectionScores || {
    multiScore: 4.0, 
    tfScore: 3.0,     
    numScore: 3.0     
  });

  const addQuestion = (type) => {
    const newQ = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: type, 
      content: '',       
      imageLink: '',     
      options: ['', '', '', ''],
      answerMCQ: 'A',
      tfStatements: [
        { text: '', isTrue: true },
        { text: '', isTrue: false },
        { text: '', isTrue: true },
        { text: '', isTrue: false },
      ],
      answerNumDot: '',    
      answerNumComma: '',  
      answerShort: ''
    };
    setQuestions([...questions, newQ]);
  };

  const updateQuestionField = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOptionText = (qIndex, optIndex, value) => {
    const updated = [...questions];
    if (!updated[qIndex].options) updated[qIndex].options = ['', '', '', ''];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const updateTfStatement = (qIndex, stmtIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex].tfStatements[stmtIndex][field] = value;
    setQuestions(updated);
  };

  const removeQuestion = (index) => {
    if (window.confirm('Thầy có chắc chắn muốn xóa câu hỏi này không?')) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleSaveAll = () => {
    const updatedMaterials = db.materials.map(m => {
      if (m.id === quizId) {
        return {
          ...m,
          questions: questions,
          quizConfig: { 
            ...m.quizConfig, 
            answerLink,
            sectionScores 
          }
        };
      }
      return m;
    });

    setDb({ ...db, materials: updatedMaterials });
    showToast('Đã lưu cấu hình điểm và đề thi thành công!');
    onClose();
  };

  const countMulti = questions.filter(q => q.type === 'multi' || !q.type).length;
  const countTf = questions.filter(q => q.type === 'truefalse').length;
  const countNum = questions.filter(q => q.type === 'number').length;

  return (
    <div className="h-full flex flex-col bg-slate-100 font-sans">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center shadow-xs sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20}/>
          </button>
          <div>
            <h2 className="text-sm font-black text-slate-900">Biên Tập & Cấu Hình: {quiz.name}</h2>
            <p className="text-xs text-slate-400 font-bold">Tổng số câu hỏi: <strong className="text-blue-600">{questions.length} câu</strong></p>
          </div>
        </div>
        <button 
          onClick={handleSaveAll} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md shadow-blue-600/20 flex items-center gap-2 transition-transform active:scale-95"
        >
          <Save size={16}/> Lưu Thay Đổi
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-blue-100 shadow-sm space-y-5 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/40">
          <h3 className="font-black text-xs sm:text-sm text-blue-900 flex items-center gap-2 uppercase tracking-wider">
            <Sliders size={18} className="text-blue-600"/> Cấu hình phân bổ điểm số đề thi (Thang 10)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <label className="block text-xs font-black text-slate-700">Phần 1: Nhiều lựa chọn</label>
              <p className="text-xs text-slate-400 font-semibold">Số câu: {countMulti} | Mỗi câu: {countMulti > 0 ? (sectionScores.multiScore / countMulti).toFixed(2) : 0} đ</p>
              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="number" step="0.25" min="0" max="10"
                  value={sectionScores.multiScore}
                  onChange={(e) => setSectionScores({ ...sectionScores, multiScore: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-black text-blue-700 bg-slate-50 outline-none"
                />
                <span className="text-xs font-black text-slate-400">điểm</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <label className="block text-xs font-black text-slate-700">Phần 2: Đúng / Sai</label>
              <p className="text-xs text-slate-400 font-semibold">Số câu: {countTf} (Chấm theo % ý)</p>
              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="number" step="0.25" min="0" max="10"
                  value={sectionScores.tfScore}
                  onChange={(e) => setSectionScores({ ...sectionScores, tfScore: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-black text-indigo-700 bg-slate-50 outline-none"
                />
                <span className="text-xs font-black text-slate-400">điểm</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <label className="block text-xs font-black text-slate-700">Phần 3: Điền số</label>
              <p className="text-xs text-slate-400 font-semibold">Số câu: {countNum} | Mỗi câu: {countNum > 0 ? (sectionScores.numScore / countNum).toFixed(2) : 0} đ</p>
              <div className="flex items-center gap-2 pt-1">
                <input 
                  type="number" step="0.25" min="0" max="10"
                  value={sectionScores.numScore}
                  onChange={(e) => setSectionScores({ ...sectionScores, numScore: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-black text-amber-700 bg-slate-50 outline-none"
                />
                <span className="text-xs font-black text-slate-400">điểm</span>
              </div>
            </div>
          </div>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200 p-8 shadow-sm">
            <FileQuestion size={48} className="mx-auto text-slate-300 mb-3"/>
            <p className="text-slate-700 font-black text-base mb-1">Chưa có câu hỏi nào trong đề này.</p>
            <p className="text-xs text-slate-400 font-medium">Bấm vào các nút thêm câu hỏi bên dưới để bắt đầu soạn đề.</p>
          </div>
        ) : (
          questions.map((q, qIndex) => (
            <div key={q.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8 relative space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <span className="font-black text-blue-900 text-base">Câu {qIndex + 1}</span>
                <div className="flex items-center gap-3">
                  <select 
                    value={q.type} 
                    onChange={(e) => updateQuestionField(qIndex, 'type', e.target.value)}
                    className="text-xs font-black bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                  >
                    <option value="multi">Phần 1: Trắc nghiệm nhiều lựa chọn</option>
                    <option value="truefalse">Phần 2: Trắc nghiệm Đúng / Sai</option>
                    <option value="number">Phần 3: Điền số (Trả lời ngắn)</option>
                  </select>
                  <button onClick={() => removeQuestion(qIndex)} className="text-rose-500 hover:text-rose-700 p-2 rounded-xl hover:bg-rose-50 transition-colors" title="Xóa câu hỏi">
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Nội dung câu hỏi</label>
                <textarea 
                  rows={3}
                  value={q.content}
                  onChange={(e) => updateQuestionField(qIndex, 'content', e.target.value)}
                  placeholder="Nhập nội dung câu hỏi vật lý (Hỗ trợ LaTeX $...$)..."
                  className="w-full p-4 rounded-2xl bg-slate-50 text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm leading-relaxed font-semibold shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
                  <ImageIcon size={14} className="text-blue-500"/> Link hình ảnh minh họa (Tùy chọn)
                </label>
                <input 
                  type="url"
                  value={q.imageLink || ''}
                  onChange={(e) => updateQuestionField(qIndex, 'imageLink', e.target.value)}
                  placeholder="https://..."
                  className="w-full p-3.5 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold"
                />
              </div>

              <div className="pt-4 border-t border-dashed border-slate-200">
                {q.type === 'multi' && (
                  <div className="space-y-3">
                    <span className="block text-xs font-black text-blue-900 uppercase tracking-wider mb-2">Các phương án trả lời (Chọn 1 đáp án đúng)</span>
                    {['A', 'B', 'C', 'D'].map((opt, optIdx) => (
                      <div key={opt} className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row gap-3 items-start sm:items-center transition-colors ${q.answerMCQ === opt ? 'bg-blue-50/70 border-blue-300 shadow-2xs' : 'bg-slate-50/80 border-slate-200'}`}>
                        <span className="font-black text-blue-700 w-6 text-sm">{opt}.</span>
                        <textarea 
                          rows={2}
                          value={q.options ? q.options[optIdx] : ''}
                          onChange={(e) => updateOptionText(qIndex, optIdx, e.target.value)}
                          placeholder={`Nhập nội dung phương án ${opt}...`}
                          className="flex-1 w-full p-3 rounded-xl bg-white text-slate-900 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs font-semibold shadow-inner"
                        />
                        <label className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-black cursor-pointer shrink-0 transition-all ${q.answerMCQ === opt ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'}`}>
                          <input type="radio" name={`mcq-${q.id}`} checked={q.answerMCQ === opt} onChange={() => updateQuestionField(qIndex, 'answerMCQ', opt)} className="hidden" />
                          {q.answerMCQ === opt ? '✓ Đáp án đúng' : 'Chọn là đúng'}
                        </label>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'truefalse' && (
                  <div className="space-y-3">
                    <span className="block text-xs font-black text-indigo-900 uppercase tracking-wider mb-2">Phát biểu Đúng / Sai (4 ý a, b, c, d)</span>
                    {q.tfStatements?.map((stmt, sIdx) => (
                      <div key={sIdx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                        <span className="font-black text-indigo-700 w-6 text-sm">{['a', 'b', 'c', 'd'][sIdx]}.</span>
                        <textarea 
                          rows={2}
                          value={stmt.text}
                          onChange={(e) => updateTfStatement(qIndex, sIdx, 'text', e.target.value)}
                          placeholder={`Nhập nội dung ý ${['a', 'b', 'c', 'd'][sIdx]}...`}
                          className="flex-1 w-full p-3 rounded-xl bg-white text-slate-900 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-semibold shadow-inner"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          <label className={`px-4 py-2 rounded-xl border text-xs font-black cursor-pointer transition-all ${stmt.isTrue ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200'}`}>
                            <input type="radio" name={`tf-${q.id}-${sIdx}`} checked={stmt.isTrue} onChange={() => updateTfStatement(qIndex, sIdx, 'isTrue', true)} className="hidden" />
                            Đúng
                          </label>
                          <label className={`px-4 py-2 rounded-xl border text-xs font-black cursor-pointer transition-all {!stmt.isTrue ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-white text-slate-700 border-slate-200'}`}>
                            <input type="radio" name={`tf-${q.id}-${sIdx}`} checked={!stmt.isTrue} onChange={() => updateTfStatement(qIndex, sIdx, 'isTrue', false)} className="hidden" />
                            Sai
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'number' && (
                  <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-3">
                    <span className="block text-xs font-black text-amber-900 uppercase tracking-wider">Đáp án điền số (Hỗ trợ cả 2 dạng dấu thập phân)</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1 font-bold">Dạng dùng dấu chấm (.)</label>
                        <input type="text" value={q.answerNumDot || ''} onChange={(e) => updateQuestionField(qIndex, 'answerNumDot', e.target.value)} placeholder="VD: 15.5" className="w-full p-3 rounded-xl bg-white text-slate-900 border border-slate-200 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 shadow-inner" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1 font-bold">Dạng dùng dấu phẩy (,)</label>
                        <input type="text" value={q.answerNumComma || ''} onChange={(e) => updateQuestionField(qIndex, 'answerNumComma', e.target.value)} placeholder="VD: 15,5" className="w-full p-3 rounded-xl bg-white text-slate-900 border border-slate-200 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 shadow-inner" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm text-center space-y-4">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Thêm Câu Hỏi Mới Vào Đề Thi</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => addQuestion('multi')} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-xs font-black shadow-md shadow-blue-600/20 transition-transform active:scale-95">+ Trắc Nghiệm Nhiều Lựa Chọn</button>
            <button onClick={() => addQuestion('truefalse')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl text-xs font-black shadow-md shadow-indigo-600/20 transition-transform active:scale-95">+ Trắc Nghiệm Đúng / Sai</button>
            <button onClick={() => addQuestion('number')} className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-3 rounded-xl text-xs font-black shadow-md shadow-amber-600/20 transition-transform active:scale-95">+ Câu Hỏi Điền Số</button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-2 bg-blue-50/30">
          <label className="block text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-2">
            <LinkIcon size={14} className="text-blue-600"/> Đường Dẫn Xem Bài Giải Chi Tiết / Video Chữa (Sau Khi Học Sinh Nộp Bài)
          </label>
          <input 
            type="url" 
            value={answerLink} 
            onChange={(e) => setAnswerLink(e.target.value)} 
            placeholder="Dán link Google Drive hoặc YouTube vào đây..." 
            className="w-full p-3.5 rounded-xl bg-white text-slate-900 border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold shadow-inner"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * ==========================================
 * MODULE: QUẢN LÝ LỚP & HỌC SINH (ClassManagement.jsx)
 * ==========================================
 */
function ClassManagement({ db, setDb, showToast }) {
  const [selectedClass, setSelectedClass] = useState(null);
  const [showAddClass, setShowAddClass] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showManualAddStudent, setShowManualAddStudent] = useState(false);
  
  const [newClass, setNewClass] = useState({ gradeId: '', name: '' });
  const [editingClass, setEditingClass] = useState(null); 
  const [editingStudent, setEditingStudent] = useState(null); 
  
  const [manualStudent, setManualStudent] = useState({
    name: '',
    gender: 'Nam',
    phone: '',
    email: ''
  });

  const handleAddClass = (e) => {
    e.preventDefault();
    if (!newClass.gradeId || !newClass.name) return;
    const createdClass = { id: `c${Date.now()}`, gradeId: newClass.gradeId, name: newClass.name.trim() };
    setDb({ ...db, classes: [...db.classes, createdClass] });
    setShowAddClass(false);
    setNewClass({ gradeId: '', name: '' });
    showToast('Thêm lớp học thành công!');
  };

  const handleUpdateClass = (e) => {
    e.preventDefault();
    if (!editingClass || !editingClass.name.trim()) return;
    const updatedClasses = db.classes.map(c => c.id === editingClass.id ? { ...c, name: editingClass.name.trim() } : c);
    setDb({ ...db, classes: updatedClasses });
    setEditingClass(null);
    showToast('Cập nhật tên lớp thành công!');
  };

  const handleUpdateStudent = (e) => {
    e.preventDefault();
    if (!editingStudent || !editingStudent.name.trim()) return;
    const updatedStudents = db.studentsList.map(s => s.id === editingStudent.id ? editingStudent : s);
    setDb({ ...db, studentsList: updatedStudents });
    setEditingStudent(null);
    showToast('Cập nhật thông tin học sinh thành công!');
  };

  const handleManualAddStudent = (e) => {
    e.preventDefault();
    if (!selectedClass || !manualStudent.name.trim()) return;
    
    const newStu = {
      id: `sl_man_${Date.now()}`,
      classId: selectedClass,
      name: manualStudent.name.trim(),
      gender: manualStudent.gender,
      phone: manualStudent.phone.trim(),
      email: manualStudent.email.trim(),
      done: 0,
      total: 0
    };

    setDb({
      ...db,
      studentsList: [...db.studentsList, newStu]
    });

    setShowManualAddStudent(false);
    setManualStudent({ name: '', gender: 'Nam', phone: '', email: '' });
    showToast('Thêm học sinh thủ công thành công!');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!selectedClass) {
      showToast('Vui lòng chọn lớp ở cột trái trước khi import!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          showToast('File Excel không chứa dữ liệu!', 'error');
          return;
        }

        const newStudentsParsed = data.map((row, idx) => ({
          id: `sl_excel_${Date.now()}_${idx}`,
          classId: selectedClass,
          name: row['Họ và tên'] || row['Ho va ten'] || 'Học sinh',
          gender: row['Giới tính'] || row['Gioi tinh'] || 'Nam',
          phone: String(row['Số điện thoại'] || row['So dien thoai'] || '').trim(),
          email: row['Email'] || '',
          done: 0,
          total: 0
        }));

        setDb({
          ...db, 
          studentsList: [...db.studentsList, ...newStudentsParsed]
        });
        
        setShowAddStudent(false);
        showToast(`Đã import thành công ${newStudentsParsed.length} học sinh vào lớp!`);
      } catch (err) {
        showToast('Lỗi đọc file Excel. Vui lòng kiểm tra lại cấu trúc cột!', 'error');
      }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
    const templateData = [
      { "Họ và tên": "Nguyễn Văn A", "Giới tính": "Nam", "Số điện thoại": "0901234567", "Email": "a@gmail.com" },
      { "Họ và tên": "Trần Thị B", "Giới tính": "Nữ", "Số điện thoại": "0907654321", "Email": "b@gmail.com" }
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "DanhSachHocSinh");
    XLSX.writeFile(wb, "Mau_Danh_Sach_Hoc_Sinh.xlsx");
  };

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-100">
      <div className="w-full md:w-1/3 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-slate-200 space-y-2 bg-slate-50/50">
          <button 
            onClick={() => setShowAddClass(true)} 
            className="w-full py-3 bg-white hover:bg-slate-50 rounded-xl flex justify-center items-center gap-2 text-xs font-black border border-slate-200 shadow-2xs transition-all text-slate-700"
          >
            <Plus size={16}/> Thêm Lớp Học Mới
          </button>
          <button 
            onClick={() => {
              if (!selectedClass) showToast('Vui lòng chọn lớp trước!', 'error');
              else setShowAddStudent(true);
            }} 
            className="w-full py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl flex justify-center items-center gap-2 text-xs font-black shadow-md shadow-blue-600/20 transition-all"
          >
            <Users size={16}/> Import Danh Sách (Excel/CSV)
          </button>
          <button 
            onClick={() => {
              if (!selectedClass) showToast('Vui lòng chọn lớp trước!', 'error');
              else setShowManualAddStudent(true);
            }} 
            className="w-full py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl flex justify-center items-center gap-2 text-xs font-black shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus size={16}/> Thêm Học Sinh Thủ Công
          </button>
        </div>

        <div className="p-4 space-y-4">
          {db.grades?.map(grade => (
            <div key={grade.id}>
              <h3 className="font-black text-slate-400 bg-slate-100 px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider mb-2">{grade.name}</h3>
              <div className="space-y-1.5">
                {db.classes?.filter(c => c.gradeId === grade.id).map(cls => (
                  <div 
                    key={cls.id} 
                    className={`flex justify-between items-center p-3.5 rounded-2xl cursor-pointer transition-all ${
                      selectedClass === cls.id ? 'bg-blue-50 text-blue-900 font-black border border-blue-200 shadow-2xs' : 'hover:bg-slate-50 text-slate-700 font-bold border border-transparent'
                    }`} 
                    onClick={() => setSelectedClass(cls.id)}
                  >
                    <span className="text-sm">{cls.name}</span>
                    <div className="flex gap-2 items-center text-slate-400">
                      <Edit 
                        size={16} 
                        className="hover:text-blue-600 transition-colors" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditingClass({ id: cls.id, name: cls.name });
                        }}
                        title="Sửa tên lớp"
                      />
                      <Trash2 
                        size={16} 
                        className="hover:text-rose-600 transition-colors" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          if (window.confirm(`Xóa lớp ${cls.name}?`)) {
                            setDb({ ...db, classes: db.classes.filter(c => c.id !== cls.id) }); 
                            showToast('Đã xóa lớp học'); 
                          }
                        }}
                        title="Xóa lớp"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full md:w-2/3 bg-slate-100 p-4 sm:p-8 overflow-y-auto">
        {!selectedClass ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm">
            <Users size={48} className="text-slate-300 mb-3"/>
            <p className="font-black text-slate-700 text-base mb-1">Chưa Chọn Lớp Học</p>
            <p className="text-xs text-slate-400 font-medium">Hãy chọn một lớp học ở cột bên trái để quản lý danh sách học sinh.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <span className="font-black text-slate-800 text-base">Danh Sách Lớp: {db.classes?.find(c => c.id === selectedClass)?.name}</span>
              <span className="text-xs font-black bg-blue-100 text-blue-800 px-3.5 py-1.5 rounded-xl border border-blue-200">
                Sĩ số: {db.studentsList?.filter(s => s.classId === selectedClass).length} học sinh
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
                <thead className="bg-slate-50 text-slate-400 uppercase font-black text-[11px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-center">STT</th>
                    <th className="p-4">Họ và tên</th>
                    <th className="p-4">Giới tính</th>
                    <th className="p-4">Số điện thoại</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 text-center">Tiến độ bài tập</th>
                    <th className="p-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {db.studentsList?.filter(s => s.classId === selectedClass).length === 0 ? (
                    <tr><td colSpan={7} className="p-12 text-center text-slate-400 font-medium italic">Lớp này chưa có học sinh nào. Hãy bấm "Thêm học sinh thủ công" hoặc "Import".</td></tr>
                  ) : (
                    db.studentsList?.filter(s => s.classId === selectedClass).map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 text-center text-slate-400 font-black">{idx + 1}</td>
                        <td className="p-4 font-black text-slate-900">{s.name}</td>
                        <td className="p-4 text-slate-500">{s.gender}</td>
                        <td className="p-4 text-slate-600">{s.phone}</td>
                        <td className="p-4 text-slate-500">{s.email || '-'}</td>
                        <td className="p-4 text-center">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-black border border-emerald-200">
                            {s.done || 0} bài hoàn thành
                          </span>
                        </td>
                        <td className="p-4 text-center flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setEditingStudent({ ...s })}
                            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                            title="Sửa thông tin học sinh"
                          >
                            <Edit size={16}/>
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm(`Xóa học sinh ${s.name}?`)) {
                                setDb({ ...db, studentsList: db.studentsList.filter(stu => stu.id !== s.id) });
                                showToast('Đã xóa học sinh khỏi danh sách');
                              }
                            }}
                            className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors"
                            title="Xóa học sinh"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showAddClass && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl space-y-5 border border-slate-100">
            <h3 className="font-black text-xl text-slate-800">Thêm Lớp Học Mới</h3>
            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Chọn Khối</label>
                <select 
                  required 
                  className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" 
                  value={newClass.gradeId} 
                  onChange={e => setNewClass({ ...newClass, gradeId: e.target.value })}
                >
                  <option value="">-- Chọn khối --</option>
                  {db.grades?.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Tên Lớp</label>
                <input 
                  required 
                  type="text" 
                  placeholder="VD: 12A1" 
                  className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" 
                  value={newClass.name} 
                  onChange={e => setNewClass({ ...newClass, name: e.target.value })} 
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowAddClass(false)} className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs sm:text-sm w-full">Hủy</button>
                <button type="submit" className="px-4 py-3 bg-blue-600 text-white font-black rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/20 w-full">Lưu Lại</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingClass && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl space-y-5 border border-slate-100">
            <h3 className="font-black text-xl text-slate-800">Chỉnh Sửa Tên Lớp</h3>
            <form onSubmit={handleUpdateClass} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Tên Lớp Mới</label>
                <input 
                  required 
                  type="text" 
                  className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" 
                  value={editingClass.name} 
                  onChange={e => setEditingClass({ ...editingClass, name: e.target.value })} 
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setEditingClass(null)} className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs sm:text-sm w-full">Hủy</button>
                <button type="submit" className="px-4 py-3 bg-blue-600 text-white font-black rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/20 w-full">Cập Nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-5 border border-slate-100">
            <h3 className="font-black text-xl text-slate-800">Chỉnh Sửa Thông Tin Học Sinh</h3>
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Họ và Tên</label>
                <input 
                  required 
                  type="text" 
                  className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" 
                  value={editingStudent.name} 
                  onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Giới Tính</label>
                <select 
                  className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" 
                  value={editingStudent.gender} 
                  onChange={e => setEditingStudent({ ...editingStudent, gender: e.target.value })}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Số Điện Thoại</label>
                <input 
                  type="text" 
                  className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" 
                  value={editingStudent.phone} 
                  onChange={e => setEditingStudent({ ...editingStudent, phone: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" 
                  value={editingStudent.email} 
                  onChange={e => setEditingStudent({ ...editingStudent, email: e.target.value })} 
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setEditingStudent(null)} className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs sm:text-sm w-full">Hủy</button>
                <button type="submit" className="px-4 py-3 bg-blue-600 text-white font-black rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/20 w-full">Cập Nhật</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showManualAddStudent && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-5 border border-slate-100">
            <h3 className="font-black text-xl text-slate-800">Thêm Học Sinh Thủ Công</h3>
            <form onSubmit={handleManualAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Họ và Tên</label>
                <input 
                  required 
                  type="text" 
                  placeholder="VD: Nguyễn Văn A" 
                  className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" 
                  value={manualStudent.name} 
                  onChange={e => setManualStudent({ ...manualStudent, name: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Giới Tính</label>
                <select 
                  className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" 
                  value={manualStudent.gender} 
                  onChange={e => setManualStudent({ ...manualStudent, gender: e.target.value })}
                >
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Số Điện Thoại</label>
                <input 
                  type="tel" 
                  placeholder="VD: 0901234567" 
                  className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" 
                  value={manualStudent.phone} 
                  onChange={e => setManualStudent({ ...manualStudent, phone: e.target.value })} 
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Email</label>
                <input 
                  type="email" 
                  placeholder="VD: email@gmail.com" 
                  className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" 
                  value={manualStudent.email} 
                  onChange={e => setManualStudent({ ...manualStudent, email: e.target.value })} 
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowManualAddStudent(false)} className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs sm:text-sm w-full">Hủy</button>
                <button type="submit" className="px-4 py-3 bg-emerald-600 text-white font-black rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 w-full">Thêm Học Sinh</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddStudent && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl space-y-5 border border-slate-100">
            <h3 className="font-black text-xl text-slate-800">Import Danh Sách Học Sinh</h3>
            <p className="text-xs text-slate-500 font-medium">Thêm học sinh cho lớp đang chọn bằng tệp Excel.</p>
            
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 text-xs space-y-2.5">
              <p className="font-black text-blue-900 uppercase tracking-wider">Cấu trúc file Excel yêu cầu:</p>
              <p className="text-blue-800 font-medium">Các cột trong file cần đặt tên chính xác: <code className="bg-white px-2 py-0.5 rounded border border-blue-200 font-black">Họ và tên</code> | <code className="bg-white px-2 py-0.5 rounded border border-blue-200 font-black">Giới tính</code> | <code className="bg-white px-2 py-0.5 rounded border border-blue-200 font-black">Số điện thoại</code> | <code className="bg-white px-2 py-0.5 rounded border border-blue-200 font-black">Email</code></p>
              <button 
                type="button" 
                onClick={downloadTemplate}
                className="text-blue-600 font-black underline hover:text-blue-800 flex items-center gap-2 pt-1"
              >
                <FileSpreadsheet size={15} /> Tải file Excel mẫu chuẩn tại đây
              </button>
            </div>

            <div className="border-2 border-dashed border-slate-200 p-8 rounded-2xl text-center hover:bg-slate-50 transition-colors cursor-pointer bg-slate-50/50">
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                id="excelInput" 
                className="hidden" 
                onChange={handleFileUpload}
              />
              <label htmlFor="excelInput" className="cursor-pointer flex flex-col items-center">
                <Database size={40} className="text-blue-500 mb-2" />
                <span className="font-black text-slate-700 text-sm">Click để tải lên file Excel</span>
                <span className="text-xs text-slate-400 font-medium mt-1">Hỗ trợ định dạng .xlsx, .xls</span>
              </label>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setShowAddStudent(false)} className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs sm:text-sm w-full">Đóng Hộp Thoại</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ==========================================
 * MODULE: QUẢN LÝ HỌC LIỆU & ĐỀ THI (DataManagement.jsx)
 * ==========================================
 */
function DataManagement({ db, setDb, showToast }) {
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [showAddChapter, setShowAddChapter] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [assigningQuizId, setAssigningQuizId] = useState(null);

  const [newChapterName, setNewChapterName] = useState('');
  const [newLessonName, setNewLessonName] = useState('');
  
  const [matForm, setMatForm] = useState({ name: '', type: 'theory', link: '' });
  const [quizConfig, setQuizConfig] = useState({ type: 'multi', time: 45, attempts: 1, answerLink: '' });
  const [editingQuizId, setEditingQuizId] = useState(null);

  const handleAddChapter = (e) => {
    e.preventDefault();
    if (!selectedGrade || !newChapterName.trim()) return;

    const newChap = { id: `ch${Date.now()}`, gradeId: selectedGrade, name: newChapterName.trim() };
    setDb({ ...db, chapters: [...db.chapters, newChap] });
    setShowAddChapter(false);
    setNewChapterName('');
    showToast('Thêm chương học thành công!');
  };

  const handleEditChapter = (chap) => {
    const newName = prompt('Nhập tên chương mới:', chap.name);
    if (newName && newName.trim()) {
      const updatedChapters = db.chapters.map(c => c.id === chap.id ? { ...c, name: newName.trim() } : c);
      setDb({ ...db, chapters: updatedChapters });
      showToast('Đã cập nhật tên chương!');
    }
  };

  const handleDeleteChapter = (chapId) => {
    if (window.confirm('Xóa chương này sẽ đồng thời xóa toàn bộ các bài học bên trong. Thầy có chắc chắn muốn xóa?')) {
      const updatedChapters = db.chapters.filter(c => c.id !== chapId);
      const updatedLessons = db.lessons.filter(l => l.chapterId !== chapId);
      setDb({ ...db, chapters: updatedChapters, lessons: updatedLessons });
      showToast('Đã xóa chương học!');
    }
  };

  const handleAddLesson = (e) => {
    e.preventDefault();
    if (!selectedChapter || !newLessonName.trim()) return;

    const newLes = { id: `l${Date.now()}`, chapterId: selectedChapter, name: newLessonName.trim() };
    setDb({ ...db, lessons: [...db.lessons, newLes] });
    setShowAddLesson(false);
    setNewLessonName('');
    showToast('Thêm bài học thành công!');
  };

  const handleEditLesson = (les) => {
    const newName = prompt('Nhập tên bài học mới:', les.name);
    if (newName && newName.trim()) {
      const updatedLessons = db.lessons.map(l => l.id === les.id ? { ...l, name: newName.trim() } : l);
      setDb({ ...db, lessons: updatedLessons });
      showToast('Đã cập nhật tên bài học!');
    }
  };

  const handleDeleteLesson = (lesId) => {
    if (window.confirm('Thầy có chắc chắn muốn xóa bài học này không?')) {
      const updatedLessons = db.lessons.filter(l => l.id !== lesId);
      const updatedMaterials = db.materials.filter(m => m.lessonId !== lesId);
      setDb({ ...db, lessons: updatedLessons, materials: updatedMaterials });
      showToast('Đã xóa bài học!');
    }
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();
    if (!selectedLesson) return showToast('Vui lòng chọn bài học ở cột trái trước!', 'error');
    if (!matForm.name.trim()) return showToast('Vui lòng nhập tên học liệu', 'error');

    const newMatId = `m${Date.now()}`;
    const newMat = {
      id: newMatId,
      lessonId: selectedLesson,
      ...matForm,
      quizConfig: matForm.type === 'quiz' ? quizConfig : null,
      questions: [],
      assignedClassIds: []
    };

    setDb({ ...db, materials: [...db.materials, newMat] });
    setShowAddMaterial(false);
    setMatForm({ name: '', type: 'theory', link: '' });
    showToast('Gắn học liệu thành công!');

    if (matForm.type === 'quiz') {
      setEditingQuizId(newMatId);
    }
  };

  const handleSaveAssignment = (quizId, selectedClassIds) => {
    const updatedMaterials = db.materials.map(m => {
      if (m.id === quizId) {
        return { ...m, assignedClassIds: selectedClassIds };
      }
      return m;
    });
    setDb({ ...db, materials: updatedMaterials });
    if (showToast) showToast('Đã cập nhật phân quyền giao bài cho lớp thành công!');
  };

  if (editingQuizId) {
    return <QuizEditor db={db} setDb={setDb} quizId={editingQuizId} onClose={() => setEditingQuizId(null)} showToast={showToast} />;
  }

  return (
    <div className="h-full flex flex-col md:flex-row bg-slate-100">
      <div className="w-full md:w-1/3 border-r border-slate-200 bg-white flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 grid grid-cols-2 gap-3">
          <button 
            onClick={() => selectedGrade ? setShowAddChapter(true) : showToast('Vui lòng chọn Khối trước!', 'error')} 
            className="py-3 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-black flex justify-center items-center gap-2 shadow-2xs text-slate-700"
          >
            <Plus size={15}/> Thêm Chương
          </button>
          <button 
            onClick={() => selectedChapter ? setShowAddLesson(true) : showToast('Vui lòng chọn Chương trước!', 'error')} 
            className="py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl text-xs font-black flex justify-center items-center gap-2 shadow-md shadow-blue-600/20"
          >
            <Plus size={15}/> Thêm Bài
          </button>
        </div>

        <div className="p-4 space-y-4">
          {db.grades?.map(grade => (
            <div key={grade.id} className="space-y-1.5">
              <div 
                className={`font-black p-3.5 rounded-2xl cursor-pointer text-xs sm:text-sm transition-all ${
                  selectedGrade === grade.id ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`} 
                onClick={() => { setSelectedGrade(grade.id); setSelectedChapter(null); setSelectedLesson(null); }}
              >
                {grade.name}
              </div>

              {selectedGrade === grade.id && (
                <div className="ml-3 pl-3 border-l-2 border-blue-100 space-y-2.5 pt-2">
                  {db.chapters?.filter(c => c.gradeId === grade.id).map(chap => (
                    <div key={chap.id} className="space-y-1.5">
                      <div 
                        className={`p-3 rounded-xl text-xs font-black cursor-pointer flex justify-between items-center transition-all ${
                          selectedChapter === chap.id ? 'bg-blue-50 text-blue-900 border border-blue-200 shadow-2xs' : 'text-slate-700 hover:bg-slate-50 bg-slate-50/50'
                        }`} 
                        onClick={() => { setSelectedChapter(chap.id); setSelectedLesson(null); }}
                      >
                        <span className="truncate pr-2">{chap.name}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <Edit size={14} className="text-slate-400 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); handleEditChapter(chap); }} title="Sửa tên chương" />
                          <Trash2 size={14} className="text-slate-400 hover:text-rose-600" onClick={(e) => { e.stopPropagation(); handleDeleteChapter(chap.id); }} title="Xóa chương" />
                        </div>
                      </div>

                      {selectedChapter === chap.id && (
                        <div className="ml-3 pl-3 border-l-2 border-slate-200 space-y-1 pt-1">
                          {db.lessons?.filter(l => l.chapterId === chap.id).map(les => (
                            <div 
                              key={les.id} 
                              className={`p-2.5 rounded-xl text-xs cursor-pointer flex justify-between items-center transition-all font-semibold ${
                                selectedLesson === les.id ? 'bg-indigo-50 text-indigo-900 font-bold border border-indigo-200 shadow-2xs' : 'text-slate-600 hover:bg-slate-50'
                              }`} 
                              onClick={() => setSelectedLesson(les.id)}
                            >
                              <span className="truncate pr-2">• {les.name}</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Edit size={13} className="text-slate-400 hover:text-blue-600" onClick={(e) => { e.stopPropagation(); handleEditLesson(les); }} title="Sửa tên bài" />
                                <Trash2 size={13} className="text-slate-400 hover:text-rose-600" onClick={(e) => { e.stopPropagation(); handleDeleteLesson(les.id); }} title="Xóa bài học" />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full md:w-2/3 bg-slate-100 p-4 sm:p-8 overflow-y-auto">
        {!selectedLesson ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-sm">
            <BookOpen size={48} className="text-slate-300 mb-3"/>
            <p className="font-black text-slate-700 text-base mb-1">Chưa Chọn Bài Học</p>
            <p className="text-xs text-slate-400 font-medium">Hãy chọn một bài học ở cột bên trái để quản lý học liệu và đề kiểm tra.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm gap-4">
              <div>
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest block mb-1">Bài Học Đang Chọn</span>
                <h2 className="text-lg font-black text-slate-900">{db.lessons?.find(l => l.id === selectedLesson)?.name}</h2>
              </div>
              <button 
                onClick={() => setShowAddMaterial(true)} 
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-black shadow-md shadow-slate-900/20 transition-transform active:scale-95 shrink-0"
              >
                <Plus size={16}/> Gắn Học Liệu / Đề Thi
              </button>
            </div>

            <div className="space-y-4">
              {['theory', 'video', 'quiz'].map(type => {
                const mats = db.materials?.filter(m => m.lessonId === selectedLesson && m.type === type) || [];
                if (mats.length === 0) return null;
                
                const typeName = type === 'theory' ? 'Tài liệu Lý thuyết' : type === 'video' ? 'Video Thí nghiệm - Hiện tượng' : 'Đề ôn tập - Kiểm tra trắc nghiệm';
                
                return (
                  <div key={type} className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 space-y-4">
                    <h3 className="font-black text-xs sm:text-sm text-blue-900 border-b border-slate-100 pb-3 uppercase tracking-wider flex items-center gap-2">
                      {type === 'theory' && <FileText size={18} className="text-blue-600"/>}
                      {type === 'video' && <Video size={18} className="text-indigo-600"/>}
                      {type === 'quiz' && <FileQuestion size={18} className="text-emerald-600"/>}
                      {typeName}
                    </h3>
                    <div className="space-y-3">
                      {mats.map(m => (
                        <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80 gap-3">
                          <div>
                            <span className="font-black text-slate-900 text-sm">{m.name}</span>
                            {m.type === 'quiz' && m.quizConfig && (
                              <div className="text-xs text-slate-500 mt-1 font-bold flex flex-wrap items-center gap-3">
                                <span>⏱️ {m.quizConfig.time} phút</span>
                                <span>🔄 Tối đa {m.quizConfig.attempts} lần</span>
                                <span className="text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                                  {m.assignedClassIds?.length > 0 ? `Đã giao ${m.assignedClassIds.length} lớp` : 'Giao tất cả các lớp'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {m.type === 'quiz' && (
                              <>
                                <button 
                                  onClick={() => setAssigningQuizId(m.id)} 
                                  className="text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-xl text-xs font-black transition-colors"
                                >
                                  Giao Lớp
                                </button>
                                <button 
                                  onClick={() => setEditingQuizId(m.id)} 
                                  className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-black transition-colors"
                                >
                                  Soạn Câu Hỏi
                                </button>
                              </>
                            )}
                            <button 
                              onClick={() => {
                                if (window.confirm('Xóa học liệu này?')) {
                                  setDb({ ...db, materials: db.materials.filter(x => x.id !== m.id) });
                                  showToast('Đã xóa học liệu');
                                }
                              }} 
                              className="text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-4 py-2 rounded-xl text-xs font-black transition-colors"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showAddChapter && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl space-y-5 border border-slate-100">
            <h3 className="font-black text-xl text-slate-800">Thêm Chương Mới</h3>
            <form onSubmit={handleAddChapter} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Tên Chương</label>
                <input 
                  required 
                  type="text" 
                  placeholder="VD: Chương 1. Dao động cơ" 
                  className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" 
                  value={newChapterName} 
                  onChange={e => setNewChapterName(e.target.value)} 
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowAddChapter(false)} className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs sm:text-sm w-full">Hủy</button>
                <button type="submit" className="px-4 py-3 bg-blue-600 text-white font-black rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/20 w-full">Lưu Lại</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddLesson && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl space-y-5 border border-slate-100">
            <h3 className="font-black text-xl text-slate-800">Thêm Bài Học Mới</h3>
            <form onSubmit={handleAddLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Tên Bài Học</label>
                <input 
                  required 
                  type="text" 
                  placeholder="VD: Bài 1. Dao động điều hòa" 
                  className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" 
                  value={newLessonName} 
                  onChange={e => setNewLessonName(e.target.value)} 
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowAddLesson(false)} className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs sm:text-sm w-full">Hủy</button>
                <button type="submit" className="px-4 py-3 bg-blue-600 text-white font-black rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/20 w-full">Lưu Lại</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddMaterial && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl space-y-5 border border-slate-100">
            <h3 className="font-black text-xl text-slate-800">Gắn Học Liệu / Tạo Đề Thi</h3>
            <form onSubmit={handleAddMaterial} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Loại Học Liệu</label>
                  <select 
                    className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500" 
                    value={matForm.type} 
                    onChange={e => setMatForm({ ...matForm, type: e.target.value })}
                  >
                    <option value="theory">Tài liệu Lý thuyết</option>
                    <option value="video">Video Thí nghiệm</option>
                    <option value="quiz">Đề kiểm tra trắc nghiệm</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Tên Học Liệu</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="VD: Đề kiểm tra 15 phút" 
                    className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" 
                    value={matForm.name} 
                    onChange={e => setMatForm({ ...matForm, name: e.target.value })} 
                  />
                </div>
              </div>

              {matForm.type !== 'quiz' && (
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase mb-2">Đường Dẫn URL (Link Drive / Youtube)</label>
                  <input 
                    required 
                    type="url" 
                    placeholder="https://..." 
                    className="w-full p-3.5 border border-slate-200 rounded-xl bg-slate-50 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 shadow-inner" 
                    value={matForm.link} 
                    onChange={e => setMatForm({ ...matForm, link: e.target.value })} 
                  />
                </div>
              )}

              {matForm.type === 'quiz' && (
                <div className="border border-slate-200/80 pt-4 bg-slate-50/60 p-5 rounded-2xl space-y-4">
                  <h4 className="font-black text-xs text-slate-700 uppercase tracking-wider">Cấu Hình Đề Thi Trắc Nghiệm</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1 font-bold">Thời gian (phút)</label>
                      <input 
                        type="number" 
                        min="1" 
                        className="w-full p-3 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold bg-white shadow-inner" 
                        value={quizConfig.time} 
                        onChange={e => setQuizConfig({ ...quizConfig, time: parseInt(e.target.value) || 1 })} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1 font-bold">Số lần làm tối đa</label>
                      <input 
                        type="number" 
                        min="1" 
                        className="w-full p-3 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold bg-white shadow-inner" 
                        value={quizConfig.attempts} 
                        onChange={e => setQuizConfig({ ...quizConfig, attempts: parseInt(e.target.value) || 1 })} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1 font-bold">Link giải chi tiết / Đáp án (Tùy chọn)</label>
                    <input 
                      type="url" 
                      placeholder="https://drive.google.com/..." 
                      className="w-full p-3 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold bg-white shadow-inner" 
                      value={quizConfig.answerLink} 
                      onChange={e => setQuizConfig({ ...quizConfig, answerLink: e.target.value })} 
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setShowAddMaterial(false)} className="px-4 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs sm:text-sm w-full">Hủy</button>
                <button type="submit" className="px-4 py-3 bg-blue-600 text-white font-black rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/20 w-full">Lưu Lại</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {assigningQuizId && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl space-y-5 border border-slate-100">
            <h3 className="font-black text-xl text-slate-800">Phân Công Giao Bài Cho Các Lớp</h3>
            <p className="text-xs text-slate-500 font-medium">Chọn những lớp được phép làm bài kiểm tra này (Nếu bỏ chọn tất cả, bài sẽ hiển thị cho mọi lớp):</p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto border border-slate-200 p-4 rounded-2xl bg-slate-50/50 shadow-inner">
              {db.classes?.map(c => {
                const currentQuiz = db.materials.find(m => m.id === assigningQuizId);
                const isChecked = currentQuiz?.assignedClassIds?.includes(c.id) || false;

                return (
                  <label key={c.id} className="flex items-center gap-3.5 p-3.5 bg-white rounded-xl border border-slate-200/80 cursor-pointer hover:bg-blue-50/50 transition-all shadow-2xs">
                    <input 
                      type="checkbox" 
                      defaultChecked={isChecked}
                      onChange={(e) => {
                        const currentList = currentQuiz?.assignedClassIds || [];
                        let newList = [];
                        if (e.target.checked) {
                          newList = [...currentList, c.id];
                        } else {
                          newList = currentList.filter(id => id !== c.id);
                        }
                        handleSaveAssignment(assigningQuizId, newList);
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="font-black text-sm text-slate-800">{c.name}</span>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setAssigningQuizId(null)} 
                className="px-6 py-3.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-xs sm:text-sm w-full hover:bg-slate-200 transition-colors"
              >
                Đóng Hộp Thoại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ==========================================
 * MODULE: THỐNG KÊ KẾT QUẢ & ĐIỂM SỐ (ResultManagement.jsx)
 * ==========================================
 */
function ResultManagement({ db, showToast }) {
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState('');

  const studentsInClass = db.studentsList?.filter(s => s.classId === selectedClassId) || [];

  const exportToExcel = () => {
    if (!selectedClassId) {
      showToast('Vui lòng chọn lớp cần xuất file Excel!', 'error');
      return;
    }

    const className = db.classes?.find(c => c.id === selectedClassId)?.name || 'Lop';
    
    const excelData = studentsInClass.map((student, idx) => {
      const attempts = db.quizAttempts?.filter(a => {
        const matchStudent = a.studentId === student.id;
        const matchQuiz = selectedQuizId ? a.quizId === selectedQuizId : true;
        return matchStudent && matchQuiz;
      }) || [];

      const scoreHistory = attempts.map((att, i) => `Lần ${i+1}: ${att.score}đ (${att.duration || 'N/A'})`).join(' | ');
      const maxScore = attempts.length > 0 ? Math.max(...attempts.map(a => parseFloat(a.score || 0))) : 0;

      return {
        "STT": idx + 1,
        "Họ và tên": student.name,
        "Số điện thoại": student.phone,
        "Số lần làm bài": attempts.length,
        "Điểm cao nhất": attempts.length > 0 ? maxScore : 'Chưa làm',
        "Chi tiết lịch sử": scoreHistory || 'Chưa làm bài'
      };
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BangDiem");
    XLSX.writeFile(wb, `BangDiem_${className}.xlsx`);
    
    if (showToast) showToast('Đã xuất file Excel bảng điểm thành công!');
  };

  return (
    <div className="h-full flex flex-col bg-slate-100 font-sans p-4 sm:p-8 overflow-y-auto">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
            <BarChart2 className="text-blue-600" size={24}/> Thống Kê Kết Quả Học Tập
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-1">Theo dõi lịch sử làm bài, điểm số và xuất báo cáo điểm của lớp.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400 shrink-0"/>
            <select 
              value={selectedClassId}
              onChange={(e) => { setSelectedClassId(e.target.value); setSelectedQuizId(''); }}
              className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
            >
              <option value="">-- Chọn lớp học --</option>
              {db.classes?.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <select 
            disabled={!selectedClassId}
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-40 shadow-2xs"
          >
            <option value="">-- Tất cả các bài kiểm tra --</option>
            {db.materials?.filter(m => m.type === 'quiz').map(q => (
              <option key={q.id} value={q.id}>{q.name}</option>
            ))}
          </select>

          <button 
            onClick={exportToExcel}
            disabled={!selectedClassId}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3.5 rounded-xl font-black text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-40"
          >
            <FileSpreadsheet size={16}/> Xuất Excel
          </button>
        </div>
      </div>

      {!selectedClassId ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-16 text-center my-auto shadow-sm">
          <Users size={56} className="mx-auto text-slate-300 mb-3"/>
          <p className="text-slate-700 font-black text-base mb-1">Chưa Chọn Lớp Học Thống Kê</p>
          <p className="text-xs text-slate-400 font-medium">Hãy chọn một lớp ở khung phía trên để hiển thị bảng điểm chi tiết.</p>
        </div>
      ) : studentsInClass.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-400 font-medium italic shadow-sm">
          Lớp này chưa có danh sách học sinh.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-200 bg-slate-50/50 font-black text-slate-800 text-sm flex justify-between items-center">
            <span>Danh sách kết quả lớp: {db.classes?.find(c => c.id === selectedClassId)?.name}</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-3.5 py-1.5 rounded-xl border border-blue-200">
              Sĩ số: {studentsInClass.length} học sinh
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-400 uppercase font-black text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4 text-center">STT</th>
                  <th className="p-4">Họ và tên học sinh</th>
                  <th className="p-4">Số điện thoại</th>
                  <th className="p-4">Lịch sử làm bài {selectedQuizId ? '(Đã lọc bài)' : '(Tất cả bài)'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {studentsInClass.map((student, idx) => {
                  const attempts = db.quizAttempts?.filter(a => {
                    const matchStudent = a.studentId === student.id;
                    const matchQuiz = selectedQuizId ? a.quizId === selectedQuizId : true;
                    return matchStudent && matchQuiz;
                  }) || [];

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-center text-slate-400 font-black">{idx + 1}</td>
                      <td className="p-4 font-black text-slate-900">{student.name}</td>
                      <td className="p-4 text-slate-600">{student.phone}</td>
                      <td className="p-4">
                        {attempts.length === 0 ? (
                          <span className="text-xs text-slate-400 font-medium italic bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">Chưa làm bài</span>
                        ) : (
                          <div className="space-y-2 py-1">
                            {attempts.map((att, aIdx) => {
                              const quizMat = db.materials?.find(m => m.id === att.quizId);
                              return (
                                <div key={aIdx} className="flex flex-wrap items-center gap-2.5 bg-blue-50/70 border border-blue-200/80 px-4 py-2 rounded-2xl text-xs shadow-2xs">
                                  <span className="font-black text-blue-900">Lần {aIdx + 1}:</span>
                                  {quizMat && <span className="text-slate-600 font-bold truncate max-w-[200px]">[{quizMat.name}]</span>}
                                  
                                  <span className="bg-emerald-600 text-white font-black px-2.5 py-1 rounded-xl shadow-2xs flex items-center gap-1">
                                    <Award size={13}/> {att.score} đ
                                  </span>
                                  
                                  <span className="text-slate-500 flex items-center gap-1 font-bold">
                                    <Clock size={13} className="text-blue-500"/> {att.duration || 'N/A'}
                                  </span>

                                  <span className="text-slate-400 flex items-center gap-1 font-medium">
                                    <Calendar size={13} className="text-indigo-500"/> {att.timestamp || 'Mới đây'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * ==========================================
 * MAIN COMPONENT & STATE MANAGEMENT (App.jsx)
 * ==========================================
 */
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('classes');
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const defaultDbData = {
    grades: [
      { id: 'g10', name: 'Khối 10' },
      { id: 'g11', name: 'Khối 11' },
      { id: 'g12', name: 'Khối 12' },
    ],
    classes: [
      { id: 'c1', gradeId: 'g12', name: '12A1' },
      { id: 'c2', gradeId: 'g12', name: '12A2' },
      { id: 'c3', gradeId: 'g11', name: '11A1' },
    ],
    studentsList: [
      { id: 's1', classId: 'c1', name: 'Nguyễn Văn An', gender: 'Nam', phone: '0901234567', email: 'an@gmail.com', done: 2 },
      { id: 's2', classId: 'c1', name: 'Trần Thị Bình', gender: 'Nữ', phone: '0907654321', email: 'binh@gmail.com', done: 1 },
    ],
    chapters: [
      { id: 'ch12_1', gradeId: 'g12', name: 'Chương I. Vật lí nhiệt' },
      { id: 'ch12_2', gradeId: 'g12', name: 'Chương II. Khí lí tưởng' },
    ],
    lessons: [
      { id: 'l12_1', chapterId: 'ch12_1', name: 'Bài 1. Cấu trúc của chất. Sự chuyển thể' },
      { id: 'l12_2', chapterId: 'ch12_1', name: 'Bài 2. Nội năng. Định luật I của nhiệt động lực học' },
    ],
    materials: [
      {
        id: 'm1',
        lessonId: 'l12_1',
        type: 'theory',
        name: 'Tài liệu SGK Vật lí 12 - Bài 1',
        link: 'https://vietjack.com'
      },
      {
        id: 'm2',
        lessonId: 'l12_1',
        type: 'quiz',
        name: 'Đề kiểm tra 15 phút - Bài 1',
        quizConfig: { time: 15, attempts: 2, answerLink: 'https://youtube.com', sectionScores: { multiScore: 4, tfScore: 3, numScore: 3 } },
        assignedClassIds: [],
        questions: [
          {
            id: 'q1',
            type: 'multi',
            content: 'Công thức tính độ dịch chuyển trong dao động điều hòa là $x = A \\cos(\\omega t + \\varphi)$. Biên độ $A$ có đơn vị là:',
            options: ['mét (m)', 'giây (s)', 'hertz (Hz)', 'radian (rad)'],
            answerMCQ: 'A'
          }
        ]
      }
    ],
    quizAttempts: []
  };

  const [db, setDb] = useState(defaultDbData);

  useEffect(() => {
    const docRef = doc(firestoreDb, 'appData', 'mainDB');

    const unsubscribe = onSnapshot(docRef, async (docSnap) => {
      if (docSnap.exists()) {
        setDb(docSnap.data());
      } else {
        await setDoc(docRef, defaultDbData);
        setDb(defaultDbData);
      }
    }, (error) => {
      console.error("Lỗi đọc dữ liệu từ Firebase: ", error);
    });

    return () => unsubscribe();
  }, []);

  const updateDatabase = async (newDbOrUpdater) => {
    let updatedData;
    if (typeof newDbOrUpdater === 'function') {
      updatedData = newDbOrUpdater(db);
    } else {
      updatedData = newDbOrUpdater;
    }

    setDb(updatedData);
    
    try {
      const docRef = doc(firestoreDb, 'appData', 'mainDB');
      await setDoc(docRef, updatedData);
    } catch (error) {
      console.error("Lỗi lưu dữ liệu lên Firebase: ", error);
      showToast("Lỗi đồng bộ dữ liệu lên máy chủ!");
    }
  };

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
  };

  const handleConfirmLink = ({ studentId, classId }) => {
    setCurrentUser({
      ...currentUser,
      linkedStudentId: studentId,
      classId: classId
    });
    showToast('Xác thực tài khoản thành công!');
  };

  const handleSaveResult = (result) => {
    const newAttempt = {
      studentId: currentUser.linkedStudentId,
      ...result,
      timestamp: new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString()
    };

    updateDatabase(prev => ({
      ...prev,
      quizAttempts: [...(prev.quizAttempts || []), newAttempt]
    }));
  };

  if (!currentUser) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  if (currentUser.role === 'student' && !currentUser.linkedStudentId) {
    return (
      <StudentLinkProfile 
        currentUser={currentUser} 
        db={db} 
        onConfirmLink={handleConfirmLink} 
        onLogout={() => setCurrentUser(null)} 
      />
    );
  }

  if (activeQuiz) {
    return (
      <QuizPlayer 
        quiz={activeQuiz} 
        currentUser={currentUser} 
        onFinish={() => setActiveQuiz(null)} 
        onSaveResult={handleSaveResult} 
      />
    );
  }

  if (currentUser.role === 'student') {
    return (
      <StudentDashboard 
        currentUser={currentUser} 
        db={db} 
        onLogout={() => setCurrentUser(null)} 
        onStartQuiz={(quizMat) => setActiveQuiz(quizMat)} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <header className="bg-slate-900 text-white px-6 py-4 shadow-md flex justify-between items-center z-30 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wider">Hệ Thống Quản Trị - Thầy Lê Công Huynh</h1>
            <p className="text-xs text-slate-400 font-medium">Quản lý lớp học, học liệu và thống kê điểm số trực tuyến</p>
          </div>
        </div>
        <button 
          onClick={() => setCurrentUser(null)} 
          className="bg-slate-800 hover:bg-red-600 px-4 py-2.5 rounded-xl flex items-center gap-2 text-xs font-bold transition-all border border-slate-700 shadow-xs"
        >
          <LogOut size={16}/> Đăng Xuất
        </button>
      </header>

      <div className="flex border-b border-slate-200 bg-white shadow-2xs">
        <button 
          onClick={() => setActiveTab('classes')}
          className={`flex-1 py-4 px-6 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 border-b-2 transition-all ${activeTab === 'classes' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
        >
          <Users size={18}/> Quản Lý Lớp & Học Sinh
        </button>
        <button 
          onClick={() => setActiveTab('data')}
          className={`flex-1 py-4 px-6 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 border-b-2 transition-all ${activeTab === 'data' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
        >
          <Database size={18}/> Quản Lý Học Liệu & Đề Thi
        </button>
        <button 
          onClick={() => setActiveTab('results')}
          className={`flex-1 py-4 px-6 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 border-b-2 transition-all ${activeTab === 'results' ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
        >
          <BarChart2 size={18}/> Thống Kê Kết Quả & Điểm
        </button>
      </div>

      <main className="flex-1 overflow-hidden relative">
        {activeTab === 'classes' && <ClassManagement db={db} setDb={updateDatabase} showToast={showToast} />}
        {activeTab === 'data' && <DataManagement db={db} setDb={updateDatabase} showToast={showToast} />}
        {activeTab === 'results' && <ResultManagement db={db} showToast={showToast} />}
      </main>

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border border-slate-700">
          <CheckCircle size={20} className="text-emerald-400 shrink-0" />
          <span className="font-bold text-xs sm:text-sm">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
